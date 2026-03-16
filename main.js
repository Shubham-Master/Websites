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
  liveSession: null,
  sessionsStatus: 'idle',
  sessionsError: ''
};

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
    throw new Error('Booking API is not configured. Set apiBaseUrl in app-config.js before deploying this site.');
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

  throw lastNetworkError instanceof Error ? lastNetworkError : new Error('Unable to reach the backend API.');
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
  byId('mobileMenu').classList.toggle('open');
}

function openModal(e, sessionId = '') {
  if (e) {
    e.preventDefault();
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
}

function closeModal() {
  byId('modal').classList.remove('open');
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
  button.textContent = isLoading ? 'Saving your spot...' : 'Reserve My Spot →';
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

function updateLiveSessionPreview(liveSession) {
  const preview = byId('liveSessionPreview');
  const grid = byId('accessGrid');
  if (!preview || !grid) {
    return;
  }

  if (!liveSession) {
    preview.classList.add('is-hidden');
    grid.classList.add('no-live-preview');
    return;
  }

  preview.classList.remove('is-hidden');
  grid.classList.remove('no-live-preview');

  const quote = byId('liveSessionQuote');
  const meta = byId('liveSessionMeta');

  if (quote && liveSession.quote) {
    quote.textContent = liveSession.quote;
  }

  if (meta && liveSession.meta) {
    meta.textContent = liveSession.meta;
  }
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
    renderSessionsState('loading', 'Loading live session schedule', 'We are fetching current circles from the booking backend.');
    return;
  }

  if (state.sessionsStatus === 'error') {
    renderSessionsState(
      'error',
      'Live schedule unavailable',
      state.sessionsError || 'The booking backend is not reachable right now. Set app-config.js and start the backend to show live sessions.'
    );
    return;
  }

  if (!state.sessions.length) {
    renderSessionsState(
      'empty',
      'No sessions published yet',
      'The backend is connected, but there are no bookable circles yet. Publish the first session from the backend or admin panel next.'
    );
    return;
  }

  grid.classList.remove('sessions-grid--status');
  grid.innerHTML = state.sessions.map((session, index) => {
    const featuredClass = index === 0 ? ' featured' : '';
    return `
      <div class="session-card${featuredClass}">
        <div class="session-meta">
          <span class="session-date">${escapeHtml(formatDateTime(session.startsAt))}</span>
          <span class="session-slots">${escapeHtml(getSlotLabel(session))}</span>
        </div>
        <h3>${escapeHtml(session.title)}</h3>
        <p>${escapeHtml(session.description)}</p>
        <div class="session-footer">
          <span class="session-price"${session.isFree ? ' style="color:var(--sage);"' : ''}>${escapeHtml(getPriceLabel(session))}</span>
          <a href="#" class="session-btn" onclick="openModal(event, '${escapeHtml(session.id)}')">Reserve Spot →</a>
        </div>
      </div>
    `;
  }).join('');

  applyRevealAnimations();
}

function syncSessionSelect() {
  const select = byId('f-session');
  if (!select) {
    return;
  }

  if (state.sessionsStatus === 'idle' || state.sessionsStatus === 'loading') {
    select.disabled = true;
    select.innerHTML = '<option value="">Connecting to live session schedule...</option>';
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

  try {
    const response = await apiFetch('/sessions');
    if (!response.ok) {
      throw new Error('Unable to fetch sessions.');
    }

    const data = await response.json();
    state.sessions = Array.isArray(data.items) ? data.items : [];
    state.liveSession = data.liveSession || null;
    state.sessionsStatus = 'ready';
    renderSessions();
    updateLiveSessionPreview(state.liveSession);
    syncSessionSelect();
  } catch (error) {
    console.error(error);
    state.sessions = [];
    state.liveSession = null;
    state.sessionsStatus = 'error';
    state.sessionsError = getErrorMessage(error, 'Unable to reach the booking backend.');
    state.selectedSessionId = '';
    renderSessions();
    updateLiveSessionPreview(null);
    showToast(`Upcoming sessions could not load right now. ${state.sessionsError}`);
    syncSessionSelect();
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
    return;
  }

  if (!selectedTopic && !customTopic) {
    setFormStatus('Please choose one promoted topic or enter your own topic for review.', true);
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

function applyRevealAnimations() {
  document.querySelectorAll(
    '.pain-card, .step, .session-card, .testimonial, .access-feat, .pricing-card, .destination-card, .timeline-item, .signal-card, .story-card, .feature-card, .value-card, .rule-card, .faq-category, .legal-card, .format-card, .membership-band'
  ).forEach((element) => {
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

applyRevealAnimations();
renderSessions();
syncSessionSelect();
updateLiveSessionPreview(null);
void loadSessions();
