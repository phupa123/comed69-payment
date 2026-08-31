/**
 * CLOUDFLARE WORKER ROUTER & STATIC ASSET ENGINE
 * สาขาวิชาคอมพิวเตอร์ศึกษา คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น (COMED KKU 69)
 */

export default {
  async fetch(request, env, ctx) {
    // 1. Try fetching the requested static asset
    try {
      const response = await env.ASSETS.fetch(request);
      
      // If found and not 404, return it
      if (response && response.status !== 404) {
        return response;
      }
    } catch(e) {}

    // 2. 🌟 FALLBACK: If asset not found (404), fetch and serve /404.html
    try {
      const url = new URL(request.url);
      const notFoundUrl = new URL('/404.html', url.origin);
      const notFoundRes = await env.ASSETS.fetch(new Request(notFoundUrl));
      
      if (notFoundRes && notFoundRes.ok) {
        return new Response(notFoundRes.body, {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        });
      }
    } catch(err) {}

    // 3. Last-resort fallback from GitHub Raw
    try {
      const ghRes = await fetch("https://raw.githubusercontent.com/phupa123/kku-comed23/main/404.html");
      if (ghRes.ok) {
        return new Response(ghRes.body, {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        });
      }
    } catch(ghErr) {}

    return new Response("<h1>404 Not Found</h1>", {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};
