/* Controale avansate pentru slideshow și funcționalități extra */

class AdvancedControls {
    constructor() {
        this.isFullscreen = false;
        this.currentTheme = 'mixed';
        this.slideshowPaused = false;
        
        this.init();
    }
    
    init() {
        this.setupSpeedControl();
        this.setupThemeSelector();
        this.setupFullscreenEvents();
        this.setupKeyboardShortcuts();
        this.showControlsOnHover();
    }
    
    setupSpeedControl() {
        const speedSlider = document.getElementById('speed-slider');
        const speedDisplay = document.getElementById('speed-display');
        
        if (speedSlider && speedDisplay) {
            speedSlider.addEventListener('input', (e) => {
                const speed = parseInt(e.target.value);
                speedDisplay.textContent = `${speed / 1000}s`;
                
                if (window.slideshowManager) {
                    slideshowManager.setSlideDelay(speed);
                }
            });
        }
    }
    
    setupThemeSelector() {
        const themeSelector = document.getElementById('animation-theme');
        
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.currentTheme = e.target.value;
                this.applyAnimationTheme();
            });
        }
    }
    
    applyAnimationTheme() {
        if (!window.slideshowManager) return;
        
        const slides = document.querySelectorAll('.slide');
        
        slides.forEach(slide => {
            // Remove all animation classes
            slide.classList.remove('slide-right', 'slide-bottom', 'fade-scale', 'rotate-in');
            
            // Apply theme-specific animation
            switch(this.currentTheme) {
                case 'slide':
                    slide.classList.add('slide-right');
                    break;
                case 'fade':
                    slide.classList.add('fade-scale');
                    break;
                case 'rotate':
                    slide.classList.add('rotate-in');
                    break;
                case 'scale':
                    slide.classList.add('fade-scale');
                    break;
                case 'mixed':
                default:
                    // Keep random animations
                    break;
            }
        });
    }
    
    setupFullscreenEvents() {
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.updateFullscreenButton();
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            this.isFullscreen = !!document.webkitFullscreenElement;
            this.updateFullscreenButton();
        });
        
        document.addEventListener('mozfullscreenchange', () => {
            this.isFullscreen = !!document.mozFullScreenElement;
            this.updateFullscreenButton();
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }
            
            switch(e.key.toLowerCase()) {
                case 'f':
                    this.toggleFullscreen();
                    break;
                case 'p':
                    this.toggleSlideshow();
                    break;
                case 'm':
                    if (window.audioManager) {
                        audioManager.toggle();
                    }
                    break;
                case '+':
                case '=':
                    this.increaseSpeed();
                    break;
                case '-':
                    this.decreaseSpeed();
                    break;
                case 'r':
                    this.resetToFirstSlide();
                    break;
                case 'h':
                    this.toggleControlsHelp();
                    break;
            }
        });
    }
    
    showControlsOnHover() {
        const slideshowContainer = document.querySelector('.slideshow-container');
        const controls = document.querySelector('.slideshow-controls');
        
        if (slideshowContainer && controls) {
            let hideTimeout;
            
            slideshowContainer.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
                controls.classList.add('visible');
            });
            
            slideshowContainer.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(() => {
                    controls.classList.remove('visible');
                }, 2000);
            });
            
            // Keep controls visible when hovering over them
            controls.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
            });
            
            controls.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(() => {
                    controls.classList.remove('visible');
                }, 1000);
            });
        }
    }
    
    toggleSlideshow() {
        if (!window.slideshowManager) return;
        
        const toggleBtn = document.getElementById('slideshow-toggle');
        const playIcon = toggleBtn.querySelector('.play-icon');
        
        if (this.slideshowPaused) {
            slideshowManager.startAutoplay();
            playIcon.textContent = '⏸️';
            this.slideshowPaused = false;
        } else {
            slideshowManager.pauseAutoplay();
            playIcon.textContent = '▶️';
            this.slideshowPaused = true;
        }
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    updateFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreen-toggle');
        const fullscreenIcon = fullscreenBtn.querySelector('.fullscreen-icon');
        
        if (fullscreenIcon) {
            fullscreenIcon.textContent = this.isFullscreen ? '⛶' : '⛶';
            fullscreenBtn.title = this.isFullscreen ? 'Ieși din fullscreen (F)' : 'Intră în fullscreen (F)';
        }
    }
    
    increaseSpeed() {
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            const currentValue = parseInt(speedSlider.value);
            const newValue = Math.max(1000, currentValue - 500);
            speedSlider.value = newValue;
            speedSlider.dispatchEvent(new Event('input'));
        }
    }
    
    decreaseSpeed() {
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            const currentValue = parseInt(speedSlider.value);
            const newValue = Math.min(10000, currentValue + 500);
            speedSlider.value = newValue;
            speedSlider.dispatchEvent(new Event('input'));
        }
    }
    
    resetToFirstSlide() {
        if (window.slideshowManager) {
            slideshowManager.goToSlide(0);
        }
    }
    
    toggleControlsHelp() {
        const existingHelp = document.querySelector('.controls-help');
        
        if (existingHelp) {
            existingHelp.remove();
        } else {
            this.showControlsHelp();
        }
    }
    
    showControlsHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'controls-help';
        helpModal.innerHTML = `
            <div class="help-content">
                <h3>🎮 Controale Slideshow</h3>
                <div class="help-grid">
                    <div class="help-section">
                        <h4>Navigare</h4>
                        <p><kbd>←</kbd> <kbd>→</kbd> Slide anterior/următor</p>
                        <p><kbd>Home</kbd> Primul slide</p>
                        <p><kbd>End</kbd> Ultimul slide</p>
                        <p><kbd>Swipe</kbd> Pe mobile</p>
                    </div>
                    
                    <div class="help-section">
                        <h4>Control</h4>
                        <p><kbd>P</kbd> Play/Pause slideshow</p>
                        <p><kbd>F</kbd> Fullscreen</p>
                        <p><kbd>M</kbd> Toggle muzică</p>
                        <p><kbd>R</kbd> Reset la primul slide</p>
                    </div>
                    
                    <div class="help-section">
                        <h4>Viteză</h4>
                        <p><kbd>+</kbd> Mărește viteza</p>
                        <p><kbd>-</kbd> Micșorează viteza</p>
                        <p><kbd>Spațiu</kbd> Toggle muzică</p>
                        <p><kbd>Esc</kbd> Oprește autoplay</p>
                    </div>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" class="close-help">
                    Închide (H)
                </button>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (helpModal.parentElement) {
                helpModal.remove();
            }
        }, 10000);
    }
    
    showLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }
    
    hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }
    
    // Method to add new slide dynamically
    addSlide(imageUrl, title, description) {
        if (!window.slideshowManager) return;
        
        const slideHTML = `
            <img src="${imageUrl}" alt="${title}">
            <div class="slide-content">
                <h2>${title}</h2>
                <p>${description}</p>
            </div>
        `;
        
        slideshowManager.addSlide(slideHTML);
        this.updateProgressBar();
    }
    
    updateProgressBar() {
        if (window.slideshowManager) {
            slideshowManager.updateProgress();
        }
    }
}

// Global functions for backward compatibility
function toggleSlideshow() {
    if (window.advancedControls) {
        advancedControls.toggleSlideshow();
    }
}

function toggleFullscreen() {
    if (window.advancedControls) {
        advancedControls.toggleFullscreen();
    }
}

function changeAnimationTheme() {
    if (window.advancedControls) {
        advancedControls.applyAnimationTheme();
    }
}

// Initialize advanced controls
let advancedControls;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        advancedControls = new AdvancedControls();
        window.advancedControls = advancedControls;
    }, 7000);
});