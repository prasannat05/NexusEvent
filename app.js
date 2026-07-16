// Global Normalized State Base
const defaultEvents = [
    { id: "1", title: "Inter-College Tech Symposium", date: "2026-08-15T09:00", location: "Main Seminar Hall", maxCapacity: 150, attendees: [] },
    { id: "2", title: "Battle of the Bands - Cultural Fest", date: "2026-09-02T17:00", location: "Open Air Theatre (OAT)", maxCapacity: 500, attendees: [] }
];

let state = {
    currentRole: 'participant',
    events: JSON.parse(localStorage.getItem('ev_data')) || defaultEvents,
    myTickets: JSON.parse(localStorage.getItem('ev_tickets')) || []
};

function saveToStorage() {
    localStorage.setItem('ev_data', JSON.stringify(state.events));
    localStorage.setItem('ev_tickets', JSON.stringify(state.myTickets));
}

// Master Initialization Hook
document.addEventListener('DOMContentLoaded', () => {
    initRoleSelector();
    setupNavigation(state.currentRole);
    initForms();
    initSearch();
});

function initRoleSelector() {
    const selector = document.getElementById('role-select');
    if (!selector) return;
    
    selector.value = state.currentRole;
    selector.addEventListener('change', (e) => {
        state.currentRole = e.target.value;
        setupNavigation(state.currentRole);
    });
}

function setupNavigation(role) {
    const navContainer = document.getElementById('dynamic-nav');
    if (!navContainer) return;
    
    const links = {
        participant: [
            { target: 'view-explore', label: 'Browse Registry' },
            { target: 'view-tickets', label: 'Access Credentials' }
        ],
        organizer: [
            { target: 'view-organizer', label: 'Management Desk' },
            { target: 'view-explore', label: 'Global Registry Preview' }
        ],
        admin: [
            { target: 'view-admin', label: 'System Master View' },
            { target: 'view-explore', label: 'Global Registry Feed' }
        ]
    };

    navContainer.innerHTML = links[role].map((link, idx) => `
        <button class="nav-btn ${idx === 0 ? 'active' : ''}" data-target="${link.target}">
            ${link.label}
        </button>
    `).join('');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchView(btn.dataset.target);
        });
    });

    switchView(links[role][0].target);
}

function switchView(targetId) {
    document.querySelectorAll('.view-section').forEach(section => section.classList.add('hidden'));
    const targeted = document.getElementById(targetId);
    if (targeted) targeted.classList.remove('hidden');
    
    const searchBar = document.getElementById('search-bar');
    if (searchBar) searchBar.value = '';
    
    renderViews();
}

function renderViews() {
    renderExploreView(state.events);
    renderTicketsView();
    renderOrganizerView();
    renderAdminView();
}

/* ==========================================================================
   👥 STUDENT PORTAL MODULE DECK
   ========================================================================== */
function renderExploreView(eventsToRender) {
    const grid = document.getElementById('explore-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (eventsToRender.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-dimmed); font-size: 0.9rem; padding: 1rem;">No matching event entries found.</p>`;
        return;
    }

    eventsToRender.forEach(event => {
        const booked = event.attendees.length;
        const percent = Math.min((booked / event.maxCapacity) * 100, 100);
        const isRegistered = state.myTickets.includes(event.id);
        const isFull = booked >= event.maxCapacity;

        let actionBtn = `<button class="btn btn-primary" onclick="registerEvent('${event.id}')">Request Registration</button>`;
        if (isRegistered) actionBtn = `<button class="btn btn-primary" disabled>Confirmed</button>`;
        else if (isFull) actionBtn = `<button class="btn btn-danger" disabled>Capacity Exhausted</button>`;

        const card = document.createElement('div');
        card.className = 'ui-card';
        card.setAttribute('data-id', event.id);
        card.innerHTML = `
            <div>
                <h3>${event.title}</h3>
                <div class="ui-card-meta">Timing: ${new Date(event.date).toLocaleString()}</div>
                <div class="ui-card-meta">Location: ${event.location}</div>
                <div class="capacity-tracker">
                    <div class="capacity-text">
                        <span>Roster Capacity</span>
                        <span>${booked} / ${event.maxCapacity} Students Registered</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%"></div></div>
                </div>
            </div>
            ${actionBtn}
        `;
        grid.appendChild(card);
    });
}

window.registerEvent = function(id) {
    const event = state.events.find(e => e.id === id);
    if (event && event.attendees.length < event.maxCapacity && !state.myTickets.includes(id)) {
        event.attendees.push('simulated-identity-token');
        state.myTickets.push(id);
        saveToStorage();
        renderViews();
    }
};

function renderTicketsView() {
    const grid = document.getElementById('tickets-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const bookedEvents = state.events.filter(e => state.myTickets.includes(e.id));
    
    if (bookedEvents.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-dimmed); font-size: 0.9rem;">No entries found in active credential storage.</p>`;
        return;
    }

    bookedEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = 'ui-card';
        card.innerHTML = `
            <span class="ui-card-badge">Confirmed RSVP</span>
            <div>
                <h3>${event.title}</h3>
                <div class="ui-card-meta">Timing: ${new Date(event.date).toLocaleString()}</div>
                <div class="ui-card-meta">Location: ${event.location}</div>
                <p style="margin-top:1.5rem; font-size: 0.75rem; font-family: monospace; color: var(--text-dimmed)">STUDENT PASS ID: CAMPUS-${event.id}-ID</p>
            </div>
            <button class="btn btn-danger" style="margin-top:1.5rem;" onclick="cancelTicket('${event.id}')">Cancel RSVP</button>
        `;
        grid.appendChild(card);
    });
}

window.cancelTicket = function(id) {
    const event = state.events.find(e => e.id === id);
    if (event) {
        event.attendees = event.attendees.filter(a => a !== 'simulated-identity-token');
        state.myTickets = state.myTickets.filter(tid => tid !== id);
        saveToStorage();
        renderViews();
    }
};

/* ==========================================================================
   👔 CLUB ORGANIZER CONSOLE DECK
   ========================================================================== */
function initForms() {
    const form = document.getElementById('create-event-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newEvent = {
            id: Date.now().toString(),
            title: document.getElementById('ev-title').value,
            date: document.getElementById('ev-date').value,
            location: document.getElementById('ev-location').value,
            maxCapacity: parseInt(document.getElementById('ev-capacity').value),
            attendees: []
        };

        state.events.push(newEvent);
        saveToStorage();
        form.reset();
        renderViews();
    });
}

function renderOrganizerView() {
    const container = document.getElementById('organizer-events-list');
    if (!container) return;
    container.innerHTML = '';

    if (state.events.length === 0) {
        container.innerHTML = `<p style="color:var(--text-dimmed); font-size: 0.9rem;">No active configurations deployed.</p>`;
        return;
    }

    state.events.forEach(event => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div>
                <strong style="font-size: 0.9rem; font-weight: 500; color: var(--text-intense);">${event.title}</strong>
                <div style="font-size:0.8rem; color:var(--text-dimmed); margin-top: 0.15rem;">Allocated: ${event.attendees.length}</div>
            </div>
            <button class="btn btn-danger" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;" onclick="deleteEvent('${event.id}')">Deprovision</button>
        `;
        container.appendChild(row);
    });
}

window.deleteEvent = function(id) {
    state.events = state.events.filter(e => e.id !== id);
    state.myTickets = state.myTickets.filter(tid => tid !== id);
    saveToStorage();
    renderViews();
};

/* ==========================================================================
   🛡️ CAMPUS MASTER ADMINISTRATIVE CONTROL
   ========================================================================== */
function renderAdminView() {
    const totalEventsEl = document.getElementById('admin-total-events');
    const totalRegsEl = document.getElementById('admin-total-registrations');
    const tbody = document.getElementById('admin-master-tbody');

    if (totalEventsEl) totalEventsEl.innerText = state.events.length;
    
    if (totalRegsEl) {
        const totalRegs = state.events.reduce((acc, current) => acc + current.attendees.length, 0);
        totalRegsEl.innerText = totalRegs;
    }

    if (!tbody) return;
    tbody.innerHTML = '';

    state.events.forEach(event => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${event.title}</strong></td>
            <td>${new Date(event.date).toLocaleDateString()}</td>
            <td>${event.location}</td>
            <td>${event.attendees.length} / ${event.maxCapacity}</td>
            <td><button class="btn btn-danger" style="padding:0.35rem 0.75rem; font-size:0.8rem;" onclick="deleteEvent('${event.id}')">Terminate Instance</button></td>
        `;
        tbody.appendChild(tr);
    });
}

/* ==========================================================================
   🔍 STABLE SEARCH ENTRY MATCHING ARCHITECTURE
   ========================================================================== */
function initSearch() {
    const bar = document.getElementById('search-bar');
    if (!bar) return;

    bar.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase();
        
        const filteredEvents = state.events.filter(event => 
            event.title.toLowerCase().includes(text) || 
            event.location.toLowerCase().includes(text)
        );
        
        renderExploreView(filteredEvents);
    });
}
