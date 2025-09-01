// ... (earlier code unchanged)

// Service Worker registration and controllerchange event (fixed typo)
try {
    // FIXED: Use external service worker file instead of blob URL
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')  // FIXED: Point to actual file
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New service worker installed, updating...');
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });

        // FIX: Change service-Worker to serviceWorker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
} catch (error) {
    console.error('Error creating service worker:', error);
}

// ... (rest of your code unchanged)
