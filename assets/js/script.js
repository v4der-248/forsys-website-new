/* ============================================================
   FORSYS WEBSITE — SCRIPT.JS
   Single unified script with page-guarded IIFEs
   Extracted from forsys-website-concept.netlify.app
   ============================================================ */

/* ── NAV SHADOW ON SCROLL (all pages) ───────────────────── */
(function () {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20 ? '0 1px 24px rgba(13,13,43,0.10)' : 'none';
  });
})();

/* ── NAV DROPDOWN ACCESSIBILITY (all pages) ─────────────── */
(function () {
  const navItems = document.querySelectorAll('.nav-item');
  if (!navItems.length) return;

  const timers = new WeakMap();

  function openItem(item) {
    clearTimeout(timers.get(item));
    const trigger = item.querySelector('.nav-link[aria-haspopup]');
    item.classList.add('nav-item--open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }

  function scheduleClose(item) {
    timers.set(item, setTimeout(() => {
      const trigger = item.querySelector('.nav-link[aria-haspopup]');
      item.classList.remove('nav-item--open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }, 120));
  }

  function closeAll() {
    navItems.forEach(item => {
      clearTimeout(timers.get(item));
      const trigger = item.querySelector('.nav-link[aria-haspopup]');
      item.classList.remove('nav-item--open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  navItems.forEach(item => {
    const panel = item.querySelector('.mega-menu, .dropdown');

    item.addEventListener('mouseenter', () => openItem(item));
    item.addEventListener('mouseleave', () => scheduleClose(item));

    // Also watch the panel directly — needed for position:fixed mega menus
    // which visually leave the nav-item's hit area between button and panel
    if (panel) {
      panel.addEventListener('mouseenter', () => openItem(item));
      panel.addEventListener('mouseleave', () => scheduleClose(item));
    }

    // Click toggle — keyboard Enter/Space and touch support
    const trigger = item.querySelector('.nav-link[aria-haspopup]');
    if (!trigger) return;
    trigger.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = item.classList.contains('nav-item--open');
      closeAll();
      if (!isOpen) openItem(item);
    });
  });

  // Escape closes all menus and returns focus
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAll();
      const focused = document.activeElement;
      if (focused && focused.closest('.nav-item')) focused.blur();
    }
  });

  // Click outside closes all menus
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-item')) closeAll();
  });
})();

/* ── MOBILE NAV BURGER (all pages) ──────────────────────── */
(function () {
  const nav       = document.getElementById('main-nav');
  const burger    = document.querySelector('.nav-burger');
  const navCenter = document.querySelector('.nav-center');
  if (!nav || !burger || !navCenter) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  // Close button injected at top of drawer
  const closeBtn = document.createElement('button');
  closeBtn.className = 'nav-mob-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  closeBtn.addEventListener('click', () => closeNav());

  // Track whether nav-center is currently appended to body
  let movedToBody = false;

  function openNav() {
    // Move nav-center to body to escape nav's backdrop-filter containing block
    if (!movedToBody) {
      document.body.appendChild(navCenter);
      movedToBody = true;
    }
    navCenter.prepend(closeBtn);
    navCenter.classList.add('mob-drawer-open');
    nav.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navCenter.classList.remove('mob-drawer-open');
    if (closeBtn.parentNode) closeBtn.parentNode.removeChild(closeBtn);
    // Move nav-center back into nav for desktop behaviour
    nav.appendChild(navCenter);
    movedToBody = false;
    nav.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    navCenter.querySelectorAll('.nav-item.mob-open').forEach(i => i.classList.remove('mob-open'));
  }

  burger.addEventListener('click', () => nav.classList.contains('nav-open') ? closeNav() : openNav());
  backdrop.addEventListener('click', closeNav);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  // Mobile accordion for each nav section
  navCenter.addEventListener('click', e => {
    const trigger = e.target.closest('.nav-link[aria-haspopup]');
    if (!trigger || window.innerWidth > 1024) return;
    e.preventDefault(); e.stopPropagation();
    const item   = trigger.closest('.nav-item');
    const isOpen = item.classList.contains('mob-open');
    navCenter.querySelectorAll('.nav-item.mob-open').forEach(i => i.classList.remove('mob-open'));
    if (!isOpen) item.classList.add('mob-open');
  });

  // Close drawer when a nav link is followed
  navCenter.addEventListener('click', e => {
    if (e.target.closest('a[href]') && window.innerWidth <= 1024) closeNav();
  });
})();

/* ── HOMEPAGE ────────────────────────────────────────────── */
if (document.querySelector('.page-home')) {
  (function () {
    // Hero slideshow
    let cur = 0;
    const titles = document.querySelectorAll('.slide-title');
    const subs   = document.querySelectorAll('.slide-sub');
    const dots   = document.querySelectorAll('.slide-dot');

    function goTo(i) {
      titles[cur].classList.remove('active');
      subs[cur].classList.remove('active');
      dots[cur].classList.remove('active');
      cur = i;
      titles[cur].classList.add('active');
      subs[cur].classList.add('active');
      dots[cur].classList.add('active');
    }

    dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.idx)));
    setInterval(() => goTo((cur + 1) % titles.length), 4000);

    // Platform tabs + sliding indicator
    const ptabs = document.querySelectorAll('.ptab');
    const tabSlider = document.querySelector('.ptab-slider');
    const platformsSection = document.querySelector('.platforms');
    const tabMap = { sf: 'tab-sf', conga: 'tab-conga', oracle: 'tab-oracle', other: 'tab-other' };

    function moveSlider(tab) {
      if (!tabSlider) return;
      tabSlider.style.left  = tab.offsetLeft + 'px';
      tabSlider.style.width = tab.offsetWidth + 'px';
    }

    // Position slider on initial active tab without triggering the transition
    const defaultTab = document.querySelector('.platforms .ptab.active');
    if (tabSlider && defaultTab) {
      tabSlider.style.transition = 'none';
      moveSlider(defaultTab);
      if (platformsSection) platformsSection.classList.add('tabs-js-ready');
      // Re-enable transition after two animation frames so the initial position is painted
      requestAnimationFrame(() => requestAnimationFrame(() => {
        tabSlider.style.transition = '';
      }));
    }

    ptabs.forEach(tab => tab.addEventListener('click', () => {
      ptabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.platform-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      moveSlider(tab);
      const tabId = tabMap[tab.dataset.tab];
      if (tabId) document.getElementById(tabId).classList.add('active');
    }));

    // Accordion (within platform tabs) — toggle active sibling
    document.querySelectorAll('.platforms .accord-item').forEach(item => {
      const header = item.querySelector('.accord-header');
      if (!header) return;
      header.addEventListener('click', () => {
        const siblings = item.closest('.platform-content').querySelectorAll('.accord-item');
        const isAlreadyActive = item.classList.contains('active');
        siblings.forEach(i => i.classList.remove('active'));
        if (!isAlreadyActive) item.classList.add('active');
      });
    });

    // Scroll-fade entrance for cards
    const fadeEls = document.querySelectorAll('.wwd-card, .sol-card, .ind-card, .partner-card, .split-card');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const i = Array.from(fadeEls).indexOf(entry.target) % 4;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 70);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    fadeEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      obs.observe(el);
    });
  })();
}

/* ── SERVICES PAGES ──────────────────────────────────────── */
if (document.querySelector('.page-services')) {
  (function () {
    // Stage rail — node + panel switching
    const nodes  = document.querySelectorAll('.stage-node');
    const panels = document.querySelectorAll('.stage-panel');

    function activateStage(stageId) {
      nodes.forEach(n => {
        const active = n.dataset.stage === stageId;
        n.classList.toggle('is-active', active);
        n.setAttribute('aria-selected', String(active));
      });
      panels.forEach(p => {
        p.classList.toggle('is-active', p.dataset.panel === stageId);
      });
    }

    nodes.forEach(node => {
      node.addEventListener('click', () => activateStage(node.dataset.stage));
    });

    // Card scroll-fade entrance
    const fadeEls = document.querySelectorAll('.svc-capability-card, .svc-outcome-card');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const i = Array.from(fadeEls).indexOf(entry.target) % 4;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    fadeEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      obs.observe(el);
    });
  })();
}

/* ── SOLUTIONS PAGES ─────────────────────────────────────── */
if (document.querySelector('.page-solutions')) {
  (function () {
    // Card scroll-fade entrance
    const fadeEls = document.querySelectorAll('.sol-feature-card, .sol-scope-card');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const i = Array.from(fadeEls).indexOf(entry.target) % 4;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 70);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    fadeEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      obs.observe(el);
    });
  })();
}

/* ── INDUSTRIES PAGES ────────────────────────────────────── */
if (document.querySelector('.page-industries')) {
  (function () {
    const fadeEls = document.querySelectorAll('.ind-approach-card');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const i = Array.from(fadeEls).indexOf(entry.target) % 4;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 70);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    fadeEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      obs.observe(el);
    });
  })();
}

/* ── FORSYS AI SOLUTIONS PAGES ───────────────────────────── */
if (document.querySelector('.page-fs')) {
  (function () {
    // Card scroll-fade entrance
    const fadeEls = document.querySelectorAll('.fs-feature-card, .fs-usecase-card, .fs-step');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const i = Array.from(fadeEls).indexOf(entry.target) % 4;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 70);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    fadeEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
      obs.observe(el);
    });
  })();
}

/* ── ACCORDION (standalone, for any page) ────────────────── */
if (document.querySelector('.js-accord')) {
  (function () {
    document.querySelectorAll('.js-accord .accord-item').forEach(item => {
      const header = item.querySelector('.accord-header');
      if (!header) return;
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all siblings
        item.closest('.accord-list').querySelectorAll('.accord-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });
  })();
}

/* ── CUSTOMER STORIES FILTER ─────────────────────────────── */
if (document.querySelector('.res-filter')) {
  (function () {
    const btns = document.querySelectorAll('.res-filter-btn');
    const cards = document.querySelectorAll('.res-card[data-industry]');

    btns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        btns.forEach(b => { b.classList.remove('is-active'); b.removeAttribute('aria-current'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'true');

        const filter = btn.textContent.trim().toLowerCase().replace(/\s+/g, '-');

        cards.forEach(card => {
          if (filter === 'all' || card.dataset.industry === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  })();
}
