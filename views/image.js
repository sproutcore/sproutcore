// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/control') ;

lc_cnt = 0 ;

SC.IMAGE_STATE_NONE = 'none';
SC.IMAGE_STATE_LOADING = 'loading';
SC.IMAGE_STATE_LOADED = 'loaded';
SC.IMAGE_STATE_FAILED = 'failed';

/**
  URL to a transparent GIF.  Used for spriting.
*/
SC.BLANK_IMAGE_URL = static_url('blank.gif');

/**
  @class

  Displays an image in the browser.  
  
  The ImageView can be used to efficiently display images in the browser.
  It includes a built in support for a number of features that can improve
  your page load time if you use a lot of images including a image loading
  queue and automatic support for CSS spriting.

  @extends SC.View
  @extends SC.Control
  @author Charles Jolley
*/
SC.ImageView = SC.View.extend(SC.Control, 
/** @scope SC.ImageView.prototype */ {
  
  /** Image views contain an img tag. */
  emptyElement: '<img src="%@" class="sc-image-view" />'.fmt(SC.BLANK_IMAGE_URL),
  
  /**
    Current load status of the image.
    
    This status changes as an image is loaded from the server.  If spriting
    is used, this will always be loaded.  Must be one of the following
    constants: SC.IMAGE_STATE_NONE, SC.IMAGE_STATE_LOADING, 
    SC.IMAGE_STATE_LOADED, SC.IMAGE_STATE_FAILED
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
  */
  value: null,
  _value: null,

  /**
    Invoked whenever the content or value changes. (To be removed in 
    SproutCore 1.0)
    
    This method is no longer necessary since we have the standard SC.Control
    behavior.
    
    @deprecated
    @param {Object} content The content object.
    @returns {String} the URL or CSS class name
  */
  transform: function(content) { return content; },
  
  valueObserver: function() {
    
    // get the new URL.
    var value = this.get('value') ;
    
    // invoke the old transform method if it is defined
    if (this.transform !== SC.ImageView.prototype.transform) {
      var content = this.get('content') || '' ;
      value = this.transform(content) ;
    }
    
    // if the value has not changed, do nothing.
    if (value == this._value) return ;
    
    // if the old value was a class name, then we need to remove it.
    if (this._value && this._value.length>0 && !SC.ImageView.valueIsUrl(this._value)) {
      var classNames = this._value.split(' ') ;
      var idx = classNames.length ;
      while(--idx >= 0) { 
        this.removeClassName(classNames[idx]); 
      }
      this.removeClassName('sc-sprite') ;
    }
    this._value = value ;
    
    // if the new value is empty, just clear the img.
    if (!value || value.length == 0) {
      this.rootElement.src = SC.BLANK_IMAGE_URL;
      this.set('status', SC.IMAGE_STATE_NONE) ;
      this._imageUrl = null; //clear
      
    // if a new value was set that is a URL, load the image URL.
    } else if (SC.ImageView.valueIsUrl(value)) {
      this.beginPropertyChanges() ;
      this.set('status', SC.IMAGE_STATE_LOADING) ;
      this._imageUrl = value ; // save to verify later.
      SC.imageCache.loadImage(value, this, this._onLoadComplete) ;
      this.endPropertyChanges() ;
      
    // if the new is a CSS class name, set an empty image and add class name 
    } else {
      var classNames = value.split(' ');
      var idx = classNames.length ;
      while(--idx >= 0) this.addClassName(classNames[idx]) ;
      this.addClassName('sc-sprite') ;
      this.rootElement.src = SC.BLANK_IMAGE_URL ;
      this.set('status', SC.IMAGE_STATE_LOADED) ;
    }
  }.observes('value'),
  

  /** 
    Invoked once an image loads.  If an image has already been loaded,
    this method will be invoked immediately.
  */
  _onLoadComplete: function(url, status, img) {  
    
    // sometimes this method gets called later after the url has already
    // changed.  If this is the case, bail...
    if (url !== this._imageUrl) return ;
    
    this.beginPropertyChanges() ;
    this.set('imageWidth', parseInt(img.width,0)) ;
    this.set('imageHeight', parseInt(img.height,0)) ;
    this.set('status',status) ;
    this.endPropertyChanges() ;
    
    if (status == SC.IMAGE_STATE_LOADED) {
      if (this.imageDidLoad) this.imageDidLoad(url) ;
      this.rootElement.src =  url ;
    } else {
      if (this.imageDidFail) this.imageDidFail(url, status) ;
    }
  },
  
  init: function() {
    sc_super() ;
    this.valueObserver() ;
    if (this.rootElement.src) {
      this.set('imageWidth',parseInt(this.rootElement.width,0)) ;
      this.set('imageHeight',parseInt(this.rootElement.height,0)) ;
    }
  }
  
}) ;

/**
  Returns YES if the passed value looks like an URL and not a CSS class
  name.
*/
SC.ImageView.valueIsUrl = function(value) {
  return (value.indexOf('/') >= 0) || (value.indexOf('.') >= 0) ;
} ;

/**
  The image cache will create Image objects to preload a set of 
  images.  This will control the number of images being loaded to maximize
  browser throughput.
*/
SC.imageCache = SC.Object.create({  
  
  // this restricts the maximum number of images that can load in.
  loadLimit: 4,
  
  // this is the primary entry point for the imageCache.  Use this method to
  // ask the cache to load an image and then invoke the callback when its
  // available.  You can pass either a function or an object + a function.
  // Your callback should have this pattern:
  //
  // method(url, status, imgObject)
  // url: the original URL you passed in.
  // status: loaded | error | aborted
  // imgObject: the image object.  This parameter is optional.
  //
  loadImage: function(url, objOrFunc, method) {
    var dta = this._images[url] = (this._images[url] || { url: url,
      img: null, handlers: [], status: 'unknown' }) ;

    if (dta.img == null) {
      this._queue.push(dta) ;
      if (!this._imgTimeout) {
        this._imgTimeout = this.invokeLater(this.loadNextImage, 100) ;
      }
    }

    // you can pass either just a function or an object + a method.  This will
    // handle both.
    var handler = (method) ? [objOrFunc, method] : [this, objOrFunc] ;
    if (dta.status == 'unknown') {
      dta.handlers.push(handler) ;
    } else if (handler[1]) {
      handler[1].call(handler[0], url, dta.status, dta.img) ;
    }
  },
  
  // this is called to load images that need 
  loadNextImage: function() {
    this._imgTimeout = null ;
    while((this._queue.length > 0) && (this._loading.length < this.loadLimit)) {   
      var dta = this._queue.pop() ;
      var url = dta.url ;
      dta.img = new Image() ;
      dta.img.onabort = this._onAbort.bind(this,url) ;
      dta.img.onerror = this._onError.bind(this,url) ;
      dta.img.onload = this._onLoad.bind(this, url) ;
      dta.img.src = dta.url ;

      // add to loading queue.
      this._loading.push(dta.url) ;
    }
  },
  
  _onAbort: function(url) { this._changeStatus(url, 'aborted') ; },
  _onError: function(url) { this._changeStatus(url, 'error'); },
  _onLoad: function(url) { this._changeStatus(url, 'loaded'); },

  // update the status in the queue and call any queued handlers.
  _changeStatus: function(url, status) {
    var dta = this._images[url] ;
    if (!dta) return ;
    dta.status = status ;
    
    var handler ;
    while(handler = dta.handlers.pop()) {
      if (handler[1]) handler[1].call(handler[0], url, dta.status, dta.img) ;
    }
    
    // get the next image, if needed.
    this._loading = this._loading.without(dta.url) ;
    this.loadNextImage() ;
  },
  
  _images: {},
  _loading: [],
  _queue: []
    
}); 