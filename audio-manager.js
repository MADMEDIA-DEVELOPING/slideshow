/* Manager avansat pentru audio cu efecte și control */

class AudioManager {
    constructor() {
        this.backgroundMusic = document.getElementById('background-music');
        this.musicToggle = document.getElementById('music-toggle');
        this.isPlaying = false;
        this.volume = 0.7;
        this.fadeInterval = null;
        this.visualizer = null;
        
        this.init();
    }
    
    init() {
        this.setupAudioEvents();
        this.createVolumeControl();
        this.createAudioVisualizer();
        this.setupAudioContext();
    }
    
    setupAudioEvents() {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume;
            
            this.backgroundMusic.addEventListener('loadstart', () => {
                console.log('Audio loading started');
            });
            
            this.backgroundMusic.addEventListener('canplaythrough', () => {
                console.log('Audio can play through');
            });
            
            this.backgroundMusic.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                this.handleAudioError();
            });
            
            this.backgroundMusic.addEventListener('ended', () => {
                this.handleAudioEnd();
            });
            
            this.backgroundMusic.addEventListener('play', () => {
                this.isPlaying = true;
                this.updateMusicButton();
                this.startVisualizer();
            });
            
            this.backgroundMusic.addEventListener('pause', () => {
                this.isPlaying = false;
                this.updateMusicButton();
                this.stopVisualizer();
            });
        }
    }
    
    createVolumeControl() {
        const musicControl = document.querySelector('.music-control');
        
        // Volume slider
        const volumeContainer = document.createElement('div');
        volumeContainer.className = 'volume-container';
        volumeContainer.innerHTML = `
            <input type="range" id="volume-slider" min="0" max="100" value="${this.volume * 100}" class="volume-slider">
            <div class="volume-display">${Math.round(this.volume * 100)}%</div>
        `;
        
        musicControl.appendChild(volumeContainer);
        
        const volumeSlider = document.getElementById('volume-slider');
        const volumeDisplay = document.querySelector('.volume-display');
        
        volumeSlider.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            if (this.backgroundMusic) {
                this.backgroundMusic.volume = this.volume;
            }
            volumeDisplay.textContent = `${e.target.value}%`;
        });
        
        // Hide/show volume on hover
        musicControl.addEventListener('mouseenter', () => {
            volumeContainer.style.opacity = '1';
            volumeContainer.style.visibility = 'visible';
        });
        
        musicControl.addEventListener('mouseleave', () => {
            volumeContainer.style.opacity = '0';
            volumeContainer.style.visibility = 'hidden';
        });
    }
    
    createAudioVisualizer() {
        const visualizerContainer = document.createElement('div');
        visualizerContainer.className = 'audio-visualizer';
        visualizerContainer.innerHTML = `
            <canvas id="visualizer-canvas" width="200" height="100"></canvas>
        `;
        
        document.querySelector('.music-control').appendChild(visualizerContainer);
        
        this.canvas = document.getElementById('visualizer-canvas');
        this.canvasContext = this.canvas.getContext('2d');
    }
    
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.backgroundMusic) {
                this.source = this.audioContext.createMediaElementSource(this.backgroundMusic);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                
                this.source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
                
                this.bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(this.bufferLength);
            }
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    startVisualizer() {
        if (!this.analyser || !this.canvas) return;
        
        const draw = () => {
            if (!this.isPlaying) return;
            
            requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(this.dataArray);
            
            this.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < this.bufferLength; i++) {
                barHeight = (this.dataArray[i] / 255) * this.canvas.height;
                
                const red = (barHeight + 25) * 2;
                const green = 250 * (i / this.bufferLength);
                const blue = 50;
                
                this.canvasContext.fillStyle = `rgb(${red}, ${green}, ${blue})`;
                this.canvasContext.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };
        
        draw();
    }
    
    stopVisualizer() {
        if (this.canvasContext) {
            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    play() {
        if (!this.backgroundMusic) return Promise.reject('No audio element');
        
        // Resume audio context if suspended
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        return this.backgroundMusic.play().then(() => {
            this.isPlaying = true;
            this.updateMusicButton();
        }).catch((error) => {
            console.error('Play failed:', error);
            this.handlePlayError(error);
        });
    }
    
    pause() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.isPlaying = false;
            this.updateMusicButton();
        }
    }
    
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    fadeIn(duration = 2000) {
        if (!this.backgroundMusic) return;
        
        this.backgroundMusic.volume = 0;
        this.play();
        
        const targetVolume = this.volume;
        const fadeStep = targetVolume / (duration / 50);
        
        this.fadeInterval = setInterval(() => {
            if (this.backgroundMusic.volume < targetVolume) {
                this.backgroundMusic.volume = Math.min(this.backgroundMusic.volume + fadeStep, targetVolume);
            } else {
                clearInterval(this.fadeInterval);
            }
        }, 50);
    }
    
    fadeOut(duration = 2000) {
        if (!this.backgroundMusic) return;
        
        const startVolume = this.backgroundMusic.volume;
        const fadeStep = startVolume / (duration / 50);
        
        this.fadeInterval = setInterval(() => {
            if (this.backgroundMusic.volume > 0) {
                this.backgroundMusic.volume = Math.max(this.backgroundMusic.volume - fadeStep, 0);
            } else {
                this.pause();
                this.backgroundMusic.volume = this.volume;
                clearInterval(this.fadeInterval);
            }
        }, 50);
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume;
        }
        
        const volumeSlider = document.getElementById('volume-slider');
        const volumeDisplay = document.querySelector('.volume-display');
        
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }
        if (volumeDisplay) {
            volumeDisplay.textContent = `${Math.round(this.volume * 100)}%`;
        }
    }
    
    updateMusicButton() {
        if (this.musicToggle) {
            this.musicToggle.textContent = this.isPlaying ? '🔊' : '🔇';
            this.musicToggle.classList.toggle('playing', this.isPlaying);
        }
    }
    
    handleAudioError() {
        console.error('Audio failed to load');
        if (this.musicToggle) {
            this.musicToggle.textContent = '❌';
            this.musicToggle.disabled = true;
        }
    }
    
    handlePlayError(error) {
        if (error.name === 'NotAllowedError') {
            this.showAutoplayMessage();
        }
    }
    
    handleAudioEnd() {
        // Audio ended, restart if loop is enabled
        if (this.backgroundMusic && this.backgroundMusic.loop) {
            this.play();
        }
    }
    
    showAutoplayMessage() {
        const message = document.createElement('div');
        message.className = 'autoplay-message';
        message.innerHTML = `
            <div class="message-content">
                <h3>🎵 Activează muzica</h3>
                <p>Apasă butonul pentru a porni muzica de fundal</p>
                <button onclick="audioManager.play(); this.parentElement.parentElement.remove();">
                    Pornește muzica
                </button>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 5000);
    }
}

// Initialize audio manager
let audioManager;

document.addEventListener('DOMContentLoaded', function() {
    audioManager = new AudioManager();
    
    // Auto-start music after intro (with fade in)
    setTimeout(() => {
        audioManager.fadeIn(3000);
    }, 8000);
});

// Global function for backward compatibility
function toggleMusic() {
    if (audioManager) {
        audioManager.toggle();
    }
}