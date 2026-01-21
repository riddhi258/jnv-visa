// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', function () {
    initModals();
    initForms();
    initFileUploads();
    initValidation();
});

// ===============================
// MODALS
// ===============================
function initModals() {
    const jobSeekerBtn = document.getElementById('jobSeekerBtn');
    const postJobBtn = document.getElementById('postJobBtn');
    const jobSeekerModal = document.getElementById('jobSeekerModal');
    const postJobModal = document.getElementById('postJobModal');
    const successModal = document.getElementById('successModal');

    const closeJobSeekerModal = document.getElementById('closeJobSeekerModal');
    const closePostJobModal = document.getElementById('closePostJobModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');

    jobSeekerBtn?.addEventListener('click', () => openModal(jobSeekerModal));
    postJobBtn?.addEventListener('click', () => openModal(postJobModal));

    closeJobSeekerModal?.addEventListener('click', () => closeModal(jobSeekerModal));
    closePostJobModal?.addEventListener('click', () => closeModal(postJobModal));
    closeSuccessModal?.addEventListener('click', () => closeModal(successModal));

    [jobSeekerModal, postJobModal, successModal].forEach(modal => {
        modal?.addEventListener('click', e => {
            if (e.target === modal) closeModal(modal);
        });
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) closeModal(activeModal);
        }
    });
}

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function showSuccessModal(message) {
    document.getElementById('successMessage').textContent = message;
    openModal(document.getElementById('successModal'));
}

// ===============================
// FORMS
// ===============================
function initForms() {
    document.getElementById('jobSeekerForm')
        ?.addEventListener('submit', handleJobSeekerSubmit);

    document.getElementById('postJobForm')
        ?.addEventListener('submit', handlePostJobSubmit);
}

// ===============================
// JOB SEEKER (UPDATED)
// ===============================
async function handleJobSeekerSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const btn = form.querySelector('.btn-submit');
    toggleLoading(btn, true, 'Submitting...');

    try {
        const resumeFile = formData.get('resume');
        let resumeBase64 = "";

        // Convert resume to base64
        if (resumeFile && resumeFile.size > 0) {
            resumeBase64 = await fileToBase64(resumeFile);
        }

        await sendToSheet({
            type: 'job-seeker',
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            mobile: formData.get('mobile'),
            location: formData.get('location'),
            visa_type: formData.get('visa_type'),
            job_type: formData.get('job_type'),
            industry: formData.get('industry'),
            experience_years: formData.get('experience_years'),
            Resume: resumeBase64, // ✅ BASE64 FILE
            message: formData.get('message')
        });

        closeModal(document.getElementById('jobSeekerModal'));
        showSuccessModal(
            'Thank you for your application! We will contact you within 24 hours.'
        );

        form.reset();
        updateFileInfo('resumeInfo', null);

    } catch (err) {
        alert('Submission failed. Please try again.');
        console.error(err);
    } finally {
        toggleLoading(btn, false);
    }
}

// ===============================
// POST JOB (UNCHANGED)
// ===============================
async function handlePostJobSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const btn = form.querySelector('.btn-submit');

    toggleLoading(btn, true, 'Posting...');

    try {
        const services = formData.getAll('service[]');
        const requirements = formData.getAll('requirements[]');

        await sendToSheet({
            type: 'post-job',
            company_name: formData.get('company_name'),
            trading_name: formData.get('trading_name'),
            industry: formData.get('industry'),
            website: formData.get('website'),
            business_location: formData.get('business_location'),
            full_name: formData.get('full_name'),
            job_title_contact: formData.get('job_title_contact'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            position_title: formData.get('position_title'),
            staff_required: formData.get('staff_required'),
            service: services,
            job_type: formData.get('job_type'),
            salary_range: formData.get('salary_range'),
            work_location: formData.get('work_location'),
            start_date: formData.get('start_date'),
            skills: formData.get('skills'),
            requirements: requirements,
            additional_notes: formData.get('additional_notes')
        });

        closeModal(document.getElementById('postJobModal'));
        showSuccessModal('Job posted successfully!');
        form.reset();

    } catch (err) {
        alert('Submission failed. Please try again.');
        console.error(err);
    } finally {
        toggleLoading(btn, false);
    }
}

// ===============================
// GOOGLE SHEET API
// ===============================
async function sendToSheet(payload) {
    const url = 'https://script.google.com/macros/s/AKfycbw_cX0fRHu_tUvq6m8sp1D4Q6IVkadsyg9hALV4bqGbX_QHctOFBcsKks2DKaLaSApQ/exec';

    await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    });

    return { success: true };
}

// ===============================
// FILE UPLOAD UI
// ===============================
function updateFileInfo(id, file) {
    const el = document.getElementById(id);
    if (!el) return;

    if (!file) {
        el.innerHTML = '';
        el.style.display = 'none';
        return;
    }

    el.innerHTML = `<i class="fas fa-file-alt"></i> <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    el.style.display = 'block';
}

function initFileUploads() {
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', e => {
            updateFileInfo('resumeInfo', e.target.files[0]);
        });
    });
}

// ===============================
// FILE → BASE64 HELPER (NEW)
// ===============================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// ===============================
// VALIDATION
// ===============================
function initValidation() {
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('blur', function () {
            this.style.borderColor =
                this.value && !validateEmail(this.value) ? 'var(--error)' : '';
        });
    });

    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('blur', function () {
            this.style.borderColor =
                this.value && !validatePhone(this.value) ? 'var(--error)' : '';
        });
    });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
}

// ===============================
// LOADING BUTTON
// ===============================
function toggleLoading(btn, loading, text = '') {
    if (!btn) return;
    if (loading && !btn.dataset.original) {
        btn.dataset.original = btn.innerHTML;
    }
    btn.disabled = loading;
    btn.innerHTML = loading
        ? `<i class="fas fa-spinner fa-spin"></i> ${text}`
        : btn.dataset.original;
}
