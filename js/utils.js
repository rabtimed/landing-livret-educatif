// utils.js - Fonctions utilitaires partagées

/**
 * Formate le temps en MM:SS
 */
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Affiche une notification temporaire
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Supprimer les anciennes notifications
    const oldNotifications = document.querySelectorAll('.custom-notification');
    oldNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">✕</button>
        </div>
    `;
    
    // Styles
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        left: 20px;
        max-width: 400px;
        background: ${type === 'success' ? '#2DD4BF' : type === 'error' ? '#FF6B6B' : '#7B4BFF'};
        color: white;
        padding: 14px 20px;
        border-radius: 60px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        font-family: 'Cairo', sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        direction: rtl;
        text-align: right;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100px); }
        }
    `;
    if (!document.querySelector('#utils-animations')) {
        style.id = 'utils-animations';
        document.head.appendChild(style);
    }
    
    // Fermeture automatique
    setTimeout(() => {
        if (notification) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
    
    // Bouton fermeture
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    return notification;
}

/**
 * Stockage sécurisé avec fallback
 */
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Storage error:', e);
            return false;
        }
    },
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage error:', e);
            return defaultValue;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }
};

/**
 * Détection mobile
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Détection iOS
 */
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Détection Android
 */
function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

/**
 * Logger avec niveaux
 */
const logger = {
    debug: (...args) => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('[DEBUG]', ...args);
        }
    },
    info: (...args) => console.log('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args)
};

/**
 * Analytics simple (sans cookie)
 */
function trackEvent(eventName, eventData = {}) {
    logger.info('Event:', eventName, eventData);
    
    // Si tu utilises Plausible
    if (typeof plausible !== 'undefined') {
        plausible(eventName, { props: eventData });
    }
    
    // Stocker pour analyse
    const events = storage.get('tracked_events', []);
    events.push({
        name: eventName,
        data: eventData,
        timestamp: Date.now()
    });
    
    // Garder seulement les 50 derniers
    if (events.length > 50) events.shift();
    storage.set('tracked_events', events);
}

/**
 * Debounce pour performances
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Détection de la bande passante approximative
 */
function detectConnectionSpeed() {
    if ('connection' in navigator) {
        const conn = navigator.connection;
        return {
            effectiveType: conn.effectiveType || 'unknown',
            downlink: conn.downlink || null,
            rtt: conn.rtt || null,
            saveData: conn.saveData || false
        };
    }
    return { effectiveType: 'unknown', downlink: null };
}

// Export pour utilisation globale
window.utils = {
    formatTime,
    showNotification,
    storage,
    isMobile,
    isIOS,
    isAndroid,
    logger,
    trackEvent,
    debounce,
    detectConnectionSpeed
};