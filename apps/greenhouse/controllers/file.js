// ==========================================================================
// Project:   Greenhouse.file
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/

Greenhouse.fileController = SC.ObjectController.create(
/** @scope Greenhouse.fileController.prototype */ {

  contentBinding: 'Greenhouse.filesController.selection',
  contentBindingDefault: SC.Binding.single(),
  

  _content_statusDidChange: function(){
    var c = this.get('content');
    if(c && c.get('isPage') ) {
      this.invokeOnce(function(){
        Greenhouse.sendAction('fileSelectedIsAPage');
        Greenhouse.sendAction('cancel');
      });
    }
    else if (c && !c.get('isPage')){
      this.invokeOnce(function(){
        Greenhouse.sendAction('fileSelectedIsNotAPage');
      });
    }
  }.observes('*content.body')  
}) ;
