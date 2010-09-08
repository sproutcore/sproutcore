// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require("renderers/renderer");

/** @class
  
  Provides for rendering the default properties of SC.View

  @extends SC.Renderer
  @since SproutCore 1.1
*/
SC.BaseTheme.renderers.View = SC.Renderer.extend({
  
  render: function(context) {
    context.resetClassNames();
    
    context
      .id(this.layerId)
      .setClass(this.calculateClassNames());
    
    if(this.role){
      context.attr('role', this.role);
      if(!this.isEnabled) context.attr('aria-disabled', 'true');
    }
    
    if (this.backgroundColor) {
      context.addStyle('backgroundColor', this.backgroundColor);
    }
    
    this.resetChanges();
  },
  
  update: function() {
    var elem = this.$();
    
    // and to maintain compatibility, we have to blow away the class names
    // SC2.0: consider breaking this compatibility for SC 2.0
    elem.clearClassNames().setClass(this.calculateClassNames());
    
    if (this.didChange('backgroundColor')) {
      elem.css('backgroundColor', this.backgroundColor);
    }
    
    this.resetChanges();
  },
  
  calculateClassNames: function() {
    var classNames = this.classNames;
    
    classNames['allow-select'] = this.isTextSelectable;
    classNames['disabled'] = !this.isEnabled;
    classNames['hidden'] = !this.isVisible;
    classNames['focus'] = this.isFirstResponder;
    classNames['sc-static-layout'] = this.hasStaticLayout;
    
    if (this.cursor) {
      classNames[this.cursor.get('className')] = YES;
      this._lastCursor = this.cursor.get('className');
    } else if (this._lastCursor) {
      classNames[this._lastCursor] = NO;
    }
    
    this.classNames = classNames;
    return classNames;
  }

});

SC.BaseTheme.renderers.view = SC.BaseTheme.renderers.View.create();