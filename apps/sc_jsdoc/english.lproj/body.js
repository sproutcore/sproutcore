// ==========================================================================
// JsDoc
// ==========================================================================

JsDoc.bodyPage = SC.Page.create({
  
  pageName: 'JsDoc.mainPage',
  
  mainPane: SC.MainPane.design({
    
    childViews: [
      SC.View.design({
        layout: { top: 0, left: 0, right: 0, height: 40 },
        classNames: 'app-header',
        
        childViews: [
          SC.ImageView.design({
            layout: { top: 3, left: 5, width: 30, height: 30 },
            value: static_url('images/sproutcore-logo')
          }),
          
          SC.LabelView.design({
            layout: { top: 10, left: 40, height: 20, right: 300 },
            controlSize: SC.LARGE_CONTROL_SIZE,
            fontWeight: SC.BOLD_WEIGHT,
            classNames: 'app-label',
            valueBinding: 'JsDoc.docsController.displayClientName'
          }),
          
          SC.TextFieldView.design({
            layout: { top: 6, width: 150, height: 20, right: 10 },
            hint: 'Search Symbols',
            target: 'JsDoc.docsController',
            action: 'search'
          })
        ]
      }),
      
      SC.SplitView.design({
        layout: { top: 36, left: 0, right: 0, bottom: 36 },
        layoutDirection: SC.LAYOUT_HORIZONTAL,
        defaultThickness: 0.2, // a number between 0 and 1.0
        
        topLeftMinThickness: 200,
        canCollapseViews: NO,
        
        autoresizeBehavior: SC.RESIZE_BOTTOM_RIGHT,
        
        dividerThickness: 7,
        
        topLeftView: SC.ScrollView.design({
          layout: { left: 0, top: 0, right: 0, bottom: 0 },
          hasHorizontalScroller: NO,
          
          contentView: SC.ListView.design({
            layout: { left: 0, top: 0, right: 0, bottom: 0 },
            contentBinding: 'JsDoc.docsController.arrangedObjects',
            selectionBinding: 'JsDoc.docsController.selection',
            contentValueKey: 'title'
          }),
        }),
        
        dividerView: SC.SplitDividerView.design({
          layout: { left: 0, top: 0, right: 0, bottom: 0 }
        }),
        
        bottomRightView: SC.IFrameView.design({
          layout: { left: 0, top: 0, right: 0, bottom: 0 },
          contentBinding: 'JsDoc.docsController.selectedDoc',
          contentUrlKey: 'staticUrl'
        })
      }),
      
      SC.View.design({
        layout: { height: 40, left: 0, right: 0, bottom: 0 },
        classNames: 'app-footer',
        
        childViews: [
          SC.ButtonView.design({
            layout: { bottom: 6, width: 140, height: 20, left: 10 },
            title: 'Rebuild Docs',
            isEnabledBinding: 'JsDoc.docsController.canRebuild',
            target: 'JsDoc.docsController',
            action: 'rebuildJsDoc'
          }),
          
          SC.LabelView.design({
            layout: { bottom: 10, left: 200, height: 20, right: 200 },
            controlSize: SC.LARGE_CONTROL_SIZE,
            fontWeight: SC.BOLD_WEIGHT,
            textAlign: SC.ALIGN_CENTER,
            valueBinding: 'JsDoc.docsController.nowShowingLabel'
          })
        ]
      })
    ]
 })
 
});
