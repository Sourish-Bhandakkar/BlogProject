const API_BASE = 'http://localhost:4000/api';

const qs = sel => document.querySelector(sel);
const el = (tag, cls) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

// Views
const views = {
  home: qs('#home-view'),
  detail: qs('#detail-view'),
  manage: qs('#manage-view'),
  about: qs('#about')
}

const show = (v) => {
  Object.values(views).forEach(x => x.classList.add('hidden'));
  views[v].classList.remove('hidden');
}

// Elements
const postsList = qs('#posts-list');
const searchInput = qs('#search');
const newBtn = qs('#new-post');
const postForm = qs('#post-form');
const formTitle = qs('#form-title');

async function fetchPosts(q='') {
  try {
    const url = `${API_BASE}/posts${q ? `?q=${encodeURIComponent(q)}` : ''}`;
    const res = await fetch(url);
    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    postsList.innerHTML = '<div class="muted">Failed to load posts</div>';
  }
}

function renderPosts(posts) {
  postsList.innerHTML = '';
  if (!posts.length) {
    postsList.appendChild(el('div', 'muted')).textContent = 'No posts yet';
    return;
  }
  posts.forEach(p => {
    const li = el('li', 'post-card');
    const h = el('h3'); h.textContent = p.title;
    const meta = el('p'); meta.textContent = `${p.author} • ${new Date(p.date).toLocaleDateString()}`;
    const excerpt = el('p'); excerpt.textContent = p.content.slice(0,120) + (p.content.length > 120 ? '...' : '');
    const actions = el('div', 'manage-actions');
    const viewBtn = el('button','small'); viewBtn.textContent = 'View'; viewBtn.onclick = () => showDetail(p.id);
    const editBtn = el('button','small edit'); editBtn.textContent = 'Edit'; editBtn.onclick = () => openEdit(p);
    const delBtn = el('button','small del'); delBtn.textContent = 'Delete'; delBtn.onclick = () => deletePost(p.id);
    actions.append(viewBtn, editBtn, delBtn);
    li.append(h, meta, excerpt, actions);
    postsList.appendChild(li);
  });
}

async function showDetail(id){
  const res = await fetch(`${API_BASE}/posts/${id}`);
  const p = await res.json();
  views.detail.innerHTML = `
    <article>
      <h2>${p.title}</h2>
      <p><em>${p.author} • ${new Date(p.date).toLocaleString()}</em></p>
      <div>${p.content.replace(/\n/g,'<br/>')}</div>
      <div class="manage-actions" style="margin-top:12px">
        <button onclick="show('home')">Back</button>
        <button onclick="openEdit(${p.id})">Edit</button>
      </div>
    </article>`;
  show('detail');
}

function openEdit(post){
  show('manage');
  formTitle.textContent = post ? 'Edit Post' : 'New Post';
  qs('#post-id').value = post ? post.id : '';
  qs('#title').value = post ? post.title : '';
  qs('#author').value = post ? post.author : '';
  qs('#content').value = post ? post.content : '';
}

async function deletePost(id){
  if(!confirm('Delete this post?')) return;
  await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
  fetchPosts(searchInput.value.trim());
}

postForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const id = qs('#post-id').value;
  const payload = {
    title: qs('#title').value.trim(),
    author: qs('#author').value.trim(),
    content: qs('#content').value.trim(),
    date: new Date().toISOString()
  };
  if(id){
    await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
  } else {
    await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload) // only new post
    });
  }
  show('home');
  fetchPosts(searchInput.value.trim()); // refresh
});

qs('#cancel').addEventListener('click', ()=> show('home'));
newBtn.addEventListener('click', ()=> openEdit(null));
searchInput.addEventListener('input', ()=> fetchPosts(searchInput.value.trim()));

// Navigation
qs('#nav-home').addEventListener('click', (e)=>{ e.preventDefault(); show('home'); fetchPosts(); });
qs('#nav-about').addEventListener('click', (e)=>{ e.preventDefault(); show('about'); });
qs('#nav-manage').addEventListener('click', (e)=>{ e.preventDefault(); show('manage'); openEdit(null); });

// Initial load
fetchPosts();
