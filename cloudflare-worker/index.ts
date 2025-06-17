// Minimal FetchEvent type declaration for Cloudflare Workers
interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  return new Response("Hola desde Cloudflare Worker 👋", {
    headers: { "content-type": "text/plain" },
  })
}
