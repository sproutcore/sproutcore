// ==========================================================================
// Project:   Greenhouse.file
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/
Greenhouse.PAGE_DESIGNER = "pageDesigner";
Greenhouse.BESPIN = "bespin";

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
  }.observes('*content.body'),
  
  state: null,
  editorMode: '',
  
  // ..........................................................
  // State information
  // 
  //TODO: Rip this crap out...
  init: function(){
    sc_super();
    this.set('state', Greenhouse.PAGE_DESIGNER);
    this.set('editorMode', "pageDesigner");
    
  },
  
  pageDesigner: function(){
    var state = this.get('state');
    switch(state){
      case Greenhouse.BESPIN:
        this.set('state', Greenhouse.PAGE_DESIGNER);
        this.set('editorMode', "pageDesigner");
        break;
      default:
        console.log("RedBull.fileController#pageDesigner not handled in current state %@".fmt(state));
        break;
    }
  },
  
  bespinEditor: function(){
    var state = this.get('state');
    switch(state){
      case Greenhouse.PAGE_DESIGNER:
        this.set('state', Greenhouse.BESPIN);
        this.set('editorMode', "bespinEditor");
        break;
      default:
        console.log("RedBull.fileController#bespinEditor not handled in current state %@".fmt(state));
        break;
    }
  }
  
  
}) ;
