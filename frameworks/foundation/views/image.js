// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.IMAGE_STATE_NONE = 'none';
SC.IMAGE_STATE_LOADING = 'loading';
SC.IMAGE_STATE_LOADED = 'loaded';
SC.IMAGE_STATE_FAILED = 'failed';
SC.IMAGE_STATE_SPRITE = 'sprite';

/**
  URL to a transparent GIF.  Used for spriting.
*/
SC.BLANK_IMAGE_DATAURL = "data:image/gif;base64,R0lGODlhAQABAJAAAP///wAAACH5BAUQAAAALAAAAAABAAEAAAICBAEAOw==";

SC.BLANK_IMAGE_URL = SC.browser.msie && SC.browser.msie<8 ? sc_static('blank.gif') : SC.BLANK_IMAGE_DATAURL;

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
  
  /** Image views contain an img tag. */
  classNames: 'sc-image-view',
  tagName: 'img',
  
  /**
    Current load status of the image.
    
    This status changes as an image is loaded from the server.  If spriting
    is used, this will always be loaded.  Must be one of the following
    constants: SC.IMAGE_STATE_NONE, SC.IMAGE_STATE_LOADING, 
    SC.IMAGE_STATE_LOADED, SC.IMAGE_STATE_FAILED, SC.IMAGE_STATE_SPRITE
    
    @property {String}
  */
  status: SC.IMAGE_STATE_NONE,
  
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
    If YES, image view will use the imageCache to control loading.  This 
    setting is generally preferred.
    
    @property {String}
  */
  useImageCache: YES,
  
  /**
    If YES, this image can load in the background.  Otherwise, it is treated
    as a foreground image.  If the image is not visible on screen, it will
    always be treated as a background image.
  */
  canLoadInBackground: NO,
  
  /**
    If YES, any specified toolTip will be localized before display.
  */
  localize: YES,
  
  displayProperties: 'status toolTip'.w(),
  
  render: function(context, firstTime) {
    // the image source is the value if the status is LOADED or blank
    var status = this.get('status'), value = this.get('value') ;
    
    if (status === SC.IMAGE_STATE_NONE && value) this._image_valueDidChange() ; // setup initial state
    
    // query the status again, as calling this._image_valueDidChange() may
    // update status to SC.IMAGE_STATE_LOADED or SC.IMAGE_STATE_SPRITE
    status = this.get('status');

    var src = (status === SC.IMAGE_STATE_LOADED) ? value : SC.BLANK_IMAGE_URL ;
    if (status === SC.IMAGE_STATE_SPRITE) context.addClass(value) ;
    context.attr('src', src) ;
    
    // If there is a toolTip set, grab it and localize if necessary.
    var toolTip = this.get('displayToolTip') ;
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      context.attr('title', toolTip) ;
      context.attr('alt', toolTip) ;
    }
  },
  
  /** @private - 
    Whenever the value changes, update the image state and possibly schedule
    an image to load.
  */
  _image_valueDidChange: function() {
    var value = this.get('value'), isUrl;
    if(value && value.isEnumerable) value = value.firstObject();
    
    isUrl = SC.ImageView.valueIsUrl(value);

    // if the old image is still loading, cancel it
    // if (this._loadingUrl) SC.imageCache.abortImage(this._loadingUrl);
    
    // now update local state as needed....
    if (isUrl && this.get('useImageCache')) {
      var isBackground = this.get('isVisibleInWindow') || this.get('canLoadInBackground');
      
      this._loadingUrl = value ; // note that we're loading...
      SC.imageCache.loadImage(value, this, this.imageDidLoad, isBackground);
      
      // only mark us as loading if we are still loading...
      if (this._loadingUrl) this.set('status', SC.IMAGE_STATE_LOADING);
      
    // otherwise, just set state immediately
    } else {
      this._loadingUrl = null ; // not loading...
      this.set('status', (isUrl) ? SC.IMAGE_STATE_LOADED : SC.IMAGE_STATE_SPRITE);
      this.displayDidChange(); // call manually in case status did not change
      // (e.g value changes from one sprite to another)
    }
  }.observes('value'),
  
  /** 
    Called when the imageCache indicates that the image has loaded. 
    Changing the image state will update the display.
  */
  imageDidLoad: function(url, imageOrError) {
    if (url === this._loadingUrl) this._loadingUrl = null;

    // do nothing if we get this notification by the value of the image has 
    // since changed.
    if (this.get('value') === url) {
      this.set('status', SC.$ok(imageOrError) ? SC.IMAGE_STATE_LOADED : SC.IMAGE_STATE_FAILED);
      this.displayDidChange();
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

