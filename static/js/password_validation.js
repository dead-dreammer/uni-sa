document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('newPassword');
    const togglePassword = document.getElementById('togglePassword');
    const strengthBar = document.querySelector('.password-strength-bar');
    const strengthText = document.getElementById('strengthText');
    const requirements = {
        length: document.getElementById('req-length'),
        uppercase: document.getElementById('req-uppercase'),
        lowercase: document.getElementById('req-lowercase'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special')
    };

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Update the eye icon
        const eyeIcon = this.querySelector('svg');
        if (type === 'text') {
            eyeIcon.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    });

    // Check password strength and requirements
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let score = 0;

        // Check requirements
        const hasLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        // Update requirement indicators
        updateRequirement(requirements.length, hasLength);
        updateRequirement(requirements.uppercase, hasUpperCase);
        updateRequirement(requirements.lowercase, hasLowerCase);
        updateRequirement(requirements.number, hasNumber);
        updateRequirement(requirements.special, hasSpecial);

        // Calculate score
        if (hasLength) score++;
        if (hasUpperCase) score++;
        if (hasLowerCase) score++;
        if (hasNumber) score++;
        if (hasSpecial) score++;

        // Update strength indicator
        strengthBar.className = 'password-strength-bar';
        if (score >= 5) {
            strengthBar.classList.add('strength-strong');
            strengthText.textContent = 'Strong password';
        } else if (score >= 3) {
            strengthBar.classList.add('strength-medium');
            strengthText.textContent = 'Medium strength password';
        } else if (score > 0) {
            strengthBar.classList.add('strength-weak');
            strengthText.textContent = 'Weak password';
        } else {
            strengthText.textContent = 'Enter password';
        }
    });

    function updateRequirement(element, isValid) {
        if (isValid) {
            element.classList.add('met');
            element.querySelector('svg').innerHTML = `
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9 12l2 2 4-4"></path>
            `;
        } else {
            element.classList.remove('met');
            element.querySelector('svg').innerHTML = `
                <circle cx="12" cy="12" r="10"></circle>
            `;
        }
    }
});