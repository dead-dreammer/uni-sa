function toggleForms() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  loginForm.classList.toggle('hidden');
  signupForm.classList.toggle('hidden');
}

// Login form submission
document.getElementById('loginFormElement').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    alert("All fields are required.");
    return;
  }

  alert(`Login successful for ${email}!`);
  // window.location.href = "dashboard.html"; // redirect to dashboard
});

// Signup form submission
document.getElementById('signupFormElement').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const number = document.getElementById('number').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const dob = document.getElementById('dob').value.trim();
  const gender = document.getElementById('gender').value;

  if (!username || !email || !number || !password || !confirmPassword || !dob || !gender) {
    alert("All required fields must be filled.");
    return;
  }
  if (number.length !== 10) {
    alert("Phone number must be 10 digits.");
    return;
  }
  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  alert(`Account created successfully for ${username}!`);
  // window.location.href = "dashboard.html"; // redirect to dashboard
});