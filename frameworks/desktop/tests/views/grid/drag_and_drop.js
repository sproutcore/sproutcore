// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*
  This test evaluates drag and drop support for SC.GridView
*/
module("SC.GridView - drag and drop");

// Create a fake content array.  Generates a list with whatever length you
// want of objects with a title based on the index.  Cannot mutate.
var ContentArray = SC.Object.extend(SC.Array, {

  length: 0,

  objectAt: function(idx) {
    if (idx >= this.get('length')) { return undefined; }

    var content = this._content, ret ;
    if (!content) { content = this._content = []; }

    ret = content[idx];
    if (!ret) {
      ret = content[idx] = SC.Object.create({
        title: "ContentItem %@".fmt(idx),
        isDone: (idx % 3)===0,
        unread: (Math.random() > 0.5) ? Math.floor(Math.random() * 100) : 0
      });
    }

    return ret ;
  }
});

var pane = SC.ControlTestPane.design()
  .add("basic", SC.ScrollView.design({
    borderStyle: SC.BORDER_NONE,
    layout: { left: 0, right: 0, top: 0, height: 300 },
    hasHorizontalScroller: NO,
    contentView: SC.GridView.design({
      content: ContentArray.create({ length: 5 }),
      contentValueKey: "title",
      contentCheckboxKey: "isDone",
      contentUnreadCountKey: "unread",
      rowHeight: 20
    })
  }));

pane.show(); // add a test to show the test pane
window.pane = pane ;


test("drag on default grid view", function() {
  var ev,
    itemView,
    layer,
    gridView = pane.view("basic").get('contentView');

  itemView = gridView.itemViewForContentIndex(0);
  layer = itemView.get('layer');
  ev = SC.Event.simulateEvent(layer, 'mousedown');
  SC.Event.trigger(layer, 'mousedown', [ev]);

  ev = SC.Event.simulateEvent(layer, 'mousemove');
  SC.Event.trigger(layer, 'mousemove', [ev]);

  equals(gridView.get('dragContent'), null, 'dragContent should not be set, because the default implementation should prevent dragging');
});


test("drag on grid view with SC.DROP_ON support", function() {
  var ev,
    itemView,
    layer,
    gridView = pane.view("basic").get('contentView');

  // Configure the view to accept drop on.
  gridView.set('canReorderContent', YES);
  gridView.set('isDropTarget', YES);
  gridView.set('delegate', SC.Object.create(SC.CollectionViewDelegate, {
     collectionViewValidateDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
      return SC.DRAG_ANY;
    }
  }));

  itemView = gridView.itemViewForContentIndex(0);
  layer = itemView.get('layer');
  ev = SC.Event.simulateEvent(layer, 'mousedown');
  SC.Event.trigger(layer, 'mousedown', [ev]);

  var f = function() {
    var drag,
      halfWidth,
      itemView2,
      point;

    SC.RunLoop.begin();

    ev = SC.Event.simulateEvent(layer, 'mousemove');
    SC.Event.trigger(layer, 'mousemove', [ev]);

    drag = SC.RootResponder._drag;

    equals(gridView.get('dragContent').content, gridView.get('content'), "dragContent.content should be equal to the GridView's content");
    ok(gridView.get('dragContent').indexes.isEqual(SC.IndexSet.create(0)), "dragContent.indexes should be equal to indexes equal to [{0}]");
    SC.RunLoop.end();

    // Drag over 2nd item
    itemView2 = gridView.itemViewForContentIndex(1);
    layer = itemView2.get('layer');
    point = SC.offset(layer);

    // Note: GridView won't accept a DROP_ON unless past 20% into the width of the item.
    halfWidth = itemView2.get('frame').width * 0.5;
    ev = SC.Event.simulateEvent(layer, 'mousemove', { pageX: point.x + halfWidth, pageY: point.y + 1 });
    SC.Event.trigger(layer, 'mousemove', [ev]);

    ok(itemView2.get('isDropTarget'), "second grid item should have isDropTarget set to true");


    // Drag over 3rd item
    itemView = gridView.itemViewForContentIndex(2);
    layer = itemView.get('layer');
    point = SC.offset(layer);
    ev = SC.Event.simulateEvent(layer, 'mousemove', { pageX: point.x + halfWidth, pageY: point.y + 1 });
    SC.Event.trigger(layer, 'mousemove', [ev]);

    ok(itemView.get('isDropTarget'), "third grid item should have isDropTarget set to true");
    ok(!itemView2.get('isDropTarget'), "second grid item should not have isDropTarget set to true");

    window.start();
  };

  stop(); // stops the test runner
  setTimeout(f, 200);
});

