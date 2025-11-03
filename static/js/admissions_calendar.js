// Admissions Calendar JavaScript

// Sample Events Data
const eventsData = [
    {
        id: 1,
        title: "Undergraduate Applications Open",
        university: "University of Cape Town",
        date: "2025-04-01",
        type: "application",
        description: "Online applications for all undergraduate programs are now open. Make sure you have all required documents including ID, academic transcripts, and proof of residence ready before starting your application.",
        link: "https://www.uct.ac.za/apply"
    },
    {
        id: 2,
        title: "NSFAS Applications Deadline",
        university: "National Student Financial Aid Scheme",
        date: "2025-11-30",
        type: "bursary",
        description: "Final deadline for NSFAS bursary applications for the 2026 academic year. Ensure all supporting documents are uploaded and your application is complete.",
        link: "https://www.nsfas.org.za"
    },
    {
        id: 3,
        title: "First Year Registration",
        university: "University of Witwatersrand",
        date: "2026-01-20",
        type: "registration",
        description: "All first-year students must complete registration and collect student cards. Bring proof of payment and acceptance letter.",
        link: "https://www.wits.ac.za"
    },
    {
        id: 4,
        title: "Orientation Week",
        university: "Stellenbosch University",
        date: "2026-02-03",
        type: "orientation",
        description: "Welcome week for all new students. Campus tours, faculty introductions, meet your mentors, and social events to help you settle in.",
        link: "https://www.sun.ac.za"
    },
    {
        id: 5,
        title: "Postgraduate Applications Close",
        university: "University of Pretoria",
        date: "2025-10-31",
        type: "application",
        description: "Final deadline for postgraduate program applications including Honours, Masters, and PhD programs. Late applications will not be accepted.",
        link: "https://www.up.ac.za"
    },
    {
        id: 6,
        title: "Late Applications Window",
        university: "University of KwaZulu-Natal",
        date: "2025-12-15",
        type: "application",
        description: "Extended application period for selected programs. Limited spaces available. Additional application fee applies.",
        link: "https://www.ukzn.ac.za"
    },
    {
        id: 7,
        title: "Faculty Bursary Applications",
        university: "University of Johannesburg",
        date: "2025-09-30",
        type: "bursary",
        description: "Apply for faculty-specific bursaries and scholarships. Available for Engineering, Business, and Health Sciences students with strong academic records.",
        link: "https://www.uj.ac.za"
    },
    {
        id: 8,
        title: "Online Registration Opens",
        university: "University of Cape Town",
        date: "2025-12-01",
        type: "registration",
        description: "Online registration portal opens for all accepted students. Register early to secure your spot and avoid last-minute rush.",
        link: "https://www.uct.ac.za"
    },
    {
        id: 9,
        title: "Engineering Applications Close",
        university: "University of Witwatersrand",
        date: "2025-09-15",
        type: "application",
        description: "Specific deadline for all Engineering faculty programs. Ensure your Mathematics and Physical Science marks meet minimum requirements.",
        link: "https://www.wits.ac.za"
    },
    {
        id: 10,
        title: "Residence Applications",
        university: "Stellenbosch University",
        date: "2025-08-31",
        type: "registration",
        description: "Submit your residence application if you need on-campus accommodation. Limited spaces fill up quickly.",
        link: "https://www.sun.ac.za"
    }
];

let currentView = 'grid';
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();
let filteredEvents = [...eventsData];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateInfoBar();
    renderGrid();
    renderCalendar();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // View switcher
    document.getElementById('gridView').addEventListener('click', () => switchView('grid'));
    document.getElementById('calendarView').addEventListener('click', () => switchView('calendar'));
    
    // Filters
    document.getElementById('searchBox').addEventListener('input', applyFilters);
    document.getElementById('universitySelect').addEventListener('change', applyFilters);
    document.getElementById('typeSelect').addEventListener('change', applyFilters);
    document.getElementById('monthSelect').addEventListener('change', applyFilters);
    
    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', () => changeCalendarMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeCalendarMonth(1));
    
    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
}

// Update Info Bar
function updateInfoBar() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    document.getElementById('totalEvents').textContent = eventsData.length;
    
    // This week
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const thisWeek = eventsData.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= weekEnd;
    });
    document.getElementById('thisWeek').textContent = thisWeek.length;
    
    // This month
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const thisMonth = eventsData.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= monthEnd;
    });
    document.getElementById('thisMonth').textContent = thisMonth.length;
    
    // Universities
    const universities = new Set(eventsData.map(e => e.university));
    document.getElementById('universities').textContent = universities.size;
}

// Switch View
function switchView(view) {
    currentView = view;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (view === 'grid') {
        document.getElementById('gridView').classList.add('active');
        document.getElementById('eventsGrid').classList.remove('hidden');
        document.getElementById('calendarViewContainer').classList.add('hidden');
    } else {
        document.getElementById('calendarView').classList.add('active');
        document.getElementById('eventsGrid').classList.add('hidden');
        document.getElementById('calendarViewContainer').classList.remove('hidden');
    }
}

// Apply Filters
function applyFilters() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const university = document.getElementById('universitySelect').value;
    const type = document.getElementById('typeSelect').value;
    const month = document.getElementById('monthSelect').value;
    
    filteredEvents = eventsData.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) || 
                            event.university.toLowerCase().includes(searchTerm) ||
                            event.description.toLowerCase().includes(searchTerm);
        
        const matchesUniversity = university === 'all' || 
                                event.university.toLowerCase().includes(university);
        
        const matchesType = type === 'all' || event.type === type;
        
        const eventDate = new Date(event.date);
        const matchesMonth = month === 'all' || eventDate.getMonth() === parseInt(month);
        
        return matchesSearch && matchesUniversity && matchesType && matchesMonth;
    });
    
    if (currentView === 'grid') {
        renderGrid();
    } else {
        renderCalendar();
    }
}

// Render Grid View
function renderGrid() {
    const grid = document.getElementById('eventsGrid');
    
    if (filteredEvents.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h3>No Events Found</h3>
                <p>Try adjusting your filters to see more results</p>
            </div>
        `;
        return;
    }
    
    // Sort by date
    const sorted = [...filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    grid.innerHTML = sorted.map(event => createEventCard(event)).join('');
}

// Create Event Card - REMOVED DESCRIPTION FROM CARD PREVIEW
function createEventCard(event) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    const isUrgent = daysUntil >= 0 && daysUntil <= 7;
    
    return `
        <div class="event-card" onclick="openModal(${event.id})">
            <div class="event-header">
                <span class="event-type ${event.type}">${event.type}</span>
                <div class="event-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${formatDate(event.date)}
                </div>
            </div>
            <div class="event-body">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-university">${event.university}</p>
            </div>
            <div class="event-footer">
                ${daysUntil >= 0 ? `
                    <div class="days-left ${isUrgent ? 'urgent' : ''}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days left`}
                    </div>
                ` : '<div class="days-left" style="color: #9ca3af;">Past</div>'}
                <a href="#" class="view-details" onclick="event.stopPropagation(); openModal(${event.id})">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            </div>
        </div>
    `;
}

// Render Calendar
function renderCalendar() {
    const container = document.querySelector('.calendar-container');
    const monthName = new Date(currentCalendarYear, currentCalendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById('calendarMonth').textContent = monthName;
    
    // Clear existing days (keep weekday headers)
    const existingDays = container.querySelectorAll('.cal-day');
    existingDays.forEach(day => day.remove());
    
    // Get calendar data
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
    const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentCalendarYear, currentCalendarMonth, 0).getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        container.appendChild(createCalendarDay(day, currentCalendarMonth - 1, currentCalendarYear, true));
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        container.appendChild(createCalendarDay(day, currentCalendarMonth, currentCalendarYear, false));
    }
    
    // Next month days
    const totalCells = container.children.length - 7;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        container.appendChild(createCalendarDay(day, currentCalendarMonth + 1, currentCalendarYear, true));
    }
}

// Create Calendar Day
function createCalendarDay(day, month, year, isOtherMonth) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day';
    if (isOtherMonth) dayEl.classList.add('other-month');
    
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
        dayEl.classList.add('today');
    }
    
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = filteredEvents.filter(e => e.date === dateString);
    
    const typeMap = {
        'application': 'app',
        'registration': 'reg',
        'bursary': 'bur',
        'orientation': 'ori'
    };
    
    dayEl.innerHTML = `
        <div class="cal-date">${day}</div>
        <div class="cal-events">
            ${dayEvents.map(e => `<div class="cal-dot ${typeMap[e.type]}"></div>`).join('')}
        </div>
    `;
    
    if (dayEvents.length > 0) {
        dayEl.onclick = () => {
            if (dayEvents.length === 1) {
                openModal(dayEvents[0].id);
            } else {
                openMultiModal(dayEvents);
            }
        };
    }
    
    return dayEl;
}

// Change Calendar Month
function changeCalendarMonth(direction) {
    currentCalendarMonth += direction;
    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    } else if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }
    renderCalendar();
}

// Open Modal - DESCRIPTION NOW ONLY SHOWS HERE
function openModal(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <span class="modal-event-type event-type ${event.type}">${event.type}</span>
        <h2 class="modal-title">${event.title}</h2>
        <p class="modal-university">${event.university}</p>
        <div class="modal-date-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${formatDate(event.date)}
            ${daysUntil >= 0 ? ` • ${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : daysUntil + ' days left'}` : ' • Past event'}
        </div>
        <p class="modal-description">${event.description}</p>
        ${event.link ? `
            <a href="${event.link}" target="_blank" class="modal-link-btn">
                Visit Website
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>
        ` : ''}
    `;
    
    document.getElementById('eventModal').classList.add('show');
}

// Open Multi-Event Modal
function openMultiModal(events) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 class="modal-title">Events on this day</h2>
        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
            ${events.map(event => `
                <div style="padding: 20px; background: #f9fafb; border-radius: 12px; cursor: pointer; border: 2px solid #e5e7eb; transition: all 0.3s;" onclick="openModal(${event.id})">
                    <span class="event-type ${event.type}" style="margin-bottom: 8px;">${event.type}</span>
                    <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 8px 0 4px;">${event.title}</h3>
                    <p style="font-size: 14px; color: #667eea; font-weight: 600;">${event.university}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('eventModal').classList.add('show');
}

// Close Modal
function closeModal() {
    document.getElementById('eventModal').classList.remove('show');
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});