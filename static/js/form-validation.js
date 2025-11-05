// Global form validation helper
// Attach to all forms and prevent submission when invalid.

document.addEventListener('DOMContentLoaded', () => {
  const forms = Array.from(document.querySelectorAll('form'));

  forms.forEach(form => {
    // Skip forms that explicitly opt out
    if (form.hasAttribute('data-no-validate')) return;

    // On submit, check validity and report the first invalid control
    form.addEventListener('submit', (e) => {
      // Allow GET forms and external actions to proceed (they may still be validated)
      if (form.method && form.method.toLowerCase() === 'get') return;

      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();

        // Find first invalid element and call reportValidity
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) {
          // Add a class for styling
          firstInvalid.classList.add('invalid');
          // Ensure it's visible/focused
          try { firstInvalid.focus(); } catch (err) {}
          // Use native browser message where supported
          if (typeof firstInvalid.reportValidity === 'function') {
            firstInvalid.reportValidity();
          } else {
            alert('Please complete the form.');
          }
        }

        return false;
      }

      // If valid, allow submit to proceed. Optionally, we could provide a hook here
      return true;
    }, { passive: false });

    // Remove invalid class as user types
    form.addEventListener('input', (e) => {
      const target = e.target;
      if (target && target.classList && target.classList.contains('invalid')) {
        if (target.checkValidity()) target.classList.remove('invalid');
      }
    });
  });

  // Optional: style invalid inputs by injecting a small CSS rule if not already present
  const styleId = 'form-validation-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      input.invalid, textarea.invalid, select.invalid { outline: 2px solid #ef4444; background: #fff5f5; }
      .validation-note { color: #ef4444; font-size: 0.9rem; margin-top: 0.25rem; }
    `;
    document.head.appendChild(style);
  }
});
