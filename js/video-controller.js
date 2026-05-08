// video-controller.js - sans overlay manuel, lecture au clic si autoplay bloqué

const video = document.getElementById('introVideo');
const videoContainer = document.getElementById('videoContainer');
const loadingOverlay = document.getElementById('loadingOverlay');
const soundBtn = document.getElementById('soundBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const videoUI = document.getElementById('videoUI');

let isMuted = false;      // son activé par défaut
let hasEnded = false;
let clickHandlerAttached = false;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initVideo();
    setupEventListeners();
    checkAutoplaySupport();
});

function initVideo() {
    // Désactiver le mute pour avoir du son par défaut
    video.muted = false;
    if (soundBtn) soundBtn.innerHTML = '🔊';  // icône son activé

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
            console.log('Autoplay réussi');
            hideLoading();
        }).catch(error => {
            console.log('Autoplay bloqué par le navigateur:', error);
            enableClickToPlay();
        });
    }
}

// Pas d'overlay graphique : on écoute le clic sur le conteneur vidéo
function enableClickToPlay() {
    if (clickHandlerAttached) return;
    clickHandlerAttached = true;

    const playOnClick = () => {
        video.play().then(() => {
            console.log('Lecture démarrée après clic utilisateur');
            videoContainer.removeEventListener('click', playOnClick);
            clickHandlerAttached = false;
        }).catch(e => console.log('Échec lecture après clic', e));
    };
    videoContainer.addEventListener('click', playOnClick);
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

    // Affichage temporaire de l'UI au toucher sur mobile
    let touchTimer;
    if (videoContainer) {
        videoContainer.addEventListener('touchstart', () => {
            if (videoUI) {
                videoUI.classList.add('active');
                clearTimeout(touchTimer);
                touchTimer = setTimeout(() => {
                    if (videoUI) videoUI.classList.remove('active');
                }, 3000);
            }
        });
    }

    // Gestion de la visibilité de la page (mise en pause si onglet caché)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            video.pause();
        } else if (!hasEnded) {
            video.play().catch(e => console.log('Reprise après retour onglet impossible', e));
        }
    });
}

function toggleSound() {
    isMuted = !isMuted;
    video.muted = isMuted;
    if (soundBtn) {
        soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
        soundBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            if (soundBtn) soundBtn.style.transform = 'scale(1)';
        }, 200);
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
        setTimeout(() => {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }, 500);
    }
}

function showUI() {
    if (videoUI) {
        videoUI.classList.add('active');
        setTimeout(() => {
            if (videoUI) videoUI.classList.remove('active');
        }, 3000);
    }
}

function onVideoEnd() {
    if (hasEnded) return;
    hasEnded = true;
    console.log('Fin de la vidéo – redirection vers main-content');
    if (videoContainer) videoContainer.classList.add('exit-transition');
    setTimeout(() => {
        window.location.href = 'main-content.html';
    }, 800);
}

// Fonction globale pour le bouton "تخطي" (référencée dans intro-video.html)
window.skipVideo = function() {
    if (hasEnded) return;
    hasEnded = true;
    console.log('Utilisateur a cliqué sur تخطي');
    if (video) video.pause();
    if (videoContainer) videoContainer.classList.add('exit-transition');
    setTimeout(() => {
        window.location.href = 'main-content.html';
    }, 800);
};

// Fonction globale pour le bouton du son (si appelé directement dans le HTML)
window.toggleSound = toggleSound;

function checkAutoplaySupport() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
        console.log('Appareil mobile détecté – autoplay avec son souvent bloqué, clic requis');
    }
}