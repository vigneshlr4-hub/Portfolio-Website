/* app.js - frontend-only portfolio builder with templates + auth (localStorage) */

const DOM = {
  authPage: document.getElementById('authPage'),
  authTitle: document.getElementById('authTitle'),
  authName: document.getElementById('authName'),
  authEmail: document.getElementById('authEmail'),
  authPassword: document.getElementById('authPassword'),
  authSubmit: document.getElementById('authSubmit'),
  switchLink: document.getElementById('switchLink'),
  app: document.getElementById('app'),
  logoutBtn: document.getElementById('logoutBtn'),
  userInitial: document.getElementById('userInitial'),
  userEmailShort: document.getElementById('userEmailShort'),
  navBtns: document.querySelectorAll('.nav-btn'),
  sections: document.querySelectorAll('.panel'),
  fullPreviewContainer: document.getElementById('fullPreviewContainer'),
  miniPreview: document.getElementById('miniPreview'),
  templateThumbs: document.getElementById('templateThumbs'),
  openFullPreview: document.getElementById('openFullPreview'),
  exportBtn: document.getElementById('exportBtn'),

  // builder fields
  fullName: document.getElementById('fullName'),
  jobTitle: document.getElementById('jobTitle'),
  bio: document.getElementById('bio'),
  avatarInput: document.getElementById('avatarInput'),
  projectTitle: document.getElementById('projectTitle'),
  projectImg: document.getElementById('projectImg'),
  projectDesc: document.getElementById('projectDesc'),
  projectTech: document.getElementById('projectTech'),
  addProjectBtn: document.getElementById('addProjectBtn'),
  projectsList: document.getElementById('projectsList'),
  skillInput: document.getElementById('skillInput'),
  skillsList: document.getElementById('skillsList'),
  templateApplyBtns: document.querySelectorAll('.apply'),
  clearStorage: document.getElementById('clearStorage')
};

let state = {
  currentUserEmail: null,
  users: {}, // { email: {password, fullName, title, bio, avatar, projects:[], skills:[], template } }
  activeTemplate: 'modern'
};

const TEMPLATES = ['modern','creative','photo'];

/* ---------- AUTH ---------- */
let loginMode = false; // false => signup view, true => login view

function loadState(){
  const raw = localStorage.getItem('pb_v2_users');
  state.users = raw ? JSON.parse(raw) : {};
  const current = localStorage.getItem('pb_v2_current');
  if(current && state.users[current]) {
    state.currentUserEmail = current;
    showApp();
  } else {
    showAuth();
  }
}

function saveUsers(){
  localStorage.setItem('pb_v2_users', JSON.stringify(state.users));
}

/* toggle login/signup */
DOM.switchLink.addEventListener('click', ()=>{
  loginMode = !loginMode;
  DOM.authTitle.textContent = loginMode ? 'Login' : 'Sign Up';
  DOM.authSubmit.textContent = loginMode ? 'Login' : 'Create account';
  DOM.authName.style.display = loginMode ? 'none' : 'block';
});

/* handle auth submit */
DOM.authSubmit.addEventListener('click', ()=>{
  const name = DOM.authName.value.trim();
  const email = DOM.authEmail.value.trim().toLowerCase();
  const pwd = DOM.authPassword.value;
  if(!email || !pwd || (!loginMode && !name)) return alert('Please fill all fields');

  if(loginMode){
    if(!state.users[email]) return alert('No account found');
    if(state.users[email].password !== pwd) return alert('Wrong password');
    state.currentUserEmail = email;
    localStorage.setItem('pb_v2_current', email);
    showApp();
  } else {
    if(state.users[email]) return alert('Account exists, please login');
    state.users[email] = {
      password: pwd,
      fullName: name,
      title: '',
      bio: '',
      avatar: null,
      projects: [],
      skills: [],
      template: 'modern'
    };
    saveUsers();
    state.currentUserEmail = email;
    localStorage.setItem('pb_v2_current', email);
    showApp();
  }
});

/* show/hide */
function showAuth(){ DOM.authPage.hidden = false; DOM.app.hidden = true; }
function showApp(){ DOM.authPage.hidden = true; DOM.app.hidden = false; initAppForUser(); }

/* logout */
DOM.logoutBtn.addEventListener('click', ()=>{
  state.currentUserEmail = null;
  localStorage.removeItem('pb_v2_current');
  showAuth();
});

/* clear local data */
DOM.clearStorage && DOM.clearStorage.addEventListener('click', ()=>{
  if(!confirm('Clear all saved data (this will remove all accounts)?')) return;
  localStorage.removeItem('pb_v2_users'); localStorage.removeItem('pb_v2_current');
  state.users = {}; state.currentUserEmail = null;
  location.reload();
});

/* ---------- NAV ---------- */
DOM.navBtns.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    DOM.navBtns.forEach(b=>b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const target = e.currentTarget.dataset.target;
    // show/hide panels by id (builder, templates, preview, settings)
    document.querySelectorAll('main .panel').forEach(p => p.classList.remove('active-panel'));
    const section = document.getElementById(target);
    if(section) section.classList.add('active-panel');
    if(target === 'preview') renderFullPreview();
  });
});

/* ---------- TEMPLATE THUMBS & APPLY ---------- */
function createTemplateThumbs(){
  const container = DOM.templateThumbs;
  container.innerHTML = '';
  TEMPLATES.forEach(tpl=>{
    const el = document.createElement('div');
    el.className = `template-thumb ${tpl}`;
    el.title = tpl;
    el.dataset.tpl = tpl;
    el.addEventListener('click', ()=>{ applyTemplate(tpl); });
    container.appendChild(el);
  });
  // wire template "Use" buttons
  DOM.templateApplyBtns.forEach(b=>{
    b.addEventListener('click', ()=>{ applyTemplate(b.dataset.tpl) });
  });
}

function applyTemplate(tpl){
  state.activeTemplate = tpl;
  const user = getCurrentUser();
  if(user){
    user.template = tpl;
    state.users[state.currentUserEmail] = user;
    saveUsers();
  }
  renderMiniPreview();
  renderTemplateThumbsSelection();
}

/* helper highlight selection */
function renderTemplateThumbsSelection(){
  document.querySelectorAll('.template-thumb').forEach(n=>{
    n.classList.toggle('selected', n.dataset.tpl === state.activeTemplate);
  });
}

/* ---------- BUILDER: projects & skills ---------- */
function initBuilderFields(){
  const user = getCurrentUser();
  if(!user) return;
  DOM.fullName.value = user.fullName || '';
  DOM.jobTitle.value = user.title || '';
  DOM.bio.value = user.bio || '';
  DOM.userInitial.textContent = (user.fullName||user.email||'U')[0].toUpperCase();
  DOM.userEmailShort.textContent = state.currentUserEmail.split('@')[0];

  // avatar
  DOM.avatarInput.addEventListener('change', (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = evt => {
      user.avatar = evt.target.result;
      saveAndSyncUser(user);
      renderMiniPreview();
    };
    r.readAsDataURL(f);
  });

  // personal info live updates
  [DOM.fullName, DOM.jobTitle, DOM.bio].forEach(el=>{
    el.addEventListener('input', ()=>{ user.fullName = DOM.fullName.value; user.title = DOM.jobTitle.value; user.bio = DOM.bio.value; saveAndSyncUser(user); renderMiniPreview(); });
  });

  // add project
  DOM.addProjectBtn.addEventListener('click', async ()=>{
    const title = DOM.projectTitle.value.trim();
    const desc = DOM.projectDesc.value.trim();
    const tech = DOM.projectTech.value.trim().split(',').map(s=>s.trim()).filter(Boolean);
    if(!title || !desc) return alert('Add title and description');
    let imgData = null;
    const f = DOM.projectImg.files[0];
    if(f){
      imgData = await readFileAsDataURL(f);
    }
    user.projects.unshift({ title, description: desc, technologies: tech, image: imgData });
    saveAndSyncUser(user);
    DOM.projectTitle.value = DOM.projectDesc.value = DOM.projectTech.value = '';
    DOM.projectImg.value = '';
    renderProjects(user);
    renderMiniPreview();
  });

  // skills
  DOM.skillInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){ e.preventDefault(); const v = DOM.skillInput.value.trim(); if(!v) return; user.skills.push(v); DOM.skillInput.value=''; saveAndSyncUser(user); renderSkills(user); renderMiniPreview(); }
  });

  renderProjects(user); renderSkills(user);
}

/* projects / skills render */
function renderProjects(user){
  DOM.projectsList.innerHTML = '';
  if(!user.projects || user.projects.length===0) { DOM.projectsList.innerHTML = '<p class="muted">No projects yet</p>'; return; }
  user.projects.forEach((p, idx)=>{
    const item = document.createElement('div'); item.className='item';
    const left = document.createElement('div'); left.style.flex='1';
    left.innerHTML = `<strong>${escapeHtml(p.title)}</strong><div class="muted">${escapeHtml(p.description)}</div><div class="muted small">${(p.technologies||[]).join(', ')}</div>`;
    const controls = document.createElement('div');
    controls.innerHTML = `<button class="btn small" data-idx="${idx}" data-action="move">↑</button> <button class="btn small" data-idx="${idx}" data-action="delete">Delete</button>`;
    item.appendChild(left); item.appendChild(controls);
    DOM.projectsList.appendChild(item);
  });
  // control handlers
  DOM.projectsList.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      const action = btn.dataset.action; const idx = Number(btn.dataset.idx);
      const user = getCurrentUser();
      if(action==='delete'){ user.projects.splice(idx,1); saveAndSyncUser(user); renderProjects(user); renderMiniPreview(); }
      if(action==='move' && idx>0){ const arr=user.projects; const tmp=arr[idx-1]; arr[idx-1]=arr[idx]; arr[idx]=tmp; saveAndSyncUser(user); renderProjects(user); renderMiniPreview(); }
    });
  });
}

function renderSkills(user){
  DOM.skillsList.innerHTML = '';
  (user.skills || []).forEach((s, idx)=>{
    const chip = document.createElement('div'); chip.className='chip'; chip.innerHTML = `${escapeHtml(s)} <span style="cursor:pointer" data-idx="${idx}">&times;</span>`;
    DOM.skillsList.appendChild(chip);
  });
  DOM.skillsList.querySelectorAll('span').forEach(span=>{
    span.addEventListener('click',(e)=>{ const idx=Number(span.dataset.idx); const user=getCurrentUser(); user.skills.splice(idx,1); saveAndSyncUser(user); renderSkills(user); renderMiniPreview(); });
  });
}

/* ---------- MINI PREVIEW & FULL PREVIEW ---------- */
function renderMiniPreview(){
  const user = getCurrentUser();
  const tpl = (user && user.template) || state.activeTemplate;
  const html = generatePreviewHtml(user, tpl, {mini:true});
  DOM.miniPreview.innerHTML = html;
}

function renderFullPreviewToContainer(container){
  const user = getCurrentUser();
  const tpl = (user && user.template) || state.activeTemplate;
  const html = generatePreviewHtml(user, tpl, {mini:false});
  container.innerHTML = html;
}

function renderFullPreview(){
  renderFullPreviewToContainer(DOM.fullPreviewContainer);
}

/* open full preview in new tab */
DOM.openFullPreview.addEventListener('click', ()=>{
  const user = getCurrentUser();
  const tpl = (user && user.template) || state.activeTemplate;
  const html = generateStandaloneHtml(user, tpl);
  const w = window.open('','_blank');
  w.document.open(); w.document.write(html); w.document.close();
});

/* export HTML */
DOM.exportBtn.addEventListener('click', ()=>{
  const user = getCurrentUser();
  const tpl = (user && user.template) || state.activeTemplate;
  const html = generateStandaloneHtml(user, tpl);
  const blob = new Blob([html], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = `${(user && user.fullName?user.fullName.replace(/\s+/g,'_'):'portfolio')}.html`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

/* ---------- UTILITIES ---------- */
function getCurrentUser(){ return state.currentUserEmail ? state.users[state.currentUserEmail] : null; }
function saveAndSyncUser(user){ state.users[state.currentUserEmail] = user; saveUsers(); }
function readFileAsDataURL(file){ return new Promise(resolve => { const r = new FileReader(); r.onload = e => resolve(e.target.result); r.readAsDataURL(file); }); }
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* generate preview HTML snippet for mini & full */
function generatePreviewHtml(user, tpl, opts={mini:false}){
  const name = escapeHtml(user ? user.fullName : 'Your Name');
  const title = escapeHtml(user ? user.title : 'Your Title');
  const bio = escapeHtml(user ? user.bio : 'A short bio...');
  const projects = (user && user.projects) || [];
  const skills = (user && user.skills) || [];
  if(tpl==='modern'){
    return `
      <div style="${opts.mini? 'font-size:13px':''}">
        <div style="font-weight:800;color:${getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#2563eb'}">${name}</div>
        <div style="color:#666">${title}</div>
        <div style="margin-top:8px;color:#444">${bio}</div>
        <div style="margin-top:8px;"><strong>Skills:</strong> ${skills.slice(0,6).map(s=>escapeHtml(s)).join(', ')}</div>
        <div style="margin-top:8px;"><strong>Projects:</strong> ${projects.length}</div>
      </div>`;
  } else if(tpl==='creative'){
    return `
      <div style="${opts.mini? 'font-size:13px':''}">
        <div style="font-weight:700;color:${getComputedStyle(document.documentElement).getPropertyValue('--accent-2') || '#7c3aed'}">${name}</div>
        <div style="font-style:italic;color:#666">${title}</div>
        <div style="margin-top:8px;color:#444">${bio}</div>
      </div>`;
  } else {
    // photo
    return `
      <div style="${opts.mini? 'font-size:13px':''}">
        <div style="display:flex;gap:8px;align-items:center">
          <div style="width:48px;height:48px;border-radius:8px;background:#ddd;overflow:hidden">
            ${ user && user.avatar ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover">` : '' }
          </div>
          <div>
            <div style="font-weight:700">${name}</div>
            <div style="color:#666">${title}</div>
          </div>
        </div>
        <div style="margin-top:8px;color:#444">${bio}</div>
      </div>`;
  }
}

/* generate a standalone HTML (full page) to open/export */
function generateStandaloneHtml(user, tpl){
  const name = escapeHtml(user ? user.fullName : 'Your Name');
  const title = escapeHtml(user ? user.title : 'Your Title');
  const bio = escapeHtml(user ? user.bio : 'A short bio...');
  const projects = (user && user.projects) || [];
  const skills = (user && user.skills) || [];
  const accent = (tpl==='creative') ? '#7C3AED' : (tpl==='modern' ? '#2563EB' : '#111827');

  const projectHtml = projects.map(p => `
      <div style="margin-bottom:12px">
        ${ p.image ? `<img src="${p.image}" style="width:240px;height:140px;object-fit:cover;border-radius:8px;display:block;margin-bottom:8px">` : '' }
        <h3 style="margin:0">${escapeHtml(p.title)}</h3>
        <p style="margin:6px 0;color:#444">${escapeHtml(p.description)}</p>
        <div style="color:#666">${(p.technologies || []).join(', ')}</div>
      </div>`).join('');

  const skillsHtml = skills.map(s=>`<span style="display:inline-block;margin-right:8px;padding:6px 10px;border-radius:999px;border:1px solid #eee">${escapeHtml(s)}</span>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${name} — Portfolio</title>
    <style>
      body{font-family:Inter,Arial,Helvetica,sans-serif;margin:0;background:#fff;color:#111}
      .wrap{max-width:920px;margin:28px auto;padding:22px}
      .hero{display:flex;align-items:center;justify-content:space-between;gap:20px}
      .name{font-size:32px;font-weight:800;color:${accent}}
      .title{color:#374151;font-weight:700}
      .bio{color:#4b5563;margin-top:8px}
      .section{margin-top:20px;padding-top:10px;border-top:1px solid #eee}
    </style></head>
    <body>
      <div class="wrap">
        <div class="hero">
          <div>
            <div class="name">${name}</div>
            <div class="title">${title}</div>
            <div class="bio">${bio}</div>
          </div>
        </div>
        <div class="section"><h3>Projects</h3>${projectHtml || '<div style="color:#666">No projects yet</div>'}</div>
        <div class="section"><h3>Skills</h3><div>${skillsHtml || '<div style="color:#666">No skills added</div>'}</div></div>
      </div>
    </body></html>`;
}

/* ---------- INIT APP ---------- */
function initAppForUser(){
  // load users map
  state.users = JSON.parse(localStorage.getItem('pb_v2_users') || '{}');
  // ensure we have current user
  if(!state.currentUserEmail) state.currentUserEmail = localStorage.getItem('pb_v2_current');
  if(!state.currentUserEmail || !state.users[state.currentUserEmail]) {
    // fallback to first user (if any)
    const keys = Object.keys(state.users);
    if(keys.length>0){ state.currentUserEmail = keys[0]; localStorage.setItem('pb_v2_current', state.currentUserEmail); }
  }
  const user = getCurrentUser();
  if(user){
    // set user badge
    DOM.userInitial.textContent = (user.fullName || user.email || 'U')[0].toUpperCase();
    DOM.userEmailShort.textContent = state.currentUserEmail.split('@')[0];
    // set active template
    state.activeTemplate = user.template || 'modern';
  }

  createTemplateThumbs();
  renderTemplateThumbsSelection();
  initBuilderFields();
  renderMiniPreview();
  renderFullPreview();
}

/* ---------- helpers ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  loadState();
});

/* fallback keyboard save (Ctrl+S) */
window.addEventListener('keydown', (e)=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); alert('Saved.'); const user=getCurrentUser(); if(user) saveAndSyncUser(user); }
});
