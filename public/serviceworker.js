const delayedResponse = () => {
    return new Promise(resolve => {
            setTimeout(e => {
            resolve('Hello from service worker land');
}, 1500)
})
};

let result;

self.addEventListener('install', e => {
    e.waitUntil(
    delayedResponse().then(response => {
        result = response;
})
);
});
self.addEventListener('activate', e => {
    console.info('Service Worker: Active');
});
self.addEventListener('message', e => {
    console.log('Hi from Service Worker. I got this message from the main script:', e.data);
return new Promise(resolve => {
        if (!result) {
    delayedResponse().then(response => {
        result = response;
    resolve(result);
})
} else {
    resolve(result);
}
}).then(message => {
    e.ports[0].postMessage({message});
});
});