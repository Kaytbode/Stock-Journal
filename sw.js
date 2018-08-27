const staticCacheName= 'stockJournal-static-v4';

self.addEventListener('install', event=>{
    event.waitUntil(
      caches.open(staticCacheName).then(cache=>{
        return cache.addAll([
          'https://kaytbode.github.io/Stock-Journal/',
          'https://kaytbode.github.io/Stock-Journal/css/medium.css',
          'https://kaytbode.github.io/Stock-Journal/css/index.css',
          'https://kaytbode.github.io/Stock-Journal/js/a2hs.js',
          'https://kaytbode.github.io/Stock-Journal/js/idb.js',
          'https://kaytbode.github.io/Stock-Journal/js/app.js',
          'https://kaytbode.github.io/Stock-Journal/js/events.js',
          'https://fonts.googleapis.com/css?family=Josefin+Sans|Oxygen'
        ]);
      })
    );
  });

  
self.addEventListener('activate', event=>{
    const cacheWhiteList = [staticCacheName];
    event.waitUntil(
        caches.keys().then(cacheNames=>{
            return Promise.all(
                cacheNames.filter(cacheName=>{
                    return cacheName.startsWith('stockJournal-static') &&
                    !cacheWhiteList.includes(cacheName);
                  }).map(cacheName=>caches.delete(cacheName))
            );
        })
    );
});


self.addEventListener('fetch', event=>{
    event.respondWith(
        caches.match(event.request).then(response=> {
          return response || fetch(event.request);
        })
    );    
});
