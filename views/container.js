// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

/** 
  @class
  
  A container view will place the view of its content property inside
  of itself as its only child.  You can override this with a custom
  replaceContent() method if you want to do something different when the
  content changes.
  
  @extends SC.View

*/
SC.ContainerView = SC.View.extend(
  /** @scope SC.ContainerView.prototype */
  {
  
  /** change this property value to replace the content of the container.
      @type SC.View
  */
  content: null,
  
  /** @private */
  contentBindingDefault: SC.Binding.Single,
  
  /** 
    define an outlet named rootView to use that view as the container.
    
    Normally container view will set its own child views to the content you
    set. Instead, you can set the rootView property to point to a child view 
    of the container and the child views in that view will be changed instead.
    
    @type SC.View
  */
  rootView: null,

  /**
    Replaces any child views with the passed new content.  
    
    This method is automatically called whenever your content property 
    changes.  You can override it if you want to provide some behavior other
    than the default.
    
    @param {SC.View} newContent the new content view or null.
  */
  replaceContent: function(newContent) {
    var containerView = this.get('rootView') || this ;
    containerView.clear() ;
    var newView = newContent ;
    
    if (newView) {
      newView.viewFrameWillChange() ;
      containerView.appendChild(newView) ;
      newView.viewFrameDidChange() ;
    }
  },
  
  _contentObserver: function() {
    this.replaceContent(this.get('content'));
  }.observes('content')
  
}) ;
