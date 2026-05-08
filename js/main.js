// Configuration
const CONFIG = {
    apkUrl: 'assets/apk/app-educative-v1.apk',
    videoUrl: 'assets/video/demo-preview.mp4'
};

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initVideoModal();
    initDownloadButton();
    initSmoothScroll();
    initHeaderScroll();
});

// Animation au scroll
function initScrollAnimations() {
    const elements = document.querySelectorAll('.benefit-card, .parent-card, .universe-content');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    elements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
}

// Modal vidéo
function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const playBtn = document.getElementById('playVideoBtn');
    const closeBtn = document.querySelector('.close');
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            const video = modal.querySelector('video');
            if (video) video.play();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            const video = modal.querySelector('video');
            if (video) video.pause();
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            const video = modal.querySelector('video');
            if (video) video.pause();
        }
    });
}

// Bouton téléchargement APK avec feedback
function initDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            // Simuler début de téléchargement
            const originalText = downloadBtn.innerHTML;
            downloadBtn.classList.add('loading');
            downloadBtn.innerHTML = '⏳ Téléchargement en cours...';
            
            // Simuler délai pour l'effet (optionnel)
            setTimeout(() => {
                downloadBtn.classList.remove('loading');
                downloadBtn.innerHTML = originalText;
                
                // Afficher message de confirmation
                showNotification('Téléchargement lancé ! Vérifie tes fichiers', 'success');
            }, 1500);
            
            // Redirection réelle vers APK
            // window.location.href = CONFIG.apkUrl;
        });
    }
}

// Notification système stylée
function showNotification(message, type = 'info') {
    // Créer notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;
    
    // Styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    // Fermeture automatique
    setTimeout(() => {
        notification.remove();
    }, 4000);
    
    // Bouton fermeture
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => notification.remove());
    }
}

// Smooth scroll pour les ancres
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Header scroll effect
function initHeaderScroll() {
    const header = document.querySelector('.floating-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// Détection mobile pour instructions APK
if (/Android/i.test(navigator.userAgent)) {
    const instructions = document.querySelector('.apk-instructions');
    if (instructions) {
        instructions.innerHTML = '📱 Appuyez sur le bouton, puis "Autoriser" si votre téléphone demande l\'installation depuis sources inconnues';
    }
}

// Analytics (optionnel sans cookie)
function trackEvent(eventName) {
    console.log(`[Analytics] ${eventName}`);
    // Intégrer Matomo ou Plausible ici si besoin
}

// Téléchargement suivi
if (document.getElementById('downloadBtn')) {
    document.getElementById('downloadBtn').addEventListener('click', () => {
        trackEvent('apk_download_click');
    });
}