
// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
function setMenuOpen(open) {
if (!menuBtn || !mobileMenu) return;
menuBtn.setAttribute('aria-expanded', String(open));
mobileMenu.classList.toggle('open', open);
menuBtn.textContent = open ? '✕' : '☰';
}
if (menuBtn && mobileMenu) {
menuBtn.addEventListener('click', () => setMenuOpen(mobileMenu.classList.contains('open') ? false : true));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuOpen(false)));
}

// Custom cursor
const allowMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
if (allowMotion && finePointer) {
document.body.style.cursor = 'none';
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
if (cursor && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    function animateCursor() {
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
    }
    animateCursor();
}
}

// Project expand/collapse
const projectCards = Array.from(document.querySelectorAll('[data-project]'));
function closeAllProjects() {
projectCards.forEach(card => {
    card.classList.remove('open');
    const btn = card.querySelector('.project-btn');
    const expand = card.querySelector('.project-expand');
    const bars = card.querySelectorAll('.project-metric-bar');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (expand) expand.setAttribute('aria-hidden', 'true');
    bars.forEach(bar => { bar.style.width = '0%'; });
});
}
function toggleProject(card) {
const isOpen = card.classList.contains('open');
closeAllProjects();
if (!isOpen) {
    card.classList.add('open');
    const btn = card.querySelector('.project-btn');
    const expand = card.querySelector('.project-expand');
    const bars = card.querySelectorAll('.project-metric-bar');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (expand) expand.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
    bars.forEach(bar => {
        const level = bar.getAttribute('data-level') || '0';
        bar.style.width = `${level}%`;
    });
    });
}
}
projectCards.forEach(card => {
const btn = card.querySelector('.project-btn');
if (!btn) return;
btn.addEventListener('click', () => toggleProject(card));
btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleProject(card); }
    if (e.key === 'Escape') { e.preventDefault(); closeAllProjects(); }
});
});

// Nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => obs.observe(el));

// AI workflow timeline
const aiSteps = document.querySelectorAll('.ai-timeline-step');
const aiDetailTitle = document.getElementById('ai-timeline-detail-title');
const aiDetailBody = document.getElementById('ai-timeline-detail-body');
const aiDetailPills = document.getElementById('ai-timeline-detail-pills');
const aiStepContent = {
discover: {
    title: 'Discover & clarify',
    body: '<strong>Start with the problem, not the prompt.</strong> I write a short brief in natural language (goal, inputs, constraints, "done" criteria), then use AI to pressure-test edge cases and missing requirements before touching code.',
    pills: ['Clarify requirements', 'Surface edge cases', 'Align on success']
},
draft: {
    title: 'Draft with AI',
    body: '<strong>Use AI for acceleration, not authority.</strong> I lean on tools like Cursor and Claude to scaffold components, endpoints, or refactors, but I immediately reshape the output to match the codebase\'s patterns and naming.',
    pills: ['Scaffold components/APIs', 'Explore alternatives', 'Keep diffs small']
},
harden: {
    title: 'Harden & verify',
    body: '<strong>Trust comes from verification.</strong> I tighten types, add or update tests, and have AI help generate test cases I might miss. Then I run them locally and in CI to be sure behaviour matches intent.',
    pills: ['Type safety', 'Unit & integration tests', 'Performance & error paths']
},
ship: {
    title: 'Ship & document',
    body: '<strong>Ship with context.</strong> I use AI to draft PR descriptions, changelogs, or inline docs, then edit them so they accurately reflect decisions, trade-offs, and follow-ups for the team.',
    pills: ['Clear PR descriptions', 'Changelogs & docs', 'Capture follow-ups']
}
};
function setAiStep(stepKey) {
const data = aiStepContent[stepKey];
if (!data || !aiDetailTitle || !aiDetailBody || !aiDetailPills) return;
aiSteps.forEach(btn => {
    const selected = btn.getAttribute('data-step') === stepKey;
    btn.setAttribute('aria-selected', selected ? 'true' : 'false');
    btn.setAttribute('tabindex', selected ? '0' : '-1');
});
aiDetailTitle.textContent = data.title;
aiDetailBody.innerHTML = data.body;
aiDetailPills.innerHTML = '';
data.pills.forEach(text => {
    const pill = document.createElement('span');
    pill.className = 'ai-timeline-detail-pill';
    pill.textContent = text;
    aiDetailPills.appendChild(pill);
});
}
if (aiSteps.length) {
aiSteps.forEach(btn => {
    btn.addEventListener('click', () => setAiStep(btn.getAttribute('data-step')));
    btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAiStep(btn.getAttribute('data-step')); }
    });
});
}
