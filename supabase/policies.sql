-- ============================================================
-- Row Level Security (RLS) qoidalari
-- Bu faylni Supabase Dashboard → SQL Editor da ishga tushiring
-- schema.sql dan KEYIN ishga tushiring
-- ============================================================
-- Maqsad: Har bir o'qituvchi faqat O'Z guruh va o'quvchilarini
--         ko'ra olsin, boshqalarniki ko'ra olmasin.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Har bir jadval uchun RLS ni yoqamiz
-- ------------------------------------------------------------
ALTER TABLE groups          ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_days      ENABLE ROW LEVEL SECURITY;
ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- GROUPS jadvali uchun qoidalar
-- ============================================================

-- O'qituvchi faqat O'Z guruhlarini ko'ra oladi
CREATE POLICY "groups: o'z guruhlarini ko'rish"
  ON groups FOR SELECT
  USING ( teacher_id = auth.uid() );

-- O'qituvchi yangi guruh qo'sha oladi (teacher_id avtomatik o'rnatiladi)
CREATE POLICY "groups: yangi guruh qo'shish"
  ON groups FOR INSERT
  WITH CHECK ( teacher_id = auth.uid() );

-- O'qituvchi faqat O'Z guruhlarini tahrirlay oladi
CREATE POLICY "groups: o'z guruhlarini tahrirlash"
  ON groups FOR UPDATE
  USING ( teacher_id = auth.uid() );

-- O'qituvchi faqat O'Z guruhlarini o'chira oladi
CREATE POLICY "groups: o'z guruhlarini o'chirish"
  ON groups FOR DELETE
  USING ( teacher_id = auth.uid() );


-- ============================================================
-- GROUP_DAYS jadvali uchun qoidalar
-- group_days ota jadvali (groups) orqali tekshiriladi
-- ============================================================

CREATE POLICY "group_days: ko'rish"
  ON group_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_days.group_id
        AND groups.teacher_id = auth.uid()
    )
  );

CREATE POLICY "group_days: qo'shish"
  ON group_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_days.group_id
        AND groups.teacher_id = auth.uid()
    )
  );

CREATE POLICY "group_days: o'chirish"
  ON group_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_days.group_id
        AND groups.teacher_id = auth.uid()
    )
  );


-- ============================================================
-- STUDENTS jadvali uchun qoidalar
-- students ota jadvali (groups) orqali tekshiriladi
-- ============================================================

CREATE POLICY "students: ko'rish"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = students.group_id
        AND groups.teacher_id = auth.uid()
    )
  );

CREATE POLICY "students: qo'shish"
  ON students FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = students.group_id
        AND groups.teacher_id = auth.uid()
    )
  );

CREATE POLICY "students: tahrirlash"
  ON students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = students.group_id
        AND groups.teacher_id = auth.uid()
    )
  );

CREATE POLICY "students: o'chirish"
  ON students FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = students.group_id
        AND groups.teacher_id = auth.uid()
    )
  );


-- ============================================================
-- ATTENDANCE_LOGS jadvali uchun qoidalar
-- (hozircha faqat tayyorlik — keyingi bosqichda ishlatiladi)
-- ============================================================

CREATE POLICY "attendance_logs: ko'rish"
  ON attendance_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      JOIN groups ON groups.id = students.group_id
      WHERE students.id = attendance_logs.student_id
        AND groups.teacher_id = auth.uid()
    )
  );

CREATE POLICY "attendance_logs: qo'shish"
  ON attendance_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      JOIN groups ON groups.id = students.group_id
      WHERE students.id = attendance_logs.student_id
        AND groups.teacher_id = auth.uid()
    )
  );

CREATE POLICY "attendance_logs: o'chirish"
  ON attendance_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM students
      JOIN groups ON groups.id = students.group_id
      WHERE students.id = attendance_logs.student_id
        AND groups.teacher_id = auth.uid()
    )
  );
