/**
 * StudyStack Hub - Client-Side Interactive Core
 * Features:
 * - Accessible mobile navigation drawer
 * - "My Study Stack" persistent bookmarks (localStorage) with slide-over drawer
 * - Real-time category filtering and keyword search with URL param sync
 * - Interactive homepage hero search with instant dropdown previews
 * - Interactive Study Method Recommendation Quiz on Frameworks page
 * - Non-intrusive Toast Notifications
 * - Tool link sharing to clipboard
 */

// ==========================================================================
// 1. Storage & "My Study Stack" Favorites System
// ==========================================================================
const STORAGE_KEY = 'studystack_saved_items';

function getSavedItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Could not access localStorage for StudyStack:', err);
    return [];
  }
}

function saveItemsToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateStackBadges();
    renderStudyStackDrawer();
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

function isItemSaved(id) {
  const items = getSavedItems();
  return items.some(item => item.id === id);
}

function toggleSaveItem(itemData) {
  let items = getSavedItems();
  const existingIndex = items.findIndex(i => i.id === itemData.id);

  if (existingIndex > -1) {
    items.splice(existingIndex, 1);
    saveItemsToStorage(items);
    updateCardButtonState(itemData.id, false);
    showToast(`Removed "${itemData.title}" from My Stack`, 'info');
  } else {
    items.push(itemData);
    saveItemsToStorage(items);
    updateCardButtonState(itemData.id, true);
    showToast(`Saved "${itemData.title}" to My Stack`, 'success');
  }
}

function updateStackBadges() {
  const count = getSavedItems().length;
  const badges = document.querySelectorAll('.stack-count-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

function updateCardButtonState(id, isSaved) {
  const btns = document.querySelectorAll(`.btn-save-stack[data-id="${id}"]`);
  btns.forEach(btn => {
    if (isSaved) {
      btn.classList.add('saved');
      btn.setAttribute('aria-pressed', 'true');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        <span>Saved</span>
      `;
    } else {
      btn.classList.remove('saved');
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        <span>Save</span>
      `;
    }
  });
}

function syncAllCardButtonStates() {
  const btns = document.querySelectorAll('.btn-save-stack');
  btns.forEach(btn => {
    const id = btn.getAttribute('data-id');
    if (id) {
      updateCardButtonState(id, isItemSaved(id));
    }
  });
}

// Drawer DOM creation and handlers
function openStudyStackDrawer() {
  const backdrop = document.getElementById('study-stack-drawer-backdrop');
  if (backdrop) {
    renderStudyStackDrawer();
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeStudyStackDrawer() {
  const backdrop = document.getElementById('study-stack-drawer-backdrop');
  if (backdrop) {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderStudyStackDrawer() {
  const container = document.getElementById('study-stack-drawer-items');
  const countLabel = document.getElementById('study-stack-drawer-count');
  if (!container) return;

  const items = getSavedItems();
  if (countLabel) {
    countLabel.textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--color-text-secondary);">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--color-surface-subtle); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--color-text-tertiary);">
          <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
        </div>
        <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--color-text); margin: 0 0 0.35rem;">Your Study Stack is empty</h4>
        <p style="font-size: 0.8125rem; color: var(--color-text-secondary); margin: 0 0 1.25rem; line-height: 1.5;">
          Save vetted tools and cognitive frameworks to curate your personal study workflow.
        </p>
        <a href="tools.html" class="btn-primary" style="font-size: 0.8125rem; padding: 0.5rem 1rem;" onclick="closeStudyStackDrawer()">
          Explore Tools
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="stack-item-card" data-id="${item.id}">
      <div style="flex-grow: 1;">
        <span style="font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text-secondary); background: var(--color-surface-subtle); border: 1px solid var(--color-border-subtle); padding: 0.15rem 0.45rem; border-radius: var(--radius-sm);">
          ${item.category || 'Resource'}
        </span>
        <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--color-text); margin: 0.35rem 0 0.2rem;">
          <a href="${item.url}" style="color: var(--color-text);">${item.title}</a>
        </h4>
        <p style="font-size: 0.78125rem; color: var(--color-text-secondary); margin: 0 0 0.5rem; line-height: 1.45;">
          ${item.snippet || ''}
        </p>
        <div>
          <a href="${item.url}" class="btn-external-link">
            Open Resource
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>
      <button
        type="button"
        onclick="toggleSaveItem({ id: '${item.id}', title: '${item.title.replace(/'/g, "\\'")}' })"
        style="background: none; border: none; padding: 0.35rem; color: var(--color-text-tertiary); cursor: pointer; border-radius: var(--radius-sm);"
        title="Remove from stack"
        aria-label="Remove ${item.title} from stack"
      >
        <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `).join('');
}


// ==========================================================================
// 2. Toast Notification System
// ==========================================================================
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success'
    ? `<svg style="width: 15px; height: 15px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`
    : `<svg style="width: 15px; height: 15px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 2600);
}

// Copy link utility
function copyToolLink(anchorId, title) {
  const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast(`Link to ${title} copied to clipboard`, 'info');
    }).catch(() => {
      fallbackCopy(url, title);
    });
  } else {
    fallbackCopy(url, title);
  }
}

function fallbackCopy(text, title) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(`Link to ${title} copied`, 'info');
  } catch (err) {
    showToast(`Link: ${text}`, 'info');
  }
  document.body.removeChild(textArea);
}


// ==========================================================================
// 3. Mobile Navigation Drawer
// ==========================================================================
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const closedIcon = document.getElementById('menu-closed-icon');
  const openedIcon = document.getElementById('menu-opened-icon');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('active');
      mobileMenu.classList.toggle('hidden');
      if (closedIcon) closedIcon.classList.toggle('hidden');
      if (openedIcon) openedIcon.classList.toggle('hidden');
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && (mobileMenu.classList.contains('active') || !mobileMenu.classList.contains('hidden'))) {
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('active');
        mobileMenu.classList.add('hidden');
        if (closedIcon) closedIcon.classList.remove('hidden');
        if (openedIcon) openedIcon.classList.add('hidden');
      }
    });
  }
}


// ==========================================================================
// 4. Tools Directory Search & Category Filtering (tools.html)
// ==========================================================================
function initToolsFiltering() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const searchFilterInput = document.getElementById('tools-search-filter');
  const toolCards = document.querySelectorAll('.tool-card');
  const statusMsg = document.getElementById('filter-status');
  const noResults = document.getElementById('no-tools-found');

  if (toolCards.length === 0) return; // Not on tools.html

  let currentCategory = 'all';
  let currentSearchTerm = '';
  const totalCards = toolCards.length;

  function applyFilters() {
    let visibleCount = 0;

    toolCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const cardText = card.textContent.toLowerCase();

      const matchesCategory = (currentCategory === 'all') || (cardCategory === currentCategory);
      const matchesSearch = !currentSearchTerm || cardKeywords.includes(currentSearchTerm) || cardText.includes(currentSearchTerm);

      if (matchesCategory && matchesSearch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (statusMsg) {
      if (currentCategory === 'all' && !currentSearchTerm) {
        statusMsg.textContent = `Showing all ${totalCards} curated tools`;
      } else {
        statusMsg.textContent = `Showing ${visibleCount} of ${totalCards} tools`;
      }
    }

    if (noResults) {
      if (visibleCount === 0) {
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
      }
    }
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.setAttribute('aria-selected', 'false');
      });

      pill.setAttribute('aria-selected', 'true');
      currentCategory = pill.getAttribute('data-category') || 'all';
      applyFilters();
    });
  });

  if (searchFilterInput) {
    searchFilterInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  window.resetToolsFilter = function() {
    if (searchFilterInput) searchFilterInput.value = '';
    currentSearchTerm = '';
    const allPill = document.querySelector('.filter-pill[data-category="all"]');
    if (allPill) allPill.click();
  };

  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  const queryParam = urlParams.get('q');

  if (queryParam && searchFilterInput) {
    searchFilterInput.value = queryParam;
    currentSearchTerm = queryParam.toLowerCase();
  }

  if (catParam) {
    const targetPill = document.querySelector(`.filter-pill[data-category="${catParam}"]`);
    if (targetPill) {
      targetPill.click();
      return;
    }
  }

  applyFilters();
}


// ==========================================================================
// 5. Hero Instant Search Auto-complete (index.html)
// ==========================================================================
const SEARCHABLE_ITEMS = [
  { title: 'Consensus', category: 'AI Research', url: 'tools.html#consensus', snippet: 'Academic search engine analyzing 200M+ peer-reviewed papers.' },
  { title: 'Anki', category: 'Flashcards', url: 'tools.html#anki', snippet: 'Spaced repetition flashcards based on the SuperMemo SM-2 algorithm.' },
  { title: 'Zotero', category: 'Citations', url: 'tools.html#zotero', snippet: 'Open-source reference manager and automatic citation generator.' },
  { title: 'Notion', category: 'Planning', url: 'tools.html#notion', snippet: 'Modular workspace for syllabi, lecture notes, and study schedules.' },
  { title: 'Pomofocus', category: 'Focus', url: 'tools.html#pomofocus', snippet: 'Interval timer pairing timed study cycles with task lists.' },
  { title: 'Obsidian', category: 'Knowledge Graph', url: 'tools.html#obsidian', snippet: 'Local markdown knowledge graph for connecting lecture notes.' },
  { title: 'The Feynman Technique', category: 'Frameworks', url: 'frameworks.html#feynman', snippet: 'Explain complex concepts in simple terms to spot comprehension gaps.' },
  { title: 'The Pomodoro 50/10 Cycle', category: 'Frameworks', url: 'frameworks.html#pomodoro', snippet: 'Attention framework balancing deep focus sprints with structured rest.' },
  { title: 'Active Recall', category: 'Frameworks', url: 'frameworks.html#active-recall', snippet: 'Test-driven information retrieval for long-term memory encoding.' },
  { title: 'The Leitner System', category: 'Frameworks', url: 'frameworks.html#leitner', snippet: 'Tiered box review methodology optimizing spaced flashcard schedules.' }
];

function initHeroSearch() {
  const searchInput = document.getElementById('hero-search-input');
  const searchResults = document.getElementById('hero-search-results');

  if (!searchInput || !searchResults) return;

  window.handleHeroSearch = function() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return;
    window.location.href = `tools.html?q=${encodeURIComponent(q)}`;
  };

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length < 2) {
      searchResults.classList.add('hidden');
      searchResults.innerHTML = '';
      return;
    }

    const matches = SEARCHABLE_ITEMS.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.snippet.toLowerCase().includes(query)
    ).slice(0, 4);

    if (matches.length > 0) {
      searchResults.innerHTML = matches.map(match => `
        <a href="${match.url}" class="search-result-item">
          <div class="search-result-header">
            <span class="search-result-title">${match.title}</span>
            <span class="search-result-cat">${match.category}</span>
          </div>
          <p class="search-result-snippet">${match.snippet}</p>
        </a>
      `).join('') + `
        <a href="tools.html?q=${encodeURIComponent(query)}" class="search-result-item" style="background-color: var(--color-surface-subtle); text-align: center; color: var(--color-accent); font-weight: 500;">
          View all results for "${query}" in Tools Directory
        </a>
      `;
      searchResults.classList.remove('hidden');
    } else {
      searchResults.innerHTML = `
        <div style="padding: 1rem; font-size: 0.8125rem; color: var(--color-text-secondary); text-align: center;">
          No direct matches found. Try browsing the <a href="tools.html" style="color: var(--color-accent); text-decoration: underline;">Tools Directory</a> or <a href="frameworks.html" style="color: var(--color-accent); text-decoration: underline;">Study Frameworks</a>.
        </div>
      `;
      searchResults.classList.remove('hidden');
    }
  });

  // Close search results on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });
}


// ==========================================================================
// 6. Interactive Study Method Finder Widget (frameworks.html)
// ==========================================================================
function initFrameworkRecommender() {
  const container = document.getElementById('framework-recommender-widget');
  if (!container) return; // Not on frameworks.html

  const goalButtons = container.querySelectorAll('.recommender-goal-btn');
  const resultCard = container.querySelector('#recommender-result-card');
  const resultTitle = container.querySelector('#recommender-result-title');
  const resultCategory = container.querySelector('#recommender-result-category');
  const resultDesc = container.querySelector('#recommender-result-desc');
  const resultTool = container.querySelector('#recommender-result-tool');
  const resultJumpBtn = container.querySelector('#recommender-result-jump');

  const RECOMMENDATIONS = {
    'concept': {
      title: 'The Feynman Technique',
      category: 'Mental Model Simplification',
      desc: 'You need deep understanding of core principles. Teaching the material simply exposes where your comprehension gaps lie.',
      tool: 'Obsidian and Notion',
      targetId: 'feynman'
    },
    'memorize': {
      title: 'Active Recall (Retrieval Practice)',
      category: 'High-Retention Testing',
      desc: 'Passive rereading creates illusions of competence. Testing your memory without looking at notes forces neural pathways to strengthen permanently.',
      tool: 'Anki Flashcard Engine',
      targetId: 'active-recall'
    },
    'focus': {
      title: 'The Pomodoro 50/10 Cycle',
      category: 'Attention Management',
      desc: 'Overcome initiation friction by committing to one 50-minute sprint, followed by a guaranteed 10-minute mental recharge.',
      tool: 'Pomofocus Interval Timer',
      targetId: 'pomodoro'
    },
    'spaced': {
      title: 'The Leitner Box System',
      category: 'Spaced Repetition Schedule',
      desc: 'Optimize your review time by sorting flashcards into progressive bins so you only practice the items you struggle with.',
      tool: 'Anki or Physical Flashcard Boxes',
      targetId: 'leitner'
    }
  };

  goalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goalButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const goal = btn.getAttribute('data-goal');
      const rec = RECOMMENDATIONS[goal];

      if (rec && resultCard) {
        resultTitle.textContent = rec.title;
        resultCategory.textContent = rec.category;
        resultDesc.textContent = rec.desc;
        resultTool.textContent = rec.tool;
        resultJumpBtn.href = `#${rec.targetId}`;
        resultCard.classList.remove('hidden');

        if (window.innerWidth < 768) {
          resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  });
}


// ==========================================================================
// 7. Global Event Listeners & Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  updateStackBadges();
  syncAllCardButtonStates();
  initToolsFiltering();
  initHeroSearch();
  initFrameworkRecommender();

  // Handle drawer open buttons
  const drawerTriggers = document.querySelectorAll('.open-stack-drawer-btn');
  drawerTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openStudyStackDrawer();
    });
  });

  // Handle drawer backdrop click to close
  const backdrop = document.getElementById('study-stack-drawer-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeStudyStackDrawer();
      }
    });
  }

  // Handle ESC key to close drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeStudyStackDrawer();
    }
  });

  // Global delegation for Save / Bookmark buttons
  document.body.addEventListener('click', (e) => {
    const saveBtn = e.target.closest('.btn-save-stack');
    if (saveBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = saveBtn.getAttribute('data-id');
      const title = saveBtn.getAttribute('data-title') || id;
      const category = saveBtn.getAttribute('data-category') || 'Resource';
      const url = saveBtn.getAttribute('data-url') || `#${id}`;
      const snippet = saveBtn.getAttribute('data-snippet') || '';

      toggleSaveItem({ id, title, category, url, snippet });
    }

    const shareBtn = e.target.closest('.btn-share-tool');
    if (shareBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = shareBtn.getAttribute('data-id');
      const title = shareBtn.getAttribute('data-title') || id;
      copyToolLink(id, title);
    }
  });
});
