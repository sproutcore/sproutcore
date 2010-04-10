// ==========================================================================
// Project:   Greenhouse.designController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/
Greenhouse.designController = SC.ObjectController.create(
/** @scope Greenhouse.designController.prototype */ {
  contentBinding: 'Greenhouse.pageController*designController.selection',
  contentBindingDefault: SC.Binding.single(),
  
  ignoreKeys: "layout childViews".w(),
  
  editableProperties: function(){
    var c = this.get('content'), view;
    if(c) view = c.get('view');
    
    if(c && view){
      var con = c.get('designAttrs'), ret = [];
      if(con) con = con[0];
      for(var i in con){
        if(con.hasOwnProperty(i) && this.ignoreKeys.indexOf(i) < 0){
          ret.push(SC.Object.create({value: view[i], key: i, view: view}));
        }
      }
    }
   return ret; 
  }.property('content').cacheable(),
  
  propertySelection: null
  
}) ;
