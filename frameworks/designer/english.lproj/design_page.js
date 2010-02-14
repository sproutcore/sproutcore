// ==========================================================================
// Project:   SC - designPage
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals SC */

SC.designPage = SC.Page.create({
  // ..........................................................
  // Views used inside iframe...
  // 
  designViewer: SC.View.design({
    childViews: 'container viewList'.w(),
    
    container: SC.ContainerView.design({
      layout: {top: 0, left: 0, right: 0, bottom: 50},
      contentViewBinding:'SC.designController.view'
    }),
    
    viewList: SC.GridView.design({
      layout: {left:0, right: 0, bottom: 0, height: 50},
      //contentBinding: 'SC.designsController',
      selectionBinding: 'SC.designsController.selection',
      contentValueKey: 'name'
    })
  })
});