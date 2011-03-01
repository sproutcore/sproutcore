// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global TestControls tile Forms */

require("resources/progress_page");
require("resources/buttons_page");
require("resources/checkboxes_page");
require("resources/radio_page");
require("resources/select_page");
require("resources/segmented_page");
require("resources/sliders_page");
require("resources/text_field_page");
require("resources/flow_layout_page");
require("resources/scroll_page");
require("resources/list_page");
require("resources/tab_page");

TestControls.mainPage = SC.Page.create({
  
  mainPane: SC.MainPane.design(SC.Animatable, {
    childViews: "split".w(),
    wantsTouchIntercept: YES,
    
    split: SC.MasterDetailView.design ({
      classNames: [ window.navigator.standalone ? "round-toolbars" : "normal" ],
      autoHideMaster: YES,
      
      pickerPane: SC.PickerPane.extend(SC.Animatable, {
        transitions: { 
          opacity: { 
            duration: 0.25, 
            timing: SC.Animatable.TRANSITION_EASE_IN_OUT,
            action: function(){ 
              if (this.style.opacity === 0) this._call_when_done();
            } 
          }
        },
        style: { opacity: 1 },
        layout: { width: 250, height: 480 },
        theme: "popover",
        
        append: function() {
          this.disableAnimation();
          this.adjust("opacity", 1).updateLayout();
          this.enableAnimation();
          sc_super();
        },
        
        remove: function() {
          this._call_when_done = arguments.callee.base;
          this.adjust("opacity", 0);
        }
      }),
      
      masterView: SC.WorkspaceView.design({
        topToolbar: SC.ToolbarView.design({
          layout: { top: 0, left: 0, right: 0, height: 32 },
          childViews: "label".w(),
          label: SC.LabelView.design({
            layout: { left: 10, centerY: 0, height: 21, width: 200 },
            value: "Test Controls",
            classNames: "embossed".w()
          })
        }),
        
        contentView: SC.ScrollView.design({
          classNames: ["sc-source-list-background"],
          contentView: SC.SourceListView.design({
            layout: { left: 0, top: 0, right: 0, bottom: 0 },
            contentValueKey: "name",
            contentBinding: "TestControls.categoriesController.arrangedObjects",
            selectionBinding: "TestControls.categoriesController.selection"
          })
        })
      }),
      detailView: SC.WorkspaceView.design({
        themeName: 'ace',
        themeNameBinding: 'TestControls.categoryController.themeName',
        topToolbar: SC.ToolbarView.design({
          layout: { top: 0, left: 0, right: 0, height: 32 },
          childViews: "showMaster label useDarkTheme".w(),
          showMaster: SC.ButtonView.design({
            layout: { left: 7, centerY: 0, height: 30, width: 100 },
            controlSize: SC.HUGE_CONTROL_SIZE,
            isVisible: NO,
            isVisibleBinding: ".parentView.masterIsHidden",
            title: "Tests",
            action: "toggleMasterPicker"
          }),
          
          label: SC.LabelView.design({
            layout: { left: 120, centerY: 0, height: 21, width: 200 },
            value: "Test Controls",
            classNames: "embossed".w(),
            isVisible: NO,
            isVisibleBinding: SC.Binding.from(".parentView.masterIsHidden")
          }),
          
          useDarkTheme: SC.CheckboxView.design({
            layout: { right: 10, centerY: 0, height: 18, width: 150 },
            title: "Use Dark Theme",
            valueBinding: 'TestControls.categoryController.useDarkTheme'
          })
        }),
        contentView: SC.ContainerView.design({
          nowShowingBinding: "TestControls.categoryController.nowShowing"
        })
      })
    })
  }),

  welcome: SC.LabelView.design({
    escapeHTML: NO,
    classNames: 'welcome-tab',
    value: "<h1>Test Controls</h1><p>SproutCore comes bundled with a wide array of controls that you can use in your own applications. Most of these controls can be created very easily using the built-in view helper functions. Consult the source code of this application for samples code to use in your own application.</p>"
  }),
  
  progress_page: TestControls.progressPage,
  
  buttons_page: TestControls.buttonsPage,
  
  checkboxes_page: TestControls.checkboxesPage,
  
  radio_page: TestControls.radioPage,
  
  select_page: TestControls.selectPage,

  sliders_page: TestControls.slidersPage,
  
  text_field_page: TestControls.textFieldPage,
  
  segmented_page: TestControls.segmentedPage,
  
  flow_layout_page: TestControls.flowLayoutPage,
  
  scroll_page: TestControls.scrollPage,
  
  list_page: TestControls.listPage,
  
  tab_page: TestControls.tabPage
});
