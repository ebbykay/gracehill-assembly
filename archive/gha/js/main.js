// ====================================
// GRACEHILL ASSEMBLY - MAIN JAVASCRIPT
// Shared functionality across all pages
// ====================================

class GracehillApp {
    constructor() {
        this.init();
    }

    init() {
        this.initMobileMenu();
        this.initAnimations();
        this.initSmoothScroll();
        this.initForms();
        this.setActiveNavLink();
    }

    initMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const nav = document.querySelector('nav');
        
        if (menuBtn && nav) {
            menuBtn.addEventListener('click', () => {
                nav.classList.toggle('active');
                menuBtn.classList.toggle('active');
                
                const icon = menuBtn.querySelector('i');
                if (nav.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                    menuBtn.setAttribute('aria-expanded', 'true');
                } else {
                    icon.className = 'fas fa-bars';
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close menu when clicking on a link
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                    menuBtn.classList.remove('active');
                    menuBtn.querySelector('i').className = 'fas fa-bars';
                    menuBtn.setAttribute('aria-expanded', 'false');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && !menuBtn.contains(e.target) && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    menuBtn.classList.remove('active');
                    menuBtn.querySelector('i').className = 'fas fa-bars';
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    initAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements with data-animate attribute
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });

        // Add fade-in class to elements as they appear
        document.querySelectorAll('.card, .section-title, .about-card').forEach(el => {
            observer.observe(el);
        });
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initForms() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                    
                    // Simulate form submission (replace with actual AJAX)
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Send Message';
                        
                        // Show success message
                        const successMsg = document.createElement('div');
                        successMsg.className = 'alert alert-success';
                        successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Message sent successfully!';
                        form.prepend(successMsg);
                        
                        setTimeout(() => successMsg.remove(), 5000);
                    }, 2000);
                }
            });
        });
    }

    setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('nav a').forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.gracehill = new GracehillApp();
});

// Utility functions
const GracehillUtils = {
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS'
        }).format(amount);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GracehillApp, GracehillUtils };
}