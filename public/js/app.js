// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// Install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPromotion();
});

function showInstallPromotion() {
    // You can add a custom install button/banner here
    console.log('PWA install prompt available');
}

// Check if app is installed
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
});

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('🟢 Back online');
    document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
    console.log('🔴 You are offline');
    document.body.classList.add('offline');
});

// Auto-resize textarea
document.addEventListener('DOMContentLoaded', () => {
    const textareas = document.querySelectorAll('.sql-editor');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });
});
