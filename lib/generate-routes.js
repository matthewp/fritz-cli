const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const mkdirp = promisify(require('mkdirp'));

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);
const entryPth = './src/routes';

async function addRoute(routes, pth) {
  let full = path.join(entryPth, pth, 'index.js');
  await stat(full);
  routes.set('/', full);
}

function buildRouteModule(routes) {
  let importStatements = '';
  let routeBuilder = '', count = 0;
  for(let [route, modulePath] of routes) {
    let relativePath = `../../${modulePath}`;
    let id = `route${++count}`;
    importStatements += `import ${id} from '${relativePath}';\n`;
    routeBuilder += `routes.set('${route}', ${id});\n`;
  }

  let moduleSource = `${importStatements}
const routes = new Map();
${routeBuilder}
export default routes;
`;
  return moduleSource;
}

async function writeServer(routes) {
  let routeModulePath = `build/temp/routes.js`;
  let routeSource = buildRouteModule(routes);
  await mkdirp('build/temp');
  await writeFile(routeModulePath, routeSource);

  let serverModulePath = `build/temp/server.js`;
  let serverSource = `
import { renderToString } from 'fritz-render-to-string';
import routes from './routes.js';

export {
  renderToString,
  routes
};
  `.trim();
  await writeFile(serverModulePath, serverSource);
}

async function run() {
  let routes = new Map();

  try {
    await addRoute(routes, '');
  } catch(e) {}

  let entries = await readdir(entryPth);
  
  for(let entry of entries) {
    let pth = path.join(entryPth, entry);
    let stats = await stat(pth);
    if(stats.isDirectory()) {
      let route = `/${entry}`;
      pth = path.join(pth, 'index.js');
      routes.set(route, pth);
    }
  }

  await writeServer(routes);
}

module.exports = run;