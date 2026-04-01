const COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff922b','#cc5de8'];

export function launchConfetti(x, y, n = 20) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:fixed;
      width:${8 + Math.random() * 8}px;
      height:${8 + Math.random() * 8}px;
      border-radius:2px;
      background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
      left:${(x ?? Math.random() * window.innerWidth)}px;
      top:${y ?? 0}px;
      margin-left:${Math.random() * 200 - 100}px;
      transform:rotate(${Math.random()*360}deg);
      animation:confettiFall 2s ease-in forwards;
      pointer-events:none;
      z-index:9999;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 2200);
  }
}
