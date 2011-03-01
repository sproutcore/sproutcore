// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
//            Portions ©2010 Strobe Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.IMAGE_STATE_NONE = 'none';
SC.IMAGE_STATE_LOADING = 'loading';
SC.IMAGE_STATE_LOADED = 'loaded';
SC.IMAGE_STATE_FAILED = 'failed';

SC.IMAGE_TYPE_NONE = 'NONE';
SC.IMAGE_TYPE_URL = 'URL';
SC.IMAGE_TYPE_CSS_CLASS = 'CSS_CLASS';

/**
  URL to a transparent GIF.  Used for spriting.
*/
SC.BLANK_IMAGE_DATAURL = "data:image/gif;base64,R0lGODlhAQABAJAAAP///wAAACH5BAUQAAAALAAAAAABAAEAAAICBAEAOw==";

SC.BLANK_IMAGE_URL = SC.browser.msie && SC.browser.msie<8 ? sc_static('blank.gif') : SC.BLANK_IMAGE_DATAURL;

SC.BLANK_IMAGE = new Image();
SC.BLANK_IMAGE.src = SC.BLANK_IMAGE_URL;
SC.BLANK_IMAGE.width = SC.BLANK_IMAGE.height = 1;

/**
  @class

  Displays an image in the browser.

  The ImageView can be used to efficiently display images in the browser.
  It includes a built in support for a number of features that can improve
  your page load time if you use a lot of images including a image loading
  cache and automatic support for CSS spriting.

  Note that there are actually many controls that will natively include
  images using an icon property name.

  @extends SC.View
  @extends SC.Control
  @extends SC.InnerLayout
  @since SproutCore 1.0
*/
SC.ImageView = SC.View.extend(SC.Control, SC.InnerFrame,
/** @scope SC.ImageView.prototype */ {

  classNames: 'sc-image-view',
  
  ariaRole: 'img',

  displayProperties: 'frame image imageValue innerFrame status toolTip type'.w(),

  renderDelegateName: function() {
    return (this.get('useCanvas') ? 'canvasImage' : 'image') + "RenderDelegate";
  }.property('useCanvas').cacheable(),

  tagName: function() {
    return this.get('useCanvas') ? 'canvas' : 'div';
  }.property('useCanvas').cacheable(),


  // ..........................................................
  // Properties
  //

  /**
    If YES, this image can load in the background.  Otherwise, it is treated
    as a foreground image.  If the image is not visible on screen, it will
    always be treated as a background image.
  */
  canLoadInBackground: NO,

  /**
    @property {Image}
    @default SC.BLANK_IMAGE
  */
  image: SC.BLANK_IMAGE,

  /**
    @property {String}
    @default null
  */
  imageValue: function() {
    var value = this.get('value');
    return value && value.isEnumerable ? value.firstObject() : value;
  }.property('value').cacheable(),

  /**
    The frame for the inner img element or for the canvas to draw within, altered according to the scale
    and align properties provided by SC.InnerFrame.

    @property {Object}
  */
  innerFrame: function() {
    var image = this.get('image'),
        imageWidth = image.width,
        imageHeight = image.height;

    return this.innerFrameForSize(imageWidth, imageHeight);
  }.property('align', 'image', 'scale', 'frame').cacheable(),

  /**
    If YES, any specified toolTip will be localized before display.

    @property {Boolean}
    @default YES
  */
  localize: YES,

  /**
    Current load status of the image.

    This status changes as an image is loaded from the server.  If spriting
    is used, this will always be loaded.  Must be one of the following
    constants: SC.IMAGE_STATE_NONE, SC.IMAGE_STATE_LOADING,
    SC.IMAGE_STATE_LOADED, SC.IMAGE_STATE_FAILED

    @property {String}
  */
  status: SC.IMAGE_STATE_NONE,

  /**
    Will be one of the following constants: SC.IMAGE_TYPE_URL or
    SC.IMAGE_TYPE_CSS_CLASS

    @property {String}
    @observes imageValue
  */
  type: function() {
    var imageValue = this.get('imageValue');
    if (SC.ImageView.valueIsUrl(imageValue)) return SC.IMAGE_TYPE_URL;
    else if (!SC.none(imageValue)) return SC.IMAGE_TYPE_CSS_CLASS;
    return SC.IMAGE_TYPE_NONE;
  }.property('imageValue').cacheable(),

  /**
    The canvas element is more performant than the img element, since we can
    update the canvas image without causing browser reflow.  As an additional
    benefit, canvas images are less easily copied, which is generally in line
    with acting as an 'application'.

    @property {Boolean}
    @default YES if supported
    @since SproutCore 1.5
  */
  useCanvas: function() {
    return SC.platform.supportsCanvas;
  }.property().cacheable(),

  /**
    If YES, image view will use the SC.imageQueue to control loading.  This
    setting is generally preferred.

    @property {Boolean}
    @default YES
  */
  useImageQueue: YES,

  /**
    A url or CSS class name.

    This is the image you want the view to display.  It should be either a
    url or css class name.  You can also set the content and
    contentValueKey properties to have this value extracted
    automatically.

    If you want to use CSS spriting, set this value to a CSS class name.  If
    you need to use multiple class names to set your icon, separate them by
    spaces.

    Note that if you provide a URL, it must contain at least one '/' as this
    is how we autodetect URLs.

    @property {String}
  */
  value: null,

  /**
    Recalculate our innerFrame if the outer frame has changed.

    @returns {void}
  */
  // Note: SC.View's updateLayer() will call viewDidResize() if useStaticLayout is true.  The result of this
  // is that since our display depends on the frame, when the view or parent view resizes, viewDidResize
  // notifies that the frame has changed, so we update our view, which calls viewDidResize, which notifies
  // that the frame has changed, so we update our view, etc. in an infinite loop.
  viewDidResize: function() {
    // 'frame' as a property is cached and won't be updated, however calling notifyPropertyChange on 'frame' causes the aforementioned infinite loop
    // Instead, measure the frame ourselves and only notify if it has changed width or height
    var layer = this.get('layer'),
        width,
        height;

    if (layer) {
      width = layer.offsetWidth;
      height = layer.offsetHeight;

      if (this._cachedWidth !== width || this._cachedHeight !== height) {
        this.notifyPropertyChange('frame');
        this._cachedWidth = width;
        this._cachedHeight = height;
      }
    }
  },

  // ..........................................................
  // Methods
  //

  init: function() {
    sc_super();

    this._image_valueDidChange();

    if (this.get('useImageCache') !== undefined) {
      SC.Logger.warn("%@ has useImageCache set, please set useImageQueue instead".fmt(this));
      this.set('useImageQueue', this.get('useImageCache'));
    }
  },


  // ..........................................................
  // Rendering
  //

  /**
    When the layer changes, we need to tell the view to render its stuff
    as the canvas won't work without this

    @observes layer
  */
  layerDidChange: function() {
    if (this.get('useCanvas')) this.set('layerNeedsUpdate', YES);
  }.observes('layer'),


  // ..........................................................
  // Value handling
  //

  /** @private
    Whenever the value changes, update the image state and possibly schedule
    an image to load.
  */
  _image_valueDidChange: function() {
    var value = this.get('imageValue'),
        type = this.get('type');

    // check to see if our value has changed
    if (value !== this._iv_value) {
      this._iv_value = value;

      // While the new image is loading use SC.BLANK_IMAGE as a placeholder
      this.set('image', SC.BLANK_IMAGE);
      this.set('status', SC.IMAGE_STATE_LOADING);

      // order: image cache, normal load
      if (!this._loadImageUsingCache()) {
        if (!this._loadImage()) {
          // CSS class? this will be handled automatically
        }
      }
    }
  }.observes('imageValue'),

  /** @private
    Tries to load the image value using the SC.imageQueue object. If the imageValue is not
    a URL, it won't attempt to load it using this method.

    @returns YES if loading using SC.imageQueue, NO otherwise
  */
  _loadImageUsingCache: function() {
    var value = this.get('imageValue'),
        type = this.get('type');

    // now update local state as needed....
    if (type === SC.IMAGE_TYPE_URL && this.get('useImageQueue')) {
      var isBackground = this.get('isVisibleInWindow') || this.get('canLoadInBackground');

      SC.imageQueue.loadImage(value, this, this._loadImageUsingCacheDidComplete, isBackground);
      return YES;
    }

    return NO;
  },

  _loadImageUsingCacheDidComplete: function(url, image) {
    var value = this.get('imageValue');

    if (value === url) {
      if (SC.ok(image)) {
        this.didLoad(image);
      } else {
        // if loading it using the cache didn't work, it's useless to try loading the image normally
        this.didError(image);
      }
    }
  },

  /** @private
    Loads an image using a normal Image object, without using the SC.imageQueue.

    @returns YES if it will load, NO otherwise
  */
  _loadImage: function() {
    var value = this.get('imageValue'),
        type = this.get('type'),
        that = this,
        image;

    if (type === SC.IMAGE_TYPE_URL) {
      image = new Image();

      var errorFunc = function() {
        SC.run(function() {
          that._loadImageDidComplete(value, SC.$error("SC.Image.FailedError", "Image", -101));
        });
      };

      var loadFunc = function() {
        SC.run(function() {
          that._loadImageDidComplete(value, image);
        });
      };

      // Using bind here instead of setting onabort/onerror/onload directly
      // fixes an issue with images having 0 width and height
      $(image).bind('error', errorFunc);
      $(image).bind('abort', errorFunc);
      $(image).bind('load', loadFunc);

      image.src = value;
      return YES;
    }

    return NO;
  },

  _loadImageDidComplete: function(url, image) {
    var value = this.get('imageValue');

    if (value === url) {
      if (SC.ok(image)) {
        this.didLoad(image);
      } else {
        this.didError(image);
      }
    }
  },

  didLoad: function(image) {
    this.set('status', SC.IMAGE_STATE_LOADED);
    if (!image) image = SC.BLANK_IMAGE;
    this.set('image', image);
  },

  didError: function(error) {
    this.set('status', SC.IMAGE_STATE_FAILED);
    this.set('image', SC.BLANK_IMAGE);
  }

}) ;

/**
  Returns YES if the passed value looks like an URL and not a CSS class
  name.
*/
SC.ImageView.valueIsUrl = function(value) {
  return value ? value.indexOf('/') >= 0 : NO ;
} ;
