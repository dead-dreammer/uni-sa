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
        let serverLikes = null;
        try {
            const res = await fetch('/courses/liked-courses', { credentials: 'same-origin' });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    serverLikes = data;
                    // Update localStorage with server data for consistency
                    localStorage.setItem('likedCourses', JSON.stringify(serverLikes));
                }
            }
        } catch (e) {
            // network error - we'll fall back to localStorage
            console.warn('Could not fetch server likes:', e);
        }

        if (serverLikes && serverLikes.length) {
            // Mark buttons as liked based on server data
            likeButtons.forEach((btn) => {
                const cid = btn.closest('.option-card').dataset.courseId;
                const found = serverLikes.find(c => String(c.id) === String(cid));
                if (found) {
                    btn.classList.add('liked');
                    btn.textContent = '♥';
                } else {
                    btn.classList.remove('liked');
                    btn.textContent = '♡';
                }
            });
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
        button.addEventListener('click', async function() {
            const courseName = this.dataset.courseName;
            const courseId = this.closest('.option-card').dataset.courseId;
            const isLiked = this.classList.toggle('liked');

            // Prepare course data for localStorage
            const courseData = {
                id: String(courseId),
                name: courseName.split(' - ')[0] || courseName, // University name
                programName: courseName.split(' - ')[1] || '', // Program name
                province: '', // We don't have this on the button, but server will provide it
                timestamp: new Date().toISOString()
            };

            // Update localStorage immediately for fast UI response
            try {
                let ls = JSON.parse(localStorage.getItem('likedCourses') || '[]');
                if (isLiked) {
                    // Add if not already present
                    if (!ls.find(c => String(c.id) === String(courseId))) {
                        ls.push(courseData);
                    }
                    this.textContent = '♥';
                } else {
                    // Remove from list
                    ls = ls.filter(c => String(c.id) !== String(courseId));
                    this.textContent = '♡';
                }
                localStorage.setItem('likedCourses', JSON.stringify(ls));
            } catch (e) {
                console.warn('Could not update localStorage likedCourses', e);
            }

            // Persist to server
            try {
                if (isLiked) {
                    const res = await fetch('/courses/save_liked_course', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify({ program_id: courseId })
                    });
                    if (res.ok) {
                        // Refresh localStorage from server to get complete data
                        const serverRes = await fetch('/courses/liked-courses', { credentials: 'same-origin' });
                        if (serverRes.ok) {
                            const serverData = await serverRes.json();
                            localStorage.setItem('likedCourses', JSON.stringify(serverData));
                        }
                    }
                } else {
                    await fetch('/courses/remove_liked_course', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify({ program_id: courseId })
                    });
                }
            } catch (err) {
                console.error('Failed to sync liked course with server', err);
            }
        });
    });

    // Initialize
    updateNavigation();
});