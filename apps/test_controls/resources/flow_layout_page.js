// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals TestControls Forms*/
TestControls.flowLayoutPage = SC.View.design({
  childViews: "form".w(),
  form: SC.FormView.design({
    classNames: ["sample_controls"],
    layout: { left: 20, top: 40, right: 20, bottom: 40 },
    childViews: "header normal vertical".w(),
    header: SC.LabelView.design({
      layout: { width: 300, height: 24 },
      classNames: "header".w(),
      value: "Flow Layout"
    }),
    normal: SC.FormView.row(SC.View.extend(SC.Animatable, SC.FlowedLayout, SC.AutoMixin, {
      isSpacer: YES,
      
      init: function() {
        sc_super();
        this.style.overflow = "visible";
        SC.Timer.schedule({
          target: this,
          action: "hideOne",
          interval: 1000,
          repeats: YES
        });
      },
      
      hideOne: function() {
        if (this._hasHidden) this.b.set("isHidden", NO);
        else this.b.set("isHidden", YES);
        this._hasHidden = !this._hasHidden;
      },
      
      autoMixins: [SC.Animatable, {
        transitions: { left: 0.25, top: 0.25, width: 0.25, opacity: 0.25 }
      }],
      
      childViews: "a s b s2 c d".w(),
      layout: { width: 600 },
      align: SC.ALIGN_RIGHT,
      layoutDirection: SC.LAYOUT_HORIZONTAL,
      defaultFlowSpacing: {
        left: 10, top: 10, right: 10, bottom: 0
      },
      a: SC.ButtonView.design({ flowSpacing: { top: 5, left: 4, right: 3, bottom: 2 }, layout: {width: 150, height: 24}, title: "a" }),
      s: SC.View.design({ isSpacer: YES, spaceUnits: 2, backgroundColor: "gray", layout: {width: 0, height: 24} }),
      b: SC.ButtonView.design({ 
        layout: {width: 190, height: 24}, 
        title: "b",
        isHiddenDidChange: function() {
          this.adjust("opacity", this.get("isHidden") ? 0 : 1);
          this.set('useAbsoluteLayout', this.get('isHidden'));
        }.observes("isHidden")
      }),
      s2: SC.View.design({ isSpacer: YES, spaceUnits: 1, backgroundColor: "gray", layout: {width: 0, height: 24} }),
      c: SC.ButtonView.design({ layout: {width: 120, height: 24 }, title: "c" }),
      d: SC.ButtonView.design({ layout: {width: 200, height: 24 }, title: "d" })
    })),
    
    vertical: SC.FormView.row(SC.View.extend(SC.FlowedLayout, {
      layout: { height: 100 },
      childViews: "a s b s2 c d".w(),
      isSpacer: YES,
      
      layoutDirection: SC.LAYOUT_VERTICAL,
      align: SC.ALIGN_CENTER,
      defaultFlowSpacing: {
        left: 10, top: 10, right: 10, bottom: 0
      },
      a: SC.ButtonView.design({ flowSpacing: { top: 5, left: 4, right: 3, bottom: 2 }, layout: {width: 150, height: 24}, title: "a" }),
      s: SC.View.design({ fillWidth: YES, isSpacer: YES, spaceUnits: 2 }),
      b: SC.ButtonView.design({ layout: {width: 190, height: 24}, title: "b" }),
      s2: SC.View.design({ fillWidth: YES, isSpacer: YES, spaceUnits: 1 }),
      c: SC.ButtonView.design({ layout: {width: 120, height: 24 }, title: "c" }),
      d: SC.ButtonView.design({ layout: {width: 200, height: 24 }, title: "d" })
    }))
  })
});