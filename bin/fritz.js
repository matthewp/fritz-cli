#! /usr/bin/env node
const meow = require('meow');

const cli = meow(`
  Usage
    $ fritz <command>

  Options
    --server       For the [build] command, bundle the server code.
    --client       For the [build] command, bundle the client code.
    --version      Show the version number and exit.
    --help         Show this help message.

  Examples
    $ fritz build --server
    $ fritz build --client
    $ fritz prerender
`, {
  flags: {
    server: {
      type: 'boolean',
      default: false
    },
    client: {
      type: 'boolean',
      default: false
    }
  }
});

let command = cli.input[0];

switch(command) {
  case 'dev': {
    const dev = require('../lib/dev.js');
    dev(cli.flags).catch(logErrorAndExit);
    break;
  }
  case 'build': {
    let server = cli.flags.server;
    let client = cli.flags.client;
    if(!server && !client) {
      console.error('The [build] command expects either the --server or --client flags.');
      process.exit(1);
      return;
    }

    let p;
    if(server) {
      const buildServer = require('../lib/build-server.js');
      p = buildServer(cli.flags);
    } else {
      const buildClient = require('../lib/build-client.js');
      p = buildClient(cli.flags);
    }

    p.catch(logErrorAndExit);
    break;
  }
  case 'prerender': {
    const prerender = require('../lib/prerender.js');
    prerender(cli.flags).catch(logErrorAndExit);
    break;
  }
  default: {
    console.error('No command provided. Please choose from:');
    cli.showHelp(1);
    break;
  }
}

function logErrorAndExit(err) {
  console.error(err);
  process.exit(1);
}