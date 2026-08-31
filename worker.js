/**
 * CLOUDFLARE WORKER ROUTER & STATIC ASSET ENGINE
 * สาขาวิชาคอมพิวเตอร์ศึกษา คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น (COMED KKU 69)
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    // 1. Rewrite clean routes to .html
    let fetchUrl = request.url;
    if (path === "/" || path === "") {
      fetchUrl = new URL("/index.html", url.origin).toString();
    } else if (path === "/payment") {
      fetchUrl = new URL("/payment.html", url.origin).toString();
    } else if (path === "/admin") {
      fetchUrl = new URL("/admin.html", url.origin).toString();
    } else if (path === "/index-admin") {
      fetchUrl = new URL("/index-admin.html", url.origin).toString();
    } else if (path === "/payment-admin") {
      fetchUrl = new URL("/payment-admin.html", url.origin).toString();
    } else if (path === "/maintenance") {
      fetchUrl = new URL("/maintenance.html", url.origin).toString();
    } else if (path === "/404") {
      fetchUrl = new URL("/404.html", url.origin).toString();
    }

    // 2. Fetch requested static asset via Cloudflare ASSETS binding
    try {
      const response = await env.ASSETS.fetch(new Request(fetchUrl, request));
      if (response && response.status !== 404) {
        return response;
      }
    } catch(e) {}

    // 3. Fallback from GitHub for public pages
    const GITHUB_RAW = "https://raw.githubusercontent.com/phupa123/kku-comed23/main";
    let target = "";
    if (path === "/" || path === "/index" || path === "/index.html") target = "/index.html";
    else if (path === "/payment" || path === "/payment.html") target = "/payment.html";
    else if (path === "/admin" || path === "/admin.html") target = "/admin.html";
    else if (path === "/index-admin" || path === "/index-admin.html") target = "/index-admin.html";
    else if (path === "/payment-admin" || path === "/payment-admin.html") target = "/payment-admin.html";
    else if (path === "/maintenance" || path === "/maintenance.html") target = "/maintenance.html";
    else if (path === "/404" || path === "/404.html") target = "/404.html";
    else if (path.startsWith("/assets/") || path.startsWith("/config/") || path.endsWith(".png") || path.endsWith(".js") || path.endsWith(".css")) {
      target = url.pathname;
    }

    if (target) {
      try {
        const ghRes = await fetch(GITHUB_RAW + target);
        if (ghRes.ok) {
          return new Response(ghRes.body, {
            status: 200,
            headers: {
              "Content-Type": getContentType(target),
              "Cache-Control": "public, max-age=60"
            }
          });
        }
      } catch (err) {}
    }

    // 4. 🌟 AUTOMATIC 404 RESCUE: If not found, serve 404.html seamlessly
    try {
      const notFoundRes = await fetch(GITHUB_RAW + "/404.html");
      if (notFoundRes.ok) {
        return new Response(notFoundRes.body, {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        });
      }
    } catch(err404) {}

    return new Response("<h1>404 Not Found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};

function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".json")) return "application/json";
  return "text/plain; charset=utf-8";
}
