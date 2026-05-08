// video-controller.js - Son activé par défaut, bouton تخطي en haut à gauche

const video = document.getElementById('introVideo');
const videoContainer = document.getElementById('videoContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const soundBtn = document.getElementById('soundBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const videoUI = document.getElementById('videoUI');

let isMuted = false;   // son activé
let hasEnded = false;

document.addEventListener('DOMContentLoaded', () => {
    initVideo();
    setupEventListeners();
    checkAutoplaySupport();
});

function initVideo() {
    video.muted = false;   // forcer son activé
    if (soundBtn) soundBtn.innerHTML = '🔊';
    
    video.addEventListener('loadedmetadata', () => {
        updateDuration();
        hideLoading();
        showUI();
    });
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', onVideoEnd);
    video.addEventListener('canplay', () => hideLoading());
    video.addEventListener('play', () => console.log('Video playing'));
    video.addEventListener('pause', () => console.log('Video paused'));
    attemptAutoplay();
}

function attemptAutoplay() {
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
    const playOverlay = document.createElement('div');
    playOverlay.className = 'manual-play-overlay';
    playOverlay.innerHTML = `
        <div class="manual-play-btn">
            <div style="font-size: 60px;">▶️</div>
            <p>اضغط لتشغيل الفيديو</p>
        </div>
    `;
    playOverlay.onclick = () => {
        video.play();
        playOverlay.remove();
    };
    videoContainer.appendChild(playOverlay);
}

function setupEventListeners() {
    if (soundBtn) soundBtn.addEventListener('click', toggleSound);
    const progressContainer = document.querySelector('.progress-bar-container');
    if (progressContainer) {
        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });
    }
    let touchTimer;
    videoContainer.addEventListener('touchstart', () => {
        if (videoUI) {
            videoUI.classList.add('active');
            clearTimeout(touchTimer);
            touchTimer = setTimeout(() => videoUI.classList.remove('active'), 3000);
        }
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) video.pause();
        else if (!hasEnded) video.play().catch(e => console.log('Resume failed'));
    });
}

function toggleSound() {
    isMuted = !isMuted;
    video.muted = isMuted;
    if (soundBtn) {
        soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
        soundBtn.style.transform = 'scale(1.2)';
        setTimeout(() => { if (soundBtn) soundBtn.style.transform = 'scale(1)'; }, 200);
    }
}

function updateProgress() {
    if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (currentTimeSpan) currentTimeSpan.textContent = formatTime(video.currentTime);
    }
}

function updateDuration() {
    if (durationSpan) durationSpan.textContent = formatTime(video.duration);
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
        setTimeout(() => loadingOverlay.style.display = 'none', 500);
    }
}

function showUI() {
    if (videoUI) {
        videoUI.classList.add('active');
        setTimeout(() => videoUI.classList.remove('active'), 3000);
    }
}

function onVideoEnd() {
    if (hasEnded) return;
    hasEnded = true;
    console.log('Video ended – redirect');
    if (videoContainer) videoContainer.classList.add('exit-transition');
    setTimeout(() => window.location.href = 'main-content.html', 800);
}

function skipVideo() {
    if (hasEnded) return;
    hasEnded = true;
    console.log('User skipped');
    if (video) video.pause();
    if (videoContainer) videoContainer.classList.add('exit-transition');
    setTimeout(() => window.location.href = 'main-content.html', 800);
}

function checkAutoplaySupport() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) console.log('Mobile device detected – autoplay may need user gesture');
}

window.toggleSound = toggleSound;
window.skipVideo = skipVideo;