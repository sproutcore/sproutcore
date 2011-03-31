// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals SC */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
SC.MediaSlider = SC.SliderView.extend({
  
  mediaView: null,

  leftHandleInsetBinding: "*owner.leftHandleInset",
  
  rightHandleInsetBinding: "*owner.rightHandleInset",
  
  handleWidthBinding: "*owner.handleWidth",
                                                             
  //for some reason, when the observer was hooked to this bound property,
  //it wouldn't fire even when the original setter was in an SC run loop!
  //what gives and/or what was I doing wrong? The observer is now direct.
  // loadedTimeRangesBinding: "*mediaView.loadedTimeRanges", 
  
  loadedRangesSelector: "span.sc-loaded-ranges",
  
  _defaults: {
    //these are necessary because I couldn't get SC.Binding.notEmpty to
    //work without values defined in the parent, which is a situation
    //I'd rather leave optional.
    leftHandleInset:-1,
    rightHandleInset:-8,
    handleWidth:16
  },           

  render: function(context, firstTime) {
    //sc_super(); we are overriding the ENTIRE previous render method,
    //so instead of calling sc_super, we want to skip the function
    //immediately above this one and go two levels up.
    arguments.callee.base.base.apply(this,arguments);
    
    //some variables
    var min = this.get('minimum'),
        max = this.get('maximum'),
        value = this.get('value'),
        step = this.get('step'),
        width = this.get('frame').width,
        left, loc, minLoc, maxLoc, i,
        blankImage = SC.BLANK_IMAGE_URL;
                                
    //process the defaults if we haven't.
    if(!this._defaultsEnsured) {
      this._defaultsEnsured = YES;
      for(i in this._defaults) {
        if(SC.none(this.get(i))) {
          this.set(i,this._defaults[i]);
        }
      }
    }

    // determine the constrained value.  Must fit within min & max
    value = Math.min(Math.max(value, min), max);

    // limit to step value
    if (!SC.none(step) && step !== 0) {
      value = Math.round(value / step) * step;
    }
    
    // get a pointer to the actual handle DOM element, and, if we have no
    // width information for it, try to use its offsetWidth.
    if(!firstTime) {
      var handle = this.handleElement ||
                  (this.handleElement=this.$(this.get('handleSelector'))[0]);
      if(!this.handleWidth){
        this.handleWidth = this.handleElement.offsetWidth || this.handleWidth;
      }
    }
    
    //derive the extremes
    maxLoc = width-this.handleWidth/2-this.rightHandleInset;
    minLoc = this.handleWidth/2+this.leftHandleInset;
    
    if(min==max) loc=minLoc;
    else loc = (value - min) / (max - min) * (maxLoc - minLoc) + minLoc;
    
    left = loc + this.leftHandleInset - this.handleWidth/2;
    
    //console.log("RENDERING: max is "+max+" and min is "+min+" and value is "+value+" out of "+max+", left is "+left+" and loc is "+loc+" and handleWidth is "+this.handleWidth);
    
    if(!firstTime) {
      //if all our elements are already created, just edit them instead of
      //blowing them away and starting over.
      handle.style.left = left + "px";
    } else {
      context.push('<span class="sc-inner">',
                    '<span class="sc-leftcap"></span>',
                    '<span class="sc-rightcap"></span>',  
                    '<span class="sc-track"></span>',
                    '<span class="sc-loaded-ranges"></span>',
                    '<img src="', blankImage, 
                    '" class="sc-handle" style="left: ', left, 'px" />',
                   '</span>');
    }
    
    //next, we take care of the loaded ranges of time that will darken
    //the slider. This should happen whether it's the first render or not!
    this.renderLoadedTimeRanges();
  },

  renderLoadedTimeRanges: function() {
      //first, get our quick variables we know we'll need...
      var max = this.get('maximum'),
          min = this.get('minimum'),
          width = this.get('frame').width,
          i;
      //get our ranges, which will be an array of Numbers with twice as many
      //elements as there are ranges. odd indices are starts, and evens are the
      //ends that correspond to the start times immediately preceding them.
      //only act if we have the ranges array. if it doesn't exist, don't bother
      //to render the loaded ranges.
      var mediaView = this.get('mediaView');
      if(!mediaView) return;
      var ranges = mediaView.get('loadedTimeRanges');
      if(!ranges) return;
      //make sure we have the pointer to our element which will house all the
      //clones of the loaded-style background:
      if(!this.loadedRangesElement){
        this.loadedRangesElement = this.$(this.get('loadedRangesSelector'))[0];
      }
      //now, make sure we have a loaded-style slider background template, which
      //will be cloned as many times as is necessary to render all loaded ranges:
      if(!this.loadedBGTemplate) {
        this.loadedBGTemplate = document.createElement('span');
        this.loadedBGTemplate.className = "sc-loaded-range";
        this.loadedBGTemplate.innerHTML = [
          '<span class="sc-loaded-range-inner">',
            '<span class="sc-leftcap loaded"></span>',
            '<span class="sc-rightcap loaded"></span>',  
            '<span class="sc-track loaded"></span>',
          '</span>'
        ].join('');
      }
      //now, make sure we have our cache of clones of the slider background
      //template. we don't want to be spawning new HTML elements every time
      //we render, so we will use this pool of them.
      if(!this.loadedRangeElements) this.loadedRangeElements = [];
      //now, for each range, obtain or create a clone of the background
      //template, and style it such that the inner element lands
      //exactly on top of the original slider background, but clipped
      //by the outer element.
      for(i=0; i<ranges.length/2; i++) {
        var clone = this.loadedRangeElements[i] || 
                   (this.loadedRangeElements[i] = this.loadedBGTemplate.cloneNode(true));
        var leftClip  = Math.round(((ranges[ 2*i ]+min)/max) * width);
        var rightClip = Math.round(((ranges[2*i+1]+min)/max) * width);
        clone.style.left = leftClip+"px";
        clone.style.width = rightClip-leftClip+"px";
        clone.firstChild.style.left = 0-leftClip+"px";
        clone.firstChild.style.width = width+"px";
        if(!clone.parentNode) this.loadedRangesElement.appendChild(clone);
      }
      //now, make sure there aren't any EXTRA clones of the darkened background
      //still hanging around. loop through the end of the loadedRangeElements
      //list at indices greater than ranges.length/2, and remove the elements.
      for(i=ranges.length/2; i<this.loadedRangeElements.length; i++) {
        if(this.loadedRangeElements[i].parentNode) {
          this.loadedRangeElements[i].parentNode.removeChild(this.loadedRangeElements[i]);
        }
      }
      
      //console.log('rendered loaded time ranges for '+ranges);
  }.observes('*mediaView.loadedTimeRanges'),

  _triggerHandle: function(evt, firstEvent) {
    var width = this.get('frame').width,
        min = this.get('minimum'), max=this.get('maximum'),  
        step = this.get('step'), v=this.get('value'), loc, maxLoc, minLoc,
        handle = this.handleElement ||
                (this.handleElement=this.$(this.get('handleSelector'))[0]);
    
    //try to get a handleWidth from offsetWidth (if we don't already have a handleWidth);
    //but make sure to favor zero over something like NaN we might get...
    if(!this.handleWidth){
      this.handleWidth = this.handleElement.offsetWidth || this.handleWidth;
    }
    //get the location of the cursor relative to the view
    if(firstEvent){    
      loc = this.convertFrameFromView({ x: evt.pageX }).x;
      this._evtDiff = evt.pageX - loc;
    }else{
      loc = evt.pageX-this._evtDiff;
    }

    //derive the extremes
    maxLoc = width-this.handleWidth/2-this.rightHandleInset;
    minLoc = this.handleWidth/2+this.leftHandleInset;

    //constrain loc to at least half a knob-width from either extreme.
    loc = Math.max(Math.min(loc,maxLoc),minLoc);
    
    // convert to fraction of available width
    loc = (loc-minLoc) / (maxLoc-minLoc);
    
    // convert to value using minimum/maximum then constrain to steps
    loc = min + ((max-min)*loc);
    if (step !== 0) loc = Math.round(loc / step) * step ;

    // if changes by more than a rounding amount, set v.
    if (Math.abs(v-loc)>=0.01) this.set('value', loc); // adjust 
    return YES ;
  },

  mouseDown: function(evt) {
    var media=this.get('mediaView');
    if(media) media.startSeek();
    return sc_super();
  },

  mouseUp: function(evt) {
    var media=this.get('mediaView');
    if(media) media.endSeek();
    return sc_super();
  }, 
  
  mouseWheel: function(){
    var media, ret;
    SC.RunLoop.begin();
    media=this.get('mediaView');
    if(media) media.startSeek();
    ret = sc_super();
    SC.RunLoop.end();
    SC.RunLoop.begin();
    if(media) media.endSeek();
    SC.RunLoop.end();
    return ret;
  }  
});

