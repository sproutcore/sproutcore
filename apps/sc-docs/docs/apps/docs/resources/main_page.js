// ==========================================================================
// Project:   Docs - mainPage
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Docs */

// This page describes the main user interface for your application.  
Docs.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({
    layerId: 'mainPane',
    childViews: 'sidebar detailView'.w(),
    
    sidebar: SC.View.design({
      layout: { top:0, left:0, bottom:0, width:190 },
      childViews: 'search classList'.w(),

      search: SC.View.design({
        layout: { top:0, left:0, height:35, width:190 },
        classNames: 'search'.w(),
        childViews: 'searchTextField'.w(),

        searchTextField: SC.TextFieldView.design({
          hint: 'Search For Symbol',
          valueBinding: 'Docs.searchController.searchQuery'
        })
      }),

      classList: SC.ScrollView.design({
        layout: { top:35, left:0, bottom:0, width:190 },

        contentView: Docs.MasterListView.design({
          contentBinding: 'Docs.classesController.arrangedObjects',
          selectionBinding: 'Docs.classesController.selection',
          showAlternatingRows: YES,
          contentValueKey: 'displayName'
        })
      })
    }),

    detailView: SC.View.design({
      layout: { top:0, left:190, bottom:0, right:0 },
      childViews: 'toolbar workspace'.w(),

      toolbar: SC.View.design({
        layout: { top:0, left:0, right:0, height:50 },
        classNames: 'class-header'.w(),
        childViews: 'className'.w(),

        className: SC.LabelView.design({
          layout: { centerY:0, left:10, right:0, height:27 },
          classNames: 'class-name'.w(),
          valueBinding: 'Docs.selectedClassController.name',
          controlSize: SC.LARGE_CONTROL_SIZE
        })
      }),

      workspace: SC.View.design({
        layout: { top:50, left:0, bottom:0, right:0 },
        classNames: 'workspace'.w(),
        childViews: 'symbolList classDetails'.w(),

        symbolList: SC.ScrollView.design({
          layout: { top:0, left:0, bottom:0, width:190 },
          contentView: Docs.DetailListView.design({
            classNames: 'symbol-list'.w(),
            contentBinding: 'Docs.selectedClassController.symbols',
            selectionBinding: 'Docs.selectedClassController.symbolSelection',
            contentValueKey: 'name',
            contentIconKey: 'icon',

            exampleView: SC.ListItemView.extend({
              hasContentIcon: YES
            })
          }) 
        }),

        classDetails: SC.TemplateView.design({
          classNames: 'class-detail'.w(),
          isTextSelectable: YES,
          contentBinding: 'Docs.selectedClassController.content',
          templateName: 'details'
        })
      })
    })
  })
});
