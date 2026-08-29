# 🎓 คู่มือสรุปภาพรวมระบบและการส่งมอบงาน (System Handover & Deployment Guide)
### ระบบบันทึกและตรวจสอบการชำระเงินค่าทำป้ายสาขาวิชาเอก | COMED KKU 69
**สาขาวิชาคอมพิวเตอร์ศึกษา คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น**

---

## 🌐 1. ลิงก์ระบบและหน้าเว็บทั้งหมด (Production URL)

| หน้าเว็บ / ระบบ | ไฟล์ในโปรเจกต์ | ลิงก์เข้าใช้งาน (GitHub Pages / Local) | วัตถุประสงค์การใช้งาน |
| :--- | :--- | :--- | :--- |
| **🏠 หน้าหลักประชาสัมพันธ์** | [`index.html`](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/index.html) | [index.html](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/index.html) | แสดงรายละเอียดกิจกรรม, ความคืบหน้าภาพรวม (Progress Stats), รายชื่อ 60 คน, สถานะของฉัน และปุ่มเชื่อมต่อ Google Auth |
| **💳 หน้าชำระเงิน & แนบสลิป** | [`payment.html`](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/payment.html) | [payment.html](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/payment.html) | สแกน QR PromptPay ฿190, แนบรูปสลิป, ตรวจสอบชื่อ/รหัสอัตโนมัติ, ดูข้อมูลฉัน (My Profile) และรายงานปัญหา |
| **🛡️ ระบบจัดการหลังบ้าน (Admin)** | [`payment-admin.html`](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/payment-admin.html) | [payment-admin.html](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/payment-admin.html) | Dashboard แอดมิน, สถิติเงินเข้า, ตรวจสอบสลิป, อนุมัติ/ย้ายถังขยะ/กู้คืน, จัดการปัญหาผู้ใช้ และ Custom Export Excel |
| **☁️ Google Apps Script API** | [`GoogleAppsScript_Code.js`](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/GoogleAppsScript_Code.js) | [Google Apps Script Editor](https://script.google.com) | Backend Cloud บันทึกข้อมูลลง Google Sheets, อัปโหลดสลิปเข้า Google Drive และส่งแจ้งเตือน LINE Bot |
| **👥 ฐานข้อมูลนักศึกษา 60 คน** | [`students_data.js`](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/students_data.js) | [students_data.js](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/students_data.js) | รายชื่อ, ชื่อเล่น, รหัสนักศึกษา และอีเมล KKU Mail ทั้ง 60 คน |

---

## 🚀 2. ฟีเจอร์เด่นของระบบ (Key Capabilities)

### 👤 ฝั่งนักศึกษา (User Experience)
1. **Google KKU Mail Single Sign-On (One-Tap & Capsule):**
   - ล็อกอินด้วยบัญชี `@kkumail.com` ปลอดภัยสูง
   - ระบบจะตรวจจับและดึงชื่อ-นามสกุล, ชื่อเล่น และรหัสนักศึกษามาแสดงที่กล่อง **"สถานะของฉัน"** และกรอกในฟอร์มชำระเงินให้อัตโนมัติ
2. **การชำระเงินที่ง่ายและรวดเร็ว:**
   - มี QR Code PromptPay พร้อมยอดเงิน ฿190.00 พอดี
   - แนบสลิปผ่านมือถือได้ทันที มีพรีวิวและระบบตรวจจับขนาดไฟล์
3. **การตรวจสอบสถานะแบบ Real-time:**
   - ตรวจสอบผ่านแท็บ **"ข้อมูลฉัน"** ได้ตลอดเวลา มีหลักฐานสลิปและรหัสอ้างอิง
4. **iOS & Android Mobile App-Like Experience:**
   - รองรับ Safe Area Inset (`env(safe-area-inset-bottom)`) สำหรับ iPhone
   - แถบนำทางด้านล่าง (Floating Bottom Dock) ใช้งานง่ายด้วยมือเดียว

---

### 🛡️ ฝั่งผู้ดูแลระบบ (Admin & Host Engine)
1. **Dual-Mode Admin Authentication:**
   - 🟢 **Login with Google:** คลิกเลือกบัญชี KKU Mail ของแอดมินที่มีสิทธิ์เพื่อเข้าสู่ Dashboard ได้ทันที
   - 🔑 **กรอกรหัสผ่าน:** มีระบบรหัสผ่านสำรองสำหรับแอดมิน
2. **Real-time LINE Bot Push Notification:**
   - 🔔 **เมื่อมีสลิปใหม่:** ส่งชื่อ, รหัสนักศึกษา, ยอดเงิน, วันเวลา และรูปสลิปเข้า LINE แอดมินทันที
   - ⚠️ **เมื่อมีคนแจ้งปัญหา:** ส่งรหัสปัญหา, ผู้แจ้ง และรายละเอียดเข้า LINE ทันที
3. **Advanced Custom Excel Export (.xlsx):**
   - 🟢 **Highlight Mode:** สลิปจ่ายแล้ว = พื้นหลังเขียว ตัวหนังสือเขียว (`✔ ชำระเงินแล้ว`), ยังไม่จ่าย = พื้นหลังแดง (`✖ ยังไม่ชำระเงิน`)
   - 🔀 **5 รูปแบบการจัดเรียง:** ปกติ (ตามรหัส นศ.), เรียงคนจ่ายไว้บน, เรียงคนจ่ายไว้ล่าง, เอาเฉพาะคนจ่าย, เอาเฉพาะคนยังไม่จ่าย
   - 📄 มี Sheet สรุปภาพรวมทางการเงินแนบให้อัตโนมัติ
4. **ระบบความปลอดภัยและการจัดการสลิป:**
   - ถังขยะ (Trash & Restore) กู้คืนข้อมูลได้ ป้องกันการลบผิดพลาด
   - กล่องบันทึกประวัติการทำงาน (Admin Audit Logs)

---

## 📋 3. ข้อมูลบัญชีผู้ดูแลระบบ (Admin Accounts)

| ชื่อ - นามสกุล | อีเมล KKU Mail | ระดับสิทธิ์ | รหัสผ่านเริ่มต้น |
| :--- | :--- | :--- | :--- |
| **ธิติวุฒิ อารีเอื้อ (ภูผา)** | `thitiwut.a@kkumail.com` | Super Admin | `Phupa#69ComEd` |
| **พิชามญธุ์ สามสี (หมูหวาน)** | `pichamon.sam@kkumail.com` | Admin | `MooWan#69ComEd` |
| **ณัฏฐชัย โพธิ์ทับไทย (โอ้)** | `nattachai.p@kkumail.com` | Admin | `OhNatta#69ComEd` |

---

## 🛠️ 4. คำแนะนำในการอัปเดต Google Apps Script ในอนาคต

หากต้องการนำโค้ดใน [`GoogleAppsScript_Code.js`](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/GoogleAppsScript_Code.js) ไปอัปเดตบน Google Apps Script:
1. เปิด **Google Sheets** ของโครงการ ➔ ไปที่ **ส่วนขยาย (Extensions)** ➔ **Apps Script**
2. คัดลอกโค้ดทั้งหมดใน [`GoogleAppsScript_Code.js`](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/GoogleAppsScript_Code.js) ไปวางแทนที่ไฟล์ `Code.gs`
3. กด **บันทึก (Save)** ➔ กด **ทำให้ใช้งานได้ (Deploy)** ➔ **การทำให้ใช้งานได้ใหม่ (Manage deployments)** ➔ แก้ไขเป็น **เวอร์ชันใหม่ (New version)**
4. เลือกการเข้าถึงเป็น **"ทุกคน (Anyone)"** ➔ กด **ทำให้ใช้งานได้ (Deploy)**

---

🎉 **ระบบเสร็จสมบูรณ์ 100% พร้อมเปิดใช้งานสำหรับนักศึกษาชั้นปีที่ 1 (COMED 69) ทุกคนครับ!**
