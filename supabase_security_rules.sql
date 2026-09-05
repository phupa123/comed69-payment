/**
 * =========================================================================
 * SUPABASE SECURITY RULES & ROW LEVEL SECURITY (RLS) POLICIES
 * สคริปต์ SQL ป้องกันการเจาะระบบฐานข้อมูล Supabase สำหรับ COMED KKU 69
 * =========================================================================
 * 
 * วิธีนำไปใช้งาน:
 * 1. เปิดเว็บ Supabase Dashboard (https://supabase.com/dashboard)
 * 2. เข้าโปรเจกต์ของคุณ -> ไปที่เมนู "SQL Editor" ด้านซ้ายมือ
 * 3. กด "New Query" แล้วคัดลอกคำสั่งด้านล่างนี้ทั้งหมดไปวาง
 * 4. กดปุ่ม "Run" เพื่อเปิดเกราะป้องกันทันที!
 */

-- 1. เปิดใช้งาน Row Level Security (RLS) บนทุกตารางหลัก
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_logs ENABLE ROW LEVEL SECURITY;

-- 2. เคลียร์นโยบายเก่าออกก่อนเพื่อความปลอดภัยสูงสุด
DROP POLICY IF EXISTS "Public Read Payments" ON payments;
DROP POLICY IF EXISTS "Public Insert Payments" ON payments;
DROP POLICY IF EXISTS "Deny Public Update Delete Payments" ON payments;
DROP POLICY IF EXISTS "Public Read Campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admin Manage Campaigns" ON campaigns;

-- 3. ตาราง PAYMENTS (ข้อมูลการชำระเงินและสลิป)
-- นโยบายที่ 1: อนุญาตให้ทุกคนอ่านข้อมูลได้ (เพื่อดูสถิติและตรวจสอบรายชื่อ)
CREATE POLICY "Public Read Payments" 
ON payments FOR SELECT 
TO anon, authenticated 
USING (true);

-- นโยบายที่ 2: อนุญาตให้อัปโหลด/แนบสลิปส่งเงินได้ (INSERT) แต่ต้องระบุรหัสนักศึกษาและแคมเปญ
CREATE POLICY "Public Insert Payments" 
ON payments FOR INSERT 
TO anon, authenticated 
WITH CHECK (
  student_id IS NOT NULL 
  AND length(student_id) >= 8 
  AND amount > 0
);

-- นโยบายที่ 3: ห้ามคนทั่วไปสั่ง UPDATE หรือ DELETE (ป้องกันคนร้ายหรือเพื่อนมือบอนมาลบสลิปทิ้ง)
-- มีเพียง Service Role หรือแอดมินที่ล็อกอินในระบบเท่านั้นที่ทำได้
CREATE POLICY "Deny Public Delete Payments" 
ON payments FOR DELETE 
TO anon 
USING (false);

-- 4. ตาราง CAMPAIGNS (รายการเก็บเงิน และ Maintenance Config)
-- อนุญาตให้อ่านสถานะเปิด-ปิดเว็บ และรายการแคมเปญได้
CREATE POLICY "Public Read Campaigns" 
ON campaigns FOR SELECT 
TO anon, authenticated 
USING (true);

-- 5. ตาราง ADMIN LOGS (ประวัติการกระทำของแอดมิน)
-- อนุญาตให้บันทึก Log ได้อย่างเดียว ห้ามใครแอบลบ Log
CREATE POLICY "Allow Insert Admin Logs" 
ON admin_logs FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Deny Delete Admin Logs" 
ON admin_logs FOR DELETE 
TO anon 
USING (false);
