self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.url.indexOf('localhost') > -1) {
    event.respondWith(
      self.caches.match(event.request).then(response => {
        console.log('returning match', response)
        return response || fetch(request);
      })
    );
  }
});

//
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     self.caches.match(event.request).then(response => {
//       console.log('returning match', response.url);
//       return response || fetch(event.request);
//     })
//   );
// });

const assets = ['/assets/bridge.jpg',
  '/index.html',
  '/main.js'];

// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open('mysite-static-v1').then(cache => {
//       return cache.addAll(assets);
//     })
//   );
// });
//
//
const cacheAssets = assets => {
  return new Promise((resolve, reject) => {
    caches.open('assets')
      .then(cache => {
        cache.addAll(assets)
          .then(() => {
            resolve('All assets cached')
          })
          .catch(err => {
            reject(err)
          })
      }).catch(err => {
      reject(err);
    })
  });
};

cacheAssets(assets)
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.error('Cache failed', err)
  });

