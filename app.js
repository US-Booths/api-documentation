/**
 * US Booths API Documentation — lógica de la página
 * Requiere: routes.js (API_ROUTES) cargado antes
 */

// Grupos para "Accesos rápidos": se inserta un ancla (h3) al encontrar la primera ruta que coincida.
// Orden importante: rutas más específicas primero (p. ej. work-order antes de order).
var quickLinkGroups = [
    { id: 'quick-dashboard', label: 'Dashboard', keywords: ['dashboard'] },
    { id: 'quick-admins', label: 'Admins / Usuarios', keywords: ['/admins', 'admin/admin'] },
    { id: 'quick-contacts', label: 'Clients / Contacts', keywords: ['/contacts', '/client'] },
    { id: 'quick-workstations', label: 'Workstations', keywords: ['workstation'] },
    { id: 'quick-roles', label: 'Roles', keywords: ['/roles', '/role'] },
    { id: 'quick-products', label: 'Products & Inventory', keywords: ['product', 'inventory'] },
    { id: 'quick-vendors', label: 'Vendors', keywords: ['vendor'] },
    { id: 'quick-work-orders', label: 'Work Orders', keywords: ['work-order'] },
    { id: 'quick-orders', label: 'Orders', keywords: ['/order'] },
    { id: 'quick-invoices', label: 'Invoices', keywords: ['invoice'] },
    { id: 'quick-quotes', label: 'Quotes & Proposals', keywords: ['quote', 'proposal'] },
    { id: 'quick-chat', label: 'Chat & Groups', keywords: ['/chat/', 'chat/groups'] },
    { id: 'quick-notifications', label: 'Notifications', keywords: ['notification'] },
    { id: 'quick-tasks', label: 'Tasks', keywords: ['/task'] },
    { id: 'quick-leads', label: 'Leads', keywords: ['lead'] },
    { id: 'quick-companies', label: 'Companies', keywords: ['compan'] }
];

function getQuickLinkGroup(path) {
    if (!path) return null;
    var lower = path.toLowerCase();
    for (var i = 0; i < quickLinkGroups.length; i++) {
        var g = quickLinkGroups[i];
        for (var k = 0; k < g.keywords.length; k++) {
            if (lower.indexOf(g.keywords[k]) !== -1) return g;
        }
    }
    return null;
}

// Renderizar rutas desde routes.js (API_ROUTES)
function renderRoutes() {
    if (typeof window.API_ROUTES === 'undefined' || !window.API_ROUTES.sections) return;
    const container = document.getElementById('routes-container');
    if (!container) return;

    const badgeLabels = { auth: 'Auth', public: 'Public', webhook: 'Webhook' };
    let totalEndpoints = 0;
    const counts = { admin: 0, client: 0, public: 0, webhooks: 0 };

    window.API_ROUTES.sections.forEach(function(section) {
        const sectionEl = document.createElement('section');
        sectionEl.className = 'section';
        sectionEl.id = section.id;

        const h2 = document.createElement('h2');
        h2.textContent = section.title;
        sectionEl.appendChild(h2);

        if (section.subtitle) {
            const sub = document.createElement('p');
            sub.className = 'description';
            sub.style.marginTop = '4px';
            sub.textContent = section.subtitle;
            sectionEl.appendChild(sub);
        }

        const count = section.routes.length;
        totalEndpoints += count;
        if (section.id === 'admin-auth' || section.id === 'admin-endpoints') counts.admin += count;
        else if (section.id === 'client-endpoints') counts.client = count;
        else if (section.id === 'public-endpoints') counts.public = count;
        else if (section.id === 'webhooks') counts.webhooks = count;

        const countDiv = document.createElement('div');
        countDiv.className = 'endpoint-count';
        countDiv.textContent = count + ' endpoint' + (count !== 1 ? 's' : '');
        sectionEl.appendChild(countDiv);

        var insertedQuickIds = {};
        var onlyInAdmin = (section.id === 'admin-endpoints');

        section.routes.forEach(function(r) {
            var path = r.path || '';
            if (onlyInAdmin) {
                var group = getQuickLinkGroup(path);
                if (group && !insertedQuickIds[group.id]) {
                    insertedQuickIds[group.id] = true;
                    var h3 = document.createElement('h3');
                    h3.id = group.id;
                    h3.className = 'quick-link-anchor';
                    h3.textContent = group.label;
                    sectionEl.appendChild(h3);
                }
            }

            const method = (r.method || 'GET').toLowerCase();
            const badge = (section.badge || 'auth').toLowerCase();
            const label = badgeLabels[badge] || 'Auth';
            const div = document.createElement('div');
            div.className = 'endpoint';
            div.innerHTML = '<div class="endpoint-header">' +
                '<span class="method ' + method + '">' + (r.method || 'GET') + '</span>' +
                '<span class="path">' + (r.path || '').replace(/</g, '&lt;') + '</span>' +
                '<span class="badge ' + badge + '">' + label + '</span>' +
                '</div>';
            sectionEl.appendChild(div);
        });

        container.appendChild(sectionEl);
    });

    var statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.textContent = totalEndpoints;
    var s = document.getElementById('stat-public');
    if (s) s.textContent = counts.public;
    s = document.getElementById('stat-client');
    if (s) s.textContent = counts.client;
    s = document.getElementById('stat-admin');
    if (s) s.textContent = counts.admin;
    s = document.getElementById('stat-webhooks');
    if (s) s.textContent = counts.webhooks;
}

renderRoutes();

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
});

// Search functionality
const searchBox = document.getElementById('searchBox');
const endpoints = document.querySelectorAll('.endpoint');

searchBox.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    endpoints.forEach((endpoint) => {
        const path = endpoint.querySelector('.path').textContent.toLowerCase();
        const method = endpoint.querySelector('.method').textContent.toLowerCase();
        const shouldShow = path.includes(query) || method.includes(query);
        endpoint.style.display = shouldShow ? 'block' : 'none';
    });
});

// Copy to clipboard for paths
document.querySelectorAll('.path').forEach((pathEl) => {
    pathEl.addEventListener('click', function(e) {
        e.preventDefault();
        const text = this.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalBg = this.style.backgroundColor;
            this.style.backgroundColor = 'rgba(52, 199, 89, 0.2)';
            setTimeout(() => {
                this.style.backgroundColor = originalBg;
            }, 200);
        });
    });
});

// Smooth scrolling for nav links
document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('open');
        }
    });
});

// Highlight nav links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
