// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace
  The `SC.ChildViewLayoutProtocol` protocol defines the properties and methods that you may
  implement in your custom child view layout plugins. The only required method for a plugin to
  implement is `layoutChildViews`.

  *Note: Do not mix `SC.ChildViewLayoutProtocol` into your classes. As a protocol, it exists only
  for reference sake. You only need define any of the properties or methods listed below in order to
  use this protocol.*
*/
SC.ChildViewLayoutProtocol = {

  /**
    An *optional* array of properties that should be observed on the child views in order
    to re-lay out the child views when changes occur. For example, most child
    view layout plugins will want to adjust the layout of the views whenever
    any view is hidden or becomes visible. Therefore, the parent view should
    re-run the child view layout whenever any child view's `isVisible` property
    changes and thus, `childLayoutProperties` should include at least the
    `isVisible` property name.

    For another example, the included stack child layout plugins both have the
    same `childLayoutProperties` defined:

        childLayoutProperties: ['marginBefore', 'marginAfter', 'isVisible']

    @type Array
  */
  childLayoutProperties: null,

  /**
    This *optional* method will be called when the view initializes itself. By
    returning `true` from this call, we would be indicating that whenever the
    view's size changes, it should re-lay out the child views.

    For instance, if the layout of the child views depends on the parent view's
    size, we should return `true`. If the layout of the child views is
    independent of the parent view's size, we can return false to improve
    performance.

    @param {SC.View} view The view that is using this plugin.
    @returns {Boolean} `true` if the view's size should be observed in order to re-lay out the child views.
  */
  layoutDependsOnSize: function (view) {},

  /**
    This *required* method will be called by the view each time that it needs
    to re-lay out its child views. The plugin should then as efficiently as
    possible, calculate each child views' new layout and call adjust on the
    child views.

    For code examples, see SC.View.VERTICAL_STACK and SC.View.HORIZONTAL_STACK
    in the core foundation framework.

    @param {SC.View} view The view that is using this plugin.
  */
  layoutChildViews: function (view) {}

};
