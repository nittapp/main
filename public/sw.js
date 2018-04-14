var CACHE_NAME = 'nitt-app-main-cache';
var urlsToCache = [
  '/',
  '/navboard',
  '/stylesheets/style.css',
  '/javascripts/iframe_hack.js',
  'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.4.5/css/mdb.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.13.0/umd/popper.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/js/bootstrap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.4.5/js/mdb.js",
  "https://fonts.gstatic.com/s/materialicons/v36/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.4.5/font/roboto/Roboto-Light.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.4.5/font/roboto/Roboto-Regular.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.4.5/font/roboto/Roboto-Light.woff",
  "https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.4.5/font/roboto/Roboto-Light.ttf",
  "https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.4.5/font/roboto/Roboto-Regular.ttf",
  "https://app.nitt.edu/favicon.ico",
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  console.log("requesting for ", event);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
console.log("found in cache", event.request);
          return response;
        }
console.log("nope, not found ", event.request);
        return fetch(event.request);
      }
    )
  );
});

