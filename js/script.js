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