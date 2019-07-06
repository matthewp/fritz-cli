const { bundle } = require('./bundle.js');
const generateRoutes = require('./generate-routes.js');

async function buildRoutes(config) {
  await generateRoutes();
  await bundle(config.server);
}

module.exports = buildRoutes;