# 🏛️ Architecture & Project Scalability Guide: COMED KKU 69

ยินดีต้อนรับสู่คู่มือโครงสร้างโปรเจกต์สำหรับรองรับการขยายสเกล (Scalability) ในอนาคต

---

## 📁 โครงสร้างโฟลเดอร์ที่เป็นระเบียบ (Directory Structure)

```text
├── 📄 index.html          # หน้าหลักแนะนำสาขาวิชา (Landing Page & Curriculum)
├── 📄 payment.html        # หน้าระบบชำระเงินและแจ้งสลิป (Payment & Slip Verification)
├── 📄 admin.html          # หน้า Dashboard จัดการหลังบ้าน (Host Admin Engine)
├── 📄 logo.png            # โลโก้ทางการของสาขา
├── 📄 qr_payment.png      # ภาพ QR Code พร้อมเพย์สำหรับรับชำระเงิน
│
├── 📁 config/             # การตั้งค่าส่วนกลางของระบบ (Central Config)
│   └── app_config.js      # ค่าตัวแปร, วันหมดเขต, ราคา, และข้อมูลบัญชี
│
├── 📁 assets/             # สถิติและไฟล์ Static ทั้งหมด
│   ├── 📁 css/            # สไตล์ชีต Vanilla CSS / Design Tokens
│   ├── 📁 js/             # สคริปต์แยกโมดูล (Data, API, UI Components)
│   └── 📁 images/         # คลังรูปภาพและไอคอน
│
├── 📁 backend/            # ระบบเซิร์ฟเวอร์สำรอง Local / SQLite Backend
│   ├── server.py          # Python HTTP / SQLite Server API
│   └── payments.db        # ฐานข้อมูล SQLite ในเครื่อง
│
├── 📁 docs/               # เอกสารคู่มือและการติดตั้ง
│   ├── DEPLOY_GUIDE.md    # คู่มือการ Deploy ขึ้น GitHub Pages / Netlify / Vercel
│   └── HOW_TO_CONNECT_GOOGLE_SHEETS.md # คู่มือเชื่อมต่อ Google Drive & Sheets
│
└── 📁 scripts/            # โค้ดสำหรับรันบน Cloud
    └── GoogleAppsScript_Code.js # Engine หลักบน Google Apps Script + LINE Messaging API
```

---

## 🚀 แนวทางการ Scale ในอนาคต (Scalability Roadmap)

1. **เพิ่มหน้าใหม่ได้ทันที:** 
   - สามารถสร้างหน้า เช่น `news.html` (ข่าวกิจกรรม), `projects.html` (ผลงานนักศึกษา), `gallery.html` (รูปกิจกรรม) โดยใช้ Navbar และ Design System เดียวกันได้ทันที
2. **การจัดการข้อมูลส่วนกลาง (Config-driven):** 
   - เมื่อต้องการเปลี่ยนยอดเงิน, วันหมดเขต หรือบัญชีธนาคาร ให้เปลี่ยนที่ `config/app_config.js` จุดเดียว ระบบจะอัปเดตทุกหน้าอัตโนมัติ
3. **รองรับฐานข้อมูลหลายรุ่น (Multi-cohort):** 
   - `students_data.js` ถูกออกแบบให้เพิ่มรุ่นต่อๆ ไปได้ง่าย (เช่น COMED 70, 71)
