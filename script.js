const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.role-card');
const roleCount = document.querySelector('#role-count');

document.querySelectorAll('.apply-button').forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = `application.html?job=${encodeURIComponent(button.dataset.job)}`;
  });
});

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    let visibleRoles = 0;

    filters.forEach((item) => item.classList.toggle('active', item === filter));
    cards.forEach((card) => {
      const isVisible = category === 'all' || card.dataset.category === category;
      card.hidden = !isVisible;
      if (isVisible) visibleRoles += 1;
    });

    roleCount.textContent = `${String(visibleRoles).padStart(2, '0')} roles`;
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mainNav.classList.toggle('open', !isOpen);
  menuToggle.textContent = isOpen ? '☰' : '×';
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('open');
    menuToggle.textContent = '☰';
  });
});
