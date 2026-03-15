const API_BASE_URL = window.UNMUTE_API_BASE_URL || null;

const state = {
  sessions: [],
  selectedSessionId: '',
  apiBaseUrl: API_BASE_URL,
  initialSessionsMarkup: '',
  initialSessionOptionsMarkup: ''
};

function buildApiCandidates() {
  const candidates = [];
  const currentHost = window.location.hostname;
  const currentOrigin = window.location.origin;

  if (API_BASE_URL) {
    candidates.push(API_BASE_URL);
  }

  if (currentOrigin) {
    candidates.push(`${currentOrigin.replace(/:\d+$/, ':4000')}/api/v1`);
  }

  if (currentHost && currentHost !== '::' && currentHost !== '[::]') {
    candidates.push(`http://${currentHost}:4000/api/v1`);
  }

  candidates.push('http://[::1]:4000/api/v1');
  candidates.push('http://127.0.0.1:4000/api/v1');
  candidates.push('http://localhost:4000/api/v1');

  return [...new Set(candidates)];
}

async function apiFetch(path, options) {
  const candidates = state.apiBaseUrl ? [state.apiBaseUrl] : buildApiCandidates();
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

  throw lastNetworkError || new Error('Unable to reach the backend API.');
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
    return 'Waitlist open';
  }

  if (session.remainingSeats === 1) {
    return '1 slot left';
  }

  return `${session.remainingSeats} slots left`;
}

function getPriceLabel(session) {
  return session.isFree ? 'Free' : `₹${session.priceInr}`;
}

function renderSessions() {
  const grid = byId('sessionsGrid');
  if (!grid) {
    return;
  }

  if (!state.sessions.length) {
    if (state.initialSessionsMarkup) {
      grid.innerHTML = state.initialSessionsMarkup;
    }
    return;
  }

  grid.innerHTML = state.sessions.map((session, index) => {
    const featuredClass = index === 0 ? ' featured' : '';
    const slotStyle = index === 0 ? ' style="background:rgba(255,255,255,0.2);color:white;"' : '';
    return `
      <div class="session-card${featuredClass}">
        <div class="session-meta">
          <span class="session-date">${formatDateTime(session.startsAt)}</span>
          <span class="session-slots"${slotStyle}>${getSlotLabel(session)}</span>
        </div>
        <h3>${session.title}</h3>
        <p>${session.description}</p>
        <div class="session-footer">
          <span class="session-price"${session.isFree ? ' style="color:var(--sage);"' : ''}>${getPriceLabel(session)}</span>
          <a href="#" class="session-btn" onclick="openModal(event, '${session.id}')">Reserve Spot →</a>
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

   if (!state.sessions.length) {
    if (state.initialSessionOptionsMarkup) {
      select.innerHTML = state.initialSessionOptionsMarkup;
    }
    if (state.selectedSessionId) {
      select.value = state.selectedSessionId;
    }
    return;
  }

  const options = state.sessions.map((session) => `
    <option value="${session.id}">
      ${formatDateTime(session.startsAt)} - ${session.title} (${session.isFree ? 'FREE' : `₹${session.priceInr}`})
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
  try {
    const response = await apiFetch('/sessions');
    if (!response.ok) {
      throw new Error('Unable to fetch sessions.');
    }

    const data = await response.json();
    state.sessions = Array.isArray(data.items) ? data.items : [];
    renderSessions();
    syncSessionSelect();
  } catch (error) {
    console.error(error);
    state.sessions = [];
    renderSessions();
    const detail = error instanceof Error ? error.message : 'Unknown error';
    showToast(`Upcoming sessions could not load right now. ${detail}`);
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
    setFormStatus(error.message || 'Something went wrong. Please try again.', true);
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
  document.querySelectorAll('.pain-card, .step, .session-card, .testimonial, .access-feat, .pricing-card').forEach((element) => {
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
state.initialSessionsMarkup = byId('sessionsGrid') ? byId('sessionsGrid').innerHTML : '';
state.initialSessionOptionsMarkup = byId('f-session') ? byId('f-session').innerHTML : '';
void loadSessions();
