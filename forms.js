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

    document.getElementById('contactForm')
        ?.addEventListener('submit', handleContactSubmit);
}

// ===============================
// JOB SEEKER
// ===============================
async function handleJobSeekerSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const btn = e.target.querySelector('.btn-submit');
    toggleLoading(btn, true, 'Submitting...');

    try {
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
            Resume: formData.get('resume') ? formData.get('resume').name : '',
            message: formData.get('message')
        });

        closeModal(document.getElementById('jobSeekerModal'));
        showSuccessModal(
            'Thank you for your application! We will contact you within 24 hours.'
        );
        e.target.reset();
        updateFileInfo('resumeInfo', null);

    } catch (err) {
        alert('Submission failed. Please try again.');
        console.error(err);
    } finally {
        toggleLoading(btn, false);
    }
}

// ===============================
// POST JOB
// ===============================
async function handlePostJobSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const btn = e.target.querySelector('.btn-submit');
    toggleLoading(btn, true, 'Posting...');

    try {
        await sendToSheet({
            type: 'post-job',
            business_name: formData.get('business_name'),
            contact_person: formData.get('contact_person'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            job_title: formData.get('job_title'),
            job_location: formData.get('job_location'),
            employment_type: formData.get('employment_type'),
            sponsorship: formData.get('sponsorship'),
            message: formData.get('message')
        });

        closeModal(document.getElementById('postJobModal'));
        showSuccessModal('Job posted successfully!');
        e.target.reset();

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
    const url = 'https://script.google.com/macros/s/AKfycbznT65IPEA1shr7O66qaQSfzO-TDWYPz0IxOfGoerPqm_wbBx4UgYK6EvPx9_tQV1Q-/exec';
    
    try {
        // We use text/plain to avoid complex CORS preflight issues with Google Apps Script
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors', 
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        });

        // With no-cors, we can't read the response body, so we assume success if no error is thrown
        return { success: true };
    } catch (err) {
        console.error('Submission Error:', err);
        throw err;
    }
}

// ===============================
// FILE UPLOAD UI
// ===============================
// ===============================
// FILE UPLOAD HANDLER
// ===============================

function updateFileInfo(id, file) {
    const el = document.getElementById(id);
    if (!el) return;

    // No file selected
    if (!file) {
        el.innerHTML = '';
        el.style.display = 'none';
        return;
    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    el.innerHTML = `
        <i class="fas fa-file-alt"></i>
        <strong>${file.name}</strong>
        (${sizeMB} MB)
    `;
    el.style.display = 'block';
}

function initFileUploads() {
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function () {
            updateFileInfo('resumeInfo', this.files[0]);
        });
    });
}

// IMPORTANT: initialize after DOM loads
document.addEventListener('DOMContentLoaded', initFileUploads);


// ===============================
// VALIDATION
// ===============================
function initValidation() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    emailInputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = 'var(--error)';
            } else {
                this.style.borderColor = '';
            }
        });
    });

    phoneInputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (this.value && !validatePhone(this.value)) {
                this.style.borderColor = 'var(--error)';
            } else {
                this.style.borderColor = '';
            }
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
// HELPERS
// ===============================
function toggleLoading(btn, loading, text = '') {
    if (!btn) return;
    if (loading && !btn.dataset.original) {
        btn.dataset.original = btn.innerHTML;
    }
    btn.disabled = loading;
    btn.innerHTML = loading
        ? `<i class="fas fa-spinner fa-spin"></i> ${text}`
        : btn.dataset.original || btn.innerHTML;
}