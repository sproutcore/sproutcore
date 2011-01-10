// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
//            Portions ©2010 Strobe Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/image_stores/web_sql');

SC.FILL = "fill";
SC.BEST_FIT = "bestFit";
SC.FIT_WIDTH = "fitWidth";
SC.FIT_HEIGHT = "fitHeight";

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
  queue and automatic support for CSS spriting.
  
  Note that there are actually many controls that will natively include 
  images using an icon property name.
  
  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
*/
SC.ImageView = SC.View.extend(SC.Control,
/** @scope SC.ImageView.prototype */ {

  classNames: 'sc-image-view',
  
  displayProperties: 'image status fit toolTip width height'.w(),
  
  renderDelegateName: function() {
    return (this.get('useCanvas') ? 'canvasImage' : 'image') + "RenderDelegate";
  }.property('useCanvas').cacheable(),
  
  tagName: function() {
    return this.get('useCanvas') ? 'canvas' : 'img';
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
    Determines how the image will fit into its containing space. Possible
    values: SC.FILL, SC.BEST_FIT, SC.FIT_WIDTH, SC.FIT_HEIGHT.
    
    @property {String}
    @default SC.FILL
  */
  fit: SC.FILL,
  
  /*
    TODO [CC] Find a less hacky way of accomplishing this
  */
  /**
    Only used because of how RenderDelegates are passed values.
    
    @property {Number}
    @default 0
    @observes frame
  */
  height: function() {
    return this.get('frame').height;
  }.property('frame').cacheable(),
  
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
    @property {Boolean}
    @default NO
    @since SproutCore 1.5
  */
  useCanvas: NO,
  
  /**
    If YES, image view will use the SC.imageQueue to control loading.  This 
    setting is generally preferred.
    
    @property {Boolean}
    @default YES
  */
  useImageQueue: YES,
  
  /**
    If YES, the image will be stored using a SC.ImageStore object. It will use the
    store defined at SC.ImageView.store. This will store the image locally and make
    it available offline. Note that this only works when using a URL as the value.
    
    @property {Boolean}
    @default NO
    @since SproutCore 1.5
  */
  wantsImageStored: NO,
  
  /*
    TODO [CC] Find a less hacky way of accomplishing this
  */
  /**
    Only used because of how RenderDelegates are passed values.
    
    @property {Number}
    @default 0
    @observes frame
  */
  width: function() {
    return this.get('frame').width;
  }.property('frame').cacheable(),
  
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
  
  
  // ..........................................................
  // Methods
  // 
  
  init: function() {
    sc_super();
    
    this._image_valueDidChange();
    
    if (this.get('useImageCache') !== undefined) {
      console.warn("%@ has useImageCache set, please set useImageQueue instead".fmt(this));
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
        type = this.get('type'),
        image;
    
    // check to see if our value has changed
    if (value !== this._iv_value) {
      this._iv_value = value;
      
      if (type === SC.IMAGE_TYPE_URL) {
        if (this.get('wantsImageStored') && SC.ImageView.store && SC.ImageView.store.isImageStore) {
          this.set('image', SC.BLANK_IMAGE);
          SC.ImageView.store.load(value, this, this._storedImageDidLoad);
        } else if (this.get('useImageQueue')) {
          this.set('image', SC.BLANK_IMAGE);
          this._loadImage();
        } else {
          image = new Image();
          image.src = value;
          this.didLoad(image);
        }
      } else {
        image = SC.BLANK_IMAGE;
        this.didLoad(image);
      }
    }
  }.observes('imageValue'),
  
  _storedImageDidLoad: function(url, image) {
    var value = this.get('imageValue');
    
    // check to see if we actually got the image
    // we can't rely on image.src as it will be a datauri
    if (SC.ok(image) && value === url) {
      this.didLoad(image);
    } else if (this.get('useImageQueue')) {
      this._loadImage();
    } else {
      image = new Image();
      image.src = value;
      this.didLoad(image);
    }
  },
  
  _loadImage: function() {
    var value = this.get('imageValue'),
        type = this.get('type');
    
    // now update local state as needed....
    if (type === SC.IMAGE_TYPE_URL && this.get('useImageQueue')) {
      var isBackground = this.get('isVisibleInWindow') || this.get('canLoadInBackground');
      
      this.set('status', SC.IMAGE_STATE_LOADING);
      SC.imageQueue.loadImage(value, this, this._loadImageDidComplete, isBackground);
    }
  },
  
  _loadImageDidComplete: function(url, image) {
    var value = this.get('imageValue');
    
    if (value === url) {
      if (SC.ok(image)) {
        if (this.get('useImageStore')) {
          SC.imageStore.save(value, image);
        }
        
        this.didLoad(image);
      } else {
        this.didError(image);
      }
    }
  },
  
  didLoad: function(image) {
    this.set('status', SC.IMAGE_STATE_LOADED);
    if (image) this.set('image', image);
    
    this.displayDidChange();
  },
  
  didError: function(error) {
    this.set('status', SC.IMAGE_STATE_FAILED);
    this.displayDidChange();
    /*
      TODO Do something with error?
    */
  }

}) ;

/**
  Returns YES if the passed value looks like an URL and not a CSS class
  name.
*/
SC.ImageView.valueIsUrl = function(value) {
  return value ? value.indexOf('/') >= 0 : NO ;
} ;

SC.ImageView.store = SC.WebSQLImageStore.create();
