// ==========================================================================
// Project:   SproutCore
// Copyright: ©2013 GestiXi and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/view');


SC.mixin(SC.View,
  /** @scope SC.View */ {

  /**
    This child layout plugin automatically positions the view's child views in a
    grid and optionally adjusts the parent view's height and width to fit.  It
    does this by checking the column and row index of each child view and 
    positioning them in the grid accordingly.  By default any time that a child 
    view's height or width changes, the view will use this plugin to re-adjust all 
    other child views and its own height and width appropriately.

    ## Set the position of the child views in the grid with `gridProperties`

      - column - The index of the column where the child view will be.  Default: 0
      - row - The index of the row where the child view will be.  Default: 0
      - columnSpan - The number of columns the view will to take up.  Default: 1
      - rowSpan - The number of rows the view will to take up.  Default: 1

    For example,

        MyApp.MyView = SC.View.extend({

          childViewLayout: SC.View.FLEX_GRID,

          // The order of child views doesn't matter
          childViews: ['cellA', 'cellB', 'cellC', 'cellD'],

          // Actual layout will become { left: 10, right: 10, top: 20, height: 54, width: 420 }
          layout: { left: 10, top: 20 }, // Don't need to specify layout.height and layout.width, this is automatic.

          cellA: SC.View.design({
            // Actual layout will become { left: 0, width: 100, top: 0, height: 24 }
            layout: { width: 100, height: 24 },
            gridProperties: { row: 0, column: 0 }, 
          }),

          cellB: SC.View.design({
            // Actual layout will become { left: 100, width: 200, top: 0, height: 24 }
            layout: { width: 200 }, // Don't need to specify layout.height, since it is already defined in cellA
            gridProperties: { row: 0, column: 1 },  
          }),

          cellC: SC.View.design({
            // Actual layout will become { left: 0, width: 300, top: 24, height: 30 }
            layout: { height: 30 } // Don't need to specify layout.width, this is automatic when columnSpan is greater than 1.
            gridProperties: { row: 1, column: 0, columnSpan: 2 }, 
          }),

          cellD: SC.View.design({
            // Actual layout will become { left: 300, width: 120, top: 0, height: 54 }
            layout: { width: 120 } // Don't need to specify layout.height, this is automatic when rowSpan is greater than 1.
            gridProperties: { column: 2, rowSpan: 2, }, 
          })

        });

    ## Modify space between columns and rows with `childViewLayoutOptions`

    To modify the plugin behavior for all child view layouts, you can set the
    following child view layout options in `childViewLayoutOptions` on the view:

      - rowSpace - Spaces between each row.  Default: 0
      - columnSpace - Spaces between each column.  Default: 0
      - resizeToFit - Whether to resize the view to fit the child views.  Default: true

    For example,

        MyApp.MyView = SC.View.extend({

          childViewLayout: SC.View.FLEX_GRID,

          childViewLayoutOptions: {
            rowSpace: 5,
            columnSpace: 10,
          },

          // The order of child views doesn't matter
          childViews: ['cellA', 'cellB', 'cellC', 'cellD'],

          // Actual layout will become { left: 10, right: 10, top: 20, height: 59, width: 440 }
          layout: { left: 10, top: 20 }, // Don't need to specify layout.height and layout.width, this is automatic.

          cellA: SC.View.design({
            // Actual layout will become { left: 0, width: 100, top: 0, height: 24 }
            layout: { width: 100, height: 24 },
            gridProperties: { row: 0, column: 0 }, 
          }),

          cellB: SC.View.design({
            // Actual layout will become { left: 110, width: 200, top: 0, height: 24 }
            layout: { width: 200 }, // Don't need to specify layout.height, since it is already defined in cellA
            gridProperties: { row: 0, column: 1 },  
          }),

          cellC: SC.View.design({
            // Actual layout will become { left: 0, width: 300, top: 29, height: 30 }
            layout: { height: 30 } // Don't need to specify layout.width, this is automatic when columnSpan is greater than 1.
            gridProperties: { row: 1, column: 0, columnSpan: 2 }, 
          }),

          cellD: SC.View.design({
            // Actual layout will become { left: 320, width: 120, top: 0, height: 54 }
            layout: { width: 120 } // Don't need to specify layout.height, this is automatic when rowSpan is greater than 1.
            gridProperties: { column: 2, rowSpan: 2, }, 
          })

        });

    If `resizeToFit` is set to `false`, the view will not adjust itself to fit
    its child views.  This means that when `resizeToFit` is false, the view should
    specify its height and width component in its layout.  

    ## Modify specific child view layouts

    To adjust the child layout on a granular level per child view, you can
    also set the following properties on each child view:

      - useAbsoluteLayout - Don't include this child view in automatic layout, use absolute positioning based on the child view's `layout` property.
      - useStaticLayout - Don't include this child view in automatic layout.  This child view uses relative positioning and is not eligible for automatic layout.
      - isVisible - Non-visible child views are not included in the grid.

    @extends SC.ChildViewLayoutProtocol
    @author Nicolas Badia
    @since Version 1.11
  */
  FLEX_GRID: {

    /** @private Properties to observe on child views that affect the overall child view layout. */
    childLayoutProperties: ['gridProperties', 'isVisible'],

    /** @private */
    layoutChildViews: function (view) {
      var childViews = view.get('childViews'),
        options = view.get('childViewLayoutOptions') || {},
        resizeToFit = SC.none(options.resizeToFit) ? true : options.resizeToFit,
        rowSpace = options.rowSpace || 0,
        columnSpace = options.columnSpace || 0,
        len = childViews.get('length'),
        columnSizes = {},
        rowSizes = {},
        width = height = 0,
        top = left = 0,
        childView, i, j, index;

      for (i = 0; i < len; i++) {
        childView = childViews.objectAt(i);

        // Ignore child views with useAbsoluteLayout true, useStaticLayout true or that are not visible.
        if (!this._needsLayoutAdjustment(childView)) continue;

        var layout = childView.get('layout'),
          gridProperties = childView.get('gridProperties') || {},
          column = gridProperties.column || 0,
          row = gridProperties.row || 0,
          columnSpan = gridProperties.columnSpan || 1,
          rowSpan = gridProperties.rowSpan || 1;

        if (layout.width && columnSpan === 1) {
          if (!columnSizes[column]) columnSizes[column] = {};
          columnSizes[column].width = Math.max(columnSizes[column].width || 0, layout.width || 0);
        }

        if (layout.height && rowSpan === 1) {
          if (!rowSizes[row]) rowSizes[row] = {};
          rowSizes[row].height = Math.max(rowSizes[row].height || 0, layout.height || 0);
        }
      }

      for (index in columnSizes) {
        columnSizes[index].left = left;

        //@if(debug)
        if (!columnSizes[index].width) {
          SC.warn("Developer Warning: The SC.View.FLEX_GRID plugin requires that you set a width to one of the views in the column '%@'".fmt(index));
          return;
        }
        //@endif

        left += columnSizes[index].width+columnSpace;
      };

      for (index in rowSizes) {
        rowSizes[index].top = top;

        //@if(debug)
        if (!rowSizes[index].height) {
          SC.warn("Developer Warning: The SC.View.FLEX_GRID plugin requires that you set a width to one of the views in the row '%@'".fmt(index));
          return;
        }
        //@endif

        top += rowSizes[index].height+rowSpace;
      };

      for (i = 0; i < len; i++) {
        childView = childViews.objectAt(i);

        // Ignore child views with useAbsoluteLayout true, useStaticLayout true or that are not visible.
        if (!this._needsLayoutAdjustment(childView)) continue;

        var gridProperties = childView.get('gridProperties') || {},
          column = gridProperties.column || 0,
          row = gridProperties.row || 0,
          columnSpan = gridProperties.columnSpan || 1,
          rowSpan = gridProperties.rowSpan || 1

          columnData = columnSizes[column],
          rowData = rowSizes[row];

        width = height = 0;

        //@if(debug)
        if (!columnData) {
          SC.warn("Developer Warning: The SC.View.FLEX_GRID plugin requires that you set a width to one of the views in the column '%@'.".fmt(column));
          return;
        }
        if (!rowData) {
          SC.warn("Developer Warning: The SC.View.FLEX_GRID plugin requires that you set a width to one of the views in the row '%@'.".fmt(row));
          return;
        }
        //@endif

        for (j = 0; j < columnSpan; j++) {
          var columnSpanData = columnSizes[column+j];
          if (columnSpanData) width += columnSpanData.width;
        };

        for (j = 0; j < rowSpan; j++) {
          var rowSpanData = rowSizes[row+j];
          if (rowSpanData) height += rowSizes[row+j].height;
        };

        childView.adjust({ 
          top: rowData.top, 
          left: columnData.left, 
          width: width, 
          height: height 
        });
      }

      // Adjust our frame to fit as well, this ensures that scrolling works.
      if (resizeToFit) {
        width = left - columnSpace;
        height = top - rowSpace;
        view.adjust({ width: width, height: height });
      }
    },

    /** @private */
    _needsLayoutAdjustment: function(childView) {
      return childView.get('isVisible') &&
        !childView.get('useAbsoluteLayout') &&
        !childView.get('useStaticLayout');
    }

  }

});
