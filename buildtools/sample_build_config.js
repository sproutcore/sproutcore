var g = require('./lib/garçon'),
    server, myApp;
    
// create a server which will listen on port 8000 by default
server = new g.Server();

// adding an application named 'myapp' tells the server to respond to
// the /myapp url and to create a myapp.html file when saving
myApp = server.addApp({
  name: 'myapp',
  theme: 'sc-theme',
  buildLanguage: 'english',
  combineScripts: true,
  combineStylesheets: true,
  minifyScripts: true,
  minifyStylesheets: true
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
  
  // options for bundles (isBundle is false by default, shouldPreload is true by default)
  // { path: 'bundles/corebundle', isBundle: true, shouldPreload: true } 
  // { path: 'bundles/mybundle', isBundle: true, bundleDeps: ['corebundle'], shouldPreload: false } 
  
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

// build the app and, when done, save it to the disk
myApp.build(function() {
  myApp.save();
});
