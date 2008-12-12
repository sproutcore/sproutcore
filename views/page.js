// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/**
  @class SC.Page

  A Page object is used to store a set of views that can be lazily configured
  as needed.  The page object works by overloading the get() method.  The
  first time you try to get the page
  
  @extends SC.Object
*/
SC.Page = SC.Object.extend( /** @scope SC.Page.prototype */ {
  
  get: function(key) {
    var value = this[key] ;
    if (value && value.isClass) {
      this[key] = value = value.create({ page: this }) ;
      if (!this.get('inDesignMode')) value.awake() ;
      return value ;
    } else return sc_super() ;
  },
  
  /**
    Finds all views defined on this page instances and builds them.  This is 
    a quick, brute force way to wake up all of the views in a page object.  It
    is not generally recommended. Instead, you should use get() or getPath() 
    to retrieve views and rely on the lazy creation process to set them up.
    
    @return {SC.Page} receiver
  */
  awake: function() {
    // step through all views and build them
    for(var key in this) {
      if (!this.hasOwnProperty(key)) continue ;
      var value = this[key] ;
      if (value && value.isViewClass) {
        this[key] = value = value.create({ page: this }) ;
      }
    }
    return this;
  },

  /**
    Returns the named property unless the property is a view that has not yet
    been configured.  In that case it will return undefined.  You can use this
    method to safely get a view without waking it up.
  */
  getIfConfigured: function(key) {
    var ret = this[key] ;
    return (ret && ret.isViewClass) ? null : this.get(key);
  },

  /**
    Applies a localization to every view builder defined on the page.  You must call this before you construct a view to apply the localization.
  */
  loc: function(locs) {
    for(var key in locs) {
      if (!locs.hasOwnProperty(key)) continue ;
      var view = this[key] ;
      if (!view || !view.isViewClass) continue ;
      view.loc(locs[key]);
    }
    return this ;
  },
  
  //needsDesigner: YES,
  
  //inDesignMode: YES
    
}) ;

// ..........................................................
// SUPPORT FOR LOADING PAGE DESIGNS
// 

/** Calling design() on a page is the same as calling create() */
SC.Page.design = SC.Page.create ;

/** Calling localization returns passed attrs. */
SC.Page.localization = function(attrs) { return attrs; };


