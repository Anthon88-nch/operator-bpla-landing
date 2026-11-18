(() => {
  const METRIKA_ID = 112543150;
  const CONSENT_COOKIE = 'contract116_analytics';
  const CONSENT_MAX_AGE = 604800;
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mainContent = document.querySelector('main');
  const siteFooter = document.querySelector('footer.site-footer');
  const contactBar = document.querySelector('.mobile-contact-bar');
  const hero = document.querySelector('.hero');
  const contacts = document.querySelector('#contacts');
  const cookieNotice = document.querySelector('.cookie-notice');
  const cookieAccept = document.querySelector('[data-cookie-accept]');
  const cookieDecline = document.querySelector('[data-cookie-decline]');
  const cookieSettings = document.querySelectorAll('[data-cookie-settings]');

  function readCookie(name) {
    const prefix = `${name}=`;
    const item = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
    return item ? decodeURIComponent(item.slice(prefix.length)) : '';
  }

  let analyticsConsent = readCookie(CONSENT_COOKIE);
  let metrikaLoaded = false;

  function loadMetrika() {
    if (metrikaLoaded || analyticsConsent !== 'granted') return;
    metrikaLoaded = true;

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = window.ym.l || Date.now();

    const tagUrl = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`;
    if (!document.querySelector(`script[src="${tagUrl}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = tagUrl;
      document.head.append(script);
    }

    window.ym(METRIKA_ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });
  }

  function saveAnalyticsConsent(value) {
    analyticsConsent = value;
    document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    document.cookie = `contract116_notice=; Max-Age=0; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    if (value === 'granted') loadMetrika();
    if (cookieNotice) cookieNotice.hidden = true;
    updateContactBar();
  }

  function reachMetrikaGoal(goal) {
    if (analyticsConsent !== 'granted') return;
    loadMetrika();
    window.ym?.(METRIKA_ID, 'reachGoal', goal);
  }

  if (analyticsConsent === 'granted') loadMetrika();
  if (cookieNotice) cookieNotice.hidden = analyticsConsent === 'granted' || analyticsConsent === 'denied';
  cookieAccept?.addEventListener('click', () => saveAnalyticsConsent('granted'));
  cookieDecline?.addEventListener('click', () => saveAnalyticsConsent('denied'));
  cookieSettings.forEach((button) => button.addEventListener('click', () => {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    location.reload();
  }));

  function closeMenu(restoreFocus = false) {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
    if (mainContent) mainContent.inert = false;
    if (siteFooter) siteFooter.inert = false;
    if (restoreFocus) menuButton.focus();
    updateContactBar();
  }

  menuButton?.addEventListener('click', () => {
    if (!mobileMenu) return;
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    if (!opening) {
      closeMenu(true);
      return;
    }
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Закрыть меню');
    mobileMenu.hidden = false;
    document.body.classList.add('menu-open');
    if (mainContent) mainContent.inert = true;
    if (siteFooter) siteFooter.inert = true;
    mobileMenu.querySelector('a')?.focus();
    updateContactBar();
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      closeMenu(true);
    }
  });

  function updateContactBar() {
    if (!contactBar || !hero || !contacts) return;
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    const passedHero = hero.getBoundingClientRect().bottom < 120;
    const atContacts = contacts.getBoundingClientRect().top < window.innerHeight * 0.65;
    const visible = isMobile && passedHero && !atContacts && !document.body.classList.contains('menu-open') && (cookieNotice?.hidden ?? true);
    contactBar.classList.toggle('is-visible', visible);
    contactBar.setAttribute('aria-hidden', String(!visible));
    contactBar.inert = !visible;
  }

  window.addEventListener('scroll', updateContactBar, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1050) closeMenu(false);
    updateContactBar();
  });
  updateContactBar();

  const trainingVideo = document.querySelector('.training-video-player');
  const trainingPlay = document.querySelector('.training-video-play');
  let trainingStarted = false;
  let trainingCompleted = false;
  trainingPlay?.addEventListener('click', () => {
    if (!trainingVideo) return;
    trainingVideo.play().then(() => trainingVideo.focus()).catch(() => {});
  });
  function syncTrainingPlay() {
    if (trainingPlay && trainingVideo) trainingPlay.hidden = !trainingVideo.paused && !trainingVideo.ended;
  }
  trainingVideo?.addEventListener('play', () => {
    syncTrainingPlay();
    if (!trainingStarted) {
      trainingStarted = true;
      reachMetrikaGoal('video_rubicon_start');
    }
  });
  trainingVideo?.addEventListener('pause', syncTrainingPlay);
  trainingVideo?.addEventListener('ended', () => {
    syncTrainingPlay();
    if (!trainingCompleted) {
      trainingCompleted = true;
      reachMetrikaGoal('video_rubicon_complete');
    }
  });
  syncTrainingPlay();

  document.querySelectorAll('.messenger-link').forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href') || '';
      if (href.includes('max.ru')) reachMetrikaGoal('messenger_max_click');
      if (href.includes('t.me')) reachMetrikaGoal('messenger_telegram_click');
    });
  });

  document.querySelectorAll('a[href="attention.html"]').forEach((link) => {
    link.addEventListener('click', () => reachMetrikaGoal('attention_open'));
  });

  const contactForm = document.querySelector('[data-contact-form]');
  const contactFormStatus = document.querySelector('[data-contact-form-status]');

  function setFormStatus(message, type = '') {
    if (!contactFormStatus) return;
    contactFormStatus.textContent = message;
    contactFormStatus.classList.toggle('is-success', type === 'success');
    contactFormStatus.classList.toggle('is-error', type === 'error');
  }

  function prepareContactForm() {
    if (!contactForm) return;
    const startedAt = contactForm.elements.namedItem('started_at');
    if (startedAt) startedAt.value = String(Date.now());
  }

  function refreshStaleFormTimer() {
    if (!contactForm) return;
    const startedAt = contactForm.elements.namedItem('started_at');
    const value = Number(startedAt?.value || 0);
    if (!value || Date.now() - value > 2 * 60 * 60 * 1000) prepareContactForm();
  }

  contactForm?.addEventListener('input', refreshStaleFormTimer);

  contactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const name = contactForm.elements.namedItem('name');
    const contact = contactForm.elements.namedItem('contact');
    const message = contactForm.elements.namedItem('message');
    const website = contactForm.elements.namedItem('website');
    const startedAt = contactForm.elements.namedItem('started_at');
    const privacyAck = contactForm.elements.namedItem('privacy_ack');
    const consent = contactForm.elements.namedItem('consent');
    const requiredFields = [contact, message, privacyAck, consent];

    requiredFields.forEach((field) => field?.setAttribute('aria-invalid', 'false'));
    let firstInvalid = null;
    for (const field of requiredFields) {
      const value = field?.type === 'checkbox' ? '' : field?.value.trim() || '';
      const valid = field?.type === 'checkbox'
        ? field.checked
        : value.length >= Math.max(1, field?.minLength || 0) && field.checkValidity();
      if (!valid) {
        field?.setAttribute('aria-invalid', 'true');
        firstInvalid ||= field;
      }
    }
    if (firstInvalid) {
      setFormStatus('Проверьте обязательные поля и подтвердите оба пункта согласия.', 'error');
      firstInvalid.focus();
      return;
    }

    submitButton.disabled = true;
    setFormStatus('Отправляем обращение…');
    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(() => requestController.abort(), 18000);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        signal: requestController.signal,
        body: JSON.stringify({
          name: name?.value.trim() || '',
          contact: contact.value.trim(),
          message: message.value.trim(),
          website: website?.value || '',
          started_at: Number(startedAt?.value || 0),
          privacy_ack: Boolean(privacyAck.checked),
          consent: Boolean(consent.checked)
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error('delivery_failed');
      contactForm.reset();
      prepareContactForm();
      setFormStatus('Обращение отправлено. Мы ответим по указанному контакту.', 'success');
      reachMetrikaGoal('contact_form_success');
    } catch (_) {
      setFormStatus('Не удалось отправить обращение. Напишите нам в MAX или Telegram.', 'error');
    } finally {
      window.clearTimeout(requestTimeout);
      submitButton.disabled = false;
    }
  });
  prepareContactForm();

})();
