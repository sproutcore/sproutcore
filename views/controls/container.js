// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

/** 
  @class
  
  A container view will display its "content" view as its only child.  You can
  use a container view to easily swap out views on your page.  In addition to
  displaying the actual view in the content property, you can also set the 
  nowShowing property to the property path of a view in your page and the
  view will be found and swapped in for you.
  
  If you want to change the way the container view swaps in your new view, 
  override the replaceContent() method.
  
*/
SC.ContainerView = SC.View.extend(
/** @scope SC.ContainerView.prototype */ {

  styleClass: ['sc-container-view'],
  
  /**
    Optional path name for the content view.  Set this to a property path 
    pointing to the view you want to display.  This will automatically change
    the content view for you.  If you pass a single property name (e.g.
    "myView") then the container view will look up the property on its own 
    page object.  If you pass a full property name 
    (e.g. "MyApp.anotherPage.anotherView"), then the path will be followed 
    from the top-level.
    
    @property {String}
  */
  nowShowing: null,

  /** 
    The content view to display.  This will become the only child view of
    the view.
    
    @property {SC.View}
  */
  content: null,
  
  /** @private */
  contentBindingDefault: SC.Binding.single(),
  
  /**
    Replaces any child views with the passed new content.  
    
    This method is automatically called whenever your content property 
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
    
    // if content is defined, then create the content
    var content = this.get('content'), nowShowing ;
    if (content) {
      content = this.createChildView(content) ;
      this.beginPropertyChanges()
        .set('content', content).set('childViews', [content])
      .endPropertyChanges();
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
    
    // if nowShowing was set because the content was set directly, then 
    // do nothing.
    if (nowShowing === SC.CONTENT_SET_DIRECTLY) return ;
    
    // otherwise, if nowShowing is a non-empty string, try to find it...
    var content = null;
    if (nowShowing && nowShowing.length>0) {
      if (nowShowing.indexOf('.')>0) {
        content = SC.objectForPropertyPath(nowShowing, null);
      } else {
        content = SC.objectForPropertyPath(nowShowing, this.get('page'));
      }
    }
    
    // only allow views
    if (content && !(content instanceof SC.View)) content = null;
    
    // set content
    this.set('content', content) ;
  }.observes('nowShowing'),
  
  /**
    Invoked whenever the content property changes.  This method will simply
    call replaceContent.  Override replaceContent to change how the view is
    swapped out.
  */
  contentDidChange: function() {
    this.replaceContent(this.get('content'));
  }.observes('content')
  
}) ;
