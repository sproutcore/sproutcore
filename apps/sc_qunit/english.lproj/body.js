// ==========================================================================
// QUnit
// ==========================================================================

QUnit.bodyPage = SC.Page.create({
  
  pageName: 'QUnit.mainPage',
  
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
            valueBinding: 'QUnit.runnerController.displayClientName'
          }),
          
          SC.CheckboxView.design({
            layout: { top: 10, width: 180, height: 20, right: 100 },
            title: 'Continuous Integration',
            valueBinding: 'QUnit.runnerController.isContinuousIntegrationEnabled'
          }),
          
          SC.ButtonView.design({
            layout: { top: 6, width: 90, height: 20, right: 10 },
            titleBinding: 'QUnit.runnerController.runTestLabel',
            target: 'QUnit.runnerController',
            action: 'toggleRunTests'
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
            contentBinding: 'QUnit.runnerController.arrangedObjects',
            selectionBinding: 'QUnit.runnerController.selection',
            contentValueKey: 'title'
          }),
        }),
        
        dividerView: SC.SplitDividerView.design({
          layout: { left: 0, top: 0, right: 0, bottom: 0 }
        }),
        
        bottomRightView: QUnit.TestIFrameView.design({
          layout: { left: 0, top: 0, right: 0, bottom: 0 },
          contentBinding: 'QUnit.runnerController.selectedTest',
          contentUrlKey: 'url',
          stateBinding: 'QUnit.runnerController.testState'
        })
      }),
      
      SC.View.design({
        layout: { height: 40, left: 0, right: 0, bottom: 0 },
        classNames: 'app-footer',
        
        childViews: [
          SC.LabelView.design({
            isVisible: NO, // qUnit does not work with testStateLabel yet...
            layout: { bottom: 10, left: 200, height: 20, right: 200 },
            controlSize: SC.LARGE_CONTROL_SIZE,
            fontWeight: SC.BOLD_WEIGHT,
            textAlign: SC.ALIGN_CENTER,
            valueBinding: 'QUnit.runnerController.testStateLabel'
          }),
          
          SC.ButtonView.design({
            layout: { bottom: 6, width: 140, height: 20, right: 10 },
            title: 'Rerun Current Test',
            isEnabledBinding: 'QUnit.runnerController.canRerunCurrentTest',
            target: 'QUnit.runnerController',
            action: 'rerunCurrentTest'
          })
        ]
      })
    ]
 })
 
});
