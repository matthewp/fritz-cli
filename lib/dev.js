const { bundleConfig, watch } = require('./bundle.js');
const { createServer } = require('http-server');
const { red, white, yellow } = require('kleur');

async function dev() {
  const config = await bundleConfig();

  function onResult(bundle, err, result) {
    if(err) {
      console.error(white(`${red(`[${bundle}]`)}: ${err.toString()}`));
    } else {
      console.error(white(`${yellow(`[${bundle}]`)}: ${result}`));
    }
  }

  /*
  const onResult = (err, result) => {
    if(err) {
      console.error(err);
    } else {
      console.log(result);
    }
  };
  */

  watch(config.worker, onResult.bind(null, 'worker'));
  watch(config.window, onResult.bind(null, 'window'));

  createServer({}).listen(1931);
}

module.exports = dev;