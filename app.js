/**
 * منصة إدارة المعرفة التفاعلية - ملف المنطق البرمجي الرئيسي (app.js)
 * إدارة الحالات، الحفظ التلقائي، التحقق الذكي، التصدير، ولوحة التحكم
 * دعم الاتصال بـ Supabase والتشغيل الهجين (سحابي / محلي)
 */

// تهيئة التخزين المحلي في حال عدم وجوده
if (!localStorage.getItem('km_submissions')) {
    localStorage.setItem('km_submissions', JSON.stringify([]));
}
if (!localStorage.getItem('km_drafts')) {
    localStorage.setItem('km_drafts', JSON.stringify({}));
}

// الكائنات وقواميس البيانات الوصفية
const FORM_NAMES = {
    'form1': 'نموذج حصر المعرفة والعمليات الحرجة',
    'form2': 'قالب توثيق المعرفة / الإجراءات التشغيلية',
    'form3': 'بطاقة تقييم جودة المعرفة',
    'form4': 'نموذج حصر الدروس المستفادة والتوصيات',
    'form5': 'خطة مشروع توثيق المعرفة الاستراتيجية'
};

const RISK_LEVELS = {
    'very_high': 'عالي جداً',
    'medium': 'متوسط',
    'low': 'منخفض'
};

const DOC_STATUSES = {
    'undocumented': 'غير موثقة',
    'partially_documented': 'موثقة جزئياً',
    'documented_approved': 'موثقة ومعتمدة'
};

const KNOWLEDGE_TYPES = {
    'implicit': 'ضمنية (في أذهان الموظفين)',
    'explicit': 'صريحة (موثقة في ملفات)'
};

const DECISIONS = {
    'approved_publish': 'معتمد للنشر',
    'approved_conditions': 'مقبول بشروط',
    'rejected': 'مرفوض'
};

const CLOSURE_STATUSES = {
    'saved_repository': 'تم حفظ الدرس في المستودع المعرفي',
    'under_followup': 'قيد المتابعة'
};

const PROJECT_STATUSES = {
    'green': 'أخضر (على المسار)',
    'yellow': 'أصفر (يوجد تأخير طفيف)',
    'red': 'أحمر (متوقف / يحتاج تدخل)'
};

// تعريف الحقول لكل نموذج لأغراض شريط التقدم والتحقق الذكي
const FORM_FIELDS_CONFIG = {
    'form1': [
        { id: 'f1_dept', required: true, type: 'text' },
        { id: 'f1_process', required: true, type: 'text' },
        { id: 'f1_know_type', required: true, type: 'radio' },
        { id: 'f1_expert_name', required: true, type: 'text' },
        { id: 'f1_expert_job', required: true, type: 'text' },
        { id: 'f1_storage', required: true, type: 'text' },
        { id: 'f1_risk', required: true, type: 'radio' },
        { id: 'f1_doc_status', required: true, type: 'radio' }
    ],
    'form2': [
        { id: 'f2_title', required: true, type: 'text' },
        { id: 'f2_code', required: true, type: 'text' },
        { id: 'f2_dept', required: true, type: 'text' },
        { id: 'f2_expert_name', required: true, type: 'text' },
        { id: 'f2_expert_sig', required: true, type: 'text' },
        { id: 'f2_expert_date', required: true, type: 'date' },
        { id: 'f2_goal', required: true, type: 'textarea' },
        { id: 'f2_scope', required: true, type: 'textarea' },
        { id: 'f2_inputs', required: true, type: 'textarea' },
        { id: 'f2_tools', required: true, type: 'textarea' },
        { id: 'f2_tips', required: true, type: 'textarea' },
        { id: 'f2_review_date', required: true, type: 'date' }
    ],
    'form3': [
        { id: 'f3_asset', required: true, type: 'text' },
        { id: 'f3_assessor', required: true, type: 'text' },
        { id: 'f3_date', required: true, type: 'date' },
        { id: 'f3_acc', required: true, type: 'rating' },
        { id: 'f3_comp', required: true, type: 'rating' },
        { id: 'f3_clarity', required: true, type: 'rating' },
        { id: 'f3_recency', required: true, type: 'rating' },
        { id: 'f3_access', required: true, type: 'rating' }
    ],
    'form4': [
        { id: 'f4_name', required: true, type: 'text' },
        { id: 'f4_close_date', required: true, type: 'date' },
        { id: 'f4_leader', required: true, type: 'text' },
        { id: 'f4_planned', required: true, type: 'textarea' },
        { id: 'f4_actual', required: true, type: 'textarea' },
        { id: 'f4_reason', required: true, type: 'textarea' },
        { id: 'f4_lesson', required: true, type: 'textarea' },
        { id: 'f4_rec', required: true, type: 'textarea' },
        { id: 'f4_owner', required: true, type: 'text' },
        { id: 'f4_status', required: true, type: 'radio' }
    ],
    'form5': [
        { id: 'f5_name', required: true, type: 'text' },
        { id: 'f5_manager', required: true, type: 'text' },
        { id: 'f5_start', required: true, type: 'date' },
        { id: 'f5_end', required: true, type: 'date' },
        { id: 'f5_goals', required: true, type: 'textarea' },
        { id: 'f5_date_analysis', required: true, type: 'date' },
        { id: 'f5_date_dev', required: true, type: 'date' },
        { id: 'f5_date_test', required: true, type: 'date' },
        { id: 'f5_date_launch', required: true, type: 'date' },
        { id: 'f5_resources', required: true, type: 'textarea' },
        { id: 'f5_risks', required: true, type: 'textarea' },
        { id: 'f5_progress', required: true, type: 'number' },
        { id: 'f5_status', required: true, type: 'radio' }
    ]
};

// المتغيرات العامة لحالة التطبيق الحالي
let currentActiveForm = 'form1';
let ratingValues = { f3_acc: 0, f3_comp: 0, f3_clarity: 0, f3_recency: 0, f3_access: 0 };
let form2StepsList = [""]; // مصفوفة الخطوات الاجرائية للنموذج 2
let supabaseClient = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupNavigation();
    setupFormSelector();
    setupFormListeners();
    setupRatingListeners();
    setupStepsManager();
    loadActiveFormDraft();
    updateProgress(currentActiveForm);
    
    // محاولة ربط قاعدة بيانات Supabase
    tryConnectSupabase();
    
    await renderAdminSubmissions();
    setupAdminControls();
}

// 1. نظام الاتصال السحابي بـ Supabase مع الفولباك المحلي
function tryConnectSupabase() {
    // 1. جلب المفاتيح من localStorage أولاً
    let url = localStorage.getItem('sb_url');
    let key = localStorage.getItem('sb_key');
    
    // 2. الفولباك إلى ملف config.js
    if ((!url || !key) && window.SUPABASE_CONFIG) {
        url = window.SUPABASE_CONFIG.url;
        key = window.SUPABASE_CONFIG.anonKey;
    }
    
    // تعبئة حقول الإعدادات في لوحة الإدارة إذا كانت موجودة
    const urlInput = document.getElementById('settings_sb_url');
    const keyInput = document.getElementById('settings_sb_key');
    if (urlInput && url) urlInput.value = url;
    if (keyInput && key) keyInput.value = key;
    
    if (url && key && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(url, key);
            updateSupabaseBadge(true);
            return true;
        } catch (e) {
            console.error("Supabase connection failed:", e);
            updateSupabaseBadge(false, "خطأ في المفاتيح");
            supabaseClient = null;
            return false;
        }
    } else {
        updateSupabaseBadge(false, "تشغيل محلي (LocalStorage)");
        supabaseClient = null;
        return false;
    }
}

async function testAndSaveSupabaseConnection() {
    const url = document.getElementById('settings_sb_url').value.trim();
    const key = document.getElementById('settings_sb_key').value.trim();
    
    if (!url || !key) {
        showToast("يرجى إدخال الرابط والمفتاح العام", "danger");
        return;
    }
    
    if (!window.supabase) {
        showToast("لم يتم تحميل مكتبة Supabase بنجاح، يرجى فحص الاتصال بالإنترنت", "danger");
        return;
    }
    
    showToast("جاري فحص الاتصال بـ Supabase...", "info");
    
    try {
        const client = window.supabase.createClient(url, key);
        // اختبار الاتصال بعملية جلب تجريبية
        const { error } = await client.from('submissions').select('id').limit(1);
        if (error) throw error;
        
        // حفظ المفاتيح
        localStorage.setItem('sb_url', url);
        localStorage.setItem('sb_key', key);
        supabaseClient = client;
        
        updateSupabaseBadge(true);
        showToast("تم التوصيل بقاعدة بيانات Supabase بنجاح وحفظ الإعدادات سحابياً!", "success");
        await renderAdminSubmissions();
    } catch (err) {
        console.error("Supabase test failed:", err);
        showToast("فشل الاتصال: تأكد من صحة الرابط والمفتاح وتأسيس الجداول باستخدام ملف database.sql", "danger");
    }
}

function disconnectSupabase() {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    
    const urlInput = document.getElementById('settings_sb_url');
    const keyInput = document.getElementById('settings_sb_key');
    if (urlInput) urlInput.value = '';
    if (keyInput) keyInput.value = '';
    
    supabaseClient = null;
    updateSupabaseBadge(false, "تشغيل محلي (LocalStorage)");
    showToast("تم قطع الاتصال والعودة للتشغيل المحلي", "info");
    renderAdminSubmissions();
}

function updateSupabaseBadge(connected, statusText = "") {
    const badge = document.getElementById('supabase-status-badge');
    if (!badge) return;
    if (connected) {
        badge.style.backgroundColor = '#d1fae5';
        badge.style.color = 'var(--success)';
        badge.style.border = '1px solid #a7f3d0';
        badge.textContent = "متصل سحابياً (Supabase) 🟢";
    } else {
        badge.style.backgroundColor = '#fee2e2';
        badge.style.color = 'var(--danger)';
        badge.style.border = '1px solid #fca5a5';
        badge.textContent = `${statusText} 🟡`;
    }
}

// 2. نظام التنقل والتبويبات الرئيسية
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu .nav-item a');
    const pages = document.querySelectorAll('.app-page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-target');
            
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
            
            pages.forEach(p => {
                p.classList.remove('active');
                if (p.id === targetPage) {
                    p.classList.add('active');
                }
            });

            // إذا دخلنا صفحة الإدارة، نقوم بتحديث الجدول
            if (targetPage === 'admin-page') {
                await renderAdminSubmissions();
            }
        });
    });
}

// 3. التنقل بين النماذج المختلفة في صفحة التعبئة
function setupFormSelector() {
    const selectorBtns = document.querySelectorAll('.form-selector-bar .selector-btn');
    const formWorkspaces = document.querySelectorAll('.form-workspace');
    
    selectorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetForm = btn.getAttribute('data-form');
            currentActiveForm = targetForm;
            
            selectorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            formWorkspaces.forEach(w => {
                w.classList.remove('active');
                if (w.id === `${targetForm}-workspace`) {
                    w.classList.add('active');
                }
            });

            loadActiveFormDraft();
            updateProgress(currentActiveForm);
        });
    });
}

// 4. إدارة التبويبات الداخلية المخصصة للأقسام في كل نموذج
function switchInnerTab(formId, tabIndex) {
    const tabs = document.querySelectorAll(`#${formId}-workspace .form-tab-btn`);
    const sections = document.querySelectorAll(`#${formId}-workspace .form-section-content`);
    
    tabs.forEach((tab, index) => {
        tab.classList.remove('active');
        if (index === tabIndex) tab.classList.add('active');
    });
    
    sections.forEach((sec, index) => {
        sec.classList.remove('active');
        if (index === tabIndex) sec.classList.add('active');
    });
}

// 5. إعداد مستمعي التغييرات لحفظ المسودات وحساب التقدم تلقائياً
function setupFormListeners() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            saveCurrentDraft();
            updateProgress(currentActiveForm);
            validateField(input);
        });
        
        input.addEventListener('change', () => {
            saveCurrentDraft();
            updateProgress(currentActiveForm);
            validateField(input);
        });
    });

    // مستمع إضافي لتواريخ نموذج 5 للتحقق المنطقي
    const f5Start = document.getElementById('f5_start');
    const f5End = document.getElementById('f5_end');
    if (f5Start && f5End) {
        [f5Start, f5End].forEach(el => {
            el.addEventListener('change', () => {
                if (f5Start.value && f5End.value) {
                    const startDate = new Date(f5Start.value);
                    const endDate = new Date(f5End.value);
                    const group = f5End.closest('.form-group');
                    if (endDate < startDate) {
                        group.classList.add('has-error');
                        group.querySelector('.error-msg').textContent = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء المتوقع';
                    } else {
                        group.classList.remove('has-error');
                    }
                }
            });
        });
    }

    // مستمع لتاريخ مراجعة نموذج 2 ليكون مستقبلاً
    const f2Review = document.getElementById('f2_review_date');
    if (f2Review) {
        f2Review.addEventListener('change', () => {
            if (f2Review.value) {
                const selectedDate = new Date(f2Review.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const group = f2Review.closest('.form-group');
                if (selectedDate <= today) {
                    group.classList.add('has-error');
                    group.querySelector('.error-msg').textContent = 'تاريخ المراجعة يجب أن يكون في المستقبل';
                } else {
                    group.classList.remove('has-error');
                }
            }
        });
    }
}

// 6. التقييم بالنجوم الذكي للنموذج 3 وحساب النتائج تلقائياً
function setupRatingListeners() {
    const ratingGroups = document.querySelectorAll('.rating-options');
    ratingGroups.forEach(group => {
        const btns = group.querySelectorAll('.rating-btn');
        const fieldName = group.getAttribute('data-field');
        
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = parseInt(btn.getAttribute('data-value'), 10);
                ratingValues[fieldName] = val;
                
                btns.forEach(b => b.classList.remove('selected'));
                for (let i = 0; i < val; i++) {
                    btns[i].classList.add('selected');
                }
                
                calculateForm3Result();
                saveCurrentDraft();
                updateProgress('form3');
            });
        });
    });
}

function calculateForm3Result() {
    let sum = 0;
    let answered = 0;
    
    for (const key in ratingValues) {
        sum += ratingValues[key];
        if (ratingValues[key] > 0) answered++;
    }
    
    const totalScoreEl = document.getElementById('f3_total_score_display');
    const decisionEl = document.getElementById('f3_decision_display');
    
    if (totalScoreEl) totalScoreEl.value = answered === 5 ? sum : '';
    
    if (decisionEl && answered === 5) {
        let dec = '';
        if (sum >= 19) dec = 'approved_publish';
        else if (sum >= 13) dec = 'approved_conditions';
        else dec = 'rejected';
        
        decisionEl.value = dec;
        
        decisionEl.className = 'badge-status';
        if (dec === 'approved_publish') {
            decisionEl.style.backgroundColor = '#d1fae5';
            decisionEl.style.color = 'var(--success)';
            decisionEl.textContent = DECISIONS.approved_publish;
        } else if (dec === 'approved_conditions') {
            decisionEl.style.backgroundColor = '#fef3c7';
            decisionEl.style.color = 'var(--warning)';
            decisionEl.textContent = DECISIONS.approved_conditions;
        } else {
            decisionEl.style.backgroundColor = '#fee2e2';
            decisionEl.style.color = 'var(--danger)';
            decisionEl.textContent = DECISIONS.rejected;
        }
    } else if (decisionEl) {
        decisionEl.value = '';
        decisionEl.textContent = 'بانتظار اكتمال التقييم';
        decisionEl.style.backgroundColor = '#e2e8f0';
        decisionEl.style.color = 'var(--text-muted)';
    }
}

// 7. إدارة قائمة الخطوات الإجرائية الديناميكية للنموذج 2
function setupStepsManager() {
    const container = document.getElementById('f2_steps_container');
    const addBtn = document.getElementById('f2_add_step_btn');
    
    if (!container || !addBtn) return;
    
    addBtn.addEventListener('click', () => {
        form2StepsList.push("");
        renderForm2Steps();
        saveCurrentDraft();
        updateProgress('form2');
    });
}

function renderForm2Steps() {
    const container = document.getElementById('f2_steps_container');
    if (!container) return;
    
    container.innerHTML = "";
    form2StepsList.forEach((stepText, index) => {
        const item = document.createElement('div');
        item.className = 'dynamic-list-item';
        item.innerHTML = `
            <span class="step-num-badge">${index + 1}</span>
            <div class="form-group" style="flex-grow: 1;">
                <textarea class="step-textarea" data-index="${index}" rows="2" placeholder="أدخل تفاصيل الخطوة الإجرائية...">${stepText}</textarea>
            </div>
            ${index > 0 ? `<button type="button" class="btn btn-danger btn-remove-step" data-index="${index}" style="margin-top: 8px;">حذف</button>` : ''}
        `;
        container.appendChild(item);
    });
    
    container.querySelectorAll('.step-textarea').forEach(tx => {
        tx.addEventListener('input', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'), 10);
            form2StepsList[idx] = e.target.value;
            saveCurrentDraft();
        });
    });
    
    container.querySelectorAll('.btn-remove-step').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-index'), 10);
            form2StepsList.splice(idx, 1);
            renderForm2Steps();
            saveCurrentDraft();
            updateProgress('form2');
        });
    });
}

// 8. التحقق الذكي من صحة البيانات للحقل المحدد
function validateField(input) {
    const name = input.name || input.id;
    const type = input.type;
    const value = input.value.trim();
    const group = input.closest('.form-group');
    
    if (!group) return true;
    
    const isRequired = input.hasAttribute('required');
    if (isRequired && !value) {
        group.classList.add('has-error');
        const errSpan = group.querySelector('.error-msg');
        if (errSpan) errSpan.textContent = 'هذا الحقل مطلوب ولا يمكن تركه فارغاً';
        return false;
    }
    
    if (type === 'number') {
        const val = parseFloat(value);
        const min = input.hasAttribute('min') ? parseFloat(input.getAttribute('min')) : -Infinity;
        const max = input.hasAttribute('max') ? parseFloat(input.getAttribute('max')) : Infinity;
        if (isNaN(val) || val < min || val > max) {
            group.classList.add('has-error');
            const errSpan = group.querySelector('.error-msg');
            if (errSpan) errSpan.textContent = `القيمة يجب أن تكون رقماً بين ${min} و ${max}`;
            return false;
        }
    }
    
    if (type === 'date' && isRequired) {
        if (!value || isNaN(Date.parse(value))) {
            group.classList.add('has-error');
            return false;
        }
    }

    group.classList.remove('has-error');
    return true;
}

// 9. حساب نسبة التقدم في ملء الحقول وتحديث شريط الإنجاز
function updateProgress(formId) {
    const config = FORM_FIELDS_CONFIG[formId];
    if (!config) return;
    
    let totalFields = config.length;
    let filledFields = 0;
    
    config.forEach(field => {
        if (field.type === 'radio') {
            const selected = document.querySelector(`input[name="${field.id}"]:checked`);
            if (selected) filledFields++;
        } else if (field.type === 'rating') {
            if (ratingValues[field.id] > 0) filledFields++;
        } else {
            const input = document.getElementById(field.id);
            if (input && input.value.trim() !== '') {
                filledFields++;
            }
        }
    });

    if (formId === 'form2') {
        totalFields += 1;
        const hasStepText = form2StepsList.some(s => s.trim() !== '');
        if (hasStepText) filledFields++;
    }
    
    const percentage = Math.round((filledFields / totalFields) * 100);
    
    const bar = document.getElementById(`${formId}-progress-bar`);
    const label = document.getElementById(`${formId}-progress-percent`);
    
    if (bar) bar.style.width = `${percentage}%`;
    if (label) label.textContent = `${percentage}%`;
}

// 10. الحفظ المؤقت (Drafts) واستعادتها من localStorage
function saveCurrentDraft() {
    const drafts = JSON.parse(localStorage.getItem('km_drafts'));
    const formData = {};
    
    const config = FORM_FIELDS_CONFIG[currentActiveForm];
    if (!config) return;
    
    config.forEach(field => {
        if (field.type === 'radio') {
            const selected = document.querySelector(`input[name="${field.id}"]:checked`);
            formData[field.id] = selected ? selected.value : '';
        } else if (field.type === 'rating') {
            formData[field.id] = ratingValues[field.id] || 0;
        } else {
            const input = document.getElementById(field.id);
            if (input) formData[field.id] = input.value;
        }
    });

    if (currentActiveForm === 'form2') {
        formData['f2_steps'] = form2StepsList;
    }
    
    if (currentActiveForm === 'form1') {
        formData['f1_notes'] = document.getElementById('f1_notes')?.value || '';
    }
    
    if (currentActiveForm === 'form3') {
        formData['f3_notes'] = document.getElementById('f3_notes')?.value || '';
    }
    
    drafts[currentActiveForm] = formData;
    localStorage.setItem('km_drafts', JSON.stringify(drafts));
}

function loadActiveFormDraft() {
    const drafts = JSON.parse(localStorage.getItem('km_drafts'));
    const draft = drafts[currentActiveForm];
    
    resetFormInputs(currentActiveForm);
    
    if (!draft) {
        if (currentActiveForm === 'form2') {
            form2StepsList = [""];
            renderForm2Steps();
        }
        return;
    }
    
    const config = FORM_FIELDS_CONFIG[currentActiveForm];
    config.forEach(field => {
        const val = draft[field.id];
        if (val === undefined || val === null) return;
        
        if (field.type === 'radio') {
            const radio = document.querySelector(`input[name="${field.id}"][value="${val}"]`);
            if (radio) radio.checked = true;
        } else if (field.type === 'rating') {
            ratingValues[field.id] = val;
            const btns = document.querySelectorAll(`.rating-options[data-field="${field.id}"] .rating-btn`);
            btns.forEach(b => b.classList.remove('selected'));
            for (let i = 0; i < val; i++) {
                if (btns[i]) btns[i].classList.add('selected');
            }
        } else {
            const input = document.getElementById(field.id);
            if (input) input.value = val;
        }
    });

    if (currentActiveForm === 'form2') {
        form2StepsList = draft['f2_steps'] || [""];
        renderForm2Steps();
    }
    
    if (currentActiveForm === 'form1') {
        const notes = document.getElementById('f1_notes');
        if (notes) notes.value = draft['f1_notes'] || '';
    }
    
    if (currentActiveForm === 'form3') {
        const notes = document.getElementById('f3_notes');
        if (notes) notes.value = draft['f3_notes'] || '';
        calculateForm3Result();
    }
    
    showToast('تمت استعادة المسودة المحفوظة مؤقتاً', 'info');
}

function resetFormInputs(formId) {
    const config = FORM_FIELDS_CONFIG[formId];
    if (!config) return;
    
    config.forEach(field => {
        if (field.type === 'radio') {
            const radios = document.querySelectorAll(`input[name="${field.id}"]`);
            radios.forEach(r => r.checked = false);
        } else if (field.type === 'rating') {
            ratingValues[field.id] = 0;
            const btns = document.querySelectorAll(`.rating-options[data-field="${field.id}"] .rating-btn`);
            btns.forEach(b => b.classList.remove('selected'));
        } else {
            const input = document.getElementById(field.id);
            if (input) input.value = '';
        }
    });

    if (formId === 'form2') {
        form2StepsList = [""];
        renderForm2Steps();
    }
    
    if (formId === 'form1') {
        const notes = document.getElementById('f1_notes');
        if (notes) notes.value = '';
    }
    
    if (formId === 'form3') {
        const notes = document.getElementById('f3_notes');
        if (notes) notes.value = '';
        calculateForm3Result();
    }

    const groups = document.querySelectorAll(`#${formId}-workspace .form-group`);
    groups.forEach(g => g.classList.remove('has-error'));
}

function resetActiveForm() {
    if (confirm('هل أنت متأكد من رغبتك في حذف المسودة والبدء من جديد؟')) {
        const drafts = JSON.parse(localStorage.getItem('km_drafts'));
        delete drafts[currentActiveForm];
        localStorage.setItem('km_drafts', JSON.stringify(drafts));
        
        resetFormInputs(currentActiveForm);
        updateProgress(currentActiveForm);
        showToast('تم إفراغ النموذج والمسودة بنجاح', 'success');
    }
}

// 11. لوحة المراجعة النهائية قبل الإرسال (Final Review)
function openReviewPanel() {
    const config = FORM_FIELDS_CONFIG[currentActiveForm];
    let isAllValid = true;
    
    config.forEach(field => {
        if (field.type === 'radio') {
            const checked = document.querySelector(`input[name="${field.id}"]:checked`);
            const group = document.querySelector(`input[name="${field.id}"]`).closest('.form-group');
            if (field.required && !checked) {
                isAllValid = false;
                if (group) group.classList.add('has-error');
            } else if (group) {
                group.classList.remove('has-error');
            }
        } else if (field.type === 'rating') {
            const group = document.querySelector(`.rating-options[data-field="${field.id}"]`).closest('.form-group');
            if (ratingValues[field.id] === 0) {
                isAllValid = false;
                if (group) group.classList.add('has-error');
            } else if (group) {
                group.classList.remove('has-error');
            }
        } else {
            const input = document.getElementById(field.id);
            if (input) {
                const isValid = validateField(input);
                if (!isValid) isAllValid = false;
            }
        }
    });

    if (currentActiveForm === 'form5') {
        const f5Start = document.getElementById('f5_start');
        const f5End = document.getElementById('f5_end');
        if (f5Start && f5End && f5Start.value && f5End.value) {
            if (new Date(f5End.value) < new Date(f5Start.value)) {
                isAllValid = false;
            }
        }
    }

    if (currentActiveForm === 'form2') {
        const f2Review = document.getElementById('f2_review_date');
        if (f2Review && f2Review.value && new Date(f2Review.value) <= new Date()) {
            isAllValid = false;
        }
    }

    if (!isAllValid) {
        showToast('يرجى تصحيح الأخطاء وتعبئة جميع الحقول المطلوبة باللون الأحمر أولاً', 'danger');
        return;
    }
    
    const container = document.getElementById('review_modal_body');
    if (!container) return;
    
    container.innerHTML = "";
    const reviewGrid = document.createElement('div');
    reviewGrid.className = 'review-grid';
    
    config.forEach(field => {
        const labelText = document.querySelector(`label[for="${field.id}"]`)?.textContent.replace('*', '').trim() || 
                          document.querySelector(`.form-group:has([name="${field.id}"]) label`)?.textContent.replace('*', '').trim() ||
                          document.querySelector(`.form-group:has(.rating-options[data-field="${field.id}"]) label`)?.textContent.replace('*', '').trim() ||
                          field.id;
                          
        let valueText = "";
        
        if (field.type === 'radio') {
            const radioVal = document.querySelector(`input[name="${field.id}"]:checked`)?.value;
            if (field.id === 'f1_know_type') valueText = KNOWLEDGE_TYPES[radioVal] || '';
            else if (field.id === 'f1_risk') valueText = RISK_LEVELS[radioVal] || '';
            else if (field.id === 'f1_doc_status') valueText = DOC_STATUSES[radioVal] || '';
            else if (field.id === 'f4_status') valueText = CLOSURE_STATUSES[radioVal] || '';
            else if (field.id === 'f5_status') valueText = PROJECT_STATUSES[radioVal] || '';
            else valueText = radioVal || '';
        } else if (field.type === 'rating') {
            valueText = `${ratingValues[field.id]} نجوم`;
        } else {
            valueText = document.getElementById(field.id)?.value || '';
        }
        
        const item = document.createElement('div');
        item.className = 'review-field';
        item.innerHTML = `
            <div class="review-label">${labelText}</div>
            <div class="review-value">${valueText || '<span class="empty">لا يوجد</span>'}</div>
        `;
        reviewGrid.appendChild(item);
    });

    if (currentActiveForm === 'form2') {
        const stepsItem = document.createElement('div');
        stepsItem.className = 'review-field';
        stepsItem.style.gridColumn = 'span 2';
        
        let stepsHtml = "<ol style='padding-right: 20px; margin-top: 8px;'>";
        form2StepsList.forEach(st => {
            if (st.trim() !== '') stepsHtml += `<li>${st}</li>`;
        });
        stepsHtml += "</ol>";
        
        stepsItem.innerHTML = `
            <div class="review-label">الخطوات الإجرائية</div>
            <div class="review-value">${stepsHtml}</div>
        `;
        reviewGrid.appendChild(stepsItem);
    }
    
    if (currentActiveForm === 'form3') {
        const total = document.getElementById('f3_total_score_display').value;
        const decVal = document.getElementById('f3_decision_display').value;
        const notes = document.getElementById('f3_notes').value;
        
        const decisionText = DECISIONS[decVal] || 'بانتظار الاكتمال';
        
        const extraGrid = document.createElement('div');
        extraGrid.className = 'review-grid';
        extraGrid.style.gridColumn = 'span 2';
        extraGrid.innerHTML = `
            <div class="review-field">
                <div class="review-label">مجموع الدرجات (من 25)</div>
                <div class="review-value">${total}</div>
            </div>
            <div class="review-field">
                <div class="review-label">قرار الاعتماد</div>
                <div class="review-value">${decisionText}</div>
            </div>
            <div class="review-field" style="grid-column: span 2;">
                <div class="review-label">ملاحظات المقيم</div>
                <div class="review-value">${notes || '<span class="empty">لا توجد ملاحظات</span>'}</div>
            </div>
        `;
        reviewGrid.appendChild(extraGrid);
    }

    if (currentActiveForm === 'form1') {
        const notes = document.getElementById('f1_notes').value;
        const notesItem = document.createElement('div');
        notesItem.className = 'review-field';
        notesItem.style.gridColumn = 'span 2';
        notesItem.innerHTML = `
            <div class="review-label">ملاحظات فريق الحصر</div>
            <div class="review-value">${notes || '<span class="empty">لا توجد ملاحظات</span>'}</div>
        `;
        reviewGrid.appendChild(notesItem);
    }

    container.appendChild(reviewGrid);
    document.getElementById('review-modal').classList.add('active');
}

function closeReviewModal() {
    document.getElementById('review-modal').classList.remove('active');
}

// 12. إرسال البيانات الفعلي وتخزينها في قاعدة البيانات (سحابياً بـ Supabase أو محلياً)
async function submitActiveForm() {
    const id = 'KM-' + Math.floor(100000 + Math.random() * 900000);
    
    // إرسال البيانات سحابياً إذا كان العميل متصلاً
    if (supabaseClient) {
        showToast("جاري حفظ الطلب سحابياً في Supabase...", "info");
        try {
            // 1. إضافة المعرف وجدول التقديم الأساسي
            const { error: masterErr } = await supabaseClient.from('submissions').insert({
                id: id,
                form_type: currentActiveForm,
                status: 'submitted'
            });
            if (masterErr) throw masterErr;
            
            // 2. تعبئة تفاصيل الجدول الخاص بالنموذج
            if (currentActiveForm === 'form1') {
                const detail = {
                    id: id,
                    department_name: document.getElementById('f1_dept').value,
                    process_name: document.getElementById('f1_process').value,
                    knowledge_type: document.querySelector(`input[name="f1_know_type"]:checked`).value,
                    knowledge_owner_name: document.getElementById('f1_expert_name').value,
                    knowledge_owner_job: document.getElementById('f1_expert_job').value,
                    storage_location: document.getElementById('f1_storage').value,
                    risk_level: document.querySelector(`input[name="f1_risk"]:checked`).value,
                    documentation_status: document.querySelector(`input[name="f1_doc_status"]:checked`).value,
                    team_notes: document.getElementById('f1_notes').value
                };
                const { error } = await supabaseClient.from('form1_critical_processes').insert(detail);
                if (error) throw error;
            } 
            else if (currentActiveForm === 'form2') {
                const detail = {
                    id: id,
                    knowledge_title: document.getElementById('f2_title').value,
                    reference_code: document.getElementById('f2_code').value,
                    owning_department: document.getElementById('f2_dept').value,
                    expert_name: document.getElementById('f2_expert_name').value,
                    expert_signature: document.getElementById('f2_expert_sig').value,
                    expert_date: document.getElementById('f2_expert_date').value,
                    objective: document.getElementById('f2_goal').value,
                    application_scope: document.getElementById('f2_scope').value,
                    input_requirements: document.getElementById('f2_inputs').value,
                    associated_tools: document.getElementById('f2_tools').value,
                    expert_tips: document.getElementById('f2_tips').value,
                    next_review_date: document.getElementById('f2_review_date').value
                };
                const { error } = await supabaseClient.from('form2_knowledge_documentation').insert(detail);
                if (error) throw error;
                
                // حفظ الخطوات الإجرائية في الجدول الفرعي
                const stepsRecords = form2StepsList
                    .filter(s => s.trim() !== '')
                    .map((step, idx) => ({
                        form2_id: id,
                        step_number: idx + 1,
                        step_details: step
                    }));
                
                if (stepsRecords.length > 0) {
                    const { error: stepsErr } = await supabaseClient.from('form2_steps').insert(stepsRecords);
                    if (stepsErr) throw stepsErr;
                }
            } 
            else if (currentActiveForm === 'form3') {
                const detail = {
                    id: id,
                    asset_name: document.getElementById('f3_asset').value,
                    assessor_name: document.getElementById('f3_assessor').value,
                    assessment_date: document.getElementById('f3_date').value,
                    accuracy_score: ratingValues.f3_acc,
                    completeness_score: ratingValues.f3_comp,
                    clarity_score: ratingValues.f3_clarity,
                    recency_score: ratingValues.f3_recency,
                    accessibility_score: ratingValues.f3_access,
                    total_score: parseInt(document.getElementById('f3_total_score_display').value, 10),
                    accreditation_decision: document.getElementById('f3_decision_display').value,
                    assessor_notes: document.getElementById('f3_notes').value
                };
                const { error } = await supabaseClient.from('form3_quality_assessment').insert(detail);
                if (error) throw error;
            } 
            else if (currentActiveForm === 'form4') {
                const detail = {
                    id: id,
                    project_name: document.getElementById('f4_name').value,
                    closure_date: document.getElementById('f4_close_date').value,
                    team_leader: document.getElementById('f4_leader').value,
                    planned_goals: document.getElementById('f4_planned').value,
                    actual_results: document.getElementById('f4_actual').value,
                    root_cause_difference: document.getElementById('f4_reason').value,
                    lesson_learned: document.getElementById('f4_lesson').value,
                    future_recommendation: document.getElementById('f4_rec').value,
                    recommendation_owner: document.getElementById('f4_owner').value,
                    closure_status: document.querySelector(`input[name="f4_status"]:checked`).value
                };
                const { error } = await supabaseClient.from('form4_lessons_learned').insert(detail);
                if (error) throw error;
            } 
            else if (currentActiveForm === 'form5') {
                const detail = {
                    id: id,
                    project_name: document.getElementById('f5_name').value,
                    project_manager: document.getElementById('f5_manager').value,
                    expected_start_date: document.getElementById('f5_start').value,
                    target_end_date: document.getElementById('f5_end').value,
                    expected_outputs: document.getElementById('f5_goals').value,
                    requirements_analysis_date: document.getElementById('f5_date_analysis').value,
                    development_automation_date: document.getElementById('f5_date_dev').value,
                    beta_testing_date: document.getElementById('f5_date_test').value,
                    launch_training_date: document.getElementById('f5_date_launch').value,
                    required_resources: document.getElementById('f5_resources').value,
                    expected_risks: document.getElementById('f5_risks').value,
                    current_progress_percentage: parseInt(document.getElementById('f5_progress').value, 10),
                    project_status: document.querySelector(`input[name="f5_status"]:checked`).value
                };
                const { error } = await supabaseClient.from('form5_strategic_project_plan').insert(detail);
                if (error) throw error;
            }
            
            showToast(`تم إرسال وحفظ الطلب سحابياً برقم مرجعي: ${id}`, 'success');
        } catch (err) {
            console.error("Supabase Save Error:", err);
            showToast("فشل الحفظ في السحابة، يرجى فحص إعدادات الاتصال أو الجداول", "danger");
            return; // إيقاف العملية
        }
    } else {
        // الفولباك المحلي لحفظ البيانات في LocalStorage
        const submissions = JSON.parse(localStorage.getItem('km_submissions'));
        const submissionData = {
            id: id,
            form_type: currentActiveForm,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            data: {}
        };
        
        const config = FORM_FIELDS_CONFIG[currentActiveForm];
        config.forEach(field => {
            if (field.type === 'radio') {
                submissionData.data[field.id] = document.querySelector(`input[name="${field.id}"]:checked`)?.value;
            } else if (field.type === 'rating') {
                submissionData.data[field.id] = ratingValues[field.id];
            } else {
                submissionData.data[field.id] = document.getElementById(field.id)?.value;
            }
        });

        if (currentActiveForm === 'form2') {
            submissionData.data['f2_steps'] = [...form2StepsList];
        }
        if (currentActiveForm === 'form1') {
            submissionData.data['f1_notes'] = document.getElementById('f1_notes').value;
        }
        if (currentActiveForm === 'form3') {
            submissionData.data['f3_notes'] = document.getElementById('f3_notes').value;
            submissionData.data['f3_total'] = document.getElementById('f3_total_score_display').value;
            submissionData.data['f3_decision'] = document.getElementById('f3_decision_display').value;
        }
        
        submissions.push(submissionData);
        localStorage.setItem('km_submissions', JSON.stringify(submissions));
        showToast(`تم حفظ الطلب محلياً بنجاح بالرقم المرجعي: ${id}`, 'success');
    }
    
    // إزالة المسودة بعد الإرسال الناجح
    const drafts = JSON.parse(localStorage.getItem('km_drafts'));
    delete drafts[currentActiveForm];
    localStorage.setItem('km_drafts', JSON.stringify(drafts));
    
    closeReviewModal();
    resetFormInputs(currentActiveForm);
    updateProgress(currentActiveForm);
    await renderAdminSubmissions();
}

// 13. لوحة الإدارة: عرض الطلبات سحابياً أو محلياً مع البحث والتصفية
async function renderAdminSubmissions() {
    const searchQuery = document.getElementById('admin_search')?.value.toLowerCase() || "";
    const filterFormType = document.getElementById('admin_filter_form')?.value || "all";
    const tbody = document.getElementById('admin_table_body');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">جاري تحميل البيانات...</td></tr>`;
    
    let submissions = [];
    
    if (supabaseClient) {
        try {
            // جلب البيانات من جدول submissions الأساسي مع تفاصيل الجداول الجانبية
            const { data, error } = await supabaseClient
                .from('submissions')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            submissions = data || [];
        } catch (err) {
            console.error("Supabase load error:", err);
            showToast("حدث خطأ أثناء جلب البيانات من السحابة، تم التحويل للعرض المحلي", "warning");
            submissions = getLocalSubmissions();
        }
    } else {
        submissions = getLocalSubmissions();
    }

    if (submissions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">لا توجد طلبات مدخلة حالياً</td></tr>`;
        return;
    }
    
    // تصفية البيانات في جهة العميل
    let filtered = submissions.filter(sub => {
        if (filterFormType !== 'all' && sub.form_type !== filterFormType) return false;
        
        if (searchQuery) {
            return sub.id.toLowerCase().includes(searchQuery) || sub.form_type.toLowerCase().includes(searchQuery);
        }
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">لا توجد طلبات مطابقة للبحث والتصفية</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    filtered.forEach(sub => {
        const tr = document.createElement('tr');
        const dateVal = sub.created_at || sub.submitted_at;
        const formattedDate = new Date(dateVal).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        tr.innerHTML = `
            <td><strong>${sub.id}</strong></td>
            <td><span class="form-badge">${FORM_NAMES[sub.form_type]}</span></td>
            <td><span class="badge-status submitted">مدخل سحابياً</span></td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewSubmissionDetails('${sub.id}', '${sub.form_type}')">عرض</button>
                <button class="btn btn-primary btn-sm" onclick="printSubmissionDirectly('${sub.id}', '${sub.form_type}')">طباعة PDF</button>
                <button class="btn btn-danger btn-sm" onclick="deleteSubmission('${sub.id}')">حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getLocalSubmissions() {
    const raw = JSON.parse(localStorage.getItem('km_submissions')) || [];
    // تحويل الترتيب للأحدث
    return [...raw].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
}

function setupAdminControls() {
    const search = document.getElementById('admin_search');
    const filter = document.getElementById('admin_filter_form');
    
    search?.addEventListener('input', async () => await renderAdminSubmissions());
    filter?.addEventListener('change', async () => await renderAdminSubmissions());
}

// دالة لجلب تفاصيل طلب محدد إما محلياً أو سحابياً
async function getSubmissionDetailData(id, formType) {
    if (supabaseClient) {
        let tableName = "";
        if (formType === 'form1') tableName = 'form1_critical_processes';
        else if (formType === 'form2') tableName = 'form2_knowledge_documentation';
        else if (formType === 'form3') tableName = 'form3_quality_assessment';
        else if (formType === 'form4') tableName = 'form4_lessons_learned';
        else if (formType === 'form5') tableName = 'form5_strategic_project_plan';
        
        try {
            const { data, error } = await supabaseClient.from(tableName).select('*').eq('id', id).single();
            if (error) throw error;
            
            // جلب الخطوات الإجرائية إذا كان النموذج 2
            if (formType === 'form2') {
                const { data: steps, error: stepsErr } = await supabaseClient
                    .from('form2_steps')
                    .select('*')
                    .eq('form2_id', id)
                    .order('step_number', { ascending: true });
                if (!stepsErr && steps) {
                    data.f2_steps = steps.map(s => s.step_details);
                }
            }
            return data;
        } catch (err) {
            console.error("Error loading detail:", err);
            return null;
        }
    } else {
        const local = getLocalSubmissions();
        const found = local.find(s => s.id === id);
        return found ? found.data : null;
    }
}

// عرض تفاصيل طلب معين داخل نافذة Modal
async function viewSubmissionDetails(submissionId, formType) {
    showToast("جاري جلب تفاصيل الطلب...", "info");
    const detailData = await getSubmissionDetailData(submissionId, formType);
    if (!detailData) {
        showToast("فشل جلب تفاصيل هذا الطلب", "danger");
        return;
    }
    
    const config = FORM_FIELDS_CONFIG[formType];
    const container = document.getElementById('details_modal_body');
    if (!container) return;
    
    container.innerHTML = "";
    document.getElementById('details_modal_title').textContent = `تفاصيل الطلب: ${submissionId} - ${FORM_NAMES[formType]}`;
    
    const reviewGrid = document.createElement('div');
    reviewGrid.className = 'review-grid';
    
    config.forEach(field => {
        const labelText = document.querySelector(`label[for="${field.id}"]`)?.textContent.replace('*', '').trim() || 
                          document.querySelector(`.form-group:has([name="${field.id}"]) label`)?.textContent.replace('*', '').trim() ||
                          document.querySelector(`.form-group:has(.rating-options[data-field="${field.id}"]) label`)?.textContent.replace('*', '').trim() ||
                          field.id;
                          
        let valueText = "";
        
        // رسم الخرائط وتوافق أسماء الحقول العلائقية في Supabase ومفاتيح LocalStorage
        let dataKey = field.id;
        if (supabaseClient) {
            if (field.id === 'f1_dept') dataKey = 'department_name';
            else if (field.id === 'f1_process') dataKey = 'process_name';
            else if (field.id === 'f1_know_type') dataKey = 'knowledge_type';
            else if (field.id === 'f1_expert_name') dataKey = 'knowledge_owner_name';
            else if (field.id === 'f1_expert_job') dataKey = 'knowledge_owner_job';
            else if (field.id === 'f1_storage') dataKey = 'storage_location';
            else if (field.id === 'f1_risk') dataKey = 'risk_level';
            else if (field.id === 'f1_doc_status') dataKey = 'documentation_status';
            
            else if (field.id === 'f2_title') dataKey = 'knowledge_title';
            else if (field.id === 'f2_code') dataKey = 'reference_code';
            else if (field.id === 'f2_dept') dataKey = 'owning_department';
            else if (field.id === 'f2_expert_name') dataKey = 'expert_name';
            else if (field.id === 'f2_expert_sig') dataKey = 'expert_signature';
            else if (field.id === 'f2_expert_date') dataKey = 'expert_date';
            else if (field.id === 'f2_goal') dataKey = 'objective';
            else if (field.id === 'f2_scope') dataKey = 'application_scope';
            else if (field.id === 'f2_inputs') dataKey = 'input_requirements';
            else if (field.id === 'f2_tools') dataKey = 'associated_tools';
            else if (field.id === 'f2_tips') dataKey = 'expert_tips';
            else if (field.id === 'f2_review_date') dataKey = 'next_review_date';
            
            else if (field.id === 'f3_asset') dataKey = 'asset_name';
            else if (field.id === 'f3_assessor') dataKey = 'assessor_name';
            else if (field.id === 'f3_date') dataKey = 'assessment_date';
            else if (field.id === 'f3_acc') dataKey = 'accuracy_score';
            else if (field.id === 'f3_comp') dataKey = 'completeness_score';
            else if (field.id === 'f3_clarity') dataKey = 'clarity_score';
            else if (field.id === 'f3_recency') dataKey = 'recency_score';
            else if (field.id === 'f3_access') dataKey = 'accessibility_score';
            
            else if (field.id === 'f4_name') dataKey = 'project_name';
            else if (field.id === 'f4_close_date') dataKey = 'closure_date';
            else if (field.id === 'f4_leader') dataKey = 'team_leader';
            else if (field.id === 'f4_planned') dataKey = 'planned_goals';
            else if (field.id === 'f4_actual') dataKey = 'actual_results';
            else if (field.id === 'f4_reason') dataKey = 'root_cause_difference';
            else if (field.id === 'f4_lesson') dataKey = 'lesson_learned';
            else if (field.id === 'f4_rec') dataKey = 'future_recommendation';
            else if (field.id === 'f4_owner') dataKey = 'recommendation_owner';
            else if (field.id === 'f4_status') dataKey = 'closure_status';
            
            else if (field.id === 'f5_name') dataKey = 'project_name';
            else if (field.id === 'f5_manager') dataKey = 'project_manager';
            else if (field.id === 'f5_start') dataKey = 'expected_start_date';
            else if (field.id === 'f5_end') dataKey = 'target_end_date';
            else if (field.id === 'f5_goals') dataKey = 'expected_outputs';
            else if (field.id === 'f5_date_analysis') dataKey = 'requirements_analysis_date';
            else if (field.id === 'f5_date_dev') dataKey = 'development_automation_date';
            else if (field.id === 'f5_date_test') dataKey = 'beta_testing_date';
            else if (field.id === 'f5_date_launch') dataKey = 'launch_training_date';
            else if (field.id === 'f5_resources') dataKey = 'required_resources';
            else if (field.id === 'f5_risks') dataKey = 'expected_risks';
            else if (field.id === 'f5_progress') dataKey = 'current_progress_percentage';
            else if (field.id === 'f5_status') dataKey = 'project_status';
        }
        
        const dataVal = detailData[dataKey];
        
        if (field.type === 'radio') {
            if (field.id === 'f1_know_type') valueText = KNOWLEDGE_TYPES[dataVal] || '';
            else if (field.id === 'f1_risk') valueText = RISK_LEVELS[dataVal] || '';
            else if (field.id === 'f1_doc_status') valueText = DOC_STATUSES[dataVal] || '';
            else if (field.id === 'f4_status') valueText = CLOSURE_STATUSES[dataVal] || '';
            else if (field.id === 'f5_status') valueText = PROJECT_STATUSES[dataVal] || '';
            else valueText = dataVal || '';
        } else if (field.type === 'rating') {
            valueText = `${dataVal || 0} نجوم`;
        } else {
            valueText = dataVal || '';
        }
        
        const item = document.createElement('div');
        item.className = 'review-field';
        item.innerHTML = `
            <div class="review-label">${labelText}</div>
            <div class="review-value">${valueText || '<span class="empty">لا يوجد</span>'}</div>
        `;
        reviewGrid.appendChild(item);
    });

    if (formType === 'form2') {
        const stepsItem = document.createElement('div');
        stepsItem.className = 'review-field';
        stepsItem.style.gridColumn = 'span 2';
        
        let stepsHtml = "<ol style='padding-right: 20px; margin-top: 8px;'>";
        const stepsArr = detailData.f2_steps || [];
        stepsArr.forEach(st => {
            if (st.trim() !== '') stepsHtml += `<li>${st}</li>`;
        });
        stepsHtml += "</ol>";
        
        stepsItem.innerHTML = `
            <div class="review-label">الخطوات الإجرائية</div>
            <div class="review-value">${stepsHtml}</div>
        `;
        reviewGrid.appendChild(stepsItem);
    }
    
    if (formType === 'form3') {
        const decisionText = DECISIONS[detailData.accreditation_decision || detailData.f3_decision] || 'مرفوض';
        const totalScore = detailData.total_score || detailData.f3_total || '';
        const notesText = detailData.assessor_notes || detailData.f3_notes || '';
        
        const extraGrid = document.createElement('div');
        extraGrid.className = 'review-grid';
        extraGrid.style.gridColumn = 'span 2';
        extraGrid.innerHTML = `
            <div class="review-field">
                <div class="review-label">مجموع الدرجات (من 25)</div>
                <div class="review-value">${totalScore}</div>
            </div>
            <div class="review-field">
                <div class="review-label">قرار الاعتماد</div>
                <div class="review-value">${decisionText}</div>
            </div>
            <div class="review-field" style="grid-column: span 2;">
                <div class="review-label">ملاحظات المقيم</div>
                <div class="review-value">${notesText || '<span class="empty">لا توجد ملاحظات</span>'}</div>
            </div>
        `;
        reviewGrid.appendChild(extraGrid);
    }

    if (formType === 'form1') {
        const notesText = detailData.team_notes || detailData.f1_notes || '';
        const notesItem = document.createElement('div');
        notesItem.className = 'review-field';
        notesItem.style.gridColumn = 'span 2';
        notesItem.innerHTML = `
            <div class="review-label">ملاحظات فريق الحصر</div>
            <div class="review-value">${notesText || '<span class="empty">لا توجد ملاحظات</span>'}</div>
        `;
        reviewGrid.appendChild(notesItem);
    }
    
    container.appendChild(reviewGrid);
    
    const modalFooter = document.getElementById('details_modal_footer');
    if (modalFooter) {
        modalFooter.innerHTML = `
            <button class="btn btn-primary" onclick="printSubmissionDirectly('${submissionId}', '${formType}')">طباعة وتصدير PDF</button>
            <button class="btn btn-secondary" onclick="closeDetailsModal()">إغلاق</button>
        `;
    }
    
    document.getElementById('details-modal').classList.add('active');
}

function closeDetailsModal() {
    document.getElementById('details-modal').classList.remove('active');
}

// حذف طلب سحابياً أو محلياً
async function deleteSubmission(submissionId) {
    if (confirm(`هل أنت متأكد من رغبتك في حذف الطلب رقم ${submissionId} بشكل نهائي؟`)) {
        if (supabaseClient) {
            showToast("جاري حذف الطلب من السحابة...", "info");
            try {
                const { error } = await supabaseClient.from('submissions').delete().eq('id', submissionId);
                if (error) throw error;
                showToast('تم حذف الطلب بنجاح من قاعدة البيانات السحابية', 'success');
            } catch (err) {
                console.error("Delete Error:", err);
                showToast("فشل الحذف من السحابة، يرجى فحص الصلاحيات", "danger");
            }
        } else {
            let submissions = JSON.parse(localStorage.getItem('km_submissions'));
            submissions = submissions.filter(s => s.id !== submissionId);
            localStorage.setItem('km_submissions', JSON.stringify(submissions));
            showToast('تم حذف الطلب بنجاح محلياً', 'success');
        }
        await renderAdminSubmissions();
    }
}

// 14. التصدير الفعلي إلى Excel (صيغة CSV متوافقة مع Excel مع BOM للغة العربية)
async function exportSubmissionsToExcel() {
    let submissions = [];
    if (supabaseClient) {
        try {
            const { data } = await supabaseClient.from('submissions').select('*');
            submissions = data || [];
        } catch (e) {
            submissions = getLocalSubmissions();
        }
    } else {
        submissions = getLocalSubmissions();
    }
    
    if (submissions.length === 0) {
        showToast('لا توجد بيانات لتصديرها حالياً', 'danger');
        return;
    }
    
    let csvContent = "\uFEFF"; // إضافة BOM للغة العربية
    csvContent += "الرقم المرجعي,نوع النموذج,تاريخ التقديم,الحالة السحابية\n";
    
    submissions.forEach(sub => {
        const row = [
            `"${sub.id}"`,
            `"${FORM_NAMES[sub.form_type]}"`,
            `"${new Date(sub.created_at || sub.submitted_at).toLocaleString('ar-EG')}"`,
            `"${supabaseClient ? 'سحابي' : 'محلي'}"`
        ];
        csvContent += row.join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `KM_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('تم تصدير البيانات بنجاح', 'success');
}

// 15. طباعة النماذج بشكل مطابق للأصل الورقي
async function printSubmissionDirectly(submissionId, formType) {
    showToast("جاري تهيئة صفحة الطباعة...", "info");
    const detailData = await getSubmissionDetailData(submissionId, formType);
    if (!detailData) {
        showToast("فشل جلب البيانات للطباعة", "danger");
        return;
    }

    const printArea = document.createElement('div');
    printArea.id = 'print-container-temp';
    printArea.style.direction = 'rtl';
    printArea.style.fontFamily = 'Cairo, sans-serif';
    printArea.style.padding = '40px';
    
    const htmlContent = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px double #000; padding-bottom: 20px;">
            <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 5px;">منصة إدارة المعرفة التفاعلية</h2>
            <h3 style="font-size: 18px; font-weight: 700; color: #555;">${FORM_NAMES[formType]}</h3>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 12px; color: #777;">
                <span>الرقم المرجعي للطلب: ${submissionId}</span>
                <span>تاريخ التقديم: ${new Date().toLocaleDateString('ar-EG')}</span>
            </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            ${generatePrintTableRows(formType, detailData)}
        </table>
    `;
    
    printArea.innerHTML = htmlContent;
    document.body.appendChild(printArea);
    
    const originalStyle = document.createElement('style');
    originalStyle.id = 'print-style-temp';
    originalStyle.innerHTML = `
        @media print {
            body > *:not(#print-container-temp) {
                display: none !important;
            }
            #print-container-temp {
                display: block !important;
                position: absolute;
                top: 0;
                right: 0;
                width: 100%;
            }
        }
    `;
    document.head.appendChild(originalStyle);
    
    window.print();
    
    document.body.removeChild(printArea);
    document.head.removeChild(originalStyle);
}

function generatePrintTableRows(formType, data) {
    const config = FORM_FIELDS_CONFIG[formType];
    let rowsHtml = "";
    
    config.forEach(field => {
        const labelText = document.querySelector(`label[for="${field.id}"]`)?.textContent.replace('*', '').trim() || field.id;
        
        let dataKey = field.id;
        if (supabaseClient) {
            // رسم خرائط الحقول
            if (field.id === 'f1_dept') dataKey = 'department_name';
            else if (field.id === 'f1_process') dataKey = 'process_name';
            else if (field.id === 'f1_know_type') dataKey = 'knowledge_type';
            else if (field.id === 'f1_expert_name') dataKey = 'knowledge_owner_name';
            else if (field.id === 'f1_expert_job') dataKey = 'knowledge_owner_job';
            else if (field.id === 'f1_storage') dataKey = 'storage_location';
            else if (field.id === 'f1_risk') dataKey = 'risk_level';
            else if (field.id === 'f1_doc_status') dataKey = 'documentation_status';
            
            else if (field.id === 'f2_title') dataKey = 'knowledge_title';
            else if (field.id === 'f2_code') dataKey = 'reference_code';
            else if (field.id === 'f2_dept') dataKey = 'owning_department';
            else if (field.id === 'f2_expert_name') dataKey = 'expert_name';
            else if (field.id === 'f2_expert_sig') dataKey = 'expert_signature';
            else if (field.id === 'f2_expert_date') dataKey = 'expert_date';
            else if (field.id === 'f2_goal') dataKey = 'objective';
            else if (field.id === 'f2_scope') dataKey = 'application_scope';
            else if (field.id === 'f2_inputs') dataKey = 'input_requirements';
            else if (field.id === 'f2_tools') dataKey = 'associated_tools';
            else if (field.id === 'f2_tips') dataKey = 'expert_tips';
            else if (field.id === 'f2_review_date') dataKey = 'next_review_date';
            
            else if (field.id === 'f3_asset') dataKey = 'asset_name';
            else if (field.id === 'f3_assessor') dataKey = 'assessor_name';
            else if (field.id === 'f3_date') dataKey = 'assessment_date';
            else if (field.id === 'f3_acc') dataKey = 'accuracy_score';
            else if (field.id === 'f3_comp') dataKey = 'completeness_score';
            else if (field.id === 'f3_clarity') dataKey = 'clarity_score';
            else if (field.id === 'f3_recency') dataKey = 'recency_score';
            else if (field.id === 'f3_access') dataKey = 'accessibility_score';
            
            else if (field.id === 'f4_name') dataKey = 'project_name';
            else if (field.id === 'f4_close_date') dataKey = 'closure_date';
            else if (field.id === 'f4_leader') dataKey = 'team_leader';
            else if (field.id === 'f4_planned') dataKey = 'planned_goals';
            else if (field.id === 'f4_actual') dataKey = 'actual_results';
            else if (field.id === 'f4_reason') dataKey = 'root_cause_difference';
            else if (field.id === 'f4_lesson') dataKey = 'lesson_learned';
            else if (field.id === 'f4_rec') dataKey = 'future_recommendation';
            else if (field.id === 'f4_owner') dataKey = 'recommendation_owner';
            else if (field.id === 'f4_status') dataKey = 'closure_status';
            
            else if (field.id === 'f5_name') dataKey = 'project_name';
            else if (field.id === 'f5_manager') dataKey = 'project_manager';
            else if (field.id === 'f5_start') dataKey = 'expected_start_date';
            else if (field.id === 'f5_end') dataKey = 'target_end_date';
            else if (field.id === 'f5_goals') dataKey = 'expected_outputs';
            else if (field.id === 'f5_date_analysis') dataKey = 'requirements_analysis_date';
            else if (field.id === 'f5_date_dev') dataKey = 'development_automation_date';
            else if (field.id === 'f5_date_test') dataKey = 'beta_testing_date';
            else if (field.id === 'f5_date_launch') dataKey = 'launch_training_date';
            else if (field.id === 'f5_resources') dataKey = 'required_resources';
            else if (field.id === 'f5_risks') dataKey = 'expected_risks';
            else if (field.id === 'f5_progress') dataKey = 'current_progress_percentage';
            else if (field.id === 'f5_status') dataKey = 'project_status';
        }
        
        let val = data[dataKey];
        if (field.type === 'radio') {
            if (field.id === 'f1_know_type') val = KNOWLEDGE_TYPES[val] || val;
            else if (field.id === 'f1_risk') val = RISK_LEVELS[val] || val;
            else if (field.id === 'f1_doc_status') val = DOC_STATUSES[val] || val;
            else if (field.id === 'f4_status') val = CLOSURE_STATUSES[val] || val;
            else if (field.id === 'f5_status') val = PROJECT_STATUSES[val] || val;
        } else if (field.type === 'rating') {
            val = `★ `.repeat(val) + `☆ `.repeat(5 - val) + ` (${val} من 5)`;
        }
        
        rowsHtml += `
            <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 12px; font-weight: 700; width: 30%; background-color: #f9f9f9; border: 1px solid #ccc;">${labelText}</td>
                <td style="padding: 12px; border: 1px solid #ccc; white-space: pre-line;">${val || 'لا يوجد'}</td>
            </tr>
        `;
    });
    
    if (formType === 'form2') {
        let stepsHtml = "<ol style='padding-right: 20px;'>";
        const stepsArr = data.f2_steps || [];
        stepsArr.forEach(st => {
            if (st.trim() !== '') stepsHtml += `<li>${st}</li>`;
        });
        stepsHtml += "</ol>";
        rowsHtml += `
            <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 12px; font-weight: 700; background-color: #f9f9f9; border: 1px solid #ccc;">الخطوات الإجرائية</td>
                <td style="padding: 12px; border: 1px solid #ccc;">${stepsHtml}</td>
            </tr>
        `;
    }
    
    if (formType === 'form3') {
        const decisionText = DECISIONS[data.accreditation_decision || data.f3_decision] || '';
        const totalScore = data.total_score || data.f3_total || '';
        const notesText = data.assessor_notes || data.f3_notes || '';
        
        rowsHtml += `
            <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 12px; font-weight: 700; background-color: #f9f9f9; border: 1px solid #ccc;">مجموع الدرجات (من 25)</td>
                <td style="padding: 12px; border: 1px solid #ccc;">${totalScore}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 12px; font-weight: 700; background-color: #f9f9f9; border: 1px solid #ccc;">قرار الاعتماد</td>
                <td style="padding: 12px; border: 1px solid #ccc; font-weight: bold;">${decisionText}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 12px; font-weight: 700; background-color: #f9f9f9; border: 1px solid #ccc;">ملاحظات المقيم</td>
                <td style="padding: 12px; border: 1px solid #ccc;">${notesText || 'لا توجد'}</td>
            </tr>
        `;
    }
    
    if (formType === 'form1') {
        const notesText = data.team_notes || data.f1_notes || '';
        rowsHtml += `
            <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 12px; font-weight: 700; background-color: #f9f9f9; border: 1px solid #ccc;">ملاحظات فريق الحصر</td>
                <td style="padding: 12px; border: 1px solid #ccc;">${notesText || 'لا توجد'}</td>
            </tr>
        `;
    }
    
    return rowsHtml;
}

// 16. نظام التنبيهات المنبثقة (Toasts)
function showToast(message, type = 'info') {
    const toast = document.getElementById('alert_toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'alert-toast show';
    
    if (type === 'success') toast.classList.add('success');
    else if (type === 'danger') toast.classList.add('danger');
    else if (type === 'warning') toast.classList.add('warning');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
