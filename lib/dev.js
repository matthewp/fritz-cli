const { bundleConfig, watch } = require('./bundle.js');
const { createServer } = require('http-server');
const { green, red, white, yellow } = require('kleur');

async function dev({ port = 1931 }) {
  const config = await bundleConfig();

  function onResult(bundle, err, result) {
    if(err) {
      console.error(white(`${red(`✘ ${bundle}`)}: ${err.toString()}`));
    } else {
      console.error(white(`${green().bold(`✔ ${bundle}`)} (${result.duration}ms)`));
    }
  }

  watch(config.worker, onResult.bind(null, 'worker'));
  watch(config.window, onResult.bind(null, 'window'));

  createServer({}).listen(port, null, function() {
    console.error(yellow().bold(`> Listening on http://localhost:${port}`));
  });
}

module.exports = dev;