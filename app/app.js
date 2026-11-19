// Leonida Legend — GTA VI trophy tracker.
// Loads app/data/trophies.json (relative path, offline), renders the checklist,
// roadmap and detail panel, saves progress in localStorage, exports/imports it,
// and honours deep-link params (?view, ?kind, ?grade, ?spoiler, ?trophy, ?checked).
const KEY = 'leonida-legend-progress-v1';
const rowsEl = document.getElementById('rows');
const detailEl = document.getElementById('detail');
const params = new URLSearchParams(location.search);

let trophies = [];
let earned = new Set();
let selectedId = null;
let view = 'checklist';

function loadStored() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) earned = new Set(JSON.parse(raw).filter((n) => typeof n === 'string'));
  } catch { earned = new Set(); }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function spoilerOn() {
  return document.getElementById('spoiler').checked;
}

function displayName(t) {
  if (spoilerOn() && t.kind === 'story' && !earned.has(t.name)) return 'Hidden story trophy — earn it to reveal';
  return t.name;
}

function displayDesc(t) {
  if (spoilerOn() && t.kind === 'story' && !earned.has(t.name)) return 'Hidden until earned (spoiler-safe mode is on).';
  return t.description;
}

function gradeBadge(grade) {
  return `<span class="badge ${grade}">${grade}</span>`;
}

function kindLabel(kind) {
  return kind === 'online' ? 'Online' : kind[0].toUpperCase() + kind.slice(1);
}

function filtered() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const kind = document.getElementById('kind').value;
  const grade = document.getElementById('grade').value;
  const hideEarned = document.getElementById('hideEarned').checked;
  let list = trophies;
  if (view === 'missable') list = list.filter((t) => t.missable);
  if (kind !== 'all') list = list.filter((t) => (kind === 'online' ? false : t.kind === kind));
  if (grade !== 'all') list = list.filter((t) => t.grade === grade);
  if (hideEarned) list = list.filter((t) => !earned.has(t.name));
  if (q) {
    list = list.filter((t) =>
      [t.name, t.description, t.guide, t.kind].join(' ').toLowerCase().includes(q));
  }
  return list;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('progressBig').textContent = `${done} / ${total}`;
  document.getElementById('progressFill').style.width = total ? `${(done / total) * 100}%` : '0%';
  document.getElementById('progressText').textContent =
    `${done} earned · ${total - done} to go · ${Math.round((done / total) * 100)}%`;
  const byGrade = (g) => trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
  const counts = (g) => trophies.filter((t) => t.grade === g).length;
  document.getElementById('gradeLine').textContent =
    `Platinum ${byGrade('platinum')}/${counts('platinum')} · Gold ${byGrade('gold')}/${counts('gold')} · Silver ${byGrade('silver')}/${counts('silver')} · Bronze ${byGrade('bronze')}/${counts('bronze')}`;
}

function renderRows() {
  const list = filtered();
  rowsEl.replaceChildren();
  for (const t of list) {
    const tr = document.createElement('tr');
    if (selectedId === t.id) tr.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      save();
      renderAll();
    });
    const tdBox = document.createElement('td');
    tdBox.append(box);
    const tdName = document.createElement('td');
    const nameStrong = document.createElement('strong');
    nameStrong.textContent = displayName(t);
    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.textContent = displayDesc(t);
    tdName.append(nameStrong, desc);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'missable-flag';
      flag.textContent = 'MISSABLE';
      tdName.append(flag);
    }
    const tdGrade = document.createElement('td');
    tdGrade.innerHTML = gradeBadge(t.grade);
    const tdKind = document.createElement('td');
    tdKind.textContent = kindLabel(t.kind);
    tr.append(tdBox, tdName, tdGrade, tdKind);
    tr.addEventListener('click', (e) => {
      if (e.target === box) return;
      selectedId = t.id;
      renderAll();
    });
    rowsEl.append(tr);
  }
  document.getElementById('emptyMsg').hidden = list.length > 0;
  document.getElementById('resultCount').textContent =
    `Showing ${list.length} of ${trophies.length} trophies` +
    (view === 'missable' ? ' — missables only' : '') +
    (spoilerOn() ? ' · spoiler-safe on: story names hidden until earned' : '');
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="detail-empty">Select a trophy to read its guide and sources.</p>';
    return;
  }
  detailEl.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = displayName(t);
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.innerHTML = `${gradeBadge(t.grade)} Kind: ${kindLabel(t.kind)}${t.missable ? ' · <span class="missable-flag">MISSABLE</span>' : ''} · Roadmap phase ${t.stage}`;
  const off = document.createElement('p');
  off.className = 'official';
  off.textContent = `Official description: “${displayDesc(t)}”`;
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  const srcTitle = document.createElement('h3');
  srcTitle.textContent = 'Sources';
  const srcList = document.createElement('ul');
  srcList.className = 'sources';
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.label;
    a.rel = 'noopener';
    li.append(a);
    srcList.append(li);
  }
  const earnedBtn = document.createElement('button');
  earnedBtn.type = 'button';
  earnedBtn.textContent = earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned';
  earnedBtn.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name); else earned.add(t.name);
    save();
    renderAll();
  });
  detailEl.append(h, meta, off, guide, srcTitle, srcList, earnedBtn);
}

const PHASES = [
  { n: 1, title: 'Story — play Chapters 1–4', text: 'Finish Gone Fishing, then Chapters 1–4 and the final mission (trophies 2–7), plus the named missions Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown and Operation Savage Glory (8–13). Along the way finish the stranger strands for Andy, Kenton, Billy, Randy and Tyrone (22–27) and all 8 stranger strands for Strangers & Freaks (25). None of these can be missed.' },
  { n: 2, title: 'Activities — while the story is fresh', text: 'Try all 9 activity types (Master of None, 16), then gold all 42 Shooting Range challenges (17), win Top Fun drone races at all 14 locations (18), win 20 different races (19), beat Cal at fishing (20), finish an arcade game (21), hunt Bret’s unique animal (29), and do the robbery and combat feats (33–41, 43, 45–47, 49–51). Do the 12 missables now, while partners, places and choices are in front of you.' },
  { n: 3, title: 'Collectibles — sweep Leonida', text: 'Meditate at all 18 spots (28), complete 3 card sets (30), explore all 52 areas (42), discover 100 vehicles (35), buy all 8 garages (54) and register 10 vehicles in the Scooter Bros app (55). A region-by-region sweep pairs well with the WAiNK grind below.' },
  { n: 4, title: 'The grind — 250 stunts and the money', text: 'Complete 250 stunts (15), 50 challenges (32), WAiNK It at 100 locations (31), launder $250,000 in Marked Bills (52) and spend $100,000 in shops (53). These build up across the whole game if you start them early — leave them for last only if you did not. A Long Road (100% completion, 14) pops here, once everything else is done.' },
  { n: 5, title: 'Platinum — Vice Got a Price!', text: 'Earn the other 54 trophies and the platinum (1) unlocks automatically. Check this app’s progress bar: when it reads 54 / 55, one trophy is left — find it in the checklist above.' },
];

function renderRoadmap() {
  const ol = document.getElementById('phases');
  ol.replaceChildren();
  for (const p of PHASES) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = `Phase ${p.n} — ${p.title}`;
    const para = document.createElement('p');
    para.textContent = p.text;
    const inPhase = trophies.filter((t) => t.stage === p.n);
    const done = inPhase.filter((t) => earned.has(t.name)).length;
    const count = document.createElement('p');
    count.className = 'phase-count';
    count.textContent = `${done} / ${inPhase.length} trophies in this phase earned` +
      (inPhase.some((t) => t.missable) ? ` · includes ${inPhase.filter((t) => t.missable).length} missable` : '');
    li.append(h, para, count);
    ol.append(li);
  }
}

function renderAll() {
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
  document.getElementById('listView').hidden = view === 'roadmap';
  document.querySelectorAll('.tabs button').forEach((b) =>
    b.classList.toggle('active', b.dataset.view === view));
  renderProgress();
  renderRows();
  renderDetail();
  if (view === 'roadmap') renderRoadmap();
}

function setView(v) {
  view = v;
  renderAll();
}

document.querySelectorAll('.tabs button').forEach((b) =>
  b.addEventListener('click', () => setView(b.dataset.view)));

for (const id of ['search', 'kind', 'grade', 'hideEarned', 'spoiler']) {
  document.getElementById(id).addEventListener('input', renderAll);
  document.getElementById(id).addEventListener('change', renderAll);
}

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ app: 'leonida-legend', version: 1, earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    earned = new Set(names.filter((n) => trophies.some((t) => t.name === n)));
    save();
    renderAll();
  } catch {
    alert('That file is not a Leonida Legend progress export.');
  }
  e.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    save();
    renderAll();
  }
});

// Deep links: ?view=roadmap|missable|checklist, ?kind=, ?grade=, ?spoiler=on, ?trophy=<id>, ?checked=<id,id…>
async function init() {
  const doc = await (await fetch('data/trophies.json')).json();
  trophies = doc.trophies;
  loadStored();
  if (params.get('view') === 'roadmap' || params.get('view') === 'missable') view = params.get('view');
  if (params.get('kind')) document.getElementById('kind').value = params.get('kind');
  if (params.get('grade')) document.getElementById('grade').value = params.get('grade');
  if (params.get('spoiler') === 'on') document.getElementById('spoiler').checked = true;
  if (params.get('trophy')) selectedId = Number(params.get('trophy'));
  if (params.get('checked')) {
    const ids = params.get('checked').split(',').map(Number);
    for (const t of trophies) if (ids.includes(t.id)) earned.add(t.name);
    save();
  }
  renderAll();
}

init();
