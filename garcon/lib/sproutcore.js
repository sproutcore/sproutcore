var tools = require('./tools');
var FrameworkBundler = require('./framework_bundler').FrameworkBundler;
var Bundle = require('./bundle').Bundle;

// sproutcore is an extended framework
exports.Sproutcore = FrameworkBundler.extend({
  
  //version: "1.4.5", // we should support automatic sproutcore versions
  
  path: 'frameworks/sproutcore/frameworks/',
  isSC: true, // identifier for the building process, to store sproutcore in a separate file
  combineScripts: true,

  frameworkNames: "bootstrap jquery runtime foundation datastore desktop animation".w(),

  pathsToExclude: null,

  init: function(){
    arguments.callee.base.apply(this,arguments);
    tools.log('garconlibdir: ' + tools.lib_dir);
    if(!this.pathsToExclude){
      this.pathsToExclude = [/fixtures\//];
    }
    else {
      if(SC.typeOf(this.pathsToExclude) === 'array'){
        this.pathsToExclude.push(new RegExp(/fixtures\//));
      }
      else if(SC.typeOf(this.pathsToExclude) === 'regexp'){
        this.pathsToExclude = [this.pathsToExclude];
      }
    }
  },

  beforeFile: function(){
    var code = "";
    
    code += "var SC = SC || { BUNDLE_INFO: {}, LAZY_INSTANTIATION: {} }; \n";
    code += "var require = require || function require(){};";
    return this.createVirtualFile('before.js',code,this);
  }.property().cacheable(),
  
  afterFile: function(){
    return this.createVirtualFile('after.js',
      '; if (SC.setupBodyClassNames) SC.setupBodyClassNames();',this);
  }.property().cacheable(),
  
  build: function(callback){
    // before we do anything, we should check whether there is a sproutcore in the projects folder
    // otherwise we should fall back to a version of sc, checked out using git in the garcon lib folder
    arguments.callee.base.apply(this,arguments);
  }
  
});