const API_LOCAL = 'http://127.0.0.1:8000/api';
const API_REMOTE = 'https://polling-application-api.onrender.com/api';

let state = {
    apiBase: API_LOCAL,
    accessToken: null,
    currentUrl: `${API_LOCAL}/polls/`,
    selectedPollId: null,
    selectedChoiceId: null,
    currentUsername: null,
    currentRole: null,
    currentListMode: 'paginated'
};

function getAuthHeaders(includeJson = false) {
    const headers = {};
    if (includeJson) headers['Content-Type'] = 'application/json';
    if (state.accessToken) headers['Authorization'] = `Bearer ${state.accessToken}`;
    return headers;
}

function setApiBase(base) {
    state.apiBase = base;
    state.currentUrl = `${state.apiBase}/polls/`;
    document.getElementById('api-base-label').innerText = state.apiBase;
    loadPolls(`${state.apiBase}/polls/`);
}

function logAPIResponse(endpoint, status, data) {
    const logElement = document.getElementById('raw-log');
    const timestamp = new Date().toLocaleTimeString();
    logElement.innerText =
`[${timestamp}] ENDPOINT: ${endpoint}
[STATUS]: ${status}
[RESPONSE DATA]:
${JSON.stringify(data, null, 2)}

---------------------------
` + logElement.innerText;
}

async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return { detail: 'Risposta non JSON o vuota.' };
    }
}

function showAlert(message) {
    alert(message);
}

function buildPollsUrl(extraParams = {}) {
    const url = new URL(`${state.apiBase}/polls/`);
    Object.entries(extraParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    return url.toString();
}

async function refreshUserState() {
    if (!state.accessToken) {
        state.currentUsername = null;
        state.currentRole = null;
        document.getElementById('user-badge').classList.add('hidden');
        document.getElementById('btn-submit-vote').classList.add('hidden');
        return;
    }

    try {
        const res = await fetch(`${state.apiBase}/profiles/me/`, {
            headers: getAuthHeaders()
        });
        const data = await safeJson(res);
        logAPIResponse('/profiles/me/', res.status, data);

        if (res.ok) {
            state.currentUsername = data.username;
            state.currentRole = data.role || 'user';
            document.getElementById('badge-username').innerText = data.username;
            document.getElementById('badge-role').innerText = data.role || 'user';
            document.getElementById('user-badge').classList.remove('hidden');

            if (state.selectedChoiceId) {
                document.getElementById('btn-submit-vote').classList.remove('hidden');
            }
        } else {
            logout();
        }
    } catch (e) {
        console.error('Errore nel recupero profilo', e);
    }
}

function logout() {
    state.accessToken = null;
    state.currentUsername = null;
    state.currentRole = null;
    document.getElementById('user-badge').classList.add('hidden');
    document.getElementById('btn-submit-vote').classList.add('hidden');
    showAlert('Logout eseguito.');
}

async function loadPolls(url = state.currentUrl) {
    state.currentListMode = 'paginated';
    state.currentUrl = url;

    const listContainer = document.getElementById('polls-list');
    listContainer.innerHTML = '<div class="p-3 text-center text-muted">Interrogazione API in corso...</div>';

    try {
        const res = await fetch(url);
        const data = await safeJson(res);
        logAPIResponse(url.replace(state.apiBase, ''), res.status, data);

        if (!res.ok) {
            listContainer.innerHTML = '<div class="p-3 text-center text-danger">Errore nel recupero dei sondaggi.</div>';
            return;
        }

        const count = data.count !== undefined ? data.count : (Array.isArray(data) ? data.length : 0);
        const results = data.results || data || [];
        const nextLink = data.next || null;
        const prevLink = data.previous || null;

        document.getElementById('total-count').innerText = count;
        renderPollList(results);

        const nextBtn = document.getElementById('btn-next');
        const prevBtn = document.getElementById('btn-prev');

        if (nextLink) {
            nextBtn.disabled = false;
            nextBtn.onclick = () => loadPolls(nextLink);
        } else {
            nextBtn.disabled = true;
            nextBtn.onclick = null;
        }

        if (prevLink) {
            prevBtn.disabled = false;
            prevBtn.onclick = () => loadPolls(prevLink);
        } else {
            prevBtn.disabled = true;
            prevBtn.onclick = null;
        }
    } catch (err) {
        listContainer.innerHTML = '<div class="p-3 text-center text-danger">Impossibile comunicare con il server backend.</div>';
    }
}

async function loadVotedPolls() {
    if (!state.accessToken) {
        showAlert('Devi effettuare il login per vedere i sondaggi votati.');
        return;
    }

    const listContainer = document.getElementById('polls-list');
    listContainer.innerHTML = '<div class="p-3 text-center text-muted">Caricamento sondaggi votati...</div>';

    try {
        const res = await fetch(`${state.apiBase}/polls/voted/`, {
            headers: getAuthHeaders()
        });
        const data = await safeJson(res);
        logAPIResponse('/polls/voted/', res.status, data);

        if (!res.ok) {
            listContainer.innerHTML = '<div class="p-3 text-center text-danger">Errore nel recupero dei sondaggi votati.</div>';
            return;
        }

        state.currentListMode = 'custom';
        document.getElementById('total-count').innerText = data.length || 0;
        renderPollList(data);

        document.getElementById('btn-next').disabled = true;
        document.getElementById('btn-prev').disabled = true;
    } catch (err) {
        listContainer.innerHTML = '<div class="p-3 text-center text-danger">Impossibile comunicare con il server backend.</div>';
    }
}

function loadMyPolls() {
    if (!state.currentUsername) {
        showAlert('Devi prima effettuare il login per filtrare i tuoi sondaggi.');
        return;
    }

    document.getElementById('filter-creator').value = state.currentUsername;
    loadPolls(buildPollsUrl({
        created_by: state.currentUsername,
        page_size: 20
    }));
}

function renderPollList(results) {
    const listContainer = document.getElementById('polls-list');
    listContainer.innerHTML = '';

    if (!results || results.length === 0) {
        listContainer.innerHTML = '<div class="p-3 text-center bg-white border rounded">Nessun sondaggio trovato.</div>';
        return;
    }

    results.forEach(poll => {
        const item = document.createElement('div');
        item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center poll-card';
        item.style.cursor = 'pointer';
        item.innerHTML = `
            <div>
                <strong class="text-dark">${escapeHtml(poll.question)}</strong>
                <div class="small text-muted mt-1">
                    ID: ${poll.id} | Autore: ${escapeHtml(poll.created_by || 'N/D')} | Attivo: ${poll.is_active ? '✅' : '❌'}
                </div>
            </div>
            <span class="badge bg-secondary rounded-pill">${poll.choices ? poll.choices.length : 0} scelte</span>
        `;
        item.onclick = () => openPollDetail(poll.id);
        listContainer.appendChild(item);
    });
}

document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const search = document.getElementById('filter-search').value.trim();
    const question = document.getElementById('filter-question').value.trim();
    const creator = document.getElementById('filter-creator').value.trim();
    const active = document.getElementById('filter-active').value;
    const ordering = document.getElementById('filter-ordering').value;

    const url = buildPollsUrl({
        search,
        question,
        created_by: creator,
        is_active: active,
        ordering
    });

    loadPolls(url);
});

function resetFilters() {
    document.getElementById('filter-form').reset();
    loadPolls(`${state.apiBase}/polls/`);
}

async function openPollDetail(id) {
    state.selectedPollId = id;
    state.selectedChoiceId = null;

    document.getElementById('polls-list-wrapper').classList.add('hidden');
    document.getElementById('poll-detail-wrapper').classList.remove('hidden');
    document.getElementById('btn-submit-vote').classList.add('hidden');
    document.getElementById('vote-feedback').innerText = '';
    document.getElementById('detail-results-area').innerHTML = '<div class="text-muted small">Caricamento...</div>';

    try {
        const res = await fetch(`${state.apiBase}/polls/${id}/`);
        const poll = await safeJson(res);
        logAPIResponse(`/polls/${id}/`, res.status, poll);

        if (!res.ok) {
            showAlert('Errore nel caricamento del dettaglio del sondaggio.');
            backToList();
            return;
        }

        document.getElementById('detail-question').innerText = poll.question;
        document.getElementById('detail-meta').innerText = `ID: ${poll.id} • Creatore: ${poll.created_by} • Attivo: ${poll.is_active ? 'Sì' : 'No'}`;

        const choicesArea = document.getElementById('detail-choices-area');
        choicesArea.innerHTML = '';

        if (poll.choices && poll.choices.length > 0) {
            poll.choices.forEach(choice => {
                const div = document.createElement('div');
                div.className = 'form-check mb-2';
                div.innerHTML = `
                    <input class="form-check-input" type="radio" name="api-choice" id="rad-${choice.id}" value="${choice.id}">
                    <label class="form-check-label" for="rad-${choice.id}">${escapeHtml(choice.text)}</label>
                `;
                div.querySelector('input').addEventListener('change', () => {
                    state.selectedChoiceId = choice.id;
                    if (state.accessToken) {
                        document.getElementById('btn-submit-vote').classList.remove('hidden');
                    }
                });
                choicesArea.appendChild(div);
            });

            if (!state.accessToken) {
                choicesArea.innerHTML += `<div class="alert alert-warning p-2 small mt-2">Effettua il login per abilitare l'invio del voto.</div>`;
            }
        } else {
            choicesArea.innerHTML = '<p class="text-muted small">Nessuna opzione inserita in questo sondaggio.</p>';
        }

        loadPollResults(id);
    } catch (e) {
        console.error(e);
        showAlert('Errore di comunicazione con il backend.');
    }
}

async function loadPollResults(id) {
    const resultsArea = document.getElementById('detail-results-area');
    resultsArea.innerHTML = '<div class="text-muted small">Conteggio voti in corso...</div>';

    try {
        const res = await fetch(`${state.apiBase}/polls/${id}/results/`);
        const data = await safeJson(res);
        logAPIResponse(`/polls/${id}/results/`, res.status, data);

        if (!res.ok) {
            resultsArea.innerHTML = '<div class="text-danger small">Errore nel caricamento dei risultati.</div>';
            return;
        }

        resultsArea.innerHTML = `<p class="small text-secondary mb-2">Voti totali raccolti: <strong>${data.total_votes}</strong></p>`;

        (data.choices || []).forEach(c => {
            const percent = parseFloat(c.percentage || 0);
            resultsArea.innerHTML += `
                <div class="mb-2">
                    <div class="d-flex justify-content-between small text-dark mb-1">
                        <span>${escapeHtml(c.text)} (Id: ${c.id})</span>
                        <span class="fw-bold">${c.votes_count} voti (${percent.toFixed(2)}%)</span>
                    </div>
                    <div class="progress" style="height: 10px;">
                        <div
                            class="progress-bar bg-success"
                            role="progressbar"
                            style="width: ${percent}%"
                            aria-valuenow="${percent}"
                            aria-valuemin="0"
                            aria-valuemax="100">
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error(e);
        resultsArea.innerHTML = '<div class="text-danger small">Errore di comunicazione con il backend.</div>';
    }
}

document.getElementById('btn-submit-vote').addEventListener('click', async () => {
    const feedback = document.getElementById('vote-feedback');
    feedback.innerText = '';

    if (!state.accessToken) {
        feedback.className = 'mt-2 text-center fw-bold text-danger';
        feedback.innerText = '❌ Devi effettuare il login.';
        return;
    }

    if (!state.selectedPollId || !state.selectedChoiceId) {
        feedback.className = 'mt-2 text-center fw-bold text-danger';
        feedback.innerText = '❌ Seleziona una scelta.';
        return;
    }

    try {
        const res = await fetch(`${state.apiBase}/votes/`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify({
                poll: state.selectedPollId,
                choice: state.selectedChoiceId
            })
        });

        const data = await safeJson(res);
        logAPIResponse('/votes/', res.status, data);

        if (res.ok) {
            feedback.className = 'mt-2 text-center fw-bold text-success';
            feedback.innerText = '✅ Voto registrato! Aggiornamento risultati...';
            document.getElementById('btn-submit-vote').classList.add('hidden');
            loadPollResults(state.selectedPollId);
        } else {
            feedback.className = 'mt-2 text-center fw-bold text-danger';
            feedback.innerText = `❌ ${extractErrorMessage(data)}`;
        }
    } catch (e) {
        console.error(e);
        feedback.className = 'mt-2 text-center fw-bold text-danger';
        feedback.innerText = '❌ Errore di comunicazione con il backend.';
    }
});

function backToList() {
    document.getElementById('poll-detail-wrapper').classList.add('hidden');
    document.getElementById('polls-list-wrapper').classList.remove('hidden');

    if (state.currentListMode === 'custom') {
        return;
    }
    loadPolls(state.currentUrl);
}

// --- INTEGRAZIONI E CORREZIONI AL CODICE SOSPESO ---

// Gestore creazione sondaggio (completato)
document.getElementById('create-poll-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('poll-text-input').value.trim();
    const isActive = document.getElementById('poll-active-input').checked;

    try {
        const res = await fetch(`${state.apiBase}/polls/`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify({ question: text, is_active: isActive })
        });
        const data = await safeJson(res);
        logAPIResponse('/polls/', res.status, data);

        if (res.ok) {
            showAlert('Sondaggio creato con successo!');
            document.getElementById('create-poll-form').reset();
            loadPolls();
        } else {
            showAlert(`Errore: ${extractErrorMessage(data)}`);
        }
    } catch (err) {
        console.error(err);
        showAlert('Errore di rete durante la creazione del sondaggio.');
    }
});

// Funzione di utilità per fare l'escape dei caratteri HTML speciali
function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Funzione di utilità per estrarre messaggi di errore da risposte API complesse
function extractErrorMessage(data) {
    if (data && data.detail) return data.detail;
    if (data && typeof data === 'object') {
        return Object.values(data).flat().join(' ');
    }
    return 'Errore sconosciuto.';
}

// Event listener per i pulsanti di switch dell'ambiente (Locale / Deploy remoto)
document.getElementById('btn-local').addEventListener('click', () => setApiBase(API_LOCAL));
document.getElementById('btn-remote').addEventListener('click', () => setApiBase(API_REMOTE));

// Inizializzazione automatica al caricamento del file
document.addEventListener('DOMContentLoaded', () => {
    setApiBase(API_LOCAL);
});

// 🔐 GESTORE LOGIN (Invia i dati a Django)
document.getElementById('auth-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;

    try {
        // ATTENZIONE: Controlla se il tuo url di login su Django è /token/ o /login/
        const res = await fetch(`${state.apiBase}/token/`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await safeJson(res);
        logAPIResponse('/token/', res.status, data);

        if (res.ok) {
            // Salva il token JWT (SimpleJWT di solito usa 'access')
            state.accessToken = data.access || data.token || data.access_token; 
            showAlert('Login effettuato con successo!');
            document.getElementById('auth-login-form').reset();
            
            // Aggiorna l'interfaccia (mostra il badge utente in alto a destra)
            await refreshUserState();
            
            // Sposta automaticamente l'utente sul tab dei sondaggi
            const browseTab = new bootstrap.Tab(document.getElementById('browse-tab'));
            browseTab.show();
        } else {
            showAlert(`Errore di login: ${extractErrorMessage(data)}`);
        }
    } catch (err) {
        console.error(err);
        showAlert('Errore di rete durante il login. Controlla la console.');
    }
});

// 👤 GESTORE REGISTRAZIONE
document.getElementById('auth-register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-user').value.trim();
    const password = document.getElementById('reg-pass').value;
    const passwordConfirm = document.getElementById('reg-pass2').value;

    if (password !== passwordConfirm) {
        showAlert('Le password non coincidono!');
        return;
    }

    try {
        // ATTENZIONE: Controlla se il tuo url di registrazione su Django è /users/ o /register/
        const res = await fetch(`${state.apiBase}/users/`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await safeJson(res);
        logAPIResponse('/users/', res.status, data);

        if (res.ok) {
            showAlert('Registrazione completata! Ora puoi fare il login.');
            document.getElementById('auth-register-form').reset();
        } else {
            showAlert(`Errore di registrazione: ${extractErrorMessage(data)}`);
        }
    } catch (err) {
        console.error(err);
        showAlert('Errore di rete durante la registrazione.');
    }
});