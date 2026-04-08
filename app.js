// app.js - Masterpiece Interactions: Scramble, Magnetic, SVG Drawing, Hex Theme, Spotlight, Counters, Typing, Section Animations

(function () {
    // ---------- 1. NATIVE SINGLE-PAGE SCROLLING ----------
    const getScrollY = () =>
        window.scrollY || document.documentElement.scrollTop || 0;

    // ---------- 2. TEXT SCRAMBLE ANIMATION ----------
    const scrambleElement = document.getElementById("scrambleTitle");
    if (scrambleElement) {
        const originalText = "AMR ADEL";
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let iterations = 0;
        const interval = setInterval(() => {
            let scrambled = "";
            for (let i = 0; i < originalText.length; i++) {
                if (i < iterations) {
                    scrambled += originalText[i];
                } else {
                    scrambled += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            scrambleElement.innerText = scrambled;
            iterations += 1 / 3;
            if (iterations >= originalText.length) {
                clearInterval(interval);
                scrambleElement.innerText = originalText;
            }
        }, 50);
    }

    // ---------- 3. MAGNETIC BUTTONS (mouse move pull) ----------
    const magneticBtns = document.querySelectorAll(".btn-magnetic");
    magneticBtns.forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "translate(0px, 0px)";
        });
    });

    // ---------- 4. BENTO SPOTLIGHT (mouse-follow gradient) ----------
    const bentoCards = document.querySelectorAll(".bento-card");
    bentoCards.forEach((card) => {
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

    // ---------- 5. SVG TIMELINE DRAWING ON SCROLL ----------
    const timelinePath = document.getElementById("timelinePath");
    if (timelinePath) {
        let length = 0;
        try {
            length = timelinePath.getTotalLength();
        } catch (e) {
            console.warn("SVG path length not available:", e);
        }
        if (length > 0) {
            timelinePath.style.strokeDasharray = length;
            timelinePath.style.strokeDashoffset = length;
            const observerTimeline = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            let start = null;
                            function animateDraw(timestamp) {
                                if (!start) start = timestamp;
                                const progress = Math.min(1, (timestamp - start) / 1500);
                                timelinePath.style.strokeDashoffset =
                                    length - progress * length;
                                if (progress < 1) requestAnimationFrame(animateDraw);
                            }
                            requestAnimationFrame(animateDraw);
                            observerTimeline.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.4 },
            );
            const timelineContainer = document.querySelector(
                ".timeline-svg-container",
            );
            if (timelineContainer) observerTimeline.observe(timelineContainer);
        }
    }

    // ---------- 6. HEX THEME TOGGLE + ANIMATION ----------
    const themeToggleBtn = document.getElementById("liquidToggle");
    let isDark = !document.body.classList.contains("light-mode");
    let isThemeAnimating = false;

    const prefersReducedMotion = (() => {
        try {
            return (
                window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            );
        } catch {
            return false;
        }
    })();

    function updateThemeIcons() {
        if (!themeToggleBtn) return;
        const sun = themeToggleBtn.querySelector(".fa-sun");
        const moon = themeToggleBtn.querySelector(".fa-moon");
        if (!sun || !moon) return;
        sun.style.display = isDark ? "inline-block" : "none";
        moon.style.display = isDark ? "none" : "inline-block";
    }

    function setTheme(nextIsDark) {
        isDark = Boolean(nextIsDark);
        document.body.classList.toggle("light-mode", !isDark);
        updateThemeIcons();
    }

    function buildHexOverlay({ x, y, color }) {
        const overlay = document.createElement("div");
        overlay.className = "hex-overlay";
        overlay.style.setProperty("--hex-color", color);

        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const cellW = Math.min(96, Math.max(64, Math.round(viewportW / 14)));
        const cellH = Math.round(cellW * 0.866);
        const stepX = Math.round(cellW * 0.75);
        const stepY = cellH;

        const cols = Math.ceil(viewportW / stepX) + 3;
        const rows = Math.ceil(viewportH / stepY) + 3;

        let maxDelay = 0;
        const fragment = document.createDocumentFragment();

        for (let col = 0; col < cols; col += 1) {
            for (let row = 0; row < rows; row += 1) {
                const hex = document.createElement("div");
                hex.className = "hex-cell";
                hex.style.width = `${cellW}px`;
                hex.style.height = `${cellH}px`;

                const left = col * stepX - cellW;
                const top = row * stepY + (col % 2 ? Math.round(cellH / 2) : 0) - cellH;
                hex.style.left = `${left}px`;
                hex.style.top = `${top}px`;

                const cx = left + cellW / 2;
                const cy = top + cellH / 2;
                const dist = Math.hypot(cx - x, cy - y);
                const delay = Math.min(520, Math.round(dist * 0.25));
                maxDelay = Math.max(maxDelay, delay);
                hex.dataset.d = String(delay);
                hex.style.setProperty("--d", `${delay}ms`);

                fragment.appendChild(hex);
            }
        }

        overlay.appendChild(fragment);
        document.body.appendChild(overlay);

        overlay.offsetHeight;
        overlay.classList.add("on");

        return { overlay, maxDelay };
    }

    function toggleThemeHex(e) {
        if (!themeToggleBtn || isThemeAnimating) return;
        isThemeAnimating = true;

        // Add click animation to the toggle button
        themeToggleBtn.style.transform = "scale(0.9) rotate(15deg)";
        setTimeout(() => {
            if (themeToggleBtn) themeToggleBtn.style.transform = "";
        }, 200);

        const rect = themeToggleBtn.getBoundingClientRect();
        const clickX =
            e && typeof e.clientX === "number"
                ? e.clientX
                : rect.left + rect.width / 2;
        const clickY =
            e && typeof e.clientY === "number"
                ? e.clientY
                : rect.top + rect.height / 2;

        const nextIsDark = !isDark;
        const targetColor = nextIsDark ? "#0b0f14" : "#F5F5F5";

        if (prefersReducedMotion) {
            setTheme(nextIsDark);
            isThemeAnimating = false;
            return;
        }

        const { overlay, maxDelay } = buildHexOverlay({
            x: clickX,
            y: clickY,
            color: targetColor,
        });

        const cellMs = 520;
        const enterDoneMs = maxDelay + cellMs;

        window.setTimeout(() => {
            setTheme(nextIsDark);
            overlay.querySelectorAll(".hex-cell").forEach((cell) => {
                const inDelay = Number(cell.dataset.d || 0);
                const outDelay = Math.max(0, maxDelay - inDelay);
                cell.style.setProperty("--d", `${outDelay}ms`);
            });
            overlay.classList.add("out");
        }, enterDoneMs);

        const exitDoneMs = enterDoneMs + maxDelay + cellMs + 140;
        window.setTimeout(() => {
            if (overlay && overlay.parentNode) overlay.remove();
            isThemeAnimating = false;
        }, exitDoneMs);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", toggleThemeHex);
        updateThemeIcons();
    }

    // ---------- 7. FLOATING NAVBAR SHRINK ON SCROLL ----------
    const floatingNav = document.querySelector(".floating-nav");
    function handleNavScroll() {
        const scrollY = getScrollY();
        if (floatingNav) {
            if (scrollY > 50) {
                floatingNav.classList.add("scrolled");
            } else {
                floatingNav.classList.remove("scrolled");
            }
        }
    }
    window.addEventListener("scroll", handleNavScroll, { passive: true });
    handleNavScroll();

    // ---------- 8. MOBILE MENU TOGGLE ----------
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
        const setMenuOpen = (isOpen) => {
            navLinks.classList.toggle("active", isOpen);
            const icon = menuToggle.querySelector("i");
            if (!icon) return;
            icon.classList.toggle("fa-bars", !isOpen);
            icon.classList.toggle("fa-times", isOpen);
        };

        menuToggle.addEventListener("click", () => {
            setMenuOpen(!navLinks.classList.contains("active"));
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => setMenuOpen(false));
        });
    }

    // ---------- 9. HORIZONTAL SCROLL INTERACTION ----------
    const horizontalScroll = document.querySelector(".horizontal-scroll");
    if (horizontalScroll) {
        horizontalScroll.addEventListener(
            "wheel",
            (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    horizontalScroll.scrollLeft += e.deltaY;
                }
            },
            { passive: false },
        );
    }

    // ---------- 10. BUTTON ACTIONS ----------
    const cvBtn = document.getElementById("magneticCV");
    if (cvBtn) {
        cvBtn.addEventListener("click", () => {
            const cvContent = `AMR ADEL - Senior Land Surveyor\nPhone: 01062978485\nEmail: amr163874@gmail.com\n\n13+ years experience in infrastructure, roadworks, water networks. Major firms: Orascom, Hassan Allam, Active Brains.\nEducation: Zagazig University - Geography (2011)`;
            const blob = new Blob([cvContent], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Amr_Adel_Surveyor_CV.txt";
            link.click();
            URL.revokeObjectURL(link.href);
        });
    }

    const contactBtn = document.getElementById("magneticContact");
    if (contactBtn) {
        contactBtn.addEventListener("click", () => {
            const contactSection = document.getElementById("contact");
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    // ---------- 11. CONTACT FORM (Formspree AJAX) ----------
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");
    if (contactForm) {
        const setStatus = (message, isError = false) => {
            if (formStatus) {
                formStatus.textContent = message;
                formStatus.style.color = isError ? "#ff6b6b" : "var(--gold)";
                setTimeout(() => {
                    if (formStatus.textContent === message) formStatus.textContent = "";
                }, 5000);
            }
        };

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
                    setStatus(
                        "✓ Message sent successfully! I’ll get back to you soon.",
                        false,
                    );
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    setStatus(
                        `❌ Error: ${data.error || "Something went wrong. Please try again."}`,
                        true,
                    );
                }
            } catch (error) {
                setStatus(
                    "❌ Network error. Please check your connection and try again.",
                    true,
                );
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ---------- 12. COUNTER EFFECT FOR NUMBERS ----------
    const counters = document.querySelectorAll(".count-number");
    const counterObserver = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute("data-target"), 10);
                    let current = 0;
                    const increment = target / 50; // smooth animation
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            el.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            el.innerText = target;
                        }
                    };
                    updateCounter();
                    obs.unobserve(el);
                }
            });
        },
        { threshold: 0.5 },
    );
    counters.forEach((counter) => counterObserver.observe(counter));

    // ---------- 13. TYPING EFFECT FOR SECTION TITLES ----------
    const typingTitles = document.querySelectorAll(".typing-title");
    const typeObserver = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const titleEl = entry.target;
                    const originalHTML = titleEl.innerHTML;
                    const textOnly = titleEl.innerText; // get plain text
                    titleEl.innerHTML = "";
                    let i = 0;
                    function typeNext() {
                        if (i < textOnly.length) {
                            titleEl.innerHTML += textOnly.charAt(i);
                            i++;
                            setTimeout(typeNext, 50);
                        } else {
                            // restore any inner HTML formatting (like <span>)
                            if (originalHTML.includes("<span")) {
                                // crude but works: keep typed text and re-wrap the span part
                                const spanMatch = originalHTML.match(/<span>(.*?)<\/span>/);
                                if (spanMatch) {
                                    const spanText = spanMatch[1];
                                    const fullText = titleEl.innerText;
                                    const newHTML = fullText.replace(
                                        spanText,
                                        `<span>${spanText}</span>`,
                                    );
                                    titleEl.innerHTML = newHTML;
                                }
                            }
                        }
                    }
                    typeNext();
                    obs.unobserve(titleEl);
                }
            });
        },
        { threshold: 0.5 },
    );
    typingTitles.forEach((title) => typeObserver.observe(title));

    // ---------- 14. SECTION ENTRANCE ANIMATION (on load + scroll) ----------
    const animatedSections = document.querySelectorAll(".section-animate");
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    sectionObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 },
    );
    animatedSections.forEach((section) => sectionObserver.observe(section));

    // ---------- 15. FADE-IN ON VIEW (legacy, keep for cards) ----------
    const fadeElements = document.querySelectorAll(
        ".timeline-node, .bento-card, .project-card",
    );
    const observerFade = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    observerFade.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 },
    );
    fadeElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observerFade.observe(el);
    });
})();
