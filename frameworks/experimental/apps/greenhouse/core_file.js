sc_require('core');
sc_require('models/file');
/*
  
THIS IS DEPRECATED...
*/
/*globals Greenhouse */

Greenhouse.mixin({
  
  /*
    @property
  */
  rootFolder: null,
  
  
  loadFileList: function(){
    if(!this._listRequest) this._listRequest = SC.Request.create({type: 'GET', isJSON: YES, address: '/sproutcore/fs?action=list'});
    
    this._listRequest.notify(this,this._listCompleted, {}).send();
  },
  
  _listCompleted: function(request, params){
    var root = Greenhouse.File.create({treeItemIsExpanded: YES});
    var response = this._parse_response(request.response(), root);
    root.set('contents', response);
    this.set('rootFolder', root);
    Greenhouse.filesController.set('content', root);
    Greenhouse.makeFirstResponder(Greenhouse.READY);
    
  },
  
  /*
    wraps everything in an Greenhouse.File object
  */
  _parse_response: function(content, parent){
    for(var i=0; i < content.length; i+=1){
      content[i] = Greenhouse.File.create(content[i]);
      if(content[i].contents){
        content[i].contents = this._parse_response(content[i].contents, content[i]);
      }
      content[i].set('parent',parent);
    }
    return content;
  },
  
  getFile: function(file){
    if(!this._getRequest) this._getRequest = SC.Request.create({type: 'GET'});
    this._getRequest.set('address', "/sproutcore/fs/%@".fmt(file.get('path')));

    this._getRequest.notify(this,this._getCompleted, {file: file}).send();
    
  },
  
  _getCompleted: function(request, params){
    var file = params.file;
    file.requestComplete(request.response());
    //TODO: set content type...
  },
  
  commitFile: function(file){
    if(!this._postRequest) this._postRequest = SC.Request.create({type: 'POST'});
    this._postRequest.set('address', "/sproutcore/fs/%@?action=overwrite".fmt(file.get('path')));
    
    this._postRequest.notify(this,this._commitCompleted, {file: file}).send(file.get('body'));
    
  },
  
  _commitCompleted: function(request, params){
    var file = params.file;
    file.requestComplete();
  },
  /*
    create folder
  
  */
  createFolder: function(file){
    if(!this._postRequest) this._postRequest = SC.Request.create({type: 'POST'});
    this._postRequest.set('address', "/sproutcore/fs/%@?action=mkdir".fmt(file.get('path')));
    
    this._postRequest.notify(this,this._createFolderCompleted,{file: file}).send();
    
  },
  
  _createFolderCompleted: function(request, params){
    var file = params.file;
    file.requestComplete();
  },
  
  /*
    create a file
  
  */
  createFile: function(file){
    if(!this._postRequest) this._postRequest = SC.Request.create({type: 'POST'});
    this._postRequest.set('address', "/sproutcore/fs/%@?action=touch".fmt(file.get('path')));
    
    this._postRequest.notify(this,this._createFileCompleted,{file: file}).send();
    
  },
  
  _createFileCompleted: function(request, params){
    var file = params.file;
    file.requestComplete();
  },
  
  /*
    destroys a file
  
  */
  destroyFile: function(file){
    if(!this._postRequest) this._postRequest = SC.Request.create({type: 'POST'});
    this._postRequest.set('address', "/sproutcore/fs/%@?action=remove".fmt(file.get('path')));
    
    this._postRequest.notify(this,this._destroyFileCompleted,{file: file}).send();
    
  },
  
  _destroyFileCompleted: function(request, params){
    var file = params.file;
    file.requestComplete();
    file.destroy();
  }
});
