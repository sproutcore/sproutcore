// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/view') ;

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
  
  /**
    Optional path name for the content view.  Set this to a property path 
    pointing to the view you want to display.  This will automatically change
    the content view for you.  If you pass a single property name (e.g.
    "myView") then the container view will look up the property on its own 
    page object.  If you pass a full property name 
    (e.g. "MyApp.anotherPage.anotherView"), then the path will be followed 
    from the top-level.
    
    @property {String, SC.View}
  */
  nowShowing: null,

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
    this.removeAllChildren() ;
    if (newContent) this.appendChild(newContent) ;
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
    Invoked whenever the nowShowing property changes.  This will try to find
    the new content if possible and set it.  If you set nowShowing to an 
    empty string or null, then the current content will be cleared.
    
    If you set the content manually, the nowShowing property will be set to
    SC.CONTENT_SET_DIRECTLY
  */
  nowShowingDidChange: function() {
    var nowShowing = this.get('nowShowing') ;
    var content = null;
    //its a property path
    if(SC.typeOf(nowShowing) === SC.T_STRING){
      // if nowShowing was set because the content was set directly, then 
      // do nothing.
      if (nowShowing === SC.CONTENT_SET_DIRECTLY) return ;

      // otherwise, if nowShowing is a non-empty string, try to find it...
      if (nowShowing && nowShowing.length>0) {
        if (nowShowing.indexOf('.')>0) {
          content = SC.objectForPropertyPath(nowShowing, null);
        } else {
          content = SC.objectForPropertyPath(nowShowing, this.get('page'));
        }
      }
    }else{ //its a view
      content = nowShowing;
    }

    
    // only allow views
    if (content && !(content instanceof SC.View)) content = null;
    
    // set content
    this.set('contentView', content) ;
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
