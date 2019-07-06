const { bundleConfig, bundle } = require('./bundle.js');

async function buildClient() {
  const config = await bundleConfig();

  await bundle(config.worker);
  await bundle(config.window);
}

module.exports = buildClient;