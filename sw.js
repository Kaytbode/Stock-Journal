const staticCacheName= 'stockJournal-static-v5';

self.addEventListener('install', event=>{
    event.waitUntil(
      caches.open(staticCacheName).then(cache=>{
        return cache.addAll([
          '/',
          '/page404.html',
          '/css/medium.css',
          '/css/index.css',
          '/js/a2hs.js',
          '/js/idb.js',
          '/js/app.js',
          '/js/events.js',
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
            if(response) return response
            
            return fetch(event.request).then(response=>{
                if(response.status === 404){
                    return caches.match('/page404.html');
                }
                return response;
            });
        })
    );    
});
