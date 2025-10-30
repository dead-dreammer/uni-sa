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

    // Like button functionality
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', function() {
            const courseName = this.dataset.courseName;
            this.classList.toggle('liked');
            
            // You can add AJAX call here to save the liked status
            if (this.classList.contains('liked')) {
                this.textContent = '♥';
                // Save liked course
                fetch('/save_liked_course', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        course_id: this.closest('.option-card').dataset.courseId
                    })
                });
            } else {
                this.textContent = '♡';
                // Remove liked course
                fetch('/remove_liked_course', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        course_id: this.closest('.option-card').dataset.courseId
                    })
                });
            }
        });
    });

    // Initialize
    updateNavigation();
});