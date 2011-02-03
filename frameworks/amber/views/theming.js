sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  init: function(original) {
    original();
    this._lastTheme = this.get('theme');
  }.enhance(),

  // ..........................................................
  // THEME SUPPORT
  //

  /**
    Names which theme this view should use; the theme named by this property
    will be set to the view's 'theme' property.

    Themes are identified by their name. In addition to looking for the
    theme globally, SproutCore will look for the theme inside 'baseTheme',
    which is almost always the parent view's theme.

    If null (the default), the view will set its 'theme' property to
    be equal to 'baseTheme'.

    Example: themeName: 'ace'

    @property {String}
  */
  themeName: null,

  /**
    Selects which theme to use as a 'base theme'. If null, the 'baseTheme'
    property will be set to the parent's theme. If there is no parent, the theme
    named by SC.defaultTheme is used.

    This property is private for the time being.

    @private
    @property {String}
  */
  baseThemeName: null,

  /**
    The SC.Theme instance which this view should use to render.

    Note: the actual code for this function is in _themeProperty for backwards-compatibility:
    some older views specify a string value for 'theme', which would override this property,
    breaking it.

    @property {SC.Theme}
  */
  theme: function() {
    var base = this.get('baseTheme'), themeName = this.get('themeName');

    // find theme, if possible
    if (themeName) {
      // Note: theme instance "find" function will search every parent
      // _except_ global (which is not a parent)
      var theme;
      if (base) {
        theme = base.find(themeName);
        if (theme) { return theme; }
      }

      theme = SC.Theme.find(themeName);
      if (theme) { return theme; }

      // Create a new invisible subtheme. This will cause the themeName to
      // be applied as a class name.
      return base.invisibleSubtheme(themeName);
    }

    // can't find anything, return base.
    return base;
  }.property('baseTheme', 'themeName').cacheable(),

  /**
    Detects when the theme changes. Replaces the layer if necessary.

    Also, because
  */
  _sc_view_themeDidChange: function() {
    if (this._lastTheme === this.get('theme')) { return; }
    this._lastTheme = this.get('theme');

    // invalidate child view base themes, if present
    var childViews = this.childViews, len = childViews.length, idx;
    for (idx = 0; idx < len; idx++) {
      childViews[idx].notifyPropertyChange('baseTheme');
    }

    if (this.get('layer')) this.replaceLayer();
  }.observes('theme'),

  /**
    The SC.Theme instance in which the 'theme' property should look for the theme
    named by 'themeName'.

    For example, if 'baseTheme' is SC.AceTheme, and 'themeName' is 'popover',
    it will look to see if SC.AceTheme has a child theme named 'popover',
    and _then_, if it is not found, look globally.

    @private
    @property {SC.Theme}
  */
  baseTheme: function() {
    var parent;
    var baseThemeName = this.get('baseThemeName');
    if (baseThemeName) {
      return SC.Theme.find(baseThemeName);
    } else {
      parent = this.get('parentView');
      var theme  = parent && parent.get('theme');
      return   theme || SC.Theme.find(SC.defaultTheme);
    }
  }.property('baseThemeName', 'parentView').cacheable(),

  /**
   * Returns the named property if it is specified on the view, and
   * otherwise returns the named constant from the view's theme.
   *
   * @param {String} property The property on the view.
   * @param {String} constantName The name of the constant on the theme.
  */
  getThemedProperty: function(property, constantName){
    var value = this.get(property);
    if (value !== undefined) { return value; }

    var theme = this.get('theme');
    if (!theme) { return undefined; }

    return theme[constantName];
  },

  /**
    The object to which rendering and updating the HTML representation of this
    view should be delegated.

    By default, views are responsible for creating their own HTML
    representation. In some cases, however, you may want to create an object
    that is responsible for rendering all views of a certain type. For example,
    you may want rendering of SC.ButtonView to be controlled by an object that
    is specific to the current theme.

    By setting a render delegate, the render and update methods will be called
    on that object instead of the view itself.

    For your convenience, the view will provide its displayProperties to the
    RenderDelegate. In some cases, you may have a conflict between the RenderDelegate's
    API and your view's. For instance, you may have a 'value' property that is
    any number, but the render delegate expects a percentage. Make a 'displayValue'
    property, add _it_ to displayProperties instead of 'value', and the Render Delegate
    will automatically use that when it wants to find 'value.'

    You can also set the render delegate by using the 'renderDelegateName' property.

    @property {Object}
  */
  renderDelegate: function(key, value) {
    if (value) this._setRenderDelegate = value;
    if (this._setRenderDelegate) return this._setRenderDelegate;

    // If this view does not have a render delegate but has
    // renderDelegateName set, try to retrieve the render delegate from the
    // theme.
    var renderDelegateName = this.get('renderDelegateName'), renderDelegate;

    if (renderDelegateName) {
      renderDelegate = this.get('theme')[renderDelegateName];
      if (!renderDelegate) {
        throw "%@: Unable to locate render delegate \"%@\" in theme.".fmt(this, renderDelegateName);
      }

      return renderDelegate;
    }

    return null;
  }.property('renderDelegateName', 'theme'),

  /**
    The name of the property of the current theme that contains the render
    delegate to use for this view.

    By default, views are responsible for creating their own HTML
    representation. You can tell the view to instead delegate rendering to the
    theme by setting this property to the name of the corresponding property
    of the theme.

    For example, to tell the view that it should render using the
    SC.ButtonView render delegate, set this property to
    'buttonRenderDelegate'. When the view is created, it will retrieve the
    buttonRenderDelegate property from its theme and set the renderDelegate
    property to that object.
  */
  renderDelegateName: null,

  /**
    [RO] Pass this object as the data source for render delegates. This proxy object
    for the view relays requests for properties like 'title' to 'displayTitle'
    as necessary.

    If you ever communicate with your view's render delegate, you should pass this
    object as the data source.

    The proxy that forwards RenderDelegate requests for properties to the view,
    handling display*, keeps track of the delegate's state, etc.
  */
  renderDelegateProxy: function() {
    return SC.View._RenderDelegateProxy.createForView(this);
  }.property('renderDelegate').cacheable(),

  /**
    Invoked whenever your view needs to create its HTML representation.

    You will normally override this method in your subclassed views to
    provide whatever drawing functionality you will need in order to
    render your content.

    This method is usually only called once per view. After that, the update
    method will be called to allow you to update the existing HTML
    representation.


    The default implementation of this method calls renderChildViews().

    For backwards compatibility, this method will also call the appropriate
    method on a render delegate object, if your view has one.

    @param {SC.RenderContext} context the render context
    @returns {void}
  */
  render: function(context, firstTime) {
    var renderDelegate = this.get('renderDelegate');

    if (renderDelegate) {
      if (firstTime) {
        renderDelegate.render(this.get('renderDelegateProxy'), context);
      } else {
        renderDelegate.update(this.get('renderDelegateProxy'), context.$());
      }
    }
  },

  applyAttributesToContext: function(original, context) {
    original(context);

    var renderDelegate = this.get('renderDelegate');
    if (renderDelegate && renderDelegate.name) {
      context.addClass(renderDelegate.name);
    }
  }.enhance()
});
