// Variables globales
const video = document.getElementById('introVideo');
const videoContainer = document.getElementById('videoContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const soundBtn = document.getElementById('soundBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const videoUI = document.getElementById('videoUI');

let isMuted = true;
let hasEnded = false;
let autoplayAttempted = false;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initVideo();
    setupEventListeners();
    checkAutoplaySupport();
});

function initVideo() {
    // Charger les métadonnées
    video.addEventListener('loadedmetadata', () => {
        updateDuration();
        hideLoading();
        showUI();
    });
    
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', onVideoEnd);
    video.addEventListener('canplay', () => {
        hideLoading();
    });
    video.addEventListener('play', () => {
        console.log('Video playing');
    });
    video.addEventListener('pause', () => {
        console.log('Video paused');
    });
    
    // Tenter de jouer automatiquement
    attemptAutoplay();
}

function attemptAutoplay() {
    autoplayAttempted = true;
    
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Autoplay successful');
            hideLoading();
        }).catch(error => {
            console.log('Autoplay failed:', error);
            showManualPlayButton();
        });
    }
}

function showManualPlayButton() {
    // Afficher un gros bouton play personnalisé
    const playOverlay = document.createElement('div');
    playOverlay.className = 'manual-play-overlay';
    playOverlay.innerHTML = `
        <div class="manual-play-btn">
            <div style="font-size: 60px;">▶️</div>
            <p>اضغط لتشغيل الفيديو</p>
        </div>
    `;
    playOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20;
        cursor: pointer;
    `;
    
    playOverlay.onclick = () => {
        video.play();
        playOverlay.remove();
    };
    
    videoContainer.appendChild(playOverlay);
}

function setupEventListeners() {
    // Mute/unmute
    soundBtn.addEventListener('click', toggleSound);
    
    // Barre de progression cliquable
    const progressContainer = document.querySelector('.progress-bar-container');
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    });
    
    // Afficher/masquer UI au toucher
    let touchTimer;
    videoContainer.addEventListener('touchstart', () => {
        videoUI.classList.add('active');
        clearTimeout(touchTimer);
        touchTimer = setTimeout(() => {
            videoUI.classList.remove('active');
        }, 3000);
    });
    
    // Gestion de la visibilité de la page
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            video.pause();
        } else if (!hasEnded) {
            video.play().catch(e => console.log('Resume failed'));
        }
    });
}

function toggleSound() {
    isMuted = !isMuted;
    video.muted = isMuted;
    soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
    
    // Animation du bouton
    soundBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        soundBtn.style.transform = 'scale(1)';
    }, 200);
}

function updateProgress() {
    if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progress}%`;
        updateCurrentTime();
    }
}

function updateCurrentTime() {
    const current = formatTime(video.currentTime);
    currentTimeSpan.textContent = current;
}

function updateDuration() {
    const duration = formatTime(video.duration);
    durationSpan.textContent = duration;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
    }
}

function showUI() {
    setTimeout(() => {
        videoUI.classList.add('active');
        setTimeout(() => {
            videoUI.classList.remove('active');
        }, 3000);
    }, 1000);
}

function onVideoEnd() {
    if (hasEnded) return;
    hasEnded = true;
    
    console.log('Video ended - transitioning to main content');
    
    // Stocker que la vidéo a été vue
    localStorage.setItem('hasSeenVideoIntro', 'true');
    
    // Jouer l'animation de sortie
    videoContainer.classList.add('exit-transition');
    
    // Transition vers la landing page
    setTimeout(() => {
        window.location.href = 'main-content.html';
    }, 800);
}

function skipVideo() {
    if (hasEnded) return;
    hasEnded = true;
    
    console.log('User skipped video');
    localStorage.setItem('hasSeenVideoIntro', 'true');
    
    video.pause();
    videoContainer.classList.add('exit-transition');
    
    setTimeout(() => {
        window.location.href = 'main-content.html';
    }, 800);
}

function checkAutoplaySupport() {
    // Détection mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
        console.log('Mobile device detected - muted autoplay enabled');
        video.muted = true;
        isMuted = true;
    }
}

// Export pour fallback
window.toggleSound = toggleSound;
window.skipVideo = skipVideo;