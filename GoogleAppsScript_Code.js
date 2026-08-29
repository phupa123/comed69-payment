/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: Auto-Sync, 2-Stage Recycle Bin, Help Desk Issues & Admin Logs
 * =========================================================================
 */

const GOOGLE_DRIVE_FOLDER_ID = "1KaE-6GyKd0mafFBYTp-fAlAG4YAJWrFa6xxUov59JvktlP5fVBQDKzJEBlc1b2GWDcuNYxJI";

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
  } catch(e) {
    return DriveApp.getRootFolder();
  }
}

// 1. GET: อ่านข้อมูล Payments, Trash, Issues, Logs
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    const result = {
      active: {},
      trash: {},
      issues: [],
      logs: []
    };

    // อ่านชีต Issues (ถ้ามี)
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

    // อ่านชีต Logs (ถ้ามี)
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
          } catch(err) {
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

// 2. POST: ชำระเงิน, ถังขยะ, ปัญหาผู้ใช้ (Issues), บันทึก Logs
function doPost(e) {
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
      return ContentService.createTextOutput(JSON.stringify({ success: true, issueId: issueId })).setMimeType(ContentService.MimeType.JSON);
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
      }

      const timeStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss");
      logSheet.appendRow([
        timeStr,
        data.adminEmail || "Admin",
        data.logAction || "-",
        data.logDetail || "-"
      ]);

      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
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
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE 1: ย้ายไปยังถังขยะ (Move to Trash)
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
          } catch(err){}
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

      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Moved to Trash" })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE 2: ลบถาวร (Delete Permanently)
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
                } catch(err){}
              }
            }
            trashSheet.deleteRow(i + 1);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Permanently Deleted" })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE 3: กู้คืนจากถังขยะ (Restore)
    // ----------------------------------------------------
    if (action === "restore") {
      let trashSheet = ss.getSheetByName("Trash_ถังขยะ");
      let paySheet = ss.getSheetByName("Payments");
      if (!paySheet) {
        paySheet = ss.insertSheet("Payments");
        paySheet.appendRow(["รหัสนักศึกษา", "ชื่อ-นามสกุล", "ชื่อเล่น", "อีเมล", "สถานะ", "ยอดเงิน (บาท)", "ลิงก์สลิปใน Drive", "วัน-เวลาที่ชำระ", "รหัสอ้างอิง", "แหล่งที่มา"]);
        paySheet.setFrozenRows(1);
      }

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
            const row = vals[i];
            const slipUrl = rowSlip || String(row[6] || "");
            
            if (slipUrl.includes("drive.google.com")) {
              const idMatch = slipUrl.match(/[-\w]{25,}/);
              if (idMatch) {
                try {
                  const file = DriveApp.getFileById(idMatch[0]);
                  const mainFolder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
                  file.moveTo(mainFolder);
                } catch(err){}
              }
            }

            paySheet.appendRow([
              row[0] || data.studentId, row[1] || data.name, row[2] || data.nickname, row[3] || data.email, 
              "ชำระเงินแล้ว", 190, slipUrl, row[7] || Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss"), 
              row[8] || ("TXN-COMED-" + targetDigits), "Restored"
            ]);
            trashSheet.deleteRow(i + 1);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Restored" })).setMimeType(ContentService.MimeType.JSON);
    }

    // ----------------------------------------------------
    // CASE 4: ชำระเงิน / อัปโหลดสลิปปกติ (Pay หรือ Admin Verified)
    // ----------------------------------------------------
    let paySheet = ss.getSheetByName("Payments");
    if (!paySheet) {
      paySheet = ss.insertSheet("Payments");
      paySheet.appendRow(["รหัสนักศึกษา", "ชื่อ-นามสกุล", "ชื่อเล่น", "อีเมล", "สถานะ", "ยอดเงิน (บาท)", "ลิงก์สลิปใน Drive", "วัน-เวลาที่ชำระ", "รหัสอ้างอิง", "แหล่งที่มา"]);
      paySheet.setFrozenRows(1);
    }

    let driveFileUrl = "";
    if (data.slipBase64) {
      let folder;
      try {
        folder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
      } catch (err) {
        folder = DriveApp.getRootFolder();
      }

      const parts = data.slipBase64.split(';base64,');
      const contentType = parts[0].replace('data:', '');
      const base64Data = parts[1] || data.slipBase64;
      const decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType, "Slip_" + data.studentId + "_" + new Date().getTime() + ".png");

      const file = folder.createFile(decodedBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      driveFileUrl = file.getUrl();
    } else if (data.slipUrl) {
      driveFileUrl = data.slipUrl;
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
        data.studentId, data.name || values[rowIndex-1][1], data.nickname || values[rowIndex-1][2], data.email || values[rowIndex-1][3],
        "ชำระเงินแล้ว", 190, driveFileUrl || values[rowIndex-1][6], timestamp, refCode, data.source || "Website"
      ]]);
    } else {
      paySheet.appendRow([
        data.studentId, data.name || "", data.nickname || "", data.email || "", "ชำระเงินแล้ว", 190, driveFileUrl, timestamp, refCode, data.source || "Website"
      ]);
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
