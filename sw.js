const staticCacheName2= 'stockJournal-static-v2';

self.addEventListener('install', event=>{
    event.waitUntil(
      caches.open(staticCacheName2).then(cache=>{
        return cache.addAll([
          'https://kaytbode.github.io/Stock-Journal/',
          'https://kaytbode.github.io/Stock-Journal/events.js',
          'https://kaytbode.github.io/Stock-Journal/idbController.js',
          'https://kaytbode.github.io/Stock-Journal/index.css',
          'https://kaytbode.github.io/Stock-Journal/app.js',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css',
          'https://code.jquery.com/jquery-3.3.1.slim.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js'
        ]);
      })
    );
  });

  
self.addEventListener('activate', event=>{
    const cacheWhiteList = [staticCacheName2];
    event.waitUntil(
        caches.keys().then(cacheNames=>{
            return Promise.all(
                cacheNames.filter(cacheName=>{
                    return cacheName.startsWith('stockJournal-') &&
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
