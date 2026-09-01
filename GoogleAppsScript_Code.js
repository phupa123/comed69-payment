/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: Complete Auto-Sync Engine for COMED KKU 69
 * (Payments, Google Drive Images, Issues, Trash, Logs & LINE Notification)
 * =========================================================================
 */

const GOOGLE_DRIVE_FOLDER_ID = "1KaE-6GyKd0mafFBYTp-fAlAG4YAJWrFa6xxUov59JvktlP5fVBQDKzJEBlc1b2GWDcuNYxJI";

// ================= LINE NOTIFICATION CONFIG =================
const LINE_CHANNEL_ACCESS_TOKEN = "xW18yEAjS6kjxO6SdQQtyEbatDIlzE4YW0+OKBNspb1Nw9oDSP94vNknZ2cJd139Ldc1nkEMeOJ8oWKC0AoK/MqKmSTpSSGwqMYr00FsG1yhLOw1GhsnyN+mrBBnMrzwl9rg1eHlk82KqzRYFdAqGQdB04t89/1O/w1cDnyilFU=";
const LINE_TARGET_USER_ID = "U39c507609d6f5e67d64c35a4a7708ea6";

// ================= AUTOMATED EMAIL RECEIPT ENGINE =================
function sendEmailReceiptNotification(toEmail, studentName, studentNickname, studentId, amount, refCode, timestamp, slipDriveUrl) {
  if (!toEmail || !toEmail.includes("@")) return;

  const subject = `[COMED KKU 69] ใบรับการส่งหลักฐานชำระเงิน - ${studentName} (${studentId})`;
  
  const htmlBody = `
    <div style="font-family: 'Prompt', Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc; border-radius: 20px; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #f97316; margin: 0; font-size: 22px;">สาขาวิชาคอมพิวเตอร์ศึกษา (COMED KKU 69)</h2>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 5px;">คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น</p>
      </div>

      <div style="background-color: #1e293b; border-radius: 16px; padding: 24px; border: 1px solid #334155;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="background-color: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; padding: 6px 14px; border-radius: 9999px; font-weight: bold; font-size: 13px;">
            ✔ บันทึกข้อมูลและสลิปเรียบร้อยแล้ว
          </span>
          <h3 style="color: #ffffff; margin-top: 15px; margin-bottom: 5px;">ใบรับการส่งหลักฐานชำระเงิน</h3>
          <p style="color: #38bdf8; font-family: monospace; font-size: 12px; margin: 0;">รหัสอ้างอิง: ${refCode}</p>
        </div>

        <table style="width: 100%; font-size: 13px; color: #cbd5e1; border-collapse: collapse; margin-top: 15px;">
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">ชื่อ-นามสกุล:</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #ffffff;">${studentName} (น้อง${studentNickname || "-"})</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">รหัสนักศึกษา:</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #f97316; font-family: monospace;">${studentId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">ยอดเงินที่ชำระ:</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #4ade80; font-size: 15px;">฿${amount || "190.00"} บาท</td>
          </tr>
          <tr style="border-bottom: 1px solid #334155;">
            <td style="padding: 10px 0; color: #94a3b8;">วัน-เวลาที่ส่งข้อมูล:</td>
            <td style="padding: 10px 0; text-align: right; color: #e2e8f0; font-family: monospace;">${timestamp}</td>
          </tr>
        </table>

        ${slipDriveUrl ? `
          <div style="margin-top: 20px; text-align: center;">
            <a href="${slipDriveUrl}" target="_blank" style="background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 12px; font-weight: bold; font-size: 12px; display: inline-block;">
              ดูภาพสลิปหลักฐานบน Google Drive
            </a>
          </div>
        ` : ""}
      </div>

      <div style="text-align: center; margin-top: 25px; font-size: 11px; color: #64748b;">
        <p>อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบรับชำระเงิน COMED KKU 69</p>
        <p>หากมีข้อสงสัยหรือข้อมูลไม่ถูกต้อง สามารถติดต่อแอดมินหรือรายงานปัญหาผ่านหน้าเว็บได้ตลอด 24 ชม.</p>
      </div>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: toEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log("Email Receipt successfully sent to: " + toEmail);
  } catch (err) {
    Logger.log("Email Send Error: " + err.toString());
  }
}

// ฟังก์ชันส่งการแจ้งเตือนสลิปเข้า LINE
function sendLineSlipNotification(name, nickname, studentId, slipUrl, timestamp, refCode) {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_TARGET_USER_ID) return;
  try {
    const textMsg = `🔔 [แจ้งเตือน] สลิปชำระเงินใหม่!\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `👤 ชื่อ: ${name} (${nickname ? 'น้อง' + nickname : '-'})\n` +
      `🆔 รหัสนักศึกษา: ${studentId}\n` +
      `💵 ยอดเงิน: ฿190.00 บาท\n` +
      `🕒 วัน-เวลา: ${timestamp}\n` +
      `🔖 รหัสอ้างอิง: ${refCode}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      (slipUrl && slipUrl.startsWith("http") ? `🖼️ เปิดดูสลิป: ${slipUrl}` : ``);

    const messages = [
      {
        "type": "text",
        "text": textMsg
      }
    ];

    // ถ้าเป็นรูปสลิปจาก Google Drive แปลงลิงก์ส่งเป็นรูปภาพใน LINE
    if (slipUrl && slipUrl.includes("drive.google.com")) {
      const idMatch = slipUrl.match(/[-\w]{25,}/);
      if (idMatch) {
        const directImgUrl = "https://lh3.googleusercontent.com/d/" + idMatch[0];
        messages.push({
          "type": "image",
          "originalContentUrl": directImgUrl,
          "previewImageUrl": directImgUrl
        });
      }
    }

    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", {
      "method": "post",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + LINE_CHANNEL_ACCESS_TOKEN
      },
      "payload": JSON.stringify({
        "to": LINE_TARGET_USER_ID,
        "messages": messages
      }),
      "muteHttpExceptions": true
    });
  } catch (err) {
    Logger.log("LINE Notification Error: " + err.toString());
  }
}

// ฟังก์ชันส่งการแจ้งเตือนเมื่อมีคนแจ้งปัญหาผู้ใช้เข้า LINE
function sendLineIssueNotification(issueId, studentId, name, category, contact, detail, timeStr) {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_TARGET_USER_ID) return;
  try {
    const textMsg = `⚠️ [แจ้งเตือน] มีผู้ใช้แจ้งปัญหาใหม่!\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `📌 รหัสปัญหา: ${issueId}\n` +
      `👤 ผู้แจ้ง: ${name} (${studentId || '-'})\n` +
      `🏷️ หัวข้อ: ${category}\n` +
      `📞 ช่องทางติดต่อ: ${contact}\n` +
      `📝 รายละเอียด: ${detail}\n` +
      `🕒 เวลา: ${timeStr}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `👉 แอดมินสามารถเปิดดูได้ที่หน้า Dashboard`;

    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", {
      "method": "post",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + LINE_CHANNEL_ACCESS_TOKEN
      },
      "payload": JSON.stringify({
        "to": LINE_TARGET_USER_ID,
        "messages": [
          { "type": "text", "text": textMsg }
        ]
      }),
      "muteHttpExceptions": true
    });
  } catch (err) {
    Logger.log("LINE Issue Alert Error: " + err.toString());
  }
}

// ฟังก์ชันหาหรือสร้างโฟลเดอร์ใน Google Drive
function getOrCreateFolder(name) {
  try {
    const parentFolder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
    const subfolders = parentFolder.getFoldersByName(name);
    if (subfolders.hasNext()) {
      return subfolders.next();
    }
    const newFolder = parentFolder.createFolder(name);
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return newFolder;
  } catch (e) {
    return DriveApp.getRootFolder();
  }
}

// 1. GET: อ่านข้อมูลทั้งหมด (Active Payments, Trash, Issues, Logs)
function doGet(e) {
    // Case: ดึงการตั้งค่า Maintenance Config
    if (e && e.parameter && e.parameter.action === "get_maintenance_config") {
      const configSheet = ss.getSheetByName("System_Config");
      if (configSheet && configSheet.getLastRow() >= 2) {
        const val = configSheet.getRange(2, 1).getValue();
        if (val) {
          return ContentService.createTextOutput(String(val)).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({})).setMimeType(ContentService.MimeType.JSON);
    }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    const result = {
      active: {},
      trash: {},
      issues: [],
      logs: []
    };

    // อ่านชีต Issues_ปัญหาผู้ใช้
    const issueSheet = ss.getSheetByName("Issues_ปัญหาผู้ใช้");
    if (issueSheet) {
      const issueData = issueSheet.getDataRange().getValues();
      for (let i = 1; i < issueData.length; i++) {
        const row = issueData[i];
        if (row[0]) {
          result.issues.push({
            id: row[0],
            studentId: row[1],
            name: row[2],
            contact: row[3],
            category: row[4],
            detail: row[5],
            evidenceUrl: row[6],
            status: row[7] || "รอดำเนินการ",
            timestamp: row[8]
          });
        }
      }
    }

    // อ่านชีต Admin_Logs
    const logSheet = ss.getSheetByName("Admin_Logs");
    if (logSheet) {
      const logData = logSheet.getDataRange().getValues();
      for (let i = 1; i < logData.length; i++) {
        const row = logData[i];
        if (row[0]) {
          result.logs.push({
            timestamp: row[0],
            adminEmail: row[1],
            action: row[2],
            detail: row[3]
          });
        }
      }
    }

    // อ่านชีต Payments ทั่วไป และชีต Trash_ถังขยะ
    for (let sheet of sheets) {
      const sheetName = sheet.getName();
      if (sheetName === "Issues_ปัญหาผู้ใช้" || sheetName === "Admin_Logs") continue;

      const data = sheet.getDataRange().getValues();
      if (data.length < 2) continue;

      const isTrashSheet = sheetName.includes("Trash") || sheetName.includes("ถังขยะ");
      const headers = data[0].map(h => String(h).trim().toLowerCase());
      
      let idCol = -1, nameCol = -1, nickCol = -1, emailCol = -1, slipCol = -1, timeCol = -1;
      headers.forEach((h, idx) => {
        if (h.includes("รหัส") || h.includes("student id") || h.includes("id")) idCol = idx;
        else if (h.includes("ชื่อ-") || h.includes("ชื่อ -") || (h.includes("ชื่อ") && !h.includes("เล่น"))) nameCol = idx;
        else if (h.includes("ชื่อเล่น") || h.includes("nickname")) nickCol = idx;
        else if (h.includes("เมล") || h.includes("mail")) emailCol = idx;
        else if (h.includes("สลิป") || h.includes("หลักฐาน") || h.includes("slip") || h.includes("แนบ") || h.includes("drive")) slipCol = idx;
        else if (h.includes("ประทับเวลา") || h.includes("timestamp") || h.includes("วัน") || h.includes("เวลา")) timeCol = idx;
      });

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        let foundId = "";
        
        if (idCol !== -1 && row[idCol] && String(row[idCol]).replace(/\D/g, '').startsWith('693050')) {
          foundId = String(row[idCol]).trim();
        } else {
          for (let cell of row) {
            const strCell = String(cell).trim();
            if (strCell.replace(/\D/g, '').startsWith('693050')) {
              foundId = strCell;
              break;
            }
          }
        }

        if (!foundId) continue;

        const cleanDigits = foundId.replace(/\D/g, '');
        let standardId = foundId;
        if (cleanDigits.length === 10 && cleanDigits.startsWith('69')) {
          standardId = cleanDigits.slice(0, 9) + '-' + cleanDigits.slice(9, 10);
        }

        let slipUrl = (slipCol !== -1 && row[slipCol]) ? String(row[slipCol]).trim() : "";
        if (!slipUrl) {
          for (let cell of row) {
            const strCell = String(cell).trim();
            if (strCell.startsWith("http://") || strCell.startsWith("https://")) {
              slipUrl = strCell;
              break;
            }
          }
        }

        let timeStr = "";
        if (timeCol !== -1 && row[timeCol]) {
          try {
            timeStr = Utilities.formatDate(new Date(row[timeCol]), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");
          } catch (err) {
            timeStr = String(row[timeCol]);
          }
        }

        const item = {
          studentId: standardId,
          name: nameCol !== -1 ? String(row[nameCol] || "") : "",
          nickname: nickCol !== -1 ? String(row[nickCol] || "") : "",
          email: emailCol !== -1 ? String(row[emailCol] || "") : "",
          paid: !isTrashSheet,
          amount: 190,
          slipUrl: slipUrl,
          timestamp: timeStr || "บันทึกแล้ว",
          refCode: "TXN-COMED-" + cleanDigits,
          source: sheetName
        };

        if (isTrashSheet) {
          result.trash[standardId] = item;
        } else {
          result.active[standardId] = item;
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      ...result.active,
      _trash: result.trash,
      _issues: result.issues,
      _logs: result.logs
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. POST: จัดการส่งสลิป, ย้ายไปถังขยะ, กู้คืน, ลบถาวร, แจ้งปัญหาผู้ใช้, บันทึก Logs
function doPost(e) {
    // ----------------------------------------------------
    // CASE: บันทึกการตั้งค่า Maintenance Config ขึ้นคลาวด์
    // ----------------------------------------------------
    if (action === "save_maintenance_config") {
      let configSheet = ss.getSheetByName("System_Config");
      if (!configSheet) {
        configSheet = ss.insertSheet("System_Config");
        configSheet.appendRow(["Maintenance_JSON", "วัน-เวลาอัปเดต", "แอดมิน"]);
        configSheet.setFrozenRows(1);
      }
      const timeStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");
      configSheet.getRange(2, 1).setValue(JSON.stringify(data.config || {}));
      configSheet.getRange(2, 2).setValue(timeStr);
      configSheet.getRange(2, 3).setValue(data.adminEmail || "Admin");
      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

  const lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter || {};
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = data.action || "pay";
    const targetDigits = String(data.studentId || "").replace(/\D/g, '');

    // ----------------------------------------------------
    // CASE: แจ้งปัญหาผู้ใช้ (Report Issue)
    // ----------------------------------------------------
    if (action === "report_issue") {
      let issueSheet = ss.getSheetByName("Issues_ปัญหาผู้ใช้");
      if (!issueSheet) {
        issueSheet = ss.insertSheet("Issues_ปัญหาผู้ใช้");
        issueSheet.appendRow(["รหัสปัญหา", "รหัสนักศึกษา", "ชื่อ-นามสกุล", "ช่องทางติดต่อ", "หัวข้อปัญหา", "รายละเอียด", "ลิงก์หลักฐาน", "สถานะ", "เวลาที่แจ้ง"]);
        issueSheet.setFrozenRows(1);
        issueSheet.getRange(1, 1, 1, 9).setBackground("#ea580c").setFontColor("#ffffff").setFontWeight("bold");
      }

      const issueId = data.issueId || ("ISSUE-" + Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyyMMdd-HHmmss"));
      const timeStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");

      issueSheet.appendRow([
        issueId,
        data.studentId || "-",
        data.name || "-",
        data.contact || "-",
        data.category || "ทั่วไป",
        data.detail || "-",
        data.evidenceUrl || "-",
        "รอดำเนินการ",
        timeStr
      ]);

      SpreadsheetApp.flush();

      // Trigger Instant LINE Notification to Admin
      sendLineIssueNotification(
        issueId,
        data.studentId,
        data.name,
        data.category || "ทั่วไป",
        data.contact || "-",
        data.detail || "-",
        timeStr
      );

      return ContentService.createTextOutput(JSON.stringify({ success: true, issueId: issueId })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE: อัปเดตสถานะปัญหา (Update Issue Status)
    // ----------------------------------------------------
    if (action === "update_issue_status") {
      let issueSheet = ss.getSheetByName("Issues_ปัญหาผู้ใช้");
      if (issueSheet) {
        const vals = issueSheet.getDataRange().getValues();
        for (let i = 1; i < vals.length; i++) {
          if (String(vals[i][0]).trim() === String(data.issueId).trim()) {
            issueSheet.getRange(i + 1, 8).setValue(data.newStatus || "แก้ไขแล้ว");
            break;
          }
        }
        SpreadsheetApp.flush();
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE: บันทึก Logs ของ Admin
    // ----------------------------------------------------
    if (action === "log_admin") {
      let logSheet = ss.getSheetByName("Admin_Logs");
      if (!logSheet) {
        logSheet = ss.insertSheet("Admin_Logs");
        logSheet.appendRow(["วัน-เวลา", "อีเมลแอดมิน", "กิจกรรม", "รายละเอียด"]);
        logSheet.setFrozenRows(1);
        logSheet.getRange(1, 1, 1, 4).setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold");
      }

      const timeStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");
      logSheet.appendRow([
        timeStr,
        data.adminEmail || "Admin",
        data.logAction || "-",
        data.logDetail || "-"
      ]);

      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE: ย้ายไปยังถังขยะ (Move to Trash)
    // ----------------------------------------------------
    if (action === "move_to_trash") {
      let trashSheet = ss.getSheetByName("Trash_ถังขยะ");
      if (!trashSheet) {
        trashSheet = ss.insertSheet("Trash_ถังขยะ");
        trashSheet.appendRow([
          "รหัสนักศึกษา", "ชื่อ-นามสกุล", "ชื่อเล่น", "อีเมล",
          "สถานะเดิม", "ยอดเงิน", "ลิงก์สลิป", "เวลายกเลิก", "รหัสอ้างอิง", "ชีตเดิม"
        ]);
        trashSheet.setFrozenRows(1);
        trashSheet.getRange(1, 1, 1, 10).setBackground("#e11d48").setFontColor("#ffffff").setFontWeight("bold");
      }

      const sheets = ss.getSheets();
      let movedRows = [];

      for (let sheet of sheets) {
        if (sheet.getName() === "Trash_ถังขยะ" || sheet.getName() === "Issues_ปัญหาผู้ใช้" || sheet.getName() === "Admin_Logs") continue;
        const vals = sheet.getDataRange().getValues();

        for (let i = vals.length - 1; i >= 1; i--) {
          let isMatch = false;
          let rowSlip = "";
          for (let cell of vals[i]) {
            const str = String(cell).trim();
            if (str.replace(/\D/g, '') === targetDigits && targetDigits !== "") {
              isMatch = true;
            }
            if (str.startsWith("http://") || str.startsWith("https://")) {
              rowSlip = str;
            }
          }

          if (isMatch) {
            movedRows.push({
              row: vals[i],
              slip: rowSlip || data.slipUrl || ""
            });
            sheet.deleteRow(i + 1);
          }
        }
      }

      const slipToMove = (movedRows.length > 0 && movedRows[0].slip) ? movedRows[0].slip : (data.slipUrl || "");

      if (slipToMove && slipToMove.includes("drive.google.com")) {
        const idMatch = slipToMove.match(/[-\w]{25,}/);
        if (idMatch) {
          try {
            const file = DriveApp.getFileById(idMatch[0]);
            const trashFolder = getOrCreateFolder("Trash_Slips_ถังขยะ");
            file.moveTo(trashFolder);
          } catch (err) { }
        }
      }

      trashSheet.appendRow([
        data.studentId,
        data.name || "",
        data.nickname || "",
        data.email || "",
        "ย้ายไปถังขยะ",
        190,
        slipToMove,
        Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss"),
        "TXN-TRASH-" + targetDigits,
        "Auto-Moved"
      ]);

      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Moved to Trash" })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE: ลบถาวร (Delete Permanently)
    // ----------------------------------------------------
    if (action === "delete_permanently") {
      let trashSheet = ss.getSheetByName("Trash_ถังขยะ");
      if (trashSheet) {
        const vals = trashSheet.getDataRange().getValues();
        for (let i = vals.length - 1; i >= 1; i--) {
          let isMatch = false;
          let rowSlip = "";
          for (let cell of vals[i]) {
            const str = String(cell).trim();
            if (str.replace(/\D/g, '') === targetDigits && targetDigits !== "") {
              isMatch = true;
            }
            if (str.startsWith("http://") || str.startsWith("https://")) {
              rowSlip = str;
            }
          }

          if (isMatch) {
            const slipUrl = rowSlip || data.slipUrl || "";
            if (slipUrl.includes("drive.google.com")) {
              const idMatch = slipUrl.match(/[-\w]{25,}/);
              if (idMatch) {
                try {
                  DriveApp.getFileById(idMatch[0]).setTrashed(true);
                } catch (err) { }
              }
            }
            trashSheet.deleteRow(i + 1);
          }
        }
        SpreadsheetApp.flush();
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Deleted permanently" })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE: กู้คืนจากถังขยะ (Restore from Trash)
    // ----------------------------------------------------
    if (action === "restore") {
      let paySheet = ss.getSheetByName("การชำระเงิน_COMED69") || ss.getSheets()[0];
      let trashSheet = ss.getSheetByName("Trash_ถังขยะ");
      let restoredItem = null;

      if (trashSheet) {
        const vals = trashSheet.getDataRange().getValues();
        for (let i = vals.length - 1; i >= 1; i--) {
          let isMatch = false;
          let rowSlip = "";
          for (let cell of vals[i]) {
            const str = String(cell).trim();
            if (str.replace(/\D/g, '') === targetDigits && targetDigits !== "") {
              isMatch = true;
            }
            if (str.startsWith("http://") || str.startsWith("https://")) {
              rowSlip = str;
            }
          }

          if (isMatch) {
            restoredItem = {
              row: vals[i],
              slip: rowSlip || data.slipUrl || ""
            };
            trashSheet.deleteRow(i + 1);
            break;
          }
        }
      }

      const slipToRestore = restoredItem ? restoredItem.slip : (data.slipUrl || "");

      if (slipToRestore && slipToRestore.includes("drive.google.com")) {
        const idMatch = slipToRestore.match(/[-\w]{25,}/);
        if (idMatch) {
          try {
            const file = DriveApp.getFileById(idMatch[0]);
            const slipsFolder = getOrCreateFolder("Payment_Slips_หลักฐานการโอน");
            file.moveTo(slipsFolder);
          } catch (err) { }
        }
      }

      paySheet.appendRow([
        data.studentId,
        data.name || (restoredItem ? restoredItem.row[1] : ""),
        data.nickname || (restoredItem ? restoredItem.row[2] : ""),
        data.email || (restoredItem ? restoredItem.row[3] : ""),
        "ชำระเงินแล้ว",
        190,
        slipToRestore,
        Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss"),
        "TXN-RESTORE-" + targetDigits,
        "Restored from Trash"
      ]);

      SpreadsheetApp.flush();
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Restored successfully" })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE DEFAULT: ชำระเงิน & อัปโหลดสลิป (Payment & Slip Upload)
    // ----------------------------------------------------
    let driveFileUrl = data.slipUrl || "";

    if (data.slipBase64 && data.slipBase64.startsWith("data:image")) {
      try {
        const slipsFolder = getOrCreateFolder("Payment_Slips_หลักฐานการโอน");
        const parts = data.slipBase64.split(",");
        const contentType = parts[0].match(/:(.*?);/)[1];
        const decodedData = Utilities.base64Decode(parts[1]);
        const cleanDigits = targetDigits || "STUDENT";
        const fileName = "Slip_" + cleanDigits + "_" + Utilities.formatDate(new Date(), "Asia/Bangkok", "yyyyMMdd_HHmmss") + ".png";
        
        const blob = Utilities.newBlob(decodedData, contentType, fileName);
        const uploadedFile = slipsFolder.createFile(blob);
        uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        driveFileUrl = uploadedFile.getUrl();
      } catch (fileErr) {
        driveFileUrl = "Error uploading file: " + fileErr.toString();
      }
    }

    let paySheet = ss.getSheetByName("การชำระเงิน_COMED69");
    if (!paySheet) {
      paySheet = ss.getSheets()[0];
      if (paySheet.getName() === "Trash_ถังขยะ" || paySheet.getName() === "Issues_ปัญหาผู้ใช้" || paySheet.getName() === "Admin_Logs") {
        paySheet = ss.insertSheet("การชำระเงิน_COMED69");
      }
    }

    // สร้าง Header ถ้าชีตว่าง
    if (paySheet.getLastRow() === 0) {
      paySheet.appendRow([
        "รหัสนักศึกษา", "ชื่อ-นามสกุล", "ชื่อเล่น", "อีเมล",
        "สถานะ", "ยอดเงิน", "ลิงก์สลิป", "วัน-เวลาที่ชำระ", "รหัสอ้างอิง", "ช่องทาง"
      ]);
      paySheet.setFrozenRows(1);
      paySheet.getRange(1, 1, 1, 10).setBackground("#ea580c").setFontColor("#ffffff").setFontWeight("bold");
    }

    const values = paySheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      const rowIdDigits = String(values[i][0]).replace(/\D/g, '');
      if (rowIdDigits === targetDigits && targetDigits !== "") {
        rowIndex = i + 1;
        break;
      }
    }

    const timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");
    const refCode = data.refCode || ("TXN-COMED-" + targetDigits);

    if (rowIndex > 0) {
      paySheet.getRange(rowIndex, 1, 1, 10).setValues([[
        data.studentId, data.name || values[rowIndex - 1][1], data.nickname || values[rowIndex - 1][2], data.email || values[rowIndex - 1][3],
        "ชำระเงินแล้ว", 190, driveFileUrl || values[rowIndex - 1][6], timestamp, refCode, data.source || "Website"
      ]]);
    } else {
      paySheet.appendRow([
        data.studentId, data.name || "", data.nickname || "", data.email || "", "ชำระเงินแล้ว", 190, driveFileUrl, timestamp, refCode, data.source || "Website"
      ]);
    }

    SpreadsheetApp.flush();

    // ส่งอีเมลใบเสร็จแจ้งเตือนอัตโนมัติไปยังนักศึกษา (Automated Email Receipt)
    try {
      if (data.email) {
        sendEmailReceiptNotification(
          data.email,
          data.name || "",
          data.nickname || "",
          data.studentId || "",
          190,
          refCode,
          timestamp,
          driveFileUrl || ""
        );
      }
    } catch (mailErr) {
      Logger.log("Email receipt send error: " + mailErr.toString());
    }

    // ส่งการแจ้งเตือนสลิปเข้า LINE ทันที
    try {
      sendLineSlipNotification(
        data.name || "",
        data.nickname || "",
        data.studentId || "",
        driveFileUrl || "",
        timestamp,
        refCode
      );
    } catch (lineErr) {
      Logger.log("Line send error: " + lineErr.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      slipUrl: driveFileUrl,
      timestamp: timestamp,
      refCode: refCode
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
