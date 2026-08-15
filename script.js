document.addEventListener('DOMContentLoaded', () => {
  // Theme Switching Logic
  const toneSliders = document.querySelectorAll('.tone-slider');
  const modeBtns = document.querySelectorAll('.mode-square-btn:not([onclick])');
  const root = document.documentElement;

  let currentTone = 'neutral';
  let currentMode = null;

  try {
    currentTone = localStorage.getItem('theme-tone') || 'neutral';
    currentMode = localStorage.getItem('theme-mode');
  } catch (e) {
    console.warn('localStorage access denied', e);
  }

  // If no saved mode, use system preference
  if (!currentMode) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentMode = prefersDark ? 'dark' : 'light';
  }

  function updateTheme() {
    root.setAttribute('data-tone', currentTone);
    root.setAttribute('data-mode', currentMode);
    
    try {
      localStorage.setItem('theme-tone', currentTone);
      localStorage.setItem('theme-mode', currentMode);
    } catch (e) {}

    // Update all mode buttons
    modeBtns.forEach(btn => {
      btn.textContent = currentMode === 'light' ? '昼' : '夜';
    });

    // Update all sliders
    let sliderVal = 0;
    if (currentTone === 'cool') sliderVal = -1;
    if (currentTone === 'warm') sliderVal = 1;
    
    toneSliders.forEach(slider => {
      slider.value = sliderVal;
    });
  }
  
  updateTheme();

  toneSliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const val = parseInt(e.currentTarget.value);
      if (val === -1) currentTone = 'cool';
      else if (val === 1) currentTone = 'warm';
      else currentTone = 'neutral';
      updateTheme();
    });
  });

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentMode = currentMode === 'light' ? 'dark' : 'light';
      updateTheme();
    });
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    // Only auto-switch if user hasn't actively set a preference in this session?
    // Let's just respect the system change if it happens while they are using it
    currentMode = event.matches ? 'dark' : 'light';
    updateTheme();
  });

  // --- Original Sparkle Effect ---
  document.addEventListener('click', createSparkles);
  document.addEventListener('touchstart', (e) => {
    if(e.touches.length > 0) createSparkles(e.touches[0]);
  });

  // CSS for sparkles injected via JS so we don't clutter main style.css
  const sparkleStyle = document.createElement('style');
  sparkleStyle.textContent = `
    @keyframes sparkle-anim {
        0% { transform: scale(1) translate(0, 0); opacity: 1; }
        100% { transform: scale(0) translate(var(--tx), var(--ty)); opacity: 0; }
    }
    .sparkle {
        position: absolute; pointer-events: none; border-radius: 50%;
        animation: sparkle-anim 0.8s forwards; opacity: 0; z-index: 9999;
    }
  `;
  document.head.appendChild(sparkleStyle);

  function createSparkles(e) {
      // Don't create sparkles if clicking on interactive UI elements
      if (e.target.closest('button') || e.target.closest('select') || e.target.closest('.win-btn') || e.target.closest('a') || e.target.closest('.ie-tab')) return;
      
      const x = e.clientX || e.pageX;
      const y = e.clientY || e.pageY;

      // Extract current theme colors to match sparkle colors to theme
      const style = getComputedStyle(document.body);
      const bg = style.getPropertyValue('--bg-color').trim();
      const accent = style.getPropertyValue('--accent-color').trim();
      const text = style.getPropertyValue('--text-color').trim();
      const border = style.getPropertyValue('--border-color').trim();
      const sparkleColors = [bg, accent, text, border].filter(c => c);
      
      // Fallback colors if variables aren't read properly
      const defaultColors = ['#f9e8d0', '#c2b8e9', '#5d90ba', '#57c3c2'];
      const colorsToUse = sparkleColors.length >= 3 ? sparkleColors : defaultColors;

      const sparkleCount = 10 + Math.floor(Math.random() * 5); // 10到15个

      for (let i = 0; i < sparkleCount; i++) {
          const sparkle = document.createElement('span');
          sparkle.classList.add('sparkle');
          
          const tx = (Math.random() * 100 - 50) + 'px';
          const ty = (Math.random() * 100 - 50) + 'px';
          sparkle.style.setProperty('--tx', tx);
          sparkle.style.setProperty('--ty', ty);

          const color = colorsToUse[Math.floor(Math.random() * colorsToUse.length)];
          sparkle.style.backgroundColor = color;
          
          const size = Math.random() * 8 + 4 + 'px'; // 4px to 12px
          sparkle.style.width = size;
          sparkle.style.height = size;

          // Add scroll offset
          const scrollX = window.scrollX || document.documentElement.scrollLeft;
          const scrollY = window.scrollY || document.documentElement.scrollTop;

          sparkle.style.left = (x + scrollX) + 'px';
          sparkle.style.top = (y + scrollY) + 'px';
          sparkle.style.animationDelay = (Math.random() * 0.2) + 's';
          sparkle.style.opacity = 1;

          document.body.appendChild(sparkle);

          setTimeout(() => {
              sparkle.remove();
          }, 1000);
      }
  }

  // --- Window Control Buttons (Minimize, Maximize, Close) ---
  document.querySelectorAll('.glass-card').forEach(card => {
    const minBtn = card.querySelector('.win-min');
    const maxBtn = card.querySelector('.win-max');
    const closeBtn = card.querySelector('.win-close');

    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('is-minimized');
      });
    }

    if (maxBtn) {
      maxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('win-fullscreen');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      });
    }
  });



  // --- Fawtic Button Logic (from original index) ---
  const fawticButton = document.getElementById('fawtic-button');
  const fawticLinks = document.getElementById('fawtic-links');

  if (fawticButton && fawticLinks) {
      fawticButton.addEventListener('click', () => {
          fawticButton.style.display = 'none';
          fawticLinks.style.display = 'flex';
          fawticLinks.style.gap = '10px';
      });
  }
});
