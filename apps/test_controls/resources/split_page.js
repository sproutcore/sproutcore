/*global TestControls*/
SC.mixin(SC.SplitDividerView.prototype, { wantsAcceleratedLayer: YES });

TestControls.SplitColumn = SC.View.design(SC.SplitChild, {
  autoResizeStyle: SC.RESIZE_AUTOMATIC,
  
  size: 100,
  
  minimumSize: 100,
  
  backgroundColor: 'white',
  wantsAcceleratedLayer: YES,
  compensatesForMovement: YES,
  
  childViews: 'allowIndirect compensates resizeStyle'.w(),
  
  allowIndirect: SC.CheckboxView.design({
    layout: { top: 10, left: 10, width: 200, height: 24 },
    title: "Allow Indirect Adjustments",
    valueBinding: '*parentView.allowsIndirectAdjustments'
  }),

  compensates: SC.CheckboxView.design({
    layout: { top: 40, left: 10, width: 200, height: 24 },
    title: "Compensates for Movement",
    valueBinding: '*parentView.compensatesForMovement'
  }),
  
  resizeStyle: SC.SelectView.design({
    layout: { left: 10, top: 70, width: 120, height: 24 },
    items: [
      {title: 'Fixed Size', value: SC.FIXED_SIZE },
      {title: 'Manual Resize', value: SC.RESIZE_MANUAL },
      { title: 'Auto Resize', value: SC.RESIZE_AUTOMATIC }
    ],
    
    itemTitleKey: 'title',
    itemValueKey: 'value',
    
    value: SC.RESIZE_AUTOMATIC,
    valueBinding: '*parentView.autoResizeStyle'
  })
});

TestControls.splitPage = SC.View.design({
  childViews: 'toolbar scroll'.w(),
  
  toolbar: SC.ToolbarView.design(SC.FlowedLayout, SC.AutoMixin, {
    autoMixins: [{ wantsAcceleratedLayer: YES }],
    align: SC.ALIGN_RIGHT,
    canWrap: NO,
    
    layout: { height: 44, bottom: 0 },
    
    flowPadding: { top: 7 },
    defaultFlowSpacing: { right: 5, left: 5 },
    
    childViews: 'direction resize allAllowIndirect allCompensateForMovement spacer add remove'.w(),
    
    direction: SC.SelectView.design({
      flowSpacing: { left: 5, top: 3, right: 5 },
      
      layout: { width:200, height: 24 },
      items: [
        {title: 'Horizontal', value: SC.LAYOUT_HORIZONTAL},
        {title: 'Vertical', value: SC.LAYOUT_VERTICAL}
      ],
      
      itemTitleKey: 'title',
      itemValueKey: 'value',
      value: SC.LAYOUT_VERTICAL,
      valueBinding: 'TestControls.splitController.layoutDirection'
    }),
    
    resize: SC.CheckboxView.design({
      flowSpacing: { top: 6, left: 5, right: 5 },
      layout: { width: 170 },
      title: "Resize Children to Fit",
      valueBinding: 'TestControls.splitController.shouldResizeChildrenToFit'
    }),

    allAllowIndirect: SC.CheckboxView.design({
      flowSpacing: { top: 6, left: 5, right: 5 },
      layout: {width:150},
      title: "Allow Indirect",
      valueBinding: 'TestControls.splitController.allAllowIndirect'
    }),

    allCompensateForMovement: SC.CheckboxView.design({
      flowSpacing: { top: 6, left: 5, right: 5 },
      layout: { width:200 },
      title: "Compensate for Movement",
      valueBinding: 'TestControls.splitController.allCompensateForMovement'
    }),

    
    spacer: SC.View.design({ isSpacer: YES }),
    
    add: SC.ButtonView.design(SC.AutoResize, {
      layout: { height: 30 },
      controlSize: SC.HUGE_CONTROL_SIZE,
      autoResizeField: 'title',
      title: "Add",
      
      target: 'TestControls.splitController',
      action: 'addChild'
    }),
    
    remove: SC.ButtonView.design(SC.AutoResize, {
      layout: { height: 30 },
      controlSize: SC.HUGE_CONTROL_SIZE,
      
      autoResizeField: 'title',
      title: "Remove",
      
      target: 'TestControls.splitController',
      action: 'removeChild'
    })
  }),
  
  scroll: SC.ScrollView.design({
    borderStyle: SC.BORDER_NONE,
    layout: { bottom: 44 },
    
    contentView: SC.SplitView.design({
      init: function() {
        sc_super();
        TestControls.splitController.bind('children', this, 'childViews');
      },

      layoutDirectionBinding: 'TestControls.splitController.layoutDirection',
      
      shouldResizeChildrenToFitBinding: 'TestControls.splitController.shouldResizeChildrenToFit',

      childViews: 'initial'.w(),

      initial: TestControls.SplitColumn.design()
    })
  })
  
});
