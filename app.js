/* ============================================================
   GLOBAL SEGUROS Y CIA LTDA — v2 interactions
   ============================================================ */

/* ---------------------------------------------------------
   EMAILJS CONFIGURATION
   1. Cree una cuenta gratuita en https://www.emailjs.com
   2. Reemplace los valores TU_... por los reales del panel.
   3. Mientras no estén configurados, el sitio usa un modo
      demo (toast informativo) y WhatsApp sigue funcionando
      normalmente, sin depender de EmailJS.
--------------------------------------------------------- */
const EMAILJS_CONFIG = {
  publicKey:        'TU_PUBLIC_KEY',
  serviceId:        'TU_SERVICE_ID',
  templateCotizador:'TU_TEMPLATE_COTIZADOR',
  templateContacto: 'TU_TEMPLATE_CONTACTO',
};
const EMAILJS_READY = !Object.values(EMAILJS_CONFIG).some((v) => v.startsWith('TU_'));

const WHATSAPP_NUMBER = '573112959002';

document.addEventListener('DOMContentLoaded', () => {
  if (EMAILJS_READY && window.emailjs) emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

  initNavbar();
  initRevealOnScroll();
  initStatsCounters();
  initTabs();
  initCardTilt();
  initCotizador();
  initContactForm();
  initBackToTop();
  initFooterTabLinks();
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
  };

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
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

/* ================= STATS COUNTERS ================= */
function initStatsCounters() {
  const nums = document.querySelectorAll('.stat-number');
  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('es-CO');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  nums.forEach((n) => io.observe(n));
}

/* ================= SERVICIOS TABS ================= */
function initTabs() {
  const wrapper = document.getElementById('tabsWrapper');
  if (!wrapper) return;
  const indicator = document.getElementById('tabIndicator');
  const btns = wrapper.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  const moveIndicator = (btn) => {
    indicator.style.width = `${btn.offsetWidth}px`;
    indicator.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
  };

  window.activateTab = (name) => {
    const btn = wrapper.querySelector(`[data-tab="${name}"]`);
    if (!btn) return;
    btns.forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
    panels.forEach((p) => {
      const active = p.id === `panel-${name}`;
      p.classList.toggle('active', active);
      p.toggleAttribute('hidden', !active);
    });
    moveIndicator(btn);
  };

  btns.forEach((btn) => btn.addEventListener('click', () => window.activateTab(btn.dataset.tab)));
  window.addEventListener('resize', () => moveIndicator(wrapper.querySelector('.tab-btn.active')));
  requestAnimationFrame(() => moveIndicator(wrapper.querySelector('.tab-btn.active')));
}

function initFooterTabLinks() {
  document.querySelectorAll('[data-tab-link]').forEach((a) => {
    a.addEventListener('click', () => {
      if (window.activateTab) window.activateTab(a.dataset.tabLink);
    });
  });
}

/* ================= CARD TILT ================= */
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.service-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ================= COTIZADOR (WIZARD) ================= */
const PRODUCT_CATALOG = {
  generales: {
    label: 'Seguros y Servicios',
    products: [
      { id: 'autos', name: 'Autos', icon: 'ti-car', fields: [
        { id: 'placa', label: 'Placa del vehículo', placeholder: 'ABC123' },
        { id: 'modelo', label: 'Modelo / Año', placeholder: '2020' },
      ] },
      { id: 'motos', name: 'Motos', icon: 'ti-motorbike', fields: [
        { id: 'placa', label: 'Placa de la moto', placeholder: 'ABC12D' },
        { id: 'cilindraje', label: 'Cilindraje', placeholder: '150cc' },
      ] },
      { id: 'bicicleta', name: 'Bicicleta', icon: 'ti-bike', fields: [
        { id: 'valor', label: 'Valor estimado (COP)', placeholder: '2.000.000', currency: true },
      ] },
      { id: 'hogar', name: 'Hogar', icon: 'ti-home', fields: [
        { id: 'tipoVivienda', label: 'Tipo de vivienda', select: ['Casa', 'Apartamento'] },
      ] },
      { id: 'mascotas', name: 'Mascotas', icon: 'ti-paw', fields: [
        { id: 'mascota', label: 'Tipo de mascota', placeholder: 'Perro, gato...' },
        { id: 'edadMascota', label: 'Edad de la mascota', placeholder: '2 años' },
      ] },
    ],
  },
  financieros: {
    label: 'Cumplimiento y Finanzas',
    products: [
      { id: 'cumplimiento', name: 'Cumplimiento', icon: 'ti-clipboard-check', fields: [
        { id: 'tipoContrato', label: 'Tipo de contrato', placeholder: 'Obra pública, suministro...' },
        { id: 'valorContrato', label: 'Valor del contrato (COP)', placeholder: '50.000.000', currency: true },
      ] },
      { id: 'arrendamiento', name: 'Arrendamiento', icon: 'ti-key', fields: [
        { id: 'canon', label: 'Canon mensual (COP)', placeholder: '1.500.000', currency: true },
        { id: 'ciudadInmueble', label: 'Ciudad del inmueble', placeholder: 'Bogotá D.C.' },
      ] },
      { id: 'educativo', name: 'Educativo', icon: 'ti-school', fields: [
        { id: 'beneficiario', label: 'Nombre del beneficiario', placeholder: 'Nombre del hijo/a' },
        { id: 'edadBeneficiario', label: 'Edad del beneficiario', placeholder: '8 años' },
      ] },
    ],
  },
  personas: {
    label: 'Personas y Familia',
    products: [
      { id: 'salud', name: 'Salud', icon: 'ti-stethoscope', fields: [
        { id: 'edad', label: 'Edad', placeholder: '35' },
      ] },
      { id: 'vida', name: 'Vida', icon: 'ti-shield-heart', fields: [
        { id: 'edad', label: 'Edad', placeholder: '35' },
        { id: 'capital', label: 'Capital deseado (COP)', placeholder: '100.000.000', currency: true },
      ] },
      { id: 'exequial', name: 'Exequial', icon: 'ti-flower', fields: [
        { id: 'numPersonas', label: 'Personas a asegurar', placeholder: '4' },
      ] },
      { id: 'viaje', name: 'Viaje', icon: 'ti-plane', fields: [
        { id: 'destino', label: 'Destino', placeholder: 'España' },
        { id: 'fechas', label: 'Fechas del viaje', placeholder: '10 - 20 de octubre' },
      ] },
      { id: 'rc-medicos', name: 'RC Médicos & Profesionales', icon: 'ti-scale', fields: [
        { id: 'profesion', label: 'Profesión', placeholder: 'Médico, abogado...' },
        { id: 'experiencia', label: 'Años de experiencia', placeholder: '5' },
      ] },
    ],
  },
  empresariales: {
    label: 'Seguros Empresariales',
    products: [
      { id: 'pymes', name: 'Pymes', icon: 'ti-building-store', fields: [
        { id: 'sector', label: 'Sector de la empresa', placeholder: 'Comercio, servicios...' },
        { id: 'empleados', label: 'Número de empleados', placeholder: '10' },
      ] },
      { id: 'copropiedad', name: 'Copropiedad', icon: 'ti-building-community', fields: [
        { id: 'unidades', label: 'Número de unidades', placeholder: '40' },
        { id: 'ciudadCopropiedad', label: 'Ciudad', placeholder: 'Bogotá D.C.' },
      ] },
      { id: 'transporte', name: 'Transporte de Mercancías', icon: 'ti-truck', fields: [
        { id: 'tipoCarga', label: 'Tipo de carga', placeholder: 'General, refrigerada...' },
        { id: 'valorCarga', label: 'Valor asegurado (COP)', placeholder: '30.000.000', currency: true },
      ] },
      { id: 'colectivas', name: 'Colectivas y Beneficios Corporativos', icon: 'ti-users', fields: [
        { id: 'empleadosColectivo', label: 'Número de empleados', placeholder: '25' },
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
function findCategoryOf(id) {
  for (const [key, cat] of Object.entries(PRODUCT_CATALOG)) {
    if (cat.products.some((pr) => pr.id === id)) return key;
  }
  return null;
}

function initCotizador() {
  const wizard = document.getElementById('wizard');
  if (!wizard) return;

  const state = { category: 'generales', product: null, data: {} };

  const catPills = document.getElementById('wizardCatPills');
  const productGrid = document.getElementById('wizardProductGrid');
  const toStep2 = document.getElementById('toStep2');
  const toStep3 = document.getElementById('toStep3');
  const dynamicFields = document.getElementById('dynamicFields');
  const selectionRecap = document.getElementById('selectionRecap');
  const summaryCard = document.getElementById('summaryCard');

  function renderProducts(cat) {
    const list = PRODUCT_CATALOG[cat].products;
    productGrid.innerHTML = list
      .map((p) => `<button type="button" class="product-pick" data-id="${p.id}"><i class="ti ${p.icon}"></i><span>${p.name}</span></button>`)
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

  catPills.querySelectorAll('.cat-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      catPills.querySelectorAll('.cat-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      state.category = pill.dataset.cat;
      state.product = null;
      toStep2.disabled = true;
      renderProducts(state.category);
    });
  });
  renderProducts(state.category);

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
        if (f.select) {
          return `<div class="field"><label>${f.label}</label><select id="dyn-${f.id}"><option value="">Seleccione</option>${f.select.map((o) => `<option>${o}</option>`).join('')}</select></div>`;
        }
        return `<div class="field"><label>${f.label}</label><input type="text" id="dyn-${f.id}" placeholder="${f.placeholder || ''}" ${f.currency ? 'data-currency="true"' : ''} /></div>`;
      })
      .join('');
    initCurrencyInputs(dynamicFields);
    goToStep(2);
  });

  wizard.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.back, 10)));
  });

  toStep3.addEventListener('click', () => {
    const nombre = document.getElementById('q-nombre').value.trim();
    const telefono = document.getElementById('q-telefono').value.trim();
    if (!nombre || !telefono) {
      showToast('Por favor complete nombre y teléfono para continuar', 'error');
      return;
    }
    const product = findProduct(state.product);
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
      ...Object.entries(state.data.extra).map(([k, v]) => `${k}: ${v}`),
      state.data.notas ? `Notas: ${state.data.notas}` : '',
    ].filter(Boolean);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showWizardSuccess();
  });

  document.getElementById('sendEmail').addEventListener('click', () => {
    const btn = document.getElementById('sendEmail');
    const btnText = document.getElementById('sendEmailText');
    const product = findProduct(state.product);
    btn.disabled = true;
    btnText.textContent = 'Enviando...';

    const templateParams = {
      from_name: state.data.nombre,
      from_phone: state.data.telefono,
      from_email: state.data.email || 'No proporcionado',
      from_city: state.data.ciudad || 'No proporcionada',
      seguro_tipo: product.name,
      seguro_detail: Object.entries(state.data.extra).map(([k, v]) => `${k}: ${v}`).join(' | ') || 'Sin información adicional',
      from_notes: state.data.notas || 'Ninguna',
      to_name: state.data.nombre,
      reply_to: state.data.email || '',
    };

    const finish = () => { btn.disabled = false; btnText.textContent = 'Enviar por correo'; };

    if (!EMAILJS_READY || !window.emailjs) {
      setTimeout(() => {
        finish();
        showToast('Modo demo: configure EmailJS en app.js para envío real de correos', 'info');
        showWizardSuccess();
      }, 900);
      return;
    }
    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateCotizador, templateParams)
      .then(() => { finish(); showToast('¡Solicitud enviada por correo!', 'success'); showWizardSuccess(); })
      .catch((err) => { console.error('EmailJS error (cotizador):', err); finish(); showToast('Error al enviar. Intente por WhatsApp.', 'error'); });
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
      const cat = findCategoryOf(id);
      if (!cat) return;
      document.getElementById('cotizador').scrollIntoView({ behavior: 'smooth' });
      const pill = catPills.querySelector(`[data-cat="${cat}"]`);
      if (pill) {
        catPills.querySelectorAll('.cat-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        state.category = cat;
        renderProducts(cat);
      }
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
function initContactForm() {
  const form = document.getElementById('contactoForm');
  if (!form) return;
  const submitBtn = document.getElementById('contactSubmitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateContactForm(form)) return;

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Enviando...';

    const templateParams = {
      from_name: form.nombre.value.trim(),
      from_email: form.email.value.trim(),
      from_phone: form.telefono.value.trim() || 'No proporcionado',
      asunto: form.asunto.value,
      message: form.mensaje.value.trim(),
      to_name: form.nombre.value.trim(),
      reply_to: form.email.value.trim(),
    };

    const showSuccess = () => {
      form.setAttribute('hidden', '');
      document.getElementById('contactSuccess').removeAttribute('hidden');
    };

    if (!EMAILJS_READY || !window.emailjs) {
      setTimeout(() => {
        showSuccess();
        showToast('Modo demo: configure EmailJS en app.js para envío real', 'info');
      }, 900);
      return;
    }

    try {
      await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateContacto, templateParams);
      showSuccess();
      showToast('¡Mensaje enviado con éxito!', 'success');
    } catch (err) {
      console.error('EmailJS error (contacto):', err);
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Enviar mensaje';
      showToast('Error al enviar. Inténtelo de nuevo o escríbanos por WhatsApp.', 'error');
    }
  });

  form.querySelectorAll('input, textarea, select').forEach((input) => {
    input.addEventListener('input', () => {
      const err = document.getElementById(`${input.id}-error`);
      if (err) err.textContent = '';
    });
  });
}

function validateContactForm(form) {
  let valid = true;
  const setError = (id, msg) => {
    const el = document.getElementById(`${id}-error`);
    if (el) el.textContent = msg;
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
