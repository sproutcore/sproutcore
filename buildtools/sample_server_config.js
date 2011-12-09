var g = require('../garcon/lib/garçon');

// create a server which will listen on port 8000 by default
// the proxies will be handled in the order defined.
// so, if you want a catch all proxy, put it in the last position
var server = g.Server.create({
  proxies: [ 
    {
      prefix: '/images', // what is the url prefix of the request?
      host: 'localhost', // to what host should be proxied
      port: 8070, // to what port on the host should be proxied?
      proxyPrefix: '/' // with what url should the proxy request be prefixed?
    },
    { prefix: '/', // this is a catch all proxy 
      host: 'localhost',
      port: 8080,
      proxyPrefix: '/'
    }
  ]
});


var myApp = g.App.create({
  name: 'myapp',
  // adding an application named 'myapp' tells the server to respond to
  // the /myapp url and to create a myapp.html file when saving
  
  theme: 'sc-theme', // what theme to use, will be the class of the body tag
  htmlHead: '<title>Docentending</title>', // what tags to include in the header of the generated html

  hasSC: true, // an app will have SC by default, if you don't want this, set to false  
  configSC: {
    version: '1.4.5', // what version of SC do you want for this app... for future use
    // what frameworks do you want in your SC?
    frameworkNames: "bootstrap jquery runtime foundation datastore desktop animation".w() 
  },
  
  // a list of frameworks.
  // every framework has compulsary and optional parameters 
  // - path: the relative path to this config file
  // - combineScripts: combine the scripts of this framework in one file
  // - combineStylesheets: combine the stylesheets of this framework in one file
  // - isNestedFramework + frameworkNames: if you define isNestedFrameworks, you also have to 
  //   provide a frameworkNames array of frameworks to include. If you want the entire framework
  //   to be included, you can just define a nested Framework as a normal framework
  // - isBundle 
  frameworks: [
    { path: 'frameworks/sproutcore/themes/empty_theme'},
    { path: 'frameworks/sproutcore/themes/standard_theme'},
    //{ path: 'frameworks/sproutcore/themes/legacy_theme'}, // for SC 1.5
  	{ path: 'frameworks/ki/frameworks/foundation'},
    //{ path: 'frameworks/ki'},
  	{ path: 'frameworks/meetme_fw'},
  	{ path: 'frameworks/TeXSC'},
    //{ path: 'frameworks/thothsc'},
    { path: 'frameworks/Thoth-SC'},
  	{ path: 'apps/docentending'}
  ]
});

server.addApp(myApp);
server.run();
/*
var g = require('./lib/garçon'),
    server, myApp;
    

server = new g.Server();

// adding an application named 'myapp' tells the server to respond to
// the /myapp url and to create a myapp.html file when saving
myApp = server.addApp({
  name: 'myapp',
  theme: 'sc-theme',
  buildLanguage: 'english'
});

// myApp needs SproutCore to run
myApp.addSproutcore();

// add other dependencies
myApp.addFrameworks(
  
  // a third party framework
  // { path: 'frameworks/calendar' },
  
  // the theme you're using
  { path:'frameworks/sproutcore/themes/standard_theme', combineScripts: true },
  
  // if you're on Quilmes and use Ace, uncomment the next 2 lines instead
  // { path:'frameworks/sproutcore/themes/empty_theme', combineScripts: true },
  // { path:'frameworks/sproutcore/themes/ace', combineScripts: true },
  
  // finally, the sources for myApp must be added as well
  { path: 'apps/' + myApp.name }
);

// add some html for inside the <head> tag
myApp.htmlHead = '<title>My App</title>';

// add some html for inside the <body> tag
myApp.htmlBody = [
  '<p id="loading">',
    'Loading…',
  '</p>'
].join('\n');

// build the app
myApp.build(function() {
  
  // run the server
  server.run();
  
});
*/