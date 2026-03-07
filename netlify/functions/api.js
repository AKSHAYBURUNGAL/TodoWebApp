const serverless = require("serverless-http");
const app = require("../../backend/server");

// Netlify function paths are prefixed with "/.netlify/functions/api".
// Stripping this keeps Express routes ("/api/todos/...") working.
exports.handler = serverless(app, {
  basePath: "/.netlify/functions/api",
});
