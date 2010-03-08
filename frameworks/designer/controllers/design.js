// ==========================================================================
// Project:   SC.designController
// ==========================================================================
/*globals SC */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
SC.designController = SC.ObjectController.create(
/** @scope SC.designController.prototype */ {

  contentBinding: 'SC.designsController.selection',
  contentBindingDefault: SC.Binding.single(),
  
  viewSelected: function(){
    var c = this.get('content'), pane, designer;
    if(c){
      pane = c.get('view');
      designer = pane.get('designer');
      //disable design mode
      if(designer) designer.set('designIsEnabled', NO);
      
      //remove any existing panes
      if(this._currentPane && pane !== this._currentPane){
        this._currentPane.remove();
        this._currentPane = null;
      }
      //append if necessary..
      if(c.get('type') === 'pane' && this._currentPane !== pane){
        pane.append();
        pane.adjust({bottom: 60}); //TODO: figure out how to reverse this....
        pane.set('isModal', NO);
        this._currentPane = pane;
      }
    }
  }
}) ;
