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

// Create compact bursary card HTML (click to open modal)
function createBursaryCard(bursary) {
    const tags = (bursary.tags && Array.isArray(bursary.tags)) ? bursary.tags :
                 (typeof bursary.tags === 'string' ? safeParseJSON(bursary.tags, []) : []);
    const amount = bursary.amount || '—';
    const deadline = bursary.deadline || 'Ongoing';
    const field = bursary.field || 'All fields';

    return `
        <div class="bursary-card" onclick="openBursaryModal(${bursary.id})" role="button" tabindex="0">
            <div class="bursary-header">
                <h3 class="bursary-title">${escapeHtml(bursary.title)}</h3>
                <p class="bursary-provider">${escapeHtml(bursary.provider || '')}</p>
                <div class="bursary-highlights">
                    <div class="highlight-item">
                        <span class="highlight-icon">💰</span>
                        <span>${escapeHtml(amount)}</span>
                    </div>
                    <div class="highlight-item">
                        <span class="highlight-icon">📅</span>
                        <span>${escapeHtml(deadline)}</span>
                    </div>
                    <div class="highlight-item">
                        <span class="highlight-icon">📚</span>
                        <span>${escapeHtml(field)}</span>
                    </div>
                </div>
                <div class="tag-container">
                    ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Utility: safe JSON parse fallback
function safeParseJSON(input, fallback) {
    try {
        if (!input) return fallback;
        return typeof input === 'object' ? input : JSON.parse(input);
    } catch (e) {
        return fallback;
    }
}

// Escape HTML to avoid injection
function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Open bursary modal and populate details
function openBursaryModal(id) {
    const bursary = bursaries.find(b => Number(b.id) === Number(id));
    if (!bursary) return;

    const modal = document.getElementById('bursaryModal');
    const body = document.getElementById('bursaryModalBody');

    const requirements = safeParseJSON(bursary.requirements, []);
    const tags = safeParseJSON(bursary.tags, []);
    const coverage = bursary.coverage || '';
    const link = bursary.url || '';
    const program = bursary.programName || '';
    const level = bursary.level || bursary.studyLevel || '';
    const deadline = bursary.deadline || 'Ongoing';

    // Build additional info section
    let additionalInfo = '';
    if (program || level || coverage || requirements.length > 0) {
        additionalInfo = '<div class="modal-additional-info">';
        if (program) additionalInfo += `<div class="modal-info-item"><strong>Program:</strong> ${escapeHtml(program)}</div>`;
        if (level) additionalInfo += `<div class="modal-info-item"><strong>Study Level:</strong> ${escapeHtml(level)}</div>`;
        if (coverage) additionalInfo += `<div class="modal-info-item"><strong>Coverage:</strong> ${escapeHtml(coverage)}</div>`;
        if (requirements.length > 0) {
            additionalInfo += `<div class="modal-info-item"><strong>Requirements:</strong><ul>`;
            requirements.forEach(req => {
                const reqText = typeof req === 'string' ? req : JSON.stringify(req);
                additionalInfo += `<li>${escapeHtml(reqText)}</li>`;
            });
            additionalInfo += `</ul></div>`;
        }
        additionalInfo += '</div>';
    }

    // Build tags markup
    const tagsMarkup = (tags && tags.length > 0) ? `<div style="margin-top:12px;">${tags.map(t => `<span class="tag" style="margin-right:6px;">${escapeHtml(t)}</span>`).join('')}</div>` : '';

    body.innerHTML = `
        <span class="modal-event-type">${escapeHtml(bursary.provider || '')}</span>
        <h2 id="bursaryModalTitle" class="modal-title">${escapeHtml(bursary.title)}</h2>
        <p class="modal-university">${escapeHtml(bursary.provider || '')}</p>
        <div class="modal-date-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${escapeHtml(deadline)}
        </div>
        ${bursary.description ? `<p class="modal-description">${escapeHtml(bursary.description)}</p>` : ''}
        ${additionalInfo}
        ${tagsMarkup}
        ${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener" class="modal-link-btn">Visit Provider Website</a>` : ''}
    `;

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
}

// Close bursary modal
function closeBursaryModal() {
    const modal = document.getElementById('bursaryModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
}

// Filter and render
function filterBursaries() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const fieldFilter = (document.getElementById('fieldFilter')?.value || '').toLowerCase();
    const levelFilter = (document.getElementById('levelFilter')?.value || '').toLowerCase();

    const filtered = (bursaries || []).filter(b => {
        const title = (b.title || '').toLowerCase();
        const provider = (b.provider || '').toLowerCase();
        const desc = (b.description || '').toLowerCase();
        const field = (b.field || '').toLowerCase();
        const level = (b.level || b.studyLevel || '').toLowerCase();

        const matchesSearch = title.includes(searchTerm) || provider.includes(searchTerm) || desc.includes(searchTerm);
        const matchesField = !fieldFilter || field.includes(fieldFilter);
        const matchesLevel = !levelFilter || level.includes(levelFilter);

        return matchesSearch && matchesField && matchesLevel;
    });

    const grid = document.getElementById('bursaryGrid');
    const noResults = document.getElementById('noResults');

    if (!grid) return;

    if (filtered.length === 0) {
       
        if (noResults) noResults.style.display = 'block';
    } else {
        grid.innerHTML = filtered.map(createBursaryCard).join('');
        if (noResults) noResults.style.display = 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    bursaries = await fetchBursaries();
    // Ensure numeric id field exists for each bursary for compatibility
    bursaries = bursaries.map(b => ({ id: b.id || b.bursary_id || b.bursaryId, ...b }));

    filterBursaries();

    document.getElementById('searchInput')?.addEventListener('input', filterBursaries);
    document.getElementById('fieldFilter')?.addEventListener('change', filterBursaries);
    document.getElementById('levelFilter')?.addEventListener('change', filterBursaries);

    // Modal listeners
    document.getElementById('bursaryCloseBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeBursaryModal();
    });
    document.getElementById('bursaryBackdrop')?.addEventListener('click', closeBursaryModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBursaryModal();
    });
});