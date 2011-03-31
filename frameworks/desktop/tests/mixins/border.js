// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/*global module test htmlbody ok equals same stop start */

var pane;

module("SC.Border", {
  setup: function() {
    var boxstyles = '<style>.box1-border { border-top: 10px solid red; border-left: 25px solid red; border-right: 109px solid green; border-bottom: 79px solid red; }'+
                    '.box2-border { border-top: 10px solid red; border-left: 25px solid red; border-right: 109px solid green; border-bottom: 79px solid red; }'+
                    '.box3-border { border-top: 10px solid red; border-left: 25px solid red; border-right: 109px solid green; border-bottom: 79px solid red; }</style>';
    htmlbody(boxstyles);

    SC.RunLoop.begin();
    pane = SC.MainPane.create();
    pane.append();
    SC.RunLoop.end();
  },
  
  teardown: function() {
    pane.remove();
    pane = null;
    clearHtmlbody();
  }
});

test('SC.View should not have border properties by default', function() {
  var view = SC.View.create();
  ok(!view.get('hasBorder'), 'view should not have hasBorder set');
  ok(view.get('borderStyle') === undefined, 'view should not have borderStyle set');
});

test('Views with SC.Border mixin should default to gray border', function() {
  var view = SC.View.create(SC.Border, { });
  
  equals(view.get('borderStyle'), SC.BORDER_GRAY, "borderStyle should be SC.BORDER_GRAY");
  equals(view.get('borderTop'), 1, 'borderTop should be 1');
  equals(view.get('borderBottom'), 1, 'borderBottom should be 1');
  equals(view.get('borderRight'), 1, 'borderRight should be 1');
  equals(view.get('borderLeft'), 1, 'borderLeft should be 1');
});

test('Views that specify a non-built-in border should have border dimensions set to 0', function() {
  var view = SC.View.create(SC.Border, { borderStyle: 'fat-and-chunky' });
  equals(view.get('borderTop'), 0, 'borderTop should be 0');
  equals(view.get('borderBottom'), 0, 'borderBottom should be 0');
  equals(view.get('borderRight'), 0, 'borderRight should be 0');
  equals(view.get('borderLeft'), 0, 'borderLeft should be 0');
});

test('Views that specify a string that ends in "-border" should have that string added as a class', function() {
  var view = SC.View.create(SC.Border, { borderStyle: 'fat-and-chunky-border' });
  pane.appendChild(view);
  SC.RunLoop.begin().end();
  ok(view.$().hasClass('fat-and-chunky-border'), 'should have fat-and-chunky-border class');
});

test('Views that specify a string that does not end in "-border" should not have that string added as a class', function() {
  var view = SC.View.create(SC.Border, { borderStyle: 'border-at-beginning' });
  pane.appendChild(view);
  SC.RunLoop.begin().end();
  ok(!view.$().hasClass('border-at-beginning'), 'should not have border-at-beginning class');
});

test('Views should rerender if borderStyle changes', function() {
  var view = SC.View.create(SC.Border, { borderStyle: 'first-border' });
  pane.appendChild(view);
  SC.RunLoop.begin().end();
  ok(view.$().hasClass('first-border'), 'precond - view should have first-border class');
  view.set('borderStyle', 'second-border');
  SC.RunLoop.begin().end();
  ok(view.$().hasClass('second-border'), 'view should have second-border class');
});

test('View frame should account for borders if border dimension properties are set', function() {
  var box1 = SC.View.create(SC.Border, { borderStyle: 'box1-border', borderTop: 10, borderLeft: 25, borderRight: 109, borderBottom: 79 }),
      box2 = SC.View.create(SC.Border, { borderStyle: 'box2-border', borderTop: 10, borderLeft: 25, borderRight: 109, borderBottom: 79 }),
      box3 = SC.View.create(SC.Border, { borderStyle: 'box3-border', borderTop: 10, borderLeft: 25, borderRight: 109, borderBottom: 79 });

  box1.appendChild(box2);
  box2.appendChild(box3);
  pane.appendChild(box1);
  SC.RunLoop.begin().end();
  var frame = box3.get('frame'),
      elem = box3.get('layer');
  
  equals(frame.x, elem.clientLeft, 'horizontal positions equal');
  equals(frame.y, elem.clientTop, 'vertical positions equal');
  equals(frame.width, elem.clientWidth, 'width equal');
  equals(frame.height, elem.clientHeight, 'height equal');
});

test('Should be deprecated', function(){
  var originalLogger = console.warn, logged;
  console.warn = function(msg){ logged = msg; }
  SC.View.create(SC.Border);
  console.warn = originalLogger;

  equals(logged, "SC.Border is deprecated, please set border in your layout");
});
