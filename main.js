/* Shared script for every page. Each block checks its elements exist,
   since not every page has a hero, stats bar, gallery or form. */

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ===== HERO KEN BURNS ===== */
const heroBg = document.getElementById('heroBg');
if (heroBg) window.addEventListener('load', () => heroBg.classList.add('zoomed'));

/* ===== HAMBURGER / MOBILE MENU ===== */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('is-open');
  mobileNav.classList.toggle('is-open', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('is-open');
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ===== SCROLL ANIMATIONS ===== */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* ===== STATS COUNTER ===== */
const statsEl = document.getElementById('statsBar');
if (statsEl) {
  let countersRun = false;
  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersRun) {
      countersRun = true;
      document.querySelectorAll('[data-to]').forEach(el => {
        const target = parseInt(el.dataset.to);
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }
  }, { threshold: 0.6 });
  statsObserver.observe(statsEl);
}

/* ===== ENQUIRY FORM (Formspree) ===== */
const FORMSPREE_ID = 'mrpebbaq';
const enquiryForm = document.getElementById('enquiry-form');

if (enquiryForm) enquiryForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Client-side validation
  const required = this.querySelectorAll('[required]');
  let valid = true;
  required.forEach(field => {
    if (!field.value.trim()) {
      valid = false;
      field.style.borderColor = '#dc2626';
      field.addEventListener('input', () => field.style.borderColor = '', { once: true });
    }
  });
  if (!valid) return;

  const btn = this.querySelector('.form-submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      body: new FormData(this),
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      gtag('event', 'generate_lead', {
        lead_source: this.dataset.leadSource || 'enquiry_form',
        child_class: this.childClass.value,
        campus: this.campus.value
      });
      document.getElementById('form-body').style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
      document.getElementById('form-success').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const data = await res.json();
      const msg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Submission failed.';
      btn.textContent = 'Submit Enquiry →';
      btn.disabled = false;
      alert('Sorry, something went wrong: ' + msg + '\nPlease call us on +91 90308 69502.');
    }
  } catch {
    btn.textContent = 'Submit Enquiry →';
    btn.disabled = false;
    alert('Network error. Please call us on +91 90308 69502 or try again.');
  }
});

/* ===== ANALYTICS: CONTACT CLICKS ===== */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  let name;
  if (href.startsWith('tel:')) name = 'click_call';
  else if (href.startsWith('https://wa.me')) name = 'click_whatsapp';
  else if (href.startsWith('mailto:')) name = 'click_email';
  if (name) gtag('event', name, { link_location: link.closest('section, footer, header')?.id || 'page' });
});

/* ===== GALLERY LIGHTBOX ===== */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');

function openLb(el) {
  const img = el.querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeLb(e) {
  if (!e || e.target === lightbox || e.currentTarget.classList.contains('lb-close')) {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

if (lightbox) {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLb({ target: lightbox });
  });

  document.querySelectorAll('.g-item').forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(el); }
    });
  });
}
