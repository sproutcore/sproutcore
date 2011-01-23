// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
(function() {
  var logoURL = "http://www.sproutcore.com/assets/images/logo.png";
  var sampleURLs = [ "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/canyon-public-domain-images-pictures/zion-hiker-the-sweetie-hiking-in-zion-narrows_w725_h544.jpg",
"http://www.public-domain-image.com/cache/people-public-domain-images-pictures/children-kids-public-domain-images-pictures/children-playing_w562_h725.jpg",
"http://www.public-domain-image.com/cache/architecture-public-domain-images-pictures/fountain-public-domain-images-pictures/water-fountain-in-park_w725_h544.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/canyon-public-domain-images-pictures/winter-at-bryce-canyon_w725_h544.jpg", "http://www.public-domain-image.com/cache/fauna-animals-public-domain-images-pictures/prairie-dog-public-domain-images-pictures/prairie-dog-pups_w725_h483.jpg", "http://www.public-domain-image.com/cache/fauna-animals-public-domain-images-pictures/prairie-dog-public-domain-images-pictures/prairie-rattlesnake-crotalus-viridis_w725_h484.jpg", "http://www.public-domain-image.com/cache/fauna-animals-public-domain-images-pictures/tigers-public-domain-images-pictures/bengal-tiger_w725_h486.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/field-public-domain-images-pictures/wooden-logs-in-field_w725_h483.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/field-public-domain-images-pictures/wheat-yellow-in-field_w725_h544.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/field-public-domain-images-pictures/vineyards_w725_h544.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/autumn-public-domain-images-pictures/old-trees-with-leaves-on-ground-in-autumn_w725_h484.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/canyon-public-domain-images-pictures/yaki-point-at-the-grand-canyon_w725_h547.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/canyon-public-domain-images-pictures/grand-canyons-overlook-railings-pointing_w725_h544.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/coast-public-domain-images-pictures/sand-ocean-tidepools-sea-swimming-swimmers-waves_w725_h544.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/coast-public-domain-images-pictures/waves-breaking-rocks_w725_h544.jpg", "http://www.public-domain-image.com/cache/nature-landscapes-public-domain-images-pictures/sand-public-domain-images-pictures/sand-footstep_w725_h482.jpg"];

  var pane = SC.ControlTestPane.design()
    .add("image_not_loaded", SC.ImageView, {
      value: null, layout : { width: 200, height: 300 },
      useCanvas: NO
    })
    .add("image_loaded", SC.ImageView, {
      value: logoURL, layout : { width: 200, height: 300 },
      useImageCache: NO,
      useCanvas: NO
    })
    .add('sprite_image', SC.ImageView, {
      layout: { width: 200, height: 300 },
      value: 'sprite-class',
      useCanvas: NO
    })
    .add('image_canvas', SC.ImageView, {
      layout: { width: 200, height: 300 },
      useCanvas: YES,
      value: logoURL
    })
    .add('image_holder', SC.View, {
      layout: { width: 200, height: 200 }
    });

  pane.show();

  module('SC.ImageView ui', pane.standardSetup());

  test("Verify that all the rendering properties of an image that is being loaded are correct", function() {
    var imageView = pane.view('image_not_loaded'),
        url;

    ok(imageView.get('isVisibleInWindow'), 'image_not_loaded is visible in window');

    imageView.set('value', logoURL);
    ok(imageView.get('status') !== SC.IMAGE_STATE_LOADED, 'PRECOND - status should not be loaded (status=%@)'.fmt(imageView.get('status')));
    ok(imageView.get('status') === SC.IMAGE_STATE_LOADING, 'PRECOND - status should be loading (status=%@)'.fmt(imageView.get('status')));

    url = imageView.$('img').attr('src');
    ok((url.indexOf('base64')!=-1) || (url.indexOf('blank.gif')!=-1), "The src should be blank URL. url = %@".fmt(url));
  });

  test("Verify that all the rendering properties of an image that is loaded are correct", function() {
    var imageView = pane.view('image_loaded'),
        imgEl;

    ok(imageView.get('isVisibleInWindow'), 'image_loaded is visible in window');

    imageView.addObserver('status', this, function() {
      equals(SC.IMAGE_STATE_LOADED, imageView.get('status'), 'status should be loaded');

      // Status has changed, but the observer fires immediately, so pause in order to have the DOM updated
      setTimeout(function() {
        imgEl = imageView.$('img');
        equals(logoURL, imgEl.attr('src'), "img src should be set to logoURL");

        window.start(); // continue the tests
        }, 100);
    });

    stop();
  });

  test("Verify that the tooltip is correctly being set as both the title and attribute (disabling localization for this test)", function() {
    var imageView = pane.view('image_loaded'),
        testToolTip = 'This is a test tooltip',
        imgEl;

    imageView.set('localization', NO);
    imageView.set('toolTip', testToolTip);

    imageView.addObserver('status', this, function() {
      setTimeout(function() {
        imgEl = imageView.$('img');
        equals(imgEl.attr('title'), testToolTip, "title attribute");
        equals(imgEl.attr('alt'), testToolTip, "alt attribute");

        window.start(); // continue the tests
      }, 100);
    });

    stop();
  });

  test("Verify sprite image class", function() {
    var imageView = pane.view('sprite_image'),
        imgEl;

    imgEl = imageView.$('img');

    ok(imgEl.hasClass('sprite-class'), "The class value should be on the img element");
  });

  test("Verify canvas rendering and properties", function() {
    var view = pane.view('image_canvas'),
        canvasEl = view.$();

    equals(canvasEl.attr('width'), 200, "The width of the canvas element should be set");
    equals(canvasEl.attr('height'), 300, "The height of the canvas element should be set");
  });

  test("Using imageCache", function() {
    var imageHolder = pane.view('image_holder'),
        timestamp = SC.DateTime.create(),
        imageView1,
        imageView2;

    // Set the first view to load in the background (ie. it should load last although it was created first)
    imageView1 = SC.ImageView.create({
      value: sampleURLs[0] + "?lastmod=" + timestamp.get('milliseconds'),
      canLoadInBackground: YES
    });
    imageView2 = SC.ImageView.create({
      value: sampleURLs[1] + "?lastmod=" + timestamp.get('milliseconds'),
      canLoadInBackground: NO
    });

    console.log("1: %@, 2: %@".fmt(sampleURLs[0] + "?lastmod=" + timestamp.get('milliseconds'), sampleURLs[1] + "?lastmod=" + timestamp.get('milliseconds')));
    stop();

    // The second image should load first and the first not be loaded yet
    imageView2.addObserver('status', this, function() {
      equals(imageView2.get('status'), SC.IMAGE_STATE_LOADED, 'imageView2 status');
      equals(imageView1.get('status'), SC.IMAGE_STATE_LOADING, 'imageView1 status');
    });

    imageView1.addObserver('status', this, function() {
      equals(imageView2.get('status'), SC.IMAGE_STATE_LOADED, 'imageView2 status');
      equals(imageView1.get('status'), SC.IMAGE_STATE_LOADED, 'imageView1 status');

      window.start(); // starts the test runner
    });

    imageHolder.appendChild(imageView1);
    imageHolder.appendChild(imageView2);
  });

  test("Scaling images (img)", function() {
    var imageHolder = pane.view('image_holder'),
        timestamp = SC.DateTime.create(),
        imageView,
        imgEl;

    // The logo is 294x60
    imageView = SC.ImageView.create({
      value: logoURL + "?lastmod=" + timestamp.get('milliseconds'),
      layout: { top: 0, left: 0, width: 588, height: 90 },
      useCanvas: NO
    });

    stop();

    // Default is SC.FILL
    imageView.addObserver('status', this, function() {
      // Status has changed, but the observer fires immediately, so pause in order to have the DOM updated
      setTimeout(function() {
        imgEl = imageView.$('img');

        equals(imgEl.css('width'), "588px", "SC.FILL width");
        equals(imgEl.css('height'), "90px", "SC.FILL height");

        SC.RunLoop.begin();
        imageView.set('scale', SC.SCALE_NONE);
        SC.RunLoop.end();

        equals(imgEl.css('width'), "294px", "SC.SCALE_NONE width");
        equals(imgEl.css('height'), "60px", "SC.SCALE_NONE height");

        SC.RunLoop.begin();
        imageView.set('scale', SC.FILL_PROPORTIONALLY);
        SC.RunLoop.end();

        equals(imgEl.css('width'), "588px", "SC.FILL_PROPORTIONALLY width");
        equals(imgEl.css('height'), "120px", "SC.FILL_PROPORTIONALLY height");

        SC.RunLoop.begin();
        imageView.set('scale', SC.BEST_FIT);
        SC.RunLoop.end();

        equals(imgEl.css('width'), "441px", "SC.BEST_FIT width");
        equals(imgEl.css('height'), "90px", "SC.BEST_FIT height");

        SC.RunLoop.begin();
        imageView.set('scale', SC.BEST_FIT_DOWN_ONLY);
        SC.RunLoop.end();

        equals(imgEl.css('width'), "294px", "SC.BEST_FIT_DOWN_ONLY width (larger frame)");
        equals(imgEl.css('height'), "60px", "SC.BEST_FIT_DOWN_ONLY height (larger frame)");

        SC.RunLoop.begin();
        imageView.set('layout', { top: 0, left: 0, width: 147, height: 90 });
        SC.RunLoop.end();

        equals(imgEl.css('width'), "147px", "SC.BEST_FIT_DOWN_ONLY width (smaller size frame)");
        equals(imgEl.css('height'), "30px", "SC.BEST_FIT_DOWN_ONLY height (smaller size frame)");

        window.start(); // starts the test runner
      }, 200);
    });

    imageHolder.appendChild(imageView);
  });

  test("Scaling images (canvas)", function() {
    var imageHolder = pane.view('image_holder'),
        timestamp = SC.DateTime.create(),
        imageView,
        innerFrame;

    // The logo is 294x60
    imageView = SC.ImageView.create({
      value: logoURL + "?lastmod=" + timestamp.get('milliseconds'),
      layout: { top: 0, left: 0, width: 588, height: 90 }
    });

    stop();

    imageView.addObserver('status', this, function() {
      // Status has changed, but the observer fires immediately, so pause in order to have the DOM updated
      setTimeout(function() {
        innerFrame = imageView.get('innerFrame');

        // Default is SC.FILL
        equals(innerFrame.width, 588, "SC.FILL width");
        equals(innerFrame.height, 90, "SC.FILL height");

        SC.RunLoop.begin();
        imageView.set('scale', SC.SCALE_NONE);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.width, 294, "SC.SCALE_NONE width");
        equals(innerFrame.height, 60, "SC.SCALE_NONE height");

        SC.RunLoop.begin();
        imageView.set('scale', SC.FILL_PROPORTIONALLY);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.width, 588, "SC.FILL_PROPORTIONALLY width");
        equals(innerFrame.height, 120, "SC.FILL_PROPORTIONALLY height");

        SC.RunLoop.begin();
        imageView.set('scale', SC.BEST_FIT);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.width, 441, "SC.BEST_FIT width");
        equals(innerFrame.height, 90, "SC.BEST_FIT height");

        SC.RunLoop.begin();
        imageView.set('scale', SC.BEST_FIT_DOWN_ONLY);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.width, 294, "SC.BEST_FIT_DOWN_ONLY width (larger frame)");
        equals(innerFrame.height, 60, "SC.BEST_FIT_DOWN_ONLY height (larger frame)");

        SC.RunLoop.begin();
        imageView.set('layout', { top: 0, left: 0, width: 147, height: 90 });
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.width, 147, "SC.BEST_FIT_DOWN_ONLY width (smaller size frame)");
        equals(innerFrame.height, 30, "SC.BEST_FIT_DOWN_ONLY height (smaller size frame)");

        window.start(); // starts the test runner
      }, 200);
    });

    imageHolder.appendChild(imageView);
  });

  test("Aligning images (img)", function() {
    var imageHolder = pane.view('image_holder'),
        timestamp = SC.DateTime.create(),
        imageView,
        imgEl;

    // The logo is 294x60
    imageView = SC.ImageView.create({
      value: logoURL + "?lastmod=" + timestamp.get('milliseconds'),
      layout: { top: 0, left: 0, width: 588, height: 120 },
      useCanvas: NO,
      scale: SC.SCALE_NONE
    });

    stop();

    // Default is SC.FILL
    imageView.addObserver('status', this, function() {
      // Status has changed, but the observer fires immediately, so pause in order to have the DOM updated
      setTimeout(function() {
        imgEl = imageView.$('img');

        // Default is SC.ALIGN_CENTER
        equals(imgEl.css('top'), "30px", "SC.ALIGN_CENTER top");
        equals(imgEl.css('left'), "147px", "SC.ALIGN_CENTER left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_TOP_LEFT);
        SC.RunLoop.end();

        equals(imgEl.css('top'), "0px", "SC.ALIGN_TOP_LEFT top");
        equals(imgEl.css('left'), "0px", "SC.ALIGN_TOP_LEFT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_TOP);
        SC.RunLoop.end();

        equals(imgEl.css('top'), "0px", "SC.ALIGN_TOP top");
        equals(imgEl.css('left'), "147px", "SC.ALIGN_TOP left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_TOP_RIGHT);
        SC.RunLoop.end();

        equals(imgEl.css('top'), "0px", "SC.ALIGN_TOP_RIGHT top");
        equals(imgEl.css('left'), "294px", "SC.ALIGN_TOP_RIGHT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_RIGHT);
        SC.RunLoop.end();

        equals(imgEl.css('top'), "30px", "SC.ALIGN_RIGHT top");
        equals(imgEl.css('left'), "294px", "SC.ALIGN_RIGHT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_BOTTOM_RIGHT);
        SC.RunLoop.end();

        equals(imgEl.css('top'), "60px", "SC.ALIGN_BOTTOM_RIGHT top");
        equals(imgEl.css('left'), "294px", "SC.ALIGN_BOTTOM_RIGHT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_BOTTOM);
        SC.RunLoop.end();

        equals(imgEl.css('top'), "60px", "SC.ALIGN_BOTTOM top");
        equals(imgEl.css('left'), "147px", "SC.ALIGN_BOTTOM left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_BOTTOM_LEFT);
        SC.RunLoop.end();

        equals(imgEl.css('top'), "60px", "SC.ALIGN_BOTTOM_LEFT top");
        equals(imgEl.css('left'), "0px", "SC.ALIGN_BOTTOM_LEFT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_LEFT);
        SC.RunLoop.end();

        equals(imgEl.css('top'), "30px", "SC.ALIGN_LEFT top");
        equals(imgEl.css('left'), "0px", "SC.ALIGN_LEFT left");

        window.start(); // starts the test runner
      }, 200);
    });

    imageHolder.appendChild(imageView);
  });

  test("Aligning images (canvas)", function() {
    var imageHolder = pane.view('image_holder'),
        timestamp = SC.DateTime.create(),
        imageView,
        innerFrame;

    // The logo is 294x60
    imageView = SC.ImageView.create({
      value: logoURL + "?lastmod=" + timestamp.get('milliseconds'),
      layout: { top: 0, left: 0, width: 588, height: 120 },
      scale: SC.SCALE_NONE
    });

    stop();

    // Default is SC.FILL
    imageView.addObserver('status', this, function() {
      // Status has changed, but the observer fires immediately, so pause in order to have the DOM updated
      setTimeout(function() {
        innerFrame = imageView.get('innerFrame');

        // Default is SC.ALIGN_CENTER
        equals(innerFrame.y, 30, "SC.ALIGN_CENTER top");
        equals(innerFrame.x, 147, "SC.ALIGN_CENTER left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_TOP_LEFT);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.y, 0, "SC.ALIGN_TOP_LEFT top");
        equals(innerFrame.x, 0, "SC.ALIGN_TOP_LEFT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_TOP);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.y, 0, "SC.ALIGN_TOP top");
        equals(innerFrame.x, 147, "SC.ALIGN_TOP left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_TOP_RIGHT);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.y, 0, "SC.ALIGN_TOP_RIGHT top");
        equals(innerFrame.x, 294, "SC.ALIGN_TOP_RIGHT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_RIGHT);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.y, 30, "SC.ALIGN_RIGHT top");
        equals(innerFrame.x, 294, "SC.ALIGN_RIGHT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_BOTTOM_RIGHT);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.y, 60, "SC.ALIGN_BOTTOM_RIGHT top");
        equals(innerFrame.x, 294, "SC.ALIGN_BOTTOM_RIGHT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_BOTTOM);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.y, 60, "SC.ALIGN_BOTTOM top");
        equals(innerFrame.x, 147, "SC.ALIGN_BOTTOM left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_BOTTOM_LEFT);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.y, 60, "SC.ALIGN_BOTTOM_LEFT top");
        equals(innerFrame.x, 0, "SC.ALIGN_BOTTOM_LEFT left");

        SC.RunLoop.begin();
        imageView.set('align', SC.ALIGN_LEFT);
        SC.RunLoop.end();

        innerFrame = imageView.get('innerFrame');
        equals(innerFrame.y, 30, "SC.ALIGN_LEFT top");
        equals(innerFrame.x, 0, "SC.ALIGN_LEFT left");

        window.start(); // starts the test runner
      }, 200);
    });

    imageHolder.appendChild(imageView);
  });
})();

