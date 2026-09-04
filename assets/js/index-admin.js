/**
 * =========================================================================
 * INDEX PORTAL ADMIN LOGIC - assets/js/index-admin.js
 * COMED KKU 69 INDEX CMS, ANNOUNCEMENTS & PAYMENT CAMPAIGNS CONTROLLER
 * =========================================================================
 */

const ADMIN_SESSION_KEY = 'COMED_KKU69_ADMIN_LOGGED_USER';
const INDEX_CONFIG_KEY = 'COMED_KKU69_INDEX_CONFIG_V1';
const MAINT_CONFIG_KEY = 'COMED_MAINTENANCE_CONFIG_V1';
const GAS_CONFIG_API_URL = "https://script.google.com/macros/s/AKfycbxEaT4wLt0Ohl1UF9tz5EH7L49LTgyKYf8jxlr17lFDwv0hZcacO04NK0Ra7Av5y2wT/exec";

// Default Announcement & Page CMS
const DEFAULT_INDEX_CONFIG = {
  announcementText: "📢 ขอความร่วมมือเพื่อนๆ นักศึกษาชั้นปีที่ 1 ชำระค่าทำป้ายสาขาวิชาเอก คนละ ฿190.00 ภายในวันที่ 4 ก.ย. 69",
  announcementActive: true,
  heroTag: "สาขาวิชาคอมพิวเตอร์ศึกษา รุ่นที่ 69",
  heroTitle: "ระบบสารสนเทศ & จัดการข้อมูลรุ่น",
  heroSubtitle: "คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น (Computer Education KKU)",
  aboutBranch: "สาขาวิชาคอมพิวเตอร์ศึกษา คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น มุ่งเน้นผลิตบัณฑิตครูและนักเทคโนโลยีการศึกษาที่มีความรู้ความเชี่ยวชาญด้านวิทยาการคอมพิวเตอร์ นวัตกรรมดิจิทัล และศาสตร์การสอนสมัยใหม่ เพื่อพัฒนาการศึกษาของประเทศอย่างยั่งยืน",
  curriculumCredits: "128 หน่วยกิต",
  curriculumYears: "หลักสูตร 4 ปี (วท.บ. / ค.บ.)",
  instagramUrl: "https://www.instagram.com/thitiphaua/",
  instagramHandle: "thitiphaua"
};

// Default Site Maintenance Config
const DEFAULT_MAINT_CONFIG = {
  all: { active: false, title: "กำลังปิดปรับปรุงระบบชั่วคราว", reason: "ระบบกำลังอยู่ระหว่างการปรับปรุงและอัปเกรดเพื่อเพิ่มความเสถียรและความปลอดภัย", endTime: "" },
  index: { active: false, title: "หน้าหลักกำลังปรับปรุงชั่วคราว", reason: "กำลังอัปเดตข้อมูลและระบบสารสนเทศของสาขาวิชา", endTime: "" },
  payment: { active: false, title: "ระบบรับชำระเงินปิดปรับปรุงชั่วคราว", reason: "ระบบการเงินกำลังอยู่ระหว่างการสรุปยอดและบำรุงรักษาระบบ", endTime: "" }
};

let indexConfig = DEFAULT_INDEX_CONFIG;
try {
  const stored = localStorage.getItem(INDEX_CONFIG_KEY);
  indexConfig = stored ? { ...DEFAULT_INDEX_CONFIG, ...JSON.parse(stored) } : DEFAULT_INDEX_CONFIG;
} catch (e) {
  indexConfig = DEFAULT_INDEX_CONFIG;
}

function getMaintenanceConfig() {
  try {
    const s = localStorage.getItem(MAINT_CONFIG_KEY);
    return s ? { ...DEFAULT_MAINT_CONFIG, ...JSON.parse(s) } : DEFAULT_MAINT_CONFIG;
  } catch(e) {
    return DEFAULT_MAINT_CONFIG;
  }
}

function getCampaignsList() {
  if (window.ComedCampaignManager) {
    return window.ComedCampaignManager.getAllCampaigns();
  }
  return [];
}

let studentsList = [];
try {
  const customSt = localStorage.getItem('COMED_CUSTOM_STUDENTS_DATA');
  if (customSt) {
    studentsList = JSON.parse(customSt);
  } else if (window.STUDENTS_DATA && window.STUDENTS_DATA.length > 0) {
    studentsList = [...window.STUDENTS_DATA];
  }
} catch (e) {
  studentsList = [];
}

function checkAdminAuth() {
  const logged = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!logged) {
    alert("⚠️ กรุณาเข้าสู่ระบบผ่าน Central Admin Hub ก่อน");
    window.location.href = "admin.html";
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAdminAuth()) return;
  loadFormValues();
  updateLivePageBadges();

  // Load latest cloud maintenance state from Supabase
  try {
    const sb = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (sb) {
      const { data } = await sb.from('campaigns').select('closed_reason').eq('id', 'system_maintenance_config').maybeSingle();
      if (data && data.closed_reason) {
        const cloudConfig = JSON.parse(data.closed_reason);
        if (cloudConfig && typeof cloudConfig === 'object' && cloudConfig.all) {
          localStorage.setItem(MAINT_CONFIG_KEY, JSON.stringify(cloudConfig));
          updateLivePageBadges();
        }
      }
    }
  } catch(e) {}
  
  if (window.ComedCampaignManager && typeof window.ComedCampaignManager.fetchFromCloud === 'function') {
    try {
      await window.ComedCampaignManager.fetchFromCloud();
    } catch(e) {}
  }
  
  renderCampaignsList();
  renderStudentsTable();
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

// ================= 0. LIVE WEBSITE STATUS & DIRECT SWITCHER =================
function updateLivePageBadges() {
  const cfg = getMaintenanceConfig();

  // 1. Index Page
  const isIndexOff = (cfg.all && cfg.all.active) || (cfg.index && cfg.index.active);
  const badgeIndex = document.getElementById("pageBadgeIndex");
  const btnIndex = document.getElementById("btnToggleIndex");
  if (badgeIndex) {
    badgeIndex.className = isIndexOff 
      ? "px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1"
      : "px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1";
    badgeIndex.innerHTML = isIndexOff ? '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> ปิดปรับปรุง' : '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE';
  }
  if (btnIndex) {
    btnIndex.className = isIndexOff
      ? "px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition cursor-pointer"
      : "px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition cursor-pointer";
    btnIndex.textContent = isIndexOff ? "เปิดให้บริการ" : "สั่งปิดปรับปรุงหน้านี้";
  }

  // 2. Payment Page
  const isPaymentOff = (cfg.all && cfg.all.active) || (cfg.payment && cfg.payment.active);
  const badgePayment = document.getElementById("pageBadgePayment");
  const btnPayment = document.getElementById("btnTogglePayment");
  if (badgePayment) {
    badgePayment.className = isPaymentOff
      ? "px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1"
      : "px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1";
    badgePayment.innerHTML = isPaymentOff ? '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> ปิดปรับปรุง' : '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE';
  }
  if (btnPayment) {
    btnPayment.className = isPaymentOff
      ? "px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition cursor-pointer"
      : "px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition cursor-pointer";
    btnPayment.textContent = isPaymentOff ? "เปิดให้บริการ" : "สั่งปิดปรับปรุงหน้านี้";
  }

  // 3. Global All
  const isAllOff = !!(cfg.all && cfg.all.active);
  const badgeAll = document.getElementById("pageBadgeAll");
  const btnAll = document.getElementById("btnToggleAll");
  if (badgeAll) {
    badgeAll.className = isAllOff
      ? "px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1"
      : "px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1";
    badgeAll.innerHTML = isAllOff ? '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> ปิดปรับปรุง' : '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE';
  }
  if (btnAll) {
    btnAll.className = isAllOff
      ? "px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition cursor-pointer"
      : "px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition cursor-pointer";
    btnAll.textContent = isAllOff ? "เปิดทุกหน้า" : "สั่งปิดทั้งเว็บ";
  }
}

function toggleSinglePageLive(scope) {
  const cfg = getMaintenanceConfig();
  if (!cfg[scope]) {
    cfg[scope] = { active: false, title: "กำลังปรับปรุงระบบชั่วคราว", reason: "กำลังอัปเดตระบบเพื่อเพิ่มประสิทธิภาพ", endTime: "" };
  }
  cfg[scope].active = !cfg[scope].active;
  localStorage.setItem(MAINT_CONFIG_KEY, JSON.stringify(cfg));
  updateLivePageBadges();
  syncMaintenanceConfigToCloud(cfg);
  showToastNotification(`✨ เปลี่ยนสถานะหน้า ${scope} เป็น ${cfg[scope].active ? 'ปิดปรับปรุง' : 'เปิดให้บริการ'} สำเร็จ!`);
}

function toggleAllPagesQuick(shouldLock) {
  const cfg = getMaintenanceConfig();
  if (!cfg.all) cfg.all = {};
  if (!cfg.index) cfg.index = {};
  if (!cfg.payment) cfg.payment = {};

  cfg.all.active = shouldLock;
  cfg.index.active = shouldLock;
  cfg.payment.active = shouldLock;

  localStorage.setItem(MAINT_CONFIG_KEY, JSON.stringify(cfg));
  updateLivePageBadges();
  syncMaintenanceConfigToCloud(cfg);
  showToastNotification(`✨ ${shouldLock ? 'สั่งปิดปรับปรุงทุกหน้าเรียบร้อย' : 'เปิดให้บริการทุกหน้าออนไลน์แล้ว'}`);
}

function syncMaintenanceConfigToCloud(cfg) {
  // 1. Instant Realtime Push to Supabase Cloud
  try {
    const sb = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (sb) {
      sb.from('campaigns').upsert({
        id: 'system_maintenance_config',
        code: 'SYS_MAINT',
        title: 'SYSTEM_MAINTENANCE_RECORD',
        amount: 0,
        status: 'open',
        closed_reason: JSON.stringify(cfg),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' }).then(() => {});
    }
  } catch(e) {
    console.warn("Supabase Maintenance Sync Error:", e);
  }

  // 2. Background Sync to Google Apps Script
  if (GAS_CONFIG_API_URL) {
    fetch(GAS_CONFIG_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: JSON.stringify({
        action: "save_maintenance_config",
        config: cfg,
        adminEmail: sessionStorage.getItem(ADMIN_SESSION_KEY) || "Admin"
      })
    }).catch(() => {});
  }
}

// ================= QR CODE HANDLERS =================
function handleQrFileUpload(event, previewImgId, inputId) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("⚠️ ขนาดไฟล์ภาพใหญ่เกินไป กรุณาเลือกภาพขนาดไม่เกิน 5MB");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const preview = document.getElementById(previewImgId);
    if (preview) preview.src = dataUrl;
    const input = document.getElementById(inputId);
    if (input) input.value = dataUrl;
    showToastNotification("📸 โหลดรูปภาพ QR Code พร้อมใช้งานแล้ว!");
  };
  reader.readAsDataURL(file);
}

function updateQrPreviewFromUrl(url, previewImgId) {
  const preview = document.getElementById(previewImgId);
  if (!preview) return;
  if (!url || !url.trim()) {
    preview.src = "qr_payment.png";
    return;
  }
  preview.src = url.trim();
}

// ================= 1. PAGE CMS & ANNOUNCEMENTS =================
function loadFormValues() {
  document.getElementById('cfgAnnouncementText').value = indexConfig.announcementText || '';
  document.getElementById('cfgAnnouncementActive').checked = indexConfig.announcementActive !== false;
  document.getElementById('cfgHeroTag').value = indexConfig.heroTag || '';
  document.getElementById('cfgHeroTitle').value = indexConfig.heroTitle || '';
  document.getElementById('cfgHeroSubtitle').value = indexConfig.heroSubtitle || '';
  document.getElementById('cfgAboutBranch').value = indexConfig.aboutBranch || '';
  document.getElementById('cfgCurriculumCredits').value = indexConfig.curriculumCredits || '';
  document.getElementById('cfgCurriculumYears').value = indexConfig.curriculumYears || '';
  document.getElementById('cfgInstagramUrl').value = indexConfig.instagramUrl || '';
  document.getElementById('cfgInstagramHandle').value = indexConfig.instagramHandle || '';
}

function saveIndexConfig(e) {
  e.preventDefault();
  indexConfig = {
    announcementText: document.getElementById('cfgAnnouncementText').value.trim(),
    announcementActive: document.getElementById('cfgAnnouncementActive').checked,
    heroTag: document.getElementById('cfgHeroTag').value.trim(),
    heroTitle: document.getElementById('cfgHeroTitle').value.trim(),
    heroSubtitle: document.getElementById('cfgHeroSubtitle').value.trim(),
    aboutBranch: document.getElementById('cfgAboutBranch').value.trim(),
    curriculumCredits: document.getElementById('cfgCurriculumCredits').value.trim(),
    curriculumYears: document.getElementById('cfgCurriculumYears').value.trim(),
    instagramUrl: document.getElementById('cfgInstagramUrl').value.trim(),
    instagramHandle: document.getElementById('cfgInstagramHandle').value.trim()
  };

  localStorage.setItem(INDEX_CONFIG_KEY, JSON.stringify(indexConfig));
  showToastNotification("✨ บันทึกการตั้งค่าหน้าหลัก (Index) สำเร็จเรียบร้อย!");
}

function resetDefaultConfig() {
  if (confirm("ต้องการรีเซ็ตค่าทั้งหมดของหน้าหลักกลับเป็นค่าเริ่มต้นหรือไม่?")) {
    indexConfig = { ...DEFAULT_INDEX_CONFIG };
    localStorage.removeItem(INDEX_CONFIG_KEY);
    loadFormValues();
    showToastNotification("🔄 รีเซ็ตค่าเริ่มต้นสำเร็จแล้ว");
  }
}

// ================= 2. PAYMENT CAMPAIGN MANAGEMENT =================
function renderCampaignsList() {
  const container = document.getElementById('campaignsListContainer');
  if (!container) return;

  const campaignsList = getCampaignsList();

  if (campaignsList.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-slate-500 text-xs font-bold">ไม่มีรายการเก็บเงินในขณะนี้ กดปุ่ม "+ เพิ่มรายการชำระเงินใหม่" เพื่อสร้าง</div>`;
    return;
  }

  container.innerHTML = campaignsList.map((camp, idx) => {
    let statusBadge = '';
    let borderClass = '';

    if (camp.status === 'open') {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> เปิดรับชำระปกติ</span>';
      borderClass = 'border-emerald-500/30';
    } else if (camp.status === 'completed') {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span> ชำระครบแล้ว</span>';
      borderClass = 'border-sky-500/30';
    } else if (camp.status === 'temp_closed') {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> ปิดรับชำระชั่วคราว</span>';
      borderClass = 'border-amber-500/30';
    } else {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> ปิดรับชำระถาวร / สิ้นสุด</span>';
      borderClass = 'border-rose-500/30';
    }

    const qrSrc = camp.qrImage || 'qr_payment.png';

    return `
      <div class="p-5 rounded-3xl bg-slate-900/80 border ${borderClass} shadow-md space-y-4 hover:border-orange-500/50 transition">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center flex-shrink-0">
              <img src="${qrSrc}" alt="QR" class="w-full h-full object-contain">
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-orange-400 uppercase tracking-wider">${camp.category || 'กิจกรรม'}</span>
                ${camp.isDefault ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-orange-500/20 text-orange-300">หลัก</span>' : ''}
              </div>
              <h3 class="text-base font-black text-white leading-tight mt-0.5">${camp.title}</h3>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span class="text-slate-500 text-[10px] block">ยอดที่ต้องชำระ:</span>
            <span class="font-black text-orange-400 text-sm">฿${Number(camp.amount).toFixed(2)}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span class="text-slate-500 text-[10px] block">กำหนดปิดรับ:</span>
            <span class="font-bold text-white">${camp.deadlineDisplay || camp.deadline || '-'}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span class="text-slate-500 text-[10px] block">บัญชีรับเงิน:</span>
            <span class="font-semibold text-slate-300 truncate block">${camp.bankName || '-'} ${camp.accountNumber || ''}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span class="text-slate-500 text-[10px] block">ชื่อบัญชี:</span>
            <span class="font-semibold text-slate-300 truncate block">${camp.accountName || '-'}</span>
          </div>
        </div>

        ${camp.closedReason ? `<div class="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs"><strong>เหตุผลที่ปิด:</strong> ${camp.closedReason}</div>` : ''}

        <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div class="flex items-center gap-1.5 flex-wrap">
            <button onclick="setCampaignStatus('${camp.id}', 'open')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${camp.status === 'open' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}">
              เปิดรับชำระ
            </button>
            <button onclick="promptTempClose('${camp.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${camp.status === 'temp_closed' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}">
              ปิดชั่วคราว
            </button>
            <button onclick="promptPermClose('${camp.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${camp.status === 'permanently_closed' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}">
              ปิดถาวร
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <a href="payment.html?camp=${camp.id}" target="_blank" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> ดูหน้าจ่ายเงิน
            </a>
            <button onclick="openEditCampaignModal('${camp.id}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-xl transition flex items-center gap-1">
              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i> แก้ไข
            </button>
            ${!camp.isDefault ? `
              <button onclick="deleteCampaign('${camp.id}')" class="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition border border-rose-500/20">
                ลบ
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setCampaignStatus(id, newStatus, reason = "") {
  if (!window.ComedCampaignManager) return;
  const camp = window.ComedCampaignManager.getCampaignById(id);
  if (!camp) return;

  camp.status = newStatus;
  camp.closedReason = reason;
  window.ComedCampaignManager.updateCampaign(camp);
  renderCampaignsList();
  showToastNotification(`✨ อัปเดตสถานะของ "${camp.title}" เป็น ${newStatus} สำเร็จ!`);
}

function promptTempClose(id) {
  const reason = prompt("ระบุเหตุผลในการปิดรับชำระชั่วคราว (เช่น ปรับปรุงระบบ, รอสรุปยอด):", "ปิดปรับปรุงระบบชั่วคราว");
  if (reason !== null) {
    setCampaignStatus(id, "temp_closed", reason.trim());
  }
}

function promptPermClose(id) {
  if (confirm("ยืนยันที่จะปิดรับชำระรายการนี้อย่างถาวร/สิ้นสุดกำหนดการใช่หรือไม่?")) {
    setCampaignStatus(id, "permanently_closed", "สิ้นสุดระยะเวลาการชำระเงินตามกำหนด");
  }
}

function openAddCampaignModal() {
  document.getElementById('modalCampaignTitle').textContent = "เพิ่มรายการเก็บเงินใหม่";
  document.getElementById('campEditId').value = "";
  document.getElementById('campTitle').value = "";
  document.getElementById('campSubtitle').value = "";
  document.getElementById('campCategory').value = "กิจกรรมชั้นปีที่ 1 (COMED 69)";
  document.getElementById('campAmount').value = "190.00";
  document.getElementById('campDeadline').value = "";
  document.getElementById('campBankName').value = "กสิกรไทย (KPlus)";
  document.getElementById('campAccountNumber').value = "236-2-47817-3";
  document.getElementById('campAccountName').value = "น.ส. พิชามญธุ์ สามสี";

  // Reset QR
  const qrInput = document.getElementById('campQrImage');
  if (qrInput) qrInput.value = "qr_payment.png";
  const qrPreview = document.getElementById('campQrPreview');
  if (qrPreview) qrPreview.src = "qr_payment.png";
  const fileInput = document.getElementById('campQrFileInput');
  if (fileInput) fileInput.value = "";

  const modal = document.getElementById('modalEditCampaign');
  if (modal) modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openEditCampaignModal(id) {
  if (!window.ComedCampaignManager) return;
  const camp = window.ComedCampaignManager.getCampaignById(id);
  if (!camp) return;

  document.getElementById('modalCampaignTitle').textContent = "แก้ไขรายการเก็บเงิน";
  document.getElementById('campEditId').value = camp.id;
  document.getElementById('campTitle').value = camp.title;
  document.getElementById('campSubtitle').value = camp.subtitle || '';
  document.getElementById('campCategory').value = camp.category || '';
  document.getElementById('campAmount').value = camp.amount;
  document.getElementById('campDeadline').value = camp.deadline ? camp.deadline.slice(0, 16) : '';
  document.getElementById('campBankName').value = camp.bankName || '';
  document.getElementById('campAccountNumber').value = camp.accountNumber || '';
  document.getElementById('campAccountName').value = camp.accountName || '';

  const qrSrc = camp.qrImage || 'qr_payment.png';
  const qrInput = document.getElementById('campQrImage');
  if (qrInput) qrInput.value = qrSrc.startsWith('data:') ? '' : qrSrc;
  const qrPreview = document.getElementById('campQrPreview');
  if (qrPreview) qrPreview.src = qrSrc;
  const fileInput = document.getElementById('campQrFileInput');
  if (fileInput) fileInput.value = "";

  const modal = document.getElementById('modalEditCampaign');
  if (modal) modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeCampaignModal() {
  const modal = document.getElementById('modalEditCampaign');
  if (modal) modal.classList.add('hidden');
}

function saveCampaignSubmit(e) {
  e.preventDefault();
  if (!window.ComedCampaignManager) return;

  const editId = document.getElementById('campEditId').value;
  const title = document.getElementById('campTitle').value.trim();
  const subtitle = document.getElementById('campSubtitle').value.trim();
  const category = document.getElementById('campCategory').value.trim();
  const amount = parseFloat(document.getElementById('campAmount').value) || 0;
  const deadline = document.getElementById('campDeadline').value;
  const bankName = document.getElementById('campBankName').value.trim();
  const accountNumber = document.getElementById('campAccountNumber').value.trim();
  const accountName = document.getElementById('campAccountName').value.trim();

  // QR image from input or preview (could be dataUrl from file upload or URL)
  const qrInput = document.getElementById('campQrImage').value.trim();
  const qrPreview = document.getElementById('campQrPreview')?.src || 'qr_payment.png';
  const finalQr = qrInput || qrPreview;

  if (editId) {
    const camp = window.ComedCampaignManager.getCampaignById(editId);
    if (camp) {
      camp.title = title;
      camp.subtitle = subtitle;
      camp.category = category;
      camp.amount = amount;
      camp.deadline = deadline;
      camp.deadlineDisplay = deadline ? new Date(deadline).toLocaleString('th-TH') : '-';
      camp.bankName = bankName;
      camp.accountNumber = accountNumber;
      camp.accountName = accountName;
      camp.qrImage = finalQr;
      window.ComedCampaignManager.updateCampaign(camp);
    }
  } else {
    const newId = "camp_" + Date.now();
    const newCamp = {
      id: newId,
      code: "CAMP_" + Date.now().toString().slice(-4),
      title,
      subtitle,
      category,
      amount,
      currency: "THB",
      deadline,
      deadlineDisplay: deadline ? new Date(deadline).toLocaleString('th-TH') : '-',
      bankName,
      accountNumber,
      accountName,
      qrImage: finalQr,
      status: "open",
      closedReason: "",
      isDefault: false,
      createdAt: new Date().toISOString()
    };
    window.ComedCampaignManager.updateCampaign(newCamp);
  }

  closeCampaignModal();
  renderCampaignsList();
  showToastNotification(`✅ บันทึกรายการชำระเงิน "${title}" สำเร็จเรียบร้อย!`);
}

function deleteCampaign(id) {
  if (!window.ComedCampaignManager) return;
  if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการชำระเงินนี้?")) {
    window.ComedCampaignManager.deleteCampaign(id);
    renderCampaignsList();
    showToastNotification("ลบรายการชำระเงินเรียบร้อยแล้ว");
  }
}

// ================= 3. STUDENTS ROSTER MANAGEMENT =================
function renderStudentsTable() {
  const tbody = document.getElementById('indexStudentsTableBody');
  if (!tbody) return;
  const q = (document.getElementById('searchStudentInput')?.value || '').toLowerCase().trim();

  let list = studentsList;
  if (q) {
    list = list.filter(st => 
      st.id.toLowerCase().includes(q) ||
      st.name.toLowerCase().includes(q) ||
      st.nickname.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q)
    );
  }

  const countEl = document.getElementById('studentsTotalCountBadge');
  if (countEl) countEl.textContent = `${list.length} / ${studentsList.length} คน`;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-500 text-xs font-bold">ไม่พบรายชื่อนักศึกษาที่ค้นหา</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((st, idx) => `
    <tr class="hover:bg-slate-800/40 transition border-b border-slate-800/50">
      <td class="p-3.5 text-center text-slate-500 font-mono text-xs">${idx + 1}</td>
      <td class="p-3.5 font-mono font-bold text-orange-400 text-xs">${st.id}</td>
      <td class="p-3.5 font-bold text-white text-xs">${st.name}</td>
      <td class="p-3.5">
        <span class="px-2.5 py-0.5 rounded-lg bg-orange-500/10 text-orange-300 font-bold text-xs border border-orange-500/20">
          น้อง${st.nickname}
        </span>
      </td>
      <td class="p-3.5 font-mono text-slate-400 text-xs">${st.email}</td>
      <td class="p-3.5 text-center">
        <button onclick="openEditStudentModal('${st.id}')" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> แก้ไข
        </button>
      </td>
    </tr>
  `).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

let editingStudentId = null;

function openEditStudentModal(id) {
  const st = studentsList.find(s => s.id === id);
  if (!st) return;
  editingStudentId = id;

  document.getElementById('editStudentId').value = st.id;
  document.getElementById('editStudentName').value = st.name;
  document.getElementById('editStudentNickname').value = st.nickname;
  document.getElementById('editStudentEmail').value = st.email;

  const modal = document.getElementById('modalEditStudent');
  if (modal) modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeEditStudentModal() {
  const modal = document.getElementById('modalEditStudent');
  if (modal) modal.classList.add('hidden');
}

function saveStudentChanges(e) {
  e.preventDefault();
  if (!editingStudentId) return;

  const st = studentsList.find(s => s.id === editingStudentId);
  if (st) {
    st.name = document.getElementById('editStudentName').value.trim();
    st.nickname = document.getElementById('editStudentNickname').value.trim();
    st.email = document.getElementById('editStudentEmail').value.trim();
    
    localStorage.setItem('COMED_CUSTOM_STUDENTS_DATA', JSON.stringify(studentsList));
    closeEditStudentModal();
    renderStudentsTable();
    showToastNotification(`✅ อัปเดตข้อมูลของน้อง "${st.name}" เรียบร้อยแล้ว`);
  }
}

function showToastNotification(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2.5 backdrop-blur-xl';
  toast.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 text-white"></i><span>${msg}</span>`;
  document.body.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  if (typeof gsap !== 'undefined') {
    gsap.fromTo(toast, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.5)" });
    setTimeout(() => {
      gsap.to(toast, { opacity: 0, y: 20, scale: 0.9, duration: 0.3, onComplete: () => toast.remove() });
    }, 2800);
  } else {
    setTimeout(() => toast.remove(), 2800);
  }
}
