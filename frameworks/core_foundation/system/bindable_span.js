sc_require('views/template');

/** @private
  @class

  SC._BindableSpan is a private view created by the Handlebars {{bind}} helpers
  that is used to keep track of bound properties.

  Every time a property is bound using a {{mustache}}, an anonymous subclass of
  SC._BindableSpan is created with the appropriate sub-template and context
  set up. When the associated property changes, just the template for this view
  will re-render.
*/
SC._BindableSpan = SC.TemplateView.extend({
  /**
   The type of HTML tag to use. To ensure compatibility with
   Internet Explorer 7, a <span> tag is used to ensure that inline elements are
   not rendered with display: block.

   @property {String}
  */
  tagName: 'span',

  /**
    The function used to determine if the +displayTemplate+ or
    +inverseTemplate+ should be rendered. This should be a function that takes
    a value and returns a Boolean.

    @property {Function}
  */
  shouldDisplayFunc: null,

  /**
    Whether the template rendered by this view gets passed the context object
    of its parent template, or gets passed the value of retrieving +property+
    from the previous context.

    For example, this is YES when using the {{#if}} helper, because the template
    inside the helper should look up properties relative to the same object as
    outside the block. This would be NO when used with +{{#with foo}}+ because
    the template should receive the object found by evaluating +foo+.

    @property {Boolean}
  */
  preserveContext: NO,

  /**
    The template to render when +shouldDisplayFunc+ evaluates to YES.

    @property {Function}
  */
  displayTemplate: null,

  /**
    The template to render when +shouldDisplayFunc+ evaluates to NO.

    @property {Function}
  */
  inverseTemplate: null,

  /**
    The key to look up on +previousContext+ that is passed to
    +shouldDisplayFunc+ to determine which template to render.

    In addition, if +preserveContext+ is NO, this object will be passed to the
    template when rendering.

    @property {String}
  */
  property: null,

  /**
    Determines which template to invoke, sets up the correct state based on
    that logic, then invokes the default SC.TemplateView +render+
    implementation.

    This method will first look up the +property+ key on +previousContext+,
    then pass that value to the +shouldDisplayFunc+ function. If that returns
    YES, the +displayTemplate+ function will be rendered to DOM. Otherwise,
    +inverseTemplate+, if specified, will be rendered.

    For example, if this SC._BindableSpan represented the {{#with foo}} helper,
    it would look up the +foo+ property of its context, and +shouldDisplayFunc+
    would always return true. The object found by looking up +foo+ would be
    passed to +displayTemplate+.

    @param {SC.RenderContext} renderContext}
  */
  render: function(renderContext) {
    var shouldDisplay = this.get('shouldDisplayFunc'),
        property = this.get('property'),
        preserveContext = this.get('preserveContext'),
        context = this.get('previousContext');

    var inverseTemplate = this.get('inverseTemplate'),
        displayTemplate = this.get('displayTemplate');

    var result = context.getPath(property);

    // First, test the conditional to see if we should
    // render the template or not.
    if (shouldDisplay(result)) {
      this.set('template', displayTemplate);

      // If we are preserving the context (for example, if this
      // is an #if block, call the template with the same object.
      if (preserveContext) {
        this.set('context', context);
      } else {
      // Otherwise, determine if this is a block bind or not.
      // If so, pass the specified object to the template
        if (displayTemplate) {
          this.set('context', result);
        } else {
        // This is not a bind block, just push the result of the
        // expression to the render context and return.
          renderContext.push(Handlebars.Utils.escapeExpression(result));
          return;
        }
      }
    } else if (inverseTemplate) {
      this.set('template', inverseTemplate);

      if (preserveContext) {
        this.set('context', context);
      } else {
        this.set('context', result);
      }
    } else {
      this.set('template', function() { return ''; });
    }

    return sc_super();
  },

  /**
    Called when the property associated with this <span> changes.

    We destroy all registered children, then render the view again and insert
    it into DOM.
  */
  rerender: function() {
    var idx, len, childViews, childView;

    childViews = this.get('childViews');
    len = childViews.get('length');
    for (idx = len-1; idx >= 0; idx--){
      childView = childViews[idx];
      childView.$().remove();
      childView.removeFromParent();
      childView.destroy();
    }

    var context = this.renderContext(this.get('tagName'));
    var elem;
    this.renderToContext(context);

    elem = context.element();
    this.$().replaceWith(elem);
    this.set('layer', elem);
    this._notifyDidCreateLayer();
  }
});

