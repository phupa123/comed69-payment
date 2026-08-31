export default {
  async fetch(request, env, ctx) {
    // 1. Fetch static asset via ASSETS binding
    const response = await env.ASSETS.fetch(request);
    
    // 2. If status is 404 (Not Found), serve our rich 404.html
    if (response.status === 404) {
      const url = new URL(request.url);
      const notFoundReq = new Request(new URL('/404.html', url.origin), request);
      const notFoundRes = await env.ASSETS.fetch(notFoundReq);
      return new Response(notFoundRes.body, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }
    
    return response;
  }
};
