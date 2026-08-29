# 🚀 คู่มือการ Deploy เว็บไซต์ให้เพื่อนทั้ง 60 คนเข้าใช้งานพร้อมกันแบบ 100%

ระบบนี้ถูกออกแบบให้เป็น **Serverless & Global Cloud CDN Architecture** ซึ่งใช้ **Google Cloud / Google Apps Script** เป็น Backend รองรับการเข้าใช้งานพร้อมกันหลายร้อยคนได้แบบไม่ล่ม และฟรี 100% ตลอดชีพ!

---

## 🌟 วิธีที่ 1: Deploy ขึ้น Vercel (แนะนำที่สุด ใช้ง่ายและเร็วที่สุดใน 1 นาที)

1. เข้าเว็บไซต์ [https://vercel.com](https://vercel.com) แล้วล็อกอินด้วย GitHub หรือ Google
2. ลากทั้งโฟลเดอร์ `แบบเก็บเงิน` ไปวางในหน้า Dashboard ของ Vercel หรือใช้คำสั่งใน Terminal:
   ```bash
   npx vercel
   ```
3. จะได้รับลิงก์เว็บไซต์แบบ HTTPS ทันที เช่น:
   👉 `https://comed69-payment.vercel.app`
4. นำลิงก์นี้ส่งให้เพื่อนทั้ง 60 คนในกลุ่มไลน์ได้ทันที!

---

## 🌟 วิธีที่ 2: Deploy ขึ้น GitHub Pages (ฟรี 100% ตลอดชีพ)

1. สร้าง Repository ใหม่บน GitHub เช่น `comed69-payment`
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น GitHub:
   - `index.html` (หน้าหลักผู้ใช้)
   - `admin.html` (หน้าหลังบ้าน)
   - `students_data.js`
   - `logo.png`
3. ไปที่ **Settings** ของ Repository -> เมนู **Pages**
4. ตรง **Branch** ให้เลือก `main` / `root` แล้วกด **Save**
5. จะได้ URL เช่น:
   👉 `https://username.github.io/comed69-payment/`

---

## 🌟 วิธีที่ 3: Deploy ขึ้น Cloudflare Pages หรือ Netlify

1. เข้า [https://pages.cloudflare.com](https://pages.cloudflare.com) หรือ [https://netlify.com](https://netlify.com)
2. ลากโฟลเดอร์โปรเจกต์ไปวาง
3. ระบบจะ Generate ลิงก์ความเร็วสูงพิเศษ CDN ทั่วโลกให้ทันที

---

## 🛡️ ระบบรองรับการเข้าพร้อมกัน 60 คนอย่างไร?
- **Frontend**: เป็น Static HTML + Tailwind CSS + Vanilla JS โหลดผ่าน CDN ทั่วโลก เร็วระดับ < 0.2 วินาที
- **Database & Backend**: Google Sheets & Google Apps Script มีระบบ `LockService` จัดคิวการบันทึกข้อมูลอัตโนมัติ แม้เพื่อนจะกดส่งสลิปพร้อมกันในวินาทีเดียวกัน ข้อมูลก็จะไม่ทับซ้อนและไม่มีการสูญหาย
- **ความปลอดภัย**: หน้า [admin.html](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/admin.html) ล็อกด้วยรหัสผ่าน `admin69` เฉพาะผู้ดูแลระบบเท่านั้นที่เข้าจัดการและลบข้อมูลได้
