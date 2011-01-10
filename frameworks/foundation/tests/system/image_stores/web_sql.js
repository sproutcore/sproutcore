// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Strobe Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */
var png = sc_static('images/sproutcore.png'), pngImage;

var store = SC.WebSQLImageStore.create();

module("SC.imageStore", {
  setup: function() {
    pngImage = new Image();
    pngImage.src = png;
  },
  
  teardown: function() {
    SC.ImageView.store.nuke();
  }
});

test("Saving and loading a PNG", function() {
  store.save(png, pngImage, this, function(storedImage) {
    ok(storedImage, "the stored image is not null");
    
    if (storedImage) {
      store.load(png, this, function(url, image) {
        equals(url, png, "loaded image should have same URL as the one we saved");
        ok(SC.ok(image), "loaded image is not an error");
        
        if (SC.ok(image)) {
          SC.Logger.dir(image);
          equals(image.width, pngImage.width, "Returned image from database should have same width as actual image");
          equals(image.height, pngImage.height, "Returned image from database should have same height as actual image");
        }
        
        window.start();
      });
    } else {
      window.start();
    }
    
  });
  
  stop();
});