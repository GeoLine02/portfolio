// ============================================================================
// Portfolio — interactivity
//
// Visual language matches the 404Friends landing site: every animation here is
// gated on prefers-reduced-motion, and every piece of styling lives in
// style.css (nothing is injected as inline CSS from JS any more).
// ============================================================================

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initIntroOverlay();
    initNavigation();
    initScrollReveal();
    initMusicPlayer();
    initSmoothScroll();
});

// ============================================================================
// Theme — light/dark, mirroring next-themes on the landing site.
// The pre-paint script in index.html <head> already applied the stored value;
// this only wires the toggle and keeps <meta name="theme-color"> in sync.
// ============================================================================
function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const meta = document.querySelector('meta[name="theme-color"]');

    const syncMeta = () => {
        if (meta) meta.content = root.dataset.theme === 'light' ? '#f2f2f5' : '#0b0b12';
    };

    syncMeta();

    toggle?.addEventListener('click', () => {
        const next = root.dataset.theme === 'light' ? 'dark' : 'light';
        root.dataset.theme = next;
        syncMeta();
        try {
            localStorage.setItem('theme', next);
        } catch (e) {
            /* storage blocked — the choice just won't persist */
        }
    });
}

// ============================================================================
// Boot overlay — starts the soundtrack on the user's first real gesture, which
// is also what keeps autoplay policies happy.
// ============================================================================
function initIntroOverlay() {
    const overlay = document.getElementById('introOverlay');
    const enterBtn = document.getElementById('enterBtn');
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const player = document.getElementById('musicPlayer');
    const volumeSlider = document.getElementById('volumeSlider');

    enterBtn?.addEventListener('click', () => {
        overlay?.classList.add('hidden');

        if (!audio) return;
        audio.volume = 0.15;
        if (volumeSlider) volumeSlider.value = 15;

        audio.play()
            .then(() => {
                playBtn?.classList.add('playing');
                player?.classList.add('expanded');
            })
            .catch(err => console.log('Audio error:', err));
    });
}

// ============================================================================
// Navigation — scroll spy, translucent bar, mobile drawer
// ============================================================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const closeMenu = () => {
        navLinks?.classList.remove('active');
        navToggle?.classList.remove('active');
        navToggle?.setAttribute('aria-expanded', 'false');
    };

    navToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !navLinks.classList.contains('active');
        navLinks.classList.toggle('active', open);
        navToggle.classList.toggle('active', open);
        navToggle.setAttribute('aria-expanded', String(open));
    });

    navItems.forEach(item => item.addEventListener('click', closeMenu));

    // clicking anywhere outside the open drawer closes it
    document.addEventListener('click', (e) => {
        if (!navLinks?.classList.contains('active')) return;
        if (navLinks.contains(e.target) || navToggle?.contains(e.target)) return;
        closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // One rAF-batched scroll handler for both the bar state and the scroll spy —
    // the old code ran two independent listeners doing layout reads per event.
    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;

            navbar?.classList.toggle('scrolled', y > 50);

            let currentId = '';
            sections.forEach(section => {
                if (y >= section.offsetTop - 120) currentId = section.id;
            });
            if (currentId) {
                navItems.forEach(item => {
                    item.classList.toggle('active', item.getAttribute('href') === `#${currentId}`);
                });
            }

            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// ============================================================================
// Smooth scroll
// ============================================================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({
                behavior: REDUCED_MOTION.matches ? 'auto' : 'smooth',
                block: 'start',
            });
        });
    });
}

// ============================================================================
// Scroll reveal — the landing site's Reveal.tsx in plain CSS + IntersectionObserver
// (fade + 24px rise, 0.8s, cubic-bezier(0.22, 1, 0.36, 1), fires once at -80px).
// ============================================================================
function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    if (REDUCED_MOTION.matches || !('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('reveal', 'active'));
        return;
    }

    // stagger siblings within the same container, like `delay: i * 0.06` on Landing
    const seen = new Map();
    elements.forEach(el => {
        el.classList.add('reveal');
        const parent = el.parentElement;
        const index = seen.get(parent) ?? 0;
        el.style.setProperty('--i', String(index));
        seen.set(parent, index + 1);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0 });

    elements.forEach(el => observer.observe(el));
}

// ============================================================================
// Music player
// ============================================================================
function initMusicPlayer() {
    const player = document.getElementById('musicPlayer');
    const toggle = document.getElementById('playerToggle');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const volumeSlider = document.getElementById('volumeSlider');
    const audio = document.getElementById('audioPlayer');
    const timeCurrent = document.querySelector('.time-current');
    const timeTotal = document.querySelector('.time-total');

    if (!player || !audio) return;

    let isExpanded = false;

    const setExpanded = (value) => {
        isExpanded = value;
        player.classList.toggle('expanded', value);
    };

    toggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        setExpanded(!isExpanded);
    });

    document.addEventListener('click', (e) => {
        if (isExpanded && !player.contains(e.target)) setExpanded(false);
    });

    playBtn?.addEventListener('click', () => {
        if (audio.paused) {
            audio.play()
                .then(() => playBtn.classList.add('playing'))
                .catch(() => showNotification('Track unavailable — check assets/'));
        } else {
            audio.pause();
            playBtn.classList.remove('playing');
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        if (progressFill) progressFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
    });

    progressBar?.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });

    volumeSlider?.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });

    audio.volume = 0.15;
    if (volumeSlider) volumeSlider.value = 15;

    // Autoplay attempt. Browsers block sound before a gesture, which is exactly
    // what the boot overlay's Enter button provides — this is only the fallback
    // for a return visit where the browser already trusts the origin.
    setExpanded(true);
    setTimeout(() => {
        audio.play()
            .then(() => playBtn?.classList.add('playing'))
            .catch(() => {
                document.addEventListener('click', function startOnClick() {
                    audio.play().then(() => playBtn?.classList.add('playing')).catch(() => { });
                    document.removeEventListener('click', startOnClick);
                }, { once: true });
            });
    }, 500);

    prevBtn?.addEventListener('click', () => { audio.currentTime = 0; });
    nextBtn?.addEventListener('click', () => { audio.currentTime = 0; });

    audio.addEventListener('ended', () => {
        playBtn?.classList.remove('playing');
        if (progressFill) progressFill.style.width = '0%';
        audio.currentTime = 0;
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Terminal-style toast. Styling lives in .toast (style.css) — nothing inline.
function showNotification(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ============================================================================
// Console greeting
// ============================================================================
console.log(
    '%c~/nika — hey there, curious developer',
    'font-family: monospace; font-size: 14px; font-weight: bold; letter-spacing: 2px; color: #a78bfa;'
);
console.log(
    '%c// reading the source? say hi: wuladzenika04@gmail.com',
    'font-family: monospace; font-size: 12px; color: #6ee7d7;'
);
