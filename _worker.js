/**
 * =========================================================================
 * CLOUDFLARE WORKER ROUTER & STATIC ASSET HANDLER
 * สาขาวิชาคอมพิวเตอร์ศึกษา คณะศึกษาศาสตร์ มหาวิทยาลัยขอนแก่น (COMED KKU 69)
 * =========================================================================
 * โค้ดนี้ใช้สำหรับนำไปวางใน Cloudflare Workers Dashboard (workers.dev)
 * เพื่อให้เสิร์ฟไฟล์ HTML ทั้งหมด และเมื่อเข้าหน้าที่ไม่มีอยู่จริง จะแสดงหน้า 404.html เสมอ
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    // 1. Map Known Static Routes
    const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/phupa123/comed69-payment/main";

    // Route mapping
    let targetFile = "";

    if (path === "/" || path === "/index" || path === "/index.html") {
      targetFile = "/index.html";
    } else if (path === "/payment" || path === "/payment.html") {
      targetFile = "/payment.html";
    } else if (path === "/admin" || path === "/admin.html") {
      targetFile = "/admin.html";
    } else if (path === "/index-admin" || path === "/index-admin.html") {
      targetFile = "/index-admin.html";
    } else if (path === "/payment-admin" || path === "/payment-admin.html") {
      targetFile = "/payment-admin.html";
    } else if (path === "/maintenance" || path === "/maintenance.html") {
      targetFile = "/maintenance.html";
    } else if (path === "/404" || path === "/404.html") {
      targetFile = "/404.html";
    } else if (path.startsWith("/assets/") || path.startsWith("/config/") || path.endsWith(".png") || path.endsWith(".js") || path.endsWith(".css")) {
      targetFile = url.pathname;
    }

    // If matching a static file, fetch it from GitHub
    if (targetFile) {
      try {
        const response = await fetch(GITHUB_RAW_BASE + targetFile);
        if (response.ok) {
          const contentType = getContentType(targetFile);
          return new Response(response.body, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=60"
            }
          });
        }
      } catch (err) {}
    }

    // 2. FALLBACK: Return Beautiful 404.html for any unmapped route (เช่น /Test, /random)
    try {
      const notFoundRes = await fetch(GITHUB_RAW_BASE + "/404.html");
      if (notFoundRes.ok) {
        const html = await notFoundRes.text();
        return new Response(html, {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        });
      }
    } catch(e) {}

    // Emergency Fallback if GitHub cannot be reached
    return new Response(`
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8"><title>404 Not Found</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 text-center">
        <div class="space-y-4">
          <h1 class="text-6xl font-black text-orange-500">404</h1>
          <p class="text-slate-400 text-sm">ไม่พบหน้าที่คุณต้องการ</p>
          <a href="/" class="px-5 py-2.5 bg-orange-600 rounded-2xl font-bold text-xs inline-block">กลับหน้าหลัก</a>
        </div>
      </body>
      </html>
    `, {
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
