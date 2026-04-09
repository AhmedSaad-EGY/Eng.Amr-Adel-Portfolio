// app.js - with Hexagon Theme Overlay, Custom Scrollbar, Live Border Pulse

(function () {
  "use strict";

  const getScrollY = () =>
    window.scrollY || document.documentElement.scrollTop || 0;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ========== MOBILE MENU ==========
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");
  const body = document.body;
  let navOverlay = null;

  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove("active");
    body.classList.remove("menu-open");
    if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
    if (navOverlay) navOverlay.remove();
    navOverlay = null;
  }

  function openMenu() {
    if (!navMenu) return;
    navMenu.classList.add("active");
    body.classList.add("menu-open");
    if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "true");
    if (!navOverlay) {
      navOverlay = document.createElement("div");
      navOverlay.className = "nav-overlay";
      navOverlay.addEventListener("click", closeMenu);
      document.body.appendChild(navOverlay);
    }
  }

  function toggleMenu() {
    if (navMenu.classList.contains("active")) closeMenu();
    else openMenu();
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", toggleMenu);
    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("active") &&
        !navMenu.contains(e.target) &&
        !mobileToggle.contains(e.target)
      )
        closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("active"))
        closeMenu();
    });
  }

  // ========== ACTIVE LINK ON SCROLL ==========
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  let ticking = false;

  function updateActiveLink() {
    let currentId = "";
    const scrollPos = window.scrollY + 120;
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionBottom)
        currentId = section.getAttribute("id");
    });
    navLinks.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
      const href = link.getAttribute("href");
      if (href === `#${currentId}` || (currentId === "" && href === "#hero")) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  });
  window.addEventListener("resize", updateActiveLink);
  updateActiveLink();

  // ========== NAVBAR SCROLL SHRINK ==========
  const navbar = document.querySelector(".navbar");
  function handleNavScroll() {
    if (navbar)
      getScrollY() > 50
        ? navbar.classList.add("scrolled")
        : navbar.classList.remove("scrolled");
  }
  window.addEventListener("scroll", handleNavScroll, { passive: true });
  handleNavScroll();

  // ========== TYPING EFFECT FOR SECTION HEADERS ==========
  const sectionTitles = document.querySelectorAll(".section-title h2");
  const originalTitles = new Map(); // Store original text to re-type
  const typingIntervals = new Map(); // Store interval IDs to clear them

  if (!prefersReducedMotion) {
    sectionTitles.forEach((titleElement) => {
      // Lock the height of the container to its current rendered height
      // This prevents the page from "jumping" when the text is cleared.
      const initialHeight = titleElement.offsetHeight;
      if (initialHeight > 0) {
        titleElement.style.minHeight = `${initialHeight}px`;
      }
      originalTitles.set(titleElement, titleElement.innerHTML); // Store full HTML
      titleElement.innerHTML = ""; // Clear HTML initially
    });

    const typeText = (element, originalHtml, delay = 50) => {
      if (typingIntervals.has(element)) {
        clearInterval(typingIntervals.get(element)); // Clear any existing interval
      }
      let charIndex = 0;
      let currentHtml = "";
      const interval = setInterval(() => {
        if (charIndex < originalHtml.length) {
          // Match either a full HTML tag or a single character
          const nextCharOrTagMatch = originalHtml
            .substring(charIndex)
            .match(/<[^>]+>|./);
          const nextChunk = nextCharOrTagMatch ? nextCharOrTagMatch[0] : "";
          currentHtml += nextChunk;
          element.innerHTML = currentHtml;
          charIndex += nextChunk.length;
        } else {
          clearInterval(interval);
          // Schedule restart after 2 seconds
          setTimeout(() => {
            element.innerHTML = ""; // Clear for restart
            typeText(element, originalHtml, delay);
          }, 2000); // 2 seconds delay
        }
      }, delay);
      typingIntervals.set(element, interval); // Store interval ID
    };

    const titleObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const fullHtml = originalTitles.get(element);

            // Only start typing if not already active to prevent scroll-flicker
            if (element.innerHTML === "" && !typingIntervals.has(element)) {
              typeText(element, fullHtml);
            }
          }
        });
      },
      { threshold: 0.7 }, // Trigger when 70% of the title is visible
    );
    sectionTitles.forEach((title) => titleObserver.observe(title));
  }
  // ========== TEXT SCRAMBLE (view‑triggered) ==========
  const scrambleElement = document.getElementById("scrambleTitle");
  if (scrambleElement && !prefersReducedMotion) {
    const observerScramble = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const originalText = "AMR ADEL";
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
            let iterations = 0;
            const interval = setInterval(() => {
              let scrambled = "";
              for (let i = 0; i < originalText.length; i++) {
                if (i < iterations) scrambled += originalText[i];
                else
                  scrambled += chars[Math.floor(Math.random() * chars.length)];
              }
              scrambleElement.innerText = scrambled;
              iterations += 1 / 3;
              if (iterations >= originalText.length) {
                clearInterval(interval);
                scrambleElement.innerText = originalText;
              }
            }, 50);
            observerScramble.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    observerScramble.observe(scrambleElement);
  }

  // ========== MAGNETIC BUTTONS (only on hover) ==========
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".btn-magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.03)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0px, 0px)";
      });
    });
  }

  // ========== SPOTLIGHT EFFECT (Bento & Timeline) ==========
  document.querySelectorAll(".bento-card, .timeline-node").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,215,0,0.2), var(--card-bg))`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.background = "var(--card-bg)";
    });
  });

  // ========== TIMELINE SVG DRAWING ==========
  const timelinePath = document.getElementById("timelinePath");
  if (timelinePath && !prefersReducedMotion) {
    let length = 0;
    try {
      length = timelinePath.getTotalLength();
    } catch (e) {
      console.warn(e);
    }
    if (length > 0) {
      timelinePath.style.strokeDasharray = length;
      timelinePath.style.strokeDashoffset = length;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              let start = null;
              function animate(timestamp) {
                if (!start) start = timestamp;
                const progress = Math.min(1, (timestamp - start) / 1500);
                timelinePath.style.strokeDashoffset =
                  length - progress * length;
                if (progress < 1) requestAnimationFrame(animate);
              }
              requestAnimationFrame(animate);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 },
      );
      const container = document.querySelector(".timeline-svg-container");
      if (container) observer.observe(container);
    }
  }

  // ========== HEXAGON THEME TOGGLE ==========
  const themeToggle = document.getElementById("themeToggle");
  let isDark = !document.body.classList.contains("light-mode");

  function setTheme(nextIsDark) {
    isDark = nextIsDark;
    document.body.classList.toggle("light-mode", !isDark);
    if (themeToggle)
      themeToggle.setAttribute("aria-pressed", (!isDark).toString());
    const sun = themeToggle?.querySelector(".fa-sun");
    const moon = themeToggle?.querySelector(".fa-moon");
    if (sun && moon) {
      sun.style.display = isDark ? "inline-block" : "none";
      moon.style.display = isDark ? "none" : "inline-block";
    }
  }

  function buildHexOverlay(x, y, color) {
    const overlay = document.createElement("div");
    overlay.className = "hex-overlay";
    overlay.style.setProperty("--hex-color", color);
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const cellW = 60;
    const cellH = 68;
    const stepX = cellW * 0.75;
    const stepY = cellH;
    const cols = Math.ceil(viewportW / stepX) + 3;
    const rows = Math.ceil(viewportH / stepY) + 3;

    const maxDist = Math.max(
      Math.hypot(x, y),
      Math.hypot(viewportW - x, y),
      Math.hypot(x, viewportH - y),
      Math.hypot(viewportW - x, viewportH - y),
    );
    const maxDelay = Math.min(450, Math.round(maxDist * 0.28));

    const fragment = document.createDocumentFragment();
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const hex = document.createElement("div");
        hex.className = "hex-cell";
        hex.style.width = `${cellW}px`;
        hex.style.height = `${cellH}px`;
        const left = col * stepX - cellW;
        const top = row * stepY + (col % 2 ? cellH / 2 : 0) - cellH;
        hex.style.left = `${left}px`;
        hex.style.top = `${top}px`;
        const cx = left + cellW / 2;
        const cy = top + cellH / 2;
        const dist = Math.hypot(cx - x, cy - y);
        const delay = Math.min(maxDelay, Math.round(dist * 0.28));
        hex.style.setProperty("--d", `${delay}ms`);
        hex.style.setProperty("--dout", `${maxDelay - delay}ms`);
        fragment.appendChild(hex);
      }
    }
    overlay.appendChild(fragment);
    document.body.appendChild(overlay);
    overlay.offsetHeight;
    overlay.classList.add("on");
    return { overlay, maxDelay };
  }

  async function toggleThemeHex(e) {
    if (prefersReducedMotion) {
      setTheme(!isDark);
      return;
    }
    const rect = themeToggle.getBoundingClientRect();
    const clickX =
      e && e.clientX !== undefined ? e.clientX : rect.left + rect.width / 2;
    const clickY =
      e && e.clientY !== undefined ? e.clientY : rect.top + rect.height / 2;
    const nextIsDark = !isDark;
    const targetColor = nextIsDark ? "#0b0f14" : "#F5F5F5";
    const { overlay, maxDelay } = buildHexOverlay(clickX, clickY, targetColor);
    const duration = 400;
    setTimeout(() => {
      setTheme(nextIsDark);
      overlay.classList.add("out");
    }, maxDelay + duration);
    setTimeout(
      () => {
        if (overlay.parentNode) overlay.remove();
      },
      maxDelay + duration + maxDelay + duration + 50,
    );
  }

  if (themeToggle) {
    setTheme(isDark);
    themeToggle.addEventListener("click", toggleThemeHex);
  }

  // ========== COUNTERS ==========
  const counters = document.querySelectorAll(".count-number");
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute("data-target"), 10);
          let current = 0;
          const increment = target / 50;
          function update() {
            current += increment;
            if (current < target) {
              el.innerText = Math.ceil(current);
              requestAnimationFrame(update);
            } else {
              el.innerText = target;
            }
          }
          update();
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.5 },
  );
  counters.forEach((c) => counterObserver.observe(c));

  // ========== SECTION REVEAL ==========
  document.querySelectorAll(".section-animate").forEach((section) => {
    new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    ).observe(section);
  });

  // ========== CONTACT FORM ==========
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;
      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          formStatus.textContent = "✓ Message sent successfully!";
          formStatus.style.color = "var(--gold)";
          contactForm.reset();
        } else {
          formStatus.textContent = "❌ Error sending message.";
          formStatus.style.color = "#ff6b6b";
        }
      } catch (error) {
        formStatus.textContent = "❌ Network error.";
        formStatus.style.color = "#ff6b6b";
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        setTimeout(() => {
          formStatus.textContent = "";
        }, 5000);
      }
    });
  }

  // ========== BUTTON ACTIONS ==========
  const downloadCV = () => {
    const blob = new Blob(
      [
        "AMR ADEL - Senior Land Surveyor\nPhone: 01062978485\nEmail: amr163874@gmail.com",
      ],
      { type: "text/plain" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Amr_Adel_CV.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const scrollToContact = () =>
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });

  document.getElementById("magneticCV")?.addEventListener("click", downloadCV);
  document
    .getElementById("magneticContact")
    ?.addEventListener("click", scrollToContact);
  document.getElementById("mobileCV")?.addEventListener("click", downloadCV);
  document
    .getElementById("mobileContact")
    ?.addEventListener("click", scrollToContact);

  // ========== HORIZONTAL SCROLL WHEEL ==========
  const horizScroll = document.querySelector(".horizontal-scroll");
  if (horizScroll) {
    horizScroll.addEventListener(
      "wheel",
      (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          horizScroll.scrollLeft += e.deltaY;
        }
      },
      { passive: false },
    );
  }

  // ========== FLOATING SHAPES BACKGROUND ==========
  const floatingShapesContainer = document.querySelector(
    ".floating-shapes-container",
  );
  if (floatingShapesContainer && !prefersReducedMotion) {
    const numberOfShapes = 15;
    const shapeClasses = [
      "shape-circle",
      "shape-square",
      "shape-rectangle",
      "shape-triangle",
      "shape-quadrilateral",
      "shape-pentagon",
      "shape-hexagon",
    ];
    setTimeout(() => {
      for (let i = 0; i < numberOfShapes; i++) {
        const shape = document.createElement("div");
        const randomShapeClass =
          shapeClasses[Math.floor(Math.random() * shapeClasses.length)];
        shape.className = `shape-item ${randomShapeClass}`;
        shape.style.left = `${Math.random() * 100}vw`;
        shape.style.top = `${Math.random() * 100}vh`;
        const baseSize = 40 + Math.random() * 80;
        shape.style.width = `${baseSize}px`;
        shape.style.height = `${baseSize}px`;
        if (randomShapeClass === "shape-rectangle") {
          shape.style.height = `${baseSize * (0.5 + Math.random() * 0.8)}px`;
        }
        const floatDuration = 12 + Math.random() * 8;
        const rotateDuration = 6 + Math.random() * 8;
        shape.style.animation = `
          floatShape ${floatDuration}s ease-in-out infinite alternate,
          rotateShape ${rotateDuration}s linear infinite
        `;
        shape.style.animationDelay = `${Math.random() * 2}s`;
        floatingShapesContainer.appendChild(shape);
      }
    }, 1000);
  }

  // ========== BACK TO TOP BUTTON ==========
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
