const relative = require('require-relative');
const path = require('path');

let rollup;
function getRollup() {
  const cwd = process.cwd();
  if(!rollup) rollup = relative('rollup', cwd);
  return rollup;
}

exports.bundleConfig = async function() {
  const cwd = process.cwd();
  let rollup = getRollup();
  const input = path.resolve(cwd, 'rollup.config.js');

  const bundle = await rollup.rollup({
    input,
    inlineDynamicImports: true,
    external: (id) => {
      return (id[0] !== '.' && !path.isAbsolute(id)) || id.slice(-5, id.length) === '.json';
    }
  });

  const resp = await bundle.generate({ format: 'cjs' });
  const { code } = resp.output ? resp.output[0] : resp;

  // temporarily override require
  const defaultLoader = require.extensions['.js'];
  require.extensions['.js'] = (module, filename) => {
    if (filename === input) {
      module._compile(code, filename);
    } else {
      defaultLoader(module, filename);
    }
  };

  const config = require(input);

  delete require.cache[input];

  return config;
};

exports.bundle = async function(config) {
  const rollup = getRollup();
  const bundle = await rollup.rollup(config);
	await bundle.write(config.output);
};

exports.watch = function(config, cb) {
  const rollup = getRollup();
  const watcher = rollup.watch(config);

  let errors = [];
  let chunks = [];
  let warnings = [];
  let start;

  const createResult = (duration) => {
    return {
      errors: Array.from(errors),
      chunk: Array.from(chunks),
      warnings: Array.from(warnings),
      duration
    };
  };

  watcher.on('change', (id) => {
    chunks = [];
    warnings = [];
    errors = [];
  });

  watcher.on('event', (event) => {
    switch (event.code) {
      case 'FATAL':
        // TODO kill the process?
        if (event.error.filename) {
          // TODO this is a bit messy. Also, can
          // Rollup emit other kinds of error?
          event.error.message = [
            `Failed to build — error in ${event.error.filename}: ${event.error.message}`,
            event.error.frame
          ].filter(Boolean).join('\n');
        }

        cb(event.error);
        break;

      case 'ERROR':
        errors.push(event.error);
        cb(null, createResult(Date.now() - start));
        break;

      case 'START':
      case 'END':
        // TODO is there anything to do with this info?
        break;

      case 'BUNDLE_START':
        start = Date.now();
        break;

      case 'BUNDLE_END':
        cb(null, createResult(Date.now() - this._start));
        break;

      default:
        console.log(`Unexpected event ${event.code}`);
    }
  });
};