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
        level = this.outlineLevel;
    
    this.renderControlRenderer(context);
    
    context.setClass(this.calculateClasses());
    
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
    this.updateControlRenderer();
    this.$().setClass(this.calculateClasses());
    
    this.updateDisclosure();
    this.updateCheckbox();
    this.updateIcon();
    this.updateLabel();
    this.updateRightIcon();
    this.updateCount();
    this.updateBranch();
    
    this.resetChanges();
  },
  
  didAttachLayer: function(layer){
    this._controlRenderer.attachLayer(layer);
    if (this._disclosureRenderer) this._disclosureRenderer.attachLayer(this.provide(".sc-disclosure-view"));
    if (this._checkboxRenderer) this._checkboxRenderer.attachLayer(this.provide(".sc-checkbox-view"));
  },
  
  willDetachLayer: function() {
    this._controlRenderer.detachLayer();
    if (this._disclosureRenderer) this._disclosureRenderer.detachLayer();
    if (this._checkboxRenderer) this._checkboxRenderer.detachLayer();
  },
  
  calculateClasses: function() {
    var classes = {};
    classes[(this.contentIndex % 2 === 0) ? 'even' : 'odd'] = YES;
    if (!SC.none(this.isEnabled) && !this.isEnabled) classes['disabled'] = YES;
    if (this.disclosureState) classes['has-disclosure'] = YES;
    if (!SC.none(this.checkbox)) classes['has-checkbox'] = YES;
    if (this.icon) classes['has-icon'] = YES;
    if (this.rightIcon) classes['has-right-icon'] = YES;
    if (!SC.none(this.branch)) classes['has-branch'] = YES;
    if (this.count) {
      classes['has-count'] = YES;
      var digits = ['zero', 'one', 'two', 'three', 'four', 'five'];
      var valueLength = this.count.toString().length;
      var digitsLength = digits.length;
      var digit = (valueLength < digitsLength) ? digits[valueLength] : digits[digitsLength-1];
      classes[digit + '-digit'] = YES;
    }
    return classes;
  },
  
  renderControlRenderer: function(context) {
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._controlRenderer.render(context);
  },
  
  updateControlRenderer: function() {
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._controlRenderer.update();
  },
  
  renderDisclosure: function(context) {
    var state = this.disclosureState, renderer;
    if (!SC.none(state)) {
      if (!(renderer = this._disclosureRenderer)) {
        renderer = this._disclosureRenderer = this.theme.disclosure();
      }
      renderer.attr({
        isActive: this.disclosureActive || NO,
        isEnabled: this.isEnabled,
        isSelected: state,
        state: state
      });
      
      context = context.begin("div").addClass("sc-disclosure-view");
      renderer.render(context);
      context = context.end();
    }
  },
  
  renderDisclosureViaQuery: function() {
    var context = SC.RenderContext();
    this.renderDisclosure(context);
    this.applyContextToLayer(context, this.$(".sc-outline"));
    this._disclosureRenderer.attachLayer(this.provide(".sc-disclosure-view"));
  },
  
  updateDisclosure: function() {
    var renderer, newRenderer = NO;
    if (this.didChange('disclosureState')) {
      // acquire the renderer
      if (!(renderer = this._disclosureRenderer)) {
        renderer = this._disclosureRenderer = this.theme.disclosure();
        newRenderer = YES;
      }
      
      renderer.attr({
        isActive: this.disclosureActive || NO,
        isEnabled: this.isEnabled,
        isSelected: this.disclosureState,
        state: this.disclosureState
      });
      
      // needs to create/update DOM
      if (!SC.none(this.disclosureState)) {
        if (!newRenderer) {
          renderer.update();
        } else {
          this.renderDisclosureViaQuery();
        }
      }
      // needs to destroy DOM
      else {
        if (!newRenderer) {
          this._disclosureRenderer.detachLayer();
          this.$(".sc-disclosure-view").remove(); // remove from DOM
          this._disclosureRenderer = null;
        }
      }
    }
  },
  
  renderCheckbox: function(context) {
    var state = this.checkbox, renderer;
    if (!SC.none(state)) {
      if (!(renderer = this._checkboxRenderer)) {
        renderer = this._checkboxRenderer = this.theme.checkbox();
      }
      renderer.attr({
        ariaValue: state ? "true" : "false",
        isActive: this.checkboxActive || NO,
        isEnabled: this.isEnabled && this.contentIsEditable,
        isSelected: state,
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
        ariaValue: this.checkbox ? "true" : "false",
        isActive: this.checkboxActive || NO,
        isEnabled: this.isEnabled && this.contentIsEditable,
        isSelected: this.checkbox,
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
    this.$("label")[0].innerHTML = label;
  },
  
  renderRightIcon: function(context) {
    if (this.rightIcon) {
      this.renderIcon(context, this.rightIcon, "right-icon");
    }
  },
  
  updateRightIcon: function() {
    if (this.rightIcon) {
      this.updateIcon(this.rightIcon, "right-icon");
    }
  },
  
  renderCount: function(context) {
    var count = this.count;
    if (!SC.none(count) && (count !== 0)) {
      context.push(
        '<span class="count"><span class="inner">',
          count.toString(),
        '</span></span>'
      );
    }
  },
  
  updateCount: function() {
    var count = this.count,
        cq = this.$(".count");
    if (!SC.none(count) && (count !== 0)) {
      cq.find(".inner").text(count.toString());
    } else if (cq.size() > 0) {
      cq[0].parentNode.removeChild(cq[0]);
    }
  },
  
  renderBranch: function(context) {
    var branch = this.branch;
    if (!SC.none(branch)) {
      context.push('<span class="branch ' + (branch ? 'branch-visible' : 'branch-hidden') + '">&nbsp;</span>');
    }
  },
  
  updateBranch: function() {
    var branch = this.branch;
    if (!SC.none(branch)) {
      var elem = this.$("span.branch");
      elem.setClass('branch-visible', branch);
      elem.setClass('branch-hidden', !branch);
    }
  }
  
});

SC.BaseTheme.renderers.listItem = SC.BaseTheme.renderers.ListItem.create();