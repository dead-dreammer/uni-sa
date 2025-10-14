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
  const username = document.getElementById('username').value.trim();

  const email = document.getElementById('email').value.trim();
  const number = document.getElementById('number').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const dob = document.getElementById('dob').value.trim();
  const gender = document.getElementById('gender').value;


  // Validation
  if(!username || !email || !number || !password || !confirmPassword || !dob || !gender){
    alert("All required fields must be filled.");
    return;
  }
  if(number.length != 10){
    alert("Phone number must be 10 digits.");
    return;
  }
  if(password.length < 6){
    alert("Password must be at least 6 characters long.");
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
      body: JSON.stringify({username,  email, number, password, dob, gender})
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



