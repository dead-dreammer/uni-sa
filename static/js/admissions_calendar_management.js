// Admissions Calendar Management JavaScript

// Sample data storage (replace with backend API calls)
let events = [
  {
    id: 1,
    title: "Undergraduate Applications Open",
    university: "University of Cape Town",
    description: "Online applications for all undergraduate programs are now open for the 2026 academic year.",
    startDate: "2025-04-01",
    endDate: "2025-09-30",
    type: "Application Opening",
    priority: "High",
    programs: "All undergraduate programs",
    location: "Online",
    url: "https://www.uct.ac.za/apply",
    contact: "admissions@uct.ac.za"
  },
  {
    id: 2,
    title: "Postgraduate Application Deadline",
    university: "University of Witwatersrand",
    description: "Final deadline for postgraduate program applications for 2026.",
    startDate: "2025-11-30",
    endDate: "2025-11-30",
    type: "Application Closing",
    priority: "High",
    programs: "Postgraduate programs",
    location: "Online",
    url: "https://www.wits.ac.za/postgrad",
    contact: "+27 11 717 1000"
  },
  {
    id: 3,
    title: "First Year Registration",
    university: "Stellenbosch University",
    description: "First-year students must complete registration and collect student cards.",
    startDate: "2026-01-15",
    endDate: "2026-01-25",
    type: "Registration",
    priority: "Medium",
    programs: "All first-year students",
    location: "Main Campus",
    url: "https://www.sun.ac.za/register",
    contact: "registration@sun.ac.za"
  }
];

let filteredEvents = [...events];
let editingEventId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  renderEvents();
  updateStatistics();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  const modal = document.getElementById('eventModal');
  const closeBtn = document.getElementById('modalClose');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('eventForm');

  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;
  
  window.onclick = function(event) {
    if (event.target == modal) {
      closeModal();
    }
  };

  form.onsubmit = function(e) {
    e.preventDefault();
    saveEvent();
  };
}

// Render events to the grid
function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  
  if (filteredEvents.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <h3>No Events Found</h3>
        <p>Start by adding your first admissions event</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredEvents.map(event => createEventCard(event)).join('');
}

// Create event card HTML
function createEventCard(event) {
  const priorityClass = event.priority.toLowerCase();
  const typeClass = event.type.toLowerCase().replace(/ /g, '_');
  const endDate = event.endDate || event.startDate;
  const daysUntil = getDaysUntil(endDate);
  const dateDisplay = event.endDate && event.endDate !== event.startDate 
    ? `${formatDate(event.startDate)} - ${formatDate(endDate)}`
    : formatDate(event.startDate);

  return `
    <div class="event-card priority-${priorityClass}">
      <div class="priority-badge ${priorityClass}">${event.priority}</div>
      <div class="event-header">
        <div>
          <h3 class="event-title">${event.title}</h3>
          <p class="event-university">${event.university}</p>
        </div>
      </div>
      
      <div class="event-type-badge ${typeClass}">${event.type}</div>
      
      <div class="event-date">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>${dateDisplay}</span>
        ${daysUntil >= 0 ? `<span style="color: #f5576c; font-weight: 600;">(${daysUntil} days)</span>` : `<span style="color: #94a3b8;">(Passed)</span>`}
      </div>
      
      <p class="event-description">${event.description}</p>
      
      <div class="event-meta">
        ${event.programs ? `
          <div class="event-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>${event.programs}</span>
          </div>
        ` : ''}
        ${event.location ? `
          <div class="event-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${event.location}</span>
          </div>
        ` : ''}
        ${event.contact ? `
          <div class="event-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>${event.contact}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="event-actions">
        ${event.url ? `
          <button class="btn-view" onclick="window.open('${event.url}', '_blank')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Visit
          </button>
        ` : ''}
        <button class="btn-edit" onclick="editEvent(${event.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </button>
        <button class="btn-delete" onclick="deleteEvent(${event.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Delete
        </button>
      </div>
    </div>
  `;
}

// Update statistics
function updateStatistics() {
  document.getElementById('totalEvents').textContent = events.length;
  
  const today = new Date();
  const upcomingEvents = events.filter(e => new Date(e.endDate || e.startDate) >= today);
  document.getElementById('upcomingEvents').textContent = upcomingEvents.length;
  
  const urgentDeadlines = events.filter(e => {
    const days = getDaysUntil(e.endDate || e.startDate);
    return days >= 0 && days <= 7;
  });
  document.getElementById('urgentDeadlines').textContent = urgentDeadlines.length;
  
  const universities = new Set(events.map(e => e.university));
  document.getElementById('activeUniversities').textContent = universities.size;
}

// Open add modal
function openAddModal() {
  editingEventId = null;
  document.getElementById('modalTitle').textContent = 'Add Event';
  document.getElementById('eventForm').reset();
  document.getElementById('eventId').value = '';
  document.getElementById('eventModal').classList.add('show');
}

// Edit event
function editEvent(id) {
  editingEventId = id;
  const event = events.find(e => e.id === id);
  if (!event) return;

  document.getElementById('modalTitle').textContent = 'Edit Event';
  document.getElementById('eventId').value = event.id;
  document.getElementById('eventTitle').value = event.title;
  document.getElementById('eventUniversity').value = event.university;
  document.getElementById('eventDescription').value = event.description;
  document.getElementById('eventStartDate').value = event.startDate;
  document.getElementById('eventEndDate').value = event.endDate || '';
  document.getElementById('eventType').value = event.type;
  document.getElementById('eventPriority').value = event.priority;
  document.getElementById('eventPrograms').value = event.programs || '';
  document.getElementById('eventLocation').value = event.location || '';
  document.getElementById('eventUrl').value = event.url || '';
  document.getElementById('eventContact').value = event.contact || '';

  document.getElementById('eventModal').classList.add('show');
}

// Save event
function saveEvent() {
  const formData = {
    title: document.getElementById('eventTitle').value,
    university: document.getElementById('eventUniversity').value,
    description: document.getElementById('eventDescription').value,
    startDate: document.getElementById('eventStartDate').value,
    endDate: document.getElementById('eventEndDate').value,
    type: document.getElementById('eventType').value,
    priority: document.getElementById('eventPriority').value,
    programs: document.getElementById('eventPrograms').value,
    location: document.getElementById('eventLocation').value,
    url: document.getElementById('eventUrl').value,
    contact: document.getElementById('eventContact').value
  };

  if (editingEventId) {
    // Update existing event
    const index = events.findIndex(e => e.id === editingEventId);
    events[index] = { ...events[index], ...formData };
  } else {
    // Add new event
    const newEvent = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      ...formData
    };
    events.push(newEvent);
  }

  closeModal();
  filterEvents();
  updateStatistics();
  
  // Show success message
  showNotification(editingEventId ? 'Event updated successfully!' : 'Event added successfully!');
}

// Delete event
function deleteEvent(id) {
  if (confirm('Are you sure you want to delete this event?')) {
    events = events.filter(e => e.id !== id);
    filterEvents();
    updateStatistics();
    showNotification('Event deleted successfully!');
  }
}

// Close modal
function closeModal() {
  document.getElementById('eventModal').classList.remove('show');
}

// Search events
function searchEvents() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm) ||
    event.university.toLowerCase().includes(searchTerm) ||
    event.description.toLowerCase().includes(searchTerm)
  );
  applyFilters();
}

// Filter events
function filterEvents() {
  const universityFilter = document.getElementById('universityFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm) ||
      event.university.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm);
    
    const matchesUniversity = universityFilter === 'all' || 
      event.university.toLowerCase().includes(universityFilter);
    
    const matchesType = typeFilter === 'all' || 
      event.type.toLowerCase().replace(/ /g, '_') === typeFilter;

    return matchesSearch && matchesUniversity && matchesType;
  });

  renderEvents();
}

// Apply filters (combined function)
function applyFilters() {
  const universityFilter = document.getElementById('universityFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;

  if (universityFilter !== 'all') {
    filteredEvents = filteredEvents.filter(event =>
      event.university.toLowerCase().includes(universityFilter)
    );
  }

  if (typeFilter !== 'all') {
    filteredEvents = filteredEvents.filter(event =>
      event.type.toLowerCase().replace(/ /g, '_') === typeFilter
    );
  }

  renderEvents();
}

// Upload CSV (placeholder)
function uploadCSV() {
  alert('CSV upload functionality would be implemented here. This would allow bulk import of events from a CSV file.');
}

// Utility: Format date
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-ZA', options);
}

// Utility: Get days until date
function getDaysUntil(dateString) {
  if (!dateString) return -1;
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Show notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);