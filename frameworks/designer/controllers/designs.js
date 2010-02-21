// ==========================================================================
// Project:   SC.designsController
// ==========================================================================
/*globals SC */

/** @class

  (Document Your Controller Here)
  
  this controller is used by Greenhouse to list all of the views in a page files

  @extends SC.Object
*/
SC.designsController = SC.ArrayController.create(
/** @scope SC.designsController.prototype */ {
  
  setDesigns: function(page, iframe){
    var designs = [];
    
    for(var v in page){
      if(page.hasOwnProperty(v)){
        if(page[v] && page[v].kindOf){
          
          if(page[v].kindOf(iframe.SC.Pane)){
            designs.push(SC.Object.create({type: 'pane', view: page.get(v), name: v}));
          }
          else if(page[v].kindOf(iframe.SC.View)){
            designs.push(SC.Object.create({type: 'view', view: page.get(v), name: v}));
          }
          else if(page[v].kindOf(iframe.SC.Page)){
            designs.push(SC.Object.create({type: 'page', view: page.get(v), name: v}));
          }

        }
      }
    }
    this.set('content', designs);
  }
  
}) ;
