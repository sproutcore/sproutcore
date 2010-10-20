// ==========================================================================
// Project:   Greenhouse - appPage
// Copyright: ©2010 Mike Ball
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
      nowShowing: 'pageDesigner' //Hardcoded till we add another mode like bespin
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
        classNames: ['dark'],
        layout: {left: 171, width: 47, height: 24, centerY: -1},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'projects',
        action: 'openProjectPicker'
      }),
      
      save: SC.ButtonView.design({
        toolTip: "_Save".loc(),
        classNames: ['dark'],
        layout: {left: 251, centerY: -1, width: 47, height: 24},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'save',
        action: 'save'
      }),
      
      run: SC.ButtonView.design({
        toolTip: "_Run".loc(),
        classNames: ['dark'],
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
        classNames: ['dark'],
        layout: {right: 153, width: 47, height: 24, centerY: -1},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'library',
        action: 'openLibrary'
      }),
      
      inspector: SC.ButtonView.design({
        toolTip: "_Inspector".loc(),
        classNames: ['dark'],
        layout: {right: 100, width: 47, height: 24, centerY: -1},
        titleMinWidth: 37,
        hasIcon: YES,
        icon: 'inspector',
        action: 'openInspector'
      }),
      
      action: SC.ButtonView.design(Greenhouse.DropDown, {
        classNames: ['dark'],
        layout: {right: 20, centerY: -1, width: 47, height: 24},
        titleMinWidth: 37,
        hasIcon: YES,
        toolTip: "_Actions".loc(),
        icon: 'actions',
        dropDown: SC.MenuPane.design({
          defaultResponder: 'Orion',
          layout: { width: 140, height: 0 },
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
      classNames: ['anchored'],
      
      libraryArea: SC.ContainerView.design({
        classNames: ['library-docked'],
        layout: { left: 0, top: 0, right: 0, bottom: 386 },
        nowShowing: null
      }),

      inspectorArea: SC.ContainerView.design({
        classNames: ['inspector-docked'],
        layout: { right: 0, bottom: 0, left: 0, height: 385 },
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
        classNames: ['close-button'],
        layout: {right: 1, top: 6, width: 18, height: 17},
        action: 'closeInspector'
      })
    }),
  
    content: SC.TabView.design({
      layout: { left: 6, right: 6, bottom: 6, height: 368 },
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
    classNames: ['gh-picker', 'inspector'],
    layout: {width: 230, height: 380},
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
    childViews: 'controlBar toolbar content'.w(),
    
    controlBar: SC.View.design({
      classNames: ['control-bar'],
      layout: { left: 10, right: 10, top: 12, height: 24 },
      childViews: 'search'.w(),
      
      search: SC.TextFieldView.design({
        classNames: ['search'],
        layout: {top: 0, centerX: 0, width: 180, height: 24 },
        valueBinding: 'Greenhouse.libraryController.search'
      })
    }),
    
    toolbar: SC.View.design({
      layout: {top:0, left: 0, right:0, height: 28},
      isVisible: NO,
      childViews: 'remove'.w(),
      remove: SC.View.design(Greenhouse.SimpleButton,{
        classNames: ['close-button'],
        layout: {right: 1, top: 6, width: 18, height: 17},
        action: 'closeLibrary'
      })
    }),
    
    content: SC.View.design({
      classNames: ['content'],
      layout: { top: 49, bottom: 11, left: 8, right: 8 },
      childViews: 'library addCustomView removeCustomView'.w(),
    
      library: SC.ScrollView.design({
        classNames: ['library-list'],
        layout: {top: 0, bottom: 32, left: 0, right: 0 },
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
      
      removeCustomView: SC.ButtonView.design({
        classNames: ['dark'],
        layout: { bottom: 1, right: 70, height: 24, width: 70 },
        titleMinWidth: 0,
        hasIcon: NO,
        isEnabledBinding: 'Greenhouse.libraryController*selection.firstObject.canEdit',
        title: "_Remove".loc(),
        action: 'removeCustomView'
      }),
    
      addCustomView: SC.ButtonView.design({
        classNames: ['dark'],
        layout: { bottom: 1, right: 0, height: 24, width: 50 },
        titleMinWidth: 0,
        hasIcon: NO,
        title: "_Add".loc(),
        action: 'newCustomView'
      })
    })
  }),
  
  libraryPickerContentView: SC.outlet('libraryPicker.contentView'),
  libraryPicker: Greenhouse.TearOffPicker.design({
    classNames: ['gh-picker'],
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
    classNames: ['gh-picker'],
    layout: {width: 200, height: 500},
    defaultResponder: 'Greenhouse',
    computeAnchorRect: function(anchor) {
      var ret = SC.viewportOffset(anchor); // get x & y
      var cq = SC.$(anchor);
      var wsize = SC.RootResponder.responder.computeWindowSize() ;
      ret.width = cq.outerWidth();
      ret.height = (wsize.height-ret.y) < cq.outerHeight() ? (wsize.height-ret.y) : cq.outerHeight();
      ret.y = ret.y -11;
      return ret ;
    },
    modalPaneDidClick: function(evt) {
      var f = this.get("frame");
      if(!this.clickInside(f, evt)){ 
        Greenhouse.sendAction('cancel');
      }
      return YES ; 
    },
    contentView: SC.View.design({
      childViews: 'controlBar fileList'.w(),
      
      controlBar: SC.View.design({
        classNames: ['control-bar'],
        layout: { left: 10, right: 10, top: 12, height: 24 },
        childViews: 'addPage'.w(),
        
        addPage: SC.ButtonView.design({
          classNames: ['dark'],
          layout: { width: 90, height: 24, left: 0 },
          titleMinWidth: 0,
          hasIcon: NO,
          title: "_Add Page...".loc(),
          action: 'newPageFile'
        })
      }),

      fileList: SC.ScrollView.design({
        classNames: ['content'],
        layout: { top: 49, bottom: 11, left: 8, right: 8 },
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
