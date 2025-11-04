// Client-only search redirect helper (robust probing of candidate URLs)
// Put this file at: static/js/search_redirect.js
// Include it on home_pg.html after the search form scripts:
// <script src="{{ url_for('static', filename='js/search_redirect.js') }}"></script>

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form.search-form');
  if (!form) return;

  const input = form.querySelector('input[name="query"]');
  if (!input) return;

  // Mapping: keys -> array of candidate paths (tried in order)
  const mapping = {
    // Search/start dashboard
    'start': ['/search/start', '/search'],
    'start search': ['/search/start', '/search'],
    'search': ['/search/start', '/search'],
    'dashboard': ['/search/start', '/search'],

    // Courses / matches
    'matches': ['/courses/matches', '/courses/get_matches', '/courses/matches'],
    'courses': ['/courses/manage', '/courses', '/courses/all'],
    'manage courses': ['/courses/manage'],

    // Bursaries (multiple candidate routes)
    'bursary': ['/bursary', '/bursaries', '/student-tools/bursaries', '/Student%20Tools/bursaries', '/bursary/list', '/bursary/index'],
    'bursaries': ['/bursary', '/bursaries', '/student-tools/bursaries', '/Student%20Tools/bursaries'],
    'scholarship': ['/bursary', '/bursaries'],
    'funding': ['/bursary', '/bursaries'],
    'nsfas': ['/bursary', '/bursaries'],

    // Admissions
    'admissions': ['/admissions', '/admissions/api', '/admissions/calendar'],

    // Static pages (adjust to your actual routes)
    'about': ['/about', '/about-us'],
    'contact': ['/contact', '/contact-us'],
    'login': ['/auth/login', '/login'],
    'signup': ['/auth/sign-up', '/auth/sign_up', '/auth/sign-up'],
    'sign up': ['/auth/sign-up', '/auth/sign_up'],
    'profile': ['/personal_info', '/profile', '/account']
  };

  // Helper: normalize user input
  function normalize(s) {
    return (s || '').toLowerCase().trim().replace(/[^\w\s]/g, '');
  }

  // Return list of candidate URLs for a query (may be null)
  function candidateListForQuery(q) {
    if (!q) return null;
    const nq = normalize(q);

    // If user typed a raw path or absolute URL, try it directly
    if (nq.startsWith('/') || nq.startsWith('http://') || nq.startsWith('https://')) {
      // return the raw typed value as single candidate
      return [q];
    }

    // Exact key match
    if (mapping[nq]) return mapping[nq];

    // starts-with match
    for (const key of Object.keys(mapping)) {
      if (nq.startsWith(key)) return mapping[key];
    }

    // word match
    const words = nq.split(/\s+/);
    for (const key of Object.keys(mapping)) {
      if (words.includes(key)) return mapping[key];
    }

    // substring fallback
    for (const key of Object.keys(mapping)) {
      if (nq.includes(key)) return mapping[key];
    }

    return null;
  }

  // Probe candidate URLs sequentially and navigate to first OK one.
  // Returns true if redirected, false if none ok.
  async function probeAndRedirect(candidates) {
    if (!candidates || candidates.length === 0) return false;

    for (let candidate of candidates) {
      try {
        // Ensure candidate is an absolute/relative path starting with '/'
        if (!candidate.startsWith('http') && !candidate.startsWith('/')) {
          candidate = (candidate.startsWith('/') ? candidate : `/${candidate}`);
        }

        // Use GET to probe HTML route; same-origin assumed.
        const res = await fetch(candidate, {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Accept': 'text/html' }
        });

        // If the response is OK (200..299), redirect there.
        if (res && res.ok) {
          window.location.href = candidate;
          return true;
        }
      } catch (err) {
        // Network error or fetch rejected — continue to next candidate
        // console.debug('Probe failed for', candidate, err);
      }
    }

    return false;
  }

  // Modal: show friendly "not found" dialog
  function showNotFoundModal(query) {
    let modal = document.getElementById('searchRedirectModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'searchRedirectModal';
      modal.className = 'search-modal';
      modal.innerHTML = `
        <div class="search-modal-backdrop" id="searchModalBackdrop"></div>
        <div class="search-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="searchModalTitle">
          <button class="search-modal-close" id="searchModalClose" aria-label="Close dialog">✕</button>
          <div class="search-modal-content">
            <h3 id="searchModalTitle">No page found</h3>
            <p id="searchModalMessage"></p>
            <div class="search-modal-actions">
              <button class="search-modal-btn search-modal-ok" id="searchModalOk">Try again</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('searchModalClose').addEventListener('click', closeNotFoundModal);
      document.getElementById('searchModalOk').addEventListener('click', closeNotFoundModal);
      document.getElementById('searchModalBackdrop').addEventListener('click', closeNotFoundModal);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeNotFoundModal();
      });
    }

    const msgEl = document.getElementById('searchModalMessage');
    msgEl.textContent = `We couldn't find a page for "${query}". Check your spelling or try another term.`;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // lock background scroll
    input.focus();
  }

  function closeNotFoundModal() {
    const modal = document.getElementById('searchRedirectModal');
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
    input.focus();
  }

  // Main submit handler
  async function handleSubmit(e) {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) return;

    const candidates = candidateListForQuery(q);

    if (candidates && candidates.length > 0) {
      const redirected = await probeAndRedirect(candidates);
      if (redirected) return;
      // If candidates exist but none resolved to OK, show not-found modal
      showNotFoundModal(q);
      return;
    }

    // No mapping at all -> show not-found modal (instead of submitting to "match not found")
    showNotFoundModal(q);
  }

  form.addEventListener('submit', handleSubmit);
});