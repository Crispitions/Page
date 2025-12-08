// Canvas logo (flame)
(function initLogoCanvas() {
  const canvas = document.getElementById("c");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.scale(3, -3);
  ctx.translate(-1.5, -13);

  let fps = 7;
  let interval = 1000 / fps;
  let prev = Date.now();

  const y = [2, 1, 0, 0, 0, 0, 1, 2];
  const max = [7, 9, 11, 13, 13, 11, 9, 7];
  const min = [4, 7, 8, 10, 10, 8, 7, 4];

  function flame() {
    const now = Date.now();
    const dif = now - prev;
    if (dif > interval) {
      prev = now;
      ctx.clearRect(-10, -10, 100, 100);

      ctx.strokeStyle = "#d14234";
      ctx.lineWidth = 0.4;
      let i = 0;
      for (let x = 4; x < 12; x++) {
        const a = Math.random() * (max[i] - min[i] + 1) + min[i];
        ctx.beginPath();
        ctx.moveTo(x + 0.5, y[i++]);
        ctx.lineTo(x + 0.5, a);
        ctx.stroke();
      }

      ctx.strokeStyle = "#f2a55f";
      let j = 1;
      for (let x = 5; x < 11; x++) {
        const a = Math.random() * (max[j] - 5 - (min[j] - 5) + 1) + (min[j] - 5);
        ctx.beginPath();
        ctx.moveTo(x + 0.5, y[j++] + 1);
        ctx.lineTo(x + 0.5, a);
        ctx.stroke();
      }

      ctx.strokeStyle = "#e8dec5";
      let k = 3;
      for (let x = 7; x < 9; x++) {
        const a = Math.random() * (max[k] - 9 - (min[k] - 9) + 1) + (min[k] - 9);
        ctx.beginPath();
        ctx.moveTo(x + 0.5, y[k++]);
        ctx.lineTo(x + 0.5, a);
        ctx.stroke();
      }
    }
    window.requestAnimationFrame(flame);
  }
  flame();
})();

console.log("Mi página con Neovim 🚀");

// Menú desplegable
const menuToggle = document.getElementById('menuToggle');
const menuDropdown = document.getElementById('menuDropdown');
const navWrapper = document.querySelector('.nav-wrapper');

function openMenu() {
  if (!menuDropdown) return;
  menuDropdown.classList.remove('closing');
  menuDropdown.classList.add('active');
  if (menuToggle) {
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
  }
}

function closeMenuAnimated() {
  if (!menuDropdown) return;
  if (!menuDropdown.classList.contains('active') && !menuDropdown.classList.contains('closing')) return;
  menuDropdown.classList.add('closing');
  menuDropdown.classList.remove('active');
  const onTransitionEnd = (e) => {
    if (e.propertyName === 'opacity') {
      menuDropdown.classList.remove('closing');
      menuDropdown.removeEventListener('transitionend', onTransitionEnd);
    }
  };
  menuDropdown.addEventListener('transitionend', onTransitionEnd);
  if (menuToggle) {
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
}

if (menuToggle) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menuDropdown.classList.contains('active')) {
      closeMenuAnimated();
    } else {
      openMenu();
    }
  });
}

const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeMenuAnimated();
  });
});

document.addEventListener('click', (e) => {
  if (!navWrapper) return;
  if (!navWrapper.contains(e.target)) {
    closeMenuAnimated();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenuAnimated();
  }
});

// Pixel Background Animation
// Pixel Background Animation (DOM based)
const pixelContainer = document.getElementById('pixel-container');

function createPixels() {
  if (!pixelContainer) return;

  // Clear existing pixels
  pixelContainer.innerHTML = '';

  // Calculate number of pixels
  // CSS width is 1.5%.
  // 100 / 1.5 = 66.666...
  // Since elements float, if they exceed 100%, they wrap.
  // 67 * 1.5 = 100.5% -> Wraps.
  // So we effectively have 66 columns.
  // Optimize for mobile: Increase pixel size to reduce DOM count
  const isMobile = window.innerWidth < 768;
  const sizePercent = isMobile ? 0.04 : 0.015; // 4% on mobile, 1.5% on desktop
  const cols = Math.floor(100 / (sizePercent * 100));
  const pixelSize = window.innerWidth * sizePercent;
  const rows = Math.ceil(window.innerHeight / pixelSize);
  const totalPixels = cols * rows;

  const fragment = document.createDocumentFragment();
  const pixels = []; // Store references for interaction

  for (let i = 0; i < totalPixels; i++) {
    const div = document.createElement('div');
    div.classList.add('pixel');
    div.style.width = sizePercent * 100 + "%";
    div.style.paddingTop = sizePercent * 100 + "%";

    // Randomize animation delay
    div.style.animationDelay = Math.ceil(Math.random() * 5000) + "ms";

    // Optional: Randomize colors slightly for texture
    const randomVal = Math.random();
    if (randomVal > 0.95) {
      div.style.background = 'var(--accent-1)';
      div.style.opacity = '0.1';
    } else if (randomVal > 0.9) {
      div.style.background = 'var(--accent-2)';
      div.style.opacity = '0.1';
    }

    // Store coordinate data for interaction
    // i = y * cols + x
    // x = i % cols
    // y = Math.floor(i / cols)
    div.dataset.index = i;

    fragment.appendChild(div);
    pixels.push(div);
  }

  pixelContainer.appendChild(fragment);

  // Cursor Interaction
  let mouseX = -1000;
  let mouseY = -1000;

  // Throttle mousemove for performance
  let isTicking = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updatePixels(mouseX, mouseY, cols, pixelSize, pixels);
        isTicking = false;
      });
      isTicking = true;
    }
  });
}

function updatePixels(mx, my, cols, size, pixels) {
  // Calculate grid coordinates of mouse
  const gx = Math.floor(mx / size);
  const gy = Math.floor(my / size);

  // Define radius in grid cells (Reduced from 4 to 2)
  const radius = 2;

  // Reset previous active pixels?
  // Efficient way: loop through a bounding box around mouse
  // But first we need to clear "active" from everyone?
  // No, that's slow (4000+ pixels).
  // Better: Keep a list of currently active pixels and clear them.

  // Actually, let's just use a "decay" approach or just querySelectorAll('.active') to clear.
  const activePixels = pixelContainer.querySelectorAll('.active');
  activePixels.forEach(p => p.classList.remove('active'));

  // Activate new ones
  for (let y = gy - radius; y <= gy + radius; y++) {
    for (let x = gx - radius; x <= gx + radius; x++) {
      // Check bounds
      if (x < 0 || x >= cols) continue;

      // Calculate distance for circle shape
      const dx = x - gx;
      const dy = y - gy;
      if (dx * dx + dy * dy > radius * radius) continue;

      const index = y * cols + x;
      if (index >= 0 && index < pixels.length) {
        pixels[index].classList.add('active');
      }
    }
  }
}

// Re-create pixels on resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(createPixels, 200);
});

// Initial creation
createPixels();

// Pixel Art Text Rendering
const fontMap = {
  'A': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  'B': [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
  'C': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  'D': [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
  'E': [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  'F': [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  'G': [0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  'H': [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  'I': [0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
  'J': [0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0],
  'K': [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
  'L': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  'M': [1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  'N': [1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  'O': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  'P': [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  'Q': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1],
  'R': [1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
  'S': [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
  'T': [1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  'U': [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  'V': [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
  'W': [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  'X': [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
  'Y': [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  'Z': [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  ' ': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  '1': [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
  '2': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1],
  '3': [1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1],
  '4': [0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  '5': [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  '6': [0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  '7': [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
  '8': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  '9': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  '0': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  '&': [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1]
};

function renderPixelText(container, text, options = {}) {
  container.innerHTML = '';

  for (let char of text) {
    if (!fontMap[char]) continue;

    const letterContainer = document.createElement('div');
    letterContainer.classList.add('pixel-letter');

    fontMap[char].forEach((bit, index) => {
      const dot = document.createElement('div');
      const dotClass = options.dotClass || 'pixel-text-dot';
      dot.classList.add(dotClass);

      if (bit === 1) {
        dot.classList.add('filled');
        if (options.animated) {
          dot.classList.add('animate-in');
          dot.style.animationDelay = `${Math.random() * 0.5}s`;
        }
      }
      letterContainer.appendChild(dot);
    });

    container.appendChild(letterContainer);
  }
}

// Render Main Header
const pixelHeader = document.getElementById('pixel-header');
if (pixelHeader) {
  renderPixelText(pixelHeader, "CRISPITIONSS", { animated: true, dotClass: 'pixel-text-dot' });
}

// Render Navbar Logo
const pixelNavLogo = document.getElementById('pixel-nav-logo');
if (pixelNavLogo) {
  renderPixelText(pixelNavLogo, "CRISPITIONSS", { animated: false, dotClass: 'pixel-nav-dot' });
}

// Hacker Effect for Subtitle
const subtitle = document.querySelector(".hero-subtitle");

if (subtitle) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let interval = null;

  subtitle.onmouseover = event => {
    let iteration = 0;

    clearInterval(interval);

    interval = setInterval(() => {
      event.target.innerText = event.target.innerText
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return event.target.dataset.value[index];
          }

          return letters[Math.floor(Math.random() * letters.length)]
        })
        .join("");

      if (iteration >= event.target.dataset.value.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);
  }
}

// LANGUAGE SWITCHER
const translations = {
  es: {
    nav_projects: "Proyectos",
    nav_about: "Sobre mí",
    nav_academic: "Académico",
    nav_services: "Servicios",
    nav_contact: "Contacto",
    hero_subtitle: "Matemático | Gamer | Científico de Datos",
    projects_title: "🚀 Proyectos Personales",
    projects_desc: "Explora mis proyectos de código abierto, experimentos con IA y herramientas de datos.",
    project_ai_agent_title: "Agente de IA para Visualización de Datos",
    project_ai_agent_desc: "Agente inteligente que analiza bases de datos y genera visualizaciones automáticamente usando LangGraph y Gemini.",
    project_ai_agent_stack: "Stack: Python, LangGraph, Gemini API",
    project_ai_agent_link: "Ver Código",
    about_title: "👨‍💻 Sobre mí",
    about_desc: "Matemático y Científico de Datos especializado en análisis geoespacial, machine learning y estrategias de crecimiento. Experto en Python, SQL y procesamiento de datos complejos.",
    profile_summary: "Matemático y Científico de Datos con experiencia en análisis de datos médicos, clasificación basada en MRI, modelado estadístico e investigación científica. He trabajado como Asistente de Investigación en la Universidad El Bosque, contribuyendo a proyectos interdisciplinarios en neurología, epidemiología ambiental y salud pública.",
    about_download_cv: "📄 Descargar CV (PDF)",
    read_more: "Leer más",
    skills_title: "Habilidades",
    skills_math: "Matemáticas avanzadas",
    skills_data: "Análisis de datos",
    skills_prog: "Programación (Python, JavaScript)",
    skills_content: "Creación de contenido",
    skills_game: "Game Design",
    academic_title: "🎓 Académico & Profesional",
    timeline_math_title: "Carrera: Matemáticas",
    timeline_math_desc: "Formación en análisis matemático y teoría computacional. Especialización en matemáticas aplicadas.",
    timeline_exp_title: "Experiencia Profesional",
    timeline_exp_desc: "Analista de datos y desarrollador de soluciones tecnológicas en empresas del sector tech.",
    timeline_cert_title: "Certificaciones",
    timeline_cert_desc: "Certificado en programación científica y análisis de datos avanzado.",
    contact_title: "📧 Contacto",
    contact_desc: "¡Ponte en contacto conmigo! Me encantaría colaborar contigo.",
    contact_email_label: "Email:",
    contact_linkedin_label: "LinkedIn:",
    contact_github_label: "GitHub:",
    contact_follow_label: "Sígueme en:",
    footer_copyright: "© 2025 CRISPITIONSS",

    // CV - Research
    research_title: "Experiencia de Investigación",
    res_assistant_title: "Asistente de Investigación",
    res_assistant_desc: "Procesamiento y análisis de datasets satelitales de la NASA (calidad del aire, temperatura) para identificar correlaciones con salud pública.",
    res_assistant_ach1: "Uso de Python, GeoPandas y APIs espaciales para pipelines geoespaciales.",
    res_assistant_ach2: "Apoyo en investigación interdisciplinaria (salud pública, ingeniería ambiental).",
    res_assistant_ach3: "Limpieza de datos, modelado estadístico y documentación académica.",
    thesis_title: "Tesis de Pregrado",
    thesis_desc: "Construcción de un clasificador de ML para distinguir patrones de MRI asociados con Esclerosis Múltiple.",
    thesis_ach1: "Preprocesamiento de imágenes (normalización, extracción de características).",
    thesis_ach2: "Reducción de dimensionalidad y aprendizaje supervisado.",
    thesis_ach3: "Pipelines reproducibles usando librerías científicas estándar.",

    // CV - Professional
    exp_title: "Experiencia Profesional",
    job_neuro_title: "Consultor de Data Science (Neurología)",
    job_neuro_desc: "Implementación de modelos estadísticos y de ML para datasets de MRI e información clínica.",
    job_neuro_ach1: "Diseño de workflows automatizados de procesamiento de MRI (mejora del 20% en eficiencia).",
    job_neuro_ach2: "Limpieza de datos y análisis exploratorio para datasets neurológicos.",
    job_neuro_ach3: "Traducción de hallazgos analíticos en insights para soporte de decisiones médicas.",
    job_growth_title: "Growth Specialist",
    job_growth_desc: "Análisis cuantitativo para optimizar activación, retención y rendimiento del funnel.",
    job_growth_ach1: "Aumento del 'AHA moment' del 49% al 59%.",
    job_growth_ach2: "Generación de dashboards y reportes de comportamiento para decisiones estratégicas.",

    // CV - Projects
    projects_section_title: "Proyectos Científicos & Data Science",
    proj_env_title: "Proyecto Correlación Ambiental",
    proj_env_ach1: "Procesamiento de imágenes satelitales NASA y datasets geoespaciales vía APIs.",
    proj_env_ach2: "Identificación de variables ambientales asociadas con mortalidad.",
    proj_env_ach3: "Modelos geoespaciales usando Python, GeoPandas, rasterio y estadística espacial.",
    proj_student_title: "Modelado Predictivo Éxito Estudiantil",
    proj_student_ach1: "Pipelines automatizados para evaluar rendimiento académico.",
    proj_student_ach2: "Modelos predictivos que aumentaron la detección temprana de riesgo en un 30%.",
    proj_student_ach3: "Mejora de procesos de reporte e intervención mediante insights basados en datos.",

    // Services
    services_title: "🛠️ Servicios",
    services_intro: "Ofrezco soluciones personalizadas en ciencia de datos, desarrollo y consultoría.",
    service_ds_title: "Ciencia de Datos con Python y R",
    service_ds_intro: "Implementación de modelos de Machine Learning y Deep Learning avanzados para resolver problemas complejos.",
    service_analysis_title: "Análisis de Datos",
    service_analysis_intro: "Transformación de datos crudos en insights accionables mediante estadística y visualización.",
    service_ai_title: "Proyectos de IA",
    service_ai_intro: "Desarrollo de soluciones tecnológicas integrales, desde la web hasta la inteligencia artificial.",
    portfolio_title: "Portafolio & Experiencia",
    service_ds_port1: "Tesis: Clasificación de Esclerosis Múltiple usando MRI y Machine Learning.",
    service_ds_port2: "Modelos predictivos de éxito estudiantil (Diginexa) con 30% de mejora en detección de riesgo.",
    service_ds_port3: "Procesamiento de imágenes médicas y visión por computador.",
    service_analysis_port1: "Investigación NASA: Correlación de datos satelitales y salud pública.",
    service_analysis_port2: "Growth Specialist en Dataico: Optimización de funnels y retención (AHA moment +10%).",
    service_analysis_port3: "Dashboards estratégicos y reportes automatizados.",
    service_ai_port1: "Desarrollo Full Stack con Django, HTML, CSS y JavaScript.",
    service_ai_port2: "Integración de modelos de IA en aplicaciones web.",
    service_ai_port3: "Automatización de pipelines de datos y despliegue de soluciones.",
    services_cta: "¡Contáctame!",

    core_skills_title: "Habilidades Principales",
    education_title: "Educación",
    education_degree: "Matemático",
    languages_title: "Idiomas",
    lang_es: "Español (Nativo)",
    lang_en: "Inglés (B2 - Avanzado)",
    lang_fr: "Francés (A2 - Intermedio)"
  },
  en: {
    nav_projects: "Projects",
    nav_about: "About Me",
    nav_academic: "Academic",
    nav_services: "Services",
    nav_contact: "Contact",
    hero_subtitle: "Mathematician | Gamer | Data Scientist",
    projects_title: "🚀 Personal Projects",
    projects_desc: "Explore my open source projects, AI experiments, and data tools.",
    project_ai_agent_title: "AI Agent for Data Visualization",
    project_ai_agent_desc: "Intelligent agent that analyzes databases and automatically generates visualizations using LangGraph and Gemini.",
    project_ai_agent_stack: "Stack: Python, LangGraph, Gemini API",
    project_ai_agent_link: "View Code",
    about_title: "👨‍💻 About Me",
    about_desc: "Mathematician and Data Scientist specialized in geospatial analysis, machine learning and growth strategies. Expert in Python, SQL and complex data processing.",
    profile_summary: "Mathematician and Data Scientist with experience in medical data analysis, MRI-based classification, statistical modeling, and scientific research. I have worked as a Research Assistant at Universidad El Bosque, contributing to interdisciplinary projects in neurology, environmental epidemiology, and public health.",
    about_download_cv: "📄 Download CV (PDF)",
    read_more: "Read more",
    skills_title: "Skills",
    skills_math: "Advanced Mathematics",
    skills_data: "Data Analysis",
    skills_prog: "Programming (Python, JavaScript)",
    skills_content: "Content Creation",
    skills_game: "Game Design",
    academic_title: "🎓 Academic & Professional",
    timeline_math_title: "Degree: Mathematics",
    timeline_math_desc: "Training in mathematical analysis and computational theory. Specialization in applied mathematics.",
    timeline_exp_title: "Professional Experience",
    timeline_exp_desc: "Data analyst and developer of technological solutions in tech sector companies.",
    timeline_cert_title: "Certifications",
    timeline_cert_desc: "Certified in scientific programming and advanced data analysis.",
    contact_title: "📧 Contact",
    contact_desc: "Get in touch with me! I'd love to collaborate with you.",
    contact_email_label: "Email:",
    contact_linkedin_label: "LinkedIn:",
    contact_github_label: "GitHub:",
    contact_follow_label: "Follow me on:",
    footer_copyright: "© 2025 CRISPITIONSS",

    // CV - Research
    research_title: "Research Experience",
    res_assistant_title: "Research Assistant",
    res_assistant_desc: "Processed and analyzed NASA satellite datasets (temperature, air quality) to identify correlations with public health outcomes.",
    res_assistant_ach1: "Used Python, GeoPandas, and spatial APIs to build geospatial pipelines.",
    res_assistant_ach2: "Supported interdisciplinary research (public health, environmental engineering).",
    res_assistant_ach3: "Contributed to data cleaning, statistical modeling, and academic documentation.",
    thesis_title: "Undergraduate Thesis",
    thesis_desc: "Built a machine learning classifier to distinguish MRI patterns associated with Multiple Sclerosis.",
    thesis_ach1: "Performed image preprocessing (normalization, feature extraction).",
    thesis_ach2: "Applied dimensionality reduction and supervised learning techniques.",
    thesis_ach3: "Developed reproducible pipelines using standard scientific libraries.",

    // CV - Professional
    exp_title: "Professional Experience",
    job_neuro_title: "Neurology Data Science Consultant",
    job_neuro_desc: "Implemented statistical and machine learning models for MRI datasets and clinical patient information.",
    job_neuro_ach1: "Designed automated MRI-processing workflows, improving analysis efficiency by 20%.",
    job_neuro_ach2: "Conducted data cleaning and exploratory analysis for neurological datasets.",
    job_neuro_ach3: "Translated analytical findings into actionable insights for medical decision support.",
    job_growth_title: "Growth Specialist",
    job_growth_desc: "Applied quantitative analysis to optimize activation, retention, and funnel performance.",
    job_growth_ach1: "Increased onboarding AHA-moment from 49% to 59%.",
    job_growth_ach2: "Generated dashboards and behavioral reports for strategic decisions.",

    // CV - Projects
    projects_section_title: "Scientific & Data Science Projects",
    proj_env_title: "Environmental Data Correlation Project",
    proj_env_ach1: "Processed NASA satellite imagery and geospatial datasets via APIs.",
    proj_env_ach2: "Identified environmental variables associated with mortality.",
    proj_env_ach3: "Developed geospatial models using Python, GeoPandas, rasterio, and spatial statistics.",
    proj_student_title: "Student Success Predictive Modeling",
    proj_student_ach1: "Built automated pipelines to assess academic performance.",
    proj_student_ach2: "Designed predictive models that increased early detection of at-risk students by 30%.",
    proj_student_ach3: "Improved reporting and intervention processes through data-driven insights.",

    // Services
    services_title: "🛠️ Services",
    services_intro: "I offer personalized solutions in data science, development, and consulting.",
    service_ds_title: "Data Science with Python & R",
    service_ds_intro: "Implementation of advanced Machine Learning and Deep Learning models to solve complex problems.",
    service_analysis_title: "Data Analysis",
    service_analysis_intro: "Transforming raw data into actionable insights through statistics and visualization.",
    service_ai_title: "AI Projects",
    service_ai_intro: "Development of comprehensive tech solutions, from web to artificial intelligence.",
    portfolio_title: "Portfolio & Experience",
    service_ds_port1: "Thesis: Multiple Sclerosis Classification using MRI and Machine Learning.",
    service_ds_port2: "Student success predictive models (Diginexa) with 30% improvement in risk detection.",
    service_ds_port3: "Medical image processing and computer vision.",
    service_analysis_port1: "NASA Research: Correlation of satellite data and public health.",
    service_analysis_port2: "Growth Specialist at Dataico: Funnel optimization and retention (AHA moment +10%).",
    service_analysis_port3: "Strategic dashboards and automated reporting.",
    service_ai_port1: "Full Stack Development with Django, HTML, CSS, and JavaScript.",
    service_ai_port2: "Integration of AI models into web applications.",
    service_ai_port3: "Automation of data pipelines and solution deployment.",
    services_cta: "Contact Me!",

    core_skills_title: "Core Skills",
    education_title: "Education",
    education_degree: "Mathematician",
    languages_title: "Languages",
    lang_es: "Spanish (Native)",
    lang_en: "English (B2 - Advanced)",
    lang_fr: "French (A2 - Intermediate)"
  },
  fr: {
    nav_projects: "Projets",
    nav_about: "À propos",
    nav_academic: "Académique",
    nav_services: "Services",
    nav_contact: "Contact",
    hero_subtitle: "Mathématicien | Gamer | Data Scientist",
    projects_title: "🚀 Projets Personnels",
    projects_desc: "Explorez mes projets open source, expériences IA et outils de données.",
    project_ai_agent_title: "Agent IA pour la Visualisation de Données",
    project_ai_agent_desc: "Agent intelligent qui analyse les bases de données et génère automatiquement des visualisations à l'aide de LangGraph et Gemini.",
    project_ai_agent_stack: "Stack : Python, LangGraph, Gemini API",
    project_ai_agent_link: "Voir le Code",
    about_title: "👨‍💻 À propos",
    about_desc: "Mathématicien et Data Scientist spécialisé en analyse géospatiale, machine learning et stratégies de croissance. Expert en Python, SQL et traitement de données complexes.",
    profile_summary: "Mathématicien et Data Scientist expérimenté en analyse de données médicales, classification IRM, modélisation statistique et recherche scientifique. J'ai travaillé comme Assistant de Recherche à l'Université El Bosque, contribuant à des projets interdisciplinaires en neurologie, épidémiologie environnementale et santé publique.",
    about_download_cv: "📄 Télécharger CV (PDF)",
    read_more: "Lire plus",
    skills_title: "Compétences",
    skills_math: "Mathématiques avancées",
    skills_data: "Analyse de données",
    skills_prog: "Programmation (Python, JavaScript)",
    skills_content: "Création de contenu",
    skills_game: "Game Design",
    academic_title: "🎓 Académique & Professionnel",
    timeline_math_title: "Diplôme: Mathématiques",
    timeline_math_desc: "Formation en analyse mathématique et théorie informatique. Spécialisation en mathématiques appliquées.",
    timeline_exp_title: "Expérience Professionnelle",
    timeline_exp_desc: "Analyste de données et développeur de solutions technologiques dans des entreprises du secteur tech.",
    timeline_cert_title: "Certifications",
    timeline_cert_desc: "Certifié en programmation scientifique et analyse de données avancée.",
    contact_title: "📧 Contact",
    contact_desc: "Contactez-moi ! J'aimerais collaborer avec vous.",
    contact_email_label: "Email :",
    contact_linkedin_label: "LinkedIn :",
    contact_github_label: "GitHub :",
    contact_follow_label: "Suivez-moi sur :",
    footer_copyright: "© 2025 CRISPITIONSS",

    // CV - Research
    research_title: "Expérience de Recherche",
    res_assistant_title: "Assistant de Recherche",
    res_assistant_desc: "Traitement et analyse de jeux de données satellitaires de la NASA (qualité de l'air, température) pour identifier des corrélations avec la santé publique.",
    res_assistant_ach1: "Utilisation de Python, GeoPandas et API spatiales pour pipelines géospatiaux.",
    res_assistant_ach2: "Soutien à la recherche interdisciplinaire (santé publique, génie de l'environnement).",
    res_assistant_ach3: "Nettoyage de données, modélisation statistique et documentation académique.",
    thesis_title: "Thèse de Premier Cycle",
    thesis_desc: "Construction d'un classificateur ML pour distinguer les modèles IRM associés à la sclérose en plaques.",
    thesis_ach1: "Prétraitement d'images (normalisation, extraction de caractéristiques).",
    thesis_ach2: "Réduction de dimensionnalité et apprentissage supervisé.",
    thesis_ach3: "Pipelines reproductibles utilisant des bibliothèques scientifiques standard.",

    // CV - Professional
    exp_title: "Expérience Professionnelle",
    job_neuro_title: "Consultant Data Science (Neurologie)",
    job_neuro_desc: "Mise en œuvre de modèles statistiques et ML pour jeux de données IRM et informations cliniques.",
    job_neuro_ach1: "Conception de workflows automatisés de traitement IRM (amélioration de 20% de l'efficacité).",
    job_neuro_ach2: "Nettoyage de données et analyse exploratoire pour jeux de données neurologiques.",
    job_neuro_ach3: "Traduction des résultats analytiques en insights pour l'aide à la décision médicale.",
    job_growth_title: "Spécialiste de la Croissance",
    job_growth_desc: "Analyse quantitative pour optimiser l'activation, la rétention et la performance du funnel.",
    job_growth_ach1: "Augmentation du 'AHA moment' de 49% à 59%.",
    job_growth_ach2: "Génération de tableaux de bord et rapports comportementaux pour décisions stratégiques.",

    // CV - Projects
    projects_section_title: "Projets Scientifiques & Data Science",
    proj_env_title: "Projet Corrélation Environnementale",
    proj_env_ach1: "Traitement d'images satellitaires NASA et jeux de données géospatiaux via API.",
    proj_env_ach2: "Identification de variables environnementales associées à la mortalité.",
    proj_env_ach3: "Modèles géospatiaux utilisant Python, GeoPandas, rasterio et statistiques spatiales.",
    proj_student_title: "Modélisation Prédictive Réussite Étudiante",
    proj_student_ach1: "Pipelines automatisés pour évaluer la performance académique.",
    proj_student_ach2: "Modèles prédictifs augmentant la détection précoce des risques de 30%.",
    proj_student_ach3: "Amélioration des processus de rapport et d'intervention grâce aux données.",

    // Services
    services_title: "🛠️ Services",
    services_intro: "J'offre des solutions personnalisées en science des données, développement et conseil.",
    service_ds_title: "Science des Données avec Python & R",
    service_ds_intro: "Mise en œuvre de modèles avancés de Machine Learning et Deep Learning pour résoudre des problèmes complexes.",
    service_analysis_title: "Analyse de Données",
    service_analysis_intro: "Transformation de données brutes en insights exploitables via statistiques et visualisation.",
    service_ai_title: "Projets d'IA",
    service_ai_intro: "Développement de solutions technologiques complètes, du web à l'intelligence artificielle.",
    portfolio_title: "Portfolio & Expérience",
    service_ds_port1: "Thèse : Classification de la sclérose en plaques utilisant IRM et Machine Learning.",
    service_ds_port2: "Modèles prédictifs de réussite étudiante (Diginexa) avec 30% d'amélioration de détection des risques.",
    service_ds_port3: "Traitement d'images médicales et vision par ordinateur.",
    service_analysis_port1: "Recherche NASA : Corrélation des données satellitaires et santé publique.",
    service_analysis_port2: "Spécialiste Growth chez Dataico : Optimisation des funnels et rétention (AHA moment +10%).",
    service_analysis_port3: "Tableaux de bord stratégiques et rapports automatisés.",
    service_ai_port1: "Développement Full Stack avec Django, HTML, CSS et JavaScript.",
    service_ai_port2: "Intégration de modèles d'IA dans des applications web.",
    service_ai_port3: "Automatisation des pipelines de données et déploiement de solutions.",
    services_cta: "Contactez-moi !",

    core_skills_title: "Compétences Principales",
    education_title: "Éducation",
    education_degree: "Mathématicien",
    languages_title: "Langues",
    lang_es: "Espagnol (Natif)",
    lang_en: "Anglais (B2 - Avancé)",
    lang_fr: "Français (A2 - Intermédiaire)"
  }
};

const langToggle = document.getElementById('langToggle');
const langDropdown = document.getElementById('langDropdown');
const langButtons = document.querySelectorAll('.lang-dropdown button');

// Toggle dropdown
if (langToggle && langDropdown) {
  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    langDropdown.classList.remove('show');
  });
}

// Change language
function changeLanguage(lang) {
  // Update texts
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      element.innerText = translations[lang][key];

      // Update data-value for subtitle hacker effect
      if (element.classList.contains('hero-subtitle')) {
        element.setAttribute('data-value', translations[lang][key]);
      }
    }
  });

  // Update button text
  if (langToggle) {
    langToggle.innerText = lang.toUpperCase();
  }

  // Save preference
  localStorage.setItem('preferredLanguage', lang);
}

// Event listeners for language buttons
langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    changeLanguage(lang);
  });
});

// Initialize language
const savedLang = localStorage.getItem('preferredLanguage') || 'es';
changeLanguage(savedLang);

// DYNAMIC PAGE NAVIGATION (SCROLL SPY)
function initPageNav() {
  const sections = document.querySelectorAll('main section[id]');
  if (sections.length < 2) return; // Don't show if less than 2 sections

  // Create nav container
  const navContainer = document.createElement('div');
  navContainer.id = 'page-nav';
  document.body.appendChild(navContainer);

  // Generate dots
  sections.forEach(section => {
    const dot = document.createElement('div');
    dot.className = 'nav-dot';
    dot.dataset.target = section.id;

    // Create label
    const label = document.createElement('div');
    label.className = 'nav-label';

    // Get title from section h2 data-i18n or text
    const titleElement = section.querySelector('h2[data-i18n]');
    if (titleElement) {
      const key = titleElement.getAttribute('data-i18n');
      label.setAttribute('data-i18n', key); // For translation
      // Set initial text based on current language
      const currentLang = localStorage.getItem('preferredLanguage') || 'es';
      if (translations[currentLang] && translations[currentLang][key]) {
        label.innerText = translations[currentLang][key];
      }
    } else {
      label.innerText = section.id;
    }

    dot.appendChild(label);
    navContainer.appendChild(dot);

    // Click event
    dot.addEventListener('click', () => {
      section.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Intersection Observer for Active State
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section is in middle of viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active class from all dots
        document.querySelectorAll('.nav-dot').forEach(d => d.classList.remove('active'));
        // Add active class to corresponding dot
        const targetDot = document.querySelector(`.nav-dot[data-target="${entry.target.id}"]`);
        if (targetDot) targetDot.classList.add('active');
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

// Initialize Page Nav on Load
document.addEventListener('DOMContentLoaded', initPageNav);

// Services Accordion Logic
const serviceItems = document.querySelectorAll('.service-item');

serviceItems.forEach(item => {
  item.addEventListener('click', () => {
    // Toggle active class on clicked item
    item.classList.toggle('active');

    // Optional: Close others when one opens (Accordion behavior)
    // serviceItems.forEach(otherItem => {
    //   if (otherItem !== item) {
    //     otherItem.classList.remove('active');
    //   }
    // });
  });
});
