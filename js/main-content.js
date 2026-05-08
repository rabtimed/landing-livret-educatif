document.addEventListener('DOMContentLoaded', () => {
    initReplayButton();
    initDownloadButton();
    initScrollAnimations();
    trackVisit();
});

function initReplayButton() {
    const replayBtn = document.querySelector('.replay-video');
    if (replayBtn) {
        replayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('hasSeenVideoIntro');
            window.location.href = 'intro-video.html';
        });
    }
}

function initDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'apk_download', {
                    'event_category': 'engagement',
                    'event_label': 'main_content_download'
                });
            }
            
            // Afficher notification
            showNotification('جاري التحميل...', 'success');
        });
    }
}

function initScrollAnimations() {
    const elements = document.querySelectorAll('.benefit-card, .parent-card, .download-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<div>${message}</div>`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2DD4BF' : '#7B4BFF'};
        color: white;
        padding: 12px 24px;
        border-radius: 48px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: bold;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function trackVisit() {
    const startTime = sessionStorage.getItem('entryTimestamp');
    if (startTime) {
        const duration = (Date.now() - parseInt(startTime)) / 1000;
        console.log(`Time to main content: ${duration}s`);
    }
}

// Ajouter les animations CSS manquantes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);