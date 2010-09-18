// ==========================================================================
// Project:   Greenhouse.AnchorView
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
Greenhouse.AnchorView = SC.View.extend(
/** @scope Greenhouse.AnchorView.prototype */ {

  /** 
    The anchor location to display
  */
  anchorLocation: null,
  
  /**
    Enabled/disable
  */
  isEnabled: YES,
  
  /**
    Set to YES while the mouse is pressed.
  */
  isActive: NO,
  
  /**
    Proposed anchor location.  Changes as mouse moves/drags
  */
  proposedAnchorLocation: null,
  
  displayProperties: "anchorLocation isEnabled isActive proposedAnchorLocation".w(),
  
  render: function(context, firstTime) {
    if (firstTime) {
      var f = this.get('frame');
      context.begin('canvas')
        .attr('width', f.width).attr('height', f.height)
        .end();
    }
  },
  
  didCreateLayer: function() {
    this.didUpdateLayer();
  },
  
  didUpdateLayer: function() {
    var elem   = this.$('canvas'),
        ctx    = elem[0].getContext("2d"),
        width  = this.$().width(),
        height = this.$().height(),
        loc    = this.get('anchorLocation'), 
        ploc, color, x, y, tmp;

    // adjust size as needed...
    if (Number(elem.attr('width')) !== width) elem.attr('width', width);
    if (Number(elem.attr('height')) !== height) elem.attr('height', height);
    width--; height--; // adjust for being off 0.5

    // do  the drawr-ing!
    if (!this.get('isEnabled')) loc = null;
    color = loc ? 'black' : 'rgb(128,128,128)';
    
    ctx.save();
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.strokeStyle = color;
    ctx.fillRect(0.5, 0.5, width, height);
    ctx.strokeRect(0.5, 0.5, width, height);

    ctx.strokeStyle = color;
    ctx.strokeRect(20.5, 20.5, width-40, height-40);

    ctx.beginPath();
    ctx.moveTo(Math.floor(width/2)+0.5, 20.5);
    ctx.lineTo(Math.floor(width/2)+0.5, Math.floor(height-20)+0.5);
    ctx.moveTo(20.5, Math.floor(height/2)+0.5);
    ctx.lineTo(Math.floor(width-20)+0.5, Math.floor(height/2)+0.5);
    ctx.stroke();
    ctx.restore();

    loc = this.get('anchorLocation');
    
    ploc = this.get('proposedAnchorLocation');
    if (ploc && ploc !== loc) {
      color = this.get('isActive') ? 'rgb(80,80,80)' : 'rgb(200,200,200)';
      this._drawAnchorAt(ploc, ctx, color, width, height);
    }
    
    this._drawAnchorAt(loc, ctx, 'red', width, height);
  },

  // ..........................................................
  // MOUSE EVENTS
  // 
  
  mouseMoved: function(evt) {
    this._updateProposedAnchorLocation(evt);
  },
  
  mouseExited: function(evt) {
    this.setIfChanged('proposedAnchorLocation', null);
  },
  
  mouseDown: function(evt) {
    if (this.get('isEnabled') && this.get('anchorLocation')) {
      this.get('mouseDown');
      
      this.set('isActive', YES);
      this._updateProposedAnchorLocation(evt);
    }
    return YES ;
  },
  
  mouseDragged: function(evt) {
    if (this.get('isActive')) this._updateProposedAnchorLocation(evt);
    return YES ;
  },
  
  mouseUp: function(evt) {
    var loc;

    if (this.get('isActive')) {
      this._updateProposedAnchorLocation(evt);
      loc = this.get('proposedAnchorLocation');
      if (loc) this.setIfChanged('anchorLocation', loc);
      this.set('isActive', NO);
    }
    
    return YES ;
  },

  
  // ..........................................................
  // PRIVATE
  // 

  _updateProposedAnchorLocation: function(evt) {
    var loc = this.get('anchorLocation'),
        pnt = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY },null),
        K   = SC.ViewDesigner,
        rad, f, w, h, ret, centerAnchor, centerResize;            
    
    if (!this.get('isEnabled') || !loc) ret = null;
    else {
      rad = 10;
      f = SC.copy(this.get('frame'));

      // calc outside rect    
      f.x = f.y = 20;
      f.width -= 40 ;
      f.height -= 40;

      if (Math.abs(pnt.x - SC.minX(f))<=rad) w = K.ANCHOR_LEFT;
      else if (Math.abs(pnt.x - SC.midX(f))<=rad) w = K.ANCHOR_CENTERX;
      else if (Math.abs(pnt.x - SC.maxX(f))<=rad) w = K.ANCHOR_RIGHT;
      else w = 0;

      if (Math.abs(pnt.y - SC.minY(f))<=rad) h = K.ANCHOR_TOP;
      else if (Math.abs(pnt.y - SC.midY(f))<=rad) h = K.ANCHOR_CENTERY;
      else if (Math.abs(pnt.y - SC.maxY(f))<=rad) h = K.ANCHOR_BOTTOM;
      else h = 0;

      // not in a regular anchor zone; look for edges...
      if (w===0 || h===0) {
        rad /= 2;
        if (Math.abs(pnt.x - SC.minX(f))<=rad) {
          ret = K.ANCHOR_LEFT | K.ANCHOR_HEIGHT;
        
        } else if (Math.abs(pnt.x - SC.midX(f)) <= rad) {
          ret = K.ANCHOR_CENTERX | K.ANCHOR_HEIGHT;
        
        } else if (Math.abs(pnt.x - SC.maxX(f)) <= rad) {
          ret = K.ANCHOR_RIGHT | K.ANCHOR_HEIGHT;
          
        } else if (Math.abs(pnt.y - SC.minY(f)) <= rad) {
          ret = K.ANCHOR_WIDTH | K.ANCHOR_TOP;

        } else if (Math.abs(pnt.y - SC.midY(f)) <= rad) {
          ret = K.ANCHOR_WIDTH | K.ANCHOR_CENTERY;

        } else if (Math.abs(pnt.y - SC.maxY(f)) <= rad) {
          ret = K.ANCHOR_WIDTH | K.ANCHOR_BOTTOM;
        }
        
      } else ret = w|h;
      if (ret === 0) ret = null;
    }
  
    // alternate between center anchor/resize if options...
    centerAnchor = K.ANCHOR_CENTERX | K.ANCHOR_CENTERY;
    centerResize = K.ANCHOR_WIDTH | K.ANCHOR_HEIGHT;
    if (loc===ret) {
      if (ret===centerAnchor) ret = centerResize;
      else if (ret===centerResize) ret = centerAnchor;
    }
  
    this.setIfChanged('proposedAnchorLocation', ret);
  },
  
    
  _drawAnchorAt: function(loc, ctx, color, width, height) {
    var x = this._xForAnchorLocation(loc, 20, width-40),
        y = this._yForAnchorLocation(loc, 20, height-40),
        tmp;

    // if either is zero - don't do anything
    if (x && y) {
      ctx.save();
      ctx.strokeStyle = color;

      // if x|y < 0, then draw over lines to show height/width
      if (x<0) {
        tmp = Math.floor(Math.abs(y));
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(20.5, tmp, 3, 0, Math.PI*2, true);
        ctx.lineTo(Math.floor(width-20)-3.5, tmp);
        ctx.arc(Math.floor(width-20), tmp, 3, Math.PI, Math.PI*2, true);
        ctx.arc(Math.floor(width-20), tmp, 3, 0, Math.PI, true);
        ctx.stroke();
      } 
      
      if (y<0) {
        tmp = Math.floor(Math.abs(x));
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(tmp, 20.5, 3, 0, Math.PI*2, true);
        ctx.moveTo(tmp, 23.5);
        ctx.lineTo(tmp, Math.floor(height-20)-3.5);
        ctx.arc(tmp, Math.floor(height-20), 3, Math.PI*1.5, Math.PI*2, true);
        ctx.arc(tmp, Math.floor(height-20), 3, 0, Math.PI*1.5, true);
        ctx.stroke();
      } 
      
      if (x>0 && y>0) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.arc(x,y,10,0,Math.PI*2, true);
        ctx.stroke();
      } 

      ctx.restore();
    }
  },
  
  _xForAnchorLocation: function(loc, left, w) {
    var K = SC.ViewDesigner, ret ;
        
    if (loc & K.ANCHOR_LEFT) ret = left;
    else if (loc & K.ANCHOR_RIGHT) ret = left+w;
    else if (loc & K.ANCHOR_CENTERX) ret = left+Math.floor(w/2);
    else if (loc & K.ANCHOR_WIDTH) ret = 0-(left+Math.floor(w/2)) ;
    else ret = 0;
    
    return ret ;
  },

  _yForAnchorLocation: function(loc, top, h) {
    var K = SC.ViewDesigner, ret ;

    if (loc & K.ANCHOR_TOP) ret = top;
    else if (loc & K.ANCHOR_BOTTOM) ret = top+h;
    else if (loc & K.ANCHOR_CENTERY) ret = top+Math.floor(h/2);
    else if (loc & K.ANCHOR_HEIGHT) ret = 0-(top+Math.floor(h/2)) ;
    else ret = 0;
    
    return ret ;
  }

});
