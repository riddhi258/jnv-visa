// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollAnimations();
    initCounterAnimations();
    initIndustryCards();
    initSmoothScrolling();
    initHeroAnimations();
});

// Navigation functionality
function initNavigation() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const body = document.body;
  if (!hamburger || !navMenu) {
    console.warn("Hamburger or navMenu not found in DOM");
    return;
  }

  // Cache length once (avoid recalculating in loops)
  const navLinksArray = Array.from(navLinks);

  // Toggle active nav link
  navLinksArray.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Minimal DOM ops → batch via rAF
      requestAnimationFrame(() => {
        navLinksArray.forEach((el) => el.classList.remove("active"));
        e.currentTarget.classList.add("active");
      });

      // Close menu on mobile
      if (navMenu.classList.contains("active")) {
        closeMenu();
      }
    });
  });

  // Open/close menu
  const toggleMenu = () => {
    requestAnimationFrame(() => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");

      // Use CSS class instead of forcing inline styles (avoids layout thrash)
      body.classList.toggle("no-scroll", navMenu.classList.contains("active"));
    });
  };

  const closeMenu = () => {
    requestAnimationFrame(() => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      body.classList.remove("no-scroll");
    });
  };

  if (hamburger) {
    hamburger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  // Close on outside click
  document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target) && !hamburger.contains(event.target)) {
      if (navMenu.classList.contains("active")) {
        closeMenu();
      }
    }
  });

  // Close on resize > 768px
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    }, 150); // debounce
  });

  // Close on Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenu.classList.contains("active")) {
      closeMenu();
    }
  });

  // Update active nav link on scroll (debounced for perf)
  let scrollTimeout;
  window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveNavLink, 100);
  });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe all sections and cards
    const elementsToAnimate = document.querySelectorAll(
        '.section-header, .industry-card, .reason-card, .benefit-item, .service-card, .hero-content, .about-text, .about-image'
    );
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Counter animations
function initCounterAnimations() {
    const counters = document.querySelectorAll('.achievement-number');
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60 FPS
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format numbers with commas for thousands
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Industry cards interactivity
function initIndustryCards() {
    const industryCards = document.querySelectorAll('.industry-card');
    
    industryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click functionality
        card.addEventListener('click', function() {
            const industry = this.getAttribute('data-industry');
            console.log(`Clicked on ${industry} industry`);
            // Here you could navigate to a specific page or show more details
        });
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Hero animations
function initHeroAnimations() {
    const heroCard = document.querySelector('.hero-card');
    
    // Floating animation for hero card
    if (heroCard) {
        let animationId;
        
        function floatAnimation() {
            const time = Date.now() * 0.002;
            const y = Math.sin(time) * 5;
            heroCard.style.transform = `translateY(${y}px)`;
            animationId = requestAnimationFrame(floatAnimation);
        }
        
        floatAnimation();
    }
    
    // Parallax effect for hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroShape = document.querySelector('.hero-shape');
        
        if (heroShape) {
            const speed = scrolled * 0.5;
            heroShape.style.transform = `translateY(${speed}px)`;
        }
    });
}

// Button hover effects
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn, .service-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Service card interactions
document.addEventListener('DOMContentLoaded', function() {
    const serviceButtons = document.querySelectorAll('.service-btn');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceCard = this.closest('.service-card');
            const serviceTitle = serviceCard.querySelector('h3').textContent;
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // You could add navigation or modal opening here
            console.log(`Clicked on ${serviceTitle} service`);
        });
    });
});


// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn, .service-btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Performance optimization - debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// faq section - toggle answers
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      item.classList.toggle("active");
    });
  });


// Apply debouncing to scroll-heavy functions
window.addEventListener('scroll', debounce(updateActiveNavLink, 10));