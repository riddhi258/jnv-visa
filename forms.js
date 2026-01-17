
// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', function () {
  initModals();
  initForms();
  initFileUploads();
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
// CONTACT
// ===============================
async function handleContactSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const btn = e.target.querySelector('.btn-submit');
  toggleLoading(btn, true, 'Sending...');

  try {
    await sendToSheet({
      type: 'contact',
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message')
    });

    showSuccessModal('Thank you! We will get back to you shortly.');
    e.target.reset();

  } catch (err) {
    alert('Message failed. Please try again.');
    console.error(err);
  } finally {
    toggleLoading(btn, false);
  }
}

// ===============================
// GOOGLE SHEET API
// ===============================
async function sendToSheet(payload) {
    try {
        const res = await fetch('https://script.google.com/macros/s/AKfycby2abLDHWn07R9LSj2v_EgK7q0gGhuRAFzQ3F8w9XZxK22BqniGKOXhjNtrAZY-j8UX/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    } catch (err) {
        console.error('Fetch error:', err);
        throw err;
    }
}