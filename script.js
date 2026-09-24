/**
 * StudyStack Hub - Client-Side Interactive Core
 * Comprehensive script providing:
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
    showToast(`Added "${itemData.title}" to My Stack!`, 'success');
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
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        <span>Saved</span>
      `;
    } else {
      btn.classList.remove('saved');
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
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
      <div class="text-center py-12 text-slate-500">
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
        </div>
        <h4 class="font-bold text-slate-800 text-sm">Your Study Stack is Empty</h4>
        <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Save useful tools and frameworks while browsing to build your personalized study kit.
        </p>
        <a href="tools.html" class="inline-block mt-4 px-4 py-2 bg-brand-blue text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors" onclick="closeStudyStackDrawer()">
          Explore Tools
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="stack-item-card" data-id="${item.id}">
      <div class="flex-grow">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
            ${item.category || 'Resource'}
          </span>
        </div>
        <h4 class="font-bold text-slate-900 text-sm mt-1">
          <a href="${item.url}" class="hover:text-brand-blue transition-colors">${item.title}</a>
        </h4>
        <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">${item.snippet || ''}</p>
        <div class="mt-2 flex items-center gap-3">
          <a href="${item.url}" class="text-xs font-semibold text-brand-blue hover:underline inline-flex items-center gap-1">
            Open Resource
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
      </div>
      <button
        type="button"
        onclick="toggleSaveItem({ id: '${item.id}', title: '${item.title.replace(/'/g, "\\'")}' })"
        class="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
        title="Remove from stack"
        aria-label="Remove ${item.title} from stack"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
    ? `<svg class="w-5 h-5 toast-icon flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
    : `<svg class="w-5 h-5 toast-icon flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span class="flex-grow text-xs sm:text-sm font-medium">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2800);
}

// Copy link utility
function copyToolLink(anchorId, title) {
  const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast(`Link to ${title} copied to clipboard!`, 'info');
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
    showToast(`Link to ${title} copied!`, 'info');
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
      mobileMenu.classList.toggle('hidden');
      if (closedIcon) closedIcon.classList.toggle('hidden');
      if (openedIcon) openedIcon.classList.toggle('hidden');
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        menuBtn.setAttribute('aria-expanded', 'false');
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

    // Update status label
    if (statusMsg) {
      if (currentCategory === 'all' && !currentSearchTerm) {
        statusMsg.textContent = `Showing all ${totalCards} curated resources`;
      } else {
        statusMsg.textContent = `Showing ${visibleCount} of ${totalCards} resources`;
      }
    }

    // No results state
    if (noResults) {
      if (visibleCount === 0) {
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
      }
    }
  }

  // Pill click handler
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('bg-brand-navy', 'text-white', 'shadow-xs');
        p.classList.add('bg-slate-100', 'text-slate-700');
        p.setAttribute('aria-selected', 'false');
      });

      pill.classList.remove('bg-slate-100', 'text-slate-700');
      pill.classList.add('bg-brand-navy', 'text-white', 'shadow-xs');
      pill.setAttribute('aria-selected', 'true');

      currentCategory = pill.getAttribute('data-category') || 'all';
      applyFilters();
    });
  });

  // Search filter input handler
  if (searchFilterInput) {
    searchFilterInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Global reset handler
  window.resetToolsFilter = function() {
    if (searchFilterInput) searchFilterInput.value = '';
    currentSearchTerm = '';
    const allPill = document.querySelector('.filter-pill[data-category="all"]');
    if (allPill) allPill.click();
  };

  // URL search parameters (?category=... or ?q=...)
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
  { title: 'Consensus', category: 'AI Tools', url: 'tools.html#consensus', snippet: 'Academic AI search engine citing 200M+ peer-reviewed papers.' },
  { title: 'Anki', category: 'Flashcards', url: 'tools.html#anki', snippet: 'Spaced repetition flashcards based on the SuperMemo SM-2 algorithm.' },
  { title: 'Zotero', category: 'Research & Citations', url: 'tools.html#zotero', snippet: 'Open-source reference manager & automatic citation generator.' },
  { title: 'Notion', category: 'Planning & Notes', url: 'tools.html#notion', snippet: 'Modular academic workspace for syllabi, notes, and task schedules.' },
  { title: 'Pomofocus', category: 'Focus & Timers', url: 'tools.html#pomofocus', snippet: 'Clean Pomodoro interval timer pairing work sprints with rest.' },
  { title: 'Obsidian', category: 'Mind Mapping', url: 'tools.html#obsidian', snippet: 'Bi-directional markdown knowledge graph for connecting lecture notes.' },
  { title: 'The Feynman Technique', category: 'Frameworks', url: 'frameworks.html#feynman', snippet: 'Explain complex concepts in simple terms to spot comprehension gaps.' },
  { title: 'The Pomodoro 50/10 Cycle', category: 'Frameworks', url: 'frameworks.html#pomodoro', snippet: 'Cognitive rhythm balancing deep focus sprints with structured rest.' },
  { title: 'Active Recall', category: 'Frameworks', url: 'frameworks.html#active-recall', snippet: 'Test-driven information retrieval for long-term memory encoding.' },
  { title: 'The Leitner System', category: 'Frameworks', url: 'frameworks.html#leitner', snippet: 'Tiered box review methodology optimizing spaced flashcard schedules.' }
];

function initHeroSearch() {
  const searchInput = document.getElementById('hero-search-input');
  const searchResults = document.getElementById('hero-search-results');

  if (!searchInput || !searchResults) return; // Not on index.html

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
        <a href="${match.url}" class="block p-3 hover:bg-slate-800 transition-colors group">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold text-white group-hover:text-blue-400">${match.title}</span>
            <span class="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">${match.category}</span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">${match.snippet}</p>
        </a>
      `).join('') + `
        <a href="tools.html?q=${encodeURIComponent(query)}" class="block p-2.5 text-center text-xs font-semibold text-brand-blue hover:bg-slate-800 transition-colors bg-slate-900/90 border-t border-slate-800">
          View all results for "${query}" in Tools Directory →
        </a>
      `;
      searchResults.classList.remove('hidden');
    } else {
      searchResults.innerHTML = `
        <div class="p-4 text-xs text-slate-400 text-center">
          No direct matches found. Try browsing the <a href="tools.html" class="text-brand-blue underline font-medium">Tools Directory</a> or <a href="frameworks.html" class="text-brand-blue underline font-medium">Study Frameworks</a>.
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
      desc: 'You need deep understanding of core principles. Teaching the material simply will instantly expose where your gaps lie.',
      tool: 'Obsidian & Notion',
      targetId: 'feynman'
    },
    'memorize': {
      title: 'Active Recall (Retrieval Practice)',
      category: 'High-Retention Testing',
      desc: 'Passive re-reading is a trap. Testing your memory without looking at notes forces neural pathways to strengthen permanently.',
      tool: 'Anki Flashcard Engine',
      targetId: 'active-recall'
    },
    'focus': {
      title: 'The Pomodoro 50/10 Cycle',
      category: 'Attention Management',
      desc: 'Overcome initiation resistance by committing to one 50-minute sprint, followed by a guaranteed 10-minute cognitive recharge.',
      tool: 'Pomofocus Interval Timer',
      targetId: 'pomodoro'
    },
    'spaced': {
      title: 'The Leitner Box System',
      category: 'Spaced Repetition Schedule',
      desc: 'Optimize your review time by categorizing flashcards into progressive bins so you only study the cards you struggle with.',
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

        // Smooth scroll result into view if on small screen
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
