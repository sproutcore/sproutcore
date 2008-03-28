// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

lc_cnt = 0 ;

SC.ImageView = SC.View.extend({
  emptyElement: '<img src="%@" />'.fmt(static_url('blank')),
  
  status: 'unknown',
  
  content: null, // becomes the url.
  contentBindingDefault: SC.Binding.Single,
  
  // override with your own function to transform content into a URL.
  transform: function(content) { return content; },
  
  contentObserver: function() {
    var prop = this.get('content') || '' ;
    var url = this.transform(prop) ;
    
    if (url && url.length > 0) {
      this.beginPropertyChanges() ;
      this.set('status','loading') ;
      SC.imageCache.loadImage(url, this, this._onLoadComplete) ;
      this.endPropertyChanges() ;
    } else {
      this.rootElement.src = '' ;
      this.set('status','unknown') ;
    }
  }.observes('content') ,
  
  _onLoadComplete: function(url, status, img) {  
    this.beginPropertyChanges() ;
    this.set('imageWidth', parseInt(img.width,0)) ;
    this.set('imageHeight', parseInt(img.height,0)) ;
    this.set('status',status) ;
    this.endPropertyChanges() ;
    
    if (status == 'loaded') {
      if (this.imageDidLoad) this.imageDidLoad(url) ;
      this.rootElement.src =  url ;
    } else {
      if (this.imageDidFail) this.imageDidFail(url, status) ;
    }
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments) ;
    if (this.rootElement.src) {
      this.set('imageWidth',parseInt(this.rootElement.width,0)) ;
      this.set('imageHeight',parseInt(this.rootElement.height,0)) ;
    }
  }
  
}) ;

// The image cache will create Image objects to preload a set of 
// images.  This will control the number of images being loaded to maximize
// browser throughput.
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
        this._imgTimeout = setTimeout(this.loadNextImage.bind(this),100) ;
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