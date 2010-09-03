// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


sc_require('panes/palette');

/** 
  Popular customized picker position rules:
  default: initiated just below the anchor. 
           shift x, y to optimized picker visibility and make sure top-left corner is always visible.
  menu :   same as default rule +
           default(1,4,3) or custom offset below the anchor for default location to fine tunned visual alignment +
           enforce min left(7px)/right(8px) padding to the window
  fixed :  default(1,4,3) or custom offset below the anchor for default location to cope with specific anchor and skip fitPositionToScreen
  pointer :take default [0,1,2,3,2] or custom matrix to choose one of four perfect pointer positions.Ex:
           perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
           fallback to perfect top (2)
  menu-pointer :take default [3,0,1,2,3] or custom matrix to choose one of four perfect pointer positions.Ex:
          perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
          fallback to perfect bottom (3)
*/
SC.PICKER_MENU = 'menu';
SC.PICKER_FIXED = 'fixed';
SC.PICKER_POINTER = 'pointer';
SC.PICKER_MENU_POINTER = 'menu-pointer';
/** 
  Pointer layout for perfect right/left/top/bottom
*/
SC.POINTER_LAYOUT = ["perfectRight", "perfectLeft", "perfectTop", "perfectBottom"];

/**
  @class

  Displays a non-modal, self anchor positioned picker pane.

  The default way to use the picker pane is to simply add it to your page like this:
  
  {{{
    SC.PickerPane.create({
      layout: { width: 400, height: 200 },
      contentView: SC.View.extend({
      })
    }).popup(anchor);
  }}}
  
  This will cause your picker pane to display.
  
  Picker pane is a simple way to provide non-modal messaging that won't 
  blocks the user's interaction with your application.  Picker panes are 
  useful for showing important detail informations with optimized position around anchor.
  They provide a better user experience than modal panel.

  Examples for applying popular customized picker position rules:
  
  1. default:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor);
  }}}

  2. menu below the anchor with default offset matrix [1,4,3]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_MENU);
  }}}

  3. menu on the right side of anchor with custom offset matrix [2,6,0]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_MENU, [2,6,0]);
  }}}

  4. fixed below the anchor with default offset matrix [1,4,3]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_FIXED);
  }}}

  5. fixed on the right side of anchor with custom offset matrix [-22,-17,0]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_FIXED, [-22,-17,0]);
  }}}

  6. pointer with default position pref matrix [0,1,2,3,2]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_POINTER);
  }}}
  perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
  fallback to perfect top (2)

  7. pointer with custom position pref matrix [3,0,1,2,2]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_POINTER, [3,0,1,2,2]);
  }}}

  perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
  fallback to perfect top (2)

  8. menu-pointer with default position pref matrix [3,0,1,2,3]:
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_MENU_POINTER);
  }}}
  perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
  fallback to perfect bottom (3)
  
  @extends SC.PalettePane
  @since SproutCore 1.0
*/
SC.PickerPane = SC.PalettePane.extend({
  
  classNames: 'sc-picker',
  isAnchored: YES,
  
  isModal: YES,
  
  pointerPos: 'perfectRight',
  pointerPosX: 0,
  pointerPosY: 0,
  
  /**
    This property will be set to the element (or view.get('layer')) that 
    triggered your picker to show.  You can use this to properly position your 
    picker.
    
    @property {Object}
  */
  anchorElement: null,

  /**
    anchor rect calculated by computeAnchorRect from init popup

    @property {Hash}
  */
  anchorCached: null,
  
  /**
    popular customized picker position rule
    
    @property {String}
  */
  preferType: null,
  
  /**
    default/custom offset or position pref matrix for specific preferType
    
    @property {String}
  */
  preferMatrix: null,

  /**
    default/custom offset of pointer for picker-pointer or pointer-menu

    @property {Array}
  */
  pointerOffset: null,

  /**
    default offset of extra-right pointer for picker-pointer or pointer-menu

    @property Number
  */
  extraRightOffset: 0,

  /**
    Displays a new picker pane according to the passed parameters.
    Every parameter except for the anchorViewOrElement is optional.
  
    @param {Object} anchorViewOrElement view or element to anchor to
    @param {String} preferType optional apply picker position rule
    @param {Array} preferMatrix optional apply custom offset or position pref matrix for specific preferType
    @returns {SC.PickerPane} receiver
  */
  popup: function(anchorViewOrElement, preferType, preferMatrix, pointerOffset) {
    var anchor;
    if(anchorViewOrElement){
      anchor = anchorViewOrElement.isView ? anchorViewOrElement.get('layer') : anchorViewOrElement;
    }
    this.beginPropertyChanges();
    this.set('anchorElement',anchor) ;
    if (preferType) this.set('preferType',preferType) ;
    if (preferMatrix) this.set('preferMatrix',preferMatrix) ;
    if (pointerOffset) this.set('pointerOffset',pointerOffset) ;
    this.endPropertyChanges();
    this.positionPane();
    this._hideOverflow();
    this.append();
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
              // default below the anchor with fine tunned visual alignment 
              // for Menu to appear just below the anchorElement.
              this.set('preferMatrix', [1, 4, 3]) ;
            }

            // fine tunned visual alignment from preferMatrix
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
    Notice: temp hack for calculating visiable anchor height by counting height 
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
      // if we didnt get the frame dimensions the do the calculations
      // based on an element
      if(ret.width===undefined || ret.height===undefined){
        cq = SC.$(anchor);
        ret.width = cq.outerWidth();
        ret.height = cq.outerHeight();
      }
    }
    else {
      // Only really old versions will have to go through this code path.
      ret   = SC.viewportOffset(anchor); // get x & y
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

    // set up preferMatrix according to type if not provided excplicitly:
    // take default [0,1,2,3,2] for picker, [3,0,1,2,3] for menu picker if
    // custom matrix not provided excplicitly
    if(!this.preferMatrix || this.preferMatrix.length !== 5) {
      // menu-picker default re-position rule :
      // perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
      // fallback to perfect bottom (3)
      // picker default re-position rule :
      // perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
      // fallback to perfect top (2)
      this.set('preferMatrix', this.get('preferType') == SC.PICKER_MENU_POINTER ? [3,0,1,2,3] : [0,1,2,3,2]) ;
    }
  },
  
  displayProperties: ["pointerPosY"],

  createRenderer: function(t) {
    return t.picker();
  },
  
  updateRenderer: function(r) {
    r.attr({
      preferType: this.preferType,
      pointerPos: this.pointerPos,
      pointerPosY: this.pointerPosY
    });
  },
  
  /** @private - click away picker. */
  modalPaneDidClick: function(evt) {
    var f = this.get("frame");
    if(!this.clickInside(f, evt)) this.remove();
    return YES ; 
  },

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
    this.positionPane();
  },
  
  
  remove: function(){
    if(this.get('isVisibleInWindow') && this.get('isPaneAttached')) this._showOverflow();
    return sc_super();
  },
  
  /** @private
    Internal method to hide the overflow on the body to make sure we don't 
    show scrollbars when the picker has shadows, as it's really anoying.
  */
  _hideOverflow: function(){
    var body = SC.$(document.body),
        main = SC.$('.sc-main'),
        minWidth = parseInt(main.css('minWidth'),0),
        minHeight = parseInt(main.css('minHeight'),0),
        windowSize = SC.RootResponder.responder.get('currentWindowSize');
    if(windowSize.width>=minWidth && windowSize.height>=minHeight){
      SC.PICKERS_OPEN++;
      //console.log(this.toString()+" "+SC.PICKERS_OPEN);
      if(SC.PICKERS_OPEN > 0) body.css('overflow', 'hidden');           
    }
  },

  /** @private
    Internal method to show the overflow on the body to make sure we don't 
    show scrollbars when the picker has shadows, as it's really anoying.
  */
  _showOverflow: function(){
    var body = SC.$(document.body);
    if(SC.PICKERS_OPEN > 0) {
      SC.PICKERS_OPEN--;
     // console.log(this.toString()+" "+SC.PICKERS_OPEN);
    }
    if(SC.PICKERS_OPEN === 0) body.css('overflow', 'visible');
  }
});

/**
  Default metrics for the different control sizes.
*/

// Counter to track how many pickers are open. This help us to now when to 
// show/hide the body overflow.
SC.PICKERS_OPEN = 0;

SC.PickerPane.PICKER_POINTER_OFFSET = [9, -9, -18, 18];
SC.PickerPane.PICKER_EXTRA_RIGHT_OFFSET = 20;

SC.PickerPane.TINY_PICKER_MENU_POINTER_OFFSET = [9, -9, -18, 18];
SC.PickerPane.TINY_PICKER_MENU_EXTRA_RIGHT_OFFSET = 12;

SC.PickerPane.SMALL_PICKER_MENU_POINTER_OFFSET = [9, -9, -8, 8];
SC.PickerPane.SMALL_PICKER_MENU_EXTRA_RIGHT_OFFSET = 11;

SC.PickerPane.REGULAR_PICKER_MENU_POINTER_OFFSET = [9, -9, -12, 12];
SC.PickerPane.REGULAR_PICKER_MENU_EXTRA_RIGHT_OFFSET = 13;
SC.PickerPane.REGULAR_PICKER_MENU_EXTRA_RIGHT_OFFSET = 12;

SC.PickerPane.LARGE_PICKER_MENU_POINTER_OFFSET = [9, -9, -16, 16];
SC.PickerPane.LARGE_PICKER_MENU_EXTRA_RIGHT_OFFSET = 17;

SC.PickerPane.HUGE_PICKER_MENU_POINTER_OFFSET = [9, -9, -18, 18];
SC.PickerPane.HUGE_PICKER_MENU_EXTRA_RIGHT_OFFSET = 12;
