/* 
  Framework bundler is a way of easily wrapping a set of frameworks as one framework
  
*/
var tools = require('./tools');
var Framework = require('./framework').Framework;

exports.FrameworkBundler = Framework.extend({
  frameworkNames: null,
  
  _frameworks: null,
  
  path: '',
    
  build: function(callback){
    var me = this,
        basePath = this.path,
        server = this.server,
        count, cb, numFWs, fwmapper;
        
    cb = function(){
      //tools.log('fwbundler cb: count: ' + count + " and numfws: " + numFWs);
      count += 1;
      if(count === numFWs) callback();
    };
    
    fwmapper = function(fwname){
      var path = tools.path.join(basePath,fwname);
      var fw = Framework.create({ 
        path: path, 
        server: server,
        minifyScripts: this.minifyScripts,
        combineOnSave: this.combineOnSave,
        combineScripts: this.combineScripts,
        minifyOnSave: this.minifyOnSave,
        pathsToExclude: [/fixtures\//]
      });
      fw.build(cb);
      return fw;
    };
    
    numFWs = this.frameworkNames.length;
    count = 0;
    this._frameworks = this.frameworkNames.map(fwmapper);  
  },
  
  orderedScripts: function(){
    return this._frameworks.getEach('orderedScripts').flatten();
  }.property(),
  
  orderedStylesheets: function(){
    return this._frameworks.getEach('orderedStylesheets').flatten();
  }.property()
  
});
