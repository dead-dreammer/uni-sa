document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.navbar > ul');

    if (!menuBtn || !menu) return;

    // Clone menu and append to body
    const mobileMenu = menu.cloneNode(true);
    mobileMenu.classList.add('mobile-menu');
    document.body.appendChild(mobileMenu);

    // Toggle menu
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('show');
        menuBtn.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('show') ? 'hidden' : '';
    });

    // Close menu when a normal link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Allow dropdown triggers to stay open
            if (link.parentElement.classList.contains('dropdown')) return;

            // For normal links, close the menu and navigate
            mobileMenu.classList.remove('show');
            menuBtn.classList.remove('active');
            document.body.style.overflow = '';
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
});
