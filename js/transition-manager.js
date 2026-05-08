// transition-manager.js - Gestion des transitions entre écrans

class TransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.transitionDuration = 800; // ms
        this.setupEventListeners();
    }
    
    /**
     * Initialise les écouteurs pour la capture de liens
     */
    setupEventListeners() {
        // Intercepter tous les clics sur les liens internes
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.target && !link.hasAttribute('download')) {
                const url = new URL(link.href);
                if (url.origin === window.location.origin) {
                    e.preventDefault();
                    this.navigateTo(link.href);
                }
            }
        });
        
        // Gestion du bouton retour
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.url) {
                this.transitionToPage(e.state.url, false);
            }
        });
    }
    
    /**
     * Transition vers une nouvelle page
     */
    async navigateTo(url, addToHistory = true) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Animation de sortie
        await this.playExitAnimation();
        
        // Naviguer
        if (addToHistory) {
            history.pushState({ url: url }, '', url);
        }
        
        window.location.href = url;
    }
    
    /**
     * Transition avec chargement SPA-like
     */
    async transitionToPage(url, addToHistory = true) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        try {
            // Animation de sortie
            await this.playExitAnimation();
            
            // Charger le contenu
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Remplacer le contenu
            const newContent = doc.querySelector('main') || doc.body;
            const oldContent = document.querySelector('main') || document.body;
            
            if (newContent && oldContent) {
                oldContent.innerHTML = newContent.innerHTML;
                
                // Mettre à jour le titre
                document.title = doc.title;
                
                // Réexécuter les scripts
                this.reExecuteScripts(doc);
                
                // Animation d'entrée
                await this.playEnterAnimation();
            }
            
            if (addToHistory) {
                history.pushState({ url: url }, '', url);
            }
            
            // Déclencher event personnalisé
            window.dispatchEvent(new CustomEvent('pageTransition', { detail: { url } }));
            
        } catch (error) {
            console.error('Transition error:', error);
            // Fallback: navigation normale
            window.location.href = url;
        } finally {
            this.isTransitioning = false;
        }
    }
    
    /**
     * Animation de sortie
     */
    playExitAnimation() {
        return new Promise((resolve) => {
            const container = document.querySelector('.video-container') || document.body;
            container.style.animation = 'fadeOutScale 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            
            setTimeout(() => {
                resolve();
            }, this.transitionDuration);
        });
    }
    
    /**
     * Animation d'entrée
     */
    playEnterAnimation() {
        return new Promise((resolve) => {
            const container = document.querySelector('.video-container') || document.body;
            container.style.animation = 'fadeInScale 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards';
            
            setTimeout(() => {
                container.style.animation = '';
                resolve();
            }, this.transitionDuration);
        });
    }
    
    /**
     * Réexécute les scripts après un chargement dynamique
     */
    reExecuteScripts(doc) {
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
        });
    }
    
    /**
     * Transition après fin de vidéo
     */
    transitionFromVideo() {
        this.playExitAnimation();
        setTimeout(() => {
            window.location.href = 'main-content.html';
        }, this.transitionDuration);
    }
    
    /**
     * Préchargement de la prochaine page
     */
    preloadNextPage(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }
}

// Initialiser le gestionnaire de transitions
const transitionManager = new TransitionManager();

// Ajouter les animations CSS
const transitionStyles = document.createElement('style');
transitionStyles.textContent = `
    @keyframes fadeOutScale {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0.95);
            filter: blur(8px);
        }
    }
    
    @keyframes fadeInScale {
        0% {
            opacity: 0;
            transform: scale(0.98);
            filter: blur(4px);
        }
        100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
        }
    }
    
    .page-transition-enter {
        animation: fadeInScale 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
    }
    
    .page-transition-exit {
        animation: fadeOutScale 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
`;
document.head.appendChild(transitionStyles);

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransitionManager;
}