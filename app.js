// app.js - Masterpiece Interactions: Scramble, Magnetic, SVG Drawing, Hex Theme, Spotlight

(function() {
    // ---------- 1. NATIVE SINGLE-PAGE SCROLLING ----------
    // Keep normal document scrolling so anchor links work reliably.
    const getScrollY = () => window.scrollY || document.documentElement.scrollTop || 0;

    // ---------- 2. TEXT SCRAMBLE ANIMATION ----------
    const scrambleElement = document.getElementById('scrambleTitle');
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
    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // ---------- 4. BENTO SPOTLIGHT (mouse-follow gradient) ----------
    const bentoCards = document.querySelectorAll('.bento-card');
    bentoCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,215,0,0.2), var(--card-bg))`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.background = 'var(--card-bg)';
        });
    });

    // ---------- 5. SVG TIMELINE DRAWING ON SCROLL (using Intersection Observer) ----------
    const timelinePath = document.getElementById('timelinePath');
    if (timelinePath) {
        const length = timelinePath.getTotalLength();
        timelinePath.style.strokeDasharray = length;
        timelinePath.style.strokeDashoffset = length;
        const observerTimeline = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let start = null;
                    function animateDraw(timestamp) {
                        if (!start) start = timestamp;
                        const progress = Math.min(1, (timestamp - start) / 1500);
                        timelinePath.style.strokeDashoffset = length - (progress * length);
                        if (progress < 1) requestAnimationFrame(animateDraw);
                    }
                    requestAnimationFrame(animateDraw);
                    observerTimeline.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        const timelineContainer = document.querySelector('.timeline-svg-container');
        if (timelineContainer) observerTimeline.observe(timelineContainer);
    }

    // ---------- 6. HEX THEME TOGGLE (honeycomb transition) ----------
    const themeToggleBtn = document.getElementById('liquidToggle');
    let isDark = !document.body.classList.contains('light-mode');
    let isThemeAnimating = false;

    const prefersReducedMotion = (() => {
        try {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch {
            return false;
        }
    })();

    function updateThemeIcons() {
        if (!themeToggleBtn) return;
        const sun = themeToggleBtn.querySelector('.fa-sun');
        const moon = themeToggleBtn.querySelector('.fa-moon');
        if (!sun || !moon) return;
        sun.style.display = isDark ? 'inline-block' : 'none';
        moon.style.display = isDark ? 'none' : 'inline-block';
    }

    function setTheme(nextIsDark) {
        isDark = Boolean(nextIsDark);
        document.body.classList.toggle('light-mode', !isDark);
        updateThemeIcons();
    }

    function buildHexOverlay({ x, y, color }) {
        const overlay = document.createElement('div');
        overlay.className = 'hex-overlay';
        overlay.style.setProperty('--hex-color', color);

        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const cellW = Math.min(96, Math.max(64, Math.round(viewportW / 14)));
        const cellH = Math.round(cellW * 0.866); // ~sqrt(3)/2 for flat-top hex
        const stepX = Math.round(cellW * 0.75);
        const stepY = cellH;

        const cols = Math.ceil(viewportW / stepX) + 3;
        const rows = Math.ceil(viewportH / stepY) + 3;

        let maxDelay = 0;
        const fragment = document.createDocumentFragment();

        for (let col = 0; col < cols; col += 1) {
            for (let row = 0; row < rows; row += 1) {
                const hex = document.createElement('div');
                hex.className = 'hex-cell';
                hex.style.width = `${cellW}px`;
                hex.style.height = `${cellH}px`;

                const left = (col * stepX) - cellW;
                const top = (row * stepY) + ((col % 2) ? Math.round(cellH / 2) : 0) - cellH;
                hex.style.left = `${left}px`;
                hex.style.top = `${top}px`;

                const cx = left + (cellW / 2);
                const cy = top + (cellH / 2);
                const dist = Math.hypot(cx - x, cy - y);
                const delay = Math.min(520, Math.round(dist * 0.25));
                maxDelay = Math.max(maxDelay, delay);
                hex.dataset.d = String(delay);
                hex.style.setProperty('--d', `${delay}ms`);

                fragment.appendChild(hex);
            }
        }

        overlay.appendChild(fragment);
        document.body.appendChild(overlay);

        // Force layout so the class change triggers transitions.
        overlay.offsetHeight;
        overlay.classList.add('on');

        return { overlay, maxDelay };
    }

    function toggleThemeHex(e) {
        if (!themeToggleBtn || isThemeAnimating) return;
        isThemeAnimating = true;

        const rect = themeToggleBtn.getBoundingClientRect();
        const clickX = (e && typeof e.clientX === 'number') ? e.clientX : (rect.left + rect.width / 2);
        const clickY = (e && typeof e.clientY === 'number') ? e.clientY : (rect.top + rect.height / 2);

        const nextIsDark = !isDark;
        const targetColor = nextIsDark ? '#0A0A0A' : '#F5F5F5';

        if (prefersReducedMotion) {
            setTheme(nextIsDark);
            isThemeAnimating = false;
            return;
        }

        const { overlay, maxDelay } = buildHexOverlay({ x: clickX, y: clickY, color: targetColor });

        const cellMs = 520;
        const enterDoneMs = maxDelay + cellMs;

        // Start exit wave (reverse delays) so hexes disappear, then switch theme.
        window.setTimeout(() => {
            overlay.querySelectorAll('.hex-cell').forEach((cell) => {
                const inDelay = Number(cell.dataset.d || 0);
                const outDelay = Math.max(0, maxDelay - inDelay);
                cell.style.setProperty('--d', `${outDelay}ms`);
            });
            overlay.classList.add('out');
        }, enterDoneMs + 60);

        const exitDoneMs = enterDoneMs + 60 + maxDelay + cellMs;
        window.setTimeout(() => setTheme(nextIsDark), exitDoneMs + 40);
        window.setTimeout(() => {
            overlay.remove();
            isThemeAnimating = false;
        }, exitDoneMs + 140);
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleThemeHex);
        updateThemeIcons();
    }

    // ---------- 7. FLOATING NAVBAR SHRINK ON SCROLL ----------
    const floatingNav = document.querySelector('.floating-nav');
    function handleNavScroll() {
        const scrollY = getScrollY();
        if (scrollY > 50) {
            floatingNav?.classList.add('scrolled');
        } else {
            floatingNav?.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // ---------- 8. MOBILE MENU TOGGLE ----------
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        const setMenuOpen = (isOpen) => {
            navLinks.classList.toggle('active', isOpen);
            const icon = menuToggle.querySelector('i');
            if (!icon) return;
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        };

        menuToggle.addEventListener('click', () => {
            setMenuOpen(!navLinks.classList.contains('active'));
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMenuOpen(false));
        });
    }

    // ---------- 9. HORIZONTAL SCROLL INTERACTION (mouse wheel inside) ----------
    const horizontalScroll = document.querySelector('.horizontal-scroll');
    if (horizontalScroll) {
        horizontalScroll.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                horizontalScroll.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }

    // ---------- 10. BUTTON ACTIONS (CV Download & Contact) ----------
    const cvBtn = document.getElementById('magneticCV');
    if (cvBtn) {
        cvBtn.addEventListener('click', () => {
            const cvContent = `AMR ADEL - Senior Land Surveyor\nPhone: 01062978485\nEmail: amr163874@gmail.com\n\n13+ years experience in infrastructure, roadworks, water networks. Major firms: Orascom, Hassan Allam, Active Brains.\nEducation: Zagazig University - Geography (2011)`;
            const blob = new Blob([cvContent], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'Amr_Adel_Surveyor_CV.txt';
            link.click();
            URL.revokeObjectURL(link.href);
        });
    }
    const contactBtn = document.getElementById('magneticContact');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // ---------- 11. CONTACT FORM (mailto send) ----------
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    if (contactForm) {
        const setStatus = (message) => {
            if (!formStatus) return;
            formStatus.textContent = message || '';
        };

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const subjectRaw = String(formData.get('subject') || '').trim();
            const message = String(formData.get('message') || '').trim();

            if (!name || !email || !message) {
                setStatus('Please fill in name, email, and message.');
                return;
            }

            const subject = subjectRaw || `Portfolio message from ${name}`;
            const bodyLines = [
                `Name: ${name}`,
                `Email: ${email}`,
                '',
                message
            ];
            const mailto = `mailto:amr163874@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

            setStatus('Opening your email app…');
            window.location.href = mailto;
        });
    }

    // ---------- 12. FADE-IN ON VIEW ----------
    const fadeElements = document.querySelectorAll('.timeline-node, .bento-card, .project-card');
    const observerFade = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observerFade.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observerFade.observe(el);
    });

})();
