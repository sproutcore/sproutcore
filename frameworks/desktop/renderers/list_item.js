// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/
SC.BaseTheme.renderers.ListItem = SC.Renderer.extend({
  
  init: function(settings) {
    this._controlRenderer = this.theme.control();
    this.attr(settings);
  },
  
  render: function(context) {
    var indent = this.outlineIndent,
        level = this.outlineLevel,
        classes = [];
    
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._controlRenderer.render(context);
    
    classes.push((this.contentIndex % 2 === 0) ? 'even' : 'odd');
    if (!this.isEnabled) classes.push('disabled');
    if (this.disclosureState) classes.push('has-disclosure');
    if (this.checkbox) classes.push('has-checkbox');
    if (this.icon) classes.push('has-icon');
    if (this.rightIcon) classes.push('has-right-icon');
    if (this.count) {
      classes.push('has-count');
      var digits = ['zero', 'one', 'two', 'three', 'four', 'five'];
      var valueLength = this.count.toString().length;
      var digitsLength = digits.length;
      var digit = (valueLength < digitsLength) ? digits[valueLength] : digits[digitsLength-1];
      classes.push(digit + '-digit');
    }
    context.addClass(classes);
    
    context = context.begin("div").addClass("sc-outline");
    
    if (level>=0 && indent>0) {
      context.addStyle("left", indent * (level+1));
    }
    
    this.renderDisclosure(context);
    this.renderCheckbox(context);
    this.renderIcon(context);
    this.renderLabel(context);
    this.renderRightIcon(context);
    this.renderCount(context);
    this.renderBranch(context);
    
    context = context.end(); // end outline
  },
  
  update: function() {
    var classes = {};
    
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._controlRenderer.update();
    
    classes[(this.contentIndex % 2 === 0) ? 'even' : 'odd'] = YES;
    if (!this.isEnabled) classes['disabled'] = YES;
    if (this.disclosureState) classes['has-disclosure'];
    if (this.checkbox) classes['has-checkbox'] = YES;
    if (this.icon) classes['has-icon'] = YES;
    if (this.rightIcon) classes['has-right-icon'] = YES;
    if (this.count) {
      classes['has-count'] = YES;
      var digits = ['zero', 'one', 'two', 'three', 'four', 'five'];
      var valueLength = this.count.toString().length;
      var digitsLength = digits.length;
      var digit = (valueLength < digitsLength) ? digits[valueLength] : digits[digitsLength-1];
      classes[digit + '-digit'] = YES;
    }
    this.$().setClass(classes);
    
    this.updateDisclosure();
    this.updateCheckbox();
    this.updateIcon();
    this.updateLabel();
    this.updateRightIcon();
    this.updateCount();
    this.updateBranch();
  },
  
  didAttachLayer: function(layer){
    this._controlRenderer.attachLayer(layer);
    if (this._disclosureRenderer) this._disclosureRenderer.attachLayer(layer);
    if (this._checkboxRenderer) this._checkboxRenderer.attachLayer(this.provide("div"));
  },
  
  willDetachLayer: function() {
    this._controlRenderer.detachLayer();
    if (this._disclosureRenderer) this._disclosureRenderer.detachLayer();
    if (this._checkboxRenderer) this._checkboxRenderer.detachLayer();
  },
  
  renderDisclosure: function(context) {
    var state = this.disclosureState, renderer;
    if (state) {
      if (!(renderer = this._disclosureRenderer)) {
        renderer = this._disclosureRenderer = this.theme.disclosure();
      }      
      renderer.attr({
        state: this.disclosureState
      });
      renderer.render(context);
    }
  },
  
  updateDisclosure: function() {
    var renderer = this._disclosureRenderer;
    if (renderer) {
      renderer.attr({
        state: this.disclosureState
      });
      renderer.update();
    }
  },
  
  renderCheckbox: function(context) {
    var state = this.checkbox, renderer;
    if (state) {
      if (!(renderer = this._checkboxRenderer)) {
        renderer = this._checkboxRenderer = this.theme.checkbox();
      }
      
      renderer.attr({
        ariaValue: state,
        isEnabled: this.isEnabled && this.contentIsEditable,
        name: SC.guidFor(this)
      });
      
      context = context.begin("div").addClass("sc-checkbox-view");
      renderer.render(context);
      context = context.end();
    }
  },
  
  updateCheckbox: function(context) {
    var renderer = this._checkboxRenderer;
    if (renderer) {
      renderer.attr({
        ariaValue: this.checkbox,
        isEnabled: this.isEnabled && this.contentIsEditable,
        name: SC.guidFor(this)
      });
      renderer.update();
    }
  },
  
  renderIcon: function(context, icon, iconClass) {
    icon = icon || this.icon;
    if (icon) {
      var url = null, className = null , classArray=[];
      if (icon && SC.ImageView.valueIsUrl(icon)) {
        className = '';
        url = icon;
      } else {
        className = icon;
        url = SC.BLANK_IMAGE_URL;
      }

      classArray.push(className, iconClass || "icon");
      context.begin('img').addClass(classArray).attr('src', url).end();
    }
  },
  
  updateIcon: function(iconClass) {
    
  },
  
  renderLabel: function(context) {
    var label = this.escapeHTML ? SC.RenderContext.escapeHTML(this.label) : this.label;
    context.push("<label>", label, "</label>");
  },
  
  updateLabel: function() {
    var label = this.escapeHTML ? SC.RenderContext.escapeHTML(this.label) : this.label;
    this.$("label")[0].innerHtml = label;
  },
  
  renderRightIcon: function(context) {
    this.renderIcon(context, this.rightIcon, "right-icon");
  },
  
  updateRightIcon: function() {
    this.updateIcon(this.rightIcon, "right-icon");
  },
  
  renderCount: function(context) {
    var count = this.count;
    if (count) {
      context.push(
        '<span class="count"><span class="inner">',
          count.toString(),
        '</span></span>'
      );
    }
  },
  
  updateCount: function() {
    var count = this.count;
    if (count) {
      this.$(".count .inner").text(count.toString());
    }
  },
  
  renderBranch: function(context) {
    var hasBranch = this.hasBranch;
    if (hasBranch) {
      context.push('<span class="' + (hasBranch ? 'branch-visible' : 'branch-hidden') + '">&nbsp;</span>');
    }
  },
  
  updateBranch: function() {
    var hasBranch = this.hasBranch;
    if (hasBranch) {
      var elem = this.$("span.branch");
      elem.setClass('branch-visible', hasBranch);
      elem.setClass('branch-hidden', !hasBranch);
    }
  }
  
});

SC.BaseTheme.renderers.listItem = SC.BaseTheme.renderers.ListItem.create();