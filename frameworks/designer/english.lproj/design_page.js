// ==========================================================================
// Project:   SC - designPage
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals SC */
//TODO: [MB] make this a mainPane
SC.designPage = SC.Page.create({
  // ..........................................................
  // Views used inside iframe...
  // 
  designViewer: SC.View.design({
    childViews: 'container viewList'.w(),
    
    container: SC.ContainerView.design({
      layout: {top: 10, left: 10, right: 10, bottom: 60},
      contentViewBinding:'SC.designController.view',
      backgroundColor: 'white'
    }),
    
    viewList: SC.GridView.design({
      layout: {left:0, right: 0, bottom: 0, height: 50},
      //contentBinding: 'SC.designsController',
      selectionBinding: 'SC.designsController.selection',
      contentValueKey: 'name'
    })
  })
});