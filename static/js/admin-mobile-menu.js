document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.admin-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (!menuBtn || !sidebar) return;

  // Helper to set accessible state
  function setAriaExpanded(state) {
    try {
      menuBtn.setAttribute('aria-expanded', state ? 'true' : 'false');
    } catch (e) {
      // silent fail if attribute can't be set
    }
  }

  // Toggle sidebar on button click (mobile only)
  menuBtn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      const isShown = sidebar.classList.toggle('show');
      menuBtn.classList.toggle('active');
      overlay.classList.toggle('show');
      document.body.classList.toggle('sidebar-open');
      setAriaExpanded(isShown);
    }
  });

  // Close sidebar when clicking overlay
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      menuBtn.classList.remove('active');
      overlay.classList.remove('show');
      document.body.classList.remove('sidebar-open');
      setAriaExpanded(false);
    });
  }

  // Close sidebar when clicking a nav link (mobile only)
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
        menuBtn.classList.remove('active');
        overlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
        setAriaExpanded(false);
      }
    });
  });

  // Reset sidebar state on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('show');
      menuBtn.classList.remove('active');
      overlay.classList.remove('show');
      document.body.classList.remove('sidebar-open');
      setAriaExpanded(false);
    }
  });
});