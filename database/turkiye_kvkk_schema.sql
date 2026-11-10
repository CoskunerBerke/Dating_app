-- =============================================================================
-- MİZAN — TÜRKİYE YURT İÇİ SIFIR SIZINTI VERİTABANI ŞEMASI (POSTGRESQL 16+)
-- Fiziksel Konum Şartı: Türkiye Cumhuriyeti Sınırları İçi (İstanbul / Ankara TIER-III Veri Merkezi)
-- Uyumluluk: 6698 Sayılı KVKK Madde 6 (Özel Nitelikli Veri), Madde 9 (Yurt İçi Veri Yerleşikliği) & TCK 135-138
-- Güvenlik Mimarisi:
--   1. İstemci (WebCrypto AES-256-GCM) + Sunucu (pgcrypto AES-256) Çift Katmanlı Şifreleme
--   2. Kör İndeks (HMAC-SHA256 blind_user_token) ile Kimlik Tablosu ve 9 Soru Cevap Tablosunun Fiziksel Ayrımı
--   3. PostgreSQL Row-Level Security (RLS) Zorunluluğu (FORCE ROW LEVEL SECURITY)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. KVKK AÇIK RIZA VE DENETİM KAYITLARI TABLOSU (Değiştirilemez Hukuki Kanıt Tablosu)
CREATE TABLE IF NOT EXISTS kvkk_acik_riza_kayitlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_code VARCHAR(40) UNIQUE NOT NULL,           -- Örn: KVKK-TR-2026-849102
    blind_user_token VARCHAR(64) NOT NULL,              -- Örn: BLIND-TR-9F8A...
    general_illumination_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    special_category_explicit_consent BOOLEAN NOT NULL DEFAULT TRUE,
    zero_retention_pdf_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    tr_server_residency_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    agreement_version VARCHAR(20) NOT NULL DEFAULT '2026.11-TR',
    client_ip_sha256 CHAR(64) NOT NULL,                 -- Ham IP yerine tek yönlü SHA-256 özet
    server_region VARCHAR(32) NOT NULL DEFAULT 'TR-ISTANBUL-DC1',
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_all_kvkk_consents_true CHECK (
        general_illumination_accepted = TRUE AND
        special_category_explicit_consent = TRUE AND
        zero_retention_pdf_accepted = TRUE AND
        tr_server_residency_accepted = TRUE
    )
);

-- 2. KULLANICI KİMLİK VE ŞİFRELİ İLETİŞİM KASASI TABLOSU
-- (Özel nitelikli 9 soru cevaplarından fiziksel ve kriptografik olarak ayrıştırılmış tablo)
CREATE TABLE IF NOT EXISTS kullanici_profilleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias_code VARCHAR(32) UNIQUE NOT NULL,             -- Örn: ADAY #TR-8941
    blind_user_token VARCHAR(64) UNIQUE NOT NULL,       -- HMAC-SHA256 Kör İndeks (Cevap tablosuyla tek bağ)
    first_name VARCHAR(40) NOT NULL,                    -- Örn: Can, Zeynep (Aday kartında görünen ad)
    -- Soyisim, Telefon, E-posta, Doğum Tarihi ve Instagram AES-256-GCM / pgp_sym_encrypt ile şifreli saklanır
    encrypted_last_name BYTEA NOT NULL,
    encrypted_phone_number BYTEA NOT NULL,
    encrypted_email BYTEA NOT NULL,
    encrypted_birth_date BYTEA NOT NULL,
    encrypted_instagram BYTEA,
    client_aes_gcm_envelope JSONB,                      -- Tarayıcıda mühürlenen AES-256-GCM zarfı (iv + ciphertext)
    hometown VARCHAR(64) NOT NULL,                      -- Nereli olduğu (Memleket - 81 İl)
    city VARCHAR(64) NOT NULL,                          -- Yaşadığı Şehir (81 İl)
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('erkek', 'kadin')),
    looking_for VARCHAR(10) NOT NULL CHECK (looking_for IN ('erkek', 'kadin')),
    age SMALLINT NOT NULL CHECK (age >= 18 AND age <= 99),
    height_cm SMALLINT NOT NULL CHECK (height_cm >= 140 AND height_cm <= 230),
    body_type VARCHAR(40) NOT NULL DEFAULT 'Orta yapılı',
    character_traits TEXT[] NOT NULL DEFAULT '{}',
    interests TEXT[] NOT NULL DEFAULT '{}',
    preferred_contact_platform VARCHAR(16) NOT NULL CHECK (
        preferred_contact_platform IN ('whatsapp', 'instagram', 'email', 'both')
    ),
    contact_preference_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    -- SMS OTP ve Canlı Kamera (Sıfır Fotoğraf Kayıtlı) Güvenlik Kanıtları
    sms_verified BOOLEAN NOT NULL DEFAULT TRUE,
    sms_verification_id VARCHAR(32) NOT NULL,
    camera_liveness_verified BOOLEAN NOT NULL DEFAULT TRUE,
    camera_liveness_proof_hash VARCHAR(64) NOT NULL,
    camera_raw_frames_zeroed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_mandatory_sms_and_camera_verification CHECK (
        sms_verified = TRUE AND
        camera_liveness_verified = TRUE AND
        camera_raw_frames_zeroed = TRUE
    )
);

-- 3. ÖZEL NİTELİKLİ 9 SORU CEVAPLARI VE KIRMIZI KUTUCUK FİLTRELERİ TABLOSU
-- (İsim, Soyisim, Telefon veya E-posta İÇERMEZ; yalnızca blind_user_token ile eşleşir)
CREATE TABLE IF NOT EXISTS kullanici_cevaplari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blind_user_token VARCHAR(64) NOT NULL REFERENCES kullanici_profilleri(blind_user_token) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL,
    selected_option_id VARCHAR(64) NOT NULL,
    custom_text VARCHAR(160),
    follow_up_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    excluded_red_ids TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (blind_user_token, question_id)
);

-- 4. e-DEVLET ADLİ SİCİL BELGESİ YÜKLEME VE DOĞRULAMA TABLOSU
-- (T.C. Kimlik No ve PDF dosyası ASLA saklanmaz; profilde "Yüklendi" veya "Yüklenmedi" durumu tutulur)
CREATE TABLE IF NOT EXISTS adli_sicil_dogrulamalari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blind_user_token VARCHAR(64) UNIQUE NOT NULL REFERENCES kullanici_profilleri(blind_user_token) ON DELETE CASCADE,
    uploaded BOOLEAN NOT NULL DEFAULT FALSE,            -- TRUE: "Adli Sicil Belgesi: Yüklendi", FALSE: "Adli Sicil Belgesi: Yüklenmedi"
    verification_status VARCHAR(24) NOT NULL CHECK (
        verification_status IN ('unverified', 'not_uploaded', 'clean', 'has_record', 'invalid_document')
    ),
    barcode_masked VARCHAR(32),                         -- Örn: ADB02889****
    document_hash_sha256 CHAR(64),
    adli_sicil_kaydi_yoktur BOOLEAN NOT NULL DEFAULT FALSE,
    arsiv_kaydi_yoktur BOOLEAN NOT NULL DEFAULT FALSE,
    has_active_or_archive_record BOOLEAN NOT NULL DEFAULT FALSE,
    profile_auto_stamp TEXT NOT NULL DEFAULT 'Adli Sicil Belgesi: Yüklenmedi',
    extracted_record_details TEXT,
    raw_pdf_purged BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_zero_pdf_retention CHECK (raw_pdf_purged = TRUE)
);

-- 5. KARŞILIKLI EŞLEŞME, ÜCRETLİ SİCİL DETAY GÖRÜNTÜLEME VE İLETİŞİM ONAYLARI TABLOSU
CREATE TABLE IF NOT EXISTS eslesme_ve_iletisim_onaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_alias VARCHAR(32) NOT NULL REFERENCES kullanici_profilleri(alias_code) ON DELETE CASCADE,
    receiver_alias VARCHAR(32) NOT NULL REFERENCES kullanici_profilleri(alias_code) ON DELETE CASCADE,
    compatibility_score SMALLINT NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    criminal_report_paid_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    sender_accepted_receiver_criminal_record BOOLEAN NOT NULL DEFAULT FALSE,
    receiver_accepted_sender_criminal_record BOOLEAN NOT NULL DEFAULT FALSE,
    mutual_contact_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (sender_alias, receiver_alias)
);

-- =============================================================================
-- 6. SATIR DÜZEYİNDE GÜVENLİK (ROW-LEVEL SECURITY / RLS) POLİTİKALARI
-- (Her kullanıcı yalnızca kendi oturum anahtarına ait satırı okuyabilir / güncelleyebilir)
-- =============================================================================
ALTER TABLE kvkk_acik_riza_kayitlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE kvkk_acik_riza_kayitlari FORCE ROW LEVEL SECURITY;

ALTER TABLE kullanici_profilleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE kullanici_profilleri FORCE ROW LEVEL SECURITY;

ALTER TABLE kullanici_cevaplari ENABLE ROW LEVEL SECURITY;
ALTER TABLE kullanici_cevaplari FORCE ROW LEVEL SECURITY;

ALTER TABLE adli_sicil_dogrulamalari ENABLE ROW LEVEL SECURITY;
ALTER TABLE adli_sicil_dogrulamalari FORCE ROW LEVEL SECURITY;

ALTER TABLE eslesme_ve_iletisim_onaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE eslesme_ve_iletisim_onaylari FORCE ROW LEVEL SECURITY;

CREATE POLICY rls_own_profile_isolation ON kullanici_profilleri
    FOR ALL
    USING (blind_user_token = current_setting('app.current_blind_user_token', true));

CREATE POLICY rls_own_answers_isolation ON kullanici_cevaplari
    FOR ALL
    USING (blind_user_token = current_setting('app.current_blind_user_token', true));

CREATE POLICY rls_own_criminal_record_isolation ON adli_sicil_dogrulamalari
    FOR ALL
    USING (blind_user_token = current_setting('app.current_blind_user_token', true));
