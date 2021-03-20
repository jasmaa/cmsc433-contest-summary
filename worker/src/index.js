import * as handlers from './handlers';

addEventListener('scheduled', event => {
  event.waitUntil(handleSchedule(event.scheduledTime))
});

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

/**
 * Handle options
 * https://community.cloudflare.com/t/worker-site-http-request-to-worker/151529/8
 * 
 * @param {*} request 
 * @returns 
 */
function handleOptions(request) {
  if (request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null) {
    // Handle CORS pre-flight request.
    return new Response(null, {
      headers: corsHeaders
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        "Allow": "GET, HEAD, POST, OPTIONS",
      }
    });
  }
}

/**
 * Request handler
 * 
 * @param {*} request 
 * @returns 
 */
async function handleRequest(request) {
  if (request.method === "OPTIONS") {
    return handleOptions(request);
  }

  const url = new URL(request.url);
  let res;
  switch (url.pathname) {
    case '/list':
      res = await handlers.list(request);
      break;
    case '/chart':
      res = await handlers.chart(request);
      break;
    case '/register':
      res = await handlers.register(request);
      break;
    case '/verify':
      res = await handlers.verify(request);
      break;
    case '/unregister':
      res = await handlers.unregister(request);
      break;
    default:
      res = new Response('Not found', { status: 404 });
  }

  // Attach CORS header
  Object.keys(corsHeaders).forEach((k, _) => {
    res.headers.append(k, corsHeaders[k]);
  });

  return res;
}

/**
 * Scheduled handler
 * 
 * @param {*} scheduledDate 
 */
async function handleSchedule(scheduledDate) {
  await handlers.updateAndNotify();
}
