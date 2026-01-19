const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = Bun.serve({
  port: PORT,
  hostname: HOST,

  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Default to index.html for directory requests
    if (pathname.endsWith("/")) {
      pathname += "index.html";
    }

    // Try to serve the file directly
    let filePath = `./dist${pathname}`;
    let file = Bun.file(filePath);

    if (await file.exists()) {
      return new Response(file);
    }

    // Try with /index.html for clean URLs (e.g., /survey_tools -> /survey_tools/index.html)
    if (!pathname.endsWith(".html") && !pathname.endsWith("/")) {
      const dirIndexFile = Bun.file(`./dist${pathname}/index.html`);
      if (await dirIndexFile.exists()) {
        return new Response(dirIndexFile);
      }
    }

    // Try with .html extension
    if (!pathname.endsWith(".html")) {
      const htmlFile = Bun.file(`${filePath}.html`);
      if (await htmlFile.exists()) {
        return new Response(htmlFile);
      }
    }

    // 404
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Server running at ${server.url}`);
