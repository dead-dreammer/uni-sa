/**
 * Course Matches Page - Navigation & Interaction Handler
 * Handles card navigation, like buttons, and keyboard shortcuts
 */

document.addEventListener('DOMContentLoaded', function() {
  // ==================== Element References ====================
  const cards = document.querySelectorAll('.option-card');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const currentCourseSpan = document.getElementById('currentCourse');
  const totalCoursesSpan = document.getElementById('totalCourses');
  const likeButtons = document.querySelectorAll('.like-button');
  
  // ==================== State Management ====================
  let currentIndex = 0;
  const totalCourses = cards.length;
  let likedCourses = JSON.parse(localStorage.getItem('likedCourses') || '[]');
  
  // ==================== Initialization ====================
  totalCoursesSpan.textContent = totalCourses;
  
  // ==================== Card Navigation Functions ====================
  
  /**
   * Shows the card at the specified index and updates UI
   * @param {number} index - The index of the card to display
   */
  function showCard(index) {
    // Update active card
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });
    
    // Update counter
    currentCourseSpan.textContent = index + 1;
    
    // Update navigation buttons state
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === totalCourses - 1;
    
    // Scroll to card
    cards[index].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
  
  /**
   * Navigate to previous card
   */
  function goToPreviousCard() {
    if (currentIndex > 0) {
      currentIndex--;
      showCard(currentIndex);
    }
  }
  
  /**
   * Navigate to next card
   */
  function goToNextCard() {
    if (currentIndex < totalCourses - 1) {
      currentIndex++;
      showCard(currentIndex);
    }
  }
  
  // ==================== Like Button Functions ====================
  
  /**
   * Toggle like status for a course
   * @param {HTMLElement} btn - The like button element
   * @param {string} courseId - The course ID
   * @param {string} courseName - The course name
   */
  function toggleLike(btn, courseId, courseName) {
    if (btn.classList.contains('liked')) {
      // Unlike
      btn.classList.remove('liked');
      btn.textContent = '♡';
      likedCourses = likedCourses.filter(c => c.id !== courseId);
    } else {
      // Like
      btn.classList.add('liked');
      btn.textContent = '♥';
      likedCourses.push({
        id: courseId,
        name: courseName,
        timestamp: new Date().toISOString()
      });
    }
    
    // Save to localStorage
    localStorage.setItem('likedCourses', JSON.stringify(likedCourses));
  }
  
  /**
   * Initialize like button state from localStorage
   * @param {HTMLElement} btn - The like button element
   * @param {string} courseId - The course ID
   */
  function initializeLikeButton(btn, courseId) {
    const isLiked = likedCourses.some(course => course.id === courseId);
    if (isLiked) {
      btn.classList.add('liked');
      btn.textContent = '♥';
    }
  }
  
  // ==================== Event Listeners ====================
  
  // Previous button
  prevBtn.addEventListener('click', goToPreviousCard);
  
  // Next button
  nextBtn.addEventListener('click', goToNextCard);
  
  // Like buttons
  likeButtons.forEach((btn, index) => {
    const courseName = btn.getAttribute('data-course-name');
    const courseId = cards[index].getAttribute('data-course-id');
    
    // Initialize like state
    initializeLikeButton(btn, courseId);
    
    // Add click handler
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent card click
      toggleLike(btn, courseId, courseName);
    });
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      goToPreviousCard();
    } else if (e.key === 'ArrowRight') {
      goToNextCard();
    }
  });
  
  // ==================== Utility Functions ====================
  
  /**
   * Get all liked courses
   * @returns {Array} Array of liked course objects
   */
  window.getLikedCourses = function() {
    return JSON.parse(localStorage.getItem('likedCourses') || '[]');
  };
  
  /**
   * Clear all liked courses
   */
  window.clearLikedCourses = function() {
    localStorage.removeItem('likedCourses');
    likedCourses = [];
    likeButtons.forEach(btn => {
      btn.classList.remove('liked');
      btn.textContent = '♡';
    });
    console.log('All liked courses cleared');
  };
  
});