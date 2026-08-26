/* ==========================================================================
   Kinetic Spin Portfolio - Core JS Interaction
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Mobile Navigation Menu Toggle
    // ==========================================
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileNavToggle && navLinksContainer) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('open');
            navLinksContainer.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.classList.remove('open');
                navLinksContainer.classList.remove('active');
            });
        });
    }


    // ==========================================
    // 2. Header State & Navigation Highlights on Scroll
    // ==========================================
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        // Toggle Scrolled Header BG
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Link Highlight
        let currentSectionId = '';
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initial check


    // ==========================================
    // 3. HTML5 Canvas Particles System
    // ==========================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let numberOfParticles = 50;

        // Resize Canvas to fit screen
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Recalculate particle density based on screen size
            if (window.innerWidth < 768) {
                numberOfParticles = 25;
            } else {
                numberOfParticles = 60;
            }
            initParticles();
        };

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1; // 1px to 3px
                this.speedX = (Math.random() - 0.5) * 0.4; // subtle drift
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Screen Wrap
                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize Particles
        const initParticles = () => {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        };

        // Draw Lines Connecting Close Particles
        const connectParticles = () => {
            const maxDistance = 120;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    const dx = particlesArray[a].x - particlesArray[b].x;
                    const dy = particlesArray[a].y - particlesArray[b].y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < maxDistance) {
                        // Calculate opacity based on distance
                        const lineOpacity = (1 - (distance / maxDistance)) * 0.12;
                        ctx.strokeStyle = `rgba(0, 255, 216, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particlesArray.forEach(particle => {
                particle.update();
                particle.draw();
            });

            connectParticles();
            requestAnimationFrame(animate);
        };

        // Event Listeners for Canvas
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }


    // ==========================================
    // 4. Scroll-Reveal Framework
    // ==========================================
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it's the about section, trigger metric counters
                if (entry.target.id === 'about') {
                    startMetricsCounter();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ==========================================
    // 5. Metrics Counter Animation
    // ==========================================
    let metricsStarted = false;

    const startMetricsCounter = () => {
        if (metricsStarted) return;
        metricsStarted = true;

        const counters = document.querySelectorAll('.metric-num');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-val'), 10);
            const duration = 1500; // 1.5s
            const startTime = performance.now();

            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(easeProgress * target);

                counter.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.textContent = target; // Ensure exact final value
                }
            };

            requestAnimationFrame(updateCount);
        });
    };


    // ==========================================
    // 6. Portfolio Grid Filter logic
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.classList.remove('hide');
                    // Add micro fade-in animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.classList.add('hide');
                }
            });
        });
    });


    // ==========================================
    // 7. Interactive Kinetic Core mouse-tracking
    // ==========================================
    const kineticCore = document.getElementById('kineticCore');
    if (kineticCore) {
        kineticCore.addEventListener('mousemove', (e) => {
            const rect = kineticCore.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Tilt core graphic based on cursor position
            kineticCore.style.transform = `perspective(1000px) rotateX(${-y * 0.12}deg) rotateY(${x * 0.12}deg) scale(1.03)`;
        });

        kineticCore.addEventListener('mouseleave', () => {
            // Reset position
            kineticCore.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });

        // Click interaction: brief warp acceleration
        kineticCore.addEventListener('click', () => {
            const rings = kineticCore.querySelectorAll('.ring');
            rings.forEach(ring => {
                ring.style.animationDuration = '0.5s';
            });
            kineticCore.style.filter = 'brightness(1.5)';

            setTimeout(() => {
                // Restore default styles
                kineticCore.style.filter = '';
                const outer = kineticCore.querySelector('.outer-ring');
                const mid = kineticCore.querySelector('.mid-ring');
                const inner = kineticCore.querySelector('.inner-ring');
                if (outer) outer.style.animationDuration = '';
                if (mid) mid.style.animationDuration = '';
                if (inner) inner.style.animationDuration = '';
            }, 1000);
        });
    }


    // ==========================================
    // 8. Contact Form Client-side Validation
    // ==========================================
    const form = document.getElementById('contactForm');
    const formSuccessOverlay = document.getElementById('formSuccess');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateInput = (input, errorEl, checkFn) => {
        const isValid = checkFn(input.value.trim());
        const formGroup = input.closest('.form-group');

        if (!isValid) {
            formGroup.classList.add('invalid');
            return false;
        } else {
            formGroup.classList.remove('invalid');
            return true;
        }
    };

    if (form) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const msgInput = document.getElementById('message');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Run validations
            const isNameValid = validateInput(nameInput, null, val => val.length > 0);
            const isEmailValid = validateInput(emailInput, null, val => emailRegex.test(val));
            const isMsgValid = validateInput(msgInput, null, val => val.length > 0);

            if (isNameValid && isEmailValid && isMsgValid) {
                // Show Success Overlay with animation
                formSuccessOverlay.classList.add('show');
                form.reset();
            }
        });

        // Live validation on blur
        nameInput.addEventListener('blur', () => validateInput(nameInput, null, val => val.length > 0));
        emailInput.addEventListener('blur', () => validateInput(emailInput, null, val => emailRegex.test(val)));
        msgInput.addEventListener('blur', () => validateInput(msgInput, null, val => val.length > 0));

        // Clear error markings on input focus/type
        [nameInput, emailInput, msgInput].forEach(input => {
            input.addEventListener('input', () => {
                input.closest('.form-group').classList.remove('invalid');
            });
        });
    }

    if (closeSuccessBtn && formSuccessOverlay) {
        closeSuccessBtn.addEventListener('click', () => {
            formSuccessOverlay.classList.remove('show');
        });
    }
});
