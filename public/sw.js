// Service Worker for Government Grant & Procurement Directory
// Provides offline functionality, caching, and performance optimizations

const CACHE_NAME = 'grant-directory-v1';
const STATIC_CACHE_NAME = 'grant-directory-static-v1';
const API_CACHE_NAME = 'grant-directory-api-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/grants',
  '/topics/nonprofit-funding',
  '/topics/small-business-grants',
  '/glossary',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/grants/search',
  '/api/grants/details',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Cache configuration for different resource types
const CACHE_CONFIG = {
  static: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100,
  },
  api: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 50,
  },
  images: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 200,
  },
  documents: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 30,
  },
};

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static files...');
        return cache.addAll(STATIC_FILES.filter(url => !url.includes('_next')));
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('grant-directory-') && 
                     !cacheName.includes('v1');
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all pages
      self.clients.claim(),
    ])
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests from our domain
  if (url.origin !== location.origin) {
    return;
  }

  // Skip POST requests - don't cache them
  if (request.method !== 'GET') {
    return;
  }

  // Determine cache strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else if (isDocumentRequest(url)) {
    event.respondWith(handleDocumentRequest(request));
  }
});

// Handle static assets (JS, CSS, fonts, etc.)
async function handleStaticAsset(request) {
  return handleRequest(request, STATIC_CACHE_NAME, CACHE_CONFIG.static);
}

// Handle API requests
async function handleApiRequest(request) {
  return handleRequest(request, API_CACHE_NAME, CACHE_CONFIG.api);
}

// Handle image requests
async function handleImageRequest(request) {
  return handleRequest(request, CACHE_NAME, CACHE_CONFIG.images);
}

// Handle document requests
async function handleDocumentRequest(request) {
  return handleRequest(request, CACHE_NAME, CACHE_CONFIG.documents);
}

// Generic request handler with caching strategy
async function handleRequest(request, cacheName, config) {
  const cache = await caches.open(cacheName);

  try {
    switch (config.strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cache, config);
      
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cache, config);
      
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cache, config);
      
      default:
        return await networkFirst(request, cache, config);
    }
  } catch (error) {
    console.error('Request handling error:', error);
    return await getOfflineFallback(request);
  }
}

// Cache-first strategy
async function cacheFirst(request, cache, config) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, config.maxAge)) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return cachedResponse || await getOfflineFallback(request);
  }
}

// Network-first strategy
async function networkFirst(request, cache, config) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedResponse = await cache.match(request);
    return cachedResponse || await getOfflineFallback(request);
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cache, config) {
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok && request.method === 'GET') {
      // Only cache GET requests, not POST requests
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  if (cachedResponse && !isExpired(cachedResponse, config.maxAge)) {
    // Return cached response immediately, update in background
    fetchPromise.catch(() => {}); // Prevent unhandled rejection
    return cachedResponse;
  }

  // No cache or expired, wait for network
  try {
    return await fetchPromise;
  } catch {
    return cachedResponse || await getOfflineFallback(request);
  }
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  const cacheTime = response.headers.get('sw-cache-time');
  if (!cacheTime) return false;
  
  const age = Date.now() - parseInt(cacheTime);
  return age > maxAge;
}

// Add cache timestamp to response
function addCacheTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-time', Date.now().toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

// Get offline fallback for different request types
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Grant Directory</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              text-align: center; 
              padding: 2rem; 
              background: #f8fafc;
              color: #334155;
            }
            .container { max-width: 400px; margin: 0 auto; }
            h1 { color: #1e40af; margin-bottom: 1rem; }
            p { margin-bottom: 1.5rem; line-height: 1.6; }
            button { 
              background: #1e40af; 
              color: white; 
              border: none; 
              padding: 0.75rem 1.5rem; 
              border-radius: 0.375rem; 
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>This page is not available offline. Please check your internet connection and try again.</p>
            <p>You can still browse cached grant opportunities and search results.</p>
            <button onclick="window.history.back()">Go Back</button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }
  
  // For API requests, return empty response
  if (isApiRequest(url)) {
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'This data is not available offline.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response('Offline', { status: 503 });
}

// Helper functions to identify request types
function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/') || 
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2');
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isImageRequest(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname);
}

function isDocumentRequest(url) {
  return !isStaticAsset(url) && !isApiRequest(url) && !isImageRequest(url);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-opportunities') {
    event.waitUntil(syncOpportunities());
  }
});

// Sync opportunities in the background
async function syncOpportunities() {
  try {
    console.log('Syncing opportunities in background...');
    // Fetch latest opportunities and update cache
    const response = await fetch('/api/grants/search?limit=20');
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put('/api/grants/search', response.clone());
      console.log('Background sync completed');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: 'New funding opportunities are available!',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag: 'new-opportunities',
    actions: [
      {
        action: 'view',
        title: 'View Opportunities',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Grant Directory', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/grants')
    );
  }
});

console.log('Government Grant & Procurement Directory Service Worker loaded');