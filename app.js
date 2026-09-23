/* ============================================================
   GLOBAL SEGUROS Y CIA LTDA — v2 interactions
   ============================================================ */

const WHATSAPP_NUMBER = '573112959002';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMegaMenu();
  initCategoryAccordion();
  initRevealOnScroll();
  initContactForm();
  initBackToTop();
  initLogoStrip();
});

/* ================= TIRA DE ASEGURADORAS ================= */
/* `loading="lazy"` es contraproducente en un carrusel: los logos que van a la
   derecha quedan fuera de la ventana al maquetar, así que el navegador no los
   pide hasta que la animación los arrastra hasta la vista — y entran en blanco.
   Tampoco sirve cargarlos de entrada: en una conexión lenta le robaban más de
   un segundo a la foto del hero. Así que se piden en cuanto la página termina
   de cargar, mucho antes de que el visitante baje hasta la tira. */
function initLogoStrip() {
  const imgs = document.querySelectorAll('.aseg-track img[loading="lazy"]');
  if (!imgs.length) return;
  const cargar = () => imgs.forEach((img) => { img.loading = 'eager'; });
  if (document.readyState === 'complete') return cargar();
  // Lo que pase primero: que termine de cargar la página, o que el visitante
  // empiece a bajar — si ya está bajando, la tira tiene que adelantársele.
  window.addEventListener('load', cargar, { once: true });
  window.addEventListener('scroll', cargar, { once: true, passive: true });
}

/* ================= NAVBAR ================= */
function initNavbar() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  // Los enlaces del mega-menú también cierran el cajón móvil: sin ellos el menú
  // a pantalla completa queda tapando la sección a la que se acaba de navegar.
  const navLinkEls = document.querySelectorAll('.nav-link[href], .nav-cta, .mega-col a');

  const closeMenu = () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  };

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  navLinkEls.forEach((link) => link.addEventListener('click', closeMenu));

  // Active link on scroll
  const sections = ['inicio', 'servicios', 'nosotros', 'contacto']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinkEls.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => io.observe(s));
}

/* ================= REVEAL ON SCROLL ================= */
function initRevealOnScroll() {
  const els = Array.from(document.querySelectorAll('.reveal'));
  els.forEach((el, i) => {
    if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', i % 6);
  });

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
  );
  els.forEach((el) => io.observe(el));

  // Safety net: a fast fling, an instant #anchor jump, or a browser restoring
  // scroll position can skip elements past IntersectionObserver's notice.
  // Sweep on every scroll/resize so nothing stays permanently invisible.
  let ticking = false;
  const sweep = () => {
    ticking = false;
    const limit = window.innerHeight;
    els.forEach((el) => {
      if (el.classList.contains('in-view')) return;
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add('in-view');
        io.unobserve(el);
      }
    });
  };
  const onScrollOrResize = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  };
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
  sweep();
}

/* ================= CATEGORÍAS PLEGABLES (solo móvil) ================= */
/* En escritorio las cuatro categorías se ven completas; por debajo de 900px se
   pliegan para que la sección no sea una lista de 17 tarjetas. */
function initCategoryAccordion() {
  const groups = [...document.querySelectorAll('.cat-group')];
  if (!groups.length) return;
  const mq = window.matchMedia('(max-width: 900px)');

  const open = (g) => {
    g.classList.add('open');
    g.querySelector('.cat-toggle').setAttribute('aria-expanded', 'true');
    // Las tarjetas plegadas nunca entran en viewport, así que el observador de
    // scroll no las revela: al abrir se marcan visibles directamente.
    g.querySelectorAll('.reveal').forEach((el) => el.classList.add('in-view'));
  };

  groups.forEach((g) => {
    const btn = g.querySelector('.cat-toggle');
    btn.addEventListener('click', () => {
      if (g.classList.contains('open')) {
        g.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        open(g);
      }
    });
  });

  // El control solo existe en móvil: en escritorio no debe recibir foco.
  const sync = () => {
    groups.forEach((g) => {
      const btn = g.querySelector('.cat-toggle');
      btn.disabled = !mq.matches;
      if (mq.matches) btn.setAttribute('aria-expanded', String(g.classList.contains('open')));
      else btn.removeAttribute('aria-expanded');
    });
  };

  // Un enlace a #cat-… (mega-menú o footer) debe abrir esa categoría, o el
  // usuario aterriza en un encabezado plegado. Se atiende el clic además del
  // hashchange, que no dispara si ya se estaba en ese mismo hash.
  const openFromHash = () => {
    const g = document.getElementById(location.hash.slice(1));
    if (g && g.classList.contains('cat-group') && mq.matches) open(g);
  };
  document.querySelectorAll('a[href^="#cat-"]').forEach((a) => {
    a.addEventListener('click', () => {
      const g = document.getElementById(a.getAttribute('href').slice(1));
      if (g && mq.matches) open(g);
    });
  });

  sync();
  openFromHash();
  mq.addEventListener('change', sync);
  window.addEventListener('hashchange', openFromHash);
}

/* ================= MEGA-MENÚ ================= */
function initMegaMenu() {
  const trigger = document.getElementById('megaTrigger');
  const panel = document.getElementById('megaPanel');
  if (!trigger || !panel) return;

  const wrap = trigger.closest('.has-mega');
  const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;
  let closeTimer = null;

  const setOpen = (open) => {
    clearTimeout(closeTimer);
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  };
  // Closing is deferred so the pointer can cross the gap between the trigger and
  // the panel below the navbar without the menu collapsing out from under it.
  const scheduleClose = () => {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setOpen(false), 180);
  };

  trigger.addEventListener('click', (e) => {
    // detail === 0 means keyboard activation, where a real toggle is expected.
    // A mouse click always follows hover, which has already opened the panel.
    if (isDesktop() && e.detail !== 0) { setOpen(true); return; }
    setOpen(panel.hidden);
  });

  // On desktop the panel also opens on hover, the way allianz.co does it.
  wrap.addEventListener('mouseenter', () => { if (isDesktop()) setOpen(true); });
  wrap.addEventListener('mouseleave', () => { if (isDesktop()) scheduleClose(); });
  panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));

  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); trigger.focus(); } });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && isDesktop() && !wrap.contains(e.target)) setOpen(false);
  });
}

/* ================= CONTACT FORM ================= */
/* Sends via a WhatsApp deep link — no third-party email API/keys required,
   so this works out of the box instead of showing a success screen for a
   message that was never actually delivered anywhere. */
function initContactForm() {
  const form = document.getElementById('contactoForm');
  if (!form) return;
  const submitBtn = document.getElementById('contactSubmitBtn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateContactForm(form)) return;

    const asunto = form.asunto.value;
    const lines = [
      `Hola, mi nombre es ${form.nombre.value.trim()} y les escribo desde la página web.`,
      `Asunto: ${asunto}`,
      form.telefono.value.trim() ? `Teléfono: ${form.telefono.value.trim()}` : '',
      `Correo: ${form.email.value.trim()}`,
      `Mensaje: ${form.mensaje.value.trim()}`,
    ].filter(Boolean);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    form.setAttribute('hidden', '');
    document.getElementById('contactSuccess').removeAttribute('hidden');
  });

  form.querySelectorAll('input, textarea, select').forEach((input) => {
    input.addEventListener('input', () => {
      const err = document.getElementById(`${input.id}-error`);
      if (err) err.textContent = '';
      input.setAttribute('aria-invalid', 'false');
    });
  });
}

function validateContactForm(form) {
  let valid = true;
  const setError = (id, msg) => {
    const el = document.getElementById(`${id}-error`);
    const input = form.elements[id.replace('contact-', '')];
    if (el) el.textContent = msg;
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) valid = false;
  };
  if (!form.nombre.value.trim()) setError('contact-nombre', 'Ingrese su nombre'); else setError('contact-nombre', '');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim());
  if (!emailOk) setError('contact-email', 'Ingrese un correo válido'); else setError('contact-email', '');
  if (!form.asunto.value) setError('contact-asunto', 'Seleccione un asunto'); else setError('contact-asunto', '');
  if (!form.mensaje.value.trim()) setError('contact-mensaje', 'Escriba su mensaje'); else setError('contact-mensaje', '');
  if (!form.terminos.checked) { showToast('Debe aceptar la política de privacidad', 'error'); valid = false; }
  return valid;
}

/* ================= BACK TO TOP ================= */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.toggleAttribute('hidden', window.scrollY < 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ================= TOAST ================= */
function showToast(message, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

