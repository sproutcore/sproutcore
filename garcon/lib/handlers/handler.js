var tools = require("../tools");

// important: do not keep a ref to the request or the callback!
// (such as the request etc)

exports.Handler = SC.Object.extend({
  
  //shared between all handlers
  urlPrefix: '/',
  
  // called to perform some function on a file or on a request
  // call the callback without arguments when ready.
  // you can prevent running the other handlers calling the callback with true
  handle: function(file,request,callback){
    callback();
  },
  
  // if you need to perform some action on the way back out
  // add any data you want to end up in the response on r
  // and call the callback with r as parameter
  finish: function(request,r,callback){
    callback(r);
  }
  
});