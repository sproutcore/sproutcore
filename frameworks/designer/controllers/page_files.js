// ==========================================================================
// Project:   SC.pageFilesController
// ==========================================================================
/*globals SC */

/** @class

  in suppressMain mode all page files register with this array controller

  @extends SC.Object
*/
SC.pageFilesController = SC.ArrayController.create(
/** @scope SC.pageFilesController.prototype */ {
  
}) ;
SC.pageFilesController.mixin({
  pages: [],
  
  register: function(page){
    SC.pageFilesController.pages.pushObject(page);
  }
});