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
    context
      .id(this.layerId)
      .setClass(this.calculateClasses())
      .addStyle(this.layoutStyle);
    
    if (this.backgroundColor) {
      context.addStyle('backgroundColor', this.backgroundColor);
    }
    
    this.resetChanges();
  },
  
  update: function() {
    var elem = this.$();
    
    elem
      .setClass(this.calculateClasses())
      .css(this.layoutStyle);
    
    if (this.didChange('backgroundColor')) {
      elem.css('backgroundColor', this.backgroundColor);
    }
    
    this.resetChanges();
  },
  
  calculateClasses: function() {
    var classes = {},
        classNames = this.classNames,
        oldClassNames = this._oldClassNames || [],
        l = classNames.length,
        cursor, i;
    
    for (i=0; i<l; i++) {
      classes[classNames[i]] = YES;
    }
    
    l = oldClassNames.length;
    for (i=0; i<l; i++) {
      if (classNames.indexOf(oldClassNames[i]) === -1) {
        classes[oldClassNames[i]] = NO;
      }
    }
    
    // these are resiliant to updates...
    if (this.didChange('isTextSelectable')) classes['allow-select'] = this.isTextSelectable;
    if (this.didChange('isEnabled')) classes['disabled'] = !this.isEnabled;
    if (this.didChange('isVisible')) classes['hidden'] = !this.isVisible;
    if (this.didChange('isFirstResponder')) classes['focus'] = this.isFirstResponder;
    if (this.didChange('hasStaticLayout')) classes['sc-static-layout'] = this.hasStaticLayout;
    if (cursor = this.cursor) classes[cursor.get('className')] = YES;
    
    this._oldClassNames = classNames;
    return classes;
  }

});

SC.BaseTheme.renderers.view = SC.BaseTheme.renderers.View.create();