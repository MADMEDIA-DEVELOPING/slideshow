// Variables
let currentSlideIndex = 0;
let slides = [];
let dots = [];
let slideInterval;
let musicPlaying = false;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSlideshow();
    setupIntro();
});

// Setup intro sequence
function setupIntro() {
    // Start main content after intro
    setTimeout(() => {
        document.getElementById('main-content').classList.remove('hidden');
        startSlideshow();
        // Auto-start music (note: many browsers block autoplay)
        setTimeout(() => {
            playBackgroundMusic();
        }, 1000);
    }, 7000); // 7 seconds total intro time
}

// Initialize slideshow
function initializeSlideshow() {
    slides = document.querySelectorAll('.slide');
    dots = document.querySelectorAll('.dot');
    
    // Show first slide
    showSlide(0);
}

// Start automatic slideshow
function startSlideshow() {
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 5 seconds
}

// Show specific slide
function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Remove active class from all dots
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Show current slide with animation
    if (slides[index]) {
        slides[index].classList.add('active');
        
        // Animate slide content
        const slideContent = slides[index].querySelector('.slide-content');
        if (slideContent) {
            slideContent.style.animation = 'none';
            slideContent.offsetHeight; // Trigger reflow
            slideContent.style.animation = 'slideInFromLeft 1s ease-out forwards';
            
            const paragraph = slideContent.querySelector('p');
            if (paragraph) {
                paragraph.style.animation = 'none';
                paragraph.offsetHeight; // Trigger reflow
                paragraph.style.animation = 'slideInFromLeft 1s ease-out forwards';
                paragraph.style.animationDelay = '0.3s';
            }
        }
    }
    
    // Activate corresponding dot
    if (dots[index]) {
        dots[index].classList.add('active');
    }
    
    currentSlideIndex = index;
}

// Next slide
function nextSlide() {
    const nextIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(nextIndex);
}

// Previous slide
function prevSlide() {
    const prevIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
}

// Change slide (called by navigation buttons)
function changeSlide(direction) {
    // Clear auto slideshow temporarily
    clearInterval(slideInterval);
    
    if (direction === 1) {
        nextSlide();
    } else {
        prevSlide();
    }
    
    // Restart auto slideshow
    setTimeout(() => {
        startSlideshow();
    }, 8000); // Wait 8 seconds before auto-advance resumes
}

// Go to specific slide (called by dots)
function currentSlide(index) {
    clearInterval(slideInterval);
    showSlide(index - 1); // Convert to 0-based index
    
    // Restart auto slideshow
    setTimeout(() => {
        startSlideshow();
    }, 8000);
}

// Background music functions
function playBackgroundMusic() {
    const music = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    
    music.play().then(() => {
        musicPlaying = true;
        musicToggle.textContent = '🔊';
    }).catch((error) => {
        console.log('Autoplay prevented:', error);
        musicPlaying = false;
        musicToggle.textContent = '🔇';
    });
}

function toggleMusic() {
    const music = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    
    if (musicPlaying) {
        music.pause();
        musicToggle.textContent = '🔇';
        musicPlaying = false;
    } else {
        music.play().then(() => {
            musicToggle.textContent = '🔊';
            musicPlaying = true;
        }).catch((error) => {
            console.log('Play failed:', error);
        });
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'ArrowLeft':
            changeSlide(-1);
            break;
        case 'ArrowRight':
            changeSlide(1);
            break;
        case ' ': // Spacebar
            event.preventDefault();
            toggleMusic();
            break;
        case 'Escape':
            // Pause slideshow
            clearInterval(slideInterval);
            break;
    }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            changeSlide(1);
        } else {
            // Swipe right - previous slide
            changeSlide(-1);
        }
    }
}

// Pause slideshow when tab is not visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearInterval(slideInterval);
    } else {
        startSlideshow();
    }
});

// Add smooth scroll behavior for better UX
document.documentElement.style.scrollBehavior = 'smooth';