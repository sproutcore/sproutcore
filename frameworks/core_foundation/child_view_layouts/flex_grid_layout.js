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
      - rowFillRatio - when the parent view is configured with a fixed dimension, children not specifying a height but specifying fillRatio will be resized to fill the unclaimed space proportionally to this ratio.
      - columnFillRatio - when the parent view is configured with a fixed dimension, children not specifying a width but specifying fillRatio will be resized to fill the unclaimed space proportionally to this ratio.

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
      - columnCount - The maximum number of column.
      - rowCount - The maximum number of row.
      - defaultRowHeight - The default height of the rows.
      - defaultColumnWidth- The default width of the columns.
      - resizeToFit - Whether to resize the view to fit the child views.  Default: true
      - resizeWidthToFit - Whether to resize the view width to fit the child views.  Default: true
      - resizeHeightToFit - Whether to resize the view height to fit the child views.  Default: true
      - layoutDirection: SC.LAYOUT_VERTICAL

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

    /** @private When resizeToFit is false, then we need to know when the view's frame changes. */
    layoutDependsOnSize: function (view) {
      var options = view.get('childViewLayoutOptions');
      if (options) {
        var resizeToFit = resizeToFit !== false && (options.resizeHeightToFit !== false || options.resizeWidthToFit !== false);
        if (!resizeToFit) return true;
      }
      return false;
    },

    /** @private */
    layoutChildViews: function (view) {
      var childViews = view.get('childViews'),
        options = view.get('childViewLayoutOptions') || {},
        rowSpace = options.rowSpace || 0,
        columnSpace = options.columnSpace || 0,
        layoutDirection = options.layoutDirection || SC.LAYOUT_VERTICAL,
        isVertical = layoutDirection === SC.LAYOUT_VERTICAL,
        rowCount = 0,
        columnCount = 0,
        defaultRowHeight = options.defaultRowHeight,
        defaultColumnWidth = options.defaultColumnWidth,
        remainingWidth = 0,
        remainingHeight = 0,
        childLen = childViews.get('length'),
        columnSizes = {},
        rowSizes = {},
        top = 0,
        left = 0,
        childView, i, j, k, index,
        vFrame = view.frame(),
        totalHeight = vFrame.height,
        totalWidth = vFrame.width,
        verticalFilledSpace = 0,
        horizontalFilledSpace = 0,

        gridProperties = view._gridProperties = {
          options: options,
          isVertical: isVertical,
          cells: {}
        },

        layout,
        chilGridProperties,
        columnFillRatio, rowFillRatio,
        columnSpan, rowSpan,
        columnWidth, rowHeight,
        columnIndex, rowIndex,
        cij, rij;

      for (i = 0; i < childLen; i++) {
        childView = childViews.objectAt(i);

        // Ignore child views with useAbsoluteLayout true, useStaticLayout true or that are not visible.
        if (!this._needsLayoutAdjustment(childView)) continue;

        layout = childView.get('layout');
        chilGridProperties = childView.get('gridProperties') || {};
        rowFillRatio = chilGridProperties.rowFillRatio;
        columnFillRatio = chilGridProperties.columnFillRatio;
        columnSpan = chilGridProperties.columnSpan || 1;
        rowSpan = chilGridProperties.rowSpan || 1;
        columnWidth = 0;
        rowHeight = 0;

        rowIndex = chilGridProperties.row || 0;
        columnIndex = chilGridProperties.column || 0;
        var nextPos = this._computeNextAvailablePosition(view, childView, rowIndex, columnIndex);
        rowIndex = nextPos[0];
        columnIndex = nextPos[1];

        //@if(debug)
        if (!SC.none(gridProperties.row) && chilGridProperties.row !== rowIndex) {
          SC.warn("Developer Warning: The SC.View.FLEX_GRID plugin could not use the specified row '%@'.".fmt(gridProperties.row));
          return;
        }
        if (!SC.none(gridProperties.column) && chilGridProperties.column !== columnIndex) {
          SC.warn("Developer Warning: The SC.View.FLEX_GRID plugin could not use the specified column '%@'.".fmt(gridProperties.column));
          return;
        }
        //@endif

        childView._sc_computedGridProperties = {
          column: columnIndex,
          row: rowIndex,
          columnSpan: columnSpan,
          rowSpan: rowSpan,
        }

        // Save the initial hardcoded layout
        if (!('_sc_width' in childView)) childView._sc_width = layout.width;
        if (!('_sc_height' in childView)) childView._sc_height = layout.height;

        if (childView._sc_width) columnWidth = (childView._sc_width - ((columnSpan-1)*columnSpace)) / columnSpan;
        for (j = 0; j < columnSpan; j++) {
          cij = columnIndex+j;
          if (!columnSizes[cij]) columnSizes[cij] = {};
          columnSizes[cij].layoutWidth = Math.max(columnSizes[cij].layoutWidth || 0, columnWidth);
          columnSizes[cij].fillRatio = Math.max(columnSizes[cij].fillRatio || 0, columnFillRatio || 0);
        }

        if (childView._sc_height) rowHeight = (childView._sc_height - ((rowSpan-1)*rowSpace)) / rowSpan;
        for (j = 0; j < rowSpan; j++) {
          rij = rowIndex+j;
          if (!rowSizes[rij]) rowSizes[rij] = {};

          rowSizes[rij].layoutHeight = Math.max(rowSizes[rij].layoutHeight || 0, rowHeight);
          rowSizes[rij].fillRatio = Math.max(rowSizes[rij].fillRatio || 0, rowFillRatio || 0);
        }

        for (j = 0; j < columnSpan; j++) {
          for (k = 0; k < rowSpan; k++) {
            gridProperties.cells[(columnIndex+j)+'x'+(rowIndex+k)] = 1;
          }
        }

        gridProperties.columnSizes = columnSizes;
        gridProperties.rowSizes = rowSizes;

        columnCount = Math.max(columnCount, columnIndex+columnSpan);
        rowCount = Math.max(rowCount, rowIndex+rowSpan);
      }


      if (!defaultColumnWidth) {
        defaultColumnWidth = Math.trunc((totalWidth-((columnCount-1)*columnSpace)) / columnCount);
        remainingWidth = totalWidth - ((defaultColumnWidth * columnCount) + ((columnCount-1)*columnSpace));
      }

      // compute the width of column and the space remaining to fill
      for (index in columnSizes) {
        if (!columnSizes[index].fillRatio) {
          if (SC.none(columnSizes[index].width)) {
            if (columnSizes[index].layoutWidth) columnSizes[index].width = columnSizes[index].layoutWidth;
            else if (defaultColumnWidth) {
              columnSizes[index].width = defaultColumnWidth + (index > 0 ? 0 : remainingWidth);
            }
          }
          else {
            //@if(debug)
            SC.warn("Developer Warning: The SC.View.FLEX_GRID plugin got an unexpected width '%@'".fmt(columnSizes[index].width));
            //@endif
          }
          horizontalFilledSpace += columnSizes[index].width || 0;
        }
      };

      i = 0;
      for (index in columnSizes) {
        i++;
        columnSizes[index].left = left;

        if (columnSizes[index].fillRatio) {
          columnSizes[index].width = (totalWidth - horizontalFilledSpace) * columnSizes[index].fillRatio;
        }

        if (columnSizes[index].width) left += columnSizes[index].width+(i < columnCount ? columnSpace : 0);
      };


      if (!defaultRowHeight) {
        defaultRowHeight = Math.trunc((totalHeight-((rowCount-1)*rowSpace)) / rowCount);
        remainingHeight = totalHeight - ((defaultRowHeight * rowCount) + ((rowCount-1)*rowSpace));
      }

      for (index in rowSizes) {
        if (!rowSizes[index].fillRatio) {
          if (SC.none(rowSizes[index].height)) {
            if (rowSizes[index].layoutHeight) rowSizes[index].height = rowSizes[index].layoutHeight;
            else if (defaultRowHeight) rowSizes[index].height = defaultRowHeight + (index > 0 ? 0 : remainingHeight);
          }
          else {
            //@if(debug)
            SC.warn("Developer Warning: The SC.View.FLEX_GRID plugin got an unexpected height '%@'".fmt(rowSizes[index].height));
            //@endif
          }
          verticalFilledSpace += rowSizes[index].height+rowSpace;
        }
      };

      i = 0;
      for (index in rowSizes) {
        i++;
        rowSizes[index].top = top;

        if (rowSizes[index].fillRatio) {
          rowSizes[index].height = (totalHeight - verticalFilledSpace) / rowSizes[index].fillRatio;
        }
        if (rowSizes[index].height) top += rowSizes[index].height+(i < rowCount ? rowSpace : 0);
      };

      for (i = 0; i < childLen; i++) {
        childView = childViews.objectAt(i);

        // Ignore child views with useAbsoluteLayout true, useStaticLayout true or that are not visible.
        if (!this._needsLayoutAdjustment(childView)) continue;

        var chilGridProperties = childView._sc_computedGridProperties,
          column = chilGridProperties.column,
          row = chilGridProperties.row,
          columnSpan = chilGridProperties.columnSpan,
          rowSpan = chilGridProperties.rowSpan,
          columnData = columnSizes[column],
          rowData = rowSizes[row],
          width = 0,
          height = 0;

        for (j = 0; j < columnSpan; j++) {
          var columnSpanData = columnSizes[column+j];
          if (columnSpanData && columnSpanData.width) width += columnSpanData.width + (j > 0 ? columnSpace : 0);
        };

        for (j = 0; j < rowSpan; j++) {
          var rowSpanData = rowSizes[row+j];
          if (rowSpanData && rowSpanData.height) height += rowSpanData.height + (j > 0 ? rowSpace : 0);
        };


        childView.adjust({
          top: rowData ? rowData.top : 0,
          left: columnData ? columnData.left : 0,
          width: width,
          height: height
        });
      }

      if (options.resizeToFit !== false) {
        var newLayout = {};
        if (options.resizeWidthToFit !== false) {
          newLayout.width = left;
          delete view._sc_width;
        }
        if (options.resizeHeightToFit !== false) {
          newLayout.height = top;
          delete view._sc_height;
        }
        view.adjust(newLayout);
      }

      view.viewDidResize = function() {
        this.layoutChildViews();
        this._sc_viewFrameDidChange();
      };
    },

    /** @private */
    _computeNextAvailablePosition: function(view, childView, rowIndex, columnIndex) {
      var gridProperties = view._gridProperties,
        cells = gridProperties.cells,
        columnSizes = gridProperties.columnSizes,
        rowSizes = gridProperties.rowSizes,
        initialRowIndex = rowIndex,
        initialColumnIndex = columnIndex;

      if (columnSizes && rowSizes) {
        var isVertical = gridProperties.isVertical,
          options = gridProperties.options,
          maxRowCount = options.rowCount || 0,
          maxColumnCount = options.columnCount || 0,
          chilGridProperties = childView.get('gridProperties') || {},
          columnSpan = chilGridProperties.columnSpan || 1,
          rowSpan = chilGridProperties.rowSpan || 1,
          isTaken, i, j;

        //@if(debug)
        if (maxRowCount && maxColumnCount) {
          SC.error("Developer Error: SC.View.FLEX_GRID plugin doesn't not support rowCount and columnCount being both defined.");
          return;
        }
        //@endif

        for (i = columnIndex; (i < (columnIndex+columnSpan)) && !isTaken; i++) {
          for (j = rowIndex; (j < (rowIndex+rowSpan)) && !isTaken; j++) {
            if (cells[i+'x'+j]) isTaken = true;
          }
        }

        if (isTaken) {
          if (isVertical) columnIndex++;
          else rowIndex++;
        }

        if (maxColumnCount) {
          //@if(debug)
          if (columnSpan > maxColumnCount) {
            SC.error("Developer Error: columnSpan '%@' is greater than maxColumnCount '%@'.".fmt(columnSpan, maxColumnCount));
            return;
          }
          //@endif

          if ((columnSpan + columnIndex) > maxColumnCount) {
            rowIndex += 1;
            columnIndex = 0;
          }
        }
        if (maxRowCount) {
          //@if(debug)
          if (rowSpan > maxRowCount) {
            SC.error("Developer Error: rowSpan '%@' is greater than maxRowCount '%@'.".fmt(rowSpan, maxRowCount));
            return;
          }
          //@endif

          if ((rowSpan + rowIndex) > maxRowCount) {
            columnIndex += 1;
            rowIndex = 0;
          }
        }
      }

      if (initialRowIndex !== rowIndex || initialColumnIndex !== columnIndex) {
        return this._computeNextAvailablePosition(view, childView, rowIndex, columnIndex);
      }

      return [rowIndex, columnIndex];
    },

    /** @private */
    _needsLayoutAdjustment: function(childView) {
      return childView.get('isVisible') &&
        !childView.get('useAbsoluteLayout') &&
        !childView.get('useStaticLayout');
    }

  }

});
