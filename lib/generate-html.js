
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const stripIndent = require('strip-indent');
const relative = require('require-relative');
const mkdirp = promisify(require('mkdirp'));
const writeFile = promisify(fs.writeFile);

const routesPth = './build/routes.js';
const templatePth = './src/template.html.js';

async function renderer(template, renderToString, outPth, fn) {
  let vnodes = fn();
  let rendered = renderToString(vnodes);
  let html = stripIndent(template(rendered).trim());
  
  await mkdirp(path.dirname(outPth));
  await writeFile(outPth, html);
}

async function renderRoutes(routes, template, renderToString) {
  const render = renderer.bind(null, template, renderToString);
  let p = [];
  for(let [route, mod] of routes) {
    let out = `public${route}${route.length > 1 ? '/' : ''}index.html`;
    p.push(render(out, mod));
  }
}

async function run() {
  const cwd = process.cwd();
  let routes, renderToString, template;

  try {
    let routesModule = relative(routesPth, cwd);
    routes = routesModule.routes;
    renderToString = routesModule.renderToString;
  } catch(e) {
    console.error('routes.js has not been built');
    throw e;
  }

  try {
    template = relative(templatePth, cwd);
  } catch(e) {
    if(e.code === 'MODULE_NOT_FOUND') {
      throw new Error('Unable to load src/template.html.js')
    }
    throw e;
  }

  renderRoutes(routes, template, renderToString);
}

module.exports = run;