// Converted from main.js to TypeScript for Astro project
import { BESTSELLERS, SAMPLES, type Product } from '../data/products.js';
import clarity from '@microsoft/clarity';

interface SampleRequest {
  id: string;
  clientSecret: string;
  name: string;
  email: string;
  phone: string;
  zip: string;
  notes: string;
  picks: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

/* ===== Micro-interactions ===== */

/* Reveal on scroll */
export function initRevealOnScroll(): void {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('opacity-100', 'translate-y-0');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-4', 'transition', 'duration-700', 'ease-smooth');
    io.observe(el);
  });
}

/* FAQ accordion (button[aria-controls]) */
export function initFAQ(): void {
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element)?.closest('button[aria-controls]') as HTMLButtonElement;
    if (!btn) return;
    
    const panelId = btn.getAttribute('aria-controls');
    if (!panelId) return;
    
    const panel = document.getElementById(panelId) as HTMLElement;
    if (!panel) return;
    
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', (!expanded).toString());
    panel.hidden = expanded;
  });
}

/* ===== Simple Mobile Menu ===== */
export function initMobileMenu(): void {
  const btn = document.getElementById('mobile-menu-btn') as HTMLButtonElement;
  const menu = document.getElementById('mobile-menu') as HTMLElement;
  const overlay = document.getElementById('mobile-overlay') as HTMLElement;
  const closeBtn = document.getElementById('mobile-menu-close') as HTMLButtonElement;
  
  if (!btn || !menu || !overlay) return;
  if (btn.dataset.menuInitialized === 'true') return;
  btn.dataset.menuInitialized = 'true';
  
  function open(): void {
    menu.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    const [openIcon, closeIcon] = btn.querySelectorAll('svg');
    if (openIcon) openIcon.classList.add('hidden');
    if (closeIcon) closeIcon.classList.remove('hidden');
  }
  
  function close(): void {
    menu.classList.add('hidden');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    const [openIcon, closeIcon] = btn.querySelectorAll('svg');
    if (openIcon) openIcon.classList.remove('hidden');
    if (closeIcon) closeIcon.classList.add('hidden');
  }
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    menu.classList.contains('hidden') ? open() : close();
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 1024) close(); });
}

/* ===== Bestsellers Carousel ===== */
export function initBestsellersCarousel(): void {
  const grid = document.getElementById('bestsellers-grid') as HTMLElement;
  if (!grid) return;

  const prevBtn = document.getElementById('bestsellers-prev') as HTMLButtonElement;
  const nextBtn = document.getElementById('bestsellers-next') as HTMLButtonElement;

  grid.innerHTML = BESTSELLERS.map(p => `
    <article class="reveal rounded-2xl bg-white p-4 shadow-soft flex flex-col snap-start">
      <a
        href="/products/${p.id}"
        data-product-link="true"
        data-product-id="${p.id}"
        data-product-name="${p.name}"
        class="flex flex-col h-full"
      >
        <div class="relative aspect-square overflow-hidden rounded-xl bg-brand-sand">
          <img src="${p.img}" alt="${p.name} European white oak flooring" class="h-full w-full object-cover" loading="lazy">
        </div>
        <h3 class="mt-4 font-semibold text-lg">${p.name}</h3>
        <p class="mt-2 text-sm text-brand-ink/70 flex-grow">${p.desc}</p>
        <span class="mt-4 inline-flex items-center justify-center rounded-2xl bg-brand-brass px-4 py-2 text-white shadow-soft hover:opacity-90 transition">View Product</span>
      </a>
    </article>
  `).join('');

  const scrollStep = (): number => grid.clientWidth;
  prevBtn?.addEventListener('click', () => grid.scrollBy({ left: -scrollStep(), behavior: 'smooth' }));
  nextBtn?.addEventListener('click', () => grid.scrollBy({ left: scrollStep(), behavior: 'smooth' }));

  // Capture product link clicks with product metadata for analytics/debugging.
  grid.addEventListener('click', (e) => {
    const target = e.target as Element;
    const link = target.closest('a[data-product-link="true"]') as HTMLAnchorElement | null;
    if (!link) return;

    const payload = {
      section: 'bestsellers',
      productId: link.dataset.productId || '',
      productName: link.dataset.productName || '',
      productLink: link.href
    };

    // GA4 event if gtag is available.
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('event', 'select_item', {
        item_list_name: 'Bestsellers',
        item_id: payload.productId,
        item_name: payload.productName,
        item_category: 'hardwood-flooring',
        link_url: payload.productLink
      });
    }

    // Also emit a custom DOM event for other integrations.
    window.dispatchEvent(new CustomEvent('product-link-click', { detail: payload }));
  });
}

/* ===== Samples Modal: Data + UI ===== */
export function initSamplesModal(): void {
  const modal = document.getElementById('samples-modal') as HTMLElement;
  if (!modal) return;

  const MAX = 6;
  let PER_PAGE = 6;

  const el = {
    backdrop: document.getElementById('samples-backdrop') as HTMLElement,
    modal: document.getElementById('samples-modal') as HTMLElement,
    close: document.getElementById('samples-close') as HTMLButtonElement,
    tabs: document.querySelectorAll('#samples-tabs [role="tab"]') as NodeListOf<HTMLButtonElement>,
    grid: document.getElementById('samples-grid') as HTMLElement,
    count: document.getElementById('selected-count') as HTMLElement,
    max: document.getElementById('max-allowed') as HTMLElement,
    tray: document.getElementById('selection-tray') as HTMLElement,
    chips: document.getElementById('selection-chips') as HTMLElement,
    toStep2: document.getElementById('to-step-2') as HTMLButtonElement,
    clearAll: document.getElementById('clear-all') as HTMLButtonElement,
    step1: document.getElementById('step-1') as HTMLElement,
    step2: document.getElementById('step-2') as HTMLElement,
    review: document.getElementById('review-list') as HTMLElement,
    backTo1: document.getElementById('back-to-step-1') as HTMLButtonElement,
    form: document.getElementById('samples-form') as HTMLFormElement,
    dots: document.querySelectorAll('.step-dot') as NodeListOf<HTMLElement>,
    samplesPrev: document.getElementById('samples-prev') as HTMLButtonElement,
    samplesNext: document.getElementById('samples-next') as HTMLButtonElement,
  };
  
  if (el.max) el.max.textContent = MAX.toString();

  let activeCat = 'hardwood';
  let selected = new Map<string, Product>();
  let currentPage = 0;

  function updatePerPage(): void {
    PER_PAGE = window.innerWidth < 1024 ? 2 : 6;
  }
  updatePerPage();

  function openModal(): void {
    if (el.backdrop && el.modal) {
      el.backdrop.classList.remove('hidden');
      el.modal.classList.remove('hidden', 'opacity-0', 'invisible');
      el.modal.classList.add('opacity-100', 'visible');
      document.body.style.overflow = 'hidden';
      renderGrid();
      updateUI();
    }
  }
  
  function closeModal(): void {
    if (el.backdrop && el.modal) {
      el.backdrop.classList.add('hidden');
      el.modal.classList.add('hidden');
      el.modal.classList.remove('opacity-100', 'visible');
      el.modal.classList.add('opacity-0', 'invisible');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('[data-open-samples]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  });
  
  el.backdrop?.addEventListener('click', closeModal);
  el.close?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  window.addEventListener('resize', () => {
    updatePerPage();
    currentPage = 0;
    if (el.modal && !el.modal.classList.contains('opacity-0')) renderGrid();
  });

  el.tabs?.forEach(t => {
    t.addEventListener('click', () => {
      if (t.disabled) return;
      el.tabs.forEach(x => {
        const isActive = (x === t);
        x.setAttribute('aria-selected', isActive.toString());
        x.dataset.active = isActive ? 'true' : 'false';
        x.classList.toggle('bg-white', isActive);
        x.classList.toggle('shadow-soft', isActive);
        x.classList.toggle('text-brand-coal', isActive);
      });
      activeCat = t.dataset.cat || 'hardwood';
      renderGrid();
    });
  });

  function renderGrid(): void {
    if (!el.grid) return;
    
    const isMobile = window.innerWidth < 1024;
    const allItems = SAMPLES.filter(p => p.cat === activeCat);
    let itemsToRender = allItems;

    if (!isMobile) {
      const start = currentPage * PER_PAGE;
      itemsToRender = allItems.slice(start, start + PER_PAGE);
    }

    el.grid.innerHTML = itemsToRender.map(p => cardHTML(p, selected.has(p.id))).join('');
    el.grid.querySelectorAll('[data-pick]').forEach(btn => {
      const pickBtn = btn as HTMLButtonElement;
      pickBtn.addEventListener('click', () => togglePick(pickBtn.dataset.pick || ''));
    });
    updatePaginationButtons();
  }
  
  function cardHTML(p: Product, isSelected: boolean): string {
    return `
    <article class="group rounded-2xl bg-white p-3 shadow-soft relative">
      <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-sand">
        <img src="${p.img}" alt="${p.name}" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy">
        ${p.tag ? `<span class="absolute top-3 left-3 rounded-full bg-brand-oak px-2 py-0.5 text-[11px] font-semibold text-white shadow-soft">${p.tag} Slat</span>` : ''}
        <button data-pick="${p.id}" class="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs shadow-soft hover:bg-white transition">
          ${isSelected ? 'Remove' : 'Add Sample'}
        </button>
      </div>
      <h4 class="mt-3 text-sm font-medium">${p.name}</h4>
    </article>`;
  }

  function togglePick(id: string): void {
    const p = SAMPLES.find(x => x.id === id);
    if (!p) return;
    if (selected.has(id)) { 
      selected.delete(id); 
    } else {
      if (selected.size >= MAX) { 
        if (el.count) shake(el.count); 
        return; 
      }
      selected.set(id, p);
    }
    renderGrid();
    updateUI();
  }
  
  function shake(node: HTMLElement): void {
    node.animate([
      { transform: 'translateX(0)' }, 
      { transform: 'translateX(-4px)' }, 
      { transform: 'translateX(4px)' }, 
      { transform: 'translateX(0)' }
    ], { duration: 250 });
  }

  function updateUI(): void {
    if (el.count) el.count.textContent = selected.size.toString();
    if (el.tray) el.tray.classList.toggle('hidden', selected.size === 0);
    if (el.toStep2) el.toStep2.disabled = selected.size === 0;

    if (el.chips) {
      el.chips.innerHTML = '';
      selected.forEach((p) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs shadow-soft';
        chip.innerHTML = `<span class="truncate max-w[150px]">${p.name}</span>
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor"><path stroke-width="1.7" d="M6 6l12 12M18 6L6 18"/></svg>`;
        chip.addEventListener('click', () => { selected.delete(p.id); renderGrid(); updateUI(); });
        el.chips.appendChild(chip);
      });
    }
  }

  el.clearAll?.addEventListener('click', () => {
    selected.clear(); 
    renderGrid(); 
    updateUI();
  });

  function updatePaginationButtons(): void {
    const isMobile = window.innerWidth < 1024;
    const paginationContainer = el.samplesPrev?.parentElement;
    if (paginationContainer) {
      paginationContainer.classList.toggle('hidden', isMobile);
    }

    if (!isMobile && el.samplesPrev && el.samplesNext) {
      const totalPages = Math.ceil(SAMPLES.filter(p => p.cat === activeCat).length / PER_PAGE);
      el.samplesPrev.disabled = currentPage === 0;
      el.samplesNext.disabled = currentPage >= totalPages - 1;
    }
  }
  
  el.samplesPrev?.addEventListener('click', () => {
    if (currentPage > 0) { currentPage--; renderGrid(); }
  });
  
  el.samplesNext?.addEventListener('click', () => {
    if (window.innerWidth >= 1024) {
      const totalPages = Math.ceil(SAMPLES.filter(p => p.cat === activeCat).length / PER_PAGE);
      if (currentPage < totalPages - 1) { currentPage++; renderGrid(); }
    }
  });

  el.toStep2?.addEventListener('click', () => {
    if (el.dots && el.dots.length >= 2) {
      el.dots[0].className = 'step-dot size-6 grid place-items-center rounded-full bg-brand-sand text-brand-coal';
      el.dots[1].className = 'step-dot size-6 grid place-items-center rounded-full bg-brand-brass text-white';
    }
    
    if (el.step1 && el.step2) {
      el.step1.classList.add('hidden');
      el.step2.classList.remove('hidden');
    }

    if (el.review) {
      el.review.innerHTML = '';
      selected.forEach(p => {
        const li = document.createElement('li');
        li.className = 'flex items-center gap-3';
        li.innerHTML = `<img src="${p.img}" alt="${p.name}" class="h-10 w-10 rounded-lg object-cover"><span>${p.name}</span>`;
        el.review.appendChild(li);
      });
    }
  });
  
  el.backTo1?.addEventListener('click', () => {
    if (el.dots && el.dots.length >= 2) {
      el.dots[0].className = 'step-dot size-6 grid place-items-center rounded-full bg-brand-brass text-white';
      el.dots[1].className = 'step-dot size-6 grid place-items-center rounded-full bg-brand-sand text-brand-coal';
    }
    
    if (el.step2 && el.step1) {
      el.step2.classList.add('hidden');
      el.step1.classList.remove('hidden');
    }
  });

  // Form submission handler
  el.form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(el.form);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    const picks = Array.from(selected.values()).map(p => p.name);

    if (!data.name || !data.email || !data.phone || !data.zip || picks.length === 0) {
      alert('Please complete all fields and choose at least one sample.');
      return;
    }

    // Email-only submission via Netlify Function (no local storage)
    const company = (data['company'] || '').toString(); // honeypot
    const submitBtn = el.form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    const successEl = document.getElementById('samples-success');

    // Basic throttle: limit to one submission per minute
    const last = Number(localStorage.getItem('lastSampleSubmitTs') || '0');
    const now = Date.now();
    if (now - last < 60_000) {
      alert('Please wait a moment before submitting again.');
      return;
    }

    submitBtn && (submitBtn.disabled = true);
    submitBtn && (submitBtn.textContent = 'Sending…');

    (async () => {
      try {
        const resp = await fetch('/.netlify/functions/send-sample-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            zip: data.zip,
            notes: data.notes || '',
            picks,
            honeypot: company
          })
        });
        const j = await resp.json().catch(() => ({}));
        if (resp.ok && j && (j.ok || j.skipped)) {
          localStorage.setItem('lastSampleSubmitTs', String(now));
          if (successEl) {
            successEl.textContent = 'Thanks — your sample request was sent! We\'ll be in touch soon.';
            successEl.classList.remove('hidden');
          } else {
            alert('Thanks — your sample request was sent!');
          }
          el.form.reset();
          selected.clear();
        } else {
          console.warn('Email send failed', j);
          alert('There was a problem sending your request. Please try again later or call us.');
        }
      } catch (err) {
        console.warn('Email send error', err);
        alert('There was a problem sending your request. Please try again later.');
      } finally {
        submitBtn && (submitBtn.disabled = false);
        submitBtn && (submitBtn.textContent = 'Request Free Samples');
      }
    })();

  // Keep modal open to show success; user can close manually

  // (Removed obsolete redirect using undefined id/clientSecret variables.)
  });
}

/* ===== Flooring Calculator ===== */
export function initFlooringCalculator(): void {
  const form = document.getElementById('flooring-calculator-form') as HTMLFormElement;
  if (!form) return;

  const totalSqftEl = document.getElementById('total-sqft') as HTMLInputElement;
  const sqftPerBoxEl = document.getElementById('sqft-per-box') as HTMLInputElement;
  const resultEl = document.getElementById('calculator-result') as HTMLElement;
  const boxesNeededEl = document.getElementById('boxes-needed') as HTMLElement;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const totalSqft = parseFloat(totalSqftEl.value);
    const sqftPerBox = parseFloat(sqftPerBoxEl.value);

    if (isNaN(totalSqft) || isNaN(sqftPerBox) || totalSqft <= 0 || sqftPerBox <= 0) {
      alert('Please enter valid, positive numbers for both fields.');
      return;
    }

    const boxesNeeded = Math.ceil((totalSqft * 1.10) / sqftPerBox);
    if (boxesNeededEl) boxesNeededEl.textContent = boxesNeeded.toString();
    if (resultEl) resultEl.classList.remove('hidden');
  });
}

/* ===== Mobile Navigation ===== */
export function initMobileNavigation(): void {
  const btn = document.getElementById('mobile-nav-toggle') as HTMLButtonElement;
  const panel = document.getElementById('mobile-nav-panel') as HTMLElement;
  const overlay = document.getElementById('mobile-nav-overlay') as HTMLElement;
  const header = document.querySelector('header.sticky') as HTMLElement;
  
  if (!btn || !panel || !overlay) return;

  // accessibility
  btn.setAttribute('aria-expanded','false');
  panel.setAttribute('aria-hidden','true');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transitionMs = prefersReduced ? 0 : 300;

  function setTop(): void {
    const h = header ? Math.round(header.getBoundingClientRect().height) : 0;
    panel.style.top = h + 'px';
    panel.style.maxHeight = `calc(100vh - ${h}px)`;
  }
  setTop();
  window.addEventListener('resize', setTop, { passive: true });

  function swapIcons(isOpen: boolean): void {
    const openI = btn.querySelector('.open-icon') as HTMLElement;
    const closeI = btn.querySelector('.close-icon') as HTMLElement;
    if (openI) openI.classList.toggle('hidden', isOpen);
    if (closeI) closeI.classList.toggle('hidden', !isOpen);
  }

  function lockScroll(lock: boolean): void {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    document.body.style.overflow = lock ? 'hidden' : '';
    document.body.style.touchAction = lock ? 'none' : '';
  }

  function openMenu(): void {
    btn.setAttribute('aria-expanded','true');
    panel.setAttribute('aria-hidden','false');
    swapIcons(true);
    setTop();
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
    panel.style.transform = 'translateY(0)';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    lockScroll(true);
    // move focus inside
    setTimeout(() => {
      const f = panel.querySelector('a,button,[tabindex]:not([tabindex="-1"])') as HTMLElement;
      f && f.focus();
    }, 10);
  }

  function closeMenu(): void {
    btn.setAttribute('aria-expanded','false');
    panel.setAttribute('aria-hidden','true');
    swapIcons(false);
    panel.style.transform = 'translateY(-110%)';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
      lockScroll(false);
    }, transitionMs);
  }

  function toggle(): void {
    (btn.getAttribute('aria-expanded') === 'true') ? closeMenu() : openMenu();
  }

  btn.addEventListener('click', toggle);
  overlay.addEventListener('click', closeMenu);
  panel.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });
}

// Image gallery functionality
export function changeMainImage(imageSrc: string, thumbnailBtn: HTMLButtonElement): void {
  // Update main image
  const mainImage = document.getElementById('main-image') as HTMLImageElement;
  if (mainImage) {
    mainImage.src = imageSrc;
  }
  
  // Update active thumbnail
  document.querySelectorAll('.thumbnail-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.remove('border-brand-brass');
    btn.classList.add('border-transparent');
  });
  
  thumbnailBtn.classList.add('active');
  thumbnailBtn.classList.add('border-brand-brass');
  thumbnailBtn.classList.remove('border-transparent');
}

// Make changeMainImage globally available
declare global {
  interface Window {
    changeMainImage: typeof changeMainImage;
  }
}

if (typeof window !== 'undefined') {
  window.changeMainImage = changeMainImage;
}

/* ===== Cookie Consent ===== */
export function initCookieConsent(): void {
  const COOKIE_NAME = 'jamail_cookie_consent';
  const COOKIE_EXPIRY_DAYS = 365;
  
  const banner = document.getElementById('cookie-consent');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');
  
  if (!banner) return;
  
  // Check if user has already made a choice
  const consent = localStorage.getItem(COOKIE_NAME);
  
  // If user previously accepted, load analytics immediately
  if (consent === 'accepted') {
    loadAnalytics();
    return;
  }
  
  if (!consent) {
    // Show banner if no consent recorded
    setTimeout(() => {
      banner.classList.remove('hidden');
      banner.classList.add('show');
    }, 1000); // Show after 1 second
  }
  
  // Handle accept
  acceptBtn?.addEventListener('click', () => {
    localStorage.setItem(COOKIE_NAME, 'accepted');
    setCookie(COOKIE_NAME, 'accepted', COOKIE_EXPIRY_DAYS);
    hideBanner();
    
    // Enable analytics and tracking
    loadAnalytics();
  });

  // Handle decline
  declineBtn?.addEventListener('click', () => {
    localStorage.setItem(COOKIE_NAME, 'declined');
    setCookie(COOKIE_NAME, 'declined', COOKIE_EXPIRY_DAYS);
    hideBanner();
  });
  
  function hideBanner(): void {
    banner?.classList.remove('show');
    setTimeout(() => {
      banner?.classList.add('hidden');
    }, 300);
  }
  
  function setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  }
  
  function loadAnalytics(): void {
    loadMicrosoftClarity();
    loadGoogleAnalytics();
  }

  function loadMicrosoftClarity(): void {
    const clarityId = (import.meta.env.PUBLIC_CLARITY_ID as string | undefined) || 'wcnjrkr6l6';
    if (!clarityId) return;
    clarity.init(clarityId);
  }

  function loadGoogleAnalytics(): void {
    const gaId = (import.meta.env.PUBLIC_GA_ID as string | undefined) || '';
    if (!gaId || gaId === 'G-XXXXXXXXXX') return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]): void {
      (window as any).dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', gaId, {
      'anonymize_ip': true,
      'cookie_flags': 'SameSite=Lax;Secure'
    });
  }
}
