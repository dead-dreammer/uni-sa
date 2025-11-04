document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.navbar > ul');

    if (!menuBtn || !menu) return;

    // Clone menu and append to body
    const mobileMenu = menu.cloneNode(true);
    mobileMenu.classList.add('mobile-menu');
    mobileMenu.setAttribute('id', 'mobileMenu'); // accessible reference
    document.body.appendChild(mobileMenu);

    // Transition duration should match CSS (ms)
    const TRANSITION_MS = 300;

    // Accessibility attributes
    menuBtn.setAttribute('aria-controls', 'mobileMenu');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Toggle navigation');

    // Ensure we can style/position the button for the "pop-out" close animator
    menuBtn.classList.add('floating-pos', 'closed');

    // Helper to open menu
    function openMenu() {
        mobileMenu.classList.add('show');
        menuBtn.classList.remove('closed');
        menuBtn.classList.add('active');
        menuBtn.classList.add('floating-pos');
        document.body.classList.add('mobile-menu-open'); // CSS uses this to place the floating button into the red-box
        menuBtn.setAttribute('aria-expanded', 'true');
        // prevent background scroll
        document.body.style.overflow = 'hidden';
    }

    // Helper to close menu with closing animation
    function closeMenu() {
        // 1) remove the active class first so the X -> hamburger animation runs
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');

        // 2) remove body marker immediately so CSS can animate the floating button back
        document.body.classList.remove('mobile-menu-open');

        // 3) after the icon animation / menu slide-out completes, remove the show class and restore scroll
        setTimeout(() => {
            mobileMenu.classList.remove('show');
            menuBtn.classList.add('closed');
            document.body.style.overflow = '';
        }, TRANSITION_MS);
    }

    // Toggle menu
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mobileMenu.classList.contains('show')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when a normal link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Allow dropdown triggers to stay open
            if (link.parentElement && link.parentElement.classList && link.parentElement.classList.contains('dropdown')) return;

            // For normal links, play closing animation then let navigation happen naturally
            closeMenu();
        });
    });

    // Dropdown toggles
    mobileMenu.querySelectorAll('.dropdown').forEach(drop => {
        const trigger = drop.querySelector(':scope > a');
        const submenu = drop.querySelector('.dropdown-content');
        if (trigger && submenu) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault(); // Only stop navigation for dropdown parent
                submenu.classList.toggle('show');
            });
        }
    });

    // Close when clicking outside the mobile menu and mobile button
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target) && mobileMenu.classList.contains('show')) {
            closeMenu();
        }
    });

    // Ensure consistent state on resize (desktop -> mobile)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            mobileMenu.classList.remove('show');
            menuBtn.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            menuBtn.classList.remove('floating-pos', 'closed');
            document.body.style.overflow = '';
            menuBtn.setAttribute('aria-expanded', 'false');
        } else {
            // ensure floating behavior is present on mobile
            if (!menuBtn.classList.contains('floating-pos')) {
                menuBtn.classList.add('floating-pos', 'closed');
            }
        }
    });
});