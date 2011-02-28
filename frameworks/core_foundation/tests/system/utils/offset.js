// ========================================================================
// SC Miscellaneous Utils Tests - documentOffset
// ========================================================================

/*global module test htmlbody ok equals same */

var pane, view1, view2, view3, view4;

htmlbody('<style> body { height: 1500px; width: 1500px; } </style>');


module("SC.offset", {
  setup: function() {
    var viewportEl;

    SC.RunLoop.begin();

    stop();
    
    // Reset our scroll position (particularly for Firefox that uses the last scroll position on page reload)
    window.scrollTo(0, 0);
    setTimeout(function() {
      window.start(); // continue the tests
    }, 100);
    
    // Even though a full SC app doesn't really allow the viewport to be scaled or scrolled by default (thus
    // the offset by viewport will always equal offset by document), we simulate an app that uses a
    // scrollable viewport to test the validity of the functions.
    if (SC.browser.mobileSafari) {
      viewportEl = $("[name='viewport']")[0];

      viewportEl.setAttribute('content','initial-scale=0.9, minimum-scale=0.5, maximum-scale=1.2, user-scalable=yes, width=device-height');
    }

    pane = SC.MainPane.create({
      childViews: [
        SC.View.extend({
          layout: { top: 20, left: 20, width: 100, height: 100 },
          childViews: [
            SC.View.extend({
              layout: { top: 10, left: 10, width: 20, height: 20 }
            })]
        }),
        SC.View.extend({
          layout: { top: 1200, left: 20, width: 100, height: 100 },
          childViews: [
            SC.View.extend({
              layout: { top: 10, left: 10, width: 20, height: 20 }
            })]
        })]

      // Useful for debugging in iOS
      // /** Allow default touch events */
      //  touchStart: function(touch) {
      //    if (SC.browser.mobileSafari) touch.allowDefault();
      //  },
      //
      //  touchesDragged: function(evt, touches) {
      //    if (SC.browser.mobileSafari) evt.allowDefault();
      //  },
      //
      //  touchEnd: function(touch) {
      //    if (SC.browser.mobileSafari) touch.allowDefault();
      //  }
    });
    pane.append();
    SC.RunLoop.end();

    view1 = pane.childViews[0];
    view2 = pane.childViews[1];
    view3 = view1.childViews[0];
    view4 = view2.childViews[0];
  },

  teardown: function() {
    // Useful for debugging in iOS
    // if (!SC.browser.mobileSafari) {
      pane.remove();
      pane = view1 = view2 = view3 = view4 = null;
    // }
  }
});


function checkDocumentOffset(element, top, left) {
  var docOffset = SC.offset(element, 'document');

  equals(docOffset.top, top, 'document offset top');
  equals(docOffset.left, left, 'document offset left');
}

function checkViewportOffset(element, top, left) {
  var viewOffset = SC.offset(element, 'viewport');

  equals(viewOffset.top, top, 'viewport offset top');
  equals(viewOffset.left, left, 'viewport offset left');
}

function checkParentOffset(element, top, left) {
  var parentOffset = SC.offset(element, 'parent');

  equals(parentOffset.top, top, 'parent offset top');
  equals(parentOffset.left, left, 'parent offset left');
}

test("Regular views", function() {
  var element;
    
  element = view1.$();
  checkDocumentOffset(element, 20, 20);
  checkViewportOffset(element, 20, 20);
  checkParentOffset(element, 20, 20);
  
  element = view3.$();
  checkDocumentOffset(element, 30, 30);
  checkViewportOffset(element, 30, 30);
  checkParentOffset(element, 10, 10);
});

test("A regular view not visible within the visual viewport", function() {
  var element;
  
  element = view2.$();
  checkDocumentOffset(element, 1200, 20);
  checkViewportOffset(element, 1200, 20);
  checkParentOffset(element, 1200, 20);
  
  element = view4.$();
  checkDocumentOffset(element, 1210, 30);
  checkViewportOffset(element, 1210, 30);
  checkParentOffset(element, 10, 10);
});

test("A regular view with window scroll offset", function() {
  var element1 = view1.$(),
      element2 = view2.$(),
      element3 = view3.$(),
      element4 = view4.$();

  stop();
  
  // Scroll to 10px down (timeouts appear to be necessary for iOS scrolling)
  window.scrollTo(0, 10);
  setTimeout(function() {
    window.start(); // continue the tests
  }, 600);
  
  checkDocumentOffset(element1, 20, 20);
  checkViewportOffset(element1, 10, 20);
  checkParentOffset(element1, 20, 20);
  
  checkDocumentOffset(element3, 30, 30);
  checkViewportOffset(element3, 20, 30);
  checkParentOffset(element3, 10, 10);
  
  checkDocumentOffset(element2, 1200, 20);
  checkViewportOffset(element2, 1190, 20);
  checkParentOffset(element2, 1200, 20);
  
  checkDocumentOffset(element4, 1210, 30);
  checkViewportOffset(element4, 1200, 30);
  checkParentOffset(element4, 10, 10);

  stop();
  
  // Scroll to 10px right
  window.scrollTo(10, 10);
  setTimeout(function() {
    window.start(); // continue the tests
  }, 900);
  checkDocumentOffset(element1, 20, 20);
  checkViewportOffset(element1, 10, 10);
  checkParentOffset(element1, 20, 20);
  
  checkDocumentOffset(element3, 30, 30);
  checkViewportOffset(element3, 20, 20);
  checkParentOffset(element3, 10, 10);
  
  checkDocumentOffset(element2, 1200, 20);
  checkViewportOffset(element2, 1190, 10);
  checkParentOffset(element2, 1200, 20);
  
  checkDocumentOffset(element4, 1210, 30);
  checkViewportOffset(element4, 1200, 20);
  checkParentOffset(element4, 10, 10);

  stop();
  
  // Scroll to 100px down
  window.scrollTo(10, 100);
  setTimeout(function() {
    window.start(); // continue the tests
   }, 1200);
  checkDocumentOffset(element1, 20, 20);
  checkViewportOffset(element1, -80, 10);
  checkParentOffset(element1, 20, 20);
  
  checkDocumentOffset(element3, 30, 30);
  checkViewportOffset(element3, -70, 20);
  checkParentOffset(element3, 10, 10);
  
  checkDocumentOffset(element2, 1200, 20);
  checkViewportOffset(element2, 1100, 10);
  checkParentOffset(element2, 1200, 20);
  
  checkDocumentOffset(element4, 1210, 30);
  checkViewportOffset(element4, 1110, 20);
  checkParentOffset(element4, 10, 10);

  stop();
  
  // Scroll to 100px right
  window.scrollTo(100, 100);
  setTimeout(function() {
    window.start(); // continue the tests
  }, 1500);
  checkDocumentOffset(element1, 20, 20);
  checkViewportOffset(element1, -80, -80);
  checkParentOffset(element1, 20, 20);
  
  checkDocumentOffset(element3, 30, 30);
  checkViewportOffset(element3, -70, -70);
  checkParentOffset(element3, 10, 10);
  
  checkDocumentOffset(element2, 1200, 20);
  checkViewportOffset(element2, 1100, -80);
  checkParentOffset(element2, 1200, 20);
  
  checkDocumentOffset(element4, 1210, 30);
  checkViewportOffset(element4, 1110, -70);
  checkParentOffset(element4, 10, 10);
});