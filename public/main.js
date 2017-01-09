if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./serviceworker.js', {scope: './'})
    .then(navigator.serviceWorker.ready)
    .then((registration) => {
      if (registration.active) {
        console.info('Service Worker is active');
      }
      if (registration.waiting) {
        console.info('Service Worker is in waiting mode');
      }
      if (registration.installing) {
        console.info('Service Worker is installing');
      }
    });
}
