const buildRoutes = require('./build-routes.js');
const { bundleConfig } = require('./bundle.js');
const generateHTML = require('./generate-html.js');

async function prerender() {
  const config = await bundleConfig();
  await buildRoutes(config);
  await generateHTML();
}

module.exports = prerender;