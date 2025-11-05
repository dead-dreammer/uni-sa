document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.option-card');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentCourseSpan = document.getElementById('currentCourse');
    const totalCoursesSpan = document.getElementById('totalCourses');
    let currentIndex = 0;

    // Update navigation buttons
    function updateNavigation() {
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === cards.length - 1;
        currentCourseSpan.textContent = currentIndex + 1;
        totalCoursesSpan.textContent = cards.length;
    }

    // Show specific card
    function showCard(index) {
        cards.forEach(card => card.classList.remove('active'));
        cards[index].classList.add('active');
        currentIndex = index;
        updateNavigation();
    }

    // Event listeners for navigation
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            showCard(currentIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < cards.length - 1) {
            showCard(currentIndex + 1);
        }
    });

    // Like button initialization and functionality
    const likeButtons = document.querySelectorAll('.like-button');

    // Initialize liked state: prefer server list (authoritative) then fall back to localStorage
    (async function initLikes() {
        let serverIds = null;
        try {
            const res = await fetch('/courses/liked-courses', { credentials: 'same-origin' });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) serverIds = data.map(String);
            }
        } catch (e) {
            // network error - we'll fall back to localStorage
        }

        if (serverIds && serverIds.length) {
            // Build a normalized local copy from server ids, trying to attach names from page markup
            const ls = [];
            likeButtons.forEach((btn, idx) => {
                const cid = btn.closest('.option-card').dataset.courseId;
                if (serverIds.includes(String(cid))) {
                    btn.classList.add('liked');
                    btn.textContent = '♥';
                    const name = btn.dataset.courseName || '';
                    ls.push({ id: String(cid), name: name, timestamp: new Date().toISOString() });
                } else {
                    btn.classList.remove('liked');
                    btn.textContent = '♡';
                }
            });
            try { localStorage.setItem('likedCourses', JSON.stringify(ls)); } catch (e) {}
        } else {
            // Fallback to localStorage
            let ls = [];
            try { ls = JSON.parse(localStorage.getItem('likedCourses') || '[]'); } catch (e) { ls = []; }
            likeButtons.forEach((btn) => {
                const cid = btn.closest('.option-card').dataset.courseId;
                const found = ls.find(c => String(c.id) === String(cid));
                if (found) {
                    btn.classList.add('liked');
                    btn.textContent = '♥';
                } else {
                    btn.classList.remove('liked');
                    btn.textContent = '♡';
                }
            });
        }
    })();

    // Attach click handlers after init so UI reflects correct starting state
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const courseName = this.dataset.courseName;
            const courseId = this.closest('.option-card').dataset.courseId;
            this.classList.toggle('liked');

            // Update localStorage for immediate UI updates across pages/tabs
            try {
                const ls = JSON.parse(localStorage.getItem('likedCourses') || '[]');
                if (this.classList.contains('liked')) {
                    // Add if not already present
                    if (!ls.find(c => String(c.id) === String(courseId))) {
                        ls.push({ id: String(courseId), name: courseName, timestamp: new Date().toISOString() });
                    }
                } else {
                    const idx = ls.findIndex(c => String(c.id) === String(courseId));
                    if (idx !== -1) ls.splice(idx, 1);
                }
                localStorage.setItem('likedCourses', JSON.stringify(ls));
            } catch (e) {
                console.warn('Could not update localStorage likedCourses', e);
            }

            // Persist to server (send credentials so session is used)
            if (this.classList.contains('liked')) {
                this.textContent = '♥';
                fetch('/courses/save_liked_course', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ program_id: courseId })
                }).then(res => res.json()).then(resp => {
                    // Optionally handle server response
                }).catch(err => {
                    console.error('Failed to save liked course', err);
                });
            } else {
                this.textContent = '♡';
                fetch('/courses/remove_liked_course', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ program_id: courseId })
                }).then(res => res.json()).then(resp => {
                    // Optionally handle server response
                }).catch(err => {
                    console.error('Failed to remove liked course', err);
                });
            }
        });
    });

    // Initialize
    updateNavigation();
});