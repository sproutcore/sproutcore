// ========================================================================
// View Layout Unit Tests
// ========================================================================

/*globals module test ok same equals */

/* These unit tests verify:  layout(), frame(), styleLayout() and clippingFrame(). */

var parent, child;

/*
  helper method to test the layout of a view.  Applies the passed layout to a
  view, then compares both its frame and layoutStyle properties both before
  and after adding the view to a parent view.  

  You can pass frame rects with some properties missing and they will be
  filled in for you just so you don't have to write so much code.
  
  @param {Hash} layout layout hash to test
  @param {Hash} no_f expected frame for view with no parent
  @param {Hash} no_s expected layoutStyle for view with no parent
  @param {Hash} with_f expected frame for view with parent
  @param {Hash} with_s expected layoutStyle for view with parent
  @returns {void}
*/
function performLayoutTest(layout, no_f, no_s, with_f, with_s) {
  
  // make sure we add null properties and convert numbers to 'XXpx' to style layout.
  var keys = 'width height top bottom marginLeft marginTop left right zIndex minWidth maxWidth minHeight maxHeight'.w();
  if (SC.platform.supportsCSSTransforms) keys.push('transform');

  keys.forEach(function(key) {
    if (no_s[key]===undefined) no_s[key] = null;
    if (with_s[key]===undefined) with_s[key] = null;  

    if (typeof no_s[key] === 'number') no_s[key] = no_s[key].toString() + 'px';
    if (typeof with_s[key] === 'number') with_s[key] = no_s[key].toString() + 'px';
  });
  
  // set layout
  child.set('layout', layout) ;

  var testKey;

  // test
  keys.forEach(function(key) {
    testKey = key === 'transform' ? SC.platform.domCSSPrefix+'Transform' : key;
    equals(child.get('layoutStyle')[testKey], no_s[key], "STYLE NO PARENT %@".fmt(key)) ;  
  });
  
  // add parent
  SC.RunLoop.begin();
  parent.appendChild(child);
  SC.RunLoop.end();
  
  // test again
  keys.forEach(function(key) {
    testKey = key === 'transform' ? SC.platform.domCSSPrefix+'Transform' : key;
    equals(child.get('layoutStyle')[testKey], with_s[key], "STYLE W/ PARENT %@".fmt(key)) ;  
  });
}

/**
  Helper setup that creates a parent and child view so that you can do basic
  tests.
*/
var commonSetup = {
  setup: function() {
    
    // create basic parent view
    parent = SC.View.create({
      layout: { top: 0, left: 0, width: 200, height: 200 }
    });
    
    // create child view to test against.
    child = SC.View.create();
  },
  
  teardown: function() {
    parent = child = null ;
  }
};

module("NOTIFICATIONS", commonSetup) ;

test("Setting layout will notify frame observers", function() {
  var didNotify = NO, didNotifyStyle = NO;
  child.addObserver('frame', this, function() { didNotify = YES; }) ;
  child.addObserver('layoutStyle', this, function() { didNotifyStyle = YES; });
  
  child.set('layout', { left: 0, top: 10, bottom: 20, right: 50 }) ;
  ok(didNotify, "didNotify");
  ok(didNotifyStyle, 'didNotifyStyle');
}) ;

// ..........................................................
// TEST FRAME/STYLEFRAME WITH BASIC LAYOUT VARIATIONS
// 
// NOTE:  Each test evaluates the frame before and after adding it to the 
// parent.

module('BASIC LAYOUT VARIATIONS', commonSetup);

test("layout {top, left, width, height}", function() {

  var layout = { top: 10, left: 10, width: 50, height: 50 };
  var s = { top: 10, left: 10, width: 50, height: 50 } ;
  var no_f = { x: 10, y: 10, width: 50, height: 50 } ;
  var with_f = { x: 10, y: 10, width: 50, height: 50 } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
}) ;

test("layout {top, left, bottom, right}", function() {

  var layout = { top: 10, left: 10, bottom: 10, right: 10 };
  var no_f = { x: 10, y: 10, width: 0, height: 0 } ;
  var with_f = { x: 10, y: 10, width: 180, height: 180 } ;
  var s = { top: 10, left: 10, bottom: 10, right: 10 } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
}) ;

test("layout {bottom, right, width, height}", function() {

  var layout = { bottom: 10, right: 10, width: 50, height: 50 };
  var no_f = { x: 0, y: 0, width: 50, height: 50 } ;
  var with_f = { x: 140, y: 140, width: 50, height: 50 } ;
  var s = { bottom: 10, right: 10, width: 50, height: 50 } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
}) ;

test("layout {centerX, centerY, width, height}", function() {

  var layout = { centerX: 10, centerY: 10, width: 60, height: 60 };
  var no_f = { x: 10, y: 10, width: 60, height: 60 } ;
  var with_f = { x: 80, y: 80, width: 60, height: 60 } ;
  var s = { marginLeft: -20, marginTop: -20, width: 60, height: 60, top: "50%", left: "50%" } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
}) ;

test("layout {top, left, width: auto, height: auto}", function() {
  child = SC.View.create({
    useStaticLayout: YES,
    render: function(context) {
      // needed for auto
      context.push('<div style="padding: 10px"></div>');
    }
  });

  // parent MUST have a layer.
  parent.createLayer();
  var layer = parent.get('layer');
  document.body.appendChild(layer);
  
  var layout = { top: 0, left: 0, width: 'auto', height: 'auto' };
  var no_f = { x: 0, y: 0, width: 0, height: 0 };
  var with_f = { x: 0, y: 0, width: 20, height: 20 };
  var s = { top: 0, left: 0, width: 'auto', height: 'auto' };
  
  performLayoutTest(layout, no_f, s, with_f, s);
  
  layer.parentNode.removeChild(layer);
});


// ..........................................................
// TEST FRAME/STYLEFRAME WITH BASIC LAYOUT VARIATIONS
// 
// NOTE:  Each test evaluates the frame before and after adding it to the 
// parent.

module('BASIC LAYOUT VARIATIONS PERCENTAGE', commonSetup);

test("layout {top, left, width, height}", function() {

  var layout = { top: 0.1, left: 0.1, width: 0.5, height: 0.5 };
  var s = { top: '10%', left: '10%', width: '50%', height: '50%' } ;
  var no_f = { top: '10%', left: '10%', width: '50%', height: '50%' } ;
  var with_f = { top: '10%', left: '10%', width: '50%', height: '50%' } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
}) ;

test("layout {top, left, bottom, right}", function() {

  var layout = { top: 0.1, left: 0.1, bottom: 0.1, right: 0.1 };
  var no_f = { top: '10%', left: '10%', bottom: '10%', right: '10%' };
  var with_f =  { top: '10%', left: '10%', bottom: '10%', right: '10%' };
  var s = { top: '10%', left: '10%', bottom: '10%', right: '10%' } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
}) ;

test("layout {bottom, right, width, height}", function() {

  var layout = { bottom: 0.1, right: 0.1, width: 0.5, height: 0.5 };
  var no_f = { bottom: '10%', right: '10%', width: '50%', height: '50%' };
  var with_f = { bottom: '10%', right: '10%', width: '50%', height: '50%' };
  var s = { bottom: '10%', right: '10%', width: '50%', height: '50%' } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
}) ;

test("layout {centerX, centerY, width, height}", function() {

  var layout = { centerX: 0.1, centerY: 0.1, width: 0.6, height: 0.6 };
  var no_f = { x: 10, y: 10, width: 60, height: 60 } ;
  var with_f = { x: 80, y: 80, width: 60, height: 60 } ;
  var s = { marginLeft: '-20%', marginTop: '-20%', width: '60%', height: '60%', top: "50%", left: "50%" } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
}) ;

test("layout {top, left, width: auto, height: auto}", function() {
  child = SC.View.create({
    useStaticLayout: YES,
    render: function(context) {
      // needed for auto
      context.push('<div style="padding: 10px"></div>');
    }
  });

  // parent MUST have a layer.
  parent.createLayer();
  var layer = parent.get('layer');
  document.body.appendChild(layer);
  
  var layout = { top: 0.1, left: 0.1, width: 'auto', height: 'auto' };
  var no_f = { x: 0, y: 0, width: 0, height: 0 };
  var with_f = { x: 0, y: 0, width: 20, height: 20 };
  var s = { top: '10%', left: '10%', width: 'auto', height: 'auto' };
  
  performLayoutTest(layout, no_f, s, with_f, s);
  
  layer.parentNode.removeChild(layer);
});



// ..........................................................
// TEST CSS TRANSFORM LAYOUT VARIATIONS
// 
// NOTE:  Each test evaluates the frame before and after adding it to the 
// parent.

module('CSS TRANSFORM LAYOUT VARIATIONS', {
  setup: function(){
    commonSetup.setup();
    child.createLayer();
    document.body.appendChild(child.get('layer'));
  },

  teardown: function(){
    child.destroyLayer();
    commonSetup.teardown();
  }
});

function transformFor(view){
  return view.get('layer').style[SC.platform.domCSSPrefix+'Transform'];
}

test("layout {rotateX}", function() {
  child.adjust('rotateX', 45).updateLayout();
  equals(transformFor(child), 'rotateX(45deg)', 'transform attribute should be "rotateX(45deg)"')
});

test("layout {rotateY}", function() {
  child.adjust('rotateY', 45).updateLayout();
  equals(transformFor(child), 'rotateY(45deg)', 'transform attribute should be "rotateY(45deg)"')
});

test("layout {rotateZ}", function() {
  child.adjust('rotateZ', 45).updateLayout();
  equals(transformFor(child), 'rotateZ(45deg)', 'transform attribute should be "rotateZ(45deg)"')
});

test("layout {rotate}", function() {
  child.adjust('rotate', 45).updateLayout();
  equals(transformFor(child), 'rotateX(45deg)', 'transform attribute should be "rotateX(45deg)"')
});

test("layout {rotateX} with units", function() {
  child.adjust('rotateX', '1rad').updateLayout();
  equals(transformFor(child), 'rotateX(1rad)', 'transform attribute should be "rotateX(1rad)"')
});

test("layout {scale}", function() {
  child.adjust('scale', 2).updateLayout();
  equals(transformFor(child), 'scale(2)', 'transform attribute should be "scale(2)"')
});

test("layout {scale} with multiple", function() {
  child.adjust('scale', [2, 3]).updateLayout();
  equals(transformFor(child), 'scale(2, 3)', 'transform attribute should be "scale(2, 3)"')
});

test("layout {rotateX, scale}", function() {
  child.adjust({ rotateX: 45, scale: 2 }).updateLayout();
  equals(transformFor(child), 'rotateX(45deg) scale(2)', 'transform attribute should be "rotateX(45deg) scale(2)"')
});

test("layout {rotateX} update", function() {
  child.adjust('rotateX', 45).updateLayout();
  child.adjust('rotateX', 90).updateLayout();
  equals(transformFor(child), 'rotateX(90deg)', 'transform attribute should be "rotateX(90deg)"')
});


if (SC.platform.supportsCSSTransforms) {

  // ..........................................................
  // TEST FRAME/STYLEFRAME WITH ACCELERATE LAYOUT VARIATIONS
  // 
  // NOTE:  Each test evaluates the frame before and after adding it to the 
  // parent.

  module('ACCELERATED LAYOUT VARIATIONS', {
    setup: function(){
      commonSetup.setup();
      // Force support
      child.hasAcceleratedLayer = YES;
    },

    teardown: commonSetup.teardown
  });

  test("layout {top, left, width, height}", function() {
    var layout = { top: 10, left: 10, width: 50, height: 50 };
    var expectedTransform = 'translateX(10px) translateY(10px)';
    if (SC.platform.supportsCSS3DTransforms) expectedTransform += ' translateZ(0px)';
    var s = { top: 0, left: 0, width: 50, height: 50, transform: expectedTransform } ;
    var no_f = { x: 0, y: 0, width: 50, height: 50, transform: expectedTransform } ;
    var with_f = { x: 0, y: 0, width: 50, height: 50, transform: expectedTransform } ;

    performLayoutTest(layout, no_f, s, with_f, s) ;
  }) ;

  test("layout {top, left, bottom, right}", function() {

    var layout = { top: 10, left: 10, bottom: 10, right: 10 };
    var expectedTransform = 'translateX(0px) translateY(0px)';
    if (SC.platform.supportsCSS3DTransforms) expectedTransform += ' translateZ(0px)';
    var no_f = { x: 10, y: 10, width: 0, height: 0, transform: expectedTransform } ;
    var with_f = { x: 10, y: 10, width: 180, height: 180, transform: expectedTransform } ;
    var s = { top: 10, left: 10, bottom: 10, right: 10, transform: expectedTransform } ;

    performLayoutTest(layout, no_f, s, with_f, s) ;
  }) ;

  test("layout {top, left, width: auto, height: auto}", function() {
    child = SC.View.create({
      hasAcceleratedLayer: YES, // Force this
      useStaticLayout: YES,
      render: function(context) {
        // needed for auto
        context.push('<div style="padding: 10px"></div>');
      }
    });

    // parent MUST have a layer.
    parent.createLayer();
    var layer = parent.get('layer');
    document.body.appendChild(layer);
  
    var layout = { top: 0, left: 0, width: 'auto', height: 'auto' };
    var expectedTransform = 'translateX(0px) translateY(0px)';
    if (SC.platform.supportsCSS3DTransforms) expectedTransform += ' translateZ(0px)';
    var no_f = { x: 0, y: 0, width: 0, height: 0, transform: expectedTransform };
    var with_f = { x: 0, y: 0, width: 20, height: 20, transform: expectedTransform };
    var s = { top: 0, left: 0, width: 'auto', height: 'auto', transform: expectedTransform };
  
    performLayoutTest(layout, no_f, s, with_f, s);
  
    layer.parentNode.removeChild(layer);
  });

  test("layout w/ percentage {top, left, width, height}", function() {

    var layout = { top: 0.1, left: 0.1, width: 0.5, height: 0.5 };
    var expectedTransform = 'translateX(0px) translateY(0px)';
    if (SC.platform.supportsCSS3DTransforms) expectedTransform += ' translateZ(0px)';
    var s = { top: '10%', left: '10%', width: '50%', height: '50%', transform: expectedTransform } ;
    var no_f = { top: '10%', left: '10%', width: '50%', height: '50%', transform: expectedTransform } ;
    var with_f = { top: '10%', left: '10%', width: '50%', height: '50%', transform: expectedTransform } ;

    performLayoutTest(layout, no_f, s, with_f, s) ;
  }) ;

}







// ..........................................................
// TEST FRAME/STYLEFRAME WITH INVALID LAYOUT VARIATIONS
// 
// NOTE:  Each test evaluates the frame before and after adding it to the 
// parent.

module('INVALID LAYOUT VARIATIONS', commonSetup);

test("layout {top, left} - assume right/bottom=0", function() {
  
  var layout = { top: 0.1, left: 0.1 };
  var no_f = { x: 10, y: 10, width: 0, height: 0 } ;
  var with_f = { x: 10, y: 10, width: 190, height: 190 } ;
  var s = { bottom: 0, right: 0, top: '10%', left: '10%' } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
}) ;

test("layout {height, width} - assume top/left=0", function() {

  var layout = { height: 0.6, width: 0.6 };
  var no_f = { x: 0, y: 0, width: 60, height: 60 } ;
  var with_f = { x: 0, y: 0, width: 60, height: 60 } ;
  var s = { width: '60%', height: '60%', top: 0, left: 0 } ;
  
  performLayoutTest(layout, no_f, s, with_f, s) ;
  
}) ;

test("layout {right, bottom} - assume top/left=0", function() {

  var layout = { right: 0.1, bottom: 0.1 };
  var no_f = { x: 0, y: 0, width: 0, height: 0 } ;
  var with_f = { x: 0, y: 0, width: 190, height: 190 } ;
  var s = { bottom: '10%', right: '10%', top: 0, left: 0 } ;
  
  performLayoutTest(layout, no_f, s, with_f, s) ;
  
}) ;

test("layout {right, bottom, maxWidth, maxHeight} - assume top/left=null", function() {

  var layout = { right: 0.1, bottom: 0.1, maxWidth: 10, maxHeight: 10 };
  var no_f = { x: 0, y: 0, width: 0, height: 0 } ;
  var with_f = { x: 0, y: 0, width: 190, height: 190 } ;
  var s = { bottom: '10%', right: '10%', top: null, left: null, maxWidth: 10, maxHeight: 10 } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;

}) ;

test("layout {centerX, centerY} - assume width/height=0", function() {

  var layout = { centerX: 0.1, centerY: 0.1 };
  var no_f = { x: 10, y: 10, width: 0, height: 0 } ;
  var with_f = { x: 110, y: 110, width: 0, height: 0 } ;
  var s = { width: 0, height: 0, top: "50%", left: "50%", marginTop: "50%", marginLeft: "50%" } ;
  performLayoutTest(layout, no_f, s, with_f, s) ;
  
}) ;

test("layout {top, left, centerX, centerY, height, width} - top/left take presidence", function() {

  var layout = { top: 0.1, left: 0.1, centerX: 0.1, centerY: 0.1, height: 0.6, width: 0.6 };
  var no_f = { x: 10, y: 10, width: 60, height: 60 } ;
  var with_f = { x: 10, y: 10, width: 60, height: 60 } ;
  var s = { width: '60%', height: '60%', top: '10%', left: '10%' } ;
  
  performLayoutTest(layout, no_f, s, with_f, s) ;
  
}) ;

test("layout {bottom, right, centerX, centerY, height, width} - bottom/right take presidence", function() {

  var layout = { bottom: 0.1, right: 0.1, centerX: 0.1, centerY: 0.1, height: 0.6, width: 0.6 };
  var no_f = { x: 0, y: 0, width: 60, height: 60 } ;
  var with_f = { x: 130, y: 130, width: 60, height: 60 } ;
  var s = { width: '60%', height: '60%', bottom: '10%', right: '10%' } ;

  performLayoutTest(layout, no_f, s, with_f, s) ;
  
}) ;

test("layout {top, left, bottom, right, centerX, centerY, height, width} - top/left take presidence", function() {

  var layout = { top: 0.1, left: 0.1, bottom: 0.1, right: 0.1, centerX: 0.1, centerY: 0.1, height: 0.6, width: 0.6 };
  var no_f = { x: 10, y: 10, width: 60, height: 60 } ;
  var with_f = { x: 10, y: 10, width: 60, height: 60 } ;
  var s = { width: '60%', height: '60%', top: '10%', left: '10%' } ;
  
  performLayoutTest(layout, no_f, s, with_f, s) ;
  
}) ;


test("layout {centerX, centerY, width:auto, height:auto}", function() {
  var error=null;
  var layout = { centerX: 0.1, centerY: 0.1, width: 'auto', height: 'auto' };

  child.set('layout', layout) ;
  try{
    child.layoutStyle();
  }catch(e){
    error=e;
  }
  equals(SC.T_ERROR,SC.typeOf(error),'Layout style functions should throw and '+
  'error if centerx/y and width/height are set at the same time ' + error );
  
}) ;


// ..........................................................
// TEST FRAME/STYLEFRAME WHEN PARENT VIEW IS RESIZED
// 

module('RESIZE FRAME', commonSetup);
 
function verifyFrameResize(layout, before, after) {
  parent.appendChild(child);
  SC.run(function() { child.set('layout', layout); });
  
  same(child.get('frame'), before, "Before: %@ == %@".fmt(SC.inspect(child.get('frame')), SC.inspect(before))) ;
  SC.run(function() { parent.adjust('width', 300).adjust('height', 300); });
  
  same(child.get('frame'), after, "After: %@ == %@".fmt(SC.inspect(child.get('frame')), SC.inspect(after)));
  
}

test("frame does not change with top/left/w/h", function(){
  var layout = { top: 10, left: 10, width: 60, height: 60 };
  var before = { x: 10, y: 10, width: 60, height: 60 };
  var after =  { x: 10, y: 10, width: 60, height: 60 };
  verifyFrameResize(layout, before, after);
});

test("frame shifts down with bottom/right/w/h", function(){
  var layout = { bottom: 10, right: 10, width: 60, height: 60 };
  var before = { x: 130, y: 130, width: 60, height: 60 };
  var after =  { x: 230, y: 230, width: 60, height: 60 };
  verifyFrameResize(layout, before, after);
});

test("frame size shifts with top/left/bottom/right", function(){
  var layout = { top: 10, left: 10, bottom: 10, right: 10 };
  var before = { x: 10, y: 10, width: 180, height: 180 };
  var after =  { x: 10, y: 10, width: 280, height: 280 };
  verifyFrameResize(layout, before, after);
});

test("frame loc shifts with centerX/centerY", function(){
  var layout = { centerX: 10, centerY: 10, width: 60, height: 60 };
  var before = { x: 80, y: 80, width: 60, height: 60 };
  var after =  { x: 130, y: 130, width: 60, height: 60 };
  verifyFrameResize(layout, before, after);
});

//with percentage

test("frame does not change with top/left/w/h", function(){
  var layout = { top: 0.1, left: 0.1, width: 0.6, height: 0.6 };
  var before = { x: 20, width: 120, y: 20, height: 120 };
  var after =  { x: 30, y: 30, width: 180, height: 180 };
  verifyFrameResize(layout, before, after);
});

test("frame shifts down with bottom/right/w/h", function(){
  var layout = { bottom: 0.1, right: 0.1, width: 0.6, height: 0.6 };
  var before = { x: 60, y: 60, width: 120, height: 120 };
  var after =  { x: 90, y: 90, width: 180, height: 180 };
  verifyFrameResize(layout, before, after);
});

test("frame size shifts with top/left/bottom/right", function(){
  var layout = { top: 0.1, left: 0.1, bottom: 0.1, right: 0.1 };
  var before = { x: 20, y: 20, width: 160, height: 160 };
  var after =  { x: 30, y: 30, width: 240, height: 240 };
  verifyFrameResize(layout, before, after);
});

test("frame loc shifts with centerX/centerY", function(){
  var layout = { centerX: 0, centerY: 0, width: 0.6, height: 0.6 };
  var before = { x: 40, y: 40, width: 120, height: 120 };
  var after =  { x: 60, y: 60, width: 180, height: 180 };
  verifyFrameResize(layout, before, after);
});






// test("frame size shifts with top/left/bottom/right", function(){
//   var error=null;
//   var layout = { top: 10, left: 10, bottom: 10, right: 10 };
//   parent.appendChild(child);
//   child.set('layout', layout);
//   child.get('frame');
//   parent.adjust('width', 'auto').adjust('height', 'auto');
//   try{
//     child.get('frame');
//   }catch(e){
//     error=e;
//   }
//   equals(SC.T_ERROR,SC.typeOf(error),'Layout style functions should throw and '+
//   'error if centerx/y and width/height are set at the same time ' + error );
//       
//    
// });
