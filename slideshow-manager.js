/* Manager avansat pentru slideshow cu efecte multiple */

class SlideshowManager {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.dot');
        this.currentIndex = 0;
        this.isPlaying = true;
        this.interval = null;
        this.animationTypes = ['slide-right', 'slide-bottom', 'fade-scale', 'rotate-in'];
        this.slideDelay = 5000;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startAutoplay();
        this.preloadImages();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch events
        this.setupTouchEvents();
        
        // Visibility change
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        }
    }
    
    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.previousSlide();
                break;
            case 'ArrowRight':
                this.nextSlide();
                break;
            case ' ':
                e.preventDefault();
                this.toggleAutoplay();
                break;
            case 'Home':
                this.goToSlide(0);
                break;
            case 'End':
                this.goToSlide(this.slides.length - 1);
                break;
        }
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAutoplay();
        } else if (this.isPlaying) {
            this.startAutoplay();
        }
    }
    
    handleResize() {
        // Recalculate slide dimensions if needed
        this.updateSlideDimensions();
    }
    
    updateSlideDimensions() {
        this.slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                img.style.objectFit = 'cover';
            }
        });
    }
    
    preloadImages() {
        this.slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img && img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }
    
    showSlide(index, animationType = null) {
        // Remove active class from all slides and dots
        this.slides.forEach(slide => {
            slide.classList.remove('active');
            this.animationTypes.forEach(type => {
                slide.classList.remove(type);
            });
        });
        
        this.dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current slide
        if (this.slides[index]) {
            const currentSlide = this.slides[index];
            currentSlide.classList.add('active');
            
            // Add random animation if not specified
            if (!animationType) {
                animationType = this.animationTypes[Math.floor(Math.random() * this.animationTypes.length)];
            }
            currentSlide.classList.add(animationType);
            
            // Animate slide content
            this.animateSlideContent(currentSlide);
            
            // Add overlay effect
            this.addOverlayEffect(currentSlide);
        }
        
        // Activate corresponding dot
        if (this.dots[index]) {
            this.dots[index].classList.add('active');
        }
        
        this.currentIndex = index;
        this.updateProgress();
    }
    
    animateSlideContent(slide) {
        const content = slide.querySelector('.slide-content');
        if (content) {
            const title = content.querySelector('h2');
            const description = content.querySelector('p');
            
            if (title) {
                title.style.animation = 'none';
                title.offsetHeight; // Trigger reflow
                title.style.animation = 'slideInFromLeft 1s ease-out forwards';
            }
            
            if (description) {
                description.style.animation = 'none';
                description.offsetHeight; // Trigger reflow
                description.style.animation = 'slideInFromLeft 1s ease-out forwards';
                description.style.animationDelay = '0.3s';
            }
        }
    }
    
    addOverlayEffect(slide) {
        // Remove existing overlay
        const existingOverlay = slide.querySelector('.slide-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Add new overlay
        const overlay = document.createElement('div');
        overlay.className = 'slide-overlay';
        slide.appendChild(overlay);
        
        // Remove overlay after animation
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 2000);
    }
    
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.showSlide(nextIndex);
        this.resetAutoplay();
    }
    
    previousSlide() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
        this.resetAutoplay();
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.showSlide(index);
            this.resetAutoplay();
        }
    }
    
    startAutoplay() {
        this.pauseAutoplay();
        this.interval = setInterval(() => {
            this.nextSlide();
        }, this.slideDelay);
        this.isPlaying = true;
    }
    
    pauseAutoplay() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isPlaying = false;
    }
    
    toggleAutoplay() {
        if (this.isPlaying) {
            this.pauseAutoplay();
        } else {
            this.startAutoplay();
        }
    }
    
    resetAutoplay() {
        if (this.isPlaying) {
            this.startAutoplay();
        }
    }
    
    updateProgress() {
        // Update progress bar if exists
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progress = ((this.currentIndex + 1) / this.slides.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    setSlideDelay(delay) {
        this.slideDelay = delay;
        if (this.isPlaying) {
            this.startAutoplay();
        }
    }
    
    addSlide(slideHTML) {
        const slideContainer = document.querySelector('.slideshow-container');
        const newSlide = document.createElement('div');
        newSlide.className = 'slide';
        newSlide.innerHTML = slideHTML;
        
        // Insert before navigation buttons
        const navBtn = slideContainer.querySelector('.nav-btn');
        slideContainer.insertBefore(newSlide, navBtn);
        
        // Update slides array
        this.slides = document.querySelectorAll('.slide');
        
        // Add corresponding dot
        this.addDot();
    }
    
    addDot() {
        const dotsContainer = document.querySelector('.dots-container');
        const newDot = document.createElement('span');
        newDot.className = 'dot';
        newDot.onclick = () => this.goToSlide(this.slides.length - 1);
        dotsContainer.appendChild(newDot);
        
        // Update dots array
        this.dots = document.querySelectorAll('.dot');
    }
}

// Initialize slideshow manager
let slideshowManager;

document.addEventListener('DOMContentLoaded', function() {
    // Wait for intro to finish
    setTimeout(() => {
        slideshowManager = new SlideshowManager();
    }, 7000);
});

// Global functions for backward compatibility
function changeSlide(direction) {
    if (slideshowManager) {
        if (direction === 1) {
            slideshowManager.nextSlide();
        } else {
            slideshowManager.previousSlide();
        }
    }
}

function currentSlide(index) {
    if (slideshowManager) {
        slideshowManager.goToSlide(index - 1);
    }
}