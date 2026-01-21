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
    const fileInput = e.target.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    toggleLoading(btn, true, 'Submitting...');

    try {
        let fileData = null;

        // Convert file to Base64 if it exists
        if (file) {
            fileData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    base64: reader.result.split(',')[1], // Remove metadata prefix
                    type: file.type,
                    name: file.name
                });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
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
            message: formData.get('message'),
            // Pass the file data object here
            resumeFile: fileData 
        });

        closeModal(document.getElementById('jobSeekerModal'));
        showSuccessModal('Thank you! Your application and resume have been received.');
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

    const form = e.target;
    const formData = new FormData(form);
    const btn = form.querySelector('.btn-submit');

    toggleLoading(btn, true, 'Posting...');

    try {
        // Collect checkbox values as ARRAYS
        const services = formData.getAll('service[]');
        const requirements = formData.getAll('requirements[]');

        await sendToSheet({
            type: 'post-job',

            // Company Information
            company_name: formData.get('company_name'),
            trading_name: formData.get('trading_name'),
            industry: formData.get('industry'),
            website: formData.get('website'),
            business_location: formData.get('business_location'),

            // Contact Person
            full_name: formData.get('full_name'),
            job_title_contact: formData.get('job_title_contact'),
            email: formData.get('email'),
            phone: formData.get('phone'),

            // Hiring Requirement
            position_title: formData.get('position_title'),
            staff_required: formData.get('staff_required'),
            service: services,            // ✅ ARRAY
            job_type: formData.get('job_type'),

            // Salary
            salary_range: formData.get('salary_range'),

            // Work Details
            work_location: formData.get('work_location'),
            start_date: formData.get('start_date'),

            // Skills & Compliance
            skills: formData.get('skills'),
            requirements: requirements,  // ✅ ARRAY

            // Additional Notes
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
    const url = 'https://script.google.com/macros/s/AKfycbxyVCEpK49jaPsK_7Sdn35OmGUQ_DfFXGnqQxE4MbqWyBV0FyOtFNR8rkb-XfXPM7lhjw/exec';
    
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