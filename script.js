// ========================================
// Portfolio JavaScript - Music Player & Interactivity
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize intro overlay first
    initIntroOverlay();

    // Initialize all other modules
    initNavigation();
    initScrollReveal();
    initMusicPlayer();
    initContactForm();
    initSmoothScroll();
});

// ========================================
// Intro Overlay - Starts Music on Enter
// ========================================
function initIntroOverlay() {
    const overlay = document.getElementById('introOverlay');
    const enterBtn = document.getElementById('enterBtn');
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const player = document.getElementById('musicPlayer');

    enterBtn?.addEventListener('click', () => {
        // Hide overlay with animation
        overlay.classList.add('hidden');

        // Set volume to 15% and play music
        if (audio) {
            audio.volume = 0.15;
            audio.play()
                .then(() => {
                    if (playBtn) playBtn.classList.add('playing');
                    if (player) player.classList.add('expanded');
                    // Update volume slider
                    const volumeSlider = document.getElementById('volumeSlider');
                    if (volumeSlider) volumeSlider.value = 15;
                })
                .catch(err => console.log('Audio error:', err));
        }
    });
}

// ========================================
// Navigation
// ========================================
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    navToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu on link click
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        } else {
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        }
    });
}

// ========================================
// Smooth Scroll
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// Scroll Reveal Animation
// ========================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.about-card, .skill-card, .project-card, .contact-info, .contact-form'
    );

    // Add reveal class
    revealElements.forEach(el => el.classList.add('reveal'));

    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100) {
                el.classList.add('active');
            }
        });
    };

    // Initial check
    revealOnScroll();

    // Check on scroll
    window.addEventListener('scroll', revealOnScroll);
}

// ========================================
// Music Player
// ========================================
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

    let isExpanded = false;

    // Toggle player expansion
    toggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        player.classList.toggle('expanded', isExpanded);
    });

    // Close player when clicking outside
    document.addEventListener('click', (e) => {
        if (isExpanded && !player.contains(e.target)) {
            isExpanded = false;
            player.classList.remove('expanded');
        }
    });

    // Play/Pause functionality
    playBtn?.addEventListener('click', () => {
        if (audio.paused) {
            audio.play()
                .then(() => {
                    playBtn.classList.add('playing');
                })
                .catch(err => {
                    console.log('Audio playback failed:', err);
                    showNotification('🎵 Please add chubina.mp3 to the assets folder');
                });
        } else {
            audio.pause();
            playBtn.classList.remove('playing');
        }
    });

    // Update progress bar
    audio?.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${progress}%`;
        timeCurrent.textContent = formatTime(audio.currentTime);
    });

    // Load metadata
    audio?.addEventListener('loadedmetadata', () => {
        timeTotal.textContent = formatTime(audio.duration);
    });

    // Seek functionality
    progressBar?.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    // Volume control
    volumeSlider?.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });

    // Set initial volume to 15%
    if (audio && volumeSlider) {
        audio.volume = 0.15;
        volumeSlider.value = 15;
    }

    // Autoplay on page load
    if (audio && player && playBtn) {
        // Expand the player
        isExpanded = true;
        player.classList.add('expanded');

        // Try to autoplay (may be blocked by browser policy)
        const tryAutoplay = () => {
            audio.play()
                .then(() => {
                    playBtn.classList.add('playing');
                })
                .catch(err => {
                    console.log('Autoplay blocked by browser. Click to play.');
                    // Add click listener to start on first interaction
                    document.addEventListener('click', function startOnClick() {
                        audio.play().then(() => {
                            playBtn.classList.add('playing');
                        });
                        document.removeEventListener('click', startOnClick);
                    }, { once: true });
                });
        };

        // Small delay to ensure DOM is ready
        setTimeout(tryAutoplay, 500);
    }

    // Previous/Next buttons (for future playlist support)
    prevBtn?.addEventListener('click', () => {
        audio.currentTime = 0;
    });

    nextBtn?.addEventListener('click', () => {
        audio.currentTime = 0;
    });

    // When audio ends
    audio?.addEventListener('ended', () => {
        playBtn.classList.remove('playing');
        progressFill.style.width = '0%';
        audio.currentTime = 0;
    });

    // Format time helper
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Notification helper
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 24px;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s forwards;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }

    // Add notification animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// Contact Form
// ========================================
function initContactForm() {
    const form = document.getElementById('contactForm');

    form?.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Simple validation
        if (!data.name || !data.email || !data.message) {
            showFormMessage('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(data.email)) {
            showFormMessage('Please enter a valid email', 'error');
            return;
        }

        // Simulate form submission
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>Sending...</span>';
        btn.disabled = true;

        setTimeout(() => {
            showFormMessage('Message sent successfully! 🎉', 'success');
            form.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1500);
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFormMessage(message, type) {
        // Remove existing message
        const existingMsg = document.querySelector('.form-message');
        existingMsg?.remove();

        const msgEl = document.createElement('div');
        msgEl.className = `form-message ${type}`;
        msgEl.style.cssText = `
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-weight: 500;
            text-align: center;
            animation: fadeIn 0.3s ease;
            ${type === 'success'
                ? 'background: rgba(39, 201, 63, 0.2); color: #27c93f; border: 1px solid rgba(39, 201, 63, 0.3);'
                : 'background: rgba(255, 95, 86, 0.2); color: #ff5f56; border: 1px solid rgba(255, 95, 86, 0.3);'
            }
        `;
        msgEl.textContent = message;

        form.insertBefore(msgEl, form.firstChild);

        setTimeout(() => msgEl.remove(), 4000);
    }
}

// ========================================
// Utility Functions
// ========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add fadeIn animation
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(fadeStyle);

// Console greeting
console.log('%c👋 Hey there, curious developer!', 'font-size: 20px; font-weight: bold; color: #8b5cf6;');
console.log('%cLooking at my code? Feel free to reach out - I love talking about web development!', 'font-size: 14px; color: #06b6d4;');
