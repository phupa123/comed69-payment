/**
 * =========================================================================
 * PAYMENT CAMPAIGNS CONFIGURATION & REPOSITORY
 * สาขาวิชาคอมพิวเตอร์ศึกษา คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น (COMED KKU 69)
 * =========================================================================
 */

const COMED_CAMPAIGNS_STORAGE_KEY = 'COMED_PAYMENT_CAMPAIGNS_V2';

// 1. Initial Default Campaigns Repository
const DEFAULT_COMED_CAMPAIGNS = [
  {
    id: "paimai69",
    code: "PAIMAI69",
    title: "ค่าทำป้ายสาขาวิชาเอก",
    subtitle: "สำหรับนักศึกษาชั้นปีที่ 1 ทั้งหมด 60 คน",
    category: "กิจกรรมชั้นปีที่ 1 (COMED 69)",
    amount: 190.00,
    currency: "THB",
    deadline: "2026-09-04T23:59:00+07:00",
    deadlineDisplay: "4 ก.ย. 2569 (23:59 น.)",
    bankName: "ธนาคารกสิกรไทย (KPlus)",
    accountNumber: "236-2-47817-3",
    accountName: "น.ส. พิชามญธุ์ สามสี",
    qrImage: "qr_payment.png",
    
    // Cloud Database & API Integrations
    gasApiUrl: "https://script.google.com/macros/s/AKfycbxEaT4wLt0Ohl1UF9tz5EH7L49LTgyKYf8jxlr17lFDwv0hZcacO04NK0Ra7Av5y2wT/exec",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/1tD13_pZ4Vp27V8Z34wL2-Sample/edit",
    googleFormUrl: "",
    googleDriveFolderUrl: "",
    apiActionDoc: "API นี้ใช้บันทึกการส่งสลิป, ตรวจสอบสถานะการจ่ายเงินรายบุคคล, และแจ้งเตือน LINE Alert",
    
    status: "open", // 'open' | 'temp_closed' | 'permanently_closed'
    closedReason: "",
    isDefault: true,
    showOnIndex: true,
    createdAt: "2026-08-30T00:00:00Z"
  }
];

// Helper Functions for Campaigns
window.ComedCampaignManager = {
  getAllCampaigns: function() {
    try {
      const stored = localStorage.getItem(COMED_CAMPAIGNS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    return DEFAULT_COMED_CAMPAIGNS;
  },

  getCampaignById: function(id) {
    const list = this.getAllCampaigns();
    if (!id) return list[0] || DEFAULT_COMED_CAMPAIGNS[0];
    const found = list.find(c => (c.id === id || c.code === id || c.id.toLowerCase() === id.toLowerCase()));
    return found || list[0] || DEFAULT_COMED_CAMPAIGNS[0];
  },

  saveCampaigns: function(campaigns) {
    localStorage.setItem(COMED_CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
  },

  updateCampaign: function(updatedCampaign) {
    const list = this.getAllCampaigns();
    const idx = list.findIndex(c => c.id === updatedCampaign.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedCampaign };
    } else {
      list.push(updatedCampaign);
    }
    this.saveCampaigns(list);
  },

  deleteCampaign: function(id) {
    let list = this.getAllCampaigns();
    list = list.filter(c => c.id !== id);
    this.saveCampaigns(list);
  }
};
