/**
 * Main JavaScript for Devidutta Parida's Portfolio
 * Handles navigation, animations, and form functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const contactForm = document.getElementById('contactForm');
  const statusContainer = document.getElementById('formAlerts');
  const submitBtn = document.getElementById('submitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');
  const messageCount = document.getElementById('messageCount');
  
  // Form fields
  const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    subject: document.getElementById('subject'),
    reason: document.getElementById('reason'),
    message: document.getElementById('message'),
    consent: document.getElementById('consent')
  };
  
  // Error elements
  const errors = {
    name: document.getElementById('nameError'),
    email: document.getElementById('emailError'),
    subject: document.getElementById('subjectError'),
    reason: document.getElementById('reasonError'),
    message: document.getElementById('messageError'),
    consent: document.getElementById('consentError')
  };

  // Initialize mobile menu
  function initMobileMenu() {
    if (!menuBtn || !menu) return;
    
    menuBtn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    
    // Close menu when clicking nav links
    document.querySelectorAll('a[data-nav]', menu).forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Initialize scroll reveal animations
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15
      });
      
      reveals.forEach(el => io.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver
      reveals.forEach(el => el.classList.add('visible'));
    }
  }

  // Initialize scroll spy for navigation
  function initScrollSpy() {
    const sections = ['hero', 'about', 'skills', 'projects', 'achievements', 'contact']
      .map(id => ({ id, el: document.getElementById(id) }))
      .filter(x => x.el);
    
    const navLinks = new Map(
      Array.from(document.querySelectorAll('a[data-nav]'))
        .map(a => [a.getAttribute('href').replace('#', ''), a])
    );
    
    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const id = entry.target.id;
          const link = navLinks.get(id);
          if (!link) return;
          
          if (entry.isIntersecting) {
            // Remove current from all links
            navLinks.forEach(a => a.removeAttribute('aria-current'));
            // Set current on active link
            link.setAttribute('aria-current', 'true');
          }
        });
      }, {
        root: null,
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0.1
      });
      
      sections.forEach(s => spy.observe(s.el));
    }
  }

  // Form validation helpers
  function setError(id, msg) {
    const input = fields[id];
    const err = errors[id];
    if (!input || !err) return;
    
    if (msg) {
      err.textContent = msg;
      err.classList.remove('hidden');
      input.setAttribute('aria-invalid', 'true');
    } else {
      err.textContent = '';
      err.classList.add('hidden');
      input.removeAttribute('aria-invalid');
    }
  }

  function showAlert(type, text) {
    if (!statusContainer) return;
    
    statusContainer.className = ''; // reset
    statusContainer.classList.add('alert', type === 'success' ? 'alert-success' : 'alert-error');
    statusContainer.textContent = text;
    statusContainer.classList.remove('hidden');
  }

  function clearAlert() {
    if (!statusContainer) return;
    statusContainer.className = 'hidden';
    statusContainer.textContent = '';
  }

  // Field validators
  function validateName() {
    const v = fields.name.value.trim();
    if (v.length < 2) {
      setError('name', 'Name must be at least 2 characters.');
      return false;
    }
    setError('name', '');
    return true;
  }

  function validateEmail() {
    const v = fields.email.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (!ok) {
      setError('email', 'Please enter a valid email address.');
      return false;
    }
    setError('email', '');
    return true;
  }

  function validateMessage() {
    const v = fields.message.value.trim();
    if (v.length < 10) {
      setError('message', 'Message should be at least 10 characters.');
      return false;
    }
    setError('message', '');
    return true;
  }

  function validateConsent() {
    if (!fields.consent.checked) {
      setError('consent', 'Please confirm you agree to be contacted.');
      return false;
    }
    setError('consent', '');
    return true;
  }

  function validateAll() {
    return [
      validateName(),
      validateEmail(),
      validateMessage(),
      validateConsent()
    ].every(Boolean);
  }

  // Form loading state
  function setLoading(loading) {
    if (!submitBtn) return;
    
    if (loading) {
      submitBtn.classList.add('loading');
      if (btnSpinner) btnSpinner.classList.remove('hidden');
      if (btnText) btnText.textContent = 'Sending…';
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove('loading');
      if (btnSpinner) btnSpinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Send Message';
      submitBtn.disabled = false;
    }
  }

  // Initialize contact form
  function initContactForm() {
    if (!contactForm || !statusContainer) return;
    
    // Live validation
    if (fields.name) fields.name.addEventListener('input', validateName);
    if (fields.email) fields.email.addEventListener('input', validateEmail);
    
    if (fields.message) {
      fields.message.addEventListener('input', () => {
        validateMessage();
        if (messageCount) {
          const len = fields.message.value.length;
          messageCount.textContent = len + '/1000';
        }
      });
    }
    
    if (fields.consent) {
      fields.consent.addEventListener('change', validateConsent);
    }
    
    // Form submission
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();
      
      // Front-end validation
      if (!validateAll()) {
        showAlert('error', 'Please fix the highlighted fields and try again.');
        const firstError = Object.values(errors).find(el => el && !el.classList.contains('hidden'));
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      setLoading(true);
      
      try {
        const data = new FormData(contactForm);
        const res = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
        
        if (res.ok) {
          contactForm.reset();
          // Reset counters and errors
          if (messageCount) messageCount.textContent = '0/1000';
          Object.keys(errors).forEach(k => setError(k, ''));
          showAlert('success', 'Thanks! Your message has been sent.');
        } else {
          showAlert('error', 'Something went wrong. Please try again or email me directly.');
        }
      } catch {
        showAlert('error', 'Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    });
  }

  // Initialize all functionality
  function init() {
    initMobileMenu();
    initRevealAnimations();
    initScrollSpy();
    initContactForm();
  }

  // Start the app
  init();
});