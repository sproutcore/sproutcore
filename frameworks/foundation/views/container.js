// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** 
  @class
  
  A container view will display its "content" view as its only child.  You can
  use a container view to easily swap out views on your page.  In addition to
  displaying the actual view in the content property, you can also set the 
  nowShowing property to the property path of a view in your page and the
  view will be found and swapped in for you.
  
  If you want to change the way the container view swaps in your new view, 
  override the replaceContent() method.
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.ContainerView = SC.View.extend(
/** @scope SC.ContainerView.prototype */ {

  classNames: ['sc-container-view'],
  
  renderDelegateName: 'containerRenderDelegate',
  
  /**
    Optional path name for the content view.  Set this to a property path
    pointing to the view you want to display.  This will automatically change
    the content view for you. If you pass a relative property path or a single
    property name, then the container view will look for it first on its page
    object then relative to itself. If you pass a full property name
    (e.g. "MyApp.anotherPage.anotherView"), then the path will be followed
    from the top-level.
    
    @property {String, SC.View}
  */
  nowShowing: null,

  /**
    Option that attempts to reuse views that are appended to the container.
    This will work correctly for any instantiated views or views that have
    a path.

    It will destroy any anonymous views (SC.LabelView) it has created if another
    anonymous view of the same type is set to show.

    @property {Boolean}
  */
  cacheViews: NO,

  /** 
    The content view to display.  This will become the only child view of
    the view.  Note that if you set the nowShowing property to any value other
    than 'null', the container view will automatically change the contentView
    to reflect view indicated by the value.
    
    @property {SC.View}
  */
  contentView: null,
  
  /** @private */
  contentViewBindingDefault: SC.Binding.single(),
  
  /**
    Replaces any child views with the passed new content.  
    
    This method is automatically called whenever your contentView property 
    changes.  You can override it if you want to provide some behavior other
    than the default.
    
    @param {SC.View} newContent the new content view or null.
  */
  replaceContent: function(newContent) {
    var cacheViews = this.get('cacheViews'),
      children;

    if (cacheViews) {
      
      if (children && children.contains(newContent)) {
        newContent.set('isVisible',YES);
      } else if (newContent) {
        this.appendChild(newContent) ; 
      }
    } else {
      this.removeAllChildren() ;
      if (newContent) this.appendChild(newContent) ;  
    }
  },

  /** @private */
  createChildViews: function() {
    // if contentView is defined, then create the content
    var view = this.get('contentView') ;
    if (view) {
      view = this.contentView = this.createChildView(view) ;
      this.childViews = [view] ;
    } 
  },
  
  _cache: null,

  init: function () {
    if (this.get('cacheViews')) this._cache = {};
    sc_super();
  },
  
  /**
    When a container view awakes, it will try to find the nowShowing, if 
    there is one, and set it as content if necessary.
  */
  awake: function() {
    sc_super();
    var nowShowing = this.get('nowShowing') ;
    if (nowShowing && nowShowing.length>0) this.nowShowingDidChange();
  },

  /**
    Clean out the cache
  */
  destroy: function () {
    if (this.get('cacheViews') && this._cache) this._cache = null;
    sc_super();
  },
  
  /**
    Invoked whenever the nowShowing property changes.  This will try to find
    the new content if possible and set it.  If you set nowShowing to an 
    empty string or null, then the current content will be cleared.
    
    If you set the content manually, the nowShowing property will be set to
    SC.CONTENT_SET_DIRECTLY
  */
  nowShowingDidChange: function() {
    // This code turns this.nowShowing into a view object by any means necessary.
    
    var content = this.get('nowShowing'), viewToDestroy, cacheViews = this.get('cacheViews'),
      nowShowing = this.get('nowShowing'), children = this.get('childViews'),
      cache = this._cache, cacheNowShowing = cache ? cache[nowShowing] : null;
    
    // If nowShowing was changed because the content was set directly, then do nothing.
    if (content === SC.CONTENT_SET_DIRECTLY) return ;

    // check if this already exists in the cache (strings) or the childViews (instantiated) already
    if (cacheViews && (cacheNowShowing || children.contains(nowShowing))) {
      if (cacheNowShowing && cacheNowShowing !== content) {
        /**
          This will only trigger for uninstantiated views because I'm unable to get a unique
          id from them since the toString method returns a non-guid string
        */

        // kill the old view
        if (cacheNowShowing.destroy) cacheNowShowing.destroy();
        // remove the pointer
        delete this._cache[nowShowing];
      } else {
        nowShowing.set('isVisible',NO);
        this.set('contentView',cacheNowShowing);
        return;
      }
    }

    if (!cacheViews) {
      // Take note now if we need to destroy the current contentView
      viewToDestroy = (this._instantiatedLastView === YES) ? this.get('contentView') : null;
      // Reset for next time
      this._instantiatedLastView = NO;
    }

    // If it's a string, try to turn it into the object it references...
    if (SC.typeOf(content) === SC.T_STRING && content.length > 0) {
      if (content.indexOf('.') > 0) {
        content = SC.objectForPropertyPath(content);
      } else {
        var tempContent = this.getPath(content);
        content = SC.kindOf(tempContent, SC.CoreView) ? tempContent : SC.objectForPropertyPath(content, this.get('page'));
      }
    }
    
    // If it's an uninstantiated view, then attempt to instantiate it.
    // (Uninstantiated views have a create() method; instantiated ones do not.)
    if (SC.typeOf(content) === SC.T_CLASS) {
      if (content.kindOf(SC.CoreView)) {
        content = this.createChildView(content);
        this._instantiatedLastView = YES;
      } 
      else content = null;
    } 
    
    // If content has not been turned into a view by now, it's hopeless.
    if (content && !(content instanceof SC.CoreView)) content = null;

    if (cacheViews && content) this._cache[nowShowing] = content;
    // Sets the content.
    this.set('contentView', content) ;

    // If we need to cleanup the previous view, do so
    if(viewToDestroy && !cacheViews) viewToDestroy.destroy();
    
  }.observes('nowShowing'),
  
  /**
    Invoked whenever the content property changes.  This method will simply
    call replaceContent.  Override replaceContent to change how the view is
    swapped out.
  */
  contentViewDidChange: function() {
    this.replaceContent(this.get('contentView'));
  }.observes('contentView')
  
}) ;
