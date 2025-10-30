// ===== Course Management JS =====

// ===== Course Management JS =====

// Modal controls
const courseModal = document.getElementById('courseModal');
const modalTitle = document.getElementById('modalTitle');
const courseForm = document.getElementById('courseForm');
const courseIdInput = document.getElementById('courseId');
const nameInput = document.getElementById('courseTitle');
const descInput = document.getElementById('courseDescription');
const universityInput = document.getElementById('courseCollege');
const durationInput = document.getElementById('courseDuration');
const degreeTypeInput = document.getElementById('courseDegreeType');

// Open Add Modal
function openAddModal() {
  modalTitle.textContent = 'Add Course';
  courseForm.reset();
  courseIdInput.value = '';
  courseModal.style.display = 'flex';
}

// Close Modal
function closeModal() {
  courseModal.style.display = 'none';
}
const locationInput = document.getElementById('courseLocation');
const studyModeInput = document.getElementById('courseStudyMode');

// Add/Edit Course
courseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = courseIdInput.value;
  const payload = {
    program_name: nameInput.value,
    description: descInput.value,
    university_id: universityInput.value,
    duration_years: durationInput.value,
    degree_type: degreeTypeInput.value,
    location: locationInput.value,          // NEW
    study_mode: studyModeInput.value       // NEW
  };
  const url = id ? `/courses/edit/${id}` : '/courses/add';
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) location.reload();
    else alert('Failed to save course: ' + (data.error || 'Unknown error'));
  } catch (err) {
    console.error(err);
    alert('An error occurred while saving the course.');
  }
});

// Edit Course modal
function populateEditModal(card, id) {
  courseIdInput.value = id;
  nameInput.value = card.querySelector('.course-title').textContent;
  descInput.value = card.querySelector('.course-description').textContent;
  universityInput.value = card.dataset.college;
  durationInput.value = card.querySelector('.meta-item')?.textContent.replace(/\D/g, '') || '';
  degreeTypeInput.value = card.dataset.degree || '';
  
  // Populate new fields
  locationInput.value = card.dataset.location || '';
  studyModeInput.value = card.dataset.studyMode || '';

  modalTitle.textContent = 'Edit Course';
  courseModal.style.display = 'flex';
}

// Update bindCourseButtons to handle new fields
function bindCourseButtons() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.course-card');
      populateEditModal(card, btn.dataset.id);
    });
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this course?')) return;
      const id = btn.dataset.id;
      try {
        const res = await fetch(`/courses/delete/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) loadCourses();
        else alert('Failed to delete course: ' + (data.error || 'Unknown error'));
      } catch (err) {
        console.error(err);
        alert('An error occurred while deleting the course.');
      }
    });
  });
}

// Load courses dynamically
async function loadCourses() {
  try {
    const res = await fetch('/courses/all');
    const courses = await res.json();
    const grid = document.querySelector('.courses-grid');
    grid.innerHTML = '';

    courses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'course-card';
      card.dataset.college = course.university_id;
      card.dataset.degree = course.degree_type || '';
      card.dataset.location = course.location || '';         // NEW
      card.dataset.studyMode = course.study_mode || '';      // NEW

      card.innerHTML = `
        <div class="card-header">
          <span class="college-badge badge-${course.college?.toLowerCase() || 'unknown'}">
            ${course.college || 'Unknown College'}
          </span>
          <div class="card-actions">
            <button class="btn-icon btn-edit" data-id="${course.id}">✎</button>
            <button class="btn-icon btn-delete" data-id="${course.id}">🗑</button>
          </div>
        </div>
        <div class="card-body">
          <h3 class="course-title">${course.title}</h3>
          <p class="course-description">${course.description || 'No description available.'}</p>
          <div class="course-meta">
            <div class="meta-item"><strong>Duration:</strong> ${course.duration || 'N/A'} years</div>
            <div class="meta-item meta-degree" data-degree="${course.degree_type || ''}">
              <strong>Degree Type:</strong> ${course.degree_type || 'N/A'}
            </div>
            <div class="meta-item"><strong>Fees:</strong> ${course.fees || 'N/A'}</div>
            <div class="meta-item"><strong>Location:</strong> ${course.location || 'N/A'}</div>        <!-- NEW -->
            <div class="meta-item"><strong>Study Mode:</strong> ${course.study_mode || 'N/A'}</div>  <!-- NEW -->
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    bindCourseButtons();
  } catch (err) {
    console.error('Error loading courses:', err);
  }
}


// Close Modal Events
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === courseModal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Filter & Search
function filterCourses() {
  const filter = document.getElementById('collegeFilter').value;
  document.querySelectorAll('.course-card').forEach(card => {
    card.style.display = (filter === '' || card.dataset.university === filter) ? 'block' : 'none';
  });
}

function searchCourses() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('.course-card').forEach(card => {
    const text = [
      card.querySelector('.course-title').textContent,
      card.querySelector('.course-description').textContent,
      card.querySelector('.college-badge').textContent
    ].join(' ').toLowerCase();
    card.style.display = text.includes(input) ? 'block' : 'none';
  });
}

document.getElementById('collegeFilter').addEventListener('change', filterCourses);
document.getElementById('searchInput').addEventListener('input', searchCourses);

// Animate Cards on Load
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.course-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 50);
  });
});


function bindCourseButtons() {
  // Edit buttons
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.course-card');
      courseIdInput.value = btn.dataset.id;
      nameInput.value = card.querySelector('.course-title').textContent;
      descInput.value = card.querySelector('.course-description').textContent;
      universityInput.value = card.dataset.college;           // set select dropdown
      degreeTypeInput.value = card.dataset.degree;           // set degree type dropdown
      durationInput.value = card.querySelector('.meta-item')?.textContent.replace(/\D/g, '') || '';
      modalTitle.textContent = 'Edit Course';
      courseModal.style.display = 'flex';
    });
  });

  // Delete buttons
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this course?')) return;
      const id = btn.dataset.id;
      try {
        const res = await fetch(`/courses/delete/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) loadCourses(); // reload courses after delete
        else alert('Failed to delete course: ' + (data.error || 'Unknown error'));
      } catch (err) {
        console.error(err);
        alert('An error occurred while deleting the course.');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', loadCourses);
