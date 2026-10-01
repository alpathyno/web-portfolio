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