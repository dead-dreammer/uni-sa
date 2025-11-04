document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.navbar > ul');

    if (!menuBtn || !menu) return;

    // Clone menu and append to body
    const mobileMenu = menu.cloneNode(true);
    mobileMenu.classList.add('mobile-menu');
    document.body.appendChild(mobileMenu);

    // Transition duration should match CSS (ms)
    const TRANSITION_MS = 300;

    // Helper to open menu
    function openMenu() {
        mobileMenu.classList.add('show');
        menuBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Helper to close menu with closing animation
    function closeMenu() {
        // 1) remove the active class first so the X -> hamburger animation runs
        menuBtn.classList.remove('active');

        // 2) after the icon animation / sidebar slide-out completes, remove the show class
        setTimeout(() => {
            mobileMenu.classList.remove('show');
            // restore scroll
            document.body.style.overflow = '';
        }, TRANSITION_MS);
    }

    // Toggle menu
    menuBtn.addEventListener('click', () => {
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
            if (link.parentElement.classList.contains('dropdown')) return;

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

    // Optionally close menu if user taps outside the menu (on body) - keep unobtrusive
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
            document.body.style.overflow = '';
        }
    });
});