const GITHUB_USER = 'Forfeit-15';

const THEME_KEY = 'theme';

document.getElementById('year').textContent = new Date().getFullYear();

// Dark mode: a 'dark' class on <body>, remembered for the browser session.
function readTheme() {
  try {
    return sessionStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    sessionStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the toggle still works, it just isn't remembered.
  }
}

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  const button = document.getElementById('theme-toggle');
  button.setAttribute('aria-pressed', String(dark));
  button.textContent = dark ? 'Light mode' : 'Dark mode';
}

applyTheme(readTheme() === 'dark');

document.getElementById('theme-toggle').addEventListener('click', () => {
  const dark = !document.body.classList.contains('dark');
  applyTheme(dark);
  saveTheme(dark ? 'dark' : 'light');
});

// Back to top: shown once the hero has scrolled fully out of view above the viewport.
const backToTop = document.getElementById('back-to-top');

new IntersectionObserver(([entry]) => {
  backToTop.hidden = entry.isIntersecting || entry.boundingClientRect.top > 0;
}).observe(document.getElementById('hero'));

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0 });
  document.getElementById('hero').focus({ preventScroll: true });
});

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function showMessage(container, message) {
  container.replaceChildren(el('p', 'muted', message));
}

function repoCard(repo) {
  const card = el('article', 'card');
  card.append(el('h3', null, repo.name));
  card.append(el('p', null, repo.description || 'No description provided.'));

  const meta = el('div', 'repo-meta');
  if (repo.language) meta.append(el('span', null, repo.language));
  meta.append(el('span', null, `★ ${repo.stargazers_count}`));
  card.append(meta);

  const link = el('a', null, 'View repository');
  link.href = repo.html_url;
  card.append(link);
  return card;
}

async function loadRepos() {
  const container = document.getElementById('repo-list');
  const url = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const repos = await res.json();

    if (!Array.isArray(repos) || repos.length === 0) {
      showMessage(container, 'No public repositories yet.');
      return;
    }
    container.replaceChildren(...repos.map(repoCard));
  } catch (err) {
    console.error(err);
    showMessage(container, 'Could not load repositories right now. See my GitHub profile instead.');
  }
}

loadRepos();
