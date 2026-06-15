const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector(".theme-label");
const progress = document.querySelector(".scroll-progress");
const cursorGlow = document.querySelector(".cursor-glow");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const siteHeader = document.querySelector(".site-header");
const liquidHero = document.querySelector("[data-liquid-hero]");
const liquidCanvas = document.querySelector("[data-liquid-canvas]");
const liquidCards = Array.from(document.querySelectorAll("[data-liquid-card]"));

const lenses = {
  stakeholder: {
    kicker: "Alignment first",
    title: "Menjadikan diskusi lebih konkret.",
    body:
      "Saya membantu stakeholder mengubah asumsi, target, dan constraint menjadi keputusan desain yang dapat diuji, bukan hanya opini yang saling tarik."
  },
  user: {
    kicker: "User signal",
    title: "Mendengar kebutuhan sebelum memoles solusi.",
    body:
      "Saya menggali konteks, kebiasaan, friksi, dan bahasa pengguna agar solusi yang dibuat terasa relevan di situasi nyata."
  },
  product: {
    kicker: "Buildable outcome",
    title: "Menjaga desain tetap indah, jelas, dan bisa dikirim.",
    body:
      "Saya menyeimbangkan desirability, feasibility, dan business value lewat flow, prototype, design system, serta handoff yang rapi."
  }
};

const savedTheme = localStorage.getItem("portfolio-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (prefersDark ? "dark" : "light"));
initLiquidHeader();

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  localStorage.setItem("portfolio-theme", nextTheme);
});

function setTheme(theme) {
  root.dataset.theme = theme;
  if (themeLabel) {
    themeLabel.textContent = theme === "dark" ? "Light" : "Dark";
  }
}

function initLiquidHeader() {
  siteHeader?.addEventListener("pointermove", (event) => {
    const rect = siteHeader.getBoundingClientRect();
    siteHeader.style.setProperty("--header-glow-x", `${event.clientX - rect.left}px`);
    siteHeader.style.setProperty("--header-glow-y", `${event.clientY - rect.top}px`);
  });

  if (!liquidHero || !liquidCanvas) return;

  const context = liquidCanvas.getContext("2d");
  if (!context) return;

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = 0;

  const resize = () => {
    const rect = liquidHero.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    liquidCanvas.width = Math.floor(width * pixelRatio);
    liquidCanvas.height = Math.floor(height * pixelRatio);
    liquidCanvas.style.width = `${width}px`;
    liquidCanvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const updatePointer = (event) => {
    const rect = liquidHero.getBoundingClientRect();
    target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    liquidCards.forEach((card, index) => {
      const depth = index === 0 ? 10 : -12;
      card.style.transform = `translate(${target.x * depth}px, ${target.y * 8}px)`;
    });
  };

  const leavePointer = () => {
    target.x = 0;
    target.y = 0;
    liquidCards.forEach((card) => {
      card.style.transform = "";
    });
  };

  const drawStars = (time) => {
    context.save();
    context.globalAlpha = 0.42;
    for (let i = 0; i < 42; i += 1) {
      const x = (i * 137.5 + Math.sin(time * 0.00042 + i) * 28) % width;
      const y = (i * 71.3 + Math.cos(time * 0.00036 + i) * 20) % (height * 0.72);
      const size = i % 7 === 0 ? 1.8 : 0.9;
      context.fillStyle = i % 5 === 0 ? "rgba(242, 201, 76, 0.78)" : "rgba(255, 255, 255, 0.72)";
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  };

  const drawLiquidBlob = ({ cx, cy, radius, scaleX, scaleY, time, alpha, hueShift }) => {
    const steps = 190;

    context.save();
    context.translate(cx, cy);
    context.scale(scaleX, scaleY);
    context.beginPath();

    for (let i = 0; i <= steps; i += 1) {
      const angle = (i / steps) * Math.PI * 2;
      const ripple =
        Math.sin(angle * 2.4 + time * 1.08 + hueShift) * 0.16 +
        Math.sin(angle * 4.7 - time * 1.42) * 0.09 +
        Math.cos(angle * 7.2 + time * 0.64 + pointer.x * 2.2) * 0.045;
      const currentRadius = radius * (1 + ripple);
      const x = Math.cos(angle) * currentRadius;
      const y = Math.sin(angle) * currentRadius;
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.closePath();

    const fill = context.createRadialGradient(
      -radius * (0.34 + Math.sin(time * 0.42) * 0.08),
      -radius * (0.46 + Math.cos(time * 0.36) * 0.06),
      radius * 0.05,
      radius * Math.sin(time * 0.18) * 0.12,
      radius * Math.cos(time * 0.16) * 0.08,
      radius * 1.18
    );
    fill.addColorStop(0, `rgba(246, 215, 122, ${0.88 * alpha})`);
    fill.addColorStop(0.2, `rgba(93, 212, 196, ${0.9 * alpha})`);
    fill.addColorStop(0.48, `rgba(104, 92, 214, ${0.82 * alpha})`);
    fill.addColorStop(0.76, `rgba(231, 111, 81, ${0.62 * alpha})`);
    fill.addColorStop(1, `rgba(20, 25, 45, ${0.1 * alpha})`);

    context.shadowColor = `rgba(93, 212, 196, ${0.46 * alpha})`;
    context.shadowBlur = 42;
    context.fillStyle = fill;
    context.fill();

    context.globalCompositeOperation = "screen";
    context.lineWidth = 1.4;
    for (let layer = 0; layer < 7; layer += 1) {
      context.beginPath();
      const yOffset = -radius * 0.42 + layer * radius * 0.14;
      for (let i = 0; i <= steps; i += 1) {
        const progressRatio = i / steps;
        const x = -radius * 0.86 + progressRatio * radius * 1.72;
        const wave =
          Math.sin(progressRatio * Math.PI * (2.6 + layer * 0.08) + time * (1.05 + layer * 0.11)) *
            radius *
            0.052 +
          Math.cos(progressRatio * Math.PI * 4 - time * 0.72 + layer) * radius * 0.018;
        const y = yOffset + wave;
        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      context.strokeStyle =
        layer % 2 === 0
          ? `rgba(255, 255, 255, ${0.34 * alpha})`
          : `rgba(93, 212, 196, ${0.38 * alpha})`;
      context.stroke();
    }

    context.restore();
  };

  const drawLiquid = (time) => {
    const t = time * 0.001;
    pointer.x += (target.x - pointer.x) * 0.045;
    pointer.y += (target.y - pointer.y) * 0.045;

    context.clearRect(0, 0, width, height);
    drawStars(time);

    const cx = width * (0.5 + pointer.x * 0.04 + Math.sin(t * 0.28) * 0.02);
    const cy = height * (0.65 + pointer.y * 0.04 + Math.cos(t * 0.24) * 0.018);
    const radius = Math.min(width * 0.34, height * 0.36);

    drawLiquidBlob({
      cx,
      cy,
      radius,
      scaleX: 1.08,
      scaleY: 0.86,
      time: t,
      alpha: 1,
      hueShift: 0
    });

    drawLiquidBlob({
      cx: cx + Math.sin(t * 0.42) * radius * 0.2,
      cy: cy - radius * 0.22 + Math.cos(t * 0.36) * radius * 0.1,
      radius: radius * 0.5,
      scaleX: 1.1,
      scaleY: 0.78,
      time: t + 1.7,
      alpha: 0.48,
      hueShift: 2.4
    });

    context.save();
    context.globalCompositeOperation = "screen";
    const sheen = context.createLinearGradient(0, height * 0.28, width, height * 0.9);
    sheen.addColorStop(0, "rgba(255, 255, 255, 0)");
    sheen.addColorStop((Math.sin(t * 0.4) + 1) * 0.34, "rgba(255, 255, 255, 0.12)");
    sheen.addColorStop(1, "rgba(93, 212, 196, 0)");
    context.fillStyle = sheen;
    context.fillRect(0, 0, width, height);
    context.restore();

    animationFrame = window.requestAnimationFrame(drawLiquid);
  };

  resize();
  window.addEventListener("resize", resize);
  liquidHero.addEventListener("pointermove", updatePointer);
  liquidHero.addEventListener("pointerleave", leavePointer);
  drawLiquid(0);

}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll("[data-reveal]").forEach((element) => {
  revealObserver.observe(element);
});

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const percent = height > 0 ? (scrollTop / height) * 100 : 0;
  progress.style.width = `${percent}%`;
  setActiveNav();
});

function setActiveNav() {
  const current = navLinks
    .map((link) => {
      const target = document.querySelector(link.getAttribute("href"));
      return target ? { link, top: target.getBoundingClientRect().top } : null;
    })
    .filter(Boolean)
    .reverse()
    .find((item) => item.top <= 140);

  navLinks.forEach((link) => link.classList.toggle("is-active", current?.link === link));
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-selected", item === button ? "true" : "false");
    });

    document.querySelectorAll(".case-card").forEach((card) => {
      const categories = card.dataset.category || "";
      const shouldShow = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

document.querySelectorAll(".lens-tab").forEach((button) => {
  button.addEventListener("click", () => {
    const content = document.querySelector("[data-lens-content]");
    const lens = lenses[button.dataset.lens];
    if (!content || !lens) return;

    document.querySelectorAll(".lens-tab").forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-selected", item === button ? "true" : "false");
    });

    content.classList.add("is-changing");
    window.setTimeout(() => {
      content.innerHTML = `
        <p class="lens-kicker">${lens.kicker}</p>
        <h3>${lens.title}</h3>
        <p>${lens.body}</p>
      `;
      content.classList.remove("is-changing");
    }, 180);
  });
});

document.querySelectorAll("[data-process]").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll("[data-process]").forEach((process) => {
      process.classList.toggle("is-open", process === item);
    });
  });
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.querySelectorAll(".magnetic").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.08}px, ${y * 0.14}px)`;
  });

  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

document.querySelector("[data-copy]")?.addEventListener("click", async (event) => {
  const email = event.currentTarget.dataset.copy;
  const feedback = document.querySelector("[data-copy-feedback]");

  try {
    await navigator.clipboard.writeText(email);
    feedback.textContent = "Email berhasil disalin.";
  } catch {
    feedback.textContent = email;
  }

  window.setTimeout(() => {
    feedback.textContent = "";
  }, 2400);
});

window.addEventListener("pointermove", (event) => {
  if (!cursorGlow || window.matchMedia("(pointer: coarse)").matches) return;
  cursorGlow.style.opacity = "1";
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

setActiveNav();
