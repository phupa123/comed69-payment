/**
 * =========================================================================
 * APP CONFIGURATION & GLOBAL ENVIRONMENT
 * สาขาวิชาคอมพิวเตอร์ศึกษา คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น
 * =========================================================================
 */

window.APP_CONFIG = {
  appName: "สาขาวิชาคอมพิวเตอร์ศึกษา มหาวิทยาลัยขอนแก่น",
  shortName: "COMED KKU 69",
  version: "2.3.0",
  releaseDate: "2026-08-30",
  lastUpdatedText: "30 ส.ค. 69 เวลา 02:15 น.",
  
  // Payment Info
  payment: {
    title: "ค่าทำป้ายสาขาวิชาเอก",
    amount: 190.00,
    currency: "THB",
    deadline: "2026-09-04T23:59:00+07:00",
    deadlineDisplay: "4 กันยายน 2569 เวลา 23:59 น.",
    bank: {
      name: "ธนาคารกสิกรไทย (KPlus)",
      accountNumber: "236-2-47817-3",
      accountName: "น.ส. พิชามญธุ์ สามสี",
      qrImage: "qr_payment.png"
    }
  },

  // API Endpoints
  api: {
    googleAppsScriptUrl: "https://script.google.com/macros/s/AKfycbz_9e6g29y-q1z8i2m4v3_sample/exec",
    localBackendUrl: "/api"
  },

  // Contact Info
  contacts: {
    faculty: "คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น",
    instagram: "https://www.instagram.com/thitiphaua/",
    instagramHandle: "thitiphaua"
  }
};
