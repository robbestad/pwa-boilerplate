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

// images
const img = new Image(),
  url = "assets/bridge.jpg",
  container = document.querySelector("#holder");
console.log(container);
img.src = url;
img.alt = "A bridge";
img.onload = () => container.appendChild(img);
