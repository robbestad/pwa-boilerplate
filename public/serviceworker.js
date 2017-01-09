self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.url.indexOf('localhost') > -1) {
    event.respondWith(
        self.caches.match(event.request).then(response => {
        return response || fetch(request);
      })
    );
  }
});

const assets = ['assets/bridge.jpg',
  'index.html',
  'main.js'];

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
  .then( res => {
    console.log(res)
  })
  .catch(err => {
    console.error('Cache failed', err)
  });

