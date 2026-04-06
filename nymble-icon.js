// Nymble Animated App Icon
// Waveform + keyboard chiclet visualization
(function() {
  const P = [
    0.08, 0.14, 0.20,
    0.26, 0.42, 0.54, 0.58, 0.54, 0.40, 0.20,
    0.04, 0.02, 0.04,
    0.16, 0.24,
    0.38, 0.68, 0.90, 0.99, 1.00, 1.00, 0.99, 0.88, 0.64,
    0.24, 0.24,
    0.40, 0.70, 0.92, 1.00, 1.00, 1.00, 1.00, 1.00, 0.92, 0.70, 0.42,
    0.24, 0.24,
    0.38, 0.66, 0.88, 0.98, 1.00, 1.00, 0.96, 0.82, 0.58,
    0.22, 0.22,
    0.34, 0.58, 0.76, 0.86, 0.88, 0.82, 0.64, 0.40,
    0.20, 0.13, 0.07,
  ];

  const FINGER_MAP = (() => {
    const map = [];
    const assign = (count, fid) => {
      for (let i = 0; i < count; i++)
        map.push({ fid, pos: i / Math.max(count - 1, 1) });
    };
    assign(3,0); assign(10,1); assign(3,2); assign(2,3);
    assign(11,4); assign(13,5); assign(11,6); assign(8,7); assign(3,8);
    return map;
  })();

  const fingerPhase = Array.from({length:9}, () => Math.random() * Math.PI * 2);
  const fingerSpeed = [0.18, 0.22, 0.24, 0.20, 0.26, 0.22, 0.24, 0.25, 0.18];

  function getFingerWaveScale(barIdx) {
    const { fid, pos } = FINGER_MAP[barIdx] || { fid:0, pos:0 };
    fingerPhase[fid] += fingerSpeed[fid] * 0.013;
    const primary = Math.sin(fingerPhase[fid]) * 0.5 + 0.5;
    const ripple = Math.sin(fingerPhase[fid] + pos * 0.9) * 0.5 + 0.5;
    const blend = primary * (1 - pos * 0.4) + ripple * (pos * 0.4);
    return 0.82 + 0.18 * 2 * blend;
  }

  function drawChiclets(ctx, W, H, tint) {
    const cols = 13, keyW = W / (cols + 0.5), gap = keyW * 0.18, r = keyW * 0.16;
    const cy = H * 0.50, rows = Math.floor((H * 0.50 - gap) / keyW);
    ctx.save();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * keyW + gap/2 + (W - cols*keyW)/2;
        const y = cy + row*keyW + gap/2;
        const w = keyW - gap, h = keyW - gap;
        if (w < 2 || h < 2) continue;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
        ctx.fillStyle = tint; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.016)'; ctx.lineWidth = 0.8; ctx.stroke();
      }
    }
    ctx.restore();
  }

  function makeIcon(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, N = P.length;
    const pad = 0.04, availW = W*(1-pad*2), slot = availW/N;
    const bw = Math.max(1.5, slot*0.60), startX = W*pad;
    const cy = H*0.50, maxH = H*0.47;

    function frame() {
      ctx.clearRect(0,0,W,H);
      const bg = ctx.createRadialGradient(W*.5,H*.28,0,W*.5,H*.4,W*.9);
      bg.addColorStop(0,'#180e00'); bg.addColorStop(1,'#020208');
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
      drawChiclets(ctx, W, H, 'rgba(200,140,0,0.07)');

      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(startX,cy); ctx.lineTo(startX+availW,cy); ctx.stroke();

      P.forEach((h, i) => {
        const scale = getFingerWaveScale(i);
        const halfH = Math.max(1.5, h * maxH * scale);
        const x = startX + i*slot, r = Math.min(bw/2, 2.5);

        const gu = ctx.createLinearGradient(x,cy,x,cy-halfH);
        gu.addColorStop(0.0,'#1e0c0022'); gu.addColorStop(0.35,'#e09800cc'); gu.addColorStop(1.0,'#ffe880');
        if (h > 0.35) { ctx.shadowColor = 'rgba(240,170,0,0.42)'; ctx.shadowBlur = bw*1.0; }
        ctx.fillStyle = gu; ctx.beginPath();
        if (halfH > r*2) {
          ctx.moveTo(x,cy); ctx.lineTo(x,cy-halfH+r); ctx.arc(x+r,cy-halfH+r,r,Math.PI,0); ctx.lineTo(x+bw,cy);
        } else { ctx.rect(x,cy-halfH,bw,halfH); }
        ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;

        const reflH = halfH * 0.82;
        const gd = ctx.createLinearGradient(x,cy,x,cy+reflH);
        gd.addColorStop(0.0,'#1e0c0033'); gd.addColorStop(0.4,'#e0980088'); gd.addColorStop(1.0,'#ffe880aa');
        ctx.fillStyle = gd; ctx.globalAlpha = 0.62; ctx.beginPath();
        if (reflH > r*2) {
          ctx.moveTo(x,cy); ctx.lineTo(x,cy+reflH-r); ctx.arc(x+r,cy+reflH-r,r,0,Math.PI); ctx.lineTo(x+bw,cy);
        } else { ctx.rect(x,cy,bw,reflH); }
        ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1.0;
      });
      requestAnimationFrame(frame);
    }
    frame();
  }

  // Run on page load and on mdbook navigation
  function init() {
    makeIcon('nymbleIcon');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on mdbook page navigation (SPA-style)
  const observer = new MutationObserver(function() {
    if (document.getElementById('nymbleIcon')) {
      init();
    }
  });
  const content = document.getElementById('content');
  if (content) {
    observer.observe(content, { childList: true, subtree: true });
  }
})();
