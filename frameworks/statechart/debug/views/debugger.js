// ==========================================================================
// Project:   SproutCore Statechart - Hierarchical State Machine Library
// Copyright: ©2009 Sprout Systems, Inc. and contributors.
//            Portions ©2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('debug/controllers/statecharts');
sc_require('debug/views/select_field');

SC.StatechartDebuggerView = SC.View.extend({
  classNames: 'sc-statechart-debugger',
  
  childViews: 'statechartObjects messageLog button trace singleStep'.w(),
  // childViews: 'messageLog trace singleStep'.w(),
  
  statechartObjects: SC.StatechartSelectFieldView.extend({
    layout: { top: 10, left: 20, height: 22, width: 150 },
    
    valueBinding: 'StatechartDebugger.statechartsController.selection',
    valueBindingDefault: SC.Binding.single(),
    contentBinding: 'StatechartDebugger.statechartsController.arrangedObjects'
  }),
  
  messageLog: SC.LabelView.extend({
    // layout: { top:10, left:190, height: 22, right: 240 },
    layout: { top:10, left:190, height: 22, right: 300 },
    
    valueBinding: 'StatechartDebugger.statechartController.sc_statePath'
  }),
  
  button: SC.ButtonView.extend({
    // layout: { top:10, left:190, height: 22, right: 240 },
    layout: { top:10, width:40, height: 22, right: 250 },
    
    target: StatechartDebugger,
    action: 'addObject'
  }),
  
  trace: SC.CheckboxView.extend({
    layout: { top:10, right: 150, height: 22, width: 70 },
    
    isVisibleBinding: 'StatechartDebugger.statechartsController.hasSelection',
    
    title: "Trace",
    valueBinding: 'StatechartDebugger.statechartController.sc_trace'
  }),
  
  singleStep: SC.CheckboxView.design({
    layout: { top:10, right: 20, height: 22, width: 120 },
    
    isVisibleBinding: 'StatechartDebugger.statechartsController.hasSelection',
    isEnabledBinding: 'StatechartDebugger.statechartController.sc_trace',
    
    title: "SingleStep",
    valueBinding: 'StatechartDebugger.statechartController.sc_singleStep'
  })
  
});