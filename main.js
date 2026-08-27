const LOCAL_API_BASE_URL = 'http://localhost:4000/api/v1';

function normalizeApiBaseUrl(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, '');
}

function isLocalFrontend() {
  const hostname = window.location.hostname;
  return (
    window.location.protocol === 'file:' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1'
  );
}

function getConfiguredApiBaseUrl() {
  const legacyApiBaseUrl = normalizeApiBaseUrl(window.UNMUTE_API_BASE_URL);
  if (legacyApiBaseUrl) {
    return legacyApiBaseUrl;
  }

  const appConfig =
    typeof window.UNMUTE_APP_CONFIG === 'object' && window.UNMUTE_APP_CONFIG !== null
      ? window.UNMUTE_APP_CONFIG
      : {};

  return normalizeApiBaseUrl(appConfig.apiBaseUrl);
}

const state = {
  sessions: [],
  selectedSessionId: '',
  apiBaseUrl: getConfiguredApiBaseUrl(),
  sessionsStatus: 'idle',
  sessionsError: ''
};

const MOOD_TAGS = [
  { key: 'rose', label: 'Tender', words: ['heartbreak', 'love', 'loss', 'grief', 'family', 'vulnerab', 'tender', 'relationship', 'misunderstood'] },
  { key: 'gold', label: 'Nostalgic', words: ['memory', 'memories', 'childhood', 'nostalgi', 'music', 'remember', 'joy'] },
  { key: 'lavender', label: 'Playful', words: ['humor', 'funny', 'laugh', 'whimsi', 'playful', 'light'] },
  { key: 'teal', label: 'Bold', words: ['fear', 'confidence', 'noisy', 'bold', 'brave', 'risk', 'change'] },
  { key: 'sage', label: 'Reflective', words: ['reflect', 'calm', 'quiet', 'listen', 'pause', 'stillness', 'help', 'guilt'] }
];

function getSessionMood(session, index) {
  const haystack = `${session.title || ''} ${session.description || ''}`.toLowerCase();
  return MOOD_TAGS.find((mood) => mood.words.some((word) => haystack.includes(word))) || MOOD_TAGS[index % MOOD_TAGS.length];
}

function buildApiCandidates() {
  const candidates = [];

  if (state.apiBaseUrl) {
    candidates.push(state.apiBaseUrl);
  }

  if (!state.apiBaseUrl && isLocalFrontend()) {
    candidates.push(LOCAL_API_BASE_URL);
  }

  return [...new Set(candidates)];
}

async function apiFetch(path, options = {}) {
  const candidates = buildApiCandidates();

  if (!candidates.length) {
    console.error('Booking API is not configured. Set apiBaseUrl in app-config.js before deploying this site.');
    throw new Error('We could not reach the booking service. Please try again shortly.');
  }

  let lastNetworkError = null;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      state.apiBaseUrl = baseUrl;
      return response;
    } catch (error) {
      lastNetworkError = error;
    }
  }

  console.error(lastNetworkError);
  throw new Error('We could not reach the booking service. Please try again shortly.');
}

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case '\'':
        return '&#39;';
      default:
        return character;
    }
  });
}

function byId(id) {
  return document.getElementById(id);
}

function toggleMenu() {
  const menu = byId('mobileMenu');
  const isOpen = menu.classList.toggle('open');
  const btn = byId('hamburgerBtn');
  if (btn) {
    btn.setAttribute('aria-expanded', String(isOpen));
  }
}

let modalTrigger = null;

function openModal(e, sessionId = '') {
  if (e) {
    e.preventDefault();
    modalTrigger = e.currentTarget || null;
  }

  state.selectedSessionId = sessionId || state.selectedSessionId || '';
  syncSessionSelect();
  clearFormStatus();

  if (state.sessionsStatus === 'loading') {
    setFormStatus('Live session schedule is still loading. You can still join the interest list now.');
  }

  if (state.sessionsStatus === 'error') {
    setFormStatus('Live checkout is unavailable right now. You can still submit the form to join the interest list.');
  }

  byId('modal').classList.add('open');
  const firstField = byId('f-name');
  if (firstField) {
    firstField.focus();
  }
}

function closeModal() {
  byId('modal').classList.remove('open');
  if (modalTrigger && typeof modalTrigger.focus === 'function') {
    modalTrigger.focus();
  }
  modalTrigger = null;
}

function handleGlobalKeydown(e) {
  if (e.key !== 'Escape') {
    return;
  }

  const modal = byId('modal');
  if (modal && modal.classList.contains('open')) {
    closeModal();
    return;
  }

  const menu = byId('mobileMenu');
  if (menu && menu.classList.contains('open')) {
    toggleMenu();
  }
}

function closeModalOutside(e) {
  if (e.target === byId('modal')) {
    closeModal();
  }
}

function toggleFAQ(btn) {
  const item = btn.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach((element) => element.classList.remove('open'));
  if (!wasOpen) {
    item.classList.add('open');
  }
}

function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

function setFormStatus(message, isError = false) {
  const status = byId('form-status');
  status.textContent = message;
  status.style.color = isError ? '#a93f2d' : 'var(--muted)';
}

function clearFormStatus() {
  setFormStatus('');
}

function setSubmitLoading(isLoading) {
  const button = byId('f-submit');
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Saving your spot…' : 'Reserve My Spot →';
}

function inferContactType(contact) {
  return contact.includes('@') ? 'email' : 'whatsapp';
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function getSlotLabel(session) {
  if (session.isFree) {
    return session.remainingSeats > 0 ? 'FREE SESSION' : 'Waitlist open';
  }

  if (session.remainingSeats <= 0) {
    return session.waitlistOpen ? 'Waitlist open' : 'Sold out';
  }

  if (session.remainingSeats === 1) {
    return '1 slot left';
  }

  return `${session.remainingSeats} slots left`;
}

function getPriceLabel(session) {
  return session.isFree ? 'Free' : `₹${session.priceInr}`;
}

function renderSessionsState(variant, title, description) {
  const grid = byId('sessionsGrid');
  if (!grid) {
    return;
  }

  grid.classList.add('sessions-grid--status');
  grid.innerHTML = `
    <div class="sessions-state" data-variant="${variant}">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </div>
  `;
}

function renderSessions() {
  const grid = byId('sessionsGrid');
  if (!grid) {
    return;
  }

  if (state.sessionsStatus === 'idle' || state.sessionsStatus === 'loading') {
    renderSessionsState('loading', 'Finding the next circle…', 'Checking the schedule for open seats.');
    return;
  }

  if (state.sessionsStatus === 'error') {
    renderSessionsState(
      'error',
      'The schedule is taking a moment',
      'We could not load upcoming circles just now. Refresh the page, or join the free intro session below and we will get you into a circle directly.'
    );
    return;
  }

  if (!state.sessions.length) {
    renderSessionsState(
      'empty',
      'New circles are being scheduled',
      'Nothing is on the calendar this exact moment. Check back soon, or join the free intro circle below to be first in line.'
    );
    return;
  }

  grid.classList.remove('sessions-grid--status');
  grid.innerHTML = state.sessions.map((session, index) => {
    const featuredClass = index === 0 ? ' featured' : '';
    const mood = getSessionMood(session, index);
    return `
      <div class="session-card${featuredClass}">
        <div class="session-meta">
          <span class="session-date">${escapeHtml(formatDateTime(session.startsAt))}</span>
          <span class="session-slots">${escapeHtml(getSlotLabel(session))}</span>
        </div>
        <span class="mood-tag mood-tag--${mood.key}">${escapeHtml(mood.label)}</span>
        <h3>${escapeHtml(session.title)}</h3>
        <p>${escapeHtml(session.description)}</p>
        <div class="session-footer">
          <span class="session-price"${session.isFree ? ' style="color:var(--sage);"' : ''}>${escapeHtml(getPriceLabel(session))}</span>
          <a href="#" class="session-btn" onclick="openModal(event, '${escapeHtml(session.id)}')">Reserve Spot →</a>
        </div>
      </div>
    `;
  }).join('');

  applyRevealAnimations(grid);
}

function syncSessionSelect() {
  const select = byId('f-session');
  if (!select) {
    return;
  }

  if (state.sessionsStatus === 'idle' || state.sessionsStatus === 'loading') {
    select.disabled = true;
    select.innerHTML = '<option value="">Connecting to live session schedule…</option>';
    return;
  }

  if (state.sessionsStatus === 'error') {
    select.disabled = false;
    select.innerHTML = '<option value="">Just exploring - tell me about upcoming sessions</option>';
    state.selectedSessionId = '';
    select.value = '';
    return;
  }

  if (!state.sessions.length) {
    select.disabled = false;
    select.innerHTML = '<option value="">No live sessions published right now - join the interest list</option>';
    state.selectedSessionId = '';
    select.value = '';
    return;
  }

  select.disabled = false;
  const options = state.sessions.map((session) => `
    <option value="${escapeHtml(session.id)}">
      ${escapeHtml(formatDateTime(session.startsAt))} - ${escapeHtml(session.title)} (${session.isFree ? 'FREE' : `₹${session.priceInr}`})
    </option>
  `).join('');

  select.innerHTML = `
    <option value="">Just exploring - let me know about all sessions</option>
    ${options}
  `;

  if (state.selectedSessionId) {
    select.value = state.selectedSessionId;
  }
}

async function loadSessions() {
  state.sessionsStatus = 'loading';
  state.sessionsError = '';
  renderSessions();
  syncSessionSelect();

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 12000);

  try {
    const response = await apiFetch('/sessions', { signal: timeoutController.signal });
    if (!response.ok) {
      throw new Error('Unable to fetch sessions.');
    }

    const data = await response.json();
    state.sessions = Array.isArray(data.items) ? data.items : [];
    state.sessionsStatus = 'ready';
    renderSessions();
    syncSessionSelect();
  } catch (error) {
    console.error(error);
    state.sessions = [];
    state.sessionsStatus = 'error';
    state.sessionsError = getErrorMessage(error, 'Unable to reach the booking backend.');
    state.selectedSessionId = '';
    renderSessions();
    showToast('We could not load the schedule just now. You can still join the interest list below.');
    syncSessionSelect();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function submitForm() {
  const name = byId('f-name').value.trim();
  const contact = byId('f-contact').value.trim();
  const selectedSessionId = byId('f-session').value.trim();
  const selectedTopic = byId('f-topic').value.trim();
  const customTopic = byId('f-custom-topic').value.trim();
  const note = byId('f-note').value.trim();

  if (!name || !contact) {
    setFormStatus('Please fill in your name and contact details.', true);
    byId(!name ? 'f-name' : 'f-contact').focus();
    return;
  }

  if (!selectedTopic && !customTopic) {
    setFormStatus('Please choose one promoted topic or enter your own topic for review.', true);
    byId('f-topic').focus();
    return;
  }

  const topicChoice = selectedTopic || null;
  const finalCustomTopic = customTopic || null;

  clearFormStatus();
  setSubmitLoading(true);

  try {
    if (!selectedSessionId) {
      const leadResponse = await apiFetch('/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: name,
          contact,
          contactType: inferContactType(contact),
          selectedSessionId: null,
          topicChoice,
          customTopic: finalCustomTopic,
          note: note || null,
          source: 'landing-page-modal'
        })
      });

      const leadData = await leadResponse.json();
      if (!leadResponse.ok) {
        throw new Error(leadData.message || 'Unable to save your interest right now.');
      }

      closeModal();
      showToast("You're in. We'll share upcoming circles shortly.");
      resetForm();
      return;
    }

    const bookingResponse = await apiFetch('/bookings/intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          displayName: name,
          contact,
          contactType: inferContactType(contact),
          topicChoice,
          customTopic: finalCustomTopic,
          note: note || null
        })
      });

    const bookingData = await bookingResponse.json();
    if (!bookingResponse.ok) {
      throw new Error(bookingData.message || 'Unable to create booking right now.');
    }

    if (!bookingData.paymentRequired) {
      closeModal();
      showToast(bookingData.message || "You're in! Check your inbox for the session link.");
      resetForm();
      await loadSessions();
      return;
    }

    const paymentResponse = await apiFetch('/payments/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingId: bookingData.bookingId
      })
    });

    const paymentData = await paymentResponse.json();
    if (!paymentResponse.ok) {
      throw new Error(paymentData.message || 'Unable to start payment right now.');
    }

    closeModal();
    showToast(`Seat held for 10 minutes. Mock payment order created: ${paymentData.providerOrderId}`);
    resetForm();
    await loadSessions();
  } catch (error) {
    console.error(error);
    setFormStatus(getErrorMessage(error, 'Something went wrong. Please try again.'), true);
  } finally {
    setSubmitLoading(false);
  }
}

function resetForm() {
  byId('f-name').value = '';
  byId('f-contact').value = '';
  byId('f-topic').value = '';
  byId('f-custom-topic').value = '';
  byId('f-note').value = '';
  state.selectedSessionId = '';
  syncSessionSelect();
  clearFormStatus();
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

const REVEAL_SELECTOR = '.pain-card, .step, .session-card, .testimonial, .access-feat, .pricing-card, .destination-card, .timeline-item, .signal-card, .story-card, .feature-card, .value-card, .rule-card, .faq-category, .legal-card, .format-card, .membership-band, .manifesto-line, .home-step, .access-item, .wide-editorial-media, .editorial-founder-card, .page-portrait-callout, .page-wide-media, .page-hero-banner, .guided-step, .page-interruption__media, .rule-line, .clarity-item, .faq-signal-card, .faq-support-visual';
const revealedElements = new WeakSet();

function applyRevealAnimations(root = document) {
  root.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
    if (revealedElements.has(element)) {
      return;
    }
    revealedElements.add(element);
    element.style.opacity = '0';
    element.style.transform = 'translateY(24px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
  });
}

window.toggleMenu = toggleMenu;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeModalOutside = closeModalOutside;
window.submitForm = submitForm;
window.toggleFAQ = toggleFAQ;

document.addEventListener('keydown', handleGlobalKeydown);

applyRevealAnimations();
renderSessions();
syncSessionSelect();
void loadSessions();
