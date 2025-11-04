document.addEventListener('DOMContentLoaded', function () {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const menu = document.querySelector('.navbar > ul');

  if (!menuBtn || !menu) return;

  // Clone menu and append to body
  const mobileMenu = menu.cloneNode(true);
  mobileMenu.classList.add('mobile-menu');
  mobileMenu.setAttribute('id', 'mobileMenu'); // accessible reference
  // Allow visible overflow so close button can sit outside the panel
  mobileMenu.style.overflowX = 'visible';
  document.body.appendChild(mobileMenu);

  // Create a dedicated close button that sits on the outside edge of the panel
  const closeBtn = document.createElement('button');
  closeBtn.className = 'mobile-menu-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  // inner span used for X visuals via CSS
  closeBtn.innerHTML = '<span aria-hidden="true"></span>';
  mobileMenu.appendChild(closeBtn);

  // compute transition time from CSS when possible (ms)
  function getTransitionMs(el) {
    const cs = window.getComputedStyle(el);
    const prop = cs.transitionDuration || cs['transition-duration'] || '0s';
    const first = prop.split(',')[0].trim();
    if (first.endsWith('ms')) return parseFloat(first);
    if (first.endsWith('s')) return parseFloat(first) * 1000;
    return 300;
  }
  const TRANSITION_MS = getTransitionMs(mobileMenu) || 300;

  // Accessibility attributes
  menuBtn.setAttribute('aria-controls', 'mobileMenu');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Toggle navigation');

  // ensure button has classes we use for styling
  menuBtn.classList.add('floating-pos', 'closed');

  // helper: wait for transitionend with timeout fallback
  function waitForTransitionEnd(el, timeout = TRANSITION_MS + 80) {
    return new Promise((resolve) => {
      let finished = false;
      const onEnd = (ev) => {
        if (ev.target !== el) return;
        if (finished) return;
        finished = true;
        el.removeEventListener('transitionend', onEnd);
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        if (finished) return;
        finished = true;
        el.removeEventListener('transitionend', onEnd);
        resolve();
      }, timeout);
      el.addEventListener('transitionend', onEnd);
    });
  }

  // open menu
  async function openMenu() {
    mobileMenu.classList.add('show');
    menuBtn.classList.remove('closed');
    menuBtn.classList.add('active');
    document.body.classList.add('mobile-menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    // prevent background scroll
    document.body.style.overflow = 'hidden';
  }

  // close menu
  async function closeMenu() {
    if (!mobileMenu.classList.contains('show')) return;
    // animate icon back
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');

    // remove body marker so CSS can animate the floating button back
    document.body.classList.remove('mobile-menu-open');

    // wait for the menu slide/transition to complete before hiding
    await waitForTransitionEnd(mobileMenu);

    mobileMenu.classList.remove('show');

    // restore closed styling
    if (!menuBtn.classList.contains('closed')) menuBtn.classList.add('closed');

    // restore scroll
    document.body.style.overflow = '';
  }

  // toggle
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileMenu.classList.contains('show')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // clicking dedicated close button closes menu (placed on panel edge)
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenu();
  });

  // Close menu when a normal link is clicked (delay navigation until after close animation)
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      // allow dropdown parents to toggle
      if (link.parentElement && link.parentElement.classList && link.parentElement.classList.contains('dropdown')) {
        return;
      }
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) {
        e.preventDefault();
        closeMenu();
        return;
      }
      e.preventDefault();
      closeMenu().then(() => {
        window.location.href = href;
      });
    });
  });

  // Dropdown toggles inside cloned menu
  mobileMenu.querySelectorAll('.dropdown').forEach((drop) => {
    const trigger = drop.querySelector(':scope > a');
    const submenu = drop.querySelector('.dropdown-content');
    if (trigger && submenu) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        submenu.classList.toggle('show');
      });
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target) && mobileMenu.classList.contains('show')) {
      closeMenu();
    }
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (mobileMenu.classList.contains('show')) closeMenu();
    }
  });

  // Keep consistent state on resize (desktop -> mobile)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileMenu.classList.remove('show');
      menuBtn.classList.remove('active', 'floating-pos', 'closed');
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
      menuBtn.setAttribute('aria-expanded', 'false');
    } else {
      if (!menuBtn.classList.contains('floating-pos')) {
        menuBtn.classList.add('floating-pos', 'closed');
      }
    }
  });
});