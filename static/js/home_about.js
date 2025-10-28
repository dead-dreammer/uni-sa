// Home About Section Animation Script
document.addEventListener('DOMContentLoaded', function() {
  
  // Intersection Observer for scroll animations
  const aboutObserverOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Add delay based on data attribute or default
        const delay = element.getAttribute('data-delay') || 0;
        
        setTimeout(() => {
          element.classList.add('animated');
          
          // Trigger number animations for visual cards
          if (element.classList.contains('home-about-visual')) {
            animateCardNumbers(element);
          }
        }, delay);
        
        aboutObserver.unobserve(element);
      }
    });
  }, aboutObserverOptions);

  // Observe animated elements
  const aboutElements = document.querySelectorAll('[data-animation]');
  aboutElements.forEach(el => aboutObserver.observe(el));

  // Animate numbers in visual cards
  function animateCardNumbers(visualElement) {
    const cards = visualElement.querySelectorAll('.visual-card');
    
    cards.forEach((card, index) => {
      const numberElement = card.querySelector('h4');
      if (!numberElement) return;
      
      const text = numberElement.textContent;
      const number = parseInt(text);
      
      if (isNaN(number)) return;
      
      // Get the suffix (+ or anything else)
      const suffix = text.replace(/[0-9]/g, '');
      
      setTimeout(() => {
        animateCounter(numberElement, number, suffix, 2000);
      }, index * 200);
    });
  }

  // Counter animation with easing
  function animateCounter(element, target, suffix, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOutCubic * target);
      
      element.textContent = currentValue + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target + suffix;
      }
    }
    
    requestAnimationFrame(update);
  }

  // Enhanced hover effects for feature items
  const featureItems = document.querySelectorAll('.about-feature-item');
  featureItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      // Add ripple effect
      createRipple(this);
    });
  });

  function createRipple(element) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      background: rgba(107, 33, 168, 0.2);
      border-radius: 50%;
      pointer-events: none;
      animation: rippleEffect 0.8s ease-out;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 800);
  }

  // Add ripple animation
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes rippleEffect {
      from {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
      }
      to {
        transform: translate(-50%, -50%) scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);

  // Parallax effect for floating shapes
  let aboutTicking = false;
  
  window.addEventListener('scroll', function() {
    if (!aboutTicking) {
      window.requestAnimationFrame(function() {
        const aboutSection = document.querySelector('.home-about-section');
        
        if (aboutSection) {
          const rect = aboutSection.getBoundingClientRect();
          const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          
          if (scrollProgress > 0 && scrollProgress < 1) {
            const shapes = aboutSection.querySelectorAll('.floating-shape');
            shapes.forEach((shape, index) => {
              const speed = 0.3 + (index * 0.15);
              const offset = (scrollProgress - 0.5) * 100 * speed;
              shape.style.transform = `translate(${offset}px, ${-offset}px) rotate(${offset}deg)`;
            });
          }
        }
        
        aboutTicking = false;
      });
      aboutTicking = true;
    }
  });

  // Magnetic effect for buttons
  const buttons = document.querySelectorAll('.btn-primary-about, .btn-secondary-about');
  buttons.forEach(button => {
    button.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = x * 0.1;
      const moveY = y * 0.1;
      
      this.style.transform = `translate(${moveX}px, ${moveY}px) translateY(-2px)`;
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // Sequential animation for trust badges
  const trustBadgesObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const badges = entry.target.querySelectorAll('.trust-badge');
        badges.forEach((badge, index) => {
          setTimeout(() => {
            badge.style.opacity = '0';
            badge.style.transform = 'translateY(20px)';
            badge.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
              badge.style.opacity = '1';
              badge.style.transform = 'translateY(0)';
            }, 50);
          }, index * 150);
        });
        
        trustBadgesObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const trustBadgesContainer = document.querySelector('.trust-badges');
  if (trustBadgesContainer) {
    trustBadgesObserver.observe(trustBadgesContainer);
  }

  // Add glow effect on visual cards hover
  const visualCards = document.querySelectorAll('.visual-card');
  visualCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.boxShadow = '0 20px 60px rgba(107, 33, 168, 0.3), 0 0 40px rgba(107, 33, 168, 0.2)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.boxShadow = '';
    });
  });

  // Typing effect for the title (optional - can be removed if too much)
  function typingEffect(element, text, speed = 50) {
    let index = 0;
    element.textContent = '';
    
    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      }
    }
    
    type();
  }

  // Intersection observer for title typing effect
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.typed) {
        const originalText = entry.target.textContent;
        entry.target.dataset.typed = 'true';
        // Uncomment below to enable typing effect
        // typingEffect(entry.target, originalText, 30);
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const aboutTitle = document.querySelector('.home-about-title');
  if (aboutTitle) {
    // titleObserver.observe(aboutTitle); // Uncomment to enable
  }

  // Pulse animation for badge
  const badge = document.querySelector('.about-badge');
  if (badge) {
    setInterval(() => {
      badge.style.animation = 'badgePulse 0.5s ease';
      setTimeout(() => {
        badge.style.animation = '';
      }, 500);
    }, 5000);
  }

  // Add badge pulse animation
  const badgePulseStyle = document.createElement('style');
  badgePulseStyle.textContent = `
    @keyframes badgePulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
  `;
  document.head.appendChild(badgePulseStyle);

  // Add shine effect to buttons periodically
  function addShineEffect(button) {
    const shine = document.createElement('div');
    shine.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      pointer-events: none;
      animation: shine 1.5s ease-in-out;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(shine);
    
    setTimeout(() => shine.remove(), 1500);
  }

  const shineStyle = document.createElement('style');
  shineStyle.textContent = `
    @keyframes shine {
      from {
        left: -100%;
      }
      to {
        left: 200%;
      }
    }
  `;
  document.head.appendChild(shineStyle);

  // Add shine effect to primary button every 4 seconds
  const primaryButton = document.querySelector('.btn-primary-about');
  if (primaryButton) {
    setInterval(() => {
      addShineEffect(primaryButton);
    }, 4000);
  }

  // Enhanced scroll-triggered animations for feature items
  const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.about-feature-item');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateX(0)';
            }, 50);
          }, index * 150);
        });
        
        featureObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const featuresContainer = document.querySelector('.about-features');
  if (featuresContainer) {
    featureObserver.observe(featuresContainer);
  }

  // Add particle effect on visual section
  function createParticles(container) {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(135deg, #6B21A8, #EC4899);
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
          animation: particleFloat 3s ease-out forwards;
        `;
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 3000);
      }, i * 300);
    }
  }

  const particleStyle = document.createElement('style');
  particleStyle.textContent = `
    @keyframes particleFloat {
      0% {
        opacity: 0;
        transform: translateY(0) scale(0);
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        transform: translateY(-100px) scale(1.5);
      }
    }
  `;
  document.head.appendChild(particleStyle);

  // Trigger particles on visual section view
  const visualObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.particlesCreated) {
        entry.target.dataset.particlesCreated = 'true';
        createParticles(entry.target);
        visualObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const visualSection = document.querySelector('.home-about-visual');
  if (visualSection) {
    visualObserver.observe(visualSection);
  }

  // Add counter increment on card hover
  visualCards.forEach(card => {
    const originalNumber = card.querySelector('h4');
    if (originalNumber) {
      const text = originalNumber.textContent;
      const number = parseInt(text);
      const suffix = text.replace(/[0-9]/g, '');
      
      card.addEventListener('mouseenter', function() {
        const increment = Math.floor(number * 0.1);
        originalNumber.textContent = (number + increment) + suffix;
      });
      
      card.addEventListener('mouseleave', function() {
        originalNumber.textContent = number + suffix;
      });
    }
  });

  // Log initialization
  console.log('Home About Section animations initialized');
  console.log(`Observing ${aboutElements.length} animated elements`);

});