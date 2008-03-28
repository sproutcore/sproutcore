// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/tab') ;
require('foundation/routes') ;
require('views/button') ;

// A WorkspaceView is a type of tab view that looks for certain elements
// inside the content object and then places those into similarly named
// elements inside the receiver view.  (You can extend this with more
// element areas by overriding the areas property.)
SC.WorkspaceView = SC.TabView.extend({
  
  // override this if you need with the areas you want it to look for.  You
  // must have elements with the class '.detail.NAME' inside the receiver
  // view to match.
  areas: ['head','master','detail','dialog','tail'],
  
  // override this with the names of your standard workspaces.  Any names
  // found here will be converted into code that looks like this:
  //
  // fooTab: NAMESPACE.fooWorkspace.outletFor('#foo-workspace'),
  // fooButton: SC.ButtonView.outletFor('#foo')
  //
  workspaces: [],
  namespace: null,
  
  // used internally to configure the workspace view when you create it. 
  // be sure to add any tabs/buttons you want.
  elements: function() {
    var view = this ;
    var ret = [] ;
    this.areas.each(function(area) {
      var el = view.$C(area) ;
      if (el) { 
        view[area + 'Element'] = SC.ContainerView.viewFor(el); 
        ret.push(el) ;
      }
    }) ;
    return ret ;    
  },
  
  replaceContent: function(newContent) {
    var view = this ;
    this.areas.each(function(area) {
      var key = area + 'Element' ;
      var newElement = newContent.get(key) ;      
      var viewArea = view[key] ;
      
      // remove existing children
      if (viewArea) {
        viewArea.set('content',newElement) ;
      } else {
        console.log('WARNING: could not find view area: ' + key) ;
      }
    }) ;
    
    // if there was a prior content object, notify it that nowShowing has
    // changed.
    if (this._nowShowingContent) {
      this._nowShowingContent.set('nowShowing',null) ;
    }
    newContent.set('nowShowing',this.get('nowShowing')) ;
    this._nowShowingContent = newContent ;
  },
  
  init: function() {
    // before calling super, setup the automatically named workspaces.
    if (this.namespace && this.workspaces && this.workspaces.length > 0) {
      var view = this ; var ns = this.namespace ;
      this.workspaces.each(function(key) {
        key = key.toLowerCase() ;
        var tab = window[ns][key.capitalize() + 'Workspace'] ;
        if (tab && !(view[key + 'Tab'])) {
          tab = tab.viewFor(key + '-workspace') ;
          view[key + 'Tab'] = tab ;
        }
        
        var button = $(key) ;
        if (button) view[key + 'Button'] = SC._WorkspaceButton.viewFor(key,{
          workspace: view, workspaceId: key
        }) ;
      }) ;
    }
    
    // go ahead with the rest of this.
    arguments.callee.base.call(this) ;
    
    this.elements = this.elements() ;
    
    // register workspace route. 
    SC.Routes.addRoute(':workspace',this._showWorkspace.bind(this)) ; 
  },
  
  _showWorkspace: function(params) { 
    if (this._tabs[params.workspace]) {
      this.beginPropertyChanges() ;
      this.set('nowShowing',params.workspace) ;
      this.set('options',params) ;
      this.endPropertyChanges() ;
    } else console.log('workspace not found: ' + params.workspace) ;
  }
  
}) ;

SC._WorkspaceButton = SC.ButtonView.extend({
  workspace: null, workspaceId: null,
  action: function() { SC.Routes.set('location',this.workspaceId); },
  isSelectedObserver: function() {
    var parent = this.parentNode ;
    if (parent) Element.setClassName($(parent),'sel',this.get('isSelected'));
  }.observes('isSelected') 
}),

// Elements that you want to have swapped in and out can be subclassed from
// this.  Or, you can create your own object.  Any elements you want swapped
// in and out need to be configured as a property named 'somethingElement'.
SC.WorkspaceTab = SC.View.extend({

  // ...................................
  // PROPERTIES
  // Override these with your own settings.
  
  // modify to include the areas you want loaded in this element.
  areas: ['head','master','detail','dialog','tail'],

  // the type of view you want your found elements converted into.  If you
  // set this to null, the elements will not be converted.
  viewType: SC.View,

  // Set this to something non-null to show the title in the window.
  title: null,
  
  // this should be the portion of the location the user needs to put after
  // the hash to get this workspace to show again in this configuration.
  location: null,
  
  // this property will be set by the UI when the user types into the search
  // field.  You can observe this property to update your content accordingly.
  filterString: null,

  // if this workspace is visible, then this property will be set to the
  // id used to show this workspace.  It will be set back to null when 
  // the workspace is hidden.
  nowShowing: null,

  // ...................................
  // PRIVATE
  //
  elements: function() {
    var view = this ;
    var ret = [] ;
    this.areas.each(function(area) {
      var el = view.$C(area,1) ;
      if (el) {
        if (this.viewType) el = this.viewType.viewFor(el) ;
        view[area + 'Element'] = el ; ret.push(el) ;
      }
    }) ;
    return ret ;
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments) ;
    this.elements = this.elements() ;
  }
  
}) ;
