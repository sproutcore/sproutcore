// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
//            Portions ©2010 Strobe Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/view');
sc_require('mixins/control');
sc_require('system/image_stores/web_sql');

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
  
  displayProperties: 'image status toolTip'.w(),
  
  tagName: function() {
    var useCanvas = this.get('useCanvas');
    return useCanvas ? 'canvas' : 'img';
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
    
    if (this.render !== SC.View.prototype.render) {
      this.render.base = this.__DEPRECATED__render;
    }
    
    if (this.get('useImageCache') !== undefined) {
      console.warn("%@ has useImageCache set, please set useImageQueue instead".fmt(this));
    }
  },
  
  
  // ..........................................................
  // Rendering
  // 
  
  createRenderer: function(theme) {
    var useCanvas = this.get('useCanvas');
    
    if (useCanvas) {
      this.updateRenderer = this.updateCanvasRenderer;
      return theme.canvasImage();
    }
    
    return theme.image();
  },
  
  updateRenderer: function(renderer) {
    var value = this.get('value'),
        toolTip = this.get('toolTip'),
        attrs;
    
    attrs = {
      toolTip: this.get('localize') && toolTip ? toolTip.loc() : toolTip,
      value: this.get('image')
    };
    
    if (this.get('type') === SC.IMAGE_TYPE_CSS_CLASS) {
      attrs.sprite = value;
    }
    
    renderer.attr(attrs);
  },
  
  updateCanvasRenderer: function(renderer) {
    var frame = this.get('frame');
    
    renderer.attr({
      height: frame.height,
      value: this.get('image'),
      width: frame.width
    });
  },
  
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
          SC.ImageView.store.load(value, this, this._storedImageDidLoad);
        } else if (this.get('useImageQueue')) {
          this._loadImage();
        } else {
          image = new Image();
          image.src = value;
          this.didLoad(image);
        }
      } else {
        this.didLoad(image);
      }
    }
  }.observes('imageValue'),
  
  _storedImageDidLoad: function(url, image) {
    // check to see if we actually got the image
    // we can't rely on image.src as it will be a datauri
    if (image && this.get('imageValue') === url) {
      this.didLoad(image);
    } else if (this.get('useImageQueue')) {
      this._loadImage();
    } else {
      
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
  },
  
  
  // ..........................................................
  // Deprecated
  // 
  
  
  __DEPRECATED__render: function(context, firstTime) {
    // the image source is the value if the status is LOADED or blank
    var value = this.get('imageValue'),
        status = this.get('status'),
        type = this.get('type'),
        src = this.get('src');
    
    if (status === SC.IMAGE_STATE_NONE && value) this._image_valueDidChange(); // setup initial state
    
    // query the status again, as calling this._image_valueDidChange() may
    // update status to SC.IMAGE_STATE_LOADED or SC.IMAGE_STATE_SPRITE
    status = this.get('status');
    
    // we can do a straight swap for the jQuery object if we're updating
    if (!firstTime) {
      context = this.$();
    }
    
    context.attr('src', src) ;
    
    if (type === SC.IMAGE_TYPE_CSS_CLASS) {
      if (this._last_class) context.setClass(this._last_class, NO);
      context.addClass(value);
      this._last_class = value;
    }
    
    // If there is a toolTip set, grab it and localize if necessary.
    var toolTip = this.get('toolTip') ;
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      if (this.get('localize')) toolTip = toolTip.loc();
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }
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
