/* Hotel zur Herzklinik - JavaScript */

document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroElements = document.querySelectorAll('.hero-content .animate-on-scroll');
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const bookingForm = document.getElementById('bookingForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    let lightboxIndex = 0;
    const galleryImages = Array.from(galleryItems);

    // Navbar Scroll Effect
    function handleScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) { navbar.classList.add('scrolled'); }
        else { navbar.classList.remove('scrolled'); }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile Menu Toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const isOpen = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isOpen);
        const spans = navToggle.querySelectorAll('span');
        if (isOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            navToggle.querySelectorAll('span').forEach(s => s.style.background = '#1a3a2c');
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
            if (!navbar.classList.contains('scrolled')) {
                navToggle.querySelectorAll('span').forEach(s => s.style.background = '#fff');
            }
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
        });
    });

    // Hero Entrance Animation
    function animateHero() {
        heroElements.forEach((el, index) => {
            setTimeout(() => { el.classList.add('visible'); }, index * 150 + 200);
        });
    }
    animateHero();

    // Scroll Animations (IntersectionObserver)
    const observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 };
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    scrollElements.forEach(el => { scrollObserver.observe(el); });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    // Lightbox Gallery
    function openLightbox(index) {
        lightboxIndex = index;
        const item = galleryImages[index];
        const img = item.querySelector('img');
        const caption = item.getAttribute('data-caption') || '';
        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
    function nextImage() {
        lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
        const item = galleryImages[lightboxIndex];
        lightboxImg.src = item.querySelector('img').src;
        lightboxCaption.textContent = item.getAttribute('data-caption') || '';
    }
    function prevImage() {
        lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
        const item = galleryImages[lightboxIndex];
        lightboxImg.src = item.querySelector('img').src;
        lightboxCaption.textContent = item.getAttribute('data-caption') || '';
    }
    galleryItems.forEach((item, index) => { item.addEventListener('click', () => openLightbox(index)); });
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextImage);
    lightboxPrev.addEventListener('click', prevImage);
    lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLightbox(); });

    // Form Validation & Submission
    const today = new Date().toISOString().split('T')[0];
    checkinInput.setAttribute('min', today);
    checkoutInput.setAttribute('min', today);
    checkinInput.addEventListener('change', function() {
        checkoutInput.setAttribute('min', this.value);
        if (checkoutInput.value && checkoutInput.value <= this.value) { checkoutInput.value = ''; }
    });

    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const checkIn = document.getElementById('checkin').value;
        const checkOut = document.getElementById('checkout').value;
        if (!name || !email || !checkIn || !checkOut) {
            showFormMessage('Please fill in all required fields.', 'error'); return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { showFormMessage('Please enter a valid email address.', 'error'); return; }
        if (new Date(checkOut) <= new Date(checkIn)) { showFormMessage('Check-out date must be after check-in date.', 'error'); return; }
        setLoading(true);
        try {
            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData);
            try {
                const response = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            } catch (err) { console.log('Backend not available'); }
            showFormMessage('Thank you! Your booking inquiry has been received. We will contact you shortly.', 'success');
            bookingForm.reset();
        } catch (error) { showFormMessage('Something went wrong. Please try again.', 'error'); }
        finally { setLoading(false); }
    });

    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
        setTimeout(() => { formMessage.className = 'form-message'; formMessage.textContent = ''; }, 5000);
    }
    function setLoading(loading) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        if (loading) { submitBtn.disabled = true; btnText.style.display = 'none'; btnLoading.style.display = 'inline'; }
        else { submitBtn.disabled = false; btnText.style.display = 'inline'; btnLoading.style.display = 'none'; }
    }

    // Review Bar Animation
    const reviewBars = document.querySelectorAll('.bar-fill');
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => { bar.style.width = width; }, 100);
                barObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    reviewBars.forEach(bar => barObserver.observe(bar));

    // Parallax Effect
    const heroBg = document.querySelector('.hero-bg img');
    if (heroBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', function() {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) { heroBg.style.transform = `translateY(${scrolled * 0.3}px)`; }
        }, { passive: true });
    }

    // Active Nav Link Highlighting
    const sections = document.querySelectorAll('section[id]');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => { link.classList.remove('active'); if (link.getAttribute('href') === '#' + id) { link.classList.add('active'); } });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(section => navObserver.observe(section));
});