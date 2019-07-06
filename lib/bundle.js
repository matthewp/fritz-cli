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
