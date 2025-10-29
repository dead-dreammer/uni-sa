// static/js/admin-auth.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminLoginFormElement');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
      const res = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = '/admin'; // redirect to admin dashboard
      } else {
        alert(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while logging in.');
    }
  });
});
