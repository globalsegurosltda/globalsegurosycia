/* ============================================================
   GLOBAL SEGUROS Y CIA LTDA — v2 interactions
   ============================================================ */

const WHATSAPP_NUMBER = '573112959002';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMegaMenu();
  initCategoryAccordion();
  initRevealOnScroll();
  initCotizador();
  initContactForm();
  initBackToTop();
});

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
  const sections = ['inicio', 'servicios', 'cotizador', 'nosotros', 'contacto']
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
  const els = Array.from(document.querySelectorAll('.reveal, .reveal-scale'));
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
    g.querySelectorAll('.reveal, .reveal-scale').forEach((el) => el.classList.add('in-view'));
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

/* ================= COTIZADOR (WIZARD) ================= */
/* Each product's first field is its primary rating factor and is required —
   a quote request the advisor can't actually price isn't a quote request. */
const PRODUCT_CATALOG = {
  vehiculo: {
    label: 'Su vehículo',
    icon: 'ti-car',
    products: [
      { id: 'autos', name: 'Autos', icon: 'ti-car', fields: [
        { id: 'placa', label: 'Placa del vehículo', placeholder: 'ABC123', required: true },
        { id: 'modelo', label: 'Modelo / Año', placeholder: '2020' },
      ] },
      { id: 'motos', name: 'Motos', icon: 'ti-motorbike', fields: [
        { id: 'placa', label: 'Placa de la moto', placeholder: 'ABC12D', required: true },
        { id: 'cilindraje', label: 'Cilindraje', placeholder: '150cc' },
      ] },
      { id: 'bicicleta', name: 'Bicicleta', icon: 'ti-bike', fields: [
        { id: 'valor', label: 'Valor estimado (COP)', placeholder: '2.000.000', currency: true, required: true },
      ] },
    ],
  },
  familia: {
    label: 'Usted y su familia',
    icon: 'ti-heart',
    products: [
      { id: 'salud', name: 'Salud', icon: 'ti-stethoscope', fields: [
        { id: 'edad', label: 'Edad', placeholder: '35', required: true },
      ] },
      { id: 'vida', name: 'Vida', icon: 'ti-shield-heart', fields: [
        { id: 'edad', label: 'Edad', placeholder: '35', required: true },
        { id: 'capital', label: 'Capital deseado (COP)', placeholder: '100.000.000', currency: true },
      ] },
      { id: 'exequial', name: 'Exequial', icon: 'ti-flower', fields: [
        { id: 'numPersonas', label: 'Personas a asegurar', placeholder: '4', required: true },
      ] },
      { id: 'viaje', name: 'Viaje', icon: 'ti-plane', fields: [
        { id: 'destino', label: 'Destino', placeholder: 'España', required: true },
        { id: 'fechas', label: 'Fechas del viaje', placeholder: '10 - 20 de octubre' },
      ] },
      { id: 'educativo', name: 'Educativo', icon: 'ti-school', fields: [
        { id: 'beneficiario', label: 'Nombre del beneficiario', placeholder: 'Nombre del hijo/a' },
        { id: 'edadBeneficiario', label: 'Edad del beneficiario', placeholder: '8 años', required: true },
      ] },
      { id: 'mascotas', name: 'Mascotas', icon: 'ti-paw', fields: [
        { id: 'mascota', label: 'Tipo de mascota', placeholder: 'Perro, gato...', required: true },
        { id: 'edadMascota', label: 'Edad de la mascota', placeholder: '2 años' },
      ] },
    ],
  },
  bienes: {
    label: 'Sus bienes',
    icon: 'ti-home',
    products: [
      { id: 'hogar', name: 'Hogar', icon: 'ti-home', fields: [
        { id: 'tipoVivienda', label: 'Tipo de vivienda', select: ['Casa', 'Apartamento'], required: true },
      ] },
      { id: 'arrendamiento', name: 'Arrendamiento', icon: 'ti-key', fields: [
        { id: 'canon', label: 'Canon mensual (COP)', placeholder: '1.500.000', currency: true, required: true },
        { id: 'ciudadInmueble', label: 'Ciudad del inmueble', placeholder: 'Bogotá D.C.' },
      ] },
      { id: 'copropiedad', name: 'Copropiedad', icon: 'ti-building-community', fields: [
        { id: 'unidades', label: 'Número de unidades', placeholder: '40', required: true },
        { id: 'ciudadCopropiedad', label: 'Ciudad', placeholder: 'Bogotá D.C.' },
      ] },
    ],
  },
  empresa: {
    label: 'Su empresa',
    icon: 'ti-briefcase',
    products: [
      { id: 'pymes', name: 'Pymes', icon: 'ti-building-store', fields: [
        { id: 'sector', label: 'Sector de la empresa', placeholder: 'Comercio, servicios...', required: true },
        { id: 'empleados', label: 'Número de empleados', placeholder: '10' },
      ] },
      { id: 'cumplimiento', name: 'Cumplimiento', icon: 'ti-clipboard-check', fields: [
        { id: 'tipoContrato', label: 'Tipo de contrato', placeholder: 'Obra pública, suministro...' },
        { id: 'valorContrato', label: 'Valor del contrato (COP)', placeholder: '50.000.000', currency: true, required: true },
      ] },
      { id: 'transporte', name: 'Transporte de mercancías', icon: 'ti-truck', fields: [
        { id: 'tipoCarga', label: 'Tipo de carga', placeholder: 'General, refrigerada...', required: true },
        { id: 'valorCarga', label: 'Valor asegurado (COP)', placeholder: '30.000.000', currency: true },
      ] },
      { id: 'colectivas', name: 'Colectivas y beneficios', icon: 'ti-users', fields: [
        { id: 'empleadosColectivo', label: 'Número de empleados', placeholder: '25', required: true },
      ] },
      { id: 'rc-medicos', name: 'RC Médicos y Profesionales', icon: 'ti-scale', fields: [
        { id: 'profesion', label: 'Profesión', placeholder: 'Médico, abogado...', required: true },
        { id: 'experiencia', label: 'Años de experiencia', placeholder: '5' },
      ] },
    ],
  },
};

function findProduct(id) {
  for (const cat of Object.values(PRODUCT_CATALOG)) {
    const p = cat.products.find((pr) => pr.id === id);
    if (p) return p;
  }
  return null;
}

const PHONE_RE = /^[0-9+()\s-]{7,20}$/;

function initCotizador() {
  const wizard = document.getElementById('wizard');
  if (!wizard) return;

  const state = { product: null, data: {} };

  const productGrid = document.getElementById('wizardProductGrid');
  const toStep2 = document.getElementById('toStep2');
  const toStep3 = document.getElementById('toStep3');
  const dynamicFields = document.getElementById('dynamicFields');
  const selectionRecap = document.getElementById('selectionRecap');
  const summaryCard = document.getElementById('summaryCard');

  function productPickHtml(p) {
    return `<button type="button" class="product-pick" data-id="${p.id}"><i class="ti ${p.icon}"></i><span>${p.name}</span></button>`;
  }

  function renderProducts() {
    productGrid.innerHTML = Object.values(PRODUCT_CATALOG)
      .map((cat) => `
        <div class="product-category">
          <p class="category-heading"><i class="ti ${cat.icon}"></i> ${cat.label}</p>
          <div class="category-grid">${cat.products.map(productPickHtml).join('')}</div>
        </div>`)
      .join('');
    productGrid.querySelectorAll('.product-pick').forEach((btn) => {
      btn.addEventListener('click', () => {
        productGrid.querySelectorAll('.product-pick').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.product = btn.dataset.id;
        toStep2.disabled = false;
      });
    });
  }

  renderProducts();

  function goToStep(step) {
    wizard.querySelectorAll('.wizard-step').forEach((s) => s.classList.toggle('active', s.dataset.step === String(step)));
    wizard.querySelectorAll('.wp-step').forEach((s) => {
      const n = parseInt(s.dataset.step, 10);
      s.classList.toggle('active', n === step);
      s.classList.toggle('done', n < step);
    });
    document.getElementById('wpLine1').classList.toggle('filled', step > 1);
    document.getElementById('wpLine2').classList.toggle('filled', step > 2);
  }

  toStep2.addEventListener('click', () => {
    if (!state.product) return;
    const product = findProduct(state.product);
    selectionRecap.innerHTML = `<i class="ti ${product.icon}"></i> Está cotizando: <strong>${product.name}</strong>`;
    dynamicFields.innerHTML = product.fields
      .map((f) => {
        const reqMark = f.required ? ' <span class="req">*</span>' : '';
        if (f.select) {
          return `<div class="field"><label for="dyn-${f.id}">${f.label}${reqMark}</label><select id="dyn-${f.id}" ${f.required ? 'required aria-required="true"' : ''}><option value="">Seleccione</option>${f.select.map((o) => `<option>${o}</option>`).join('')}</select></div>`;
        }
        return `<div class="field"><label for="dyn-${f.id}">${f.label}${reqMark}</label><input type="text" id="dyn-${f.id}" placeholder="${f.placeholder || ''}" ${f.currency ? 'data-currency="true"' : ''} ${f.required ? 'required aria-required="true"' : ''} /></div>`;
      })
      .join('');
    initCurrencyInputs(dynamicFields);
    goToStep(2);
    document.getElementById('q-nombre').focus();
  });

  wizard.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.back, 10)));
  });

  function setFieldError(input, errorEl, message) {
    if (errorEl) errorEl.textContent = message;
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  toStep3.addEventListener('click', () => {
    const nombreEl = document.getElementById('q-nombre');
    const telefonoEl = document.getElementById('q-telefono');
    const telefonoError = document.getElementById('q-telefono-error');
    const terminosEl = document.getElementById('q-terminos');
    const nombre = nombreEl.value.trim();
    const telefono = telefonoEl.value.trim();

    let valid = true;
    if (!nombre) { valid = false; }
    if (!telefono || !PHONE_RE.test(telefono)) {
      setFieldError(telefonoEl, telefonoError, 'Ingrese un teléfono válido (solo números, mínimo 7 dígitos)');
      valid = false;
    } else {
      setFieldError(telefonoEl, telefonoError, '');
    }

    const product = findProduct(state.product);
    const missingRequired = [];
    product.fields.filter((f) => f.required).forEach((f) => {
      const el = document.getElementById(`dyn-${f.id}`);
      if (el && !el.value.trim()) missingRequired.push(f.label);
    });

    if (!nombre || !valid) {
      showToast('Por favor complete nombre y un teléfono válido para continuar', 'error');
      return;
    }
    if (missingRequired.length) {
      showToast(`Complete: ${missingRequired.join(', ')}`, 'error');
      return;
    }
    if (!terminosEl.checked) {
      showToast('Debe aceptar la política de privacidad para continuar', 'error');
      return;
    }

    state.data = {
      nombre,
      telefono,
      ciudad: document.getElementById('q-ciudad').value.trim(),
      email: document.getElementById('q-email').value.trim(),
      notas: document.getElementById('q-notas').value.trim(),
      extra: {},
    };
    product.fields.forEach((f) => {
      const el = document.getElementById(`dyn-${f.id}`);
      if (el && el.value) state.data.extra[f.label] = el.value;
    });

    const rows = [
      ['Producto', product.name],
      ['Nombre', state.data.nombre],
      ['Teléfono', state.data.telefono],
      ['Ciudad', state.data.ciudad || '—'],
      ['Correo', state.data.email || '—'],
      ...Object.entries(state.data.extra).map(([k, v]) => [k, v]),
      ['Notas', state.data.notas || '—'],
    ];
    summaryCard.innerHTML = rows.map(([k, v]) => `<div class="summary-row"><span>${k}</span><span>${escapeHtml(v)}</span></div>`).join('');
    goToStep(3);
  });

  document.getElementById('sendWhatsapp').addEventListener('click', () => {
    const product = findProduct(state.product);
    const lines = [
      `Hola, quiero cotizar *${product.name}* con Global Seguros.`,
      `Nombre: ${state.data.nombre}`,
      `Teléfono: ${state.data.telefono}`,
      state.data.ciudad ? `Ciudad: ${state.data.ciudad}` : '',
      state.data.email ? `Correo: ${state.data.email}` : '',
      ...Object.entries(state.data.extra).map(([k, v]) => `${k}: ${v}`),
      state.data.notas ? `Notas: ${state.data.notas}` : '',
    ].filter(Boolean);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showWizardSuccess();
  });

  function showWizardSuccess() {
    wizard.querySelectorAll('.wizard-step').forEach((s) => s.classList.toggle('active', s.dataset.step === 'success'));
    wizard.querySelectorAll('.wp-step').forEach((s) => s.classList.add('done'));
    document.getElementById('wpLine1').classList.add('filled');
    document.getElementById('wpLine2').classList.add('filled');
  }

  document.getElementById('restartWizard').addEventListener('click', () => {
    state.product = null;
    state.data = {};
    document.getElementById('wizardForm').reset();
    productGrid.querySelectorAll('.product-pick').forEach((b) => b.classList.remove('selected'));
    toStep2.disabled = true;
    wizard.querySelectorAll('.wp-step').forEach((s) => s.classList.remove('done'));
    document.getElementById('wpLine1').classList.remove('filled');
    document.getElementById('wpLine2').classList.remove('filled');
    goToStep(1);
  });

}

/* ================= CURRENCY INPUTS ================= */
function initCurrencyInputs(scope = document) {
  scope.querySelectorAll('input[data-currency="true"]').forEach((input) => {
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '');
      input.value = digits ? Number(digits).toLocaleString('es-CO') : '';
    });
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

/* ================= UTIL ================= */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
