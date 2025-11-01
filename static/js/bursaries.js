// Public bursaries page: fetch from API and render
let bursaries = [];

async function fetchBursaries() {
    try {
        const resp = await fetch('/bursary/api/bursaries');
        if (!resp.ok) return [];
        return await resp.json();
    } catch (err) {
        console.error('Failed to fetch bursaries:', err);
        return [];
    }
}

// Create bursary card HTML
function createBursaryCard(bursary) {
    return `
        <div class="bursary-card" onclick="toggleCard(this)">
            <div class="bursary-header">
                <h3 class="bursary-title">${bursary.title}</h3>
                <p class="bursary-provider">${bursary.provider}</p>
                <div class="bursary-highlights">
                    <div class="highlight-item">
                        <span class="highlight-icon">💰</span>
                        <span>${bursary.amount || '—'}</span>
                    </div>
                    <div class="highlight-item">
                        <span class="highlight-icon">📅</span>
                        <span>${bursary.deadline || 'Ongoing'}</span>
                    </div>
                    <div class="highlight-item">
                        <span class="highlight-icon">📚</span>
                        <span>${bursary.field || 'All fields'}</span>
                    </div>
                </div>
                <div class="tag-container">
                    ${(bursary.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="bursary-details">
                <div class="details-section">
                    <h4>About This Bursary</h4>
                    <p>${bursary.description || ''}</p>
                </div>
                <div class="details-section">
                    <h4>Requirements</h4>
                    <ul>
                        ${(bursary.requirements || []).map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                <div class="details-section">
                    <h4>What's Covered</h4>
                    <p>${bursary.coverage || ''}</p>
                </div>
                ${bursary.url ? `<a href="${bursary.url}" target="_blank" class="apply-button">Visit Bursary Website →</a>` : ''}
            </div>
            <div class="expand-indicator"></div>
        </div>
    `;
}

// Toggle card expansion
function toggleCard(card) {
    card.classList.toggle('expanded');
}

// Filter and render
function filterBursaries() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const fieldFilter = (document.getElementById('fieldFilter')?.value || '').toLowerCase();
    const levelFilter = (document.getElementById('levelFilter')?.value || '').toLowerCase();

    const filtered = (bursaries || []).filter(b => {
        const matchesSearch = (b.title || '').toLowerCase().includes(searchTerm) ||
                              (b.provider || '').toLowerCase().includes(searchTerm) ||
                              (b.description || '').toLowerCase().includes(searchTerm);
        const matchesField = !fieldFilter || (b.field || '').toLowerCase().includes(fieldFilter);
        const matchesLevel = !levelFilter || (b.level || '').toLowerCase().includes(levelFilter);
        return matchesSearch && matchesField && matchesLevel;
    });

    const grid = document.getElementById('bursaryGrid');
    const noResults = document.getElementById('noResults');

    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">No bursaries found matching your criteria.</div>';
        if (noResults) noResults.style.display = 'block';
    } else {
        grid.innerHTML = filtered.map(createBursaryCard).join('');
        if (noResults) noResults.style.display = 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    bursaries = await fetchBursaries();
    filterBursaries();

    document.getElementById('searchInput')?.addEventListener('input', filterBursaries);
    document.getElementById('fieldFilter')?.addEventListener('change', filterBursaries);
    document.getElementById('levelFilter')?.addEventListener('change', filterBursaries);
});