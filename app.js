const defaultEvents = [
    { id: "1", title: "Global Developer Conference", date: "2026-08-15T09:00", location: "San Francisco Hall A", maxCapacity: 100, attendees: [] },
    { id: "2", title: "UI/UX Design Masterclass", date: "2026-09-02T14:00", location: "Virtual Broadcast Portal", maxCapacity: 50, attendees: [] }
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

document.addEventListener('DOMContentLoaded', () => {
    initRoleSelector();
    setupNavigation('participant');
    initForms();
    initSearch();
});

function initRoleSelector() {
    const selector = document.getElementById('role-select');
    selector.value = state.currentRole;
    selector.addEventListener('change', (e) => {
        state.currentRole = e.target.value;
        setupNavigation(state.currentRole);
    });
}

function setupNavigation(role) {
    const navContainer = document.getElementById('dynamic-nav');
    
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
    document.getElementById(targetId).classList.remove('hidden');
    renderViews();
}

function renderViews() {
    renderExploreView();
    renderTicketsView();
    renderOrganizerView();
    renderAdminView();
}

function renderExploreView() {
    const grid = document.getElementById('explore-grid');
    grid.innerHTML = '';

    state.events.forEach(event => {
        const booked = event.attendees.length;
        const percent = Math.min((booked / event.maxCapacity) * 100, 100);
        const isRegistered = state.myTickets.includes(event.id);
        const isFull = booked >= event.maxCapacity;

        let actionBtn = `<button class="btn btn-primary" onclick="registerEvent('${event.id}')">Request Registration</button>`;
        if (isRegistered) actionBtn = `<button class="btn btn-primary" disabled>Confirmed</button>`;
        else if (isFull) actionBtn = `<button class="btn btn-danger" disabled>Capacity Exhausted</button>`;

        const card = document.createElement('div');
        card.className = 'ui-card';
        card.innerHTML = `
            <div>
                <h3>${event.title}</h3>
                <div class="ui-card-meta">Timestamp: ${new Date(event.date).toLocaleString()}</div>
                <div class="ui-card-meta">Deployment Target: ${event.location}</div>
                <div class="capacity-tracker">
                    <div class="capacity-text">
                        <span>Utilization</span>
                        <span>${booked} / ${event.maxCapacity} Seats Allocated</span>
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
    grid.innerHTML = '';

    const bookedEvents = state.events.filter(e => state.myTickets.includes(e.id));
    
    if(bookedEvents.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); font-size: 0.9rem;">No entries found in active credential storage.</p>`;
        return;
    }

    bookedEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = 'ui-card';
        card.innerHTML = `
            <span class="ui-card-badge">Verified</span>
            <div>
                <h3>${event.title}</h3>
                <div class="ui-card-meta">Timestamp: ${new Date(event.date).toLocaleString()}</div>
                <div class="ui-card-meta">Deployment Target: ${event.location}</div>
                <p style="margin-top:1.5rem; font-size: 0.75rem; font-family: monospace; color: var(--text-muted)">TOKEN: NX-${event.id}-AUTH</p>
            </div>
            <button class="btn btn-danger" style="margin-top:1.5rem;" onclick="cancelTicket('${event.id}')">Revoke Registration</button>
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

function initForms() {
    const form = document.getElementById('create-event-form');
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
    container.innerHTML = '';

    if (state.events.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); font-size: 0.9rem;">No active configurations deployed.</p>`;
        return;
    }

    state.events.forEach(event => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div>
                <strong style="font-size: 0.9rem; font-weight: 500;">${event.title}</strong>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top: 0.15rem;">Allocated: ${event.attendees.length}</div>
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

function renderAdminView() {
    document.getElementById('admin-total-events').innerText = state.events.length;
    
    const totalRegs = state.events.reduce((acc, current) => acc + current.attendees.length, 0);
    document.getElementById('admin-total-registrations').innerText = totalRegs;

    const tbody = document.getElementById('admin-master-tbody');
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

function initSearch() {
    const bar = document.getElementById('search-bar');
    bar.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase();
        const cards = document.getElementById('explore-grid').getElementsByClassName('ui-card');
        
        state.events.forEach((event, idx) => {
            if(cards[idx]) {
                const matches = event.title.toLowerCase().includes(text) || event.location.toLowerCase().includes(text);
                cards[idx].style.display = matches ? 'flex' : 'none';
            }
        });
    });
}