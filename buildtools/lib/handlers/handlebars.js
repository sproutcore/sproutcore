var tools = require('../tools');
var Handler = require('./handler').Handler;

exports.Handlebars = Handler.extend({
  
  file: null,
  
  handle: function(file,request,callback){
    this.file = file;
    callback();
  },
  
  finish: function(request,r,callback){
    var re = /[^\/]+\/templates\/(.+)\.handlebars/,
        data,
        filename;
    
    if(this.file.get('extname') === '.handlebars'){
      filename = re.exec(this.file.get('url'))[1];
      data = "SC.TEMPLATES['" + filename + "'] = SC.Handlebars.compile(";
      data += JSON.stringify(r.data.toString('utf8')) + ");";
      r.data = data;
    }
    callback(r);
  }
  
});