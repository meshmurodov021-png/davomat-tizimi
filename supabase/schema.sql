-- ============================================================
-- Davomat tizimi — ma'lumotlar bazasi jadvallari
-- Bu faylni Supabase Dashboard → SQL Editor da ishga tushiring
-- ============================================================


-- ------------------------------------------------------------
-- 1. O'qituvchilar jadvali
--    Tizimga kirish huquqi bo'lgan o'qituvchilar saqlanadi
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teachers (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  ism           TEXT          NOT NULL,
  login         TEXT          NOT NULL UNIQUE,
  parol_hash    TEXT          NOT NULL,
  yaratilgan_sana TIMESTAMPTZ DEFAULT now()
);


-- ------------------------------------------------------------
-- 2. Guruhlar jadvali
--    O'qituvchiga tegishli guruhlar (sinf, sektsiya va h.k.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS groups (
  id                     UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nomi                   TEXT    NOT NULL,
  xona                   TEXT,
  sigim_min              INTEGER,          -- minimal o'quvchilar soni
  sigim_max              INTEGER,          -- maksimal o'quvchilar soni
  dars_vaqti_boshlanish  TIME,             -- masalan: '09:00'
  dars_vaqti_tugash      TIME,             -- masalan: '10:30'
  teacher_id             UUID    NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  yaratilgan_sana        TIMESTAMPTZ DEFAULT now()
);


-- ------------------------------------------------------------
-- 3. Guruh dars kunlari jadvali
--    Har bir guruh qaysi kunlari dars o'tishini belgilaydi
--    Bir guruh uchun bir nechta yozuv bo'lishi mumkin
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS group_days (
  id        UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  UUID  NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Mumkin qiymatlar: dushanba, seshanba, chorshanba, payshanba, juma, shanba, yakshanba
  kun       TEXT  NOT NULL CHECK (
    kun IN ('dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba')
  ),

  UNIQUE (group_id, kun)  -- bir guruhda bir kun ikki marta bo'lmasin
);


-- ------------------------------------------------------------
-- 4. O'quvchilar jadvali
--    Guruhga biriktirilgan o'quvchilar ro'yxati
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  ism             TEXT  NOT NULL,
  telefon_raqami  TEXT,
  group_id        UUID  NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  yaratilgan_sana TIMESTAMPTZ DEFAULT now()
);


-- ------------------------------------------------------------
-- 5. Davomat loglari jadvali
--    Hozircha faqat struktura tayyor — keyingi bosqichlarda ishlatiladi.
--    Har bir o'quvchining har bir darsga kelish holati saqlanadi.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_logs (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID    NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sana        DATE    NOT NULL,             -- dars kuni sanasi
  vaqt        TIME,                         -- skanerdan o'tgan vaqt
  holat       TEXT    DEFAULT 'noma`lum'    -- keldi / kelmadi / kech_keldi / noma`lum
    CHECK (holat IN ('keldi', 'kelmadi', 'kech_keldi', 'noma`lum')),
  tugri_kunmi BOOLEAN DEFAULT true,         -- o'sha kun dars bormi yoki yo'qmi

  UNIQUE (student_id, sana)  -- bir o'quvchi bir kunda bir marta
);


-- ============================================================
-- Indekslar — ma'lumot qidirish tezligini oshiradi
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id    ON groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_group_days_group_id  ON group_days(group_id);
CREATE INDEX IF NOT EXISTS idx_students_group_id    ON students(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student   ON attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sana      ON attendance_logs(sana);
