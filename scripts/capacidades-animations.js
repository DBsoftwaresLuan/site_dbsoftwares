// ═══════════════════════════════════════════════════════════════════════════
// ANIMAÇÕES DE FUNDO TECNOLÓGICO PARA SEÇÕES DE CAPACIDADES
// Cada produto tem sua própria animação personalizada
// ═══════════════════════════════════════════════════════════════════════════

// ═════ DB HYPER — Fluxo de nós conectados com partículas ═════
function initHyperCapAnimation() {
  const canvas = document.getElementById('hyperCapCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.offsetWidth;
  let height = canvas.offsetHeight;
  canvas.width = width;
  canvas.height = height;

  // Nós do fluxo
  const nodes = [];
  const nodeCount = 25;
  const connections = [];

  // Criar nós
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2
    });
  }

  // Partículas que fluem
  const particles = [];
  
  function createParticle() {
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
    ctx.fillStyle = 'rgba(10, 21, 48, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // Atualizar e desenhar nós
    nodes.forEach((node, i) => {
      node.x += node.vx;
      node.y += node.vy;
      node.pulse += 0.02;

      // Manter dentro dos limites
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      // Desenhar conexões
      nodes.forEach((otherNode, j) => {
        if (i !== j) {
          const dx = otherNode.x - node.x;
          const dy = otherNode.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.3;
            ctx.strokeStyle = `rgba(189, 160, 126, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        }
      });

      // Desenhar nó com pulso
      const pulseSize = Math.sin(node.pulse) * 0.5 + 1.5;
      ctx.fillStyle = `rgba(189, 160, 126, ${0.6 + Math.sin(node.pulse) * 0.3})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2);
      ctx.fill();
    });

    // Criar e atualizar partículas
    createParticle();
    particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.01;

      if (p.life <= 0) {
        particles.splice(index, 1);
        return;
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();

  // Resize
  window.addEventListener('resize', () => {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  });
}

// ═════ DB BOARD — Grades de dados com pulsos de indicadores ═════
function initBoardCapAnimation() {
  const canvas = document.getElementById('boardCapCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.offsetWidth;
  let height = canvas.offsetHeight;
  canvas.width = width;
  canvas.height = height;

  // Grades de células de dados
  const gridSize = 60;
  const cells = [];
  
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      cells.push({
        x: x * gridSize,
        y: y * gridSize,
        pulse: Math.random() * 100,
        active: Math.random() > 0.7
      });
    }
  }

  // Indicadores que pulsam
  const indicators = [];
  
  function createIndicator() {
    if (Math.random() > 0.985) {
      const cell = cells[Math.floor(Math.random() * cells.length)];
      indicators.push({
        x: cell.x + gridSize / 2,
        y: cell.y + gridSize / 2,
        radius: 2,
        maxRadius: 30,
        alpha: 1.0
      });
    }
  }

  function animate() {
    ctx.fillStyle = 'rgba(10, 21, 48, 0.08)';
    ctx.fillRect(0, 0, width, height);

    // Desenhar grade de fundo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Células ativas
    cells.forEach(cell => {
      cell.pulse += 0.5;
      if (cell.pulse > 100) cell.pulse = 0;

      if (cell.active) {
        const alpha = Math.sin((cell.pulse / 100) * Math.PI) * 0.15;
        ctx.fillStyle = `rgba(189, 160, 126, ${alpha})`;
        ctx.fillRect(cell.x + 2, cell.y + 2, gridSize - 4, gridSize - 4);
      }
    });

    // Criar e animar indicadores
    createIndicator();
    indicators.forEach((ind, index) => {
      ind.radius += 0.5;
      ind.alpha -= 0.015;

      if (ind.alpha <= 0 || ind.radius >= ind.maxRadius) {
        indicators.splice(index, 1);
        return;
      }

      // Círculo externo
      ctx.strokeStyle = `rgba(189, 160, 126, ${ind.alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ind.x, ind.y, ind.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Ponto central
      ctx.fillStyle = `rgba(189, 160, 126, ${ind.alpha})`;
      ctx.beginPath();
      ctx.arc(ind.x, ind.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  });
}

// ═════ DB NOC — Ondas de heartbeat e radar de monitoramento ═════
function initNocCapAnimation() {
  const canvas = document.getElementById('nocCapCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.offsetWidth;
  let height = canvas.offsetHeight;
  canvas.width = width;
  canvas.height = height;

  // Ondas de radar circulares
  const radarWaves = [];
  
  function createRadarWave() {
    if (Math.random() > 0.97) {
      radarWaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0,
        maxRadius: 200,
        alpha: 1.0
      });
    }
  }

  // Linhas de heartbeat
  const heartbeatLines = [];
  const lineCount = 8;

  for (let i = 0; i < lineCount; i++) {
    heartbeatLines.push({
      y: (height / lineCount) * i + height / (lineCount * 2),
      points: [],
      speed: 1.5 + Math.random() * 0.5,
      phase: Math.random() * 100
    });
  }

  function generateHeartbeatPoints(line) {
    const points = [];
    for (let x = 0; x <= width; x += 8) {
      const baseY = line.y;
      let y = baseY;

      // Criar padrão de heartbeat
      const cycle = ((x + line.phase) % 200) / 200;
      if (cycle > 0.1 && cycle < 0.15) {
        y = baseY - 15; // Subida rápida
      } else if (cycle > 0.15 && cycle < 0.22) {
        y = baseY + 20; // Descida profunda
      } else if (cycle > 0.22 && cycle < 0.27) {
        y = baseY - 8; // Subida menor
      }

      points.push({ x, y });
    }
    return points;
  }

  function animate() {
    ctx.fillStyle = 'rgba(10, 21, 48, 0.06)';
    ctx.fillRect(0, 0, width, height);

    // Ondas de radar
    createRadarWave();
    radarWaves.forEach((wave, index) => {
      wave.radius += 2;
      wave.alpha -= 0.008;

      if (wave.alpha <= 0 || wave.radius >= wave.maxRadius) {
        radarWaves.splice(index, 1);
        return;
      }

      // Círculo de radar
      ctx.strokeStyle = `rgba(189, 160, 126, ${wave.alpha * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Círculo interno
      if (wave.radius > 10) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${wave.alpha * 0.2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius - 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Linhas de heartbeat
    heartbeatLines.forEach(line => {
      line.phase += line.speed;
      if (line.phase > 200) line.phase = 0;

      const points = generateHeartbeatPoints(line);

      ctx.strokeStyle = 'rgba(189, 160, 126, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();

      // Linha de base fraca
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, line.y);
      ctx.lineTo(width, line.y);
      ctx.stroke();
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  });
}

// ═════ Inicialização ═════
document.addEventListener('DOMContentLoaded', () => {
  initHyperCapAnimation();
  initBoardCapAnimation();
  initNocCapAnimation();
});
