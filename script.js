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

const form = document.getElementById('contact-form');

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

  form.addEventListener('submit', (event) => {
    event.preventDefault();
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

    const payload = {
      name: fields.name.input.value.trim(),
      email: fields.email.input.value.trim(),
      message: fields.message.input.value.trim(),
      submittedAt: new Date().toISOString()
    };

    console.log('Vanguard contact form submission:', payload);

    const success = document.getElementById('form-success');
    if (success) {
      success.textContent = 'Submission received. A Vanguard representative will contact you within 72 hours.';
      success.classList.remove('hidden');
    }

    form.reset();
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
