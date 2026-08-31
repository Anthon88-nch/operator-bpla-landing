(() => {
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    mobileMenu.hidden = true;
    body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
    mobileMenu.hidden = isOpen;
    body.classList.toggle('menu-open', !isOpen);
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });

  const mobileContactBar = document.querySelector('.mobile-contact-bar');
  const mobileContactLink = mobileContactBar?.querySelector('a');
  const hero = document.querySelector('.hero');
  const application = document.querySelector('.application');
  let heroVisible = true;
  let applicationVisible = false;

  const updateMobileContactBar = () => {
    if (!mobileContactBar || !mobileContactLink) return;
    const visible = window.innerWidth <= 760 && !heroVisible && !applicationVisible;
    mobileContactBar.classList.toggle('is-visible', visible);
    mobileContactBar.setAttribute('aria-hidden', String(!visible));
    if (visible) mobileContactLink.removeAttribute('tabindex');
    else mobileContactLink.setAttribute('tabindex', '-1');
  };

  if ('IntersectionObserver' in window && hero && application) {
    const contactObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === application) applicationVisible = entry.isIntersecting;
      });
      updateMobileContactBar();
    }, { threshold: 0.08 });
    contactObserver.observe(hero);
    contactObserver.observe(application);
  }
  const syncMobileContactVisibility = () => {
    if (!hero || !application) return;
    const heroRect = hero.getBoundingClientRect();
    const applicationRect = application.getBoundingClientRect();
    heroVisible = heroRect.bottom > window.innerHeight * 0.08;
    applicationVisible = applicationRect.top < window.innerHeight * 0.92
      && applicationRect.bottom > window.innerHeight * 0.08;
    updateMobileContactBar();
  };
  window.addEventListener('scroll', syncMobileContactVisibility, { passive: true });
  window.addEventListener('resize', updateMobileContactBar);
  syncMobileContactVisibility();

  const videoFacade = document.querySelector('[data-rutube-src]');
  videoFacade?.addEventListener('click', () => {
    const source = videoFacade.dataset.rutubeSrc;
    if (!source) return;
    const iframe = document.createElement('iframe');
    iframe.src = source;
    iframe.title = 'Видео о подразделении Рубикон и работе с беспилотными системами';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.referrerPolicy = 'no-referrer';
    iframe.allowFullscreen = true;
    iframe.tabIndex = 0;
    videoFacade.replaceWith(iframe);
    iframe.focus();
  });

  const modal = document.querySelector('.demo-modal');
  const modalClose = modal?.querySelector('button');
  const modalAction = modal?.querySelector('a');
  let lastFocused = null;

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    body.classList.remove('modal-open');
    lastFocused?.focus();
  };
  const openModal = (trigger) => {
    if (!modal) return;
    lastFocused = trigger;
    modal.hidden = false;
    body.classList.add('modal-open');
    modalClose?.focus();
  };
  modalClose?.addEventListener('click', closeModal);
  modalAction?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeMenu(); closeModal(); } });

  document.querySelectorAll('[data-lead-form]').forEach((form) => {
    const name = form.elements.name;
    const phone = form.elements.phone;
    const consent = form.elements.consent;

    phone?.addEventListener('input', () => {
      const digits = phone.value.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11);
      const normalized = digits.startsWith('7') ? digits : `7${digits}`;
      const parts = [normalized.slice(1, 4), normalized.slice(4, 7), normalized.slice(7, 9), normalized.slice(9, 11)];
      let value = '+7';
      if (parts[0]) value += ` (${parts[0]}`;
      if (parts[0].length === 3) value += ')';
      if (parts[1]) value += ` ${parts[1]}`;
      if (parts[2]) value += `-${parts[2]}`;
      if (parts[3]) value += `-${parts[3]}`;
      phone.value = value;
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let valid = true;
      form.querySelectorAll('.field-error').forEach((item) => { item.textContent = ''; });
      form.querySelectorAll('.invalid').forEach((item) => item.classList.remove('invalid'));

      if (!name.value.trim() || name.value.trim().length < 2) {
        name.classList.add('invalid');
        name.parentElement.querySelector('.field-error').textContent = 'Укажите имя';
        valid = false;
      }
      if (phone.value.replace(/\D/g, '').length !== 11) {
        phone.classList.add('invalid');
        phone.parentElement.querySelector('.field-error').textContent = 'Введите полный номер телефона';
        valid = false;
      }
      if (!consent.checked) {
        consent.parentElement.querySelector('small').style.color = '#a93833';
        valid = false;
      } else {
        consent.parentElement.querySelector('small').style.color = '';
      }
      if (valid) openModal(form.querySelector('button[type="submit"]'));
    });
  });
})();
