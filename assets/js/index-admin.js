/**
 * =========================================================================
 * INDEX PORTAL ADMIN LOGIC - assets/js/index-admin.js
 * COMED KKU 69 INDEX CMS & CONTENT CONTROLLER
 * =========================================================================
 */

const ADMIN_SESSION_KEY = 'COMED_KKU69_ADMIN_LOGGED_USER';
const INDEX_CONFIG_KEY = 'COMED_KKU69_INDEX_CONFIG_V1';

const DEFAULT_INDEX_CONFIG = {
  announcementText: "📢 ขอความร่วมมือเพื่อนๆ นักศึกษาชั้นปีที่ 1 ชำระค่าทำป้ายสาขาวิชาเอก คนละ ฿190.00 ภายในวันที่ 4 ก.ย. 69",
  announcementActive: true,
  heroTag: "สาขาวิชาคอมพิวเตอร์ศึกษา รุ่นที่ 69",
  heroTitle: "ระบบสารสนเทศ & จัดการข้อมูลรุ่น",
  heroSubtitle: "คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น (Computer Education KKU)",
  bannerImage: "logo.png",
  aboutBranch: "สาขาวิชาคอมพิวเตอร์ศึกษา คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น มุ่งเน้นผลิตบัณฑิตครูและนักเทคโนโลยีการศึกษาที่มีความรู้ความเชี่ยวชาญด้านวิทยาการคอมพิวเตอร์ นวัตกรรมดิจิทัล และศาสตร์การสอนสมัยใหม่ เพื่อพัฒนาการศึกษาของประเทศอย่างยั่งยืน",
  curriculumCredits: "128 หน่วยกิต",
  curriculumYears: "หลักสูตร 4 ปี (วท.บ. / ค.บ.)",
  instagramUrl: "https://www.instagram.com/thitiphaua/",
  instagramHandle: "thitiphaua"
};

let indexConfig = DEFAULT_INDEX_CONFIG;
try {
  const stored = localStorage.getItem(INDEX_CONFIG_KEY);
  indexConfig = stored ? { ...DEFAULT_INDEX_CONFIG, ...JSON.parse(stored) } : DEFAULT_INDEX_CONFIG;
} catch (e) {
  indexConfig = DEFAULT_INDEX_CONFIG;
}

let studentsList = [];
try {
  studentsList = (window.STUDENTS_DATA && window.STUDENTS_DATA.length > 0) ? [...window.STUDENTS_DATA] : [];
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

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAdminAuth()) return;
  loadFormValues();
  renderStudentsTable();
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

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

// Students Roster Management
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
    
    // Save to custom session cache
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
