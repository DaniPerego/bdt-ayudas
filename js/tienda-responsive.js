// Script pequeño para toggle del nav en mobile y cierre al click fuera
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('_toggle');
  const items = document.getElementById('_items');

  if(!toggle || !items) return;

  function setOpen(open){
    if(open){
      items.classList.add('open');
      items.setAttribute('aria-expanded','true');
      toggle.setAttribute('aria-expanded','true');
    } else {
      items.classList.remove('open');
      items.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-expanded','false');
    }
  }

  toggle.addEventListener('click', (e) => {
    const isOpen = items.classList.contains('open');
    setOpen(!isOpen);
  });

  // cerrar al click fuera en mobile
  document.addEventListener('click', (e) => {
    if(window.innerWidth > 900) return;
    if(!items.classList.contains('open')) return;
    const withinNav = e.composedPath().includes(items) || e.composedPath().includes(toggle);
    if(!withinNav) setOpen(false);
  });

  // cerrar al redimensionar si pasa a desktop
  window.addEventListener('resize', () => {
    if(window.innerWidth > 900) setOpen(false);
  });
});