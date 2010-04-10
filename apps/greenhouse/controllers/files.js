// ==========================================================================
// Project:   Greenhouse.filesController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Greenhouse */

/** @class


  @extends TreeController
*/
Greenhouse.filesController = SC.TreeController.create(SC.CollectionViewDelegate,
/** @scope Greenhouse.filesController.prototype */ {

  // ..........................................................
  // Drag and drop support
  // 
  collectionViewValidateDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
    return SC.DRAG_ANY;
  },

  collectionViewPerformDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
    console.log('delegate works');
    return SC.DRAG_NONE ;
  },


  treeItemChildrenKey: "contents",
  
  /**
    Call this method whenever you want to relaod the files from the server.
  */
  reload: function() {
    var files = Greenhouse.store.find(Greenhouse.FILES_QUERY), root = SC.Object.create({treeItemIsExpanded: YES});
    root.set('contents', files);
    this.set('content', root);
  }
  
  // ..........................................................
  // File actions
  // 
  // newFile: function(){
  //   this._new_file();
  // },
  // 
  // newPageFile: function(){
  //   this._new_file();
  // },
  // 
  // newFolder: function(){
  //   var sel = this.get('selection'), newFolder, root = Greenhouse.get('rootFolder'), fileView, contents;
  //   sel = sel.firstObject();
  //   if(sel && (sel.get('contents') || sel.get('parent') !== root)){ 
  // 
  //     newFolder = Greenhouse.File.createNewFolder({dir: sel.get('path') + "/", name: 'untitled folder', parent: sel.get('parent')});
  //     if(sel.get('contents')){
  //       contents = sel.get('contents');
  //     }
  //     else{
  //       contents = sel.getPath('parent.contents');
  //     }
  //     contents.pushObject(newFolder);     
  //   }
  //   else{
  //     newFolder = Greenhouse.File.createNewFolder({dir:'', name: 'untitled folder', parent: root });
  //     contents = root.get('contents');
  //     contents.pushObject(newFolder);
  //   }
  //   
  //   this.selectObject(newFolder);
  //   
  //   fileView = Greenhouse.mainPage.getPath('mainPane.split.topLeftView.fileList.contentView');
  //   fileView = fileView.itemViewForContentObject(newFolder);
  //   this.invokeLater(function(){
  //     fileView.beginEditing();
  //   });
  // },
  // 
  // deleteFile: function(){
  //  var sel = this.get('selection'), contents;
  // 
  //   if(sel.firstObject()){
  //     sel = sel.firstObject();
  //     this.deselectObject(sel);
  //     contents = sel.getPath('parent.contents');
  //     contents.removeObject(sel);
  //     
  //     sel.deleteFile();
  //     
  //   }
  // },
  // 
  // _new_file: function(body){
  //   var sel = this.get('selection'), newFile, root = Greenhouse.get('rootFolder'), fileView, contents;
  //   sel = sel.firstObject();
  //   if(sel && (sel.get('contents') || sel.get('parent') !== root)){ 
  // 
  //     newFile = Greenhouse.File.createNewFile({dir: sel.get('path') + "/", name: 'untitled file', parent: sel.get('parent'), body: body });
  //     if(sel.get('contents')){
  //       contents = sel.get('contents');
  //     }
  //     else{
  //       contents = sel.getPath('parent.contents');
  //     }
  //     contents.pushObject(newFile);     
  //   }
  //   else{
  //     newFile = Greenhouse.File.createNewFile({dir:'', name: 'untitled file', parent: root});
  //     contents = root.get('contents');
  //     contents.pushObject(newFile);
  //   }
  //   
  //   this.selectObject(newFile);
  //   
  //   fileView = Greenhouse.mainPage.getPath('mainPane.split.topLeftView.fileList.contentView');
  //   fileView = fileView.itemViewForContentObject(newFile);
  //   this.invokeLater(function(){
  //     fileView.beginEditing();
  //   });
  // }
  // 
  
}) ;
