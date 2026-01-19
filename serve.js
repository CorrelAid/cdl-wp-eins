const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = Bun.serve({
  port: PORT,
  hostname: HOST,

  routes: {
    // Serve static files with wildcard
    "/*": async (req) => {
      const url = new URL(req.url);
      let pathname = url.pathname;

      // Default to index.html for directory requests
      if (pathname.endsWith("/")) {
        pathname += "index.html";
      }

      // Try to serve the file
      let filePath = `./dist${pathname}`;
      const file = Bun.file(filePath);

      if (await file.exists()) {
        return new Response(file);
      }

      // Try with .html extension if not found (for clean URLs)
      if (!pathname.endsWith(".html")) {
        const htmlFile = Bun.file(`${filePath}.html`);
        if (await htmlFile.exists()) {
          return new Response(htmlFile);
        }
      }

      // 404
      return new Response("Not Found", { status: 404 });
    },
  },
});

console.log(`🚀 Server running at ${server.url}`);
