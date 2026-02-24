const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.classList.toggle('hidden');
  });
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Contact Form → /api/contact → Google Sheets ── */
const form = document.getElementById('contactForm');
if (form) {
  const fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('name-error'),
      validate: (value) => value.trim().length >= 2 || 'Please enter your full name.'
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('email-error'),
      validate: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Please enter a valid email address.'
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('message-error'),
      validate: (value) => value.trim().length >= 20 || 'Message must be at least 20 characters.'
    }
  };

  const setError = (field, message) => {
    field.error.textContent = message;
    field.input.setAttribute('aria-invalid', String(Boolean(message)));
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Clear previous success message
    const success = document.getElementById('form-success');
    if (success) {
      success.textContent = '';
      success.classList.add('hidden');
    }

    // Validate all fields
    let isValid = true;
    Object.values(fields).forEach((field) => {
      const result = field.validate(field.input.value);
      const message = result === true ? '' : result;
      setError(field, message);
      if (message) {
        isValid = false;
      }
    });
    if (!isValid) {
      return;
    }

    // Prepare payload
    const payload = {
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      message: fields.message.input.value.trim()
    };

    // Show loading state on button
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Submitting...';
    btn.style.opacity = '0.6';
    btn.style.cursor = 'wait';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Success — show message and reset form
        if (success) {
          success.textContent = data.message || 'Submission received. A Vanguard representative will contact you within 72 hours.';
          success.classList.remove('hidden');
        }
        form.reset();
        // Clear any lingering error states
        Object.values(fields).forEach((field) => setError(field, ''));
      } else {
        // Server returned a validation or processing error
        setError(fields.message, data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      // Network failure
      setError(fields.message, 'Connection error — please check your internet and try again.');
    } finally {
      // Restore button
      btn.disabled = false;
      btn.innerHTML = originalText;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}
