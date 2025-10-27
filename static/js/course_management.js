// Course Management JavaScript

// Modal functions
function openAddModal() {
  document.getElementById('courseModal').style.display = 'flex';
  document.getElementById('modalTitle').textContent = 'Add New Course';
  document.getElementById('courseForm').reset();
}

function closeModal() {
  document.getElementById('courseModal').style.display = 'none';
}

function editCourse(id) {
  document.getElementById('courseModal').style.display = 'flex';
  document.getElementById('modalTitle').textContent = 'Edit Course';
  
  // TODO: Populate form with course data from database
  // For now, this is a placeholder
  console.log('Editing course with ID:', id);
  
  // Example of how you would populate the form:
  // document.getElementById('collegeName').value = 'dut';
  // document.getElementById('courseName').value = 'Bachelor of Engineering';
  // etc.
}

function deleteCourse(id) {
  // Show confirmation dialog
  if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
    // TODO: Send delete request to backend
    console.log('Deleting course with ID:', id);
    
    // Example AJAX call (uncomment and modify when backend is ready):
    /*
    fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Remove the card from DOM
        const card = document.querySelector(`[data-course-id="${id}"]`);
        if (card) {
          card.style.opacity = '0';
          setTimeout(() => card.remove(), 300);
        }
        showNotification('Course deleted successfully!', 'success');
      } else {
        showNotification('Failed to delete course.', 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showNotification('An error occurred.', 'error');
    });
    */
    
    // For demo purposes:
    showNotification('Course deleted successfully!', 'success');
  }
}

// Filter functions
function filterCourses() {
  const filter = document.getElementById('collegeFilter').value;
  const cards = document.querySelectorAll('.course-card');
  
  cards.forEach(card => {
    if (filter === 'all' || card.dataset.college === filter) {
      card.style.display = 'block';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, 10);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      setTimeout(() => {
        card.style.display = 'none';
      }, 300);
    }
  });
}

function searchCourses() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const cards = document.querySelectorAll('.course-card');
  
  cards.forEach(card => {
    const courseName = card.querySelector('.course-title').textContent.toLowerCase();
    const description = card.querySelector('.course-description').textContent.toLowerCase();
    const college = card.querySelector('.college-badge').textContent.toLowerCase();
    
    if (courseName.includes(input) || description.includes(input) || college.includes(input)) {
      card.style.display = 'block';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, 10);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      setTimeout(() => {
        card.style.display = 'none';
      }, 300);
    }
  });
}

function showAllCourses() {
  document.getElementById('collegeFilter').value = 'all';
  document.getElementById('searchInput').value = '';
  filterCourses();
}

// CSV Upload function
function uploadCSV() {
  // Create file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv';
  
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Handle CSV file upload
      console.log('Uploading CSV file:', file.name);
      
      // Example of how you would handle the upload:
      /*
      const formData = new FormData();
      formData.append('file', file);
      
      fetch('/api/courses/upload-csv', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showNotification(`Successfully imported ${data.count} courses!`, 'success');
          // Reload the page or update the course list
          location.reload();
        } else {
          showNotification('Failed to import CSV.', 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred during upload.', 'error');
      });
      */
      
      // For demo purposes:
      showNotification('CSV upload feature coming soon!', 'info');
    }
  };
  
  fileInput.click();
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('courseModal');
  if (event.target === modal) {
    closeModal();
  }
};

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// Form submission
document.getElementById('courseForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Get form data
  const formData = {
    college: document.getElementById('collegeName').value,
    courseName: document.getElementById('courseName').value,
    description: document.getElementById('courseDescription').value,
    duration: document.getElementById('courseDuration').value,
    mode: document.getElementById('courseMode').value
  };
  
  console.log('Form data:', formData);
  
  // TODO: Send data to backend
  /*
  fetch('/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Course saved successfully!', 'success');
      closeModal();
      // Reload or update the course list
      location.reload();
    } else {
      showNotification('Failed to save course.', 'error');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showNotification('An error occurred.', 'error');
  });
  */
  
  // For demo purposes:
  showNotification('Course saved successfully!', 'success');
  closeModal();
});

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add styles
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '16px 24px';
  notification.style.borderRadius = '10px';
  notification.style.color = 'white';
  notification.style.fontWeight = '600';
  notification.style.fontSize = '14px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)';
  notification.style.animation = 'slideInRight 0.3s ease';
  
  // Set background color based on type
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
  } else if (type === 'info') {
    notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  
  // Add to body
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
  
  .course-card {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log('Course Management initialized');
  
  // Add smooth transitions to cards
  const cards = document.querySelectorAll('.course-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });
});