const bg = document.querySelector('.bg');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 3;
let x = targetX;
let y = targetY;

window.addEventListener('pointermove', (e) => {
  targetX = e.clientX;
  targetY = e.clientY;
});

function animate() {
  const ease = reduceMotion ? 1 : 0.12; // makin kecil = makin "ngikut pelan"
  x += (targetX - x) * ease;
  y += (targetY - y) * ease;
  bg.style.setProperty('--mx', x + 'px');
  bg.style.setProperty('--my', y + 'px');
  requestAnimationFrame(animate);
}
animate();

const term = document.getElementById('terminal');
if (term && !reduceMotion) {
  const termLines = term.querySelectorAll('.term-line');
  termLines.forEach((l) => l.classList.add('pending'));

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    termLines.forEach((l, i) => {
      setTimeout(() => l.classList.remove('pending'), i * 700);
    });
  }, { threshold: 0.5 });

  observer.observe(term);
}

const navbar = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

if (!reduceMotion && 'IntersectionObserver' in window) {
  // urutan kemunculan kartu proyek
  document.querySelectorAll('.project').forEach((el, i) => {
    el.style.setProperty('--i', i);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // cukup sekali
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('#projects, #about, #contact').forEach((sec) => {
    sec.classList.add('reveal');
    revealObserver.observe(sec);
  });
}

// Kartu kontak: cahaya mengikuti kursor
document.querySelectorAll('.social-card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--cx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--cy', (e.clientY - r.top) + 'px');
  });
});

// Salin email ke clipboard
const emailBtn = document.getElementById('emailCopy');
const emailHint = document.getElementById('emailHint');
if (emailBtn) {
  emailBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailBtn.dataset.email);
      emailHint.textContent = 'Tersalin!';
      emailHint.classList.add('done');
    } catch {
      emailHint.textContent = 'Gagal menyalin, salin manual ya';
    }
    setTimeout(() => {
      emailHint.textContent = 'Klik untuk menyalin';
      emailHint.classList.remove('done');
    }, 2000);
  });
}

// Efek miring mengikuti kursor
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  const tiltTargets = [
    { selector: '.hero-photo', max: 14, lift: '0px' },
    { selector: '.browser', max: 12, lift: '-6px' },
  ];

  tiltTargets.forEach(({ selector, max, lift }) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) translateY(${lift}) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  });
}

// Teks mengetik di hero
const typed = document.getElementById('typed');
if (typed && !reduceMotion) {
  const words = ['minimalis', 'rapi', 'responsif', 'bersih'];
  const h1 = typed.closest('h1');

  // kunci tinggi judul supaya halaman tidak loncat saat kata berganti
  function lockHeight() {
    h1.style.minHeight = '';
    const current = typed.textContent;
    let tallest = 0;
    words.forEach((w) => {
      typed.textContent = w;
      tallest = Math.max(tallest, h1.offsetHeight);
    });
    typed.textContent = current;
    h1.style.minHeight = tallest + 'px';
  }
  lockHeight();
  document.fonts.ready.then(lockHeight);
  window.addEventListener('resize', lockHeight);

  let wordIndex = 0;
  let charIndex = words[0].length;
  let deleting = true;

  function tick() {
    const word = words[wordIndex];
    if (!deleting) {
      charIndex++;
      typed.textContent = word.slice(0, charIndex);
      if (charIndex === word.length) {
        deleting = true;
        return setTimeout(tick, 7000); // jeda setelah selesai mengetik
      }
      return setTimeout(tick, 170);
    }
    charIndex--;
    typed.textContent = word.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      return setTimeout(tick, 350);
    }
    setTimeout(tick, 170);
  }
  setTimeout(tick, 2200); // mulai setelah animasi masuk hero selesai
}

// Terminal interaktif
const termInput = document.getElementById('termInput');
const termOutput = document.getElementById('termOutput');

if (term && termInput && termOutput) {
  const history = [];
  let historyIndex = 0;

  const links = {
    github: 'https://github.com/alpathyno',
    instagram: 'https://instagram.com/tthyngs',
  };
  const sections = ['home', 'projects', 'about', 'contact'];
  const email = () => document.getElementById('emailCopy')?.dataset.email || '-';

  const commands = {
    help: () => [
      'Perintah yang tersedia:',
      '  help       tampilkan bantuan ini',
      '  about      sedikit tentang saya',
      '  stack      teknologi yang kupakai',
      '  projects   daftar proyek',
      '  contact    cara menghubungiku',
      '  whoami     siapa aku?',
      '  goto <x>   loncat ke section (projects, about, contact)',
      '  open <x>   buka github atau instagram',
      '  clear      bersihkan layar',
    ],
    about: () => [
      'Thy, mahasiswa & web developer.',
      'Saya gabut.',
    ],
    stack: () => ['Laravel, HTML, CSS, JavaScript, Bootstrap, React'],
    projects: () => [
      '1. Stadionku         penjualan tiket sepakbola',
      '2. Kopi Nusantara    booking tempat kafe',
      '3. Tracer Study      pelacakan alumni',
      "ketik 'goto projects' untuk melihat tampilannya.",
    ],
    contact: () => [
      'email      : ' + email(),
      'github     : github.com/alpathyno',
      'instagram  : instagram.com/tthyngs',
    ],
    whoami: () => ['thy'],
    goto: (args) => {
      const target = args[0];
      if (!sections.includes(target)) return ['pakai: goto <' + sections.join('|') + '>'];
      document.getElementById(target).scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
      return ['menuju ' + target + '...'];
    },
    open: (args) => {
      const url = links[args[0]];
      if (!url) return ['pakai: open <github|instagram>'];
      window.open(url, '_blank', 'noopener');
      return ['membuka ' + args[0] + '...'];
    },
  };

  function print(text, className) {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    termOutput.appendChild(line);
  }

  function echo(raw) {
    const line = document.createElement('div');
    line.className = 'term-cmd';
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = 'thy:~$';
    line.append(prompt, raw);
    termOutput.appendChild(line);
  }

  function run(raw) {
    echo(raw);
    const value = raw.trim().toLowerCase();
    if (!value) return;

    // easter egg
    if (value === 'sudo hire thy') {
      [
        '[sudo] password untuk recruiter: ********',
        'Akses diterima. Menyiapkan tawaran kerja...',
        'Silahkan kirim ke: ' + email(),
      ].forEach((l) => print(l, 'term-out'));
      return;
    }

    const [name, ...args] = value.split(/\s+/);
    if (name === 'clear') {
      termOutput.textContent = '';
      return;
    }
    if (Object.hasOwn(commands, name)) {
      commands[name](args).forEach((l) => print(l, 'term-out'));
    } else {
      print("perintah tidak dikenal: " + name + ". ketik 'help' untuk bantuan.", 'term-out');
    }
  }

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = termInput.value;
      if (value.trim()) history.push(value);
      historyIndex = history.length;
      run(value);
      termInput.value = '';
      termInput.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        termInput.value = history[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        termInput.value = history[historyIndex];
      } else {
        historyIndex = history.length;
        termInput.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = termInput.value.trim().toLowerCase();
      const matches = Object.keys(commands).filter((c) => c.startsWith(partial));
      if (partial && matches.length === 1) termInput.value = matches[0];
    }
  });

  // klik di mana saja di terminal untuk mulai mengetik
  term.addEventListener('click', () => termInput.focus({ preventScroll: true }));
}

// Ganti tema gelap/terang
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

// Data GitHub hidup
const ghBox = document.getElementById('github');
const ghBody = document.getElementById('ghBody');

if (ghBox && ghBody) {
  const user = ghBox.dataset.user;
  const CACHE_KEY = 'gh-cache:' + user;
  const CACHE_MS = 10 * 60 * 1000; // simpan 10 menit supaya hemat permintaan
  const LANG_COLORS = ['#4F8CFF', '#7DD3FC', '#C4B5FD', '#34D399', '#FBBF24'];

  // membuat elemen dengan teks aman (textContent, bukan innerHTML)
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function timeAgo(iso) {
    const seconds = (Date.now() - new Date(iso)) / 1000;
    const units = [
      [31536000, 'tahun'], [2592000, 'bulan'], [86400, 'hari'],
      [3600, 'jam'], [60, 'menit'],
    ];
    for (const [size, name] of units) {
      const n = Math.floor(seconds / size);
      if (n >= 1) return n + ' ' + name + ' lalu';
    }
    return 'baru saja';
  }

  async function getData() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
      if (cached && Date.now() - cached.time < CACHE_MS) return cached.data;
    } catch (e) {}

    const [userRes, repoRes] = await Promise.all([
      fetch('https://api.github.com/users/' + user),
      fetch('https://api.github.com/users/' + user + '/repos?per_page=100&sort=pushed'),
    ]);
    if (!userRes.ok || !repoRes.ok) {
      throw new Error('GitHub API ' + (userRes.ok ? repoRes.status : userRes.status));
    }
    const data = { profile: await userRes.json(), repos: await repoRes.json() };
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));
    } catch (e) {}
    return data;
  }

  function render({ profile, repos }) {
    ghBody.textContent = '';
    const own = repos.filter((r) => !r.fork);

    // statistik
    const stats = make('div', 'gh-stats');
    const lastActive = own[0] ? timeAgo(own[0].pushed_at) : '-';
    [
      [profile.public_repos, 'Repo publik'],
      [profile.followers, 'Pengikut'],
      [lastActive, 'Aktivitas terakhir'],
    ].forEach(([value, label]) => {
      const item = make('div', 'gh-stat');
      item.append(make('strong', '', String(value)), make('span', '', label));
      stats.appendChild(item);
    });
    ghBody.appendChild(stats);

    // bahasa (dihitung dari jumlah repo per bahasa)
    const counts = {};
    own.forEach((r) => {
      if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
    });
    const langs = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = langs.reduce((sum, [, n]) => sum + n, 0);

    if (total > 0) {
      const bar = make('div', 'gh-bar');
      const legend = make('ul', 'gh-legend');
      langs.forEach(([name, n], i) => {
        const pct = Math.round((n / total) * 100);
        const seg = make('span');
        seg.style.width = (n / total) * 100 + '%';
        seg.style.background = LANG_COLORS[i];
        seg.title = name + ' ' + pct + '%';
        bar.appendChild(seg);

        const li = make('li');
        const dot = make('i');
        dot.style.background = LANG_COLORS[i];
        li.append(dot, name + ' ' + pct + '%');
        legend.appendChild(li);
      });
      ghBody.append(bar, legend);
    }

    // tiga repo terbaru
    const grid = make('div', 'gh-repos');
    own.slice(0, 3).forEach((r) => {
      const card = make('a', 'gh-repo');
      if (r.html_url && r.html_url.startsWith('https://github.com/')) card.href = r.html_url;
      card.target = '_blank';
      card.rel = 'noopener';

      const meta = [];
      if (r.language) meta.push(r.language);
      if (r.stargazers_count > 0) meta.push('★ ' + r.stargazers_count);
      meta.push('diperbarui ' + timeAgo(r.pushed_at));

      card.append(
        make('strong', '', r.name),
        make('p', '', r.description || 'Belum ada deskripsi.'),
        make('span', 'gh-meta', meta.join(' · '))
      );
      grid.appendChild(card);
    });
    ghBody.appendChild(grid);
  }

  function showError() {
    ghBody.textContent = '';
    const message = make(
      'p',
      'gh-status',
      'Data GitHub belum bisa dimuat (mungkin karena batas permintaan atau koneksi).'
    );
    const retry = make('button', 'gh-retry', 'Coba lagi');
    retry.type = 'button';
    retry.addEventListener('click', load);
    ghBody.append(message, retry);
  }

  async function load() {
    ghBody.textContent = '';
    ghBody.appendChild(make('p', 'gh-status', 'Memuat data GitHub...'));
    try {
      render(await getData());
    } catch (e) {
      showError();
    }
  }

  // muat hanya saat panel hampir terlihat, supaya hemat permintaan API
  const ghObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    ghObserver.disconnect();
    load();
  }, { rootMargin: '200px' });
  ghObserver.observe(ghBox);
}

// Kursor kustom (hanya perangkat dengan mouse)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const root = document.documentElement;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(ring, dot);
  root.classList.add('has-cursor');

  let targetX = -100, targetY = -100;
  let ringX = -100, ringY = -100;
  let ready = false;

  window.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    dot.style.translate = targetX + 'px ' + targetY + 'px';

    if (!ready) {
      ready = true;
      ringX = targetX;
      ringY = targetY;
      root.classList.add('cursor-ready');
    }

    const el = e.target instanceof Element ? e.target : null;
    const isText = !!(el && el.closest('input, .term-body'));
    const isInteractive = !!(el && el.closest('a, button, [role="button"], .project, .social-card'));
    ring.classList.toggle('is-text', isText);
    ring.classList.toggle('is-hover', isInteractive && !isText);
  });

  window.addEventListener('pointerdown', () => root.classList.add('cursor-down'));
  window.addEventListener('pointerup', () => root.classList.remove('cursor-down'));
  document.addEventListener('mouseleave', () => root.classList.remove('cursor-ready'));
  document.addEventListener('mouseenter', () => { if (ready) root.classList.add('cursor-ready'); });

  const ease = reduceMotion ? 1 : 0.18; // makin kecil = lingkaran makin lambat menyusul
  function followCursor() {
    ringX += (targetX - ringX) * ease;
    ringY += (targetY - ringY) * ease;
    ring.style.translate = ringX + 'px ' + ringY + 'px';
    requestAnimationFrame(followCursor);
  }
  followCursor();
}

// Transisi scroll: hero memudar + paralaks latar
if (!reduceMotion) {
  const heroEl = document.querySelector('.hero');
  const bgEl = document.querySelector('.bg');
  let scrollTicking = false;

  function updateScrollEffects() {
    const y = window.scrollY;
    if (heroEl) {
      const p = Math.min(Math.max(y / (heroEl.offsetHeight * 0.8), 0), 1);
      heroEl.style.setProperty('--hp', p.toFixed(3));
    }
    if (bgEl) bgEl.style.setProperty('--py', (-y * 0.12).toFixed(1) + 'px');
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollEffects);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScrollEffects);
  updateScrollEffects();
}