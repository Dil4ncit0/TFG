document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.mode-btn');

  buttons.forEach(btn => {
    if (!btn.disabled) {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        window.location.href = `seleccion.html?mode=${mode}`;
      });
    }
  });
});
