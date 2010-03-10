// ==========================================================================
// Project:   SC - designPage
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals SC */
SC.designPage = SC.Page.create({
  // ..........................................................
  // Views used inside iframe...
  // 
  designMainPane: SC.MainPane.design({
    childViews: 'container viewList'.w(),
    
    container: SC.ContainerView.design( SC.DesignerDropTarget,{
      layout: {top: 10, left: 10, right: 10, bottom: 60},
      contentViewBinding:'SC.designController.view',
      backgroundColor: 'white'
    }),
    
    viewList: SC.ScrollView.design({
      layout: {left:0, right: 0, bottom: 0, height: 48},
      hasHorizontalScroller: NO,
      contentView: SC.GridView.design({
        rowHeight: 48,
        columnWidth: 48,
        //contentBinding: 'SC.designsController',
        delegate: SC.designsController,
        selectionBinding: 'SC.designsController.selection',
        contentValueKey: 'name',
        isDropTarget: YES,
        canEditContent: YES,
        canReorderContent: YES,
        canDeleteContent: YES,
        actOnSelect: YES,
        targetIsInIFrame: YES,
        target: 'SC.designController',
        action: 'viewSelected'
      })
    })
  })
});