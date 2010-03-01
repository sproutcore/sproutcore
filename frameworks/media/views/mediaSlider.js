// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals SC */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
SC.mediaSlider = SC.SliderView.extend({
  
  mediaView: null,

  mouseDown: function(evt) {
    var media=this.get('mediaView');
    if(media) media.startSeek();
    return sc_super();
  },

  mouseUp: function(evt) {
    var media=this.get('mediaView');
    if(media) media.endSeek();
    return sc_super();
  }  
});

