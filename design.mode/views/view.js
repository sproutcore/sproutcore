// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view');

SC.View._create = SC.View.create; 

SC.View.mixin({

  /**
    In design mode, save the designAttributes for any views created with the 
    design method.
  */
  design: function(attrs) {
    if (!attrs) attrs = {} ;
    var ret = this.extend(attrs) ;  
    ret.designAttributes = attrs;
    return ret ;
  },

  /**
    When creating a view, create peer designer if we have designAttributes and
    the page indicates that it needs a designer.
  */
  create: function() {

    // create the view
    var ret = SC.View._create.apply(this, arguments); 

    // add designer if page is in design mode
    var page = ret.get('page');
    if (this.designAttributes && page && page.get('needsDesigner')) {
      var cur = this;
      while(cur && !cur.Designer) cur = cur.superclass;
      var DesignerClass = (cur) ? cur.Designer : SC.View.Designer;
      ret.designer = DesignerClass.create({
        attributes: this.designAttributes,
        localized: this.localizedAttributes,
        view: ret,
        viewClass: this
      });
    }
    return ret ;
  },

  applyLocalizedAttributes: function(loc) {
    this.localizedAttributes = loc ;
    SC.mixin(this.prototype, loc) ;
  }
});



/** 
  If the view has a designer, give it an opportunity to handle an event 
  before passing it on to the main view.
*/
SC.View.prototype.tryToPerform = function(methodName, arg1, arg2) {
  if (this.designer) {
    return this.designer.tryToPerform(methodName, arg1, arg2);
  } else {
    return SC.Object.prototype.tryToPerform.apply(this, arguments);
  }
} ;
