// ═══════════════════════════════════════════════════════════════════════════
// ANIMAÇÕES DE FUNDO — SEÇÕES DE CAPACIDADES
// Todos os produtos usam o mesmo fundo #0A1530 com nós conectados e partículas
// ═══════════════════════════════════════════════════════════════════════════

var CAP_BG = '#0A1530';

// Função única de animação — mesma lógica para todos os produtos
function initCapAnimation(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var width, height;
  var nodes = [];
  var particles = [];
  var nodeCount = 25;
  var animId;

  function buildNodes() {
    nodes = [];
    for (var i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2
      });
    }
    particles = [];
  }

  function resize() {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    buildNodes();
  }

  function spawnParticle() {
    if (Math.random() > 0.98) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1.0
      });
    }
  }

  function animate() {
    // Fundo sólido — cobre tudo a cada frame
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = CAP_BG;
    ctx.fillRect(0, 0, width, height);

    // Conexões entre nós
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      node.x += node.vx;
      node.y += node.vy;
      node.pulse += 0.02;
      if (node.x < 0 || node.x > width)  node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      for (var j = i + 1; j < nodes.length; j++) {
        var other = nodes[j];
        var dx = other.x - node.x;
        var dy = other.y - node.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          var alpha = (1 - dist / 150) * 0.3;
          ctx.strokeStyle = 'rgba(189,160,126,' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    }

    // Nós com pulso dourado
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var pulseSize = Math.sin(node.pulse) * 0.5 + 1.5;
      var a = 0.6 + Math.sin(node.pulse) * 0.3;
      ctx.fillStyle = 'rgba(189,160,126,' + a + ')';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Partículas flutuantes brancas
    spawnParticle();
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.01;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.fillStyle = 'rgba(255,255,255,' + (p.life * 0.6) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    animId = requestAnimationFrame(animate);
  }

  resize();
  animate();

  window.addEventListener('resize', function () {
    cancelAnimationFrame(animId);
    resize();
    animate();
  });
}

// ═════ Inicialização — mesma animação para todos os três produtos ═════
document.addEventListener('DOMContentLoaded', function () {
  initCapAnimation('hyperCapCanvas');
  initCapAnimation('boardCapCanvas');
  initCapAnimation('nocCapCanvas');
});
