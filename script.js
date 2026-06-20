/* ==========================================================================
   MechServi Interactive Website Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initSmoothScroll();
    initServiceFilters();
    initMetricsCounters();
    initBookingSimulator();
    initHeroInteractiveMockup();
    init3dCarousel();
    initTextRotator();
    initCircularSteps();
});
/* ==========================================================================
   Navbar & Mobile Menu
   ========================================================================== */
function initNavbar() {
    const header = document.getElementById('site-header');
    const mobileToggle = document.getElementById('mobile-toggle');

    // Scroll event for styling header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    mobileToggle.addEventListener('click', () => {
        header.classList.toggle('mobile-open');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target) && header.classList.contains('mobile-open')) {
            header.classList.remove('mobile-open');
        }
    });
}

/* ==========================================================================
   Smooth Scrolling for Anchors
   ========================================================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('nav a, .nav-actions a, .hero-actions a, footer a');
    const header = document.getElementById('site-header');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Check if link is an anchor on page
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);

                if (targetElement) {
                    // Close mobile menu if open
                    header.classList.remove('mobile-open');

                    // Calculate offset for header height
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update active states in navigation
                    document.querySelectorAll('nav a').forEach(navLink => {
                        navLink.classList.remove('active');
                    });
                    if (link.closest('nav')) {
                        link.classList.add('active');
                    }
                }
            }
        });
    });
}

/* ==========================================================================
   Service Catalog Grid Filtering
   ========================================================================== */
function initServiceFilters() {
    const tabs = document.querySelectorAll('#category-tabs .catalog-tab');
    const cards = document.querySelectorAll('#services-cards-container .service-card');
    const container = document.getElementById('services-cards-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-filter');

            cards.forEach(card => {
                if (filterValue === 'all' || card.classList.contains(filterValue)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });

            // Scroll back to start for smooth reset
            if (container) {
                container.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            }

            // Re-trigger 3D layout calculations
            if (window.trigger3dUpdate) {
                setTimeout(window.trigger3dUpdate, 50);
            }
        });
    });
}

/* ==========================================================================
   Metrics Animated Counter Logic
   ========================================================================== */
function initMetricsCounters() {
    const container = document.getElementById('stats-numbers-container');
    const counters = [{
            id: 'count-bookings',
            start: 0,
            end: 50,
            suffix: 'K+',
            duration: 2000
        },
        {
            id: 'count-vendors',
            start: 0,
            end: 1000,
            suffix: '+',
            duration: 2000
        },
        {
            id: 'count-csat',
            start: 0,
            end: 4.8,
            suffix: '★',
            duration: 1500,
            decimals: 1
        }
    ];

    let animated = false;

    const runCounters = () => {
        counters.forEach(counter => {
            const element = document.getElementById(counter.id);
            if (!element) return;

            const startTime = performance.now();
            const decimals = counter.decimals || 0;

            const update = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / counter.duration, 1);

                // Easing out quadratic
                const easeProgress = progress * (2 - progress);
                const currentValue = counter.start + (counter.end - counter.start) * easeProgress;

                element.textContent = currentValue.toFixed(decimals) + counter.suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = counter.end + counter.suffix;
                }
            };

            requestAnimationFrame(update);
        });
    };

    // Trigger on scroll visibility
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    runCounters();
                    animated = true;
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        observer.observe(container);
    } else {
        // Fallback
        runCounters();
    }
}

/* ==========================================================================
   Live Booking Simulator Engine
   ========================================================================== */
function initBookingSimulator() {
    // Simulator state tracking
    let currentState = 0;
    let timerId = null;

    // Simulator Screen States
    const states = [
        document.getElementById('sim-state-0'),
        document.getElementById('sim-state-1'),
        document.getElementById('sim-state-2'),
        document.getElementById('sim-state-3'),
        document.getElementById('sim-state-4')
    ];

    // Form Inputs
    const vehicleSelect = document.getElementById('sim-vehicle');
    const serviceSelect = document.getElementById('sim-service');

    // Simulator variables for State updates
    let selectedVehicleText = '';
    let selectedServiceName = '';
    let selectedServicePrice = '';
    let assignedPartnerName = 'Suresh Kumar';
    let assignedPartnerRating = '⭐ 4.9 (420+ washes completed)';

    // Controls
    const startDemoBtn = document.getElementById('trigger-sim-run');
    const submitBookingBtn = document.getElementById('sim-submit-booking');
    const approveWorkBtn = document.getElementById('sim-approve-work');
    const resetDemoBtn = document.getElementById('sim-finish-demo');

    // Helper: Transition to specific state screen
    const setSimState = (stateNum) => {
        currentState = stateNum;
        states.forEach((stateEl, index) => {
            if (index === stateNum) {
                stateEl.classList.add('active');
            } else {
                stateEl.classList.remove('active');
            }
        });

        // Update main demo control button text based on state
        if (stateNum === 0) {
            startDemoBtn.textContent = 'Start Live Demo';
            startDemoBtn.disabled = false;
        } else if (stateNum === 4) {
            startDemoBtn.textContent = 'Simulation Completed';
            startDemoBtn.disabled = true;
        } else {
            startDemoBtn.textContent = 'Simulating...';
            startDemoBtn.disabled = true;
        }
    };

    // Run Simulation Flow
    const runSimulation = () => {
        // Collect Form Data
        selectedVehicleText = vehicleSelect.options[vehicleSelect.selectedIndex].text;
        const serviceVal = serviceSelect.value.split('|');
        selectedServiceName = serviceVal[0];
        selectedServicePrice = '₹' + serviceVal[1];

        // Determine partner based on service type
        if (selectedServiceName.includes('Wash')) {
            assignedPartnerName = 'Suresh Kumar';
            assignedPartnerRating = '⭐ 4.9 (420+ washes completed)';
        } else if (selectedServiceName.includes('Service') || selectedServiceName.includes('Battery')) {
            assignedPartnerName = 'Ramesh Kumar';
            assignedPartnerRating = '⭐ 4.8 (850+ repairs completed)';
        } else {
            assignedPartnerName = 'Arjun Rao';
            assignedPartnerRating = '⭐ 5.0 (Emergency partner)';
        }

        // Step 1: Matching (Sonar animation)
        setSimState(1);
        const matchTextEl = document.getElementById('sim-match-text');
        matchTextEl.textContent = `Matching a certified expert for your ${selectedVehicleText.split(' ')[0]}...`;

        // Timeout to State 2: Partner Assigned
        timerId = setTimeout(() => {
            // Update State 2 Info
            document.getElementById('sim-partner-name').textContent = assignedPartnerName;
            document.getElementById('sim-partner-rating').textContent = assignedPartnerRating;
            document.getElementById('sim-state-2').querySelector('.partner-avatar').textContent = assignedPartnerName.charAt(0);

            setSimState(2);

            // Timeout to State 3: Service In Progress
            timerId = setTimeout(() => {
                // Setup State 3 Before/After Photo Mockup
                const beforePhotoBox = document.getElementById('before-photo-box');
                const afterPhotoBox = document.getElementById('after-photo-box');
                const afterPhotoStatus = document.getElementById('after-photo-status');
                const activeStepText = document.getElementById('sim-active-step');

                // Reset before / after photo elements
                beforePhotoBox.innerHTML = `
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span style="font-weight:bold; color:var(--color-primary);">Photo Loaded</span>
        `;
                beforePhotoBox.style.background = 'rgba(124, 58, 237, 0.05)';

                afterPhotoBox.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 50 50" stroke="var(--color-primary)" stroke-width="4" fill="none" class="spin-icon" style="animation: spin 1s linear infinite;">
            <circle cx="25" cy="25" r="20" stroke-dasharray="80 150" stroke-linecap="round"/>
          </svg>
          <span id="after-photo-status" style="font-weight:600;">Executing...</span>
        `;
                afterPhotoBox.style.background = 'var(--bg-secondary)';

                // Hide button initially
                approveWorkBtn.style.display = 'none';

                // Update step titles based on service
                if (selectedServiceName.includes('Wash')) {
                    activeStepText.textContent = 'Car Cleaning In Progress';
                } else if (selectedServiceName.includes('Service')) {
                    activeStepText.textContent = 'Engine Tuneup Diagnostics';
                } else {
                    activeStepText.textContent = 'Fixing flat tyre punctures';
                }

                setSimState(3);

                // After 4 seconds, show "After photo uploaded" and enable check-out button
                timerId = setTimeout(() => {
                    afterPhotoBox.innerHTML = `
            <svg width="24" height="24" fill="none" stroke="var(--color-green)" stroke-width="3" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span style="font-weight:bold; color:var(--color-green);">Work Done</span>
          `;
                    afterPhotoBox.style.background = 'rgba(16, 185, 129, 0.05)';

                    // Complete active step
                    const activeDot = document.querySelector('#sim-state-3 .prog-dot.active');
                    if (activeDot) {
                        activeDot.classList.remove('active');
                        activeDot.classList.add('completed');
                    }
                    activeStepText.textContent = 'Work Finished (Review Photos)';

                    // Show "Approve & Pay" Button
                    approveWorkBtn.style.display = 'block';
                }, 4000);

            }, 3500);

        }, 3000);
    };

    // Button Action Events
    submitBookingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        runSimulation();
    });

    startDemoBtn.addEventListener('click', () => {
        if (currentState === 0) {
            runSimulation();
        }
    });

    approveWorkBtn.addEventListener('click', () => {
        // Populate Receipt Details
        document.getElementById('receipt-vehicle').textContent = selectedVehicleText.split(' (')[0];
        document.getElementById('receipt-service').textContent = selectedServiceName;
        document.getElementById('receipt-partner').textContent = assignedPartnerName;
        document.getElementById('receipt-price').textContent = selectedServicePrice;

        setSimState(4);
    });

    resetDemoBtn.addEventListener('click', () => {
        clearTimeout(timerId);
        setSimState(0);
    });
}

/* ==========================================================================
   FAQ Accordion Dropdowns
   ========================================================================== */
const faqItems = document.querySelectorAll('#faq-accordion-list .faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Collapse all open items
        faqItems.forEach(faq => {
            faq.classList.remove('active');
            const answer = faq.querySelector('.faq-answer');
            answer.style.maxHeight = null;
        });

        // Expand current item if it wasn't already active
        if (!isActive) {
            item.classList.add('active');
            const answer = item.querySelector('.faq-answer');
            // Set scrollHeight as max-height for dynamic expansion height transition
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
});

/* ==========================================================================
   Helper Animations & Keyframe Spin Injection
   ========================================================================== */
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .spin-icon {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(styleSheet);

/* ==========================================================================
   Hero Interactive Mockup Simulator
   ========================================================================== */
function initHeroInteractiveMockup() {
    const container = document.getElementById('hero-app-state-container');
    if (!container) return;

    let activeService = 'wash';
    let mockupState = 'idle';
    let animationTimer = null;
    let countdownTimer = null;

    // DOM Elements
    const serviceBtns = document.querySelectorAll('.service-opt-btn');
    const startBtn = document.getElementById('hero-btn-start');
    const resetBtn = document.getElementById('hero-btn-reset');
    const vendorPin = document.getElementById('hero-vendor-pin');
    const vendorBadge = document.getElementById('hero-vendor-badge');

    // Widget elements
    const widgetTitle = document.getElementById('hero-widget-title');
    const widgetDesc = document.getElementById('hero-widget-desc');
    const widgetBadge = document.getElementById('hero-widget-badge');

    // States
    const idleSheet = document.getElementById('hero-sheet-idle');
    const matchingSheet = document.getElementById('hero-sheet-matching');
    const trackingSheet = document.getElementById('hero-sheet-tracking');
    const receiptSheet = document.getElementById('hero-sheet-receipt');

    // Profile
    const providerAvatar = document.getElementById('hero-provider-avatar');
    const providerName = document.getElementById('hero-provider-name');
    const providerMeta = document.getElementById('hero-provider-meta');

    // Receipt
    const receiptProvider = document.getElementById('hero-receipt-provider');
    const receiptAmount = document.getElementById('hero-receipt-amount');

    // Service details mapping
    const serviceData = {
        wash: {
            name: 'Suresh Kumar',
            vehicle: 'Suzuki Swift',
            rating: '⭐ 4.9',
            price: '₹499',
            icon: `<svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.52-.68.96-.68h9.54c.44 0 .82.28.96.68L19 11H5z" fill="currentColor"/></svg>`
        },
        repair: {
            name: 'Ramesh Kumar',
            vehicle: 'Royal Classic',
            rating: '⭐ 4.8',
            price: '₹1,299',
            icon: `<svg viewBox="0 0 24 24"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.4-2.4c.4-.4.4-1.1 0-1.4z" fill="currentColor"/></svg>`
        },
        tow: {
            name: 'Arjun Rao',
            vehicle: 'Mahindra Tow Truck',
            rating: '⭐ 5.0',
            price: '₹1,899',
            icon: `<svg viewBox="0 0 24 24"><path d="M19 8l-4-4H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-5zm-11 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-3c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm13 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-3c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg>`
        }
    };

    // State Switcher
    const switchState = (newState) => {
        mockupState = newState;
        container.setAttribute('data-state', newState);

        // Update bottom sheets
        [idleSheet, matchingSheet, trackingSheet, receiptSheet].forEach(sheet => {
            if (sheet) sheet.classList.remove('active');
        });

        if (newState === 'idle') {
            idleSheet.classList.add('active');
            widgetTitle.textContent = 'Live Tracker';
            widgetDesc.textContent = 'Select a service to start demo';
            widgetBadge.className = 'icon-badge';
            widgetBadge.innerHTML = `<svg class="icon-clock" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        } else if (newState === 'matching') {
            matchingSheet.classList.add('active');
            widgetTitle.textContent = 'Matching...';
            widgetDesc.textContent = 'Searching closest partner';
            widgetBadge.className = 'icon-badge';
            widgetBadge.innerHTML = `<svg class="spin-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"/></svg>`;
        } else if (newState === 'tracking') {
            trackingSheet.classList.add('active');
            widgetTitle.textContent = 'Tracking live';
            widgetDesc.textContent = 'Provider heading your way';
            widgetBadge.className = 'icon-badge badge-pulse';
            widgetBadge.innerHTML = `<svg class="icon-clock" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        } else if (newState === 'completed') {
            receiptSheet.classList.add('active');
            widgetTitle.textContent = 'Task Completed';
            widgetDesc.textContent = 'Premium care finished';
            widgetBadge.className = 'icon-badge';
            widgetBadge.innerHTML = `<svg class="icon-check" width="16" height="16" fill="none" stroke="var(--color-green)" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        }
    };

    // Change Service selection
    const selectService = (service) => {
        activeService = service;
        serviceBtns.forEach(btn => {
            if (btn.getAttribute('data-service') === service) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Reset pin badge and position
        vendorPin.style.transition = 'none';
        vendorPin.style.left = '140px';
        vendorPin.style.top = '220px';

        // Set SVG badge
        vendorBadge.innerHTML = serviceData[service].icon;
    };

    // Bind service buttons
    serviceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (mockupState === 'idle') {
                selectService(btn.getAttribute('data-service'));
            }
        });
    });

    // Start Live Simulation
    const startSimulation = () => {
        switchState('matching');

        // Timeout for matching
        animationTimer = setTimeout(() => {
            // Get selected data
            const data = serviceData[activeService];

            // Populate tracking panel
            providerAvatar.textContent = data.name.charAt(0);
            providerName.textContent = data.name;
            providerMeta.textContent = `${data.rating} • ${data.vehicle}`;

            // Populate receipt panel
            receiptProvider.textContent = data.name;
            receiptAmount.textContent = data.price;

            switchState('tracking');

            // Reset progress
            const fillBar = document.getElementById('hero-progress-fill');
            if (fillBar) fillBar.style.width = '0%';

            // Path coords
            const path = [{
                    left: '140px',
                    top: '145px',
                    time: 1800
                },
                {
                    left: '60px',
                    top: '145px',
                    time: 1500
                },
                {
                    left: '60px',
                    top: '65px',
                    time: 1700
                }
            ];

            // Segment animator
            let segmentIdx = 0;
            const moveNextSegment = () => {
                if (segmentIdx >= path.length) {
                    // Arrived! Switch to completed
                    setTimeout(() => {
                        switchState('completed');
                    }, 800);
                    return;
                }

                const seg = path[segmentIdx];
                vendorPin.style.transition = `left ${seg.time}ms linear, top ${seg.time}ms linear`;
                vendorPin.style.left = seg.left;
                vendorPin.style.top = seg.top;

                segmentIdx++;
                animationTimer = setTimeout(moveNextSegment, seg.time);
            };

            // Start movement
            moveNextSegment();

            // Start progress bar / countdown sync
            let startTime = null;
            const duration = 5000; // total duration

            const updateProgress = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);

                if (fillBar) fillBar.style.width = `${progress * 100}%`;

                const remainingMins = Math.ceil(12 * (1 - progress));
                const valEl = document.getElementById('hero-progress-val');
                if (valEl) {
                    valEl.textContent = remainingMins > 0 ? `${remainingMins} mins` : 'Arrived!';
                }

                if (progress < 1 && mockupState === 'tracking') {
                    countdownTimer = requestAnimationFrame(updateProgress);
                }
            };

            countdownTimer = requestAnimationFrame(updateProgress);

        }, 2500);
    };

    // Reset simulation
    const resetSimulation = () => {
        clearTimeout(animationTimer);
        cancelAnimationFrame(countdownTimer);

        vendorPin.style.transition = 'none';
        vendorPin.style.left = '140px';
        vendorPin.style.top = '220px';

        selectService(activeService);
        switchState('idle');
    };

    startBtn.addEventListener('click', startSimulation);
    resetBtn.addEventListener('click', resetSimulation);

    // Initialize defaults
    selectService('wash');

    // Auto-start the simulator after 2 seconds
    setTimeout(() => {
        startSimulation();
    }, 2000);
}

/* ==========================================================================
   3D Horizontal Cover Flow Carousel
   ========================================================================== */
function init3dCarousel() {
    const container = document.getElementById('services-cards-container');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    if (!container) return;

    // Arrow navigation and Auto-slide logic
    const slideNext = () => {
        const card = container.querySelector('.service-card:not([style*="display: none"])');
        if (card) {
            const cardWidth = card.offsetWidth;
            // If at the end, scroll back to the start
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                container.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            } else {
                container.scrollBy({
                    left: cardWidth + 32,
                    behavior: 'smooth'
                });
            }
        }
    };

    const slidePrev = () => {
        const card = container.querySelector('.service-card:not([style*="display: none"])');
        if (card) {
            const cardWidth = card.offsetWidth;
            container.scrollBy({
                left: -(cardWidth + 32),
                behavior: 'smooth'
            });
        }
    };

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', slidePrev);
        nextBtn.addEventListener('click', slideNext);
    }

    // Auto slide every 2 seconds
    let autoSlideTimer = setInterval(slideNext, 2000);

    // Pause auto-slide on hover/touch
    container.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
    container.addEventListener('touchstart', () => clearInterval(autoSlideTimer), {
        passive: true
    });

    container.addEventListener('mouseleave', () => {
        clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(slideNext, 2000);
    });
    container.addEventListener('touchend', () => {
        clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(slideNext, 2000);
    }, {
        passive: true
    });

    // Update card 3D transformation values
    const updateCardTransforms = () => {
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        const cards = container.querySelectorAll('.service-card');

        cards.forEach(card => {
            if (card.style.display === 'none') {
                card.style.transform = 'none';
                card.style.opacity = '0';
                return;
            }

            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;

            // Distance from center (-1 to 1)
            const distanceFromCenter = (cardCenter - containerCenter) / (containerRect.width / 2);
            const factor = Math.max(-1.5, Math.min(1.5, distanceFromCenter));

            // Rotate and scale based on center distance
            const rotation = -15 * factor;
            const scale = 1 - Math.min(0.18, Math.abs(factor) * 0.12);
            const translateZ = -120 * Math.min(1.2, Math.abs(factor));
            const translateX = -30 * factor;

            card.style.transform = `perspective(1000px) rotateY(${rotation}deg) scale(${scale}) translateZ(${translateZ}px) translateX(${translateX}px)`;
            card.style.opacity = 1 - Math.min(0.35, Math.abs(factor) * 0.25);

            if (Math.abs(factor) < 0.25) {
                card.style.borderColor = 'rgba(240, 90, 40, 0.18)';
                card.classList.add('center-card');
            } else {
                card.style.borderColor = 'rgba(0, 0, 0, 0.03)';
                card.classList.remove('center-card');
            }
        });
    };

    // Run on scroll and resize
    container.addEventListener('scroll', updateCardTransforms);
    window.addEventListener('resize', updateCardTransforms);

    // Custom observer to run update when categories are toggled
    const observer = new MutationObserver(() => {
        setTimeout(updateCardTransforms, 50);
    });
    observer.observe(container, {
        attributes: true,
        subtree: true,
        attributeFilter: ['style']
    });

    // Expose updater globally
    window.trigger3dUpdate = updateCardTransforms;

    // Initial trigger
    setTimeout(updateCardTransforms, 150);
}

/* ==========================================================================
   Interactive Hero Heading Text Rotator
   ========================================================================== */
function initTextRotator() {
    const wrapper = document.querySelector('.rotating-words-wrapper');
    if (!wrapper) return;
    const words = wrapper.querySelectorAll('.rotating-word');
    const underline = wrapper.querySelector('.handwritten-underline');
    let currentIndex = 0;

    function updateWidth() {
        const activeWord = words[currentIndex];
        // Create a temporary element to measure the word width accurately
        const temp = document.createElement('span');
        temp.style.font = window.getComputedStyle(activeWord).font;
        temp.style.visibility = 'hidden';
        temp.style.position = 'absolute';
        temp.style.whiteSpace = 'nowrap';
        temp.textContent = activeWord.textContent;
        document.body.appendChild(temp);
        const width = temp.getBoundingClientRect().width;
        document.body.removeChild(temp);

        // Add a small buffer to avoid pixel rounding cuts
        wrapper.style.width = `${Math.ceil(width) + 8}px`;
    }

    // Trigger draw animation on SVG underline
    function triggerUnderlineDraw() {
        if (!underline) return;
        const path = underline.querySelector('path');
        if (!path) return;
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        // Force reflow
        path.getBoundingClientRect();

        path.style.transition = 'stroke-dashoffset 0.8s ease-in-out';
        path.style.strokeDashoffset = '0';
    }

    function rotate() {
        const prevIndex = currentIndex;
        currentIndex = (currentIndex + 1) % words.length;

        words[prevIndex].classList.remove('active');
        words[prevIndex].classList.add('exit');

        // Clear exit class after slide transition completes
        setTimeout(() => {
            words[prevIndex].classList.remove('exit');
        }, 600);

        words[currentIndex].classList.add('active');
        updateWidth();

        // Reset and redraw underline SVG path
        if (underline) {
            const path = underline.querySelector('path');
            if (path) {
                path.style.transition = 'none';
                path.style.strokeDashoffset = path.getTotalLength();
                setTimeout(triggerUnderlineDraw, 50);
            }
        }
    }

    // Initialize the first word states
    words[currentIndex].classList.add('active');
    updateWidth();
    setTimeout(triggerUnderlineDraw, 300);

    // Recalculate width on window resize to ensure fluid layouts
    window.addEventListener('resize', updateWidth);

    // Cycle terms every 3.5 seconds
    setInterval(rotate, 3500);
}

/* ==========================================================================
   3D Circle Steps Process
   ========================================================================== */
function initCircularSteps() {
    const container = document.getElementById('steps-circular-container');
    if (!container) return;
    const nodes = container.querySelectorAll('.step-node');
    const panes = container.querySelectorAll('.step-detail-pane');
    const ring = container.querySelector('.steps-orbit-ring-3d');
    let activeStep = 1;
    let autoCycleTimer = null;

    function setStep(stepNum) {
        activeStep = stepNum;

        // Calculate rotation angle
        let angle = 0;
        if (stepNum === 2) angle = -120;
        else if (stepNum === 3) angle = 120;

        // Apply rotation angle to the ring
        const ringTiltX = window.innerWidth <= 480 ? 50 : 55;
        if (ring) {
            ring.style.setProperty('--orbit-rotate', `${angle}deg`);
            ring.style.transform = `rotateX(${ringTiltX}deg) rotateY(-5deg) rotateZ(${angle}deg)`;
        }

        // Update active node state
        nodes.forEach(node => {
            const stepVal = parseInt(node.getAttribute('data-step'), 10);
            node.style.setProperty('--orbit-rotate', `${angle}deg`);

            // Update coordinate transform variables dynamically so they translate and counter-rotate perfectly
            let offsetX = node.style.getPropertyValue('--offset-x').trim();
            let offsetY = node.style.getPropertyValue('--offset-y').trim();

            // Fallback coordinates per breakpoint
            if (!offsetX) {
                const w = window.innerWidth;
                if (w <= 360) {
                    offsetX = stepVal === 1 ? '0px' : stepVal === 2 ? '87px' : '-87px';
                } else if (w <= 480) {
                    offsetX = stepVal === 1 ? '0px' : stepVal === 2 ? '104px' : '-104px';
                } else {
                    offsetX = stepVal === 1 ? '0px' : stepVal === 2 ? '130px' : '-130px';
                }
            }
            if (!offsetY) {
                const w = window.innerWidth;
                if (w <= 360) {
                    offsetY = stepVal === 1 ? '-100px' : stepVal === 2 ? '50px' : '50px';
                } else if (w <= 480) {
                    offsetY = stepVal === 1 ? '-120px' : stepVal === 2 ? '60px' : '60px';
                } else {
                    offsetY = stepVal === 1 ? '-150px' : stepVal === 2 ? '75px' : '75px';
                }
            }

            // Force individual counter-rotation
            const tiltX = window.innerWidth <= 480 ? -50 : -55;
            const tiltY = 5;
            node.style.transform = `translate(-50%, -50%) translate3d(${offsetX}, ${offsetY}, 0px) rotateZ(${-angle}deg) rotateY(${tiltY}deg) rotateX(${tiltX}deg)`;

            if (stepVal === stepNum) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        });

        // Update display panes
        panes.forEach(pane => {
            const stepVal = parseInt(pane.getAttribute('data-step'), 10);
            if (stepVal === stepNum) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }

    // Bind clicks
    nodes.forEach(node => {
        node.addEventListener('click', () => {
            clearInterval(autoCycleTimer); // Pause auto-rotation on user interaction
            const stepVal = parseInt(node.getAttribute('data-step'), 10);
            setStep(stepVal);
        });
    });

    // Auto cycle every 2 seconds
    autoCycleTimer = setInterval(() => {
        let nextStep = activeStep + 1;
        if (nextStep > 3) nextStep = 1;
        setStep(nextStep);
    }, 3000);

    // Initialize
    setStep(1);

    // Also handle resize to update tilt values on coordinates
    window.addEventListener('resize', () => {
        // Clear styles to let CSS media queries apply offset updates on resize
        nodes.forEach(node => {
            node.style.removeProperty('--offset-x');
            node.style.removeProperty('--offset-y');
        });
        setStep(activeStep);
    });
}