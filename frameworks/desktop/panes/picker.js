// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/palette');

/**
  Popular customized picker position rules:
  default: initiated just below the anchor.
           shift x, y to optimized picker visibility and make sure top-left corner is always visible.
  menu :   same as default rule +
           default(1, 4, 3) or custom offset below the anchor for default location to fine tuned visual alignment +
           enforce min left(7px)/right(8px) padding to the window
  fixed :  default(1, 4, 3) or custom offset below the anchor for default location to cope with specific anchor and skip fitPositionToScreen
  pointer :take default [0, 1, 2, 3, 2] or custom matrix to choose one of four perfect pointer positions.Ex:
           perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
           fallback to perfect top (2)
  menu-pointer :take default [3, 0, 1, 2, 3] or custom matrix to choose one of four perfect pointer positions.Ex:
          perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
          fallback to perfect bottom (3)
*/

/**
  @type String
  @constant
  @static
*/
SC.PICKER_MENU = 'menu';

/**
  @type String
  @constant
  @static
*/
SC.PICKER_FIXED = 'fixed';

/**
  @type String
  @constant
  @static
*/
SC.PICKER_POINTER = 'pointer';

/**
  @type String
  @constant
  @static
*/
SC.PICKER_MENU_POINTER = 'menu-pointer';

/**
  @class

  Display a non-modal pane that automatically repositions around a view so as
  to remain visible.

  An `SC.PickerPane` repositions around the view to which it is anchored as the
  browser window is resized so as to ensure the pane's content remains visible.
  A picker pane is useful for displaying supplementary information and does not
  block the user's interaction with other UI elements. Picker panes typically
  provide a better user experience than modal panels.

  An `SC.PickerPane` repositions itself according to the optional `preferMatrix`
  argument passed in the `.popup()` method call. The `preferMatrix` either
  specifies an offset-based arrangement behavior or a position-based arrangement
  behavior depending on the `preferType` argument in the `.popup()` call.

  The simplest way to create and display a picker pane:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(someView);

  This displays the `SC.PickerPane` anchored to `someView`.

  ## Positioning

  Picker pane positioning can be classified into two broad categories:
  offset-based and position-based.

  ### Offset-based

  When `preferType` is unspecified, `SC.PICKER_MENU` or `SC.PICKER_FIXED`, then
  the `preferMatrix` array describes the offset that is used to position the
  pane below the anchor. The offset is described by an array of three values,
  defaulting to `[1, 4, SC.POSITION_BOTTOM]`. The first value controls the x offset and the second
  value the y offset. The third value can be `SC.POSITION_RIGHT` (0) or `SC.POSITION_BOTTOM` (3),
  controlling whether the origin of the pane is further offset by the width
  (in the case of SC.POSITION_RIGHT) or the height (in the case of SC.POSITION_BOTTOM) of the anchor.

  ### Position-based

  When `preferType` is `SC.PICKER_POINTER` or `SC.PICKER_MENU_POINTER`, then
  the `preferMatrix` specifies the sides in the order in which you want the
  `SC.PickerPane` to try to arrange itself around the view to which it is
  anchored. The fifth element in the `preferMatrix` specifies which side the
  `SC.PickerPane` should display on when there isn't enough space around any
  of the preferred sides.

  The sides may be one of:

  * SC.POSITION_RIGHT (i.e. 0) - to the right of the anchor
  * SC.POSITION_LEFT (i.e. 1)- to the left of the anchor
  * SC.POSITION_TOP (i.e. 2) - above the anchor
  * SC.POSITION_BOTTOM (i.e. 3) - below the anchor

  For example, the `preferMatrix` of,

      [SC.POSITION_BOTTOM, SC.POSITION_RIGHT, SC.POSITION_LEFT, SC.POSITION_TOP, SC.POSITION_TOP],

  indicates: Display below the anchor (SC.POSITION_BOTTOM); if there isn't enough
  space then display to the right of the anchor (SC.POSITION_RIGHT).
  If there isn't enough space either below or to the right of the anchor, then appear
  to the left (SC.POSITION_LEFT), unless there is also no space on the left, in which case display
  above the anchor (SC.POSITION_TOP).

  Note: The position constants are simply the integers 0 to 3, so a short form
  of the example above would read,

      [3, 0, 1, 2, 2]

  ## Position Rules

  When invoking `.popup()` you can optionally specify a picker position rule with
  the `preferType` argument.

  If no `preferType` is specified, the picker pane is displayed just below the anchor.
  The pane will reposition automatically for optimal visibility, ensuring the top-left
  corner is visible.

  These position rules have the following behaviors:

  ### `SC.PICKER_MENU`

  Positioning is offset-based, with `preferMatrix` defaulting to `[1, 4, SC.POSITION_BOTTOM]`.
  Furthermore, a minimum left and right padding to window, of 7px and 8px, respectively,
  is enforced.


  ### `SC.PICKER_FIXED`

  Positioning is offset-based, with `preferMatrix` defaulting to `[1, 4, SC.POSITION_BOTTOM]` and
  skipping `fitPositionToScreen`.


  ### `SC.PICKER_POINTER`

  Positioning is position-based, with `preferMatrix` defaulting to `[SC.POSITION_RIGHT, SC.POSITION_LEFT, SC.POSITION_TOP, SC.POSITION_BOTTOM, SC.POSITION_TOP]` or `[0, 1, 2, 3, 2]` for short,
  i.e. right > left > top > bottom; fallback to top.


  ### `SC.PICKER_MENU_POINTER`

  Positioning is position-based, with `preferMatrix` defaulting to `[SC.POSITION_BOTTOM, SC.POSITION_RIGHT, SC.POSITION_LEFT, SC.POSITION_TOP, SC.POSITION_BOTTOM]` or `[3, 0, 1, 2, 3]` for short,
  i.e. bottom, right, left, top; fallback to bottom.


  ## Examples

  Examples for applying popular customized picker position rules:

  ### default:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor);

  ### menu below the anchor with default `preferMatrix` of `[1, 4, SC.POSITION_BOTTOM]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_MENU);

  ### menu on the right side of anchor with custom `preferMatrix` of `[2, 6, SC.POSITION_RIGHT]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_MENU, [2, 6, SC.POSITION_RIGHT]);

  ### fixed below the anchor with default `preferMatrix` of `[1, 4, SC.POSITION_BOTTOM]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_FIXED);

  ### fixed on the right side of anchor with `preferMatrix` of `[-22,-17, SC.POSITION_RIGHT]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_FIXED, [-22,-17, SC.POSITION_RIGHT]);

  ### pointer with default `preferMatrix` of `[SC.POSITION_RIGHT, SC.POSITION_LEFT, SC.POSITION_TOP, SC.POSITION_BOTTOM, SC.POSITION_TOP]` or `[0, 1, 2, 3, 2]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_POINTER);

  Positioning: SC.POSITION_RIGHT (0) > SC.POSITION_LEFT (1) > SC.POSITION_TOP (2) > SC.POSITION_BOTTOM (3). Fallback to SC.POSITION_TOP (2).

  ### pointer with custom `preferMatrix` of `[SC.POSITION_BOTTOM, SC.POSITION_RIGHT, SC.POSITION_LEFT, SC.POSITION_TOP, SC.POSITION_TOP]` or `[3, 0, 1, 2, 2]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_POINTER, [3, 0, 1, 2, 2]);

  Positioning: SC.POSITION_BOTTOM (3) > SC.POSITION_RIGHT (0) > SC.POSITION_LEFT (1) > SC.POSITION_TOP (2). Fallback to SC.POSITION_TOP (2).

  ### menu-pointer with default `preferMatrix` of `[SC.POSITION_BOTTOM, SC.POSITION_RIGHT, SC.POSITION_LEFT, SC.POSITION_TOP, SC.POSITION_BOTTOM]` or `[3, 0, 1, 2, 3]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_MENU_POINTER);

  Positioning: SC.POSITION_BOTTOM (3) > SC.POSITION_RIGHT (0) > SC.POSITION_LEFT (1) > SC.POSITION_TOP (2). Fallback to SC.POSITION_BOTTOM (3).

  ### Transition-In Special Handling

  This view has special behavior when used with SC.View's `transitionIn` plugin support. If the
  plugin defines `layoutProperties` of either `scale` or `rotate`, then the picker will adjust its
  transform origin X & Y position to appear to scale or rotate out of the anchor. The result is a
  very nice effect that picker panes appear to pop out of their anchors. To see it in effect,
  simply set the `transitionIn` property of the pane to one of `SC.View.SCALE_IN` or `SC.View.POP_IN`.

  @extends SC.PalettePane
  @since SproutCore 1.0
*/
SC.PickerPane = SC.PalettePane.extend(
/** @scope SC.PickerPane.prototype */ {

  //@if(debug)
  /** @private Debug-mode only flag for ensuring that the pane is appended via `popup`. */
  _sc_didUsePopup: false,
  //@endif

  /**
    @type Array
    @default ['sc-picker']
    @see SC.View#classNames
  */
  classNames: ['sc-picker'],

  /**
    @type Boolean
    @default YES
  */
  isAnchored: YES,

  /**
    @type Boolean
    @default YES
  */
  isModal: YES,

  /**
    @private
    TODO: Remove SC.POINTER_LAYOUT backward compatibility.
  */
  _sc_pointerLayout: SC.POINTER_LAYOUT || ['perfectRight', 'perfectLeft', 'perfectTop', 'perfectBottom'],

  /** @private
    @type String
    @default 'perfectRight'
  */
  pointerPos: 'perfectRight',

  /** @private
    @type Number
    @default 0
  */
  pointerPosX: 0,

  /** @private
    @type Number
    @default 0
  */
  pointerPosY: 0,

  /** @private
    When calling `popup`, you pass a view or element to anchor the pane. This
    property returns the anchor element. (If you've anchored to a view, this
    is its layer.) You can use this to properly position your view.

    @type HTMLElement
    @default null
  */
  anchorElement: function (key, value) {
    // Getter
    if (value === undefined) {
      if (this._anchorView) return this._anchorView.get('layer');
      else return this._anchorHTMLElement;
    }
    // Setter
    else {
      // Strip jQuery objects. (We do this first in case an empty one is passed in.)
      if (value && value.isCoreQuery) value = value[0];

      // Throw an error if a null or empty value is set. You're not allowed to go anchorless.
      // (TODO: why can't we go anchorless? positionPane happily centers an unmoored pane.)
      if (!value) {
        SC.throw("You must set 'anchorElement' to either a view or a DOM element");
      }

      // Clean up any previous anchor elements.
      this._removeScrollObservers();

      if (value.isView) {
        this._setupScrollObservers(value);
        this._anchorView        = value;
        this._anchorHTMLElement = null;
        return value.get('layer');
      }
      else {
        // TODO: We could setupScrollObservers on passed elements too, but it would
        // be a bit more complicated.
        this._anchorView        = null;
        this._anchorHTMLElement = value;
        return value;
      }
    }
  }.property().cacheable(),

  /** @private
    anchor rect calculated by computeAnchorRect from init popup

    @type Hash
    @default null
  */
  anchorCached: null,

  /**
    The type of picker pane.

    Picker panes can behave and appear in slightly differing ways
    depending on the value of `preferType`. By default, with no `preferType`
    specified, the pane will appear directly below the anchor element with
    its left side aligned to the anchor's left side.

    However, if you wish to position the pane by a specified offset to the
    right or below the anchor using the values of `preferMatrix` as an offset
    configuration, you can set `preferType` to one of `SC.PICKER_MENU` or
    `SC.PICKER_FIXED`. These two picker types both use the `preferMatrix` to
    adjust the position of the pane below or to the right of the anchor.

    The difference is that `SC.PICKER_MENU` also uses the `windowPadding`
    value to ensure that the pane doesn't go outside the bounds of the visible
    window.

    If you wish to position the pane on whichever side it will best fit and include
    a pointer, then you can use one of `SC.PICKER_POINTER` or `SC.PICKER_MENU_POINTER`
    for `preferType`. With this setting the pane will use the values of
    `preferMatrix` to indicate the preferred side of the anchor for the picker
    to appear.

    The difference between these two is that `SC.PICKER_MENU_POINTER` prefers
    to position below the anchor by default and `SC.PICKER_POINTER` prefers to
    position to the right of the anchor by default. As well, the `SC.PICKER_MENU_POINTER`
    type will resize itself if its height extends outside the visible window
    (which is useful for long menus that can scroll).

    @type String
    @default null
  */
  preferType: null,

  /**
    The configuration value for the current type of picker pane.

    This dual-purpose property controls the positioning of the pane depending
    on what the value of `preferType` is.

    ## Offset based use of `preferMatrix`

    For `preferType` of `SC.PICKER_MENU` or `SC.PICKER_FIXED`, `preferMatrix`
    determines the x and y offset of the pane from either the right or bottom
    side of the anchor. In this case, the `preferMatrix` should be an array of,

        [*x offset*, *y offset*, *offset position*]

    For example, to position the pane 10px directly below the anchor, we would
    use,

        preferMatrix: [0, 10, SC.POSITION_BOTTOM]

    To position the pane 10px down and 5px right of the anchor's right side,
    we would use,

        preferMatrix: [5, 10, SC.POSITION_RIGHT]

    ## Position based use of `preferMatrix`

    For `preferType` of `SC.PICKER_POINTER` or `SC.PICKER_MENU_POINTER`, `preferMatrix`
    determines the side of the anchor to appear on in order of preference.
    In this case, the `preferMatrix` should be an array of,

        [*preferred side*, *2nd preferred side*, *3rd preferred side*, *4th preferred side*, *fallback side if none fit*]

    Note that if the pane can't fit within the window bounds (including `windowPadding`)
    on any of the sides, then the last side is used as a fallback.

    @type Array
    @default preferType == SC.PICKER_MENU || preferType == SC.PICKER_FIXED ? [1, 4, SC.POSITION_BOTTOM] (i.e. [1, 4, 3])
    @default preferType == SC.PICKER_POINTER ? [SC.POSITION_RIGHT, SC.POSITION_LEFT, SC.POSITION_TOP, SC.POSITION_BOTTOM, SC.POSITION_TOP] (i.e. [0, 1, 2, 3, 2])
    @default preferType == SC.PICKER_MENU_POINTER ? [SC.POSITION_BOTTOM, SC.POSITION_RIGHT, SC.POSITION_LEFT, SC.POSITION_TOP, SC.POSITION_BOTTOM] (i.e. [3, 0, 1, 2, 3])
    @default null
  */
  preferMatrix: null,

  /**
    The offset of the pane from its target when positioned with `preferType` of
    `SC.PICKER_POINTER` or `SC.PICKER_MENU_POINTER`.

    When using `SC.PICKER_POINTER` or `SC.PICKER_MENU_POINTER` as the `preferType`,
    the pane will include a pointer element (ex. a small triangle on the side of
    the pane). This also means that the pane will be offset by an additional
    distance in order to make space for the pointer. The offset distance of each
    side is specified by `pointerOffset`.

    Therefore, if you are using a custom picker pane style or you would just
    like to change the default offsets, you should specify your own value like
    so:

        pointerOffset: [*right offset*, *left offset*, *top offset*, *bottom offset*]

    For example,

        // If the pane is to the right of the target, offset 15px further right for a left-side pointer.
        // If the pane is to the left of the target, offset -15px further left for a right-side pointer.
        // If the pane is above the target, offset -30px up for a bottom pointer.
        // If the pane is below the target, offset 20px down for a top pointer.
        pointerOffset: [15, -15, -30, 20]

    @type Array
    @default preferType == SC.PICKER_POINTER ? SC.PickerPane.PICKER_POINTER_OFFSET (i.e. [9, -9, -18, 18])
    @default preferType == SC.PICKER_MENU_POINTER && controlSize == SC.TINY_CONTROL_SIZE ? SC.PickerPane.TINY_PICKER_MENU_POINTER_OFFSET (i.e [9, -9, -18, 18])
    @default preferType == SC.PICKER_MENU_POINTER && controlSize == SC.SMALL_CONTROL_SIZE ? SC.PickerPane.SMALL_PICKER_MENU_POINTER_OFFSET (i.e [9, -9, -8, 8])
    @default preferType == SC.PICKER_MENU_POINTER && controlSize == SC.REGULAR_CONTROL_SIZE ? SC.PickerPane.REGULAR_PICKER_MENU_POINTER_OFFSET (i.e [9, -9, -12, 12])
    @default preferType == SC.PICKER_MENU_POINTER && controlSize == SC.LARGE_CONTROL_SIZE ? SC.PickerPane.LARGE_PICKER_MENU_POINTER_OFFSET (i.e [9, -9, -16, 16])
    @default preferType == SC.PICKER_MENU_POINTER && controlSize == SC.HUGE_CONTROL_SIZE ? SC.PickerPane.HUGE_PICKER_MENU_POINTER_OFFSET (i.e [9, -9, -18, 18])
    @default preferType == SC.PICKER_MENU_POINTER ? SC.PickerPane.REGULAR_PICKER_MENU_POINTER_OFFSET (i.e [9, -9, -12, 12])
  */
  pointerOffset: null,

  /** @deprecated Version 1.10.  Use windowPadding instead.
    default offset of extra-right pointer for picker-pointer or pointer-menu

    @type Number
    @default 0
  */
  extraRightOffset: function () {
    //@if (debug)
    SC.warn('SC.PickerPane#extraRightOffset is deprecated.  The pointer will position itself automatically.');
    //@endif

    return this.get('windowPadding');
  }.property('windowPadding').cacheable(),

  /**
    The target object to invoke the remove action on when the user clicks off the
    picker that is to be removed.

    If you set this target, the action will be called on the target object
    directly when the user clicks off the picker. If you leave this property
    set to null, then the button will search the responder chain for a view that
    implements the action when the button is pressed instead.

    @type Object
    @default null
  */
  removeTarget: null,

  /**
    The name of the action you want triggered when the user clicks off the
    picker pane that is to be removed.

    This property is used in conjunction with the removeTarget property to execute
    a method when the user clicks off the picker pane.

    If you do not set a target, then clicking off the picker pane will cause the
    responder chain to search for a view that implements the action you name
    here, if one was provided.

    Note that this property is optional. If no explicit value is provided then the
    picker pane will perform the default action which is to simply remove itself.

    @type String
    @default null
  */
  removeAction: null,


  /**
    Disable repositioning as the window or size changes. It stays in the original
    popup position.

    @type Boolean
    @default NO
  */
  repositionOnWindowResize: YES,


  /** @private
    Default padding around the window's edge that the pane will not overlap.

    This value is set to the value of SC.PickerPane.WINDOW_PADDING, except when
    using preferType of SC.PICKER_MENU_POINTER, where it will be set according
    to the `controlSize` value of the pane to one of:

      SC.PickerPane.TINY_MENU_WINDOW_PADDING
      SC.PickerPane.SMALL_MENU_WINDOW_PADDING
      SC.PickerPane.REGULAR_MENU_WINDOW_PADDING
      SC.PickerPane.LARGE_MENU_WINDOW_PADDING
      SC.PickerPane.HUGE_MENU_WINDOW_PADDING

    @type Number
    @default SC.PickerPane.WINDOW_PADDING
  */
  windowPadding: null,

  //@if(debug)
  // Provide some developer support. People have occasionally been misled by calling `append`
  // on PickerPanes, which fails to position the pane properly. Hopefully, we can give
  // them a clue to speed up finding the problem.
  /** @private SC.Pane */
  append: function () {
    if (!this._sc_didUsePopup) {
      SC.warn("Developer Warning: You should not use .append() with SC.PickerPane. Instead use .popup() and pass in an anchor view or element.");
    }

    this._sc_didUsePopup = false;

    return sc_super();
  },
  //@endif

  /* @private If the pane changes size, reposition as necessary. */
  viewDidResize: function () {
    // Don't forget to call the superclass method.
    sc_super();

    // Re-position.
    this.positionPane(true);
  },

  /**
    Displays a new picker pane.

    @param {SC.View|HTMLElement} anchorViewOrElement view or element to anchor to
    @param {String} [preferType] apply picker position rule
    @param {Array} [preferMatrix] apply custom offset or position pref matrix for specific preferType
    @param {Number} [pointerOffset]
    @returns {SC.PickerPane} receiver
  */
  popup: function (anchorViewOrElement, preferType, preferMatrix, pointerOffset) {
    this.beginPropertyChanges();
    this.setIfChanged('anchorElement', anchorViewOrElement);
    if (preferType) { this.set('preferType', preferType); }
    if (preferMatrix) { this.set('preferMatrix', preferMatrix); }
    if (pointerOffset) { this.set('pointerOffset', pointerOffset); }
    this.endPropertyChanges();
    this.positionPane();
    this._hideOverflow();

    //@if(debug)
    // A debug-mode only flag to indicate that the popup method was called (see override of append).
    this._sc_didUsePopup = true;
    //@endif

    return this.append();
  },

  /** @private
    The ideal position for a picker pane is just below the anchor that
    triggered it + offset of specific preferType. Find that ideal position,
    then call fitPositionToScreen to get final position. If anchor is missing,
    fallback to center.
  */
  positionPane: function (useAnchorCached) {
    var frame = this.get('borderFrame'),
      preferType = this.get('preferType'),
      preferMatrix = this.get('preferMatrix'),
      origin, adjustHash,
      anchor, anchorCached, anchorElement;

    // usually an anchorElement will be passed.  The ideal position is just
    // below the anchor + default or custom offset according to preferType.
    // If that is not possible, fitPositionToScreen will take care of that for
    // other alternative and fallback position.
    anchorCached = this.get('anchorCached');
    anchorElement = this.get('anchorElement');
    if (useAnchorCached && anchorCached) {
      anchor = anchorCached;
    } else if (anchorElement) {
      anchor = this.computeAnchorRect(anchorElement);
      this.set('anchorCached', anchor);
    } // else no anchor to use

    if (anchor) {
      origin = SC.cloneRect(anchor);

      // Adjust the origin for offset based positioning.
      switch (preferType) {
      case SC.PICKER_MENU:
      case SC.PICKER_FIXED:
        if (!preferMatrix || preferMatrix.length !== 3) {
          // default below the anchor with fine-tuned visual alignment
          // for Menu to appear just below the anchorElement.
          this.set('preferMatrix', [1, 4, 3]);
          preferMatrix = this.get('preferMatrix');
        }

        // fine-tuned visual alignment from preferMatrix
        origin.x += ((preferMatrix[2] === 0) ? origin.width : 0) + preferMatrix[0];
        origin.y += ((preferMatrix[2] === 3) ? origin.height : 0) + preferMatrix[1];
        break;
      default:
        origin.y += origin.height;
        break;
      }

      // Since we repeatedly need to know the half-width and half-height of the
      // frames, add those properties.
      anchor.halfWidth = parseInt(anchor.width * 0.5, 0);
      anchor.halfHeight = parseInt(anchor.height * 0.5, 0);

      // Don't pollute the borderFrame rect.
      frame = SC.cloneRect(frame);
      frame.halfWidth = parseInt(frame.width * 0.5, 0);
      frame.halfHeight = parseInt(frame.height * 0.5, 0);

      frame = this.fitPositionToScreen(origin, frame, anchor);

      // Create an adjustment layout from the computed position.
      adjustHash = {
        left: frame.x,
        top: frame.y
      };

      // If the computed position also constrains width or height, add it to the adjustment.
      /*jshint eqnull:true*/
      if (frame.width != null) {
        adjustHash.width = frame.width;
      }

      if (frame.height != null) {
        adjustHash.height = frame.height;
      }

      /*
        Special case behavior for transitions that include scale or rotate: notably SC.View.SCALE_IN and SC.View.POP_IN.

        We make an assumption that the picker should always scale out of the anchor, so we set the
        transform origin accordingly.
      */
      var transitionIn = this.get('transitionIn');
      if (transitionIn && (transitionIn.layoutProperties.indexOf('scale') >= 0 || transitionIn.layoutProperties.indexOf('rotate') >= 0)) {
        var transformOriginX, transformOriginY;

        switch (preferType) {
        // If the picker uses a pointer, set the origin to the pointer.
        case SC.PICKER_POINTER:
        case SC.PICKER_MENU_POINTER:
          switch (this.get('pointerPos')) {
          case 'perfectTop':
            transformOriginX = (frame.halfWidth + this.get('pointerPosX')) / frame.width;
            transformOriginY = 1;
            break;
          case 'perfectRight':
            transformOriginX = 0;
            transformOriginY = (frame.halfHeight + this.get('pointerPosY')) / frame.height;
            break;
          case 'perfectBottom':
            transformOriginX = (frame.halfWidth + this.get('pointerPosX')) / frame.width;
            transformOriginY = 0;
            break;
          case 'perfectLeft':
            transformOriginX = 1;
            transformOriginY = (frame.halfHeight + this.get('pointerPosY')) / frame.height;
            break;
          }
          break;

        // If the picker doesn't use a pointer, set the origin to the correct corner.
        case SC.PICKER_MENU:
        case SC.PICKER_FIXED:
          if (frame.x >= anchor.x) {
            transformOriginX = 0;
          } else {
            transformOriginX = 1;
          }
          if (frame.y >= anchor.y) {
            transformOriginY = 0;
          } else {
            transformOriginY = 1;
          }

          break;
        }

        adjustHash.transformOriginX = transformOriginX;
        adjustHash.transformOriginY = transformOriginY;
      }

      // Adjust.
      this.adjust(adjustHash);

    // if no anchor view has been set for some reason, just center.
    } else {
      this.adjust({
        centerX: 0,
        centerY: 0
      });
    }

    return this;
  },

  /** @private
    This method will return ret (x, y, width, height) from a rectangular element
    Notice: temp hack for calculating visible anchor height by counting height
    up to window bottom only. We do have 'clippingFrame' supported from view.
    But since our anchor can be element, we use this solution for now.
  */
  computeAnchorRect: function (anchor) {
    var bounding, ret, cq,
        wsize = SC.RootResponder.responder.computeWindowSize();
    // Some browsers natively implement getBoundingClientRect, so if it's
    // available we'll use it for speed.
    if (anchor.getBoundingClientRect) {
      // Webkit and Firefox 3.5 will get everything they need by
      // calling getBoundingClientRect()
      bounding = anchor.getBoundingClientRect();
      ret = {
        x:      bounding.left,
        y:      bounding.top,
        width:  bounding.width,
        height: bounding.height
      };
      // If width and height are undefined this means we are in IE or FF < 3.5
      // if we did not get the frame dimensions the do the calculations
      // based on an element
      if (ret.width === undefined || ret.height === undefined) {
        cq = SC.$(anchor);
        ret.width = cq.outerWidth();
        ret.height = cq.outerHeight();
      }
    } else {
      // Only really old versions will have to go through this code path.
      ret   = SC.offset(anchor); // get x & y
      cq    = SC.$(anchor);
      ret.width = cq.outerWidth();
      ret.height = cq.outerHeight();
    }
    ret.height = (wsize.height - ret.y) < ret.height ? (wsize.height - ret.y) : ret.height;

    if (!SC.browser.isIE && window.scrollX > 0 || window.scrollY > 0) {
      ret.x += window.scrollX;
      ret.y += window.scrollY;
    } else if (SC.browser.isIE && (document.documentElement.scrollTop > 0 || document.documentElement.scrollLeft > 0)) {
      ret.x += document.documentElement.scrollLeft;
      ret.y += document.documentElement.scrollTop;
    }
    return ret;
  },

  /** @private
    This method will dispatch to the correct re-position rule according to preferType
  */
  fitPositionToScreen: function (preferredPosition, frame, anchorFrame) {
    var windowSize = SC.RootResponder.responder.computeWindowSize(),
        windowFrame = { x: 0, y: 0, width: windowSize.width, height: windowSize.height };

    // if window size is smaller than the minimum size of app, use minimum size.
    var mainPane = SC.RootResponder.responder.mainPane;
    if (mainPane) {
      var minWidth = mainPane.layout.minWidth,
          minHeight = mainPane.layout.minHeight;

      if (minWidth && windowFrame.width < minWidth) {
        windowFrame.width = mainPane.layout.minWidth;
      }

      if (minHeight && windowFrame.height < minHeight) {
        windowFrame.height = mainPane.layout.minHeight;
      }
    }

    frame.x = preferredPosition.x;
    frame.y = preferredPosition.y;

    var preferType = this.get('preferType');
    if (preferType) {
      switch (preferType) {
      case SC.PICKER_MENU:
        // apply menu re-position rule
        frame = this.fitPositionToScreenMenu(windowFrame, frame, this.get('isSubMenu'));
        break;
      case SC.PICKER_MENU_POINTER:
        this.setupPointer(anchorFrame);
        frame = this.fitPositionToScreenMenuPointer(windowFrame, frame, anchorFrame);
        break;
      case SC.PICKER_POINTER:
        // apply pointer re-position rule
        this.setupPointer(anchorFrame);
        frame = this.fitPositionToScreenPointer(windowFrame, frame, anchorFrame);
        break;
      case SC.PICKER_FIXED:
        // skip fitPositionToScreen
        break;
      default:
        break;
      }
    } else {
      // apply default re-position rule
      frame = this.fitPositionToScreenDefault(windowFrame, frame, anchorFrame);
    }

    return frame;
  },

  /** @private
    re-position rule migrated from old SC.OverlayPaneView.
    shift x, y to optimized picker visibility and make sure top-left corner is always visible.
  */
  fitPositionToScreenDefault: function (windowFrame, frame, anchorFrame) {
    var maximum;

    // make sure the right edge fits on the screen.  If not, anchor to
    // right edge of anchor or right edge of window, whichever is closer.
    if (SC.maxX(frame) > windowFrame.width) {
      maximum = Math.max(SC.maxX(anchorFrame), frame.width);
      frame.x = Math.min(maximum, windowFrame.width) - frame.width;
    }

    // if the left edge is off of the screen, try to position at left edge
    // of anchor.  If that pushes right edge off screen, shift back until
    // right is on screen or left = 0
    if (SC.minX(frame) < 0) {
      frame.x = SC.minX(Math.max(anchorFrame, 0));
      if (SC.maxX(frame) > windowFrame.width) {
        frame.x = Math.max(0, windowFrame.width - frame.width);
      }
    }

    // make sure bottom edge fits on screen.  If not, try to anchor to top
    // of anchor or bottom edge of screen.
    if (SC.maxY(frame) > windowFrame.height) {
      maximum = Math.max((anchorFrame.y - frame.height), 0);
      if (maximum > windowFrame.height) {
        frame.y = Math.max(0, windowFrame.height - frame.height);
      } else { frame.y = maximum; }
    }

    // if top edge is off screen, try to anchor to bottom of anchor. If that
    // pushes off bottom edge, shift up until it is back on screen or top =0
    if (SC.minY(frame) < 0) {
      maximum = Math.min(SC.maxY(anchorFrame), (windowFrame.height - anchorFrame.height));
      frame.y = Math.max(maximum, 0);
    }

    return frame;
  },

  /** @private
    Reposition the pane in a way that is optimized for menus.

    Specifically, we want to ensure that the pane is at least 7 pixels from
    the left side of the screen, and 20 pixels from the right side.

    If the menu is a submenu, we also want to reposition the pane to the left
    of the parent menu if it would otherwise exceed the width of the viewport.
  */
  fitPositionToScreenMenu: function (windowFrame, frame, subMenu) {
    var windowPadding = this.get('windowPadding');

    // Set up init location for submenu
    if (subMenu) {
      frame.x -= this.get('submenuOffsetX');
      frame.y -= Math.floor(this.get('menuHeightPadding') / 2);
    }

    // Make sure we are at least the window padding from the left edge of the screen to start.
    if (frame.x < windowPadding) {
      frame.x = windowPadding;
    }

    // If the right edge of the pane is within the window padding of the right edge
    // of the window, we need to reposition it.
    if ((frame.x + frame.width + windowPadding) > windowFrame.width) {
      if (subMenu) {
        // Submenus should be re-anchored to the left of the parent menu
        frame.x = frame.x - (frame.width * 2);
      } else {
        // Otherwise, just shift the pane windowPadding pixels from the right edge
        frame.x = windowFrame.width - frame.width - windowPadding;
      }
    }

    // Make sure we are at least the window padding from the top edge of the screen to start.
    if (frame.y < windowPadding) {
      frame.y = windowPadding;
    }

    // If the height of the menu is bigger than the window height, shift it upward.
    if (frame.y + frame.height + windowPadding > windowFrame.height) {
      frame.y = Math.max(windowPadding, windowFrame.height - frame.height - windowPadding);
    }

    // If the height of the menu is still bigger than the window height, resize it.
    if (frame.y + frame.height + windowPadding > windowFrame.height) {
      frame.height = windowFrame.height - (2 * windowPadding);
    }

    return frame;
  },

  /** @private
    Reposition the pane in a way that is optimized for menus that have a
    point element.

    This simply calls fitPositionToScreenPointer, then ensures that the menu
    does not exceed the height of the viewport.

    @returns {Rect}
  */
  fitPositionToScreenMenuPointer: function (windowFrame, frame, anchorFrame) {
    frame = this.fitPositionToScreenPointer(windowFrame, frame, anchorFrame);

    // If the height of the menu is bigger than the window height, resize it.
    if (frame.height + frame.y + 35 >= windowFrame.height) {
      frame.height = windowFrame.height - frame.y - (SC.MenuPane.VERTICAL_OFFSET * 2);
    }

    return frame;
  },

  /** @private
    re-position rule for triangle pointer picker.
  */
  fitPositionToScreenPointer: function (windowFrame, frame, anchorFrame) {
    var curType,
        deltas,
        matrix = this.get('preferMatrix'),
        offset = this.get('pointerOffset'),
        topLefts, botRights,
        windowPadding = this.get('windowPadding');

    // Determine the top-left corner of each of the 4 perfectly positioned
    // frames, while taking the pointer offset into account.
    topLefts = [
      // Top left [x, y] if positioned evenly to the right of the anchor
      [anchorFrame.x + anchorFrame.width + offset[0], anchorFrame.y + anchorFrame.halfHeight - frame.halfHeight],

      // Top left [x, y] if positioned evenly to the left of the anchor
      [anchorFrame.x - frame.width + offset[1], anchorFrame.y + anchorFrame.halfHeight - frame.halfHeight],

      // Top left [x, y] if positioned evenly above the anchor
      [anchorFrame.x + anchorFrame.halfWidth - frame.halfWidth, anchorFrame.y - frame.height + offset[2]],

      // Top left [x, y] if positioned evenly below the anchor
      [anchorFrame.x + anchorFrame.halfWidth - frame.halfWidth, anchorFrame.y + anchorFrame.height + offset[3]]
    ];

    // Determine the bottom-right corner of each of the 4 perfectly positioned
    // frames, while taking the pointer offset into account.
    botRights = [
      // Bottom right [x, y] if positioned evenly to the right of the anchor
      [anchorFrame.x + anchorFrame.width + frame.width + offset[0], anchorFrame.y + anchorFrame.halfHeight + frame.halfHeight],

      // Bottom right [x, y] if positioned evenly to the left of the anchor
      [anchorFrame.x + offset[1], anchorFrame.y + anchorFrame.halfHeight + frame.halfHeight],

      // Bottom right [x, y] if positioned evenly above the anchor
      [anchorFrame.x + anchorFrame.halfWidth + frame.halfWidth, anchorFrame.y + offset[2]],

      // Bottom right [x, y] if positioned evenly below the anchor
      [anchorFrame.x + anchorFrame.halfWidth + frame.halfWidth, anchorFrame.y + anchorFrame.height + frame.height + offset[3]]
    ];

    // Loop through the preferred matrix, hopefully finding one that will fit
    // perfectly.
    for (var i = 0, pointerLen = this._sc_pointerLayout.length; i < pointerLen; i++) {
      // The current preferred side.
      curType = matrix[i];

      // Determine if any of the sides of the pane would go beyond the window's
      // edge for each of the 4 perfectly positioned frames; taking the amount
      // of windowPadding into account.  This is done by measuring the distance
      // from each side of the frame to the side of the window.  If the distance
      // is negative then the edge is overlapping.
      //
      // If a perfect position has no overlapping edges, then it is a viable
      // option for positioning.
      deltas = {
        top: topLefts[curType][1] - windowPadding,
        right: windowFrame.width - windowPadding - botRights[curType][0],
        bottom: windowFrame.height - windowPadding - botRights[curType][1],
        left: topLefts[curType][0] - windowPadding
      };

      // UNUSED.  It would be nice to get the picker as close as possible.
      // Cache the fallback deltas.
      // if (curType === matrix[4]) {
      //   fallbackDeltas = deltas;
      // }

      // If no edges overflow, then use this layout.
      if (deltas.top >= 0 &&
          deltas.right >= 0 &&
          deltas.bottom >= 0 &&
          deltas.left >= 0) {

        frame.x = topLefts[curType][0];
        frame.y = topLefts[curType][1];

        this.set('pointerPosX', 0);
        this.set('pointerPosY', 0);
        this.set('pointerPos', this._sc_pointerLayout[curType]);

        break;

      // If we prefer right or left and can fit right or left respectively, but
      // can't fit the top within the window top and padding, then check if by
      // adjusting the top of the pane down if it would still be beside the
      // anchor and still above the bottom of the window with padding.
      } else if (((curType === 0 && deltas.right >= 0) || // Right fits for preferred right
                 (curType === 1 &&  deltas.left >= 0)) && // or left fits for preferred left,
                 deltas.top < 0 && // but top doesn't fit,
                 deltas.top + frame.halfHeight >= 0) {  // yet it could.

        // Adjust the pane position by the amount of downward shifting.
        frame.x = topLefts[curType][0];
        frame.y = topLefts[curType][1] - deltas.top;

        // Offset the pointer position by the opposite amount of downward
        // shifting (minus half the height of the pointer).
        this.set('pointerPosX', 0);
        this.set('pointerPosY', deltas.top);
        this.set('pointerPos', this._sc_pointerLayout[curType]);
        break;

      // If we prefer right or left and can fit right or left respectively, but
      // can't fit the bottom within the window bottom and padding, then check
      // if by adjusting the top of the pane up if it would still be beside the
      // anchor and still below the top of the window with padding.
      } else if (((curType === 0 && deltas.right >= 0) || // Right fits for preferred right
                 (curType === 1 &&  deltas.left >= 0)) && // or left fits for preferred left,
                 deltas.bottom < 0 && // but bottom doesn't fit,
                 deltas.bottom + frame.halfHeight >= 0) {  // yet it could.

        // Adjust the pane position by the amount of upward shifting.
        frame.x = topLefts[curType][0];
        frame.y = topLefts[curType][1] + deltas.bottom;

        // Offset the pointer position by the opposite amount of upward
        // shifting (minus half the height of the pointer).
        this.set('pointerPosX', 0);
        this.set('pointerPosY', Math.abs(deltas.bottom));
        this.set('pointerPos', this._sc_pointerLayout[curType]);
        break;

      // If we prefer top or bottom and can fit top or bottom respectively, but
      // can't fit the right side within the window right side plus padding,
      // then check if by adjusting the pane leftwards to fit if it would still
      // be beside the anchor and still fit within the left side of the window
      // with padding.
      } else if (((curType === 2 && deltas.top >= 0) || // Top fits for preferred top
                 (curType === 3 &&  deltas.bottom >= 0)) && // or bottom fits for preferred bottom,
                 deltas.right < 0 && // but right doesn't fit,
                 deltas.right + frame.halfWidth >= 0) {  // yet it could.

        // Adjust the pane position by the amount of leftward shifting.
        frame.x = topLefts[curType][0] + deltas.right;
        frame.y = topLefts[curType][1];

        // Offset the pointer position by the opposite amount of leftward
        // shifting (minus half the width of the pointer).
        this.set('pointerPosX', Math.abs(deltas.right));
        this.set('pointerPosY', 0);
        this.set('pointerPos', this._sc_pointerLayout[curType]);
        break;

      // If we prefer top or bottom and can fit top or bottom respectively, but
      // can't fit the left side within the window left side plus padding,
      // then check if by adjusting the pane rightwards to fit if it would still
      // be beside the anchor and still fit within the right side of the window
      // with padding.
      } else if (((curType === 2 && deltas.top >= 0) || // Top fits for preferred top
                 (curType === 3 &&  deltas.bottom >= 0)) && // or bottom fits for preferred bottom,
                 deltas.left < 0 && // but left doesn't fit,
                 deltas.left + frame.halfWidth >= 0) {  // yet it could.

        // Adjust the pane position by the amount of leftward shifting.
        frame.x = topLefts[curType][0] - deltas.left;
        frame.y = topLefts[curType][1];

        // Offset the pointer position by the opposite amount of leftward
        // shifting (minus half the width of the pointer).
        this.set('pointerPosX', deltas.left);
        this.set('pointerPosY', 0);
        this.set('pointerPos', this._sc_pointerLayout[curType]);
        break;
      }

    }

    // If no arrangement was found to fit, then use the fall back preferred type.
    if (i === pointerLen) {
      if (matrix[4] === -1) {
        frame.x = anchorFrame.x + anchorFrame.halfWidth;
        frame.y = anchorFrame.y + anchorFrame.halfHeight - frame.halfHeight;

        this.set('pointerPos', this._sc_pointerLayout[0] + ' fallback');
        this.set('pointerPosY', frame.halfHeight - 40);
      } else {
        frame.x = topLefts[matrix[4]][0];
        frame.y = topLefts[matrix[4]][1];

        this.set('pointerPos', this._sc_pointerLayout[matrix[4]]);
        this.set('pointerPosY', 0);
      }

      this.set('pointerPosX', 0);
    }

    this.invokeLast(this._adjustPointerPosition);

    return frame;
  },

  /** @private Measure the pointer element and adjust it by the determined offset. */
  _adjustPointerPosition: function () {
    var pointer = this.$('.sc-pointer'),
      pointerPos = this.get('pointerPos'),
      marginLeft,
      marginTop;

    switch (pointerPos) {
    case 'perfectRight':
    case 'perfectLeft':
      marginTop = -Math.round(pointer.outerHeight() / 2);
      marginTop += this.get('pointerPosY');
      pointer.attr('style', "margin-top: " + marginTop + "px");
      break;
    case 'perfectTop':
    case 'perfectBottom':
      marginLeft = -Math.round(pointer.outerWidth() / 2);
      marginLeft += this.get('pointerPosX');
      pointer.attr('style', "margin-left: " + marginLeft + "px;");
      break;
    }
  },

  /** @private
    This method will set up pointerOffset and preferMatrix according to type
    and size if not provided explicitly.
  */
  setupPointer: function (a) {
    var pointerOffset = this.get('pointerOffset'),
        K = SC.PickerPane;

    // Set windowPadding and pointerOffset (SC.PICKER_MENU_POINTER only).
    if (!pointerOffset || pointerOffset.length !== 4) {
      if (this.get('preferType') === SC.PICKER_MENU || this.get('preferType') === SC.PICKER_MENU_POINTER) {
        switch (this.get('controlSize')) {
        case SC.TINY_CONTROL_SIZE:
          this.set('pointerOffset', K.TINY_PICKER_MENU_POINTER_OFFSET);
          this.set('windowPadding', K.TINY_MENU_WINDOW_PADDING);
          break;
        case SC.SMALL_CONTROL_SIZE:
          this.set('pointerOffset', K.SMALL_PICKER_MENU_POINTER_OFFSET);
          this.set('windowPadding', K.SMALL_MENU_WINDOW_PADDING);
          break;
        case SC.REGULAR_CONTROL_SIZE:
          this.set('pointerOffset', K.REGULAR_PICKER_MENU_POINTER_OFFSET);
          this.set('windowPadding', K.REGULAR_MENU_WINDOW_PADDING);
          break;
        case SC.LARGE_CONTROL_SIZE:
          this.set('pointerOffset', K.LARGE_PICKER_MENU_POINTER_OFFSET);
          this.set('windowPadding', K.LARGE_MENU_WINDOW_PADDING);
          break;
        case SC.HUGE_CONTROL_SIZE:
          this.set('pointerOffset', K.HUGE_PICKER_MENU_POINTER_OFFSET);
          this.set('windowPadding', K.HUGE_MENU_WINDOW_PADDING);
          break;
        default:
          this.set('pointerOffset', K.REGULAR_PICKER_MENU_POINTER_OFFSET);
          this.set('windowPadding', K.REGULAR_MENU_WINDOW_PADDING);
          //@if(debug)
          SC.warn('SC.PickerPane with preferType of SC.PICKER_MENU_POINTER should either define a controlSize or provide a pointerOffset. SC.PickerPane will fall back to default pointerOffset of SC.PickerPane.REGULAR_PICKER_MENU_POINTER_OFFSET and default windowPadding of SC.PickerPane.WINDOW_PADDING');
          //@endif
        }
      } else {
        var overlapTuningX = (a.width < 16)  ? ((a.width < 4)  ? 9 : 6) : 0,
            overlapTuningY = (a.height < 16) ? ((a.height < 4) ? 9 : 6) : 0,
            offsetKey      = K.PICKER_POINTER_OFFSET;

        var offset = [offsetKey[0] + overlapTuningX,
                      offsetKey[1] - overlapTuningX,
                      offsetKey[2] - overlapTuningY,
                      offsetKey[3] + overlapTuningY];

        this.set('pointerOffset', offset);
      }
    }

    // set up preferMatrix according to type if not provided explicitly:
    // take default [0, 1, 2, 3, 2] for picker, [3, 0, 1, 2, 3] for menu picker if
    // custom matrix not provided explicitly
    var preferMatrix = this.get('preferMatrix');
    if (!preferMatrix || preferMatrix.length !== 5) {
      // menu-picker default re-position rule :
      // perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
      // fallback to perfect bottom (3)
      // picker default re-position rule :
      // perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
      // fallback to perfect top (2)
      this.set('preferMatrix', this.get('preferType') === SC.PICKER_MENU_POINTER ? [3, 2, 1, 0, 3] : [0, 1, 2, 3, 2]);
    }
  },

  /**
    @type Array
    @default ['pointerPos']
    @see SC.View#displayProperties
  */
  displayProperties: ['pointerPos'],

  /**
    @type String
    @default 'pickerRenderDelegate'
  */
  renderDelegateName: 'pickerRenderDelegate',

  /** @private - click away picker. */
  modalPaneDidClick: function (evt) {
    var f = this.get('frame'),
        target = this.get('removeTarget') || null,
        action = this.get('removeAction'),
        rootResponder = this.get('rootResponder');

    if (!this.clickInside(f, evt)) {
      // We're not in the Pane so we must be in the modal
      if (action) {
        rootResponder.sendAction(action, target, this, this, null, this);
      } else {
        this.remove();
      }

      return YES;
    }

    return NO;
  },

  /** @private */
  mouseDown: function (evt) {
    return this.modalPaneDidClick(evt);
  },

  /** @private
    internal method to define the range for clicking inside so the picker
    won't be clicked away default is the range of contentView frame.
    Over-write for adjustments. ex: shadow
  */
  clickInside: function (frame, evt) {
    return SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame);
  },

  /**
    Invoked by the root responder. Re-position picker whenever the window resizes.
  */
  windowSizeDidChange: function (oldSize, newSize) {
    sc_super();

    if (this.repositionOnWindowResize) {
      // Do this in the next run loop. This ensures that positionPane is only called once even if scroll view
      // offsets are changing at the same time as the window is resizing (see _scrollOffsetDidChange below).
      this.invokeNext(this.positionPane);
    }
  },

  remove: function () {
    if (this.get('isVisibleInWindow')) {
      this._withdrawOverflowRequest();
    }
    this._removeScrollObservers();

    return sc_super();
  },

  /** @private
    Internal method to hide the overflow on the body to make sure we don't
    show scrollbars when the picker has shadows, as it's really annoying.
  */
  _hideOverflow: function () {
    var main = SC.$('.sc-main'),
        minWidth = parseInt(main.css('minWidth'), 0),
        minHeight = parseInt(main.css('minHeight'), 0),
        windowSize = SC.RootResponder.responder.get('currentWindowSize');

    if (windowSize.width >= minWidth && windowSize.height >= minHeight) {
      SC.bodyOverflowArbitrator.requestHidden(this);
    }
  },

  /** @private
    Internal method to show the overflow on the body to make sure we don't
    show scrollbars when the picker has shadows, as it's really annoying.
  */
  _withdrawOverflowRequest: function () {
    SC.bodyOverflowArbitrator.withdrawRequest(this);
  },

  /** @private
    Detect if view is inside a scroll view. Do this by traversing parent view
    hierarchy until you hit a scroll view or main pane.
  */
  _getScrollViewOfView: function (view) {
    var curLevel = view;
    while (curLevel) {
      if (curLevel.isScrollable) {
        break;
      }

      curLevel = curLevel.get('parentView');
    }

    return curLevel;
  },

  /** @private
    If anchor view is in a scroll view, setup observers on scroll offsets.
  */
  _setupScrollObservers: function (anchorView) {
    var scrollView = this._getScrollViewOfView(anchorView);
    if (scrollView) {
      scrollView.addObserver('canScrollHorizontal', this, this._scrollCanScrollHorizontalDidChange);
      scrollView.addObserver('canScrollVertical', this, this._scrollCanScrollVerticalDidChange);

      // Fire the observers once to initialize them.
      this._scrollCanScrollHorizontalDidChange(scrollView);
      this._scrollCanScrollVerticalDidChange(scrollView);

      this._scrollView = scrollView;
    }
  },

  /** @private Modify horizontalScrollOffset observer. */
  _scrollCanScrollHorizontalDidChange: function (scrollView) {
    if (scrollView.get('canScrollHorizontal')) {
      scrollView.addObserver('horizontalScrollOffset', this, this._scrollOffsetDidChange);
    } else {
      scrollView.removeObserver('horizontalScrollOffset', this, this._scrollOffsetDidChange);
    }
  },

  /** @private Modify verticalScrollOffset observer. */
  _scrollCanScrollVerticalDidChange: function (scrollView) {
    if (scrollView.get('canScrollVertical')) {
      scrollView.addObserver('verticalScrollOffset', this, this._scrollOffsetDidChange);
    } else {
      scrollView.removeObserver('verticalScrollOffset', this, this._scrollOffsetDidChange);
    }
  },

  /** @private Teardown observers setup in _setupScrollObservers. */
  _removeScrollObservers: function () {
    var scrollView = this._scrollView;
    if (scrollView) {
      scrollView.removeObserver('canScrollHorizontal', this, this._scrollCanScrollHorizontalDidChange);
      scrollView.removeObserver('canScrollVertical', this, this._scrollCanScrollVerticalDidChange);
      scrollView.removeObserver('horizontalScrollOffset', this, this._scrollOffsetDidChange);
      scrollView.removeObserver('verticalScrollOffset', this, this._scrollOffsetDidChange);
    }
  },

  /** @private Reposition pane whenever scroll offsets change. */
  _scrollOffsetDidChange: function () {
    // Filter the observer firing. We don't want to reposition multiple times if both horizontal and vertical
    // scroll offsets are updating.
    // Note: do this *after* the current run loop finishes. This allows the scroll view to scroll to
    // actually move so that the anchor's position is correct before we reposition.
    this.invokeNext(this.positionPane);
  },

  /** @private SC.Object */
  init: function () {
    sc_super();

    // Set defaults that can only be configured on initialization.
    if (!this.windowPadding) { this.windowPadding = SC.PickerPane.WINDOW_PADDING; }
  },

  /** @private SC.Object */
  destroy: function () {
    this._scrollView = null;
    this._anchorView = null;
    this._anchorHTMLElement = null;
    return sc_super();
  }

});


/** Class methods. */
SC.PickerPane.mixin( /** @scope SC.PickerPane */ {

  //---------------------------------------------------------------------------
  // Constants
  //

  /** @static */
  WINDOW_PADDING: 20,

  /** @static */
  TINY_MENU_WINDOW_PADDING: 12,

  /** @static */
  SMALL_MENU_WINDOW_PADDING: 11,

  /** @static */
  REGULAR_MENU_WINDOW_PADDING: 12,

  /** @static */
  LARGE_MENU_WINDOW_PADDING: 17,

  /** @static */
  HUGE_MENU_WINDOW_PADDING: 12,

  /** @static */
  PICKER_POINTER_OFFSET: [9, -9, -18, 18],

  /** @static */
  TINY_PICKER_MENU_POINTER_OFFSET: [9, -9, -18, 18],

  /** @static */
  SMALL_PICKER_MENU_POINTER_OFFSET: [9, -9, -8, 8],

  /** @static */
  REGULAR_PICKER_MENU_POINTER_OFFSET: [9, -9, -12, 12],

  /** @static */
  LARGE_PICKER_MENU_POINTER_OFFSET: [9, -9, -16, 16],

  /** @static */
  HUGE_PICKER_MENU_POINTER_OFFSET: [9, -9, -18, 18],

  /** @deprecated Version 1.10.  Use SC.PickerPane.WINDOW_PADDING.
    @static
  */
  PICKER_EXTRA_RIGHT_OFFSET: 20,

  /** @deprecated Version 1.10.  Use SC.PickerPane.TINY_MENU_WINDOW_PADDING.
    @static
  */
  TINY_PICKER_MENU_EXTRA_RIGHT_OFFSET: 12,

  /** @deprecated Version 1.10.  Use SC.PickerPane.SMALL_MENU_WINDOW_PADDING.
    @static
  */
  SMALL_PICKER_MENU_EXTRA_RIGHT_OFFSET: 11,

  /** @deprecated Version 1.10.  Use SC.PickerPane.REGULAR_MENU_WINDOW_PADDING.
    @static
  */
  REGULAR_PICKER_MENU_EXTRA_RIGHT_OFFSET: 12,

  /** @deprecated Version 1.10.  Use SC.PickerPane.LARGE_MENU_WINDOW_PADDING.
    @static
  */
  LARGE_PICKER_MENU_EXTRA_RIGHT_OFFSET: 17,

  /** @deprecated Version 1.10.  Use SC.PickerPane.HUGE_MENU_WINDOW_PADDING.
    @static
  */
  HUGE_PICKER_MENU_EXTRA_RIGHT_OFFSET: 12

});
