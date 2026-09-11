/* ============================================================
   GLOBAL SEGUROS Y CIA LTDA — v2 interactions
   ============================================================ */

const WHATSAPP_NUMBER = '573112959002';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initRevealOnScroll();
  initAccordion();
  initCotizador();
  initContactForm();
  initBackToTop();
  initFooterAccordionLinks();
});

/* ================= NAVBAR ================= */
function initNavbar() {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

/* ================= SERVICIOS ACCORDION ================= */
/* One category open at a time. Height animates via the CSS grid-rows trick
   (see .accordion-panel) — no JS height math, no keyframes, fully interruptible. */
function initAccordion() {
  const accordion = document.getElementById('servicesAccordion');
  if (!accordion) return;
  const items = Array.from(accordion.querySelectorAll('.accordion-item'));

  window.openAccordionCategory = (cat) => {
    items.forEach((item) => {
      const open = item.dataset.cat === cat;
      item.classList.toggle('open', open);
      item.querySelector('.accordion-header').setAttribute('aria-expanded', String(open));
    });
  };

  items.forEach((item) => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      window.openAccordionCategory(willOpen ? item.dataset.cat : null);
    });
  });
}

function initFooterAccordionLinks() {
  document.querySelectorAll('[data-tab-link]').forEach((a) => {
    a.addEventListener('click', () => {
      if (window.openAccordionCategory) window.openAccordionCategory(a.dataset.tabLink);
    });
  });
}

/* ================= COTIZADOR (WIZARD) ================= */
/* Each product's first field is its primary rating factor and is required —
   a quote request the advisor can't actually price isn't a quote request. */
const PRODUCT_CATALOG = {
  generales: {
    label: 'Seguros y Servicios',
    icon: 'ti-shield',
    products: [
      { id: 'autos', name: 'Autos', icon: 'ti-car', cluster: 'Vehículos', fields: [
        { id: 'placa', label: 'Placa del vehículo', placeholder: 'ABC123', required: true },
        { id: 'modelo', label: 'Modelo / Año', placeholder: '2020' },
      ] },
      { id: 'motos', name: 'Motos', icon: 'ti-motorbike', cluster: 'Vehículos', fields: [
        { id: 'placa', label: 'Placa de la moto', placeholder: 'ABC12D', required: true },
        { id: 'cilindraje', label: 'Cilindraje', placeholder: '150cc' },
      ] },
      { id: 'bicicleta', name: 'Bicicleta', icon: 'ti-bike', cluster: 'Vehículos', fields: [
        { id: 'valor', label: 'Valor estimado (COP)', placeholder: '2.000.000', currency: true, required: true },
      ] },
      { id: 'hogar', name: 'Hogar', icon: 'ti-home', fields: [
        { id: 'tipoVivienda', label: 'Tipo de vivienda', select: ['Casa', 'Apartamento'], required: true },
      ] },
      { id: 'mascotas', name: 'Mascotas', icon: 'ti-paw', fields: [
        { id: 'mascota', label: 'Tipo de mascota', placeholder: 'Perro, gato...', required: true },
        { id: 'edadMascota', label: 'Edad de la mascota', placeholder: '2 años' },
      ] },
    ],
  },
  financieros: {
    label: 'Cumplimiento y Finanzas',
    icon: 'ti-clipboard-check',
    products: [
      { id: 'cumplimiento', name: 'Cumplimiento', icon: 'ti-clipboard-check', fields: [
        { id: 'tipoContrato', label: 'Tipo de contrato', placeholder: 'Obra pública, suministro...' },
        { id: 'valorContrato', label: 'Valor del contrato (COP)', placeholder: '50.000.000', currency: true, required: true },
      ] },
      { id: 'arrendamiento', name: 'Arrendamiento', icon: 'ti-key', fields: [
        { id: 'canon', label: 'Canon mensual (COP)', placeholder: '1.500.000', currency: true, required: true },
        { id: 'ciudadInmueble', label: 'Ciudad del inmueble', placeholder: 'Bogotá D.C.' },
      ] },
      { id: 'educativo', name: 'Educativo', icon: 'ti-school', fields: [
        { id: 'beneficiario', label: 'Nombre del beneficiario', placeholder: 'Nombre del hijo/a' },
        { id: 'edadBeneficiario', label: 'Edad del beneficiario', placeholder: '8 años', required: true },
      ] },
    ],
  },
  personas: {
    label: 'Personas y Familia',
    icon: 'ti-heart',
    products: [
      { id: 'salud', name: 'Salud', icon: 'ti-stethoscope', fields: [
        { id: 'edad', label: 'Edad', placeholder: '35', required: true },
      ] },
      { id: 'vida', name: 'Vida', icon: 'ti-shield-heart', cluster: 'Vida y decesos', fields: [
        { id: 'edad', label: 'Edad', placeholder: '35', required: true },
        { id: 'capital', label: 'Capital deseado (COP)', placeholder: '100.000.000', currency: true },
      ] },
      { id: 'exequial', name: 'Exequial', icon: 'ti-flower', cluster: 'Vida y decesos', fields: [
        { id: 'numPersonas', label: 'Personas a asegurar', placeholder: '4', required: true },
      ] },
      { id: 'viaje', name: 'Viaje', icon: 'ti-plane', fields: [
        { id: 'destino', label: 'Destino', placeholder: 'España', required: true },
        { id: 'fechas', label: 'Fechas del viaje', placeholder: '10 - 20 de octubre' },
      ] },
      { id: 'rc-medicos', name: 'RC Médicos & Profesionales', icon: 'ti-scale', fields: [
        { id: 'profesion', label: 'Profesión', placeholder: 'Médico, abogado...', required: true },
        { id: 'experiencia', label: 'Años de experiencia', placeholder: '5' },
      ] },
    ],
  },
  empresariales: {
    label: 'Seguros Empresariales',
    icon: 'ti-briefcase',
    products: [
      { id: 'pymes', name: 'Pymes', icon: 'ti-building-store', fields: [
        { id: 'sector', label: 'Sector de la empresa', placeholder: 'Comercio, servicios...', required: true },
        { id: 'empleados', label: 'Número de empleados', placeholder: '10' },
      ] },
      { id: 'copropiedad', name: 'Copropiedad', icon: 'ti-building-community', fields: [
        { id: 'unidades', label: 'Número de unidades', placeholder: '40', required: true },
        { id: 'ciudadCopropiedad', label: 'Ciudad', placeholder: 'Bogotá D.C.' },
      ] },
      { id: 'transporte', name: 'Transporte de Mercancías', icon: 'ti-truck', fields: [
        { id: 'tipoCarga', label: 'Tipo de carga', placeholder: 'General, refrigerada...', required: true },
        { id: 'valorCarga', label: 'Valor asegurado (COP)', placeholder: '30.000.000', currency: true },
      ] },
      { id: 'colectivas', name: 'Colectivas y Beneficios Corporativos', icon: 'ti-users', fields: [
        { id: 'empleadosColectivo', label: 'Número de empleados', placeholder: '25', required: true },
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
    let html = '';
    Object.values(PRODUCT_CATALOG).forEach((cat) => {
      const list = cat.products;
      const seen = new Set();
      let inner = '';
      list.forEach((p) => {
        if (p.cluster) {
          if (seen.has(p.cluster)) return; // already emitted as part of its cluster
          seen.add(p.cluster);
          const members = list.filter((x) => x.cluster === p.cluster);
          inner += `<div class="card-cluster"><p class="cluster-heading">${p.cluster}</p><div class="cluster-grid">${members.map(productPickHtml).join('')}</div></div>`;
        } else {
          inner += productPickHtml(p);
        }
      });
      html += `<div class="card-cluster product-category"><p class="cluster-heading category-heading"><i class="ti ${cat.icon}"></i> ${cat.label}</p><div class="cluster-grid">${inner}</div></div>`;
    });
    productGrid.innerHTML = html;
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

  // "Cotizar" buttons on the services grid jump straight into the wizard
  document.querySelectorAll('.service-cta[data-product]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.product;
      document.getElementById('cotizador').scrollIntoView({ behavior: 'smooth' });
      requestAnimationFrame(() => {
        const productBtn = productGrid.querySelector(`[data-id="${id}"]`);
        if (productBtn) productBtn.click();
      });
    });
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
