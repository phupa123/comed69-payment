# คู่มือการเชื่อมต่อระบบเข้ากับ Google Sheets, Google Drive และ Google Forms 🚀

ระบบนี้ถูกออกแบบให้สามารถทำงานเชื่อมต่อกับ Google Cloud Ecosystem ได้ฟรี 100% โดยไม่ต้องเช่าโฮสติ้งราคาแพง และสามารถดึงข้อมูลแบบ 2-Way Sync (จาก Google Forms / Google Sheets / หน้าเว็บ) เพื่อกันเว็บล่มและมีข้อมูลสำรองตลอดเวลา

---

## 🛠️ ขั้นตอนที่ 1: ติดตั้ง Google Apps Script (Backend บนคลาวด์)

1. สร้าง **Google Sheets** ขึ้นมา 1 ไฟล์ (ตั้งชื่อ เช่น `ComEd69_Payment_Database`)
2. สร้าง **โฟลเดอร์ใน Google Drive** 1 โฟลเดอร์สำหรับเก็บภาพสลิปทั้งหมด (เช่น `ComEd69_Slips`)
   - ดับเบิลคลิกเข้าไปในโฟลเดอร์ แล้วสังเกต URL ด้านบน เช่น:
     `https://drive.google.com/drive/folders/1aBcD_EFGhIJkLMNoPQRStUvwxYZ`
   - คัดลอกรหัสท้าย URL มาเก็บไว้ (นั่นคือ `Folder ID`)
3. ใน Google Sheets ให้คลิกเมนูด้านบน: **ส่วนขยาย (Extensions) -> Apps Script**
4. ลบโค้ดเดิมออกทั้งหมด แล้วเปิดไฟล์ [GoogleAppsScript_Code.js](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/GoogleAppsScript_Code.js) นำโค้ดทั้งหมดไปวาง
5. แก้ไขบรรทัดที่:
   ```javascript
   const GOOGLE_DRIVE_FOLDER_ID = "นำ_Folder_ID_ที่ก๊อปปี้มาวางที่นี่";
   ```
6. กด **การทำให้ใช้งานได้ (Deploy)** ที่มุมขวาบน -> **การทำให้ใช้งานได้ใหม่ (New deployment)**
   - เลือกประเภท (Select type): **เว็บแอป (Web app)**
   - คำอธิบาย (Description): `ComEd 69 Payment API`
   - เรียกใช้เป็น (Execute as): **ฉัน (Me / บัญชีอีเมลของคุณ)**
   - ผู้มีสิทธิ์เข้าถึง (Who has access): **ทุกคน (Anyone)** *(สำคัญมาก เพื่อให้เว็บส่งข้อมูลได้)*
7. กด **ทำให้ใช้งานได้ (Deploy)** -> อนุญาตสิทธิ์การเข้าถึง (Authorize access)
8. **คัดลอก "URL ของเว็บแอป (Web App URL)"** ที่ได้

---

## 🔗 ขั้นตอนที่ 2: นำ Web App URL มาใส่ในหน้าเว็บ

เปิดไฟล์ [index.html](file:///Users/chalitamiphasa/ของผาเอง/แบบเก็บเงิน/index.html) ค้นหาตัวแปร:
```javascript
const GOOGLE_SCRIPT_WEBAPP_URL = "นำ URL ของเว็บแอปที่ได้จากขั้นตอนที่ 1 มาใส่ตรงนี้";
```
เพียงเท่านี้ เวลาที่เพื่อนแนบสลิปผ่านหน้าเว็บ:
1. ภาพสลิปจะถูกส่งไปเก็บใน **Google Drive** โดยอัตโนมัติ
2. ข้อมูลชื่อ, รหัส, เวลา และลิงก์สลิป จะถูกบันทึกลง **Google Sheets** ทันที
3. หน้าเว็บจะดึงสถานะจาก Google Sheets แบบ Real-time

---

## 📝 ขั้นตอนที่ 3: เชื่อมต่อกับ Google Forms (กรณีเพื่อนกรอกผ่านฟอร์ม)

หากต้องการทำ Google Forms สำรองไว้กรณีฉุกเฉิน:
1. สร้าง **Google Forms** สอบถาม:
   - รหัสนักศึกษา (เช่น `693050120-5`)
   - แนบไฟล์สลิป (File Upload)
2. ในหน้า Responses (การตอบกลับ) ของ Form ให้กด **Link to Sheets** แล้วเลือก Google Sheet ไฟล์เดิมในแท็บที่ชื่อ `Form Responses 1`
3. ในแท็บ `Payments` สามารถเขียนสูตร `=VLOOKUP(...)` ดึงสถานะจาก Form มารวมกันได้อย่างอัตโนมัติ 100%
