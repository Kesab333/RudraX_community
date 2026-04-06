/**
 * SciNexus Community — Production JavaScript
 * Modular, vanilla JS — ready to swap in real API calls
 */

'use strict';

/* ══════════════════════════════════════════════════════════
   DATA LAYER  (swap fetchPosts/savePost/etc. with real API)
══════════════════════════════════════════════════════════ */

const CURRENT_USER = {
  id: 'current-user',
  initials: 'CU',
  name: 'Current User',
  role: 'user',
  gradient: 'linear-gradient(135deg,#38bdf8,#818cf8)',
  xp: 0,
};

const CATEGORY_META = {
  physics:     { label: 'Physics',     icon: '⚛', cls: 'cat-physics' },
  chemistry:   { label: 'Chemistry',   icon: '🧪', cls: 'cat-chemistry' },
  mathematics: { label: 'Mathematics', icon: '∑', cls: 'cat-mathematics' },
  general:     { label: 'General',     icon: '◉', cls: 'cat-general' },
  research:    { label: 'Research',    icon: '🔬', cls: 'cat-research' },
  simulations: { label: 'Simulations', icon: '⚡', cls: 'cat-simulations' },
};

const POST_TYPE_LABEL = {
  discussion:   'Discussion',
  question:     'Question',
  project:      'Project',
  announcement: 'Announcement',
};

let posts = [
  {
    id: 'p001',
    authorId: 'user_002',
    authorInitials: 'SP',
    authorName: 'Dr. Sunita Park',
    authorRole: 'researcher',
    authorGradient: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
    timestamp: Date.now() - 1000 * 60 * 8,
    category: 'physics',
    type: 'discussion',
    title: 'Quantum entanglement fidelity in PhysicX v3.2 — benchmarks',
    content: 'With the new GPU acceleration pipeline, I\'ve been running entanglement fidelity tests across 128-qubit systems. The speedup is remarkable — roughly <code>4.7×</code> over CPU-only. Anyone else seeing anomalies in the decoherence curve past t=120μs?',
    tags: ['quantum-entanglement', 'gpu-acceleration', 'benchmark'],
    likes: 47,
    comments: 12,
    liked: false,
    bookmarked: false,
    owner: false,
  },
  {
    id: 'p002',
    authorId: 'user_003',
    authorInitials: 'MR',
    authorName: 'M. Rousseau',
    authorRole: 'developer',
    authorGradient: 'linear-gradient(135deg,#94a3b8,#64748b)',
    timestamp: Date.now() - 1000 * 60 * 31,
    category: 'chemistry',
    type: 'question',
    title: 'ChemistrY: force field divergence in long-run MD simulations',
    content: 'Running AMBER99SB-ILDN over 500ns trajectories in ChemistrY and getting energy drift around the 300ns mark. Reproducible on two different systems. Anyone resolved this before the upcoming patch?',
    tags: ['molecular-dynamics', 'force-field', 'amber'],
    likes: 29,
    comments: 8,
    liked: false,
    bookmarked: false,
    owner: false,
  },
  {
    id: 'p003',
    authorId: 'user_004',
    authorInitials: 'KN',
    authorName: 'K. Nakamura',
    authorRole: 'contributor',
    authorGradient: 'linear-gradient(135deg,#fb923c,#ea580c)',
    timestamp: Date.now() - 1000 * 60 * 75,
    category: 'mathematics',
    type: 'project',
    title: 'Neural ODE solver for stiff systems — open source release',
    content: 'I\'ve published a neural ODE integrator for stiff differential equations built on top of MathematicX\'s tensor core. Handles Jacobian-heavy systems with adaptive step control. The repo is MIT licensed. Feedback welcome!',
    tags: ['neural-ode', 'differential-equations', 'open-source'],
    likes: 83,
    comments: 21,
    liked: true,
    bookmarked: true,
    owner: false,
  },
  {
    id: 'p004',
    authorId: 'user_005',
    authorInitials: 'EA',
    authorName: 'E. Andres',
    authorRole: 'student',
    authorGradient: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
    timestamp: Date.now() - 1000 * 60 * 180,
    category: 'simulations',
    type: 'discussion',
    title: 'Visualizing turbulent flow around irregular geometries in PhysicX',
    content: 'Working on CFD simulations for flow around non-convex geometries using the LES turbulence model. Getting beautiful vortex shedding patterns but the pressure fields are oscillating unexpectedly in the wake region. Tips on stabilizing the solver?',
    tags: ['cfd', 'turbulence', 'les', 'fluid-dynamics'],
    likes: 18,
    comments: 5,
    liked: false,
    bookmarked: false,
    owner: false,
  },
  {
    id: 'p005',
    authorId: 'user_006',
    authorInitials: 'LW',
    authorName: 'L. Wei',
    authorRole: 'admin',
    authorGradient: 'linear-gradient(135deg,#34d399,#059669)',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    category: 'research',
    type: 'announcement',
    title: 'MathematicX v2.1 — Symbolic differentiation engine rewrite',
    content: 'We\'ve completely rewritten the symbolic differentiation engine using a DAG-based intermediate representation. Parse times down 62%, memory footprint reduced by 40%. The new <code>diff.auto()</code> API supports mixed partial derivatives up to order 8.',
    tags: ['mathematic-x', 'symbolic-diff', 'release'],
    likes: 121,
    comments: 34,
    liked: false,
    bookmarked: false,
    owner: false,
  },
];

posts = [];

/* ══════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════ */

const state = {
  currentCategory: 'all',
  currentFilter: 'all',
  currentSort: 'newest',
  searchQuery: '',
  sidebarOpen: true,
  theme: 'dark',
};

/* ══════════════════════════════════════════════════════════
   DOM REFS
══════════════════════════════════════════════════════════ */

const DOM = {
  feed:           () => document.getElementById('postsFeed'),
  emptyState:     () => document.getElementById('emptyState'),
  postInput:      () => document.getElementById('postInput'),
  cpFooter:       () => document.getElementById('cpFooter'),
  cpCancelBtn:    () => document.getElementById('cpCancelBtn'),
  cpSubmitBtn:    () => document.getElementById('cpSubmitBtn'),
  postCategory:   () => document.getElementById('postCategory'),
  postType:       () => document.getElementById('postType'),
  postTagsInput:  () => document.getElementById('postTagsInput'),
  postSearch:     () => document.getElementById('postSearch'),
  globalSearch:   () => document.getElementById('globalSearch'),
  sidebarLeft:    () => document.getElementById('sidebarLeft'),
  sidebarOverlay: () => document.getElementById('sidebarOverlay'),
  sidebarToggle:  () => document.getElementById('sidebarToggleBtn'),
  themeToggle:    () => document.getElementById('themeToggleBtn'),
  pinnedBanner:   () => document.getElementById('pinnedBanner'),
  pinnedDismiss:  () => document.getElementById('pinnedDismiss'),
  toastContainer: () => document.getElementById('toastContainer'),
  sortBtns:       () => document.querySelectorAll('.sort-btn'),
  filterChips:    () => document.querySelectorAll('.filter-chip'),
  categoryItems:  () => document.querySelectorAll('.category-item'),
  navItems:       () => document.querySelectorAll('.nav-item[data-section]'),
  productPills:   () => document.querySelectorAll('.product-pill'),
  statVals:       () => document.querySelectorAll('.stat-val[data-target]'),
  moonIcon:       () => document.querySelector('.icon-moon'),
  sunIcon:        () => document.querySelector('.icon-sun'),
};

/* ══════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════ */

function escapeHtml(str) {
  const map = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":"&#039;" };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function generateId() {
  return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */

function showToast(message, type = 'info', duration = 3000) {
  const container = DOM.toastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<div class="toast-dot"></div><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* ══════════════════════════════════════════════════════════
   RENDER — POST CARD
══════════════════════════════════════════════════════════ */

function buildPostCard(post) {
  const catMeta = CATEGORY_META[post.category] || { label: post.category, icon: '◉', cls: 'cat-general' };
  const tags = post.tags.map(t =>
    `<button class="post-tag" data-tag="${escapeHtml(t)}" aria-label="Filter by #${escapeHtml(t)}">#${escapeHtml(t)}</button>`
  ).join('');

  const isOwner = post.authorId === CURRENT_USER.id;

  const card = document.createElement('article');
  card.className = 'post-card reveal';
  card.dataset.id = post.id;
  card.dataset.category = post.category;
  card.dataset.type = post.type;

  card.innerHTML = `
    <div class="post-header">
      <div class="post-author">
        <div class="post-avatar" style="background:${escapeHtml(post.authorGradient)}" aria-hidden="true">${escapeHtml(post.authorInitials)}</div>
        <div class="post-meta">
          <span class="post-author-name">${escapeHtml(post.authorName)}</span>
          <div class="post-author-sub">
            <span class="role-badge role-${escapeHtml(post.authorRole)}">${escapeHtml(post.authorRole)}</span>
            <span aria-label="Posted ${timeAgo(post.timestamp)}">${timeAgo(post.timestamp)}</span>
          </div>
        </div>
      </div>
      <span class="category-badge ${catMeta.cls}" aria-label="Category: ${catMeta.label}">${catMeta.icon} ${catMeta.label}</span>
    </div>

    <div class="post-body">
      <h2 class="post-title" tabindex="0">${escapeHtml(post.title)}</h2>
      <p class="post-text">${formatContent(post.content)}</p>
      ${tags ? `<div class="post-tags" role="list" aria-label="Tags">${tags}</div>` : ''}
    </div>

    <div class="post-footer">
      <div class="post-actions" role="group" aria-label="Post actions">
        <button class="action-btn like-btn ${post.liked ? 'liked' : ''}" data-action="like" data-id="${post.id}" aria-pressed="${post.liked}" aria-label="${post.liked ? 'Unlike' : 'Like'} post">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>${post.likes}</span>
        </button>
        <button class="action-btn comment-btn" data-action="comment" data-id="${post.id}" aria-label="Comment on post">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>${post.comments}</span>
        </button>
        <button class="action-btn share-btn" data-action="share" data-id="${post.id}" aria-label="Share post">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <span>Share</span>
        </button>
        <button class="action-btn bookmark-btn ${post.bookmarked ? 'bookmarked' : ''}" data-action="bookmark" data-id="${post.id}" aria-pressed="${post.bookmarked}" aria-label="${post.bookmarked ? 'Remove bookmark' : 'Bookmark'} post">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${post.bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          <span>Save</span>
        </button>
        ${isOwner ? `
        <button class="action-btn delete-btn" data-action="delete" data-id="${post.id}" aria-label="Delete post">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          <span>Delete</span>
        </button>` : ''}
      </div>
      <span class="category-badge cat-general" style="font-size:10px;padding:2px 7px;opacity:.7" aria-label="Post type">${escapeHtml(POST_TYPE_LABEL[post.type] || post.type)}</span>
    </div>
  `;

  return card;
}

function formatContent(text) {
  // Minimal safe formatter: escape then restore <code> tags from source
  return escapeHtml(text).replace(/&lt;code&gt;(.*?)&lt;\/code&gt;/g, '<code>$1</code>');
}

/* ══════════════════════════════════════════════════════════
   RENDER — FEED
══════════════════════════════════════════════════════════ */

function getFilteredSortedPosts() {
  let result = [...posts];

  // Category filter
  if (state.currentCategory !== 'all') {
    result = result.filter(p => p.category === state.currentCategory);
  }

  // Type filter
  if (state.currentFilter !== 'all') {
    result = result.filter(p => p.type === state.currentFilter);
  }

  // Search
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort
  switch (state.currentSort) {
    case 'popular':   result.sort((a, b) => b.likes - a.likes); break;
    case 'commented': result.sort((a, b) => b.comments - a.comments); break;
    case 'trending':  result.sort((a, b) => (b.likes + b.comments * 2) - (a.likes + a.comments * 2)); break;
    default:          result.sort((a, b) => b.timestamp - a.timestamp); break;
  }

  return result;
}

function renderFeed() {
  const feed = DOM.feed();
  const empty = DOM.emptyState();
  const filtered = getFilteredSortedPosts();

  // Animate out old cards
  feed.innerHTML = '';

  if (filtered.length === 0) {
    feed.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }

  feed.style.display = 'flex';
  empty.style.display = 'none';

  filtered.forEach((post, idx) => {
    const card = buildPostCard(post);
    card.style.animationDelay = `${idx * 60}ms`;
    feed.appendChild(card);
  });

  // Intersection observer for reveal
  observeReveal();
}

/* ══════════════════════════════════════════════════════════
   INTERSECTION OBSERVER
══════════════════════════════════════════════════════════ */

function observeReveal() {
  if (!window.IntersectionObserver) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════════════════
   POST ACTIONS
══════════════════════════════════════════════════════════ */

function toggleLike(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;

  // Update DOM in place
  const card = document.querySelector(`[data-id="${postId}"]`);
  if (!card) return;
  const btn = card.querySelector('.like-btn');
  if (!btn) return;
  btn.classList.toggle('liked', post.liked);
  btn.setAttribute('aria-pressed', post.liked);
  btn.setAttribute('aria-label', (post.liked ? 'Unlike' : 'Like') + ' post');
  btn.querySelector('svg').setAttribute('fill', post.liked ? 'currentColor' : 'none');
  btn.querySelector('span').textContent = post.likes;

  // Micro animation
  btn.animate([
    { transform: 'scale(1.3)' },
    { transform: 'scale(1)' }
  ], { duration: 220, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });

  showToast(post.liked ? 'Post liked!' : 'Like removed', 'info', 1800);
}

function toggleBookmark(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.bookmarked = !post.bookmarked;

  const card = document.querySelector(`[data-id="${postId}"]`);
  if (!card) return;
  const btn = card.querySelector('.bookmark-btn');
  if (!btn) return;
  btn.classList.toggle('bookmarked', post.bookmarked);
  btn.setAttribute('aria-pressed', post.bookmarked);
  btn.setAttribute('aria-label', (post.bookmarked ? 'Remove bookmark' : 'Bookmark') + ' post');
  btn.querySelector('svg').setAttribute('fill', post.bookmarked ? 'currentColor' : 'none');

  btn.animate([
    { transform: 'scale(1.25) rotate(-6deg)' },
    { transform: 'scale(1) rotate(0)' }
  ], { duration: 250, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });

  showToast(post.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks', post.bookmarked ? 'success' : 'info', 2000);
}

function deletePost(postId) {
  const idx = posts.findIndex(p => p.id === postId);
  if (idx === -1) return;

  const card = document.querySelector(`[data-id="${postId}"]`);
  if (card) {
    card.style.transition = 'opacity 0.25s ease, transform 0.25s ease, max-height 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.97)';
    card.style.pointerEvents = 'none';
    setTimeout(() => {
      posts.splice(idx, 1);
      renderFeed();
      showToast('Post deleted', 'error', 2200);
    }, 280);
  }
}

function sharePost(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  // In production: use Web Share API or copy link
  if (navigator.clipboard) {
    navigator.clipboard.writeText(`${window.location.href}#${postId}`).then(() => {
      showToast('Link copied to clipboard!', 'success');
    });
  } else {
    showToast(`Link: ${window.location.href}#${postId}`, 'info', 3500);
  }
}

/* ══════════════════════════════════════════════════════════
   CREATE POST
══════════════════════════════════════════════════════════ */

function createPost() {
  const input    = DOM.postInput();
  const category = DOM.postCategory();
  const type     = DOM.postType();
  const tagsEl   = DOM.postTagsInput();

  const content = input.value.trim();
  if (!content) {
    input.focus();
    showToast('Please write something first', 'error', 2000);
    return;
  }

  const rawTags = tagsEl.value.split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);

  // Auto-generate a title from first line
  const firstLine = content.split('\n')[0].slice(0, 80);
  const title = firstLine.length === content.split('\n')[0].length ? firstLine : firstLine + '…';

  const newPost = {
    id: generateId(),
    authorId: CURRENT_USER.id,
    authorInitials: CURRENT_USER.initials,
    authorName: CURRENT_USER.name,
    authorRole: CURRENT_USER.role,
    authorGradient: CURRENT_USER.gradient,
    timestamp: Date.now(),
    category: category.value,
    type: type.value,
    title,
    content: content.length > 280 ? content.slice(0, 280) + '…' : content,
    tags: rawTags.slice(0, 5),
    likes: 0,
    comments: 0,
    liked: false,
    bookmarked: false,
    owner: true,
  };

  posts.unshift(newPost);

  // Reset form
  input.value = '';
  tagsEl.value = '';
  collapsePostForm();
  autoResizeTextarea(input);

  // Re-sort to newest if not already
  if (state.currentSort !== 'newest') {
    state.currentSort = 'newest';
    DOM.sortBtns().forEach(b => {
      b.classList.toggle('active', b.dataset.sort === 'newest');
      b.setAttribute('aria-pressed', b.dataset.sort === 'newest');
    });
  }

  renderFeed();
  showToast('Post published!', 'success');

  // Scroll to top of feed
  const feed = DOM.feed();
  if (feed) feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ══════════════════════════════════════════════════════════
   SEARCH
══════════════════════════════════════════════════════════ */

let searchDebounceTimer = null;

function searchPosts(query) {
  state.searchQuery = query;
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(renderFeed, 200);
}

/* ══════════════════════════════════════════════════════════
   FILTER & SORT
══════════════════════════════════════════════════════════ */

function filterPosts(category) {
  state.currentCategory = category;
  DOM.categoryItems().forEach(btn => {
    const active = btn.dataset.category === category;
    btn.classList.toggle('active-cat', active);
    btn.setAttribute('aria-pressed', active);
  });
  renderFeed();
}

function setTypeFilter(filter) {
  state.currentFilter = filter;
  DOM.filterChips().forEach(chip => {
    const active = chip.dataset.filter === filter;
    chip.classList.toggle('active', active);
  });
  renderFeed();
}

function sortPosts(sort) {
  state.currentSort = sort;
  DOM.sortBtns().forEach(btn => {
    const active = btn.dataset.sort === sort;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });
  renderFeed();
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════ */

function toggleSidebar() {
  const sidebar  = DOM.sidebarLeft();
  const overlay  = DOM.sidebarOverlay();
  const toggle   = DOM.sidebarToggle();
  const isMobile = window.innerWidth <= 768;

  state.sidebarOpen = !state.sidebarOpen;

  if (isMobile) {
    sidebar.classList.toggle('mobile-open', state.sidebarOpen);
    overlay.classList.toggle('visible', state.sidebarOpen);
  } else {
    sidebar.classList.toggle('collapsed', !state.sidebarOpen);
  }

  toggle.setAttribute('aria-expanded', state.sidebarOpen);
  toggle.parentElement?.classList.toggle('sidebar-collapsed', !state.sidebarOpen);
  // Animate hamburger lines
  const lines = toggle.querySelectorAll('.hamburger-line');
  if (!state.sidebarOpen) {
    lines[0].style.transform = 'translateY(6px) rotate(45deg)';
    lines[1].style.opacity = '0';
    lines[2].style.transform = 'translateY(-6px) rotate(-45deg)';
  } else {
    lines[0].style.transform = '';
    lines[1].style.opacity = '';
    lines[2].style.transform = '';
  }
}

/* ══════════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════════ */

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  const moon = DOM.moonIcon();
  const sun  = DOM.sunIcon();
  if (moon && sun) {
    moon.style.display = state.theme === 'dark' ? 'block' : 'none';
    sun.style.display  = state.theme === 'light' ? 'block' : 'none';
  }
  localStorage.setItem('rudrax-theme', state.theme);
  showToast(`${state.theme === 'dark' ? 'Dark' : 'Light'} mode`, 'info', 1600);
}

/* ══════════════════════════════════════════════════════════
   ANIMATED STAT COUNTERS
══════════════════════════════════════════════════════════ */

function animateCounter(el, target, duration = 1400) {
  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(ease(progress) * target);
    el.textContent = value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target >= 1000 ? (target / 1000).toFixed(1) + 'k' : target;
  }
  requestAnimationFrame(frame);
}

function initCounters() {
  if (!window.IntersectionObserver) {
    DOM.statVals().forEach(el => {
      animateCounter(el, +el.dataset.target);
    });
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target, +entry.target.dataset.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  DOM.statVals().forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════════════════
   CREATE POST FORM HELPERS
══════════════════════════════════════════════════════════ */

function expandPostForm() {
  const footer = DOM.cpFooter();
  if (footer) footer.style.display = 'flex';
}

function collapsePostForm() {
  const footer = DOM.cpFooter();
  if (footer) footer.style.display = 'none';
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 180) + 'px';
}

function replaceStaticPlaceholders() {
  const pinnedText = document.querySelector('.pinned-text');
  if (pinnedText) {
    pinnedText.textContent = 'Pinned announcements will appear here when the announcements feed is wired.';
  }

  const pinnedDismiss = DOM.pinnedDismiss();
  if (pinnedDismiss) {
    pinnedDismiss.textContent = 'x';
  }

  const trendingList = document.querySelector('.trending-list');
  if (trendingList) {
    trendingList.innerHTML = `
      <li style="list-style:none;color:var(--text-muted,#94a3b8);font-size:13px;">
        No trending topics yet. Wire the feed and search analytics to populate this panel.
      </li>
    `;
  }

  const contributorsList = document.querySelector('.contributors-list');
  if (contributorsList) {
    contributorsList.innerHTML = `
      <li style="list-style:none;color:var(--text-muted,#94a3b8);font-size:13px;">
        No leaderboard data yet. Wire XP aggregation and the leaderboard API.
      </li>
    `;
  }

  const activityList = document.querySelector('.activity-list');
  if (activityList) {
    activityList.innerHTML = `
      <li style="list-style:none;color:var(--text-muted,#94a3b8);font-size:13px;">
        No recent activity yet. Wire notifications and real-time events to populate this stream.
      </li>
    `;
  }
}

/* ══════════════════════════════════════════════════════════
   EVENT DELEGATION — FEED
══════════════════════════════════════════════════════════ */

function onFeedClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) {
    // Tag click
    const tag = e.target.closest('.post-tag');
    if (tag) {
      state.searchQuery = tag.dataset.tag || '';
      const input = DOM.postSearch();
      if (input) input.value = state.searchQuery;
      renderFeed();
      showToast(`Filtering by #${tag.dataset.tag}`, 'info', 1800);
    }
    return;
  }

  const { action, id } = btn.dataset;
  switch (action) {
    case 'like':     toggleLike(id);     break;
    case 'bookmark': toggleBookmark(id); break;
    case 'share':    sharePost(id);      break;
    case 'delete':   deletePost(id);     break;
    case 'comment':  showToast('Comments are not wired yet.', 'info', 2000); break;
  }
}

/* ══════════════════════════════════════════════════════════
   NAV — SECTION SWITCHING
══════════════════════════════════════════════════════════ */

function switchSection(section) {
  DOM.navItems().forEach(item => {
    const active = item.dataset.section === section;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });

  // In production, load different sections. For now just update title.
  const titleMap = {
    home: ['Community Hub', 'Connect, collaborate, and compute with the global scientific community.'],
    discussions: ['Discussions', 'Browse and join ongoing scientific discussions.'],
    questions: ['Questions', 'Ask questions, find answers from the community.'],
    announcements: ['Announcements', 'Announcements appear here when the announcements feed is wired.'],
    projects: ['Projects', 'Explore community-driven research projects.'],
    leaderboard: ['Leaderboard', 'Top contributors across all disciplines.'],
    bookmarks: ['Bookmarks', 'Your saved posts and discussions.'],
    settings: ['Settings', 'Manage your community profile and preferences.'],
  };
  const [title, subtitle] = titleMap[section] || ['Community Hub', ''];
  const titleEl = document.querySelector('.content-title');
  const subtitleEl = document.querySelector('.content-subtitle');
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;

  if (section === 'bookmarks') {
    state.currentCategory = 'all';
    renderBookmarks();
  } else if (section !== 'home' && section !== 'discussions') {
    showToast(`${titleMap[section]?.[0] || section} is not wired yet.`, 'info', 2200);
    return;
    showToast(`${titleMap[section]?.[0] || section} — coming soon!`, 'info', 2200);
  }
}

function renderBookmarks() {
  const saved = posts.filter(p => p.bookmarked);
  const backup = [...posts];
  if (saved.length === 0) {
    showToast('No bookmarks yet!', 'info', 2200);
    return;
  }
  // Temporarily show only bookmarked
  posts = saved;
  renderFeed();
  posts = backup;
}

/* ══════════════════════════════════════════════════════════
   PRODUCT PILL FILTER
══════════════════════════════════════════════════════════ */

function onProductPillClick(e) {
  const pill = e.target.closest('.product-pill');
  if (!pill) return;
  DOM.productPills().forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  const productCatMap = { physics: 'physics', chemistry: 'chemistry', math: 'mathematics' };
  const cat = productCatMap[pill.dataset.product];
  if (cat) filterPosts(cat);
}

/* ══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════════════════════════════ */

function onKeyDown(e) {
  // ⌘K / Ctrl+K — focus search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const gs = DOM.globalSearch();
    if (gs) gs.focus();
    return;
  }
  // Escape — close sidebar on mobile
  if (e.key === 'Escape' && state.sidebarOpen && window.innerWidth <= 768) {
    toggleSidebar();
  }
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */

function init() {
  // Restore theme
  const savedTheme = localStorage.getItem('rudrax-theme');
  if (savedTheme && savedTheme !== state.theme) {
    state.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', state.theme);
    const moon = DOM.moonIcon();
    const sun  = DOM.sunIcon();
    if (moon && sun) {
      moon.style.display = state.theme === 'dark' ? 'block' : 'none';
      sun.style.display  = state.theme === 'light' ? 'block' : 'none';
    }
  }

  // Render feed
  renderFeed();
  replaceStaticPlaceholders();

  // Start counters
  initCounters();

  // Post input — auto-expand
  const postInput = DOM.postInput();
  if (postInput) {
    postInput.addEventListener('focus', expandPostForm);
    postInput.addEventListener('input', () => autoResizeTextarea(postInput));
  }

  // Cancel button
  DOM.cpCancelBtn()?.addEventListener('click', () => {
    collapsePostForm();
    const input = DOM.postInput();
    if (input) { input.value = ''; autoResizeTextarea(input); }
  });

  // Submit button
  DOM.cpSubmitBtn()?.addEventListener('click', createPost);

  // Post input — submit on Ctrl+Enter
  postInput?.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') createPost();
  });

  // Feed delegation
  DOM.feed()?.addEventListener('click', onFeedClick);

  // Search
  DOM.postSearch()?.addEventListener('input', e => searchPosts(e.target.value));
  DOM.globalSearch()?.addEventListener('input', e => searchPosts(e.target.value));

  // Sort
  DOM.sortBtns().forEach(btn => {
    btn.addEventListener('click', () => sortPosts(btn.dataset.sort));
  });

  // Filter chips
  DOM.filterChips().forEach(chip => {
    chip.addEventListener('click', () => setTypeFilter(chip.dataset.filter));
  });

  // Category items
  DOM.categoryItems().forEach(item => {
    item.addEventListener('click', () => filterPosts(item.dataset.category));
  });

  // Nav items
  DOM.navItems().forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      switchSection(item.dataset.section);
    });
  });

  // Sidebar toggle
  DOM.sidebarToggle()?.addEventListener('click', toggleSidebar);
  DOM.sidebarOverlay()?.addEventListener('click', toggleSidebar);

  // Theme toggle
  DOM.themeToggle()?.addEventListener('click', toggleTheme);

  // Pinned banner dismiss
  DOM.pinnedDismiss()?.addEventListener('click', () => {
    const banner = DOM.pinnedBanner();
    if (!banner) return;
    banner.style.transition = 'opacity 0.3s ease, max-height 0.3s ease, margin 0.3s ease';
    banner.style.opacity = '0';
    banner.style.maxHeight = '0';
    banner.style.marginBottom = '0';
    banner.style.overflow = 'hidden';
    setTimeout(() => banner.remove(), 320);
  });

  // Product pills
  document.querySelector('.topbar-products')?.addEventListener('click', onProductPillClick);

  // Keyboard shortcuts
  document.addEventListener('keydown', onKeyDown);

  // Responsive: close overlay on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      DOM.sidebarOverlay()?.classList.remove('visible');
      DOM.sidebarLeft()?.classList.remove('mobile-open');
      if (!state.sidebarOpen) {
        state.sidebarOpen = true;
      }
    }
  }, { passive: true });

  // Trending topic clicks
  document.querySelectorAll('.trending-item').forEach(item => {
    item.addEventListener('click', () => {
      const tag = item.querySelector('.trend-tag')?.textContent?.replace('#', '').trim();
      if (tag) {
        state.searchQuery = tag;
        DOM.postSearch().value = tag;
        renderFeed();
        DOM.feed()?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast(`Showing posts tagged #${tag}`, 'info', 2000);
      }
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') item.click();
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  console.info('✦ SciNexus Community initialized');
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
