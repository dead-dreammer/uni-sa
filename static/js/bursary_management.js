// Sample bursary data (replace with actual database calls)
let bursaries = [
    {
        id: 1,
        title: "National Student Financial Aid Scheme (NSFAS)",
        provider: "Department of Higher Education",
        providerType: "government",
        amount: "Full tuition & allowances",
        deadline: "2025-11-30",
        field: "All fields",
        level: "Undergraduate",
        description: "NSFAS provides financial assistance to eligible South African students who wish to study at public universities and TVET colleges.",
        requirements: [
            "South African citizen",
            "Combined household income not exceeding R350,000 per annum",
            "Admitted to a public university or TVET college",
            "Studying towards first qualification"
        ],
        coverage: "Tuition fees, accommodation, learning materials, and living allowances",
        url: "https://www.nsfas.org.za",
        tags: ["Government", "Full Coverage", "Undergraduate"]
    },
    {
        id: 2,
        title: "Sasol Bursary Programme",
        provider: "Sasol Limited",
        providerType: "corporate",
        amount: "Full tuition & allowances",
        deadline: "2025-07-15",
        field: "Science, Engineering, Commerce",
        level: "Undergraduate, Postgraduate",
        description: "Supports students in science, engineering, and commerce fields with comprehensive funding.",
        requirements: [
            "South African citizen",
            "Excellent academic record (minimum 70%)",
            "Studying relevant qualification at recognized institution",
            "Leadership potential"
        ],
        coverage: "Full tuition, accommodation, meals, books, and pocket money",
        url: "https://www.sasol.com/careers/bursaries",
        tags: ["STEM", "Corporate", "Leadership"]
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    renderBursaries();
    updateStatistics();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Modal close buttons
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const modal = document.getElementById('bursaryModal');
    
    if (modalClose) {
        modalClose.onclick = () => closeModal();
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = () => closeModal();
    }
    
    // Close modal on outside click
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
    }
    
    // Form submission
    const form = document.getElementById('bursaryForm');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            saveBursary();
        };
    }
}

// Render bursaries grid
function renderBursaries(filteredBursaries = null) {
    const grid = document.getElementById('bursariesGrid');
    if (!grid) return;
    
    const bursariesToRender = filteredBursaries || bursaries;
    
    if (bursariesToRender.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 40px; color: #6b7280;">No bursaries found</div>';
        return;
    }
    
    grid.innerHTML = bursariesToRender.map(bursary => `
        <div class="bursary-card" data-provider-type="${bursary.providerType}" data-field="${bursary.field}">
            <div class="card-header">
                <span class="provider-badge badge-${bursary.providerType}">${bursary.providerType}</span>
                <div class="card-actions">
                    <button class="btn-icon btn-edit" onclick="editBursary(${bursary.id})">✎</button>
                    <button class="btn-icon btn-delete" onclick="deleteBursary(${bursary.id})">🗑</button>
                </div>
            </div>
            <div class="card-body">
                <h3 class="bursary-title">${bursary.title}</h3>
                <p class="bursary-provider">${bursary.provider}</p>
                <p class="bursary-description">${bursary.description}</p>
                <div class="bursary-meta">
                    <div class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span>${bursary.amount}</span>
                    </div>
                    <div class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>${formatDate(bursary.deadline)}</span>
                    </div>
                </div>
                <div class="tag-container">
                    ${bursary.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStatistics() {
    document.getElementById('totalBursaries').textContent = bursaries.length;
    
    const uniqueProviders = new Set(bursaries.map(b => b.provider)).size;
    document.getElementById('activeProviders').textContent = uniqueProviders;
    
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    const upcomingDeadlines = bursaries.filter(b => {
        const deadline = new Date(b.deadline);
        return deadline >= today && deadline <= thirtyDaysFromNow;
    }).length;
    document.getElementById('upcomingDeadlines').textContent = upcomingDeadlines;
    
    // For demo purposes - in real app, this would come from backend
    document.getElementById('updatedToday').textContent = Math.floor(Math.random() * 10);
}

// Search bursaries
function searchBursaries() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const providerFilter = document.getElementById('providerFilter').value;
    const fieldFilter = document.getElementById('fieldFilter').value;
    
    const filtered = bursaries.filter(bursary => {
        const matchesSearch = bursary.title.toLowerCase().includes(searchTerm) ||
                            bursary.provider.toLowerCase().includes(searchTerm) ||
                            bursary.description.toLowerCase().includes(searchTerm);
        
        const matchesProvider = providerFilter === 'all' || bursary.providerType === providerFilter;
        const matchesField = fieldFilter === 'all' || bursary.field.toLowerCase().includes(fieldFilter.toLowerCase());
        
        return matchesSearch && matchesProvider && matchesField;
    });
    
    renderBursaries(filtered);
}

// Filter bursaries
function filterBursaries() {
    searchBursaries();
}

// Open add modal
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Bursary';
    document.getElementById('bursaryForm').reset();
    document.getElementById('bursaryId').value = '';
    document.getElementById('bursaryModal').style.display = 'flex';
}

// Edit bursary
function editBursary(id) {
    const bursary = bursaries.find(b => b.id === id);
    if (!bursary) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Bursary';
    document.getElementById('bursaryId').value = bursary.id;
    document.getElementById('bursaryTitle').value = bursary.title;
    document.getElementById('bursaryProvider').value = bursary.provider;
    document.getElementById('bursaryDescription').value = bursary.description;
    document.getElementById('bursaryAmount').value = bursary.amount;
    document.getElementById('bursaryDeadline').value = bursary.deadline;
    document.getElementById('bursaryField').value = bursary.field;
    document.getElementById('bursaryLevel').value = bursary.level;
    document.getElementById('bursaryRequirements').value = bursary.requirements.join('\n');
    document.getElementById('bursaryCoverage').value = bursary.coverage;
    document.getElementById('bursaryUrl').value = bursary.url;
    document.getElementById('bursaryTags').value = bursary.tags.join(', ');
    
    document.getElementById('bursaryModal').style.display = 'flex';
}

// Delete bursary
function deleteBursary(id) {
    if (confirm('Are you sure you want to delete this bursary?')) {
        bursaries = bursaries.filter(b => b.id !== id);
        renderBursaries();
        updateStatistics();
        
        // In real app, make API call to delete from backend
        console.log('Deleted bursary:', id);
    }
}

// Save bursary
function saveBursary() {
    const id = document.getElementById('bursaryId').value;
    const requirements = document.getElementById('bursaryRequirements').value
        .split('\n')
        .filter(req => req.trim() !== '');
    const tags = document.getElementById('bursaryTags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
    
    const bursaryData = {
        title: document.getElementById('bursaryTitle').value,
        provider: document.getElementById('bursaryProvider').value,
        providerType: determineProviderType(document.getElementById('bursaryProvider').value),
        amount: document.getElementById('bursaryAmount').value,
        deadline: document.getElementById('bursaryDeadline').value,
        field: document.getElementById('bursaryField').value,
        level: document.getElementById('bursaryLevel').value,
        description: document.getElementById('bursaryDescription').value,
        requirements: requirements,
        coverage: document.getElementById('bursaryCoverage').value,
        url: document.getElementById('bursaryUrl').value,
        tags: tags
    };
    
    if (id) {
        // Update existing bursary
        const index = bursaries.findIndex(b => b.id === parseInt(id));
        if (index !== -1) {
            bursaries[index] = { ...bursaries[index], ...bursaryData };
        }
    } else {
        // Add new bursary
        const newId = Math.max(...bursaries.map(b => b.id), 0) + 1;
        bursaries.push({ id: newId, ...bursaryData });
    }
    
    renderBursaries();
    updateStatistics();
    closeModal();
    
    // In real app, make API call to save to backend
    console.log('Saved bursary:', bursaryData);
}

// Close modal
function closeModal() {
    document.getElementById('bursaryModal').style.display = 'none';
    document.getElementById('bursaryForm').reset();
}

// Determine provider type based on provider name (simple heuristic)
function determineProviderType(providerName) {
    const name = providerName.toLowerCase();
    if (name.includes('department') || name.includes('government') || name.includes('state')) {
        return 'government';
    } else if (name.includes('university') || name.includes('college')) {
        return 'university';
    } else if (name.includes('foundation') || name.includes('trust') || name.includes('ngo')) {
        return 'ngo';
    } else {
        return 'corporate';
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Upload CSV (placeholder function)
function uploadCSV() {
    alert('CSV upload functionality coming soon!');
    // In real app, implement file upload and parsing
}