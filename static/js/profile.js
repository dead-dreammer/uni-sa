document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.profile-page form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    // Collect values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const number = document.getElementById('number').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const location = document.getElementById('location').value.trim();
    const gender = document.getElementById('gender').value;

    // Regexes
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const usernameRegex = /^[a-zA-Z0-9 _-]{3,30}$/;

    // Validation
    if (!name || !email || !number || !dob || !location || !gender) {
      alert('All fields are required.');
      e.preventDefault();
      return;
    }
    if (!usernameRegex.test(name)) {
      alert('Name must be 3-30 characters, only letters, numbers, spaces, _ or -');
      e.preventDefault();
      return;
    }
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      e.preventDefault();
      return;
    }
    if (!phoneRegex.test(number)) {
      alert('Phone number must be exactly 10 digits and only numbers.');
      e.preventDefault();
      return;
    }
    // Validate DOB: must be in the past and user at least 16 years old
    const dobDate = new Date(dob);
    const now = new Date();
    if (isNaN(dobDate.getTime()) || dobDate >= now) {
      alert('Please enter a valid date of birth in the past.');
      e.preventDefault();
      return;
    }
    const age = now.getFullYear() - dobDate.getFullYear() - (now.getMonth() < dobDate.getMonth() || (now.getMonth() === dobDate.getMonth() && now.getDate() < dobDate.getDate()) ? 1 : 0);
    if (age < 16) {
      alert('You must be at least 16 years old.');
      e.preventDefault();
      return;
    }
    if (location.length < 2) {
      alert('Location must be at least 2 characters.');
      e.preventDefault();
      return;
    }
    if (!['Male','Female','Other'].includes(gender)) {
      alert('Please select a valid gender.');
      e.preventDefault();
      return;
    }
  });
});
