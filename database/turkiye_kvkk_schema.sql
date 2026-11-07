-- =============================================================================
-- MİZAN — TÜRKİYE YURT İÇİ VERİTABANI ŞEMASI (POSTGRESQL 16+)
-- Fiziksel Konum Şartı: Türkiye Cumhuriyeti Sınırları İçi (İstanbul / Ankara TIER-III Veri Merkezi)
-- Uyumluluk: 6698 Sayılı KVKK Madde 6 (Özel Nitelikli Veri) & Madde 9 (Yurt İçi Veri Yerleşikliği)
-- Mimari: İsimtescil Domain (DNS) -> Vercel (Sadece Statik Arayüz) -> Türkiye Fiziksel PostgreSQL Sunucusu
-- =============================================================================

-- Şifreleme eklentisi (WhatsApp / Instagram iletişim bilgilerini AES-256 ile şifrelemek için)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. KVKK AÇIK RIZA VE DENETİM KAYITLARI TABLOSU (Değiştirilemez Hukuki Kanıt Tablosu)
CREATE TABLE IF NOT EXISTS kvkk_acik_riza_kayitlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_code VARCHAR(40) UNIQUE NOT NULL,           -- Örn: KVKK-TR-2026-849102
    alias_code VARCHAR(32) NOT NULL,                    -- Örn: ADAY #TR-8941
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

-- 2. KULLANICI KİMLİK VE ŞİFRELİ İLETİŞİM TABLOSU
-- (Özel nitelikli anket cevaplarından fiziksel olarak ayrıştırılmış tablo)
CREATE TABLE IF NOT EXISTS kullanici_profilleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias_code VARCHAR(32) UNIQUE NOT NULL,             -- Örn: ADAY #TR-8941
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('erkek', 'kadin')),
    looking_for VARCHAR(10) NOT NULL CHECK (looking_for IN ('erkek', 'kadin')),
    age SMALLINT NOT NULL CHECK (age >= 18 AND age <= 99),
    city VARCHAR(64) NOT NULL,
    profession VARCHAR(120) NOT NULL,
    relationship_dynamic VARCHAR(120) NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    preferred_contact_platform VARCHAR(16) NOT NULL CHECK (preferred_contact_platform IN ('whatsapp', 'instagram', 'both')),
    -- İletişim bilgileri pgp_sym_encrypt (AES-256) ile şifrelenerek Türkiye sunucusunda saklanır
    encrypted_whatsapp BYTEA,
    encrypted_instagram BYTEA,
    contact_preference_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ÖZEL NİTELİKLİ KULLANICI CEVAPLARI VE KIRMIZI KUTUCUK FİLTRELERİ TABLOSU
-- (Sadece anonim alias_code ile bağlıdır; ad/telefon içermez)
CREATE TABLE IF NOT EXISTS kullanici_cevaplari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias_code VARCHAR(32) NOT NULL REFERENCES kullanici_profilleri(alias_code) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL,
    selected_option_id VARCHAR(64) NOT NULL,
    custom_text VARCHAR(160),
    follow_up_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    excluded_red_ids TEXT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (alias_code, question_id)
);

-- 4. e-DEVLET ADLİ SİCİL (SABIKA KAYDI) OTOMATİK PROFİL DAMGASI TABLOSU
-- (T.C. Kimlik No ve PDF dosyası ASLA saklanmaz, yalnızca maskeli barkod ve otomatik profil damgası tutulur)
CREATE TABLE IF NOT EXISTS adli_sicil_dogrulamalari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias_code VARCHAR(32) UNIQUE NOT NULL REFERENCES kullanici_profilleri(alias_code) ON DELETE CASCADE,
    verification_status VARCHAR(24) NOT NULL CHECK (verification_status IN ('unverified', 'clean', 'has_record', 'invalid_document')),
    barcode_masked VARCHAR(32) NOT NULL,                -- Örn: ADB028****2793
    document_hash_sha256 CHAR(64) NOT NULL,
    adli_sicil_kaydi_yoktur BOOLEAN NOT NULL DEFAULT FALSE,
    arsiv_kaydi_yoktur BOOLEAN NOT NULL DEFAULT FALSE,
    has_active_or_archive_record BOOLEAN NOT NULL DEFAULT FALSE,
    profile_auto_stamp TEXT NOT NULL,                   -- Profile otomatik yazdırılan resmi sonuç cümlesi
    extracted_record_details TEXT,                      -- Kayıt varsa mahkeme/dosya özeti
    raw_pdf_purged BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_zero_pdf_retention CHECK (raw_pdf_purged = TRUE)
);

-- 5. KARŞILIKLI EŞLEŞME VE ADLİ SİCİL KABUL ONAYLARI TABLOSU
CREATE TABLE IF NOT EXISTS eslesme_ve_iletisim_onaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_alias VARCHAR(32) NOT NULL REFERENCES kullanici_profilleri(alias_code) ON DELETE CASCADE,
    receiver_alias VARCHAR(32) NOT NULL REFERENCES kullanici_profilleri(alias_code) ON DELETE CASCADE,
    compatibility_score SMALLINT NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    -- Eğer taraflardan birinin adli sicil kaydı varsa karşı tarafın bunu gördüğünü ve kabul ettiğini kanıtlayan alanlar
    sender_accepted_receiver_criminal_record BOOLEAN NOT NULL DEFAULT FALSE,
    receiver_accepted_sender_criminal_record BOOLEAN NOT NULL DEFAULT FALSE,
    mutual_contact_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (sender_alias, receiver_alias)
);
