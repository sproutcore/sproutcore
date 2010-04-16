// ==========================================================================
// Project:   Greenhouse - appPage
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals Greenhouse */
require('views/list_item');
require('views/web');
require('views/tear_off_picker');
require('mixins/drop_down');
require('views/simple_button');
// This page has the main UI layout
Greenhouse.appPage = SC.Page.design({
  
  mainView: SC.View.design({
    layout: { top: -1, bottom: 0, left: 0, right: 0 },
    childViews: 'mainContainer toolBar'.w(),
    defaultResponder: "Greenhouse",
    
    mainContainer: SC.ContainerView.design({
      layout: { left: 0, top: 46, right: 0, bottom: 0 },
      nowShowingBinding: 'Greenhouse.fileController.editorMode' 
    }),
    
    toolBar: SC.ToolbarView.design({
      layout: { left: 0, right: 0, top: 0, height: 46 },
      anchorLocation: SC.ANCHOR_TOP,
      classNames: ['toolbar'],

      childViews: 'logo project save run title library inspector action '.w(),
      
      logo: SC.View.design({
        layout: {left: 20, width: 131, height: 32, centerY: -1},
        classNames: ['greenhouse-logo-s']
      }),
      
      project: SC.ButtonView.design({
        toolTip: "_Project".loc(),
        layout: {left: 171, width: 47, height: 24, centerY: -1},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'projects',
        action: 'openProjectPicker'
      }),
      
      save: SC.ButtonView.design({
        toolTip: "_Save".loc(),
        layout: {left: 251, centerY: -1, width: 47, height: 24},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'save',
        action: 'save'
      }),
      
      run: SC.ButtonView.design({
        toolTip: "_Run".loc(),
        layout: {left: 304, centerY: -1, width: 47, height: 24},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'run',
        action: 'run'
      }),
      
      title: SC.LabelView.design({
        layout: {centerX: 75, centerY: -2, height: 24, width: 300 },
        classNames: ['title'],
        textAlign: SC.ALIGN_CENTER,
        valueBinding: SC.Binding.oneWay('Greenhouse.fileController.name')
      }),
      
      library: SC.ButtonView.design({
        toolTip: "_Library".loc(),
        layout: {right: 153, width: 47, height: 24, centerY: -1},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'library',
        action: 'openLibrary'
      }),
      
      inspector: SC.ButtonView.design({
        toolTip: "_Inspector".loc(),
        layout: {right: 100, width: 47, height: 24, centerY: -1},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'inspector',
        action: 'openInspector'
      }),
      
      action: SC.ButtonView.design(Greenhouse.DropDown, {
        layout: {right: 20, centerY: -1, width: 47, height: 24},
        titleMinWidth: 37,
        hasIcon: YES,
        toolTip: "_Actions".loc(),
        icon: 'actions',
        dropDown: SC.MenuPane.design({
          defaultResponder: 'Orion',
          layout: { width: 110, height: 0 },
          itemTitleKey: 'title',
          itemTargetKey: 'target',
          itemActionKey: 'action',
          itemSeparatorKey: 'isSeparator',
          itemIsEnabledKey: 'isEnabled',
          items:[
            {title: "_Run".loc(), action: 'run', isEnabled: YES},
            {title: "_Reload App".loc(), action: 'reloadIframe', isEnabled: YES},
            {title: "_Dock Library".loc(), action: 'toggleDockedLibrary', isEnabled: YES},
            {title: "_Dock Inspector".loc(), action: 'toggleDockedInspector', isEnabled: YES},
            {title: "_Save".loc(), action: 'save', isEnabled: YES }
          ]
        })
      })
      
    })
    
  }),
  
  // Outlets to design views
  designAreaView: SC.outlet('pageDesigner.designArea'),
  webView: SC.outlet('pageDesigner.designArea.web'),
  eventBlocker: SC.outlet('pageDesigner.designArea.eventBlocker'),
  
  // Outlets to Docks
  dockView: SC.outlet('pageDesigner.dock'),
  libraryDockView: SC.outlet('pageDesigner.dock.libraryArea'),
  inspectorDockView: SC.outlet('pageDesigner.dock.inspectorArea'),
  
  pageDesigner: SC.View.design({
    layout: { left: 0, top: 0, right: 0, bottom: 0 },
    childViews: 'designArea dock'.w(),
    
    designArea: SC.View.design({
      layout: {top: 0, left: 0, right: 0, bottom: 0},
      classNames: ['workspace'],
      childViews: 'web eventBlocker'.w(),

      web: Greenhouse.WebView.design({
        valueBinding:'Greenhouse.targetController.appUrl'
      }),

      eventBlocker: Greenhouse.EventBlocker.design({})
    }),
    
    dock: SC.View.design({
      layout: {top: 0, bottom: 0, right: 0, width: 0},
      childViews: 'libraryArea inspectorArea'.w(),

      libraryArea: SC.ContainerView.design({
        layout: { left: 0, top: 0, right: 0, bottom: 350 },
        nowShowing: null
      }),

      inspectorArea: SC.ContainerView.design({
        layout: { right: 0, bottom: 0, left: 0, height: 350 },
        nowShowing: null
      })
    })
  }),
  
  inspectorContentView: SC.View.design({
    childViews: 'toolbar content'.w(),
  
    toolbar: SC.View.design({
      layout: {top:0, left: 0, right:0, height: 28},
      isVisible: NO,
      childViews: 'title remove'.w(),
      title: SC.LabelView.design({
        layout: {centerX: 0, top: 2, height: 24, width: 50},
        title: "_Inspector".loc()
      }),
      
      remove: SC.View.design(Greenhouse.SimpleButton,{
        layout: {right: 5, top: 2, width: 20, height: 24},
        action: 'closeInspector'
      })
    }),
  
    content: SC.TabView.design({
      layout: {left: 0, right:0, bottom: 0, height:350},
      itemTitleKey: 'title',
      itemValueKey: 'value',
      nowShowing: 'Greenhouse.inspectorsPage.layoutInspector',
      items: [
        {title: "Layout", value: 'Greenhouse.inspectorsPage.layoutInspector'},
        {title: "All Properties", value: 'Greenhouse.inspectorsPage.propertiesInspector'}]
    })
  }),
  
  // inspectorTab: SC.TabView.design({
  //   layout: {left: 0, right:0, bottom: 0, height:350},
  //   itemTitleKey: 'title',
  //   itemValueKey: 'value',
  //   nowShowing: 'Greenhouse.inspectorsPage.layoutInspector',
  //   items: [
  //     {title: "Layout", value: 'Greenhouse.inspectorsPage.layoutInspector'},
  //     {title: "All Properties", value: 'Greenhouse.inspectorsPage.propertiesInspector'}]
  // }),
  
  inspectorPickerContentView: SC.outlet('inspectorPicker.contentView'), 
  inspectorPicker: Greenhouse.TearOffPicker.design({
    layout: {width: 300, height: 380},
    defaultResponder: 'Greenhouse',
    dragAction: 'floatInspector',
    contentView: SC.ContainerView.design({
      nowShowing: 'Greenhouse.appPage.inspectorContentView'
    })
  }),
  
  // ..........................................................
  // Library Views
  // 
  libraryContentView: SC.View.design({
    childViews: 'toolbar content'.w(),
    
    toolbar: SC.View.design({
      layout: {top:0, left: 0, right:0, height: 28},
      isVisible: NO,
      childViews: 'remove'.w(),
      remove: SC.View.design(Greenhouse.SimpleButton,{
        layout: {right: 5, top: 2, width: 20, height: 24},
        action: 'closeLibrary'
      })
    }),
    
    content: SC.View.design({
      childViews: 'title library libSearch addCustomView'.w(),
    
      title: SC.LabelView.design({
        layout: {top: 4, left: 5, width: 50, height: 22},
        value: "_Library".loc()
      }),
    
      libSearch: SC.TextFieldView.design({
        layout: {top: 2, left: 60, right: 5, height: 24},
        valueBinding: 'Greenhouse.libraryController.search'
      }),
    
      library: SC.ScrollView.design({
        layout: {top: 30, left: 0, right: 0, bottom: 40},
        hasHorizontalScroller: NO,
        contentView: SC.ListView.design({
          rowHeight: 36,
          isEditable: NO,
          contentValueKey: 'name',
          contentBinding: 'Greenhouse.libraryController.arrangedObjects',
          selectionBinding: 'Greenhouse.libraryController.selection',
          delegate: Greenhouse.libraryController,
          canReorderContent: YES,
          dragDidBegin: function(drag, loc) {
            Greenhouse.sendAction('cancel');
          }
        })
      }),
    
      addCustomView: SC.ButtonView.design({
        layout: { bottom: 5, right: 5, height: 24, width: 90 },
        titleMinWidth: 0,
        hasIcon: NO,
        title: "_Add View".loc(),
        action: 'newCustomView'
      })
    })
  }),
  
  libraryPickerContentView: SC.outlet('libraryPicker.contentView'),
  libraryPicker: Greenhouse.TearOffPicker.design({
    layout: {width: 230, height: 400},
    dragAction: 'floatLibrary',
    defaultResponder: 'Greenhouse',
    contentView: SC.ContainerView.design({
      nowShowing: 'Greenhouse.appPage.libraryContentView'
    })
  }),
  
  // ..........................................................
  // Project Views
  // 
  projectPicker: SC.PickerPane.design({
    layout: {width: 200, height: 500},
    defaultResponder: 'Greenhouse',
    modalPaneDidClick: function(evt) {
      var f = this.get("frame");
      if(!this.clickInside(f, evt)){ 
        Greenhouse.sendAction('cancel');
      }
      return YES ; 
    },
    contentView: SC.View.design({
      childViews: 'fileList addPage'.w(),

      fileList: SC.ScrollView.design({
        layout: { top: 0, bottom: 32, left: 0, right: 0 },
        hasHorizontalScroller: NO,
        contentView: SC.ListView.design({
          exampleView: Greenhouse.ListItem,
          isEditable: NO,
          canEditContent: YES,
          actOnSelect: YES,
          //canReorderContent: YES,
          deelegate: Greenhouse.filesController,
          contentValueKey: 'name',
          contentBinding: 'Greenhouse.filesController.arrangedObjects',
          selectionBinding: 'Greenhouse.filesController.selection',
          action: 'selectFile'
       })
      }), 
      addPage: SC.ButtonView.design({
        layout: { bottom: 5, right: 5, height: 24, width: 90 },
        titleMinWidth: 0,
        hasIcon: NO,
        title: "_Add Page...".loc(),
        action: 'newPageFile'
      })

      // fileActions: SC.ButtonView.design(Greenhouse.DropDown, {
      //   layout: { bottom: 5, left: 10, height: 24, width: 35 },
      //   titleMinWidth: 0,
      //   hasIcon: NO,
      //   title: '+',
      //   icon: 'file-actions-icon',
      //   dropDown: SC.MenuPane.design({
      //     defaultResponder: 'Greenhouse',
      //     contentView: SC.View.design({}),
      //     layout: { width: 140, height: 0 },
      //     itemTitleKey: 'title',
      //     itemActionKey: 'action',
      //     itemSeparatorKey: 'isSeparator',
      //     itemIsEnabledKey: 'isEnabled',
      //     items: [
      //       { title: "_New File".loc(), action: 'newFile', isEnabled: YES },
      //       { title: "_New Page File".loc(), action: 'newPageFile', isEnabled: YES },
      //       { title: "_New Folder".loc(), action: 'newFolder', isEnabled: YES },
      //       { title: "_Delete".loc(), action: 'deleteFile', isEnabled: YES }
      // 
      //     ]
      //   })
      // })
    })
  })
});
