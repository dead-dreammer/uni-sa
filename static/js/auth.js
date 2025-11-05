function toggleForms() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (!loginForm || !signupForm) return;

  loginForm.classList.toggle('hidden');
  signupForm.classList.toggle('hidden');
}

// Login form submission
const loginFormEl = document.getElementById('loginFormElement');
if (loginFormEl) {
  loginFormEl.addEventListener('submit', async (e)=> {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        const res = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({email, password})
        });

        const result = await res.json();

        if(res.ok) {
            alert(result.message);
            window.location.href = '/home';
        } else {
        alert(`Login failed: ${result.message}`);
        }
    } catch (err) {
        console.error("Login fetch error:", err);
    }
  });
}

// Signup form submission
document.getElementById('signupForm').addEventListener('submit', async function(e){
  e.preventDefault();

  // Collect values
  const name = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const number = document.getElementById('number').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const dob = document.getElementById('dob').value.trim();
  const gender = document.getElementById('gender').value;
  const location = document.getElementById('location').value.trim();

  // Helper regexes
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{6,}$/;

  // Validation
  if(!name || !email || !number || !password || !confirmPassword || !dob || !gender || !location){
    alert("All required fields must be filled.");
    return;
  }
  if(!usernameRegex.test(name)){
    alert("Username must be 3-30 characters, only letters, numbers, _ or -");
    return;
  }
  if(location.length < 2){
    alert("Location must be at least 2 characters.");
    return;
  }
  if(!emailRegex.test(email)){
    alert("Please enter a valid email address.");
    return;
  }
  if(!phoneRegex.test(number)){
    alert("Phone number must be exactly 10 digits and only numbers.");
    return;
  }
  // Validate DOB: must be in the past and user at least 16 years old
  const dobDate = new Date(dob);
  const now = new Date();
  if(isNaN(dobDate.getTime()) || dobDate >= now){
    alert("Please enter a valid date of birth in the past.");
    return;
  }
  const age = now.getFullYear() - dobDate.getFullYear() - (now.getMonth() < dobDate.getMonth() || (now.getMonth() === dobDate.getMonth() && now.getDate() < dobDate.getDate()) ? 1 : 0);
  if(age < 16){
    alert("You must be at least 16 years old to sign up.");
    return;
  }
  if(!['Male','Female','Other'].includes(gender)){
    alert("Please select a valid gender.");
    return;
  }
  if(!passwordRegex.test(password)){
    alert("Password must be at least 6 characters, include at least one letter and one number.");
    return;
  }
  if(password !== confirmPassword){
    alert("Passwords do not match.");
    return;
  }

  try {
    const response = await fetch('/auth/sign-up', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, email, number, password, dob, gender, location})
    });

    const result = await response.json();

    if(response.ok){
      alert(result.message);
      window.location.href = '/home';
    } else {
      alert(`Signup failed: ${result.message}`);
    }
  } catch(err){
    console.error(err);
    alert("Network or server error. Check console for details.");
  }
});



