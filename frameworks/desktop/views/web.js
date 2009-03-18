// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/** @class

  Used to display an iframe. The contents of the iFrame should be from the 
  same domain. (i.e. the src / content should be from the same domain)
  if you want to access the contents of the iframe.


  @extends SC.View
  @since SproutCore 1.0
*/
SC.WebView = SC.View.extend(SC.Control,{

  classNames: 'sc-iframe-view',
  displayProperties: ['value', 'shouldAutoResize'],

  /**
  The content of the iframe can be bigger than the size specifed when creating
  the view. If you want the view to be auto-resized to the dimensions of the 
  iframe, then set the value of this property to YES.
  
  
  The web view can be auto resized only if the contents are from the same
  domain as the parent domain.
  @property{Boolean}
  */
  shouldAutoResize: NO,


  /**
  
  */
  $iframe: function() {
    return this.$('iframe');
  },


  tempRenderCounter: 0,

  render: function(context, firstTime) {
    var src = this.get('value');
    this.tempRenderCounter++;
    if (firstTime) {
      context.push('<iframe src="' + src + '" style="position: absolute; width: 100%; height: 100%; border: 0px; margin: 0px; padding: 0p;"></iframe>');
      console.log('firsttime, renderCounter:%@'.fmt(this.tempRenderCounter));

    } else {
      console.log('not firsttime, renderCounter:%@'.fmt(this.tempRenderCounter));
            var iframe = this.$iframe();
      // clear out the previous src, to force a reload
      iframe.attr('src', 'javascript:;');
      iframe.attr('src', src);
    }
  },

  
  
  
  didCreateLayer: function() {
    var f = this.$iframe()[0];
    SC.Event.add(f,'load',this, this._autoResizeView);
  },
  
  
  
  
  

  /** Computes the size of the contents of the iframe from the DOM 
  @returns {Object} a JSON object representing the size in terms of height
  and width
  */

  _autoResizeView: function() {
    
    // if (this.get('shouldAutoResize')) {
    //   var size;
    //   var iframeElt = this.$iframe();
    //   var contentDoc = iframeElt ? iframeElt[0].contentDocument: null;
    //   debugger;
    //   if (contentDoc) {
    //     if (window.innerHeight) {
    //       size = {
    //         width: window.innerWidth,
    //         height: window.innerHeight
    //       };
    //     } else if (document.documentElement && document.documentElement.clientHeight) {
    //       size = {
    //         width: document.documentElement.clientWidth,
    //         height: document.documentElement.clientHeight
    //       };
    //     } else if (document.body) {
    //       size = {
    //         width: document.body.clientWidth,
    //         height: document.body.clientHeight
    //       };
    //     }
    //   }
    // }
    


    
    // else do nothing.
    // else {
    // }
    
    
    
    
    
    // this.height(size.height);
    // this.width(size.width);
  }
});
