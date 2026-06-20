-- ============================================================
-- Migration: students jadvaliga face_descriptor ustuni qo'shish
-- Bu faylni Supabase Dashboard → SQL Editor da ishga tushiring
-- schema.sql dan KEYIN ishga tushiring
-- ============================================================

-- face_descriptor: yuzning matematik xaritasi (128 ta float qiymat, JSON sifatida saqlanadi)
-- NULL bo'lsa — yuz hali ro'yxatdan o'tmagan
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS face_descriptor TEXT DEFAULT NULL;

-- Izoh qo'shamiz
COMMENT ON COLUMN students.face_descriptor
  IS 'face-api.js descriptor — 128 ta float qiymatning JSON massivi. NULL = ro''yxatdan o''tmagan.';
