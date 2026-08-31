/**
 * Cloudflare Pages Function Middleware: 404 Fallback Handler
 */
export async function onRequest(context) {
  const response = await context.next();
  
  // If the static asset is not found (Status 404), return the beautiful 404.html
  if (response.status === 404) {
    const url = new URL(context.request.url);
    const notFoundUrl = new URL('/404.html', url.origin);
    const notFoundResponse = await context.env.ASSETS.fetch(notFoundUrl);
    return new Response(notFoundResponse.body, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  }
  
  return response;
}
