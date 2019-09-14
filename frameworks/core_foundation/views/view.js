// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global jQuery*/

sc_require('system/browser');
sc_require('system/event');
sc_require('system/cursor');
sc_require('system/responder');
sc_require('system/theme');

sc_require('system/string');
sc_require('views/view/statechart');


/**
  Default property to disable or enable by default the contextMenu
*/
SC.CONTEXT_MENU_ENABLED = YES;

/**
  Default property to disable or enable if the focus can jump to the address
  bar or not.
*/
SC.TABBING_ONLY_INSIDE_DOCUMENT = NO;

/**
  Tells the property (when fetched with themed()) to get its value from the renderer (if any).
*/
SC.FROM_THEME = "__FROM_THEME__"; // doesn't really matter what it is, so long as it is unique. Readability is a plus.

/** @private - custom array used for child views */
SC.EMPTY_CHILD_VIEWS_ARRAY = [];
SC.EMPTY_CHILD_VIEWS_ARRAY.needsClone = YES;

/**
  @class

*/
SC.CoreView.reopen(
/** @scope SC.View.prototype */ {

  /**
    An array of the properties of this class that will be concatenated when
    also present on subclasses.

    @type Array
    @default ['outlets', 'displayProperties', 'classNames', 'renderMixin', 'didCreateLayerMixin', 'willDestroyLayerMixin', 'classNameBindings', 'attributeBindings']
  */
  concatenatedProperties: ['outlets', 'displayProperties', 'classNames', 'renderMixin', 'didCreateLayerMixin', 'willDestroyLayerMixin', 'classNameBindings', 'attributeBindings'],

  /**
    The WAI-ARIA role of the control represented by this view. For example, a
    button may have a role of type 'button', or a pane may have a role of
    type 'alertdialog'. This property is used by assistive software to help
    visually challenged users navigate rich web applications.

    The full list of valid WAI-ARIA roles is available at:
    http://www.w3.org/TR/wai-aria/roles#roles_categorization

    @type String
    @default null
  */
  ariaRole: null,

  /**
    The aria-hidden role is managed appropriately by the internal view's
    statechart.  When the view is not currently displayed the aria-hidden
    attribute will be set to true.

    @type String
    @default null
    @deprecated Version 1.10
  */
  ariaHidden: null,

  /**
    Whether this view was created by its parent view or not.

    Several views are given child view classes or instances to automatically
    append and remove.  In the case that the view was provided an instance,
    when it removes the instance and no longer needs it, it should not destroy
    the instance because it was created by someone else.

    On the other hand if the view was given a class that it creates internal
    instances from, then it should destroy those instances properly to avoid
    memory leaks.

    This property should be set by any view that is creating internal child
    views so that it can properly remove them later.  Note that if you use
    `createChildView`, this property is set automatically for you.

    @type Boolean
    @see SC.View#createChildView
    @default false
  */
  createdByParent: false,

  /** @deprecated Version 1.11.0 Please use parentView instead. */
  owner: function () {
    //@if(debug)
    SC.warn("Developer Warning: The `owner` property of SC.View has been deprecated in favor of the `parentView`, which is the same value. Please use `parentView`.");
    //@endif
    return this.get('parentView');
  }.property('parentView').cacheable(),

  /**
    The current pane.

    @field
    @type SC.Pane
    @default null
  */
  pane: function () {
    var view = this;

    while (view && !view.isPane) { view = view.get('parentView'); }

    return view;
  }.property('parentView').cacheable(),

  /**
    The page this view was instantiated from.  This is set by the page object
    during instantiation.

    @type SC.Page
    @default null
  */
  page: null,

  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.

    @type SC.View
    @default null
  */
  parentView: null,

  /**
    The isVisible property determines if the view should be displayed or not.

    If you also set a transitionShow or transitionHide plugin, then when
    isVisible changes, the appropriate transition will execute as the view's
    visibility changes.

    Note that isVisible can be set to true and the view may still not be
    "visible" in the window.  This can occur if:

      1. the view is not attached to the document.
      2. the view has a view ancestor with isVisible set to false.

    @type Boolean
    @see SC.View#viewState
    @default true
  */
  isVisible: true,
  isVisibleBindingDefault: SC.Binding.bool(),

  // ..........................................................
  // CHILD VIEW SUPPORT
  //

  /**
    Array of child views.  You should never edit this array directly unless
    you are implementing createChildViews().  Most of the time, you should
    use the accessor methods such as appendChild(), insertBefore() and
    removeChild().

    @type Array
    @default []
  */
  childViews: SC.EMPTY_CHILD_VIEWS_ARRAY,

  /**
    Use this property to automatically mix in a collection of mixins into all
    child views created by the view. This collection is applied during createChildView
    @property

    @type Array
    @default null
  */
  autoMixins: null,

  // ..........................................................
  // LAYER SUPPORT
  //

  /**
    Returns the current layer for the view.  The layer for a view is only
    generated when the view first becomes visible in the window and even
    then it will not be computed until you request this layer property.

    If the layer is not actually set on the view itself, then the layer will
    be found by calling this.findLayerInParentLayer().

    You can also set the layer by calling set on this property.

    @type DOMElement the layer
  */
  layer: function (key, value) {
    if (value !== undefined) {
      this._view_layer = value;

    // no layer...attempt to discover it...
    } else {
      value = this._view_layer;
      if (!value) {
        var parent = this.get('parentView');
        if (parent) { parent = parent.get('layer'); }
        this._view_layer = value = this.findLayerInParentLayer(parent);
      }
    }
    return value;
  }.property('isVisibleInWindow').cacheable(),

  /**
    Get a CoreQuery object for this view's layer, or pass in a selector string
    to get a CoreQuery object for a DOM node nested within this layer.

    @param {String} sel a CoreQuery-compatible selector string
    @returns {SC.CoreQuery} the CoreQuery object for the DOM node
  */
  $: function (sel) {
    var layer = this.get('layer');

    if (!layer) { return SC.$(); }
    else if (sel === undefined) { return SC.$(layer); }
    else { return SC.$(sel, layer); }
  },

  /**
    Returns the DOM element that should be used to hold child views when they
    are added/remove via DOM manipulation.  The default implementation simply
    returns the layer itself.  You can override this to return a DOM element
    within the layer.

    @type DOMElement the container layer
  */
  containerLayer: function () {
    return this.get('layer');
  }.property('layer').cacheable(),

  /**
    The ID to use when trying to locate the layer in the DOM.  If you do not
    set the layerId explicitly, then the view's GUID will be used instead.
    This ID must be set at the time the view is created.

    @type String
    @readOnly
  */
  layerId: function (key, value) {
    if (value) { this._layerId = value; }
    if (this._layerId) { return this._layerId; }
    return SC.guidFor(this);
  }.property().cacheable(),

  /**
    Attempts to discover the layer in the parent layer.  The default
    implementation looks for an element with an ID of layerId (or the view's
    guid if layerId is null).  You can override this method to provide your
    own form of lookup.  For example, if you want to discover your layer using
    a CSS class name instead of an ID.

    @param {DOMElement} parentLayer the parent's DOM layer
    @returns {DOMElement} the discovered layer
  */
  findLayerInParentLayer: function (parentLayer) {
    var id = "#" + this.get('layerId').escapeCssIdForSelector();
    return jQuery(id, parentLayer)[0] || jQuery(id)[0];
  },

  /**
    Returns YES if the receiver is a subview of a given view or if it's
    identical to that view. Otherwise, it returns NO.

    @property {SC.View} view
  */
  isDescendantOf: function (view) {
    var parentView = this.get('parentView');

    if (this === view) { return YES; }
    else if (parentView) { return parentView.isDescendantOf(view); }
    else { return NO; }
  },

  /**
    This method is invoked whenever a display property changes and updates
    the view's content once at the end of the run loop before any invokeLast
    functions run.

    To cause the view to be updated you can call this method directly and
    if you need to perform additional setup whenever the display changes, you
    can override this method as well.

    @returns {SC.View} receiver
  */
  displayDidChange: function () {
    //@if (debug)
    if (SC.LOG_VIEW_STATES) {
      SC.Logger.log('%c%@:%@ — displayDidChange()'.fmt(this, this.get('viewState')), SC.LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    //@endif

    // Don't run _doUpdateContent needlessly, because the view may render
    // before it is invoked, which would result in a needless update.
    if (this.get('_isRendered')) {
      // Legacy.
      this.set('layerNeedsUpdate', true);

      this.invokeOnce(this._doUpdateContent);
    }

    return this;
  },

  /**
    This property has no effect and is deprecated.

    To cause a view to update immediately, you should just call updateLayer or
    updateLayerIfNeeded.  To cause a view to update at the end of the run loop
    before any invokeLast functions run, you should call displayDidChange.

    @deprecated Version 1.10
    @type Boolean
    @test in updateLayer
  */
  layerNeedsUpdate: NO,

  /**
    Updates the view's layer if the view is in a shown state.  Otherwise, the
    view will be updated the next time it enters a shown state.

    This is the same behavior as `displayDidChange` except that calling
    `updateLayerIfNeeded` will attempt to update each time it is called,
    while `displayDidChange` will only attempt to update the layer once per run
    loop.

    @returns {SC.View} receiver
    @test in updateLayer
  */
  updateLayerIfNeeded: function (skipIsVisibleInWindowCheck) {
    //@if(debug)
    if (skipIsVisibleInWindowCheck) {
      SC.warn("Developer Warning: The `skipIsVisibleInWindowCheck` argument of updateLayerIfNeeded is not supported and will be ignored.");
    }
    //@endif
    this._doUpdateContent(false);

    return this;
  },

  /**
    This is the core method invoked to update a view layer whenever it has
    changed.  This method simply creates a render context focused on the
    layer element and then calls your render() method.

    You will not usually call or override this method directly.  Instead you
    should set the layerNeedsUpdate property to YES to cause this method to
    run at the end of the run loop, or you can call updateLayerIfNeeded()
    to force the layer to update immediately.

    Instead of overriding this method, consider overriding the render() method
    instead, which is called both when creating and updating a layer.  If you
    do not want your render() method called when updating a layer, then you
    should override this method instead.

    @returns {SC.View} receiver
  */
  updateLayer: function () {
    this._doUpdateContent(true);

    return this;
  },

  /** @private */
  parentViewDidResize: function () {
    if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
    this.viewDidResize();
  },

  /**
    Override this in a child class to define behavior that should be invoked
    when a parent's view was resized.
   */
  viewDidResize: function () {},

  /**
    Creates a new renderContext with the passed tagName or element.  You
    can override this method to provide further customization to the context
    if needed.  Normally you will not need to call or override this method.

    @returns {SC.RenderContext}
  */
  renderContext: function (tagNameOrElement) {
    return SC.RenderContext(tagNameOrElement);
  },

  /**
    Creates the layer by creating a renderContext and invoking the view's
    render() method.  This will only create the layer if the layer does not
    already exist.

    When you create a layer, it is expected that your render() method will
    also render the HTML for all child views as well.  This method will
    notify the view along with any of its childViews that its layer has been
    created.

    @returns {SC.View} receiver
  */
  createLayer: function () {
    if (!this.get('_isRendered')) {
      this._doRender();
    }

    return this;
  },

  /**
    Destroys any existing layer along with the layer for any child views as
    well.  If the view does not currently have a layer, then this method will
    do nothing.

    If you implement willDestroyLayer() on your view or if any mixins
    implement willDestroLayerMixin(), then this method will be invoked on your
    view before your layer is destroyed to give you a chance to clean up any
    event handlers, etc.

    If you write a willDestroyLayer() handler, you can assume that your
    didCreateLayer() handler was called earlier for the same layer.

    Normally you will not call or override this method yourself, but you may
    want to implement the above callbacks when it is run.

    @returns {SC.View} receiver
  */
  destroyLayer: function () {
    // We allow you to call destroy layer, but you should really detach first.
    if (this.get('isAttached')) {
      this._doDetach();
    }

    if (this.get('_isRendered')) {
      this._doDestroyLayer();
    }

    return this;
  },

  /**
    Destroys and recreates the current layer.  Doing this on a parent view can
    be more efficient than modifying individual child views independently.

    @returns {SC.View} receiver
  */
  replaceLayer: function () {
    var layer, parentNode;

    // If attached, detach and track our parent node so we can re-attach.
    if (this.get('isAttached')) {
      layer = this.get('layer');
      parentNode = layer.parentNode;

      this._doDetach();
    }

    this.destroyLayer().createLayer();

    // Reattach our layer (if we have a parentView this is done automatically).
    if (parentNode && !this.get('isAttached')) { this._doAttach(parentNode); }

    return this;
  },

  /**
    If the parent view has changed, we need to insert this
    view's layer into the layer of the new parent view.
  */
  parentViewDidChange: function () {
    //@if(debug)
    SC.warn("Developer Warning: parentViewDidChange has been deprecated.  Please use the notification methods willAddChild, didAddChild, willRemoveChild or didRemoveChild on the parent or willAddToParent, didAddToParent, willRemoveFromParent or didRemoveFromParent on the child to perform updates when the parent/child status changes.");
    //@endif
  },

  /**
    Set to YES when the view's layer location is dirty.  You can call
    updateLayerLocationIfNeeded() to clear this flag if it is set.

    @deprecated Version 1.10
    @type Boolean
  */
  layerLocationNeedsUpdate: NO,

  /**
    Calls updateLayerLocation(), but only if the view's layer location
    currently needs to be updated.

    @deprecated Version 1.10
    @returns {SC.View} receiver
    @test in updateLayerLocation
  */
  updateLayerLocationIfNeeded: function () {
    //@if(debug)
    SC.warn("SC.View.prototype.updateLayerLocationIfNeeded is no longer used and has been deprecated.  See the SC.View statechart code for more details on attaching and detaching layers.");
    //@endif

    return this;
  },

  /**
    This method is called when a view changes its location in the view
    hierarchy.  This method will update the underlying DOM-location of the
    layer so that it reflects the new location.

    @deprecated Version 1.10
    @returns {SC.View} receiver
  */
  updateLayerLocation: function () {
    //@if(debug)
    SC.warn("SC.View.prototype.updateLayerLocation is no longer used and has been deprecated.  See the SC.View statechart code for more details on attaching and detaching layers.");
    //@endif

    return this;
  },

  /**
    @private

    Renders to a context.
    Rendering only happens for the initial rendering. Further updates happen in updateLayer,
    and are not done to contexts, but to layers.
    Note: You should not generally override nor directly call this method. This method is only
    called by createLayer to set up the layer initially, and by renderChildViews, to write to
    a context.

    @param {SC.RenderContext} context the render context.
  */
  renderToContext: function (context) {
    var mixins, idx, len;

    this.beginPropertyChanges();

    context.id(this.get('layerId'));
    context.setAttr('role', this.get('ariaRole'));

    // Set up the classNameBindings and attributeBindings observers.
    // TODO: CLEAN UP!!
    this._applyClassNameBindings();
    this._applyAttributeBindings(context);

    context.addClass(this.get('classNames'));

    if (this.get('isTextSelectable')) { context.addClass('allow-select'); }

    if (!this.get('isVisible')) {
      context.addClass('sc-hidden');
      context.setAttr('aria-hidden', 'true');
    }

    // Call applyAttributesToContext so that subclasses that override it can
    // insert further attributes.
    this.applyAttributesToContext(context);

    // We pass true for the second argument to support the old style of render.
    this.render(context, true);

    // If we've made it this far and renderChildViews() was never called,
    // render any child views now.
    if (!this._didRenderChildViews) { this.renderChildViews(context); }
    // Reset the flag so that if the layer is recreated we re-render the child views.
    this._didRenderChildViews = false;

    if (mixins = this.renderMixin) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) { mixins[idx].call(this, context, true); }
    }

    this.endPropertyChanges();
  },

  /** Apply the attributes to the context. */
  applyAttributesToContext: function (context) {

  },

  /**
    @private

    Iterates over the view's `classNameBindings` array, inserts the value
    of the specified property into the `classNames` array, then creates an
    observer to update the view's element if the bound property ever changes
    in the future.
  */
  _applyClassNameBindings: function () {
    var classBindings = this.get('classNameBindings'),
        classNames = this.get('classNames'),
        dasherizedClass;

    if (!classBindings) { return; }

    // Loop through all of the configured bindings. These will be either
    // property names ('isUrgent') or property paths relative to the view
    // ('content.isUrgent')
    classBindings.forEach(function (property) {

      // Variable in which the old class value is saved. The observer function
      // closes over this variable, so it knows which string to remove when
      // the property changes.
      var oldClass;

      // Set up an observer on the context. If the property changes, toggle the
      // class name.
      var observer = function () {
        // Get the current value of the property
        var newClass = this._classStringForProperty(property);
        var elem = this.$();

        // If we had previously added a class to the element, remove it.
        if (oldClass) {
          elem.removeClass(oldClass);
          classNames.removeObject(oldClass);
        }

        // If necessary, add a new class. Make sure we keep track of it so
        // it can be removed in the future.
        if (newClass) {
          elem.addClass(newClass);
          classNames.push(newClass);
          oldClass = newClass;
        } else {
          oldClass = null;
        }
      };

      this.addObserver(property.split(':')[0], this, observer);

      // Get the class name for the property at its current value
      dasherizedClass = this._classStringForProperty(property);

      if (dasherizedClass) {
        // Ensure that it gets into the classNames array
        // so it is displayed when we render.
        classNames.push(dasherizedClass);

        // Save a reference to the class name so we can remove it
        // if the observer fires. Remember that this variable has
        // been closed over by the observer.
        oldClass = dasherizedClass;
      }

    }, this);
  },

  /**
    Iterates through the view's attribute bindings, sets up observers for each,
    then applies the current value of the attributes to the passed render buffer.

    @param {SC.RenderBuffer} buffer
  */
  _applyAttributeBindings: function (context) {
    var attributeBindings = this.get('attributeBindings'),
        attributeValue, elem, type;

    if (!attributeBindings) { return; }

    attributeBindings.forEach(function (attribute) {
      // Create an observer to add/remove/change the attribute if the
      // JavaScript property changes.
      var observer = function () {
        elem = this.$();
        var currentValue = elem.attr(attribute);
        attributeValue = this.get(attribute);

        type = typeof attributeValue;

        if ((type === 'string' || type === 'number') && attributeValue !== currentValue) {
          elem.attr(attribute, attributeValue);
        } else if (attributeValue && type === 'boolean') {
          elem.attr(attribute, attribute);
        } else if (attributeValue === NO) {
          elem.removeAttr(attribute);
        }
      };

      this.addObserver(attribute, this, observer);

      // Determine the current value and add it to the render buffer
      // if necessary.
      attributeValue = this.get(attribute);
      type = typeof attributeValue;

      if (type === 'string' || type === 'number') {
        context.setAttr(attribute, attributeValue);
      } else if (attributeValue && type === 'boolean') {
        // Apply boolean attributes in the form attribute="attribute"
        context.setAttr(attribute, attribute);
      }
    }, this);
  },

  /**
    @private

    Given a property name, returns a dasherized version of that
    property name if the property evaluates to a non-falsy value.

    For example, if the view has property `isUrgent` that evaluates to true,
    passing `isUrgent` to this method will return `"is-urgent"`.
  */
  _classStringForProperty: function (property) {
    var split = property.split(':'), className = split[1];
    property = split[0];

    var val = SC.getPath(this, property);

    // If value is a Boolean and true, return the dasherized property
    // name.
    if (val === YES) {
      if (className) { return className; }

      // Normalize property path to be suitable for use
      // as a class name. For exaple, content.foo.barBaz
      // becomes bar-baz.
      return SC.String.dasherize(property.split('.').get('lastObject'));

    // If the value is not NO, undefined, or null, return the current
    // value of the property.
    } else if (val !== NO && val !== undefined && val !== null) {
      return val;

    // Nothing to display. Return null so that the old class is removed
    // but no new class is added.
    } else {
      return null;
    }
  },

  /**
    Your render method should invoke this method to render any child views,
    especially if this is the first time the view will be rendered.  This will
    walk down the childView chain, rendering all of the children in a nested
    way.

    @param {SC.RenderContext} context the context
    @returns {SC.RenderContext} the render context
    @test in render
  */
  renderChildViews: function (context) {
    var cv = this.get('childViews'), len = cv.length, idx, view;
    for (idx = 0; idx < len; ++idx) {
      view = cv[idx];
      if (!view) { continue; }
      context = context.begin(view.get('tagName'));
      view.renderToContext(context);
      context = context.end();
    }

    // Track that renderChildViews was called in case it was called directly
    // in a render method.
    this._didRenderChildViews = true;

    return context;
  },

  /** @private -
    override to add support for theming or in your view
  */
  render: function () { },

  // ..........................................................
  // STANDARD RENDER PROPERTIES
  //

  /**
    A list of properties on the view to translate dynamically into attributes on
    the view's layer (element).

    When the view is rendered, the value of each property listed in
    attributeBindings will be inserted in the element.  If the value is a
    Boolean, the attribute name itself will be inserted.  As well, as the
    value of any of these properties changes, the layer will update itself
    automatically.

    This is an easy way to set custom attributes on the View without
    implementing it through a render or update function.

    For example,

        // ...  MyApp.MyView

        attributeBindings: ['aria-valuenow', 'disabled'],

        'aria-valuenow': function () {
          return this.get('value');
        }.property('value').cacheable(), // adds 'aria-valuenow="{value}"' attribute

        disabled: YES, // adds 'disabled="disabled"' attribute

        // ...

    @type Array
    @default null
  */
  attributeBindings: null,


  /**
    Tag name for the view's outer element.  The tag name is only used when
    a layer is first created.  If you change the tagName for an element, you
    must destroy and recreate the view layer.

    @type String
    @default 'div'
  */
  tagName: 'div',

  /**
    Standard CSS class names to apply to the view's outer element.  These class
    names are used in addition to any defined on the view's superclass.

    @type Array
    @default []
  */
  classNames: [],

  /**
    A list of local property names to translate dynamically into standard
    CSS class names on your view's layer (element).

    Each entry in the array should take the form "propertyName:css-class".
    For example, "isRed:my-red-view" will cause the class "my-red-view" to
    be appended if the property "isRed" is (or becomes) true, and removed
    if it later becomes false (or null/undefined).

    Optionally, you may provide just the property name, in which case it will
    be dasherized and used as the class name.  For example, including
    "isUpsideDown" will cause the view's isUpsideDown property to mediate the
    class "is-upside-down".

    Instead of a boolean value, your property may return a string, which will
    be used as the class name for that entry.  Use caution when returning other
    values; numbers will be appended verbatim and objects will be stringified,
    leading to unintended results such as class="4" or class="Object object".

    Class names mediated by these bindings are used in addition to any that
    you've listed in the classNames property.

    @type Array
  */
  classNameBindings: null,

  /**
    Tool tip property that will be set to the title attribute on the HTML
    rendered element.

    @type String
  */
  toolTip: null,

  /**
    The computed tooltip.  This is generated by localizing the toolTip
    property if necessary.

    @type String
  */
  displayToolTip: function () {
    var ret = this.get('toolTip');
    return (ret && this.get('localize')) ? SC.String.loc(ret) : (ret || '');
  }.property('toolTip', 'localize').cacheable(),

  /**
    Determines if the user can select text within the view.  Normally this is
    set to NO to disable text selection.  You should set this to YES if you
    are creating a view that includes editable text.  Otherwise, settings this
    to YES will probably make your controls harder to use and it is not
    recommended.

    @type Boolean
    @readOnly
  */
  isTextSelectable: NO,

  /**
    You can set this array to include any properties that should immediately
    invalidate the display.  The display will be automatically invalidated
    when one of these properties change.

    These are the properties that will be visible to any Render Delegate.
    When the RenderDelegate asks for a property it needs, the view checks the
    displayProperties array. It first looks for the property name prefixed
    by 'display'; for instance, if the render delegate needs a 'title',
    the view will attempt to find 'displayTitle'. If there is no 'displayTitle'
    in displayProperties, the view will then try 'title'. If 'title' is not
    in displayProperties either, an error will be thrown.

    This allows you to avoid collisions between your view's API and the Render
    Delegate's API.

    Implementation note:  'isVisible' is also effectively a display property,
    but it is not declared as such because it is observed separately in
    order to manage the view's internal state.

    @type Array
    @readOnly
  */
  displayProperties: [],

  // .......................................................
  // SC.RESPONDER SUPPORT
  //

  /** @property
    The nextResponder is usually the parentView.
  */
  nextResponder: function () {
    return this.get('parentView');
  }.property('parentView').cacheable(),


  /** @property
    Set to YES if your view is willing to accept first responder status.  This
    is used when calculating key responder loop.
  */
  acceptsFirstResponder: NO,

  // .......................................................
  // CORE DISPLAY METHODS
  //

  /** @private
    Caches the layerId to detect when it changes.
    */
  _lastLayerId: null,

  /** @private
    Setup a view, but do not finish waking it up.

     - configure childViews
     - Determine the view's theme
     - Fetch a render delegate from the theme, if necessary
     - register the view with the global views hash, which is used for event
       dispatch
  */
  init: function () {
    var childViews, layerId;

    sc_super();

    layerId = this._lastLayerId = this.get('layerId');

    // Register the view for event handling. This hash is used by
    // SC.RootResponder to dispatch incoming events.
    //@if (debug)
    if (SC.View.views[layerId]) {
      throw new Error("Developer Error: A view with layerId, '%@', already exists.  Each view must have a unique layerId.".fmt(this.get('layerId')));
    }
    //@endif
    SC.View.views[layerId] = this;

    // setup classNames
    this.classNames = this.get('classNames').slice();

    // setup child views.  be sure to clone the child views array first
    childViews = this.childViews = this.get('childViews').slice();
    this.createChildViews(); // setup child Views
  },

  /**
    Frame describes this view's current bounding rect, relative to its parent view. You
    can use this, for example, to reliably access a width for a view whose layout is
    defined with left and right. (Note that width and height values are calculated in
    the parent view's frame of reference as well, which has consequences for scaled
    views.)

    @type Rect
    @test in layoutStyle
  */
  frame: function () {
    return this.computeFrameWithParentFrame(null);
  }.property('useStaticLayout').cacheable(),    // We depend on the layout, but layoutDidChange will call viewDidResize to check the frame for us

  /**
    Computes the frame of the view by examining the view's DOM representation.
    If no representation exists, returns null.

    If the view has a parent view, the parent's bounds will be taken into account when
    calculating the frame.

    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function () {
    var layer,                            // The view's layer
        pv = this.get('parentView'),      // The view's parent view (if it exists)
        f;                                // The layer's coordinates in the document

    // need layer to be able to compute rect
    if (layer = this.get('layer')) {
      f = SC.offset(layer); // x,y
      if (pv) { f = pv.convertFrameFromView(f, null); }

      /*
        TODO Can probably have some better width/height values - CC
        FIXME This will probably not work right with borders - PW
      */
      f.width = layer.offsetWidth;
      f.height = layer.offsetHeight;

      return f;
    }

    // Unable to compute yet
    if (this.get('hasLayout')) {
      return null;
    } else {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  },

  /** @private Call the method recursively on all child views. */
  _callOnChildViews: function (methodName, isTopDown, context) {
    var childView,
      childViews = this.get('childViews'),
      method,
      shouldContinue;

    for (var i = childViews.length - 1; i >= 0; i--) {
      childView = childViews[i];

      // We allow missing childViews in the array so ignore them.
      if (!childView) { continue; }

      // Look up the method on the child.
      method = childView[methodName];

      // Call the method on this view *before* its children.
      if (isTopDown === undefined || isTopDown) {
        shouldContinue = method.call(childView, context);
      }

      // Recurse.
      if (shouldContinue === undefined || shouldContinue) {
        childView._callOnChildViews(methodName, isTopDown, context);
      }

      // Call the method on this view *after* its children.
      if (isTopDown === false) {
        method.call(childView, context);
      }
    }
  },

  /**
    The clipping frame returns the visible portion of the view, taking into
    account the clippingFrame of the parent view.  (Note that, in contrast
    to `frame`, `clippingFrame` is in the context of the view itself, not
    its parent view.)

    Normally this will be calculated based on the intersection of your own
    clippingFrame and your parentView's clippingFrame.

    @type Rect
  */
  clippingFrame: function () {
    var f = this.get('frame');

    // FAST PATH: No frame, no clipping frame.
    if (!f) return null;

    /*jshint eqnull:true */
    var scale = (f.scale == null) ? 1 : f.scale,
        pv = this.get('parentView'),
        pcf = pv ? pv.get('clippingFrame') : null,
        ret;

    // FAST PATH: No parent clipping frame, no change. (The origin and scale are reset from parent view's
    // context to our own.)
    if (!pcf) return { x: 0, y: 0, width: f.width / scale, height: f.height / scale};

    // Get the intersection.
    ret = SC.intersectRects(pcf, f);

    // Reorient the top-left from the parent's origin to ours.
    ret.x -= f.x;
    ret.y -= f.y;

    // If we're scaled, we have to scale the intersected rectangle from our parent's frame of reference
    // to our own.
    if (scale !== 1) {
      var scaleX, scaleY;
      // We're scaling from parent space into our space, so the scale is reversed. (Layout scale may be an array.)
      if (SC.typeOf(scale) === SC.T_ARRAY) {
        scaleX = 1 / scale[0];
        scaleY = 1 / scale[1];
      } else {
        scaleX = scaleY = 1 / scale;
      }

      // Convert the entire rectangle into our scale.
      ret.x *= scaleX;
      ret.width *= scaleX;
      ret.y *= scaleY;
      ret.height *= scaleY;
    }

    return ret;
  }.property('parentView', 'frame').cacheable(),

  /** @private
    This method is invoked whenever the clippingFrame changes, notifying
    each child view that its clippingFrame has also changed.
  */
  _sc_clippingFrameDidChange: function () {
    this.notifyPropertyChange('clippingFrame');
  },

  /**
    Removes the child view from the parent view *and* detaches it from the
    document.

    This does *not* remove the child view's layer (i.e. the node still exists,
    but is no longer in the document) and does *not* destroy the child view
    (i.e. it can still be re-attached to the document).

    Note that if the child view uses a transitionOut plugin, it will not be
    fully detached until the transition completes.  To force the view to detach
    immediately you can pass true for the optional `immediately` argument.

    If you wish to remove the child and discard it, use `removeChildAndDestroy`.

    @param {SC.View} view The view to remove as a child view.
    @param {Boolean} [immediately=false] Forces the child view to be removed immediately regardless if it uses a transitionOut plugin.
    @see SC.View#removeChildAndDestroy
    @returns {SC.View} receiver
  */
  removeChild: function (view, immediately) {
    if (view.get('isAttached')) {
      view._doDetach(immediately);
    }

    // If the view will transition out, wait for the transition to complete
    // before orphaning the view entirely.
    if (!immediately && view.get('viewState') === SC.CoreView.ATTACHED_BUILDING_OUT) {
      view.addObserver('isAttached', this, this._orphanChildView);
    } else {
      view._doOrphan();
    }

    return this;
  },

  /**
    Removes the child view from the parent view, detaches it from the document
    *and* destroys the view and its layer.

    Note that if the child view uses a transitionOut plugin, it will not be
    fully detached and destroyed until the transition completes.  To force the
    view to detach immediately you can pass true for the optional `immediately`
    argument.

    If you wish to remove the child and keep it for further re-use, use
    `removeChild`.

    @param {SC.View} view The view to remove as a child view and destroy.
    @param {Boolean} [immediately=false] Forces the child view to be removed and destroyed immediately regardless if it uses a transitionOut plugin.
    @see SC.View#removeChild
    @returns {SC.View} receiver
  */
  removeChildAndDestroy: function (view, immediately) {
    if (view.get('isAttached')) {
      view._doDetach(immediately);
    }

    // If the view will transition out, wait for the transition to complete
    // before destroying the view entirely.
    if (view.get('isAttached') && view.get('transitionOut') && !immediately) {
      view.addObserver('isAttached', this, this._destroyChildView);
    } else {
      view.destroy(); // Destroys the layer and the view.
    }

    return this;
  },

  /**
    Removes all children from the parentView *and* destroys them and their
    layers.

    Note that if any child view uses a transitionOut plugin, it will not be
    fully removed until the transition completes.  To force all child views to
    remove immediately you can pass true as the optional `immediately` argument.

    Tip: If you know that there are no transitions for the child views,
    you should pass true to optimize the document removal.

    @param {Boolean} [immediately=false] Forces all child views to be removed immediately regardless if any uses a transitionOut plugin.
    @returns {SC.View} receiver
  */
  removeAllChildren: function (immediately) {
    var childViews = this.get('childViews'),
      len = childViews.get('length'),
      i;

    // OPTIMIZATION!
    // If we know that we're removing all children and we are rendered, lets do the document cleanup in one sweep.
    // if (immediately && this.get('_isRendered')) {
    //   var layer,
    //     parentNode;

    //   // If attached, detach and track our parent node so we can re-attach.
    //   if (this.get('isAttached')) {
    //     layer = this.get('layer');
    //     parentNode = layer.parentNode;

    //     this._doDetach();
    //   }

    //   // Destroy our layer and thus all the children's layers in one move.
    //   this.destroyLayer();

    //   // Remove all the children.
    //   for (i = len - 1; i >= 0; i--) {
    //     this.removeChildAndDestroy(childViews.objectAt(i), immediately);
    //   }

    //   // Recreate our layer (now empty).
    //   this.createLayer();

    //   // Reattach our layer.
    //   if (parentNode && !this.get('isAttached')) { this._doAttach(parentNode); }
    // } else {
      for (i = len - 1; i >= 0; i--) {
        this.removeChildAndDestroy(childViews.objectAt(i), immediately);
      }
    // }

    return this;
  },

  /**
    Removes the view from its parentView, if one is found.  Otherwise
    does nothing.

    @returns {SC.View} receiver
  */
  removeFromParent: function () {
    var parent = this.get('parentView');
    if (parent) { parent.removeChild(this); }

    return this;
  },

  /** @private Observer for child views that are being discarded after transitioning out. */
  _destroyChildView: function (view) {
    // Commence destroying of the view once it is detached.
    if (!view.get('isAttached')) {
      view.removeObserver('isAttached', this, this._destroyChildView);
      view.destroy();
    }
  },

  /** @private Observer for child views that are being orphaned after transitioning out. */
  _orphanChildView: function (view) {
    // Commence orphaning of the view once it is detached.
    if (!view.get('isAttached')) {
      view.removeObserver('isAttached', this, this._orphanChildView);
      view._doOrphan();
    }
  },

  /**
    Completely destroys a view instance so that it may be garbage collected.

    You must call this method on a view to destroy the view (and all of its
    child views). This will remove the view from any parent, detach the
    view's layer from the DOM if it is attached and clear the view's layer
    if it is rendered.

    Once a view is destroyed it can *not* be reused.

    @returns {SC.View} receiver
  */
  destroy: function () {
    // Fast path!
    if (this.get('isDestroyed')) { return this; }

    // Do generic destroy. It takes care of mixins and sets isDestroyed to YES.
    // Do this first, since it cleans up bindings that may apply to parentView
    // (which we will soon null out).
    var ret = sc_super();

    // If our parent is already destroyed, then we can defer destroying ourself
    // and our own child views momentarily.
    if (this.getPath('parentView.isDestroyed')) {
      // Complete the destroy in a bit.
      this.invokeNext(this._destroy);
    } else {
      // Immediately remove the layer if attached (ignores transitionOut). This
      // will detach the layer for all child views as well.
      if (this.get('isAttached')) {
        this._doDetach(true);
      }

      // Clear the layer if rendered.  This will clear all child views layer
      // references as well.
      if (this.get('_isRendered')) {
        this._doDestroyLayer();
      }

      // Complete the destroy.
      this._destroy();
    }

    // Remove the view from the global hash.
    delete SC.View.views[this.get('layerId')];

    // Destroy any children.  Loop backwards since childViews will shrink.
    var childViews = this.get('childViews');
    for (var i = childViews.length - 1; i >= 0; i--) {
      childViews[i].destroy();
    }

    return ret;
  },

  /** @private */
  _destroy: function () {
    // Orphan the view if adopted.
    this._doOrphan();

    delete this.page;
  },

  /**
    This method is called when your view is first created to setup any  child
    views that are already defined on your class.  If any are found, it will
    instantiate them for you.

    The default implementation of this method simply steps through your
    childViews array, which is expects to either be empty or to contain View
    designs that can be instantiated

    Alternatively, you can implement this method yourself in your own
    subclasses to look for views defined on specific properties and then build
     a childViews array yourself.

    Note that when you implement this method yourself, you should never
    instantiate views directly.  Instead, you should use
    this.createChildView() method instead.  This method can be much faster in
    a production environment than creating views yourself.

    @returns {SC.View} receiver
  */
  createChildViews: function () {
    var childViews = this.get('childViews'),
        len        = childViews.length,
        isNoLongerValid = false,
        idx, key, view;

    this.beginPropertyChanges();

    // swap the array
    for (idx = 0; idx < len; ++idx) {
      key = view = childViews[idx];

      // is this is a key name, lookup view class
      if (typeof key === SC.T_STRING) {
        view = this[key];
      } else {
        key = null;
      }

      if (!view) {
        //@if (debug)
        SC.warn("Developer Warning: The child view named '%@' was not found in the view, %@.  This child view will be ignored.".fmt(key, this));
        //@endif

        // skip this one.
        isNoLongerValid = true;
        childViews[idx] = null;
        continue;
      }

      // createChildView creates the view if necessary, but also sets
      // important properties, such as parentView
      view = this.createChildView(view);
      if (key) { this[key] = view; } // save on key name if passed

      childViews[idx] = view;
    }

    // Set childViews to be only the valid array.
    if (isNoLongerValid) { this.set('childViews', childViews.compact()); }

    this.endPropertyChanges();
    return this;
  },

  /**
    Instantiates a view to be added to the childViews array during view
    initialization. You generally will not call this method directly unless
    you are overriding createChildViews(). Note that this method will
    automatically configure the correct settings on the new view instance to
    act as a child of the parent.

    If the given view is a class, then createdByParent will be set to true on
    the returned instance.

    @param {Class} view A view class to create or view instance to prepare.
    @param {Object} [attrs={}] attributes to add
    @returns {SC.View} new instance
    @test in createChildViews
  */
  createChildView: function (view, attrs) {
    // Create the view if it is a class.
    if (view.isClass) {
      // attrs should always exist...
      if (!attrs) { attrs = {}; }

      // clone the hash that was given so we do not pollute it if it's being reused
      else { attrs = SC.clone(attrs); }

      // Assign the parentView & page to ourself.
      attrs.parentView = this;
      if (!attrs.page) { attrs.page = this.page; }

      // Track that we created this view.
      attrs.createdByParent = true;

      // Insert the autoMixins if defined
      var applyMixins = this.autoMixins;
      if (!!applyMixins) {
        applyMixins = SC.clone(applyMixins);
        applyMixins.push(attrs);
        view = view.create.apply(view, applyMixins);
      } else {
        view = view.create(attrs);
      }
    // Assign the parentView if the view is an instance.
    // TODO: This should not be accepting view instances, for the purpose of lazy code elsewhere in the framework.
    //       We should ensure users of `createChildViews` are using appendChild and other manipulation methods.
    } else {
      view.set('parentView', this);
      view._adopted();

      if (!view.get('page')) { view.set('page', this.page); }
    }

    return view;
  },

  /** walk like a duck */
  isView: YES,

  /**
    Default method called when a selectstart event is triggered. This event is
    only supported by IE. Used in sproutcore to disable text selection and
    IE8 accelerators. The accelerators will be enabled only in
    text selectable views. In FF and Safari we use the css style 'allow-select'.

    If you want to enable text selection in certain controls is recommended
    to override this function to always return YES , instead of setting
    isTextSelectable to true.

    For example in textfield you do not want to enable textSelection on the text
    hint only on the actual text you are entering. You can achieve that by
    only overriding this method.

    @param evt {SC.Event} the selectstart event
    @returns YES if selectable
  */
  selectStart: function (evt) {
    return this.get('isTextSelectable');
  },

  /**
    Used to block the contextMenu per view.

    @param evt {SC.Event} the contextmenu event
    @returns YES if the contextmenu will be allowed to show up
  */
  contextMenu: function (evt) {
    if (this.get('isContextMenuEnabled')) {
      evt.allowDefault();
      return YES;
    }
  },

  // ------------------------------------------------------------------------
  // Transitions
  //

  /**
    The transition plugin to use when this view is appended to the DOM.

    SC.CoreView uses a pluggable transition architecture where the transition
    setup, execution and cleanup can be handled by a specified transition
    plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE_IN
      SC.View.FADE_IN
      SC.View.SLIDE_IN
      SC.View.SCALE_IN
      SC.View.SPRING_IN

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.ViewTransitionProtocol protocol.

    @type Object (SC.ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionIn: null,

  /**
    The options for the given transition in plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.SLIDE_IN accepts options
    like:

        transitionInOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'ease-in-out'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionInOptions: null,

  /**
    The transition plugin to use when this view is removed from the DOM.

    SC.View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE_OUT
      SC.View.FADE_OUT
      SC.View.SLIDE_OUT
      SC.View.SCALE_OUT
      SC.View.SPRING_OUT

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.ViewTransitionProtocol protocol.

    @type Object (SC.ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionOut: null,

  /**
    The options for the given transition out plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.SLIDE accepts options
    like:

        transitionOutOptions: {
          direction: 'right',
          duration: 0.15,
          timing: 'ease-in'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionOutOptions: null,

  /**
    The transition plugin to use when this view is made shown from being
    hidden.

    SC.CoreView uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE_IN
      SC.View.FADE_IN
      SC.View.SLIDE_IN
      SC.View.SCALE_IN
      SC.View.SPRING_IN

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.ViewTransitionProtocol protocol.

    @type Object (SC.ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionShow: null,

  /**
    The options for the given transition show plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.SLIDE accepts options
    like:

        transitionShowOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'ease-in-out'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionShowOptions: null,

  /**
    The transition plugin to use when this view is hidden after being shown.

    SC.View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      SC.View.BOUNCE_OUT
      SC.View.FADE_OUT
      SC.View.SLIDE_OUT
      SC.View.SCALE_OUT
      SC.View.SPRING_OUT

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.ViewTransitionProtocol protocol.

    @type Object (SC.ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionHide: null,

  /**
    The options for the given transition hide plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.SLIDE accepts options
    like:

        transitionHideOptions: {
          direction: 'right',
          duration: 0.15,
          timing: 'ease-in'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionHideOptions: null,

  // ............................................
  // Patches
  //

  /** @private
    Override this method to apply design modes to this view and
    its children.
    @see SC.View
  */
  updateDesignMode: function (lastDesignMode, designMode) {}
});

SC.CoreView.mixin(
  /** @scope SC.CoreView */ {

  /** @private walk like a duck -- used by SC.Page */
  isViewClass: YES,

  /**
    This method works just like extend() except that it will also preserve
    the passed attributes in case you want to use a view builder later, if
    needed.

    @param {Hash} attrs Attributes to add to view
    @returns {Class} SC.View subclass to create
    @function
  */
  design: function () {
    if (this.isDesign) {
      // @if (debug)
      SC.Logger.warn("Developer Warning: .design() was called twice for %@.".fmt(this));
      // @endif
      return this;
    }

    var ret = this.extend.apply(this, arguments);
    ret.isDesign = YES;
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadDesign(ret, this, SC.A(arguments));
    }
    return ret;
  },

  extend: function () {
    var last = arguments[arguments.length - 1];

    if (last && !SC.none(last.theme)) {
      last.themeName = last.theme;
      delete last.theme;
    }

    return SC.Object.extend.apply(this, arguments);
  },

  /**
    Helper applies the layout to the prototype.
  */
  layout: function (layout) {
    this.prototype.layout = layout;
    return this;
  },

  /**
    Helper applies the classNames to the prototype
  */
  classNames: function (sc) {
    sc = (this.prototype.classNames || []).concat(sc);
    this.prototype.classNames = sc;
    return this;
  },

  /**
    Help applies the tagName
  */
  tagName: function (tg) {
    this.prototype.tagName = tg;
    return this;
  },

  /**
    Helper adds the childView
  */
  childView: function (cv) {
    var childViews = this.prototype.childViews || [];
    if (childViews === this.superclass.prototype.childViews) {
      childViews = childViews.slice();
    }
    childViews.push(cv);
    this.prototype.childViews = childViews;
    return this;
  },

  /**
    Helper adds a binding to a design
  */
  bind: function (keyName, path) {
    var p = this.prototype, s = this.superclass.prototype;
    var bindings = p._bindings;
    if (!bindings || bindings === s._bindings) {
      bindings = p._bindings = (bindings || []).slice();
    }

    keyName = keyName + "Binding";
    p[keyName] = path;
    bindings.push(keyName);

    return this;
  },

  /**
    Helper sets a generic property on a design.
  */
  prop: function (keyName, value) {
    this.prototype[keyName] = value;
    return this;
  },

  /**
    Used to construct a localization for a view.  The default implementation
    will simply return the passed attributes.
  */
  localization: function (attrs, rootElement) {
    // add rootElement
    if (rootElement) attrs.rootElement = SC.$(rootElement)[0];
    return attrs;
  },

  /**
    Creates a view instance, first finding the DOM element you name and then
    using that as the root element.  You should not use this method very
    often, but it is sometimes useful if you want to attach to already
    existing HTML.

    @param {String|Element} element
    @param {Hash} attrs
    @returns {SC.View} instance
  */
  viewFor: function (element, attrs) {
    var args = SC.$A(arguments); // prepare to edit
    if (SC.none(element)) {
      args.shift(); // remove if no element passed
    } else args[0] = { rootElement: SC.$(element)[0] };
    var ret = this.create.apply(this, arguments);
    args = args[0] = null;
    return ret;
  },

  /**
    Create a new view with the passed attributes hash.  If you have the
    Designer module loaded, this will also create a peer designer if needed.
  */
  create: function () {
    var last = arguments[arguments.length - 1];

    if (last && last.theme) {
      last.themeName = last.theme;
      delete last.theme;
    }

    var C = this, ret = new C(arguments);
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didCreateView(ret, SC.$A(arguments));
    }
    return ret;
  },

  /**
    Applies the passed localization hash to the component views.  Call this
    method before you call create().  Returns the receiver.  Typically you
    will do something like this:

    view = SC.View.design({...}).loc(localizationHash).create();

    @param {Hash} loc
    @param rootElement {String} optional rootElement with prepped HTML
    @returns {SC.View} receiver
  */
  loc: function (loc) {
    var childLocs = loc.childViews;
    delete loc.childViews; // clear out child views before applying to attrs

    this.applyLocalizedAttributes(loc);
    if (SC.ViewDesigner) {
      SC.ViewDesigner.didLoadLocalization(this, SC.$A(arguments));
    }

    // apply localization recursively to childViews
    var childViews = this.prototype.childViews, idx = childViews.length,
      viewClass;
    while (--idx >= 0) {
      viewClass = childViews[idx];
      loc = childLocs[idx];
      if (loc && viewClass && typeof viewClass === SC.T_STRING) SC.String.loc(viewClass, loc);
    }

    return this; // done!
  },

  /**
    Internal method actually updates the localized attributes on the view
    class.  This is overloaded in design mode to also save the attributes.
  */
  applyLocalizedAttributes: function (loc) {
    SC.mixin(this.prototype, loc);
  },

  views: {}

});

// .......................................................
// OUTLET BUILDER
//

/**
  Generates a computed property that will look up the passed property path
  the first time you try to get the value.  Use this whenever you want to
  define an outlet that points to another view or object.  The root object
  used for the path will be the receiver.
*/
SC.outlet = function (path, root) {
  return function (key) {
    return (this[key] = SC.objectForPropertyPath(path, (root !== undefined) ? root : this));
  }.property();
};

/** @private on unload clear cached divs. */
SC.CoreView.unload = function () {
  // delete view items this way to ensure the views are cleared.  The hash
  // itself may be owned by multiple view subclasses.
  var views = SC.View.views;
  if (views) {
    for (var key in views) {
      if (!views.hasOwnProperty(key)) continue;
      delete views[key];
    }
  }
};

/**
  @class

  Base class for managing a view.  Views provide two functions:

   1. They display – translating your application's state into drawing
     instructions for the web browser, and
   2. They react – acting as responders for incoming keyboard, mouse, and touch
     events.

  View Basics
  ====

  SproutCore's view layer is made up of a tree of SC.View instances, nested
  using the `childViews` list – usually an array of local property names. You
  position each view by specifying a set of layout keys, like 'left', 'right',
  'width', or 'centerX', in a hash on the layout property. (See the 'layout'
  documentation for more.)

  Other than positioning, SproutCore relies on CSS for all your styling needs.
  Set an array of CSS classes on the `classNames` property, then style them with
  standard CSS. (SproutCore's build tools come with Sass support built in, too.)
  If you have a class that you want automatically added and removed as another
  property changes, take a look at `classNameBindings`.

  Different view classes do different things. The so-called "Big Five" view
  classes are SC.LabelView, for displaying (optionally editable, optionally
  localizable) text; SC.ButtonView, for the user to poke; SC.CollectionView
  (most often as its subclass SC.ListView) for displaying an array of content;
  SC.ContainerView, for easily swapping child views in and out; and SC.ScrollView,
  for containing larger views and allowing them to be scrolled.

  All views live in panes (subclasses of SC.Pane, like SC.MainPane and SC.PanelPane),
  which are parentless views that know how to append themselves directly to the document.
  Panes also serve as routers for events, like mouse, touch and keyboard events, that are
  bound for their views. (See "View Events" below for more.)

  For best performance, you should define your view and pane instances with `extend()`
  inside an SC.Page instance, getting them as needed with `get`. As its name suggests,
  SC.Page's only job is to instantiate views once when first requested, deferring the
  expensive view creation process until each view is needed. Correctly using SC.Page is
  considered an important best practice for high-performance applications.

  View Initialization
  ====

  When a view is setup, there are several methods you can override that
  will be called at different times depending on how your view is created.
  Here is a guide to which method you want to override and when:

   - `init` -- override this method for any general object setup (such as
     observers, starting timers and animations, etc) that you need to happen
     every time the view is created, regardless of whether or not its layer
     exists yet.
   - `render` -- override this method to generate or update your HTML to reflect
     the current state of your view.  This method is called both when your view
     is first created and later anytime it needs to be updated.
   - `update` -- Normally, when a view needs to update its content, it will
     re-render the view using the render() method.  If you would like to
     override this behavior with your own custom updating code, you can
     replace update() with your own implementation instead.
   - `didCreateLayer` -- the render() method is used to generate new HTML.
     Override this method to perform any additional setup on the DOM you might
     need to do after creating the view.  For example, if you need to listen
     for events.
   - `willDestroyLayer` -- if you implement didCreateLayer() to setup event
     listeners, you should implement this method as well to remove the same
     just before the DOM for your view is destroyed.
   - `didAppendToDocument` -- in theory all DOM setup could be done
     in didCreateLayer() as you already have a DOM element instantiated.
     However there is cases where the element has to be first appended to the
     Document because there is either a bug on the browser or you are using
     plugins which objects are not instantiated until you actually append the
     element to the DOM. This will allow you to do things like registering
     DOM events on flash or quicktime objects.
   - `willRemoveFromDocument` -- This method is called on the view immediately
     before its layer is removed from the DOM. You can use this to reverse any
     setup that is performed in `didAppendToDocument`.

  View Events
  ====

  One of SproutCore's optimizations is application-wide event delegation: SproutCore
  handles and standardizes events for you before sending them through your view layer's
  chain of responding views. You should never need to attach event listeners to elements;
  instead, just implement methods like `click`, `doubleClick`, `mouseEntered` and
  `dataDragHover` on your views.

  Note that events generally bubble up an event's responder chain, which is made up of the
  targeted view (i.e. the view whose DOM element received the event), and its chain of
  parentViews up to its pane. (In certain rare cases, you may wish to manipulate the responder
  chain to bypass certain views; you can do so by overriding a view's `nextResponder` property.)

  Simple mouse click events
  ----
  In many situations, all you need are clicks - in which case, just implement `click` or
  `doubleClick` on your views. Note that these events bubble up the responder chain until
  they encounter a view which implements the event method. For example, if a view and its
  parent both implement `click`, the parent will not be notified of the click. (If you want a
  view to handle the event AND allow the event to keep bubbling to its parent views, no
  problem: just be sure to return NO from the event method.)
  - `click` -- Called on a view when the user clicks the mouse on a view. (Note that the view
    on which the user lifts the mouse button will receive the `click` event, regardless of
    whether the user depressed the mouse button elsewhere. If you need finer-grained control
    than this, see "Granular mouse click events" below.)
  - `doubleClick` -- Called on a view when a user has double-clicked it. Double-clicks are
    triggered when two clicks of the same button happen within eight pixels and 250ms of each
    other. (If you need finer-grained control than this, see "Granular mouse click events"
    below.) The same view may receive both `click` and `doubleClick` events.

  Note that defining application behavior directly in event handlers is usually a bad idea; you
  should follow the target/action pattern when possible. See SC.ButtonView and SC.ActionSupport.
  Also note that you will not need to implement event handling yourself on most built-in
  SproutCore controls.

  Note that `click` and `doubleClick` event handlers on your views will not be notified of touch
  events; you must also implement touch handling. See "Touch events" below.

  Mouse movement events
  ----
  SproutCore normalizes (and brings sanity to) mouse movement events by calculating when
  the mouse has entered and exited views, and sending the correct event to each view in
  the responder chain. For example, if a mouse moves within a parent view but crosses from
  one child view to another, the parent view will receive a mouseMoved event while the child
  views will receive mouseEntered and mouseExit events.

  In contrast to mouse click events, mouse movement events are called on the entire responder
  chain regardless of how you handle it along the way - a view and its parent, both implementing
  event methods, will both be notified of the event.

  - `mouseEntered` -- Called when the cursor first enters a view. Called on every view that has
    just entered the responder chain.
  - `mouseMoved` -- Called when the cursor moves over a view.
  - `mouseExited` -- Called when the cursor leaves a view. Called on every view that has
    just exited the responder chain.

  Granular mouse click events
  ----
  If you need more granular handling of mouse click events than what is provided by `click`
  and `doubleClick`, you can handle their atomic components `mouseDown`, `mouseDrag` and
  `mouseUp`. Like the compound events, these events bubble up their responder chain towards
  the pane until they find an event which implements the event handler method. (Again, to
  handle an event but allow it to continue bubbling, just return NO.)

  It bears emphasizing that `mouseDrag` and `mouseUp` events for a given mouse click sequence
  are *only ever called* on the view which successfully responded to the `mouseDown` event. This
  gives `mouseDown` control over which view responder-chain is allowed to handle the entire
  click sequence.

  (Note that because of how events bubble up the responder chain, if a child view implements
  `mouseDown` but not `mouseDrag` or `mouseUp`, those events will bubble to its parent. This
  may cause unexpected behavior if similar events are handled at different parts of your view
  hierarchy, for example if you handle `mouseDown` in a child and a parent, and only handle
  `mouseUp` in the parent.)

  - `mouseDown` -- Called on the target view and responder chain when the user depresses a
    button. A view must implement `mouseDown` (and not return NO) in order to be notified
    of the subsequent drag and up events.
  - `mouseDrag` -- Called on the target view if it handled mouseDown. A view must implement
    mouseDown (and not return NO) in order to receive mouseDrag; only the view which handled a
    given click sequence's mouseDown will receive `mouseDrag` events (and will continue to
    receive them even if the user drags the mouse off of it).
  - `mouseUp` -- Called on the target view when the user lifts a mouse button. A view must
    implement mouseDown (and not return NO) in order to receive mouseUp.

  SproutCore implements a higher-level API for handling in-application dragging and dropping.
  See `SC.Drag`, `SC.DragSourceProtocol`, `SC.DragDataSourceProtocol`, and `SC.DropTargetProtocol`
  for more.

  Data-drag events
  ----
  Browsers implement a parallel system of events for drags which bring something with them: for
  example, dragging text, an image, a URL or (in modern browsers) a file. They behave differently,
  and require different responses from the developer, so SproutCore implements them as a separate
  set of "data drag" events. These behave much like mouse events; the data-drag movement events
  bubble indiscriminately, and the data-drag drop event bubbles until it finds a view which handles
  it (and doesn't return NO).

  By default, SproutCore cancels the default behavior of any data drag event which carries URLs
  or files, as by default these would quit the app and open the dragged item in the browser. If
  you wish to implement data drag-and-drop support in your application, you should set the event's
  dataTransfer.dropEffect property to 'copy' in a `dataDragHovered` event handler.

  - `dataDragEntered` -- Triggered when a data drag enters a view. You can use this handler to
    update the view to visually signal that a drop is possible.
  - `dataDragHovered` -- Triggered when the browser sends a dragover event to a view. If you want
    to support dropping data on your view, you must set the event's `dataTransfer.dropEffect`
    property to 'copy' (or related). Note that `dataDragHovered` is given access to dragenter
    events as well, so you do not need to worry about this in your `dataDragEntered` methods.
  - `dataDragDropped` -- If the last hover event's dropEffect was set correctly, this event will
    give the view access to the data that was dropped. This event bubbles up the responder chain
    until it finds a view which handles it (and doesn't return NO).
  - `dataDragExited` -- Triggered when a data drag leaves a view. You can use this handler to
    update the view to remove the visual drop signal. This event is fired regardless of whether
    a drop occurred.


  Touch events
  ----
  Touch events can be much more complicated than mouse events: multiple touches may be in flight
  at once, and views may wish to handle average touches rather than individual touches.

  Basic support for touch events is required to make your application touch-aware. (You will not
  need to implement touch support for built-in SproutCore controls, which are touch-aware out of
  the box.) The basic touch event handlers are `touchStart` and `touchEnd`; if all you need is
  basic support then you can simply proxy these events to their mouse counterparts.

  The counterpart to `mouseDragged` is `touchesDragged`, which is passed two arguments: a special
  multitouch event object which includes methods for accessing information about all currently
  in-flight touches, and a list of touches active on the current view. If you need to check the
  status of touches currently being handled by other views, the special multitouch event object
  exposes the `touchesForView` method. It also exposes the convenient `averagedTouchesForView`
  method, which gives you easy access to an average touch center and distance. Unlike `mouseDragged`,
  `touchesDragged` does not bubble, being only called on views whic handled `touchStart` for touches
  which have moved.

  To facilitate intuitive behavior in situations like scroll views with touch handlers inside them,
  you may capture a touch from part way up its responder chain before it has a chance to bubble
  up from the target. To capture a touch, expose a method on your view called `captureTouch` which
  accepts the touch as its only argument, and which returns YES if you would like to capture that
  touch. A captured touch will not bubble as normal, instead bubbling up from the capture point. Any
  child views will not have the opportunity to handle the captured event unless you implement custom
  responder swapping yourself.

  Touch events bubble differently than mouse and keyboard events. The initial reverse `captureTouch`
  bubbling is followed by regular `touchStart` bubbling; however, once this process has found a view
  that's willing to respond to the touch, further events are applied only to that view. If a view
  wishes to assign respondership for a touch to a different view, it can call one of several methods
  on the touch object. For a fuller discussion of touch events, touch responder behavior, and the touch
  object itself, see the documentation for SC.Touch.

  Keyboard events
  ----
  The basic key events are `keyDown` and `keyUp`. In order to be notified of keyboard events,
  a view must set `acceptsFirstResponder` to `YES`, and be on an active pane with
  `acceptsKeyPane` set to YES. (You may also need to call `becomeFirstResponder` on your view
  on a `mouseDown`, for example, to focus it. You can verify whether your view has successfully
  received first responder status by checking `isFirstResponder`.)

  Note that key events bubble similarly to mouse click events: they will stop bubbling if they
  encounter a view which handles the event and does not return NO.

  SproutCore implements a set of very convenient, higher-level keyboard events for action keys
  such as *tab*, *enter*, and the arrow keys. These are not triggered automatically, but you
  can gain access to them by proxying the keyboard event of your choice to `interpretKeyEvent`.
  For example:

        // Proxy the keyboard event to SC's built-in interpreter.
        keyDown: function(evt) {
          return this.interpretKeyEvents(evt);
        },
        // The interpreter will trigger the view's `cancel` event if the escape key was pressed.
        cancel: function(evt) {
          console.log('The escape key was pressed.'');
        }

  This will analyze the key press and fire an appropriate event. These events include, but are
  not limited to:

  - `moveUp`, `moveDown`, `moveLeft`, `moveRight` -- The arrow keys
  - `insertNewline` -- The enter key (note the lower-case 'line')
  - `cancel` -- The escape key
  - `insertTab` -- The tab key
  - `insertBacktab` -- Shift + the tab key
  - `moveToBeginningOfDocument` -- The *home* key
  - `moveToEndOfDocument` -- The *end* key
  - `pageUp` and `pageDown`
  - `moveLeftAndModifySelection` -- Shift + the left arrow
  - `selectAll` -- Ctrl + A / Cmd + A

  For a full list of available methods, see the key values on SC.BASE_KEY_BINDINGS and
  SC.MODIFIED_KEY_BINDINGS.

  @extends SC.Responder
  @extends SC.DelegateSupport
  @since SproutCore 1.0

*/
SC.View = SC.CoreView.extend(/** @scope SC.View.prototype */{
  classNames: ['sc-view'],

  displayProperties: [],

  /** @private Enhance. */
  _executeQueuedUpdates: function () {
    sc_super();

    // Enabled
    // Update the layout style of the layer if necessary.
    if (this._enabledStyleNeedsUpdate) {
      this._doUpdateEnabledStyle();
    }

    // Layout
    // Update the layout style of the layer if necessary.
    if (this._layoutStyleNeedsUpdate) {
      this._doUpdateLayoutStyle();
    }
  },

  /** Apply the attributes to the context. */
  applyAttributesToContext: function (context) {
    // Cursor
    var cursor = this.get('cursor');
    if (cursor) { context.addClass(cursor.get('className')); }

    // Enabled
    if (!this.get('isEnabled')) {
      context.addClass('disabled');
      context.setAttr('aria-disabled', 'true');
    }

    // Layout
    // Have to pass 'true' for second argument for legacy.
    this.renderLayout(context, true);

    if (this.get('useStaticLayout')) { context.addClass('sc-static-layout'); }

    // Background color defaults to null; for performance reasons we should ignore it
    // unless it's ever been non-null.
    var backgroundColor = this.get('backgroundColor');
    if (!SC.none(backgroundColor) || this._scv_hasBackgroundColor) {
      this._scv_hasBackgroundColor = YES;
      if (backgroundColor) context.setStyle('backgroundColor', backgroundColor);
      else context.removeStyle('backgroundColor');
    }

    // Theming
    var theme = this.get('theme');
    var themeClassNames = theme.classNames, idx, len = themeClassNames.length;

    for (idx = 0; idx < len; idx++) {
      context.addClass(themeClassNames[idx]);
    }

    sc_super();

    var renderDelegate = this.get('renderDelegate');
    if (renderDelegate && renderDelegate.className) {
      context.addClass(renderDelegate.className);
    }

    // @if(debug)
    if (renderDelegate && renderDelegate.name) {
      SC.Logger.error("Render delegates now use 'className' instead of 'name'.");
      SC.Logger.error("Name '%@' will be ignored.", renderDelegate.name);
    }
    // @endif
  },

  /**
    Computes what the frame of this view would be if the parent were resized
    to the passed dimensions.  You can use this method to project the size of
    a frame based on the resize behavior of the parent.

    This method is used especially by the scroll view to automatically
    calculate when scrollviews should be visible.

    Passing null for the parent dimensions will use the actual current
    parent dimensions.  This is the same method used to calculate the current
    frame when it changes.

    @param {Rect} pdim the projected parent dimensions (optional)
    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function (pdim) {
    // Layout.
    var layout = this.get('layout'),
        f;

    // We can't predict the frame for static layout, so just return the view's
    // current frame (see original computeFrameWithParentFrame in views/view.js)
    if (this.get('useStaticLayout')) {
      f = sc_super();
      f = f ? this._sc_adjustForBorder(f, layout) : null;
      f = f ? this._sc_adjustForScale(f, layout) : null;
      return f;
    }

    f = {};

    var error, layer, AUTO = SC.LAYOUT_AUTO,
        dH, dW, //shortHand for parentDimensions
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    if (lW === AUTO) {
      SC.throw(("%@.layout() cannot use width:auto if staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
    }

    if (lH === AUTO) {
      SC.throw(("%@.layout() cannot use height:auto if staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
    }

    if (!pdim) { pdim = this.computeParentDimensions(layout); }
    dH = pdim.height;
    dW = pdim.width;

    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if (SC.isPercentage(lL)) {
        f.x = dW * lL;
      } else {
        f.x = lL;
      }

      if (lW !== undefined) {
        if (lW === AUTO) { f.width = AUTO; }
        else if (SC.isPercentage(lW)) { f.width = dW * lW; }
        else { f.width = lW; }
      } else { // better have lR!
        f.width = dW - f.x;
        if (lR && SC.isPercentage(lR)) { f.width = f.width - (lR * dW); }
        else { f.width = f.width - (lR || 0); }
      }

    // handle right aligned
    } else if (!SC.none(lR)) {
      if (SC.none(lW)) {
        if (SC.isPercentage(lR)) {
          f.width = dW - (dW * lR);
        }
        else f.width = dW - lR;
        f.x = 0;
      } else {
        if (lW === AUTO) f.width = AUTO;
        else if (SC.isPercentage(lW)) f.width = dW * lW;
        else f.width = (lW || 0);
        if (SC.isPercentage(lW)) f.x = dW - (lR * dW) - f.width;
        else f.x = dW - lR - f.width;
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if (lW === AUTO) f.width = AUTO;
      else if (SC.isPercentage(lW)) f.width = lW * dW;
      else f.width = (lW || 0);
      if (SC.isPercentage(lcX)) f.x = (dW - f.width) / 2 + (lcX * dW);
      else f.x = (dW - f.width) / 2 + lcX;
    } else {
      f.x = 0; // fallback
      if (SC.none(lW)) {
        f.width = dW;
      } else {
        if (lW === AUTO) f.width = AUTO;
        if (SC.isPercentage(lW)) f.width = lW * dW;
        else f.width = (lW || 0);
      }
    }

    // handle top aligned and top/bottom
    if (!SC.none(lT)) {
      if (SC.isPercentage(lT)) f.y = lT * dH;
      else f.y = lT;
      if (lH !== undefined) {
        if (lH === AUTO) f.height = AUTO;
        else if (SC.isPercentage(lH)) f.height = lH * dH;
        else f.height = lH;
      } else { // better have lB!
        if (lB && SC.isPercentage(lB)) f.height = dH - f.y - (lB * dH);
        else f.height = dH - f.y - (lB || 0);
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {
      if (SC.none(lH)) {
        if (SC.isPercentage(lB)) f.height = dH - (lB * dH);
        else f.height = dH - lB;
        f.y = 0;
      } else {
        if (lH === AUTO) f.height = AUTO;
        if (lH && SC.isPercentage(lH)) f.height = lH * dH;
        else f.height = (lH || 0);
        if (SC.isPercentage(lB)) f.y = dH - (lB * dH) - f.height;
        else f.y = dH - lB - f.height;
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if (lH === AUTO) f.height = AUTO;
      if (lH && SC.isPercentage(lH)) f.height = lH * dH;
      else f.height = (lH || 0);
      if (SC.isPercentage(lcY)) f.y = (dH - f.height) / 2 + (lcY * dH);
      else f.y = (dH - f.height) / 2 + lcY;

    // fallback
    } else {
      f.y = 0; // fallback
      if (SC.none(lH)) {
        f.height = dH;
      } else {
        if (lH === AUTO) f.height = AUTO;
        if (SC.isPercentage(lH)) f.height = lH * dH;
        else f.height = lH || 0;
      }
    }

    f.x = Math.floor(f.x);
    f.y = Math.floor(f.y);
    if (f.height !== AUTO) f.height = Math.floor(f.height);
    if (f.width !== AUTO) f.width = Math.floor(f.width);

    // if width or height were set to auto and we have a layer, try lookup
    if (f.height === AUTO || f.width === AUTO) {
      layer = this.get('layer');
      if (f.height === AUTO) f.height = layer ? layer.clientHeight : 0;
      if (f.width === AUTO) f.width = layer ? layer.clientWidth : 0;
    }

    // Okay we have all our numbers. Let's adjust them for things.

    // First, adjust for border.
    f = this._sc_adjustForBorder(f, layout);

    // Make sure the width/height fix their min/max (note the inlining of SC.none for performance)...
    /*jshint eqnull:true */
    if ((layout.maxHeight != null) && (f.height > layout.maxHeight)) f.height = layout.maxHeight;
    if ((layout.minHeight != null) && (f.height < layout.minHeight)) f.height = layout.minHeight;
    if ((layout.maxWidth != null) && (f.width > layout.maxWidth)) f.width = layout.maxWidth;
    if ((layout.minWidth != null) && (f.width < layout.minWidth)) f.width = layout.minWidth;

    // Finally, adjust for scale.
    f = this._sc_adjustForScale(f, layout);

    return f;
  },

  init: function () {
    sc_super();

    // Enabled.
    // If the view is pre-configured as disabled, then go to the proper initial state.
    if (!this.get('isEnabled')) { this._doDisable(); }

    // Layout
    this._previousLayout = this.get('layout');

    // Apply the automatic child view layout if it is defined.
    var childViewLayout = this.childViewLayout;
    if (childViewLayout) {
      // Layout the child views once.
      this.set('childViewsNeedLayout', true);
      this.layoutChildViewsIfNeeded();

      // If the child view layout is live, start observing affecting properties.
      if (this.get('isChildViewLayoutLive')) {
        this.addObserver('childViews.[]', this, this._cvl_childViewsDidChange);
        // DISABLED. this.addObserver('childViewLayout', this, this._cvl_childViewLayoutDidChange);
        this.addObserver('childViewLayoutOptions', this, this._cvl_childViewLayoutDidChange);

        // Initialize the child views.
        this._cvl_setupChildViewsLiveLayout();

        // Initialize our own frame observer.
        if (!this.get('isFixedSize') && childViewLayout.layoutDependsOnSize && childViewLayout.layoutDependsOnSize(this)) {
          this.addObserver('frame', this, this._cvl_childViewLayoutDidChange);
        }
      }
    }

    // Theming
    this._lastTheme = this.get('theme');

  },

  /** @private */
  destroy: function () {
    // Clean up.
    this._previousLayout = null;

    return sc_super();
  },

  /** SC.CoreView.prototype. */
  removeChild: function(view) {
    // Manipulation
    if (!view) { return this; } // nothing to do
    if (view.parentView !== this) {
      throw new Error("%@.removeChild(%@) must belong to parent".fmt(this, view));
    }

    // notify views
    // TODO: Deprecate these notifications.
    if (view.willRemoveFromParent) { view.willRemoveFromParent() ; }
    if (this.willRemoveChild) { this.willRemoveChild(view) ; }

    sc_super();

    return this;
  }

});
