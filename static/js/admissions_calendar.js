// Admissions Calendar JavaScript

// Sample deadline data - Replace with actual data from your backend
const deadlines = [
    {
        id: 1,
        date: new Date(2025, 0, 15), // January 15, 2025
        title: "Undergraduate Application Deadline",
        university: "University of Cape Town",
        universityId: "uct",
        type: "application",
        description: "Final deadline for undergraduate applications for the 2025 academic year. Late applications will not be considered.",
        link: "https://www.uct.ac.za/apply"
    },
    {
        id: 2,
        date: new Date(2025, 0, 20),
        title: "Bursary Application Closes",
        university: "University of Witwatersrand",
        universityId: "wits",
        type: "bursary",
        description: "Last day to submit bursary applications. Ensure all supporting documents are uploaded.",
        link: "https://www.wits.ac.za/bursaries"
    },
    {
        id: 3,
        date: new Date(2025, 0, 31),
        title: "Registration Period Begins",
        university: "University of KwaZulu-Natal",
        universityId: "ukzn",
        type: "registration",
        description: "Online registration opens for accepted students. Have your student number and documents ready.",
        link: "https://www.ukzn.ac.za/register"
    },
    {
        id: 4,
        date: new Date(2025, 1, 1), // February 1
        title: "Orientation Week Starts",
        university: "Stellenbosch University",
        universityId: "stellenbosch",
        type: "orientation",
        description: "Welcome week for all new students. Mandatory attendance for first-year students.",
        link: "https://www.sun.ac.za/orientation"
    },
    {
        id: 5,
        date: new Date(2025, 1, 10),
        title: "Late Application Deadline",
        university: "University of Pretoria",
        universityId: "up",
        type: "application",
        description: "Extended deadline for applications. Limited spaces available.",
        link: "https://www.up.ac.za/apply"
    },
    {
        id: 6,
        date: new Date(2025, 1, 14),
        title: "Registration Closes",
        university: "University of Johannesburg",
        universityId: "uj",
        type: "registration",
        description: "Final day for online and in-person registration.",
        link: "https://www.uj.ac.za/register"
    },
    {
        id: 7,
        date: new Date(2025, 1, 17),
        title: "Orientation Week",
        university: "University of Cape Town",
        universityId: "uct",
        type: "orientation",
        description: "Campus tours, faculty meetings, and student services information sessions.",
        link: "https://www.uct.ac.za/orientation"
    },
    {
        id: 8,
        date: new Date(2025, 2, 1), // March 1
        title: "Residence Application Deadline",
        university: "University of Witwatersrand",
        universityId: "wits",
        type: "application",
        description: "Final deadline for on-campus residence applications for first-year students.",
        link: "https://www.wits.ac.za/residence"
    },
    {
        id: 9,
        date: new Date(2025, 2, 15),
        title: "NSFAS Application Closes",
        university: "University of KwaZulu-Natal",
        universityId: "ukzn",
        type: "bursary",
        description: "Last day to submit NSFAS funding applications for the academic year.",
        link: "https://www.ukzn.ac.za/nsfas"
    }
];

// State
let currentDate = new Date();
let currentView = 'calendar';
let filteredDeadlines = [...deadlines];

// DOM Elements
const calendarView = document.getElementById('calendar-view');
const listView = document.getElementById('list-view');
const currentMonthEl = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const universityFilter = document.getElementById('university-filter');
const deadlineFilter = document.getElementById('deadline-filter');
const resetFiltersBtn = document.getElementById('reset-filters');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const modal = document.getElementById('deadline-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');

// Initialize calendar
function init() {
    renderCalendar();
    renderListView();
    attachEventListeners();
}

// Render calendar grid
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthEl.textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Clear existing calendar days
    const calendarGrid = document.querySelector('.calendar-grid');
    const dayHeaders = Array.from(calendarGrid.querySelectorAll('.calendar-day-header'));
    calendarGrid.innerHTML = '';
    dayHeaders.forEach(header => calendarGrid.appendChild(header));
    
    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createDayElement(day, true, month - 1, year);
        calendarGrid.appendChild(dayEl);
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createDayElement(day, false, month, year);
        calendarGrid.appendChild(dayEl);
    }
    
    // Add next month's days to fill grid
    const totalCells = calendarGrid.children.length - 7; // Subtract header row
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createDayElement(day, true, month + 1, year);
        calendarGrid.appendChild(dayEl);
    }
}

// Create individual day element
function createDayElement(day, isOtherMonth, month, year) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    }
    
    // Check if today
    const today = new Date();
    const dayDate = new Date(year, month, day);
    if (dayDate.toDateString() === today.toDateString()) {
        dayEl.classList.add('today');
    }
    
    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);
    
    // Add deadlines for this day
    const dayDeadlines = filteredDeadlines.filter(deadline => {
        return deadline.date.getDate() === day &&
               deadline.date.getMonth() === month &&
               deadline.date.getFullYear() === year;
    });
    
    dayDeadlines.forEach(deadline => {
        const indicator = document.createElement('div');
        indicator.className = `deadline-indicator ${deadline.type}`;
        indicator.innerHTML = `
            <span class="deadline-dot"></span>
            <span>${deadline.university.split(' ').slice(-1)}</span>
        `;
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeadlineModal(deadline);
        });
        dayEl.appendChild(indicator);
    });
    
    return dayEl;
}

// Render list view
function renderListView() {
    const deadlineList = document.getElementById('deadline-list');
    deadlineList.innerHTML = '';
    
    // Sort deadlines by date
    const sortedDeadlines = [...filteredDeadlines].sort((a, b) => a.date - b.date);
    
    if (sortedDeadlines.length === 0) {
        deadlineList.innerHTML = '<p style="color: rgba(255, 255, 255, 0.7); text-align: center; padding: 2rem;">No deadlines found matching your filters.</p>';
        return;
    }
    
    sortedDeadlines.forEach(deadline => {
        const item = document.createElement('div');
        item.className = `deadline-item ${deadline.type}`;
        item.innerHTML = `
            <div class="deadline-date">${formatDate(deadline.date)}</div>
            <div class="deadline-title">${deadline.title}</div>
            <div class="deadline-university">${deadline.university}</div>
            <div class="deadline-description">${deadline.description}</div>
        `;
        item.addEventListener('click', () => showDeadlineModal(deadline));
        deadlineList.appendChild(item);
    });
}

// Format date
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-ZA', options);
}

// Show deadline modal
function showDeadlineModal(deadline) {
    modalBody.innerHTML = `
        <h2>${deadline.title}</h2>
        <div class="modal-date">${formatDate(deadline.date)}</div>
        <div class="modal-university">${deadline.university}</div>
        <div class="modal-description">${deadline.description}</div>
        <a href="${deadline.link}" target="_blank" class="modal-link">Visit University Page</a>
    `;
    modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    modal.classList.add('hidden');
}

// Filter deadlines
function applyFilters() {
    const universityValue = universityFilter.value;
    const deadlineValue = deadlineFilter.value;
    
    filteredDeadlines = deadlines.filter(deadline => {
        const universityMatch = universityValue === 'all' || deadline.universityId === universityValue;
        const typeMatch = deadlineValue === 'all' || deadline.type === deadlineValue;
        return universityMatch && typeMatch;
    });
    
    if (currentView === 'calendar') {
        renderCalendar();
    } else {
        renderListView();
    }
}

// Reset filters
function resetFilters() {
    universityFilter.value = 'all';
    deadlineFilter.value = 'all';
    filteredDeadlines = [...deadlines];
    
    if (currentView === 'calendar') {
        renderCalendar();
    } else {
        renderListView();
    }
}

// Switch view
function switchView(view) {
    currentView = view;
    
    toggleBtns.forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    if (view === 'calendar') {
        calendarView.classList.remove('hidden');
        listView.classList.add('hidden');
    } else {
        calendarView.classList.add('hidden');
        listView.classList.remove('hidden');
    }
}

// Navigate months
function navigateMonth(direction) {
    if (direction === 'prev') {
        currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    renderCalendar();
}

// Attach event listeners
function attachEventListeners() {
    prevMonthBtn.addEventListener('click', () => navigateMonth('prev'));
    nextMonthBtn.addEventListener('click', () => navigateMonth('next'));
    
    universityFilter.addEventListener('change', applyFilters);
    deadlineFilter.addEventListener('change', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);