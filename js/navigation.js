class Navigation {
    constructor() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.setActiveNavLink();
    }

    setActiveNavLink() {
        console.log('Setting active nav link...');
        const currentPath = window.location.pathname;
        console.log('Current path:', currentPath);
        const navLinks = document.querySelectorAll('.nav-links a');
        console.log('Found nav links:', navLinks.length);
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            console.log('Checking link:', href);
            // Check if the current path ends with the href or if it's the index page
            if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
                console.log('Setting active for:', href);
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Initialize navigation
new Navigation(); 