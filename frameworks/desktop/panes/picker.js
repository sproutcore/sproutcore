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
           default(1,4,3) or custom offset below the anchor for default location to fine tuned visual alignment +
           enforce min left(7px)/right(8px) padding to the window
  fixed :  default(1,4,3) or custom offset below the anchor for default location to cope with specific anchor and skip fitPositionToScreen
  pointer :take default [0,1,2,3,2] or custom matrix to choose one of four perfect pointer positions.Ex:
           perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
           fallback to perfect top (2)
  menu-pointer :take default [3,0,1,2,3] or custom matrix to choose one of four perfect pointer positions.Ex:
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
  Pointer layout for perfect right/left/top/bottom.

  @constant
  @static
*/
SC.POINTER_LAYOUT = ["perfectRight", "perfectLeft", "perfectTop", "perfectBottom"];

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
  defaulting to `[1, 4, 3]`. The first value controls the x offset and the second
  value the y offset. The third value can be `0` (right) or `3` (bottom),
  controlling whether the origin of the pane is further offset by the width
  (in the case of 0) or the height (in the case of 3) of the anchor.

  ### Position-based

  When `preferType` is `SC.PICKER_POINTER` or `SC.PICKER_MENU_POINTER`, then
  the `preferMatrix` specifies the sides in the order in which you want the
  `SC.PickerPane` to try to arrange itself around the view to which it is
  anchored. The fifth element in the `preferMatrix` specifies which side the
  `SC.PickerPane` should display on when there isn't enough space around any
  of the preferred sides.

  Anchor sides are defined by their index in `SC.POINTER_LAYOUT`, where right
  is `0`, left is `1`, top is `2`, and bottom is `3`.

  For example, the `preferMatrix` of `[3, 0, 1, 2, 2]` says: "Display below the
  anchor (3); if there isn't enough space then display to the right of the anchor (0).
  If there isn't enough space either below or to the right of the anchor, then appear
  to the left (1), unless there is also no space on the left, in which case display
  above the anchor (2)."

  ## Position Rules

  When invoking `.popup()` you can optionally specify a picker position rule with
  the `preferType` argument.

  If no `preferType` is specified, the picker pane is displayed just below the anchor.
  The pane will reposition automatically for optimal visibility, ensuring the top-left
  corner is visible.

  These position rules have the following behaviors:

  ### `SC.PICKER_MENU`

  Positioning is offset-based, with `preferMatrix` defaulting to `[1, 4, 3]`.
  Furthermore, a minimum left and right padding to window, of 7px and 8px, respectively,
  is enforced.


  ### `SC.PICKER_FIXED`

  Positioning is offset-based, with `preferMatrix` defaulting to `[1, 4, 3]` and
  skipping `fitPositionToScreen`.


  ### `SC.PICKER_POINTER`

  Positioning is position-based, with `preferMatrix` defaulting to `[0, 1, 2, 3, 2]`,
  i.e. right > left > top > bottom; fallback to top.


  ### `SC.PICKER_MENU_POINTER`

  Positioning is position-based, with `preferMatrix` defaulting to `[3, 0, 1, 2, 3]`,
  i.e. bottom, right, left, top; fallback to bottom.



  ## Examples

  Examples for applying popular customized picker position rules:

  ### default:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor);

  ### menu below the anchor with default `preferMatrix` of `[1,4,3]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_MENU);

  ### menu on the right side of anchor with custom `preferMatrix` of `[2,6,0]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_MENU, [2,6,0]);

  ### fixed below the anchor with default `preferMatrix` of `[1,4,3]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_FIXED);

  ### fixed on the right side of anchor with `preferMatrix` of `[-22,-17,0]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_FIXED, [-22,-17,0]);

  ### pointer with default `preferMatrix` of `[0,1,2,3,2]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_POINTER);

  Positioning: right (0) > left (1) > top (2) > bottom (3). Fallback to top (2).

  ### pointer with custom `preferMatrix` of `[3,0,1,2,2]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_POINTER, [3,0,1,2,2]);

  Positioning: bottom (3) > right (0) > left (1) > top (2). Fallback to top (2).

  ### menu-pointer with default `preferMatrix` of `[3,0,1,2,3]`:

      SC.PickerPane.create({
        layout: { width: 400, height: 200 },
        contentView: SC.View.extend({})
      }).popup(anchor, SC.PICKER_MENU_POINTER);

  Positioning: bottom (3) > right (0) > left (1) > top (2). Fallback to bottom (3).

  @extends SC.PalettePane
  @since SproutCore 1.0
*/
SC.PickerPane = SC.PalettePane.extend(
/** @scope SC.PickerPane.prototype */ {

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
    @type String
    @default 'perfectRight'
  */
  pointerPos: 'perfectRight',

  /**
    @type Number
    @default 0
  */
  pointerPosX: 0,

  /**
    @type Number
    @default 0
  */
  pointerPosY: 0,

  /**
    This property will be set to the element (or view.get('layer')) that
    triggered your picker to show.  You can use this to properly position your
    picker.

    @type HTMLElement
    @default null
  */
  anchorElement: null,

  /** @private
    anchor rect calculated by computeAnchorRect from init popup

    @type Hash
    @default null
  */
  anchorCached: null,

  /**
    popular customized picker position rule

    @type String
    @default null
  */
  preferType: null,

  /**
    default/custom offset or position pref matrix for specific preferType

    @type String
    @default null
  */
  preferMatrix: null,

  /**
    default/custom offset of pointer for picker-pointer or pointer-menu

    @type Array
    @default null
  */
  pointerOffset: null,

  /**
    default offset of extra-right pointer for picker-pointer or pointer-menu

    @type Number
    @default 0
  */
  extraRightOffset: 0,

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
  
  _anchorView: null,
  _anchorHTMLElement: null,
  
  /**
    Displays a new picker pane.

    @param {SC.View|HTMLElement} anchorViewOrElement view or element to anchor to
    @param {String} [preferType] apply picker position rule
    @param {Array} [preferMatrix] apply custom offset or position pref matrix for specific preferType
    @param {Number} [pointerOffset]
    @returns {SC.PickerPane} receiver
  */
  popup: function(anchorViewOrElement, preferType, preferMatrix, pointerOffset) {
    if(anchorViewOrElement){
      if (anchorViewOrElement.isView) {
        this._anchorView = anchorViewOrElement;
        this._setupScrollObservers(anchorViewOrElement);
      } else {
        this._anchorHTMLElement = anchorViewOrElement;
      }
    }
    this.beginPropertyChanges();
    if (preferType) this.set('preferType',preferType) ;
    if (preferMatrix) this.set('preferMatrix',preferMatrix) ;
    if (pointerOffset) this.set('pointerOffset',pointerOffset) ;
    this.endPropertyChanges();
    this.positionPane();
    this._hideOverflow();
    return this.append();
  },

  /** @private
    The ideal position for a picker pane is just below the anchor that
    triggered it + offset of specific preferType. Find that ideal position,
    then call fitPositionToScreen to get final position. If anchor is missing,
    fallback to center.
  */
  positionPane: function(useAnchorCached) {
    useAnchorCached = useAnchorCached && this.get('anchorCached');

    var anchor       = useAnchorCached ? this.get('anchorCached') : this.get('anchorElement'),
        preferType   = this.get('preferType'),
        preferMatrix = this.get('preferMatrix'),
        layout       = this.get('layout'),
        origin;


    // usually an anchorElement will be passed.  The ideal position is just
    // below the anchor + default or custom offset according to preferType.
    // If that is not possible, fitPositionToScreen will take care of that for
    // other alternative and fallback position.

    if (anchor) {
      if(!useAnchorCached) {
        anchor = this.computeAnchorRect(anchor);
        this.set('anchorCached', anchor) ;
      }
      if(anchor.x ===0 && anchor.y ===0) return ;
      origin = SC.cloneRect(anchor);

      if (preferType) {
        switch (preferType) {
          case SC.PICKER_MENU:
          case SC.PICKER_FIXED:
            if(!preferMatrix || preferMatrix.length !== 3) {
              // default below the anchor with fine-tuned visual alignment
              // for Menu to appear just below the anchorElement.
              this.set('preferMatrix', [1, 4, 3]) ;
            }

            // fine-tuned visual alignment from preferMatrix
            origin.x += ((this.preferMatrix[2]===0) ? origin.width : 0) + this.preferMatrix[0] ;
            origin.y += ((this.preferMatrix[2]===3) ? origin.height : 0) + this.preferMatrix[1];
            break;
          default:
            origin.y += origin.height ;
            break;
        }
      } else {
        origin.y += origin.height ;
      }
      origin = this.fitPositionToScreen(origin, this.get('frame'), anchor) ;

      this.adjust({ width: origin.width, height: origin.height, left: origin.x, top: origin.y });
    // if no anchor view has been set for some reason, just center.
    } else {
      this.adjust({ width: layout.width, height: layout.height, centerX: 0, centerY: 0 });
    }
    this.updateLayout();
    return this ;
  },

  /** @private
    This method will return ret (x, y, width, height) from a rectangular element
    Notice: temp hack for calculating visible anchor height by counting height
    up to window bottom only. We do have 'clippingFrame' supported from view.
    But since our anchor can be element, we use this solution for now.
  */
  computeAnchorRect: function(anchor) {
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
      // If width and height are undefined this means we are in IE or FF<3.5
      // if we did not get the frame dimensions the do the calculations
      // based on an element
      if(ret.width===undefined || ret.height===undefined){
        cq = SC.$(anchor);
        ret.width = cq.outerWidth();
        ret.height = cq.outerHeight();
      }
    }
    else {
      // Only really old versions will have to go through this code path.
      ret   = SC.offset(anchor); // get x & y
      cq    = SC.$(anchor);
      ret.width = cq.outerWidth();
      ret.height = cq.outerHeight();
    }
    ret.height = (wsize.height-ret.y) < ret.height ? (wsize.height-ret.y) : ret.height;
    if(!SC.browser.msie && window.scrollX>0 || window.scrollY>0){
      ret.x+=window.scrollX;
      ret.y+=window.scrollY;
    }else if(SC.browser.msie && (document.documentElement.scrollTop>0 || document.documentElement.scrollLeft>0)){
      ret.x+=document.documentElement.scrollLeft;
      ret.y+=document.documentElement.scrollTop;
    }
    return ret ;
  },

  /** @private
    This method will dispatch to the right re-position rule according to preferType
  */
  fitPositionToScreen: function(preferredPosition, picker, anchor) {
    // get window rect.
    //if(this._prefPosX && this._prefPosY)

    var wsize = SC.RootResponder.responder.computeWindowSize(),
        wret = { x: 0, y: 0, width: wsize.width, height: wsize.height } ;

    // if window size is smaller than the minimum size of app, use minimum size.
    var mainPane = SC.RootResponder.responder.mainPane;
    if (mainPane) {
      var minWidth = mainPane.layout.minWidth,
          minHeight = mainPane.layout.minHeight;
      if (minWidth && wret.width < minWidth) {
        wret.width = mainPane.layout.minWidth;
      }
      if (minHeight && wret.height < minHeight) {
        wret.height = mainPane.layout.minHeight;
      }
    }
        
    picker.x = preferredPosition.x ; picker.y = preferredPosition.y ;

    if(this.preferType) {
      switch(this.preferType) {
        case SC.PICKER_MENU:
          // apply menu re-position rule
          picker = this.fitPositionToScreenMenu(wret, picker, this.get('isSubMenu')) ;
          break;
        case SC.PICKER_MENU_POINTER:
          this.setupPointer(anchor);
          picker = this.fitPositionToScreenMenuPointer(wret, picker, anchor);
          break;
        case SC.PICKER_POINTER:
          // apply pointer re-position rule
          this.setupPointer(anchor);
          picker = this.fitPositionToScreenPointer(wret, picker, anchor) ;
          break;

        case SC.PICKER_FIXED:
          // skip fitPositionToScreen
          break;
        default:
          break;
      }
    } else {
      // apply default re-position rule
      picker = this.fitPositionToScreenDefault(wret, picker, anchor) ;
    }
    this.displayDidChange();
    return picker ;
  },

  /** @private
    re-position rule migrated from old SC.OverlayPaneView.
    shift x, y to optimized picker visibility and make sure top-left corner is always visible.
  */
  fitPositionToScreenDefault: function(w, f, a) {
    // make sure the right edge fits on the screen.  If not, anchor to
    // right edge of anchor or right edge of window, whichever is closer.
    if (SC.maxX(f) > w.width) {
      var mx = Math.max(SC.maxX(a), f.width) ;
      f.x = Math.min(mx, w.width) - f.width ;
    }

    // if the left edge is off of the screen, try to position at left edge
    // of anchor.  If that pushes right edge off screen, shift back until
    // right is on screen or left = 0
    if (SC.minX(f) < 0) {
      f.x = SC.minX(Math.max(a,0)) ;
      if (SC.maxX(f) > w.width) {
        f.x = Math.max(0, w.width - f.width);
      }
    }

    // make sure bottom edge fits on screen.  If not, try to anchor to top
    // of anchor or bottom edge of screen.
    if (SC.maxY(f) > w.height) {
      mx = Math.max((a.y - f.height), 0) ;
      if (mx > w.height) {
        f.y = Math.max(0, w.height - f.height) ;
      } else f.y = mx ;
    }

    // if Top edge is off screen, try to anchor to bottom of anchor. If that
    // pushes off bottom edge, shift up until it is back on screen or top =0
    if (SC.minY(f) < 0) {
      mx = Math.min(SC.maxY(a), (w.height - a.height)) ;
      f.y = Math.max(mx, 0) ;
    }
    return f ;
  },

  /** @private
    Reposition the pane in a way that is optimized for menus.

    Specifically, we want to ensure that the pane is at least 7 pixels from
    the left side of the screen, and 20 pixels from the right side.

    If the menu is a submenu, we also want to reposition the pane to the left
    of the parent menu if it would otherwise exceed the width of the viewport.
  */
  fitPositionToScreenMenu: function(windowFrame, paneFrame, subMenu) {

    // Set up init location for submenu
    if (subMenu) {
      paneFrame.x -= this.get('submenuOffsetX');
      paneFrame.y -= Math.floor(this.get('menuHeightPadding')/2);
    }

    // If the right edge of the pane is within 20 pixels of the right edge
    // of the window, we need to reposition it.
    if( (paneFrame.x + paneFrame.width) > (windowFrame.width-20) ) {
      if (subMenu) {
        // Submenus should be re-anchored to the left of the parent menu
        paneFrame.x = paneFrame.x - (paneFrame.width*2);
      } else {
        // Otherwise, just position the pane 20 pixels from the right edge
        paneFrame.x = windowFrame.width - paneFrame.width - 20;
      }
    }

    // Make sure we are at least 7 pixels from the left edge of the screen.
    if( paneFrame.x < 7 ) paneFrame.x = 7;

    if (paneFrame.y < 7) {
      paneFrame.height += paneFrame.y;
      paneFrame.y = 7;
    }

    // If the height of the menu is bigger than the window height, resize it.
    if( paneFrame.height+paneFrame.y+35 >= windowFrame.height){
      if (paneFrame.height+50 >= windowFrame.height) {
        paneFrame.y = SC.MenuPane.VERTICAL_OFFSET;
        paneFrame.height = windowFrame.height - (SC.MenuPane.VERTICAL_OFFSET*2);
      } else {
        paneFrame.y += (windowFrame.height - (paneFrame.height+paneFrame.y+35));
      }
    }

    return paneFrame ;
  },

  /** @private
    Reposition the pane in a way that is optimized for menus that have a
    point element.

    This simply calls fitPositionToScreenPointer, then ensures that the menu
    does not exceed the height of the viewport.

    @returns {Rect}
  */
  fitPositionToScreenMenuPointer: function(w, f, a) {
    f = this.fitPositionToScreenPointer(w,f,a);

    // If the height of the menu is bigger than the window height, resize it.
    if( f.height+f.y+35 >= w.height){
        f.height = w.height - f.y - (SC.MenuPane.VERTICAL_OFFSET*2) ;
    }

    return f;
  },

  /** @private
    re-position rule for triangle pointer picker.
  */
  fitPositionToScreenPointer: function(w, f, a) {
    var offset = [this.pointerOffset[0], this.pointerOffset[1],
                  this.pointerOffset[2], this.pointerOffset[3]];

    // initiate perfect positions matrix
    // 4 perfect positions: right > left > top > bottom
    // 2 coordinates: x, y
    // top-left corner of 4 perfect positioned f  (4x2)
    var prefP1    =[[a.x+a.width+offset[0],                   a.y+parseInt(a.height/2,0)-40],
                    [a.x-f.width+offset[1],                   a.y+parseInt(a.height/2,0)-40],
                    [a.x+parseInt((a.width/2)-(f.width/2),0), a.y-f.height+offset[2]],
                    [a.x+parseInt((a.width/2)-(f.width/2),0), a.y+a.height+offset[3]]];
    // bottom-right corner of 4 perfect positioned f  (4x2)
    var prefP2    =[[a.x+a.width+f.width+offset[0],                   a.y+parseInt(a.height/2,0)+f.height-24],
                    [a.x+offset[1],                                   a.y+parseInt(a.height/2,0)+f.height-24],
                    [a.x+parseInt((a.width/2)-(f.width/2),0)+f.width, a.y+offset[2]],
                    [a.x+parseInt((a.width/2)-(f.width/2),0)+f.width, a.y+a.height+f.height+offset[3]]];
    // cutoff of 4 perfect positioned f: top, right, bottom, left  (4x4)
    var cutoffPrefP =[[prefP1[0][1]>0 ? 0 : 0-prefP1[0][1], prefP2[0][0]<w.width ? 0 : prefP2[0][0]-w.width, prefP2[0][1]<w.height ? 0 : prefP2[0][1]-w.height, prefP1[0][0]>0 ? 0 : 0-prefP1[0][0]],
                      [prefP1[1][1]>0 ? 0 : 0-prefP1[1][1], prefP2[1][0]<w.width ? 0 : prefP2[1][0]-w.width, prefP2[1][1]<w.height ? 0 : prefP2[1][1]-w.height, prefP1[1][0]>0 ? 0 : 0-prefP1[1][0]],
                      [prefP1[2][1]>0 ? 0 : 0-prefP1[2][1], prefP2[2][0]<w.width ? 0 : prefP2[2][0]-w.width, prefP2[2][1]<w.height ? 0 : prefP2[2][1]-w.height, prefP1[2][0]>0 ? 0 : 0-prefP1[2][0]],
                      [prefP1[3][1]>0 ? 0 : 0-prefP1[3][1], prefP2[3][0]<w.width ? 0 : prefP2[3][0]-w.width, prefP2[3][1]<w.height ? 0 : prefP2[3][1]-w.height, prefP1[3][0]>0 ? 0 : 0-prefP1[3][0]]];

    var m = this.preferMatrix;

    // initiated with fallback position
    // Will be used only if the following preferred alternative can not be found
    if(m[4] === -1) {
      //f.x = a.x>0 ? a.x+23 : 0; // another alternative align to left
      f.x = a.x+parseInt(a.width/2,0);
      f.y = a.y+parseInt(a.height/2,0)-parseInt(f.height/2,0);
      this.set('pointerPos', SC.POINTER_LAYOUT[0]+' fallback');
      this.set('pointerPosY', parseInt(f.height/2,0)-40);
    } else {
      f.x = prefP1[m[4]][0];
      f.y = prefP1[m[4]][1];
      this.set('pointerPos', SC.POINTER_LAYOUT[m[4]]);
      this.set('pointerPosY', 0);
    }
    this.set('pointerPosX', 0);

    for(var i=0, cM, pointerLen=SC.POINTER_LAYOUT.length; i<pointerLen; i++) {
      cM = m[i];
      if (cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]===0 && cutoffPrefP[cM][2]===0 && cutoffPrefP[cM][3]===0) {
        // alternative i in preferMatrix by priority
        if (m[4] !== cM) {
          f.x = prefP1[cM][0] ;
          f.y = prefP1[cM][1] ;
          this.set('pointerPosY', 0);
          this.set('pointerPos', SC.POINTER_LAYOUT[cM]);
        }
        i = SC.POINTER_LAYOUT.length;
      } else if ((cM === 0 || cM === 1) && cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]===0 && cutoffPrefP[cM][2] < f.height-91 && cutoffPrefP[cM][3]===0) {
        if (m[4] !== cM) {
          f.x = prefP1[cM][0] ;
          this.set('pointerPos', SC.POINTER_LAYOUT[cM]);
        }
        f.y = prefP1[cM][1] - cutoffPrefP[cM][2];
        this.set('pointerPosY', cutoffPrefP[cM][2]);
        i = SC.POINTER_LAYOUT.length;
      } else if ((cM === 0 || cM === 1) && cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]===0 && cutoffPrefP[cM][2] <= f.height-51 && cutoffPrefP[cM][3]===0) {
        if (m[4] !== cM) {
          f.x = prefP1[cM][0] ;
        }
        f.y = prefP1[cM][1] - (f.height-51) ;
        this.set('pointerPosY', (f.height-53));
        this.set('pointerPos', SC.POINTER_LAYOUT[cM]+' extra-low');
        i = SC.POINTER_LAYOUT.length;
      } else if ((cM === 2 || cM === 3) && cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]<= parseInt(f.width/2,0)-this.get('extraRightOffset') && cutoffPrefP[cM][2] ===0 && cutoffPrefP[cM][3]===0) {
        if (m[4] !== cM) {
          f.y = prefP1[cM][1] ;
        }
        f.x = prefP1[cM][0] - (parseInt(f.width/2,0)-this.get('extraRightOffset')) ;
        this.set('pointerPos', SC.POINTER_LAYOUT[cM]+' extra-right');
        i = SC.POINTER_LAYOUT.length;
      } else if ((cM === 2 || cM === 3) && cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]===0 && cutoffPrefP[cM][2] ===0 && cutoffPrefP[cM][3]<= parseInt(f.width/2,0)-this.get('extraRightOffset')) {
        if (m[4] !== cM) {
          f.y = prefP1[cM][1] ;
        }
        f.x = prefP1[cM][0] + (parseInt(f.width/2,0)-this.get('extraRightOffset')) ;
        this.set('pointerPos', SC.POINTER_LAYOUT[cM]+' extra-left');
        i = SC.POINTER_LAYOUT.length;
      }
    }
    return f ;
  },

  /** @private
    This method will set up pointerOffset and preferMatrix according to type
    and size if not provided explicitly.
  */
  setupPointer: function(a) {
    var pointerOffset = this.pointerOffset,
        K             = SC.PickerPane;

    // set up pointerOffset according to type and size if not provided explicitly
    if (!pointerOffset || pointerOffset.length !== 4) {
      if (this.get('preferType') == SC.PICKER_MENU_POINTER) {
        switch (this.get('controlSize')) {
          case SC.TINY_CONTROL_SIZE:
            this.set('pointerOffset',    K.TINY_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.TINY_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
          case SC.SMALL_CONTROL_SIZE:
            this.set('pointerOffset',    K.SMALL_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.SMALL_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
          case SC.REGULAR_CONTROL_SIZE:
            this.set('pointerOffset',    K.REGULAR_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.REGULAR_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
          case SC.LARGE_CONTROL_SIZE:
            this.set('pointerOffset',    K.LARGE_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.LARGE_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
          case SC.HUGE_CONTROL_SIZE:
            this.set('pointerOffset',    K.HUGE_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.HUGE_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
        }
      }
      else {
        var overlapTuningX = (a.width < 16)  ? ((a.width < 4)  ? 9 : 6) : 0,
            overlapTuningY = (a.height < 16) ? ((a.height < 4) ? 9 : 6) : 0,
            offsetKey      = K.PICKER_POINTER_OFFSET;

        var offset = [offsetKey[0]+overlapTuningX,
                      offsetKey[1]-overlapTuningX,
                      offsetKey[2]-overlapTuningY,
                      offsetKey[3]+overlapTuningY];
        this.set('pointerOffset', offset) ;
        this.set('extraRightOffset', K.PICKER_EXTRA_RIGHT_OFFSET) ;
      }
    }

    // set up preferMatrix according to type if not provided explicitly:
    // take default [0,1,2,3,2] for picker, [3,0,1,2,3] for menu picker if
    // custom matrix not provided explicitly
    if(!this.preferMatrix || this.preferMatrix.length !== 5) {
      // menu-picker default re-position rule :
      // perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
      // fallback to perfect bottom (3)
      // picker default re-position rule :
      // perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
      // fallback to perfect top (2)
      this.set('preferMatrix', this.get('preferType') === SC.PICKER_MENU_POINTER ? [3,2,1,0,3] : [0,1,2,3,2]) ;
    }
  },

  /**
    @type Array
    @default ['preferType','pointerPos','pointerPosY']
    @see SC.View#displayProperties
  */
  displayProperties: ['preferType','pointerPos','pointerPosY'],

  /**
    @type String
    @default 'pickerRenderDelegate'
  */
  renderDelegateName: 'pickerRenderDelegate',

  /** @private - click away picker. */
  modalPaneDidClick: function(evt) {
    var f = this.get('frame'),
        target = this.get('removeTarget') || null,
        action = this.get('removeAction'),
        rootResponder = this.get('rootResponder');

    if (!this.clickInside(f, evt)) {
      // We're not in the Pane so we must be in the modal
      if (action) {
        rootResponder.sendAction(action, target, this, this, null, this);
      } else this.remove();

      return YES;
    }

    return NO;
  },

  /** @private */
  mouseDown: function(evt) {
    return this.modalPaneDidClick(evt);
  },

  /** @private
    internal method to define the range for clicking inside so the picker
    won't be clicked away default is the range of contentView frame.
    Over-write for adjustments. ex: shadow
  */
  clickInside: function(frame, evt) {
    return SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame);
  },

  /**
    Invoked by the root responder. Re-position picker whenever the window resizes.
  */
  windowSizeDidChange: function(oldSize, newSize) {
    if (this.repositionOnWindowResize) this.positionPane();
  },

  remove: function(){
    if(this.get('isVisibleInWindow') && this.get('isPaneAttached')) this._withdrawOverflowRequest();
    this._removeScrollObservers();
    return sc_super();
  },
  
  /** Figure out what is the anchor element */
  anchorElement: function(key, value) {
    var anchorView;

    if (value === undefined) {
      // Getting the value.
      anchorView = this._anchorView;
      return anchorView ? anchorView.get('layer') : this._anchorHTMLElement;
    }
    else {
      // Setting the value.
      if (!value) {
        throw "You must set 'anchorElement' to either a view or a DOM element";
      }
      else if (value.isView) {
        this._anchorView        = value;
        this._anchorHTMLElement = null;
      }
      else {
        this._anchorView        = null;
        this._anchorHTMLElement = value;
      }
    }
  }.property('layer').cacheable(),
  
  

  /** @private
    Internal method to hide the overflow on the body to make sure we don't
    show scrollbars when the picker has shadows, as it's really annoying.
  */
  _hideOverflow: function(){
    var body = SC.$(document.body),
        main = SC.$('.sc-main'),
        minWidth = parseInt(main.css('minWidth'),0),
        minHeight = parseInt(main.css('minHeight'),0),
        windowSize = SC.RootResponder.responder.get('currentWindowSize');
    if(windowSize.width>=minWidth && windowSize.height>=minHeight){
      SC.bodyOverflowArbitrator.requestHidden(this);
    }
  },

  /** @private
    Internal method to show the overflow on the body to make sure we don't
    show scrollbars when the picker has shadows, as it's really annoying.
  */
  _withdrawOverflowRequest: function(){
    SC.bodyOverflowArbitrator.withdrawRequest(this);
  },
  
  /** @private
    Detect if view is inside a scroll view. Do this by traversing parent view
    hierarchy until you hit a scroll view or main pane.
  */
  _getScrollViewOfView: function(view) {
    var curLevel = view;
    while (YES) {
      if (!curLevel) {
        return null;
      }
      if (curLevel.isScrollable) {
        return curLevel;
      }
      curLevel = curLevel.get('parentView');
    }
  },

  /** @private
    If anchor view is in a scroll view, setup observers on scroll offsets.
  */
  _setupScrollObservers: function(anchorView) {
    var scrollView = this._getScrollViewOfView(anchorView);
    if (scrollView) {
      scrollView.addObserver('horizontalScrollOffset', this, this._scrollOffsetDidChange);
      scrollView.addObserver('verticalScrollOffset', this, this._scrollOffsetDidChange);
      this._scrollView = scrollView;
    }
  },

  /** @private
    Teardown observers setup in _setupScrollObservers.
  */
  _removeScrollObservers: function() {
    var scrollView = this._scrollView;
    if (scrollView) {
      scrollView.removeObserver('horizontalScrollOffset', this, this._scrollOffsetDidChange);
      scrollView.removeObserver('verticalScrollOffset', this, this._scrollOffsetDidChange);
    }
  },

  /** @private
    Reposition pane whenever scroll offsets change.
  */
  _scrollOffsetDidChange: function() {
    this.positionPane();
  }
});

/**
  Default metrics for the different control sizes.
*/

/**
  @static
*/
SC.PickerPane.PICKER_POINTER_OFFSET = [9, -9, -18, 18];

/**
  @static
*/
SC.PickerPane.PICKER_EXTRA_RIGHT_OFFSET = 20;

/**
  @static
*/
SC.PickerPane.TINY_PICKER_MENU_POINTER_OFFSET = [9, -9, -18, 18];

/**
  @static
*/
SC.PickerPane.TINY_PICKER_MENU_EXTRA_RIGHT_OFFSET = 12;

/**
  @static
*/
SC.PickerPane.SMALL_PICKER_MENU_POINTER_OFFSET = [9, -9, -8, 8];

/**
  @static
*/
SC.PickerPane.SMALL_PICKER_MENU_EXTRA_RIGHT_OFFSET = 11;

/**
  @static
*/
SC.PickerPane.REGULAR_PICKER_MENU_POINTER_OFFSET = [9, -9, -12, 12];

/**
  @static
*/
SC.PickerPane.REGULAR_PICKER_MENU_EXTRA_RIGHT_OFFSET = 12;

/**
  @static
*/
SC.PickerPane.LARGE_PICKER_MENU_POINTER_OFFSET = [9, -9, -16, 16];

/**
  @static
*/
SC.PickerPane.LARGE_PICKER_MENU_EXTRA_RIGHT_OFFSET = 17;

/**
  @static
*/
SC.PickerPane.HUGE_PICKER_MENU_POINTER_OFFSET = [9, -9, -18, 18];

/**
  @static
*/
SC.PickerPane.HUGE_PICKER_MENU_EXTRA_RIGHT_OFFSET = 12;
