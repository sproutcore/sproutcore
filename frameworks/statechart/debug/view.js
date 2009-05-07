// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('debug/controller');
sc_require('debug/select_view');

SC.StatechartView = SC.View.extend({
  classNames: 'sc-statechart',
  
  childViews: 'statechartObjects statePath messageLog button trace singleStep'.w(),
  // childViews: 'messageLog trace singleStep'.w(),
  
  statechartObjects: SC.StatechartSelectFieldView.extend({
    layout: { top: 10, left: 20, height: 22, width: 150 },
    
    valueBinding: 'StatechartDebugger.statechartsController.selection',
    valueBindingDefault: SC.Binding.single(),
    contentBinding: 'StatechartDebugger.statechartsController.arrangedObjects'
  }),
  
  statePath: SC.LabelView.extend({
    // layout: { top:10, left:190, height: 22, right: 240 },
    layout: { top:10, left:190, height: 22, right: 260 },
    
    valueBinding: 'StatechartDebugger.statechartController.sc_statePath'
  }),
  
  messageLog: SC.LabelView.extend({
    // layout: { top:10, left:190, height: 22, right: 240 },
    layout: { top:10, width:350, height: 22, right: 300 },
    
    valueBinding: 'StatechartDebugger.statechartController.sc_lastMessage'
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