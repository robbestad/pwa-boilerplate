if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./serviceworker.js', {scope: './'})
    .then((registration) => {
      if (registration.active) {
        console.info('Service Worker is active');
        if (navigator.serviceWorker.controller) {
          sendMessage('wat up?')
            .then(res => console.log('Response from Service Worker:', res.message))
            .catch(e => console.error(e));
        }
      }
      if (registration.waiting) {
        console.info('Service Worker is in waiting mode');
      }
      if (registration.installing) {
        console.info('Service Worker is installing');
      }
    });

  function sendMessage(message) {
    return new Promise(function (resolve, reject) {
      const messageChannel = new MessageChannel();
      messageChannel.port2.onmessage = e => {
        if (e.data.error) {
          reject(e.data.error);
        }
        resolve(e.data);
      };
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message, [messageChannel.port1]);
      }
    });
  }

}