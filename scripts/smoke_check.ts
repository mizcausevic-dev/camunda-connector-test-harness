const port = Number(process.env.PORT ?? "5124");
const routes = [
  "/",
  "/scenario-matrix",
  "/secret-replacement",
  "/failure-lab",
  "/verification",
  "/docs",
  "/api/dashboard/summary",
  "/api/sample"
];

for (const route of routes) {
  const response = await fetch(`http://127.0.0.1:${port}${route}`);
  if (!response.ok) {
    throw new Error(`Route ${route} returned ${response.status}`);
  }
}

console.log("smoke check passed");
