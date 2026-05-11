async function loadData() {
  const servicesGrid = document.getElementById("servicesGrid");
  const newsList = document.getElementById("newsList");

  try {
    const response = await fetch("data.json?time=" + Date.now());

    if (!response.ok) {
      throw new Error("Не удалось загрузить data.json");
    }

    const data = await response.json();

    renderGlobalStatus(data.globalStatus);
    renderServices(data.services || []);
    renderNews(data.news || []);
  } catch (error) {
    console.error(error);

    servicesGrid.innerHTML = `
      <div class="error-state">
        Не удалось загрузить список сервисов.
      </div>
    `;

    newsList.innerHTML = `
      <div class="error-state">
        Не удалось загрузить новости. Попробуйте обновить страницу позже.
      </div>
    `;

    document.getElementById("globalStatusChip").textContent = "Ошибка";
    document.getElementById("globalStatusChip").className = "status-chip error";
    document.getElementById("globalStatusTitle").textContent = "Не удалось загрузить статус";
    document.getElementById("globalStatusText").textContent = "Проверьте файл data.json или локальный сервер.";
    document.getElementById("globalUpdatedAt").textContent = "—";
  }
}

function renderGlobalStatus(status) {
  const chip = document.getElementById("globalStatusChip");
  const updatedAt = document.getElementById("globalUpdatedAt");
  const title = document.getElementById("globalStatusTitle");
  const text = document.getElementById("globalStatusText");

  chip.textContent = status.label || "Статус";
  chip.className = `status-chip ${status.type || "info"}`;

  updatedAt.textContent = status.updatedAt || "—";
  title.textContent = status.title || "Нет данных";
  text.textContent = status.text || "";
}

function renderServices(services) {
  const servicesGrid = document.getElementById("servicesGrid");

  if (!services.length) {
    servicesGrid.innerHTML = `
      <div class="empty-state">
        Список сервисов пока пуст.
      </div>
    `;
    return;
  }

  servicesGrid.innerHTML = services.map(service => `
    <article class="service-card">
      <div class="service-top">
        <div>
          <h3 class="service-name">${escapeHtml(service.name)}</h3>
          <p class="service-note">${escapeHtml(service.description)}</p>
        </div>

        <span class="service-badge ${service.status}">
          ${escapeHtml(service.statusText)}
        </span>
      </div>
    </article>
  `).join("");
}

function renderNews(news) {
  const newsList = document.getElementById("newsList");

  if (!news.length) {
    newsList.innerHTML = `
      <div class="empty-state">
        Новостей пока нет.
      </div>
    `;
    return;
  }

  newsList.innerHTML = news.map(item => `
    <article class="news-card ${item.type}">
      <div class="news-meta">
        <span class="news-tag">${escapeHtml(getTypeLabel(item.type))}</span>
        <time>${escapeHtml(item.date)}</time>
      </div>

      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
}

function getTypeLabel(type) {
  const labels = {
    ok: "Работает",
    warning: "Внимание",
    error: "Сбой",
    info: "Инфо"
  };

  return labels[type] || "Инфо";
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("refreshBtn").addEventListener("click", loadData);

loadData();

/* =========================
   PARTICLES / DROPLETS
========================= */

const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let width = 0;
let height = 0;
let deviceRatio = Math.min(window.devicePixelRatio || 1, 2);
let mouse = {
  x: null,
  y: null
};

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * deviceRatio);
  canvas.height = Math.floor(height * deviceRatio);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);

  createParticles();
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticles() {
  const baseCount = width < 700 ? 42 : 78;
  particles = [];

  for (let i = 0; i < baseCount; i++) {
    particles.push(createParticle(true));
  }
}

function createParticle(randomPosition = false) {
  const fromWaveZone = Math.random() > 0.35;

  const x = fromWaveZone
    ? randomBetween(width * 0.48, width * 1.05)
    : randomBetween(0, width);

  const y = randomPosition
    ? randomBetween(0, height)
    : randomBetween(height * 0.55, height * 1.1);

  const isRed = Math.random() > 0.72;
  const isBig = Math.random() > 0.82;

  return {
    x,
    y,
    vx: randomBetween(-0.45, 0.25),
    vy: randomBetween(-1.45, -0.35),
    radius: isBig ? randomBetween(2.2, 4.2) : randomBetween(0.9, 2.4),
    alpha: randomBetween(0.12, 0.55),
    alphaSpeed: randomBetween(0.002, 0.008),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.015, 0.015),
    color: isRed ? "red" : "white",
    drift: randomBetween(0.002, 0.008),
    life: randomBetween(0, 1000)
  };
}

function resetParticle(particle) {
  const next = createParticle(false);

  particle.x = next.x;
  particle.y = next.y;
  particle.vx = next.vx;
  particle.vy = next.vy;
  particle.radius = next.radius;
  particle.alpha = next.alpha;
  particle.alphaSpeed = next.alphaSpeed;
  particle.rotation = next.rotation;
  particle.rotationSpeed = next.rotationSpeed;
  particle.color = next.color;
  particle.drift = next.drift;
  particle.life = next.life;
}

function drawDroplet(particle) {
  ctx.save();

  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);

  const gradient = ctx.createRadialGradient(
    0,
    0,
    0,
    0,
    0,
    particle.radius * 4
  );

  if (particle.color === "red") {
    gradient.addColorStop(0, `rgba(255, 48, 79, ${particle.alpha})`);
    gradient.addColorStop(0.45, `rgba(214, 0, 28, ${particle.alpha * 0.42})`);
    gradient.addColorStop(1, "rgba(214, 0, 28, 0)");
  } else {
    gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.alpha})`);
    gradient.addColorStop(0.45, `rgba(255, 255, 255, ${particle.alpha * 0.28})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  }

  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    particle.radius * 1.15,
    particle.radius * 2.2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

function drawParticleLinks() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 95) {
        const opacity = (1 - distance / 95) * 0.075;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255, 48, 79, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);

  drawParticleLinks();

  particles.forEach((particle) => {
    particle.life += 1;

    const wave = Math.sin(particle.life * particle.drift) * 0.35;

    particle.x += particle.vx + wave;
    particle.y += particle.vy;
    particle.rotation += particle.rotationSpeed;

    particle.alpha += Math.sin(particle.life * particle.alphaSpeed) * 0.006;
    particle.alpha = Math.max(0.08, Math.min(particle.alpha, 0.62));

    if (mouse.x !== null && mouse.y !== null) {
      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance < 120) {
        const force = (120 - distance) / 120;
        particle.x += (dx / distance) * force * 1.4;
        particle.y += (dy / distance) * force * 1.4;
      }
    }

    if (
      particle.y < -40 ||
      particle.x < -80 ||
      particle.x > width + 80
    ) {
      resetParticle(particle);
    }

    drawDroplet(particle);
  });

  requestAnimationFrame(animateParticles);
}

window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

resizeCanvas();
animateParticles();
