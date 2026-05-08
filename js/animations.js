// Animations légères sans GSAP (pour performance)

// Mascotte qui suit la souris sur desktop
document.addEventListener('mousemove', (e) => {
    const mascotte = document.querySelector('.mascotte-hero');
    if (mascotte && window.innerWidth > 768) {
        const x = (e.clientX / window.innerWidth) * 10;
        const y = (e.clientY / window.innerHeight) * 10;
        mascotte.style.transform = `translate(${x}px, ${y}px)`;
    }
});

// Compteur de téléchargements (simulé)
let downloadCount = localStorage.getItem('downloadCount') || 0;
if (downloadCount === 0) {
    // Premier visiteur
    setTimeout(() => {
        showNotification('🎁 Offre spéciale : 1 mois offert avec le code LIVRET2025', 'info');
    }, 5000);
}

// Animation du texte de la hero section
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    heroTitle.style.opacity = '0';
    setTimeout(() => {
        heroTitle.style.animation = 'fadeInUp 0.8s forwards';       
    }, 100);
}

// Détection des erreurs de chargement d'images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
        console.warn(`Image non chargée: ${img.src}`);
        // Fallback
        if (img.classList.contains('mascotte-hero')) {
            img.src = 'https://via.placeholder.com/400x400?text=🐰';
        }
    });
});