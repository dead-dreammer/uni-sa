// Stats Section Animation Script
document.addEventListener('DOMContentLoaded', function() {
  
  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = element.getAttribute('data-delay') || 0;
        
        setTimeout(() => {
          element.classList.add('animated');
          
          // Trigger number counting animation
          if (element.classList.contains('hero-stat-card')) {
            animateNumber(element);
          }
          
          // Trigger challenge number counting
          if (element.classList.contains('challenge-card')) {
            animateChallengeNumber(element);
            animateProgressBar(element);
          }
        }, delay);
        
        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  const animatedElements = document.querySelectorAll('[data-animation]');
  animatedElements.forEach(el => observer.observe(el));

  // Number counting animation for hero stats
  function animateNumber(card) {
    const numberElement = card.querySelector('.stat-number');
    if (!numberElement) return;
    
    const target = parseInt(numberElement.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      numberElement.textContent = Math.floor(current);
    }, stepDuration);
  }

  // Number counting animation for challenge stats
  function animateChallengeNumber(card) {
    const numberElement = card.querySelector('.challenge-number');
    if (!numberElement) return;
    
    const target = parseInt(numberElement.getAttribute('data-target'));
    const duration = 1500;
    const steps = 50;
    const increment = target / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      numberElement.textContent = Math.floor(current);
    }, stepDuration);
  }

  // Progress bar animation
  function animateProgressBar(card) {
    const bar = card.querySelector('.challenge-bar-fill');
    if (!bar) return;
    
    const width = bar.getAttribute('data-width');
    bar.style.setProperty('--bar-width', width + '%');
  }

  // Add hover effect pulse to stat icons
  const heroCards = document.querySelectorAll('.hero-stat-card');
  heroCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      const icon = this.querySelector('.stat-icon');
      if (icon) {
        icon.style.animation = 'pulse 0.6s ease-in-out';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      const icon = this.querySelector('.stat-icon');
      if (icon) {
        icon.style.animation = '';
      }
    });
  });

  // Add CSS animation keyframes dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.15);
      }
    }

    @keyframes slideInFromLeft {
      from {
        opacity: 0;
        transform: translateX(-50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideInFromRight {
      from {
        opacity: 0;
        transform: translateX(50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hero-stat-card.animated {
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .challenge-card.animated {
      animation: slideInFromLeft 0.5s ease-out forwards;
    }

    .before-card.animated {
      animation: slideInFromLeft 0.6s ease-out forwards;
    }

    .after-card.animated {
      animation: slideInFromRight 0.6s ease-out forwards;
    }

    .research-badge.animated {
      animation: fadeInUp 0.6s ease-out forwards;
    }

    @keyframes sparkleFloat {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(-30px) scale(0);
      }
    }
  `;
  document.head.appendChild(style);

  // Add sparkle effect on hover for hero cards
  heroCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      createSparkles(this);
    });
  });

  function createSparkles(element) {
    // Create multiple sparkles
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          background: #6B21A8;
          border-radius: 50%;
          pointer-events: none;
          animation: sparkleFloat 1s ease-out forwards;
          z-index: 10;
        `;
        
        const rect = element.getBoundingClientRect();
        sparkle.style.left = (Math.random() * 80 + 10) + '%';
        sparkle.style.top = (Math.random() * 80 + 10) + '%';
        
        element.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
      }, i * 100);
    }
  }

  // Smooth reveal for stat cards on scroll
  const statCards = document.querySelectorAll('.hero-stat-card, .challenge-card, .before-card, .after-card, .research-badge');
  
  // Add initial invisible state
  statCards.forEach(card => {
    if (!card.classList.contains('animated')) {
      card.style.opacity = '0';
    }
  });

  // Counter animation with easing
  function animateCounterWithEasing(element, target, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic function for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOutCubic * target);
      
      element.textContent = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }
    
    requestAnimationFrame(update);
  }

  // Enhanced number animation with easing for hero stats
  function animateNumberEnhanced(card) {
    const numberElement = card.querySelector('.stat-number');
    if (!numberElement) return;
    
    const target = parseInt(numberElement.getAttribute('data-target'));
    animateCounterWithEasing(numberElement, target, 2000);
  }

  // Enhanced number animation for challenge cards
  function animateChallengeNumberEnhanced(card) {
    const numberElement = card.querySelector('.challenge-number');
    if (!numberElement) return;
    
    const target = parseInt(numberElement.getAttribute('data-target'));
    animateCounterWithEasing(numberElement, target, 1500);
  }

  // Add parallax effect to stats section on scroll
  let ticking = false;
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
          const rect = statsSection.getBoundingClientRect();
          const scrollProgress = 1 - (rect.top / window.innerHeight);
          
          if (scrollProgress > 0 && scrollProgress < 1) {
            const heroCards = statsSection.querySelectorAll('.hero-stat-card');
            heroCards.forEach((card, index) => {
              const offset = (scrollProgress - 0.5) * 20 * (index % 2 === 0 ? 1 : -1);
              card.style.transform = `translateY(${offset}px)`;
            });
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  // Add number increment sound effect (visual feedback)
  function addVisualFeedback(element) {
    element.style.transition = 'transform 0.1s ease';
    element.style.transform = 'scale(1.05)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 100);
  }

  // Enhanced hover interaction for challenge cards
  const challengeCards = document.querySelectorAll('.challenge-card');
  challengeCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      const bar = this.querySelector('.challenge-bar-fill');
      if (bar) {
        bar.style.filter = 'brightness(1.2)';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      const bar = this.querySelector('.challenge-bar-fill');
      if (bar) {
        bar.style.filter = 'brightness(1)';
      }
    });
  });

  // Log animation status for debugging
  console.log('Stats section animations initialized');
  console.log(`Observing ${animatedElements.length} animated elements`);

});