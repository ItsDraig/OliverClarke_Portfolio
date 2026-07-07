
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Types text into an element one character at a time. If the element is reused
// for a later call before finishing, the stale run detects the token mismatch
// and stops silently instead of racing with the newer one.
function typeText(el, text, speed, onDone) {
const token = Symbol();
el._typeToken = token;
if (reduceMotion) {
    el.textContent = text;
    if (onDone) onDone();
    return;
}
el.textContent = '';
let i = 0;
function step() {
    if (el._typeToken !== token) return;
    i++;
    el.textContent = text.slice(0, i);
    if (i < text.length) {
    setTimeout(step, speed);
    } else if (onDone) {
    onDone();
    }
}
step();
}

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

// Nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Nav command bar
const navForm = document.getElementById('navCmdForm');
const navInput = document.getElementById('navCmdInput');
const navOutput = document.getElementById('navCmdOutput');
const navCommandSections = { skills: '#skills', experience: '#experience', work: '#work', ai: '#ai', about: '#about', contact: '#contact' };
const navHelpText = 'available: help, skills, experience, work, ai, about, contact, resume, clear';

function runNavCommand(raw) {
const cmd = raw.trim().toLowerCase();
if (!cmd || !navOutput) return;
if (cmd === 'help') { navOutput.textContent = navHelpText; return; }
if (cmd === 'clear') { navOutput.textContent = ''; return; }
if (cmd === 'resume') {
    window.open('OliverClarke_Resume.pdf', '_blank', 'noopener');
    navOutput.textContent = 'opening resume.pdf…';
    return;
}
if (cmd === 'sudo hire-me' || cmd === 'sudo hire me') {
    navOutput.textContent = 'permission granted. redirecting to [contact] ✓';
    document.querySelector('#contact')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    return;
}
if (navCommandSections[cmd]) {
    document.querySelector(navCommandSections[cmd])?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    navOutput.textContent = `→ ${cmd}`;
    return;
}
navOutput.textContent = `command not found: ${raw} — try "help"`;
}
if (navForm && navInput) {
navForm.addEventListener('submit', (e) => {
    e.preventDefault();
    runNavCommand(navInput.value);
    navInput.value = '';
});
}

// Generic accordion (used by project cards)
function initAccordionGroup(items, { exclusive = false, onOpen } = {}) {
function setState(item, open) {
    item.classList.toggle('open', open);
    const btn = item.querySelector('button[aria-expanded]');
    const expand = item.querySelector('.project-expand');
    if (btn) btn.setAttribute('aria-expanded', String(open));
    if (expand) expand.setAttribute('aria-hidden', String(!open));
    if (open && onOpen) onOpen(item);
}
function toggle(item) {
    const isOpen = item.classList.contains('open');
    if (exclusive) items.forEach(i => { if (i !== item) setState(i, false); });
    setState(item, !isOpen);
}
items.forEach(item => {
    const btn = item.querySelector('button');
    if (!btn) return;
    btn.addEventListener('click', () => toggle(item));
    btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(item); }
    if (e.key === 'Escape') { e.preventDefault(); setState(item, false); }
    });
});
}

function animateAsciiBar(bar) {
const level = parseInt(bar.getAttribute('data-level') || '0', 10);
const slots = 12;
const filled = Math.round((level / 100) * slots);
if (reduceMotion) {
    bar.innerHTML = `<span class="ascii-fill">${'█'.repeat(filled)}</span><span class="ascii-empty">${'░'.repeat(slots - filled)}</span>`;
    return;
}
bar.innerHTML = `<span class="ascii-fill"></span><span class="ascii-empty">${'░'.repeat(slots)}</span>`;
const fillSpan = bar.querySelector('.ascii-fill');
const emptySpan = bar.querySelector('.ascii-empty');
let current = 0;
const id = setInterval(() => {
    current++;
    fillSpan.textContent = '█'.repeat(current);
    emptySpan.textContent = '░'.repeat(Math.max(slots - current, 0));
    if (current >= filled) clearInterval(id);
}, 40);
}

const projectCards = Array.from(document.querySelectorAll('[data-project]'));
initAccordionGroup(projectCards, {
exclusive: true,
onOpen: (item) => item.querySelectorAll('.ascii-bar').forEach(animateAsciiBar)
});

const experienceCards = Array.from(document.querySelectorAll('[data-experience]'));
initAccordionGroup(experienceCards, {
exclusive: true,
onOpen: (item) => item.querySelectorAll('.ascii-bar').forEach(animateAsciiBar)
});

// Skills: clicking a row types its command + description into the shared output panel below
const skillRows = Array.from(document.querySelectorAll('[data-skill-item]'));
const skillsOutput = document.getElementById('skillsOutput');

function selectSkill(row) {
if (!skillsOutput) return;
skillRows.forEach(r => {
    r.classList.toggle('active', r === row);
    r.querySelector('button')?.setAttribute('aria-pressed', String(r === row));
});

const cat = row.getAttribute('data-skill-cat') || 'skill';
const desc = row.querySelector('.skill-desc')?.textContent.trim() || '';

skillsOutput.innerHTML = `<p class="term-line"><span class="term-prompt">$</span> <span class="skills-output-loading"></span></p><p class="term-out skills-output-body"></p>`;
const loadingEl = skillsOutput.querySelector('.skills-output-loading');
const bodyEl = skillsOutput.querySelector('.skills-output-body');

typeText(loadingEl, `loading ${cat}...`, 26, () => {
    setTimeout(() => typeText(bodyEl, desc, 14), 150);
});
}

skillRows.forEach(row => {
const btn = row.querySelector('button');
if (!btn) return;
btn.addEventListener('click', () => selectSkill(row));
btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSkill(row); }
});
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal, .reveal-term');
const revealObs = new IntersectionObserver(entries => {
entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => revealObs.observe(el));

// Hero boot-sequence typewriter
if (!reduceMotion) {
const typeTargets = Array.from(document.querySelectorAll('[data-type] > .type-target'));
function playHeroSequence(index) {
    if (index >= typeTargets.length) return;
    const el = typeTargets[index];
    typeText(el, el.textContent, 28, () => setTimeout(() => playHeroSequence(index + 1), 250));
}
playHeroSequence(0);
}

// AI workflow timeline
const aiSteps = document.querySelectorAll('.ai-timeline-step');
const aiDetailTitle = document.getElementById('ai-timeline-detail-title');
const aiDetailBody = document.getElementById('ai-timeline-detail-body');
const aiDetailPills = document.getElementById('ai-timeline-detail-pills');
const aiStepContent = {
discover: {
    title: '$ discover & clarify',
    body: '<strong>Start with the problem, not the prompt.</strong> I write a short brief in natural language (goal, inputs, constraints, "done" criteria), then use AI to pressure-test edge cases and missing requirements before touching code.',
    pills: ['clarify requirements', 'surface edge cases', 'align on success']
},
draft: {
    title: '$ draft with ai',
    body: '<strong>Use AI for acceleration, not authority.</strong> I lean on tools like Cursor and Claude to scaffold components, endpoints, or refactors, but I immediately reshape the output to match the codebase\'s patterns and naming.',
    pills: ['scaffold components/apis', 'explore alternatives', 'keep diffs small']
},
harden: {
    title: '$ harden & verify',
    body: '<strong>Trust comes from verification.</strong> I tighten types, add or update tests, and have AI help generate test cases I might miss. Then I run them locally and in CI to be sure behaviour matches intent.',
    pills: ['type safety', 'unit & integration tests', 'performance & error paths']
},
ship: {
    title: '$ ship & document',
    body: '<strong>Ship with context.</strong> I use AI to draft PR descriptions, changelogs, or inline docs, then edit them so they accurately reflect decisions, trade-offs, and follow-ups for the team.',
    pills: ['clear pr descriptions', 'changelogs & docs', 'capture follow-ups']
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
