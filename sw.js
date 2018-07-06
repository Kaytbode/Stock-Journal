
const staticCacheName= 'stockJournal-static-v1';

self.addEventListener('install', event=>{
    event.waitUntil(
      caches.open(staticCacheName).then(cache=>{
        return cache.addAll([
          './app.js',
          './event.js',
          './idbController.js',
          './index.css',
          './index.html',
          'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css',
          'https://code.jquery.com/jquery-3.3.1.slim.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js'
        ]);
      })
    );
  });

  
self.addEventListener('activate', event=>{
    const cacheWhiteList = [staticCacheName];
    event.waitUntil(
        caches.keys().then(cacheNames=>{
            return Promise.all(
                cacheNames.map(cacheName=>{
                    if(cacheWhiteList.indexOf(cacheName) == -1){
                        return caches.delete(cacheName);
                    }
                })
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
