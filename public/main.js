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

  navigator.storageQuota.queryInfo("temporary").then(function (info) {
    console.log(info.quota);
    // Result: <quota in bytes>
    console.log(info.usage);
    // Result: <used data in bytes>
  });
}
