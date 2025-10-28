// Add this to your dashboard page script or create a new file: liked_courses_integration.js

document.addEventListener('DOMContentLoaded', function() {
  // Function to render liked courses on dashboard
  function renderLikedCoursesOnDashboard() {
    const likesContainer = document.getElementById('likesContainer');
    
    if (!likesContainer) return; // Only run on dashboard page
    
    // Get liked courses from localStorage
    const likedCourses = JSON.parse(localStorage.getItem('likedCourses') || '[]');
    
    if (likedCourses.length === 0) {
      likesContainer.innerHTML = '<p class="empty-state">You haven\'t saved any universities yet.</p>';
      return;
    }
    
    // Render liked courses
    likesContainer.innerHTML = likedCourses.map((course, index) => `
      <div class="like-item" data-course-id="${course.id}">
        <div class="like-info">
          <h4>${course.name}</h4>
          <p class="like-date">Saved on: ${new Date(course.timestamp).toLocaleDateString()}</p>
        </div>
        <button class="btn btn-remove" onclick="removeFromDashboardLikes('${course.id}')">
          ✕
        </button>
      </div>
    `).join('');
  }
  
  // Remove from likes (global function)
  window.removeFromDashboardLikes = function(courseId) {
    let likedCourses = JSON.parse(localStorage.getItem('likedCourses') || '[]');
    likedCourses = likedCourses.filter(course => course.id !== courseId);
    localStorage.setItem('likedCourses', JSON.stringify(likedCourses));
    renderLikedCoursesOnDashboard();
    
    // Show feedback
    showDashboardFeedback('Course removed from saved list');
  };
  
  // Show feedback on dashboard
  function showDashboardFeedback(message) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #6B21A8;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    `;
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => feedback.remove(), 300);
    }, 2500);
  }
  
  // Update the existing renderLikes function in dashboard to use localStorage
  if (typeof renderLikes === 'function') {
    renderLikes = renderLikedCoursesOnDashboard;
  }
  
  // Initialize on dashboard
  renderLikedCoursesOnDashboard();
  
  // Listen for storage changes (if user likes on another tab)
  window.addEventListener('storage', function(e) {
    if (e.key === 'likedCourses') {
      renderLikedCoursesOnDashboard();
    }
  });
});

// CSS for like items (add to your dashboard CSS)
const dashboardLikeStyles = `
  .like-item {
    background: white;
    border: 2px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
  }
  
  .like-item:hover {
    border-color: #6B21A8;
    box-shadow: 0 4px 12px rgba(107, 33, 168, 0.1);
    transform: translateY(-2px);
  }
  
  .like-info h4 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  
  .like-date {
    font-size: 14px;
    color: #6B7280;
  }
  
  .btn-remove {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #EF4444;
    background: white;
    color: #EF4444;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-remove:hover {
    background: #EF4444;
    color: white;
    transform: scale(1.1);
  }
  
  .empty-state {
    text-align: center;
    color: #6B7280;
    padding: 32px;
    font-size: 16px;
  }
`;

// Inject styles if not already present
if (!document.getElementById('dashboard-like-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'dashboard-like-styles';
  styleSheet.textContent = dashboardLikeStyles;
  document.head.appendChild(styleSheet);
}