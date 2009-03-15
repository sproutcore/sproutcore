// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/** @class

  Used to display an iframe. The contents of the iFrame should be from the 
  same domain. i.e. the src / content should be from the same domain, in order
  if you want to access the contents of the iframe.


  @extends SC.View
  @since SproutCore 1.0
*/
SC.WebView = SC.View.extend({

  classNames: 'sc-iframe-view',
  content: null,
  contentBindingDefault: SC.Binding.single().notEmpty(),
  contentUrlKey: null,
  contentUrlKeyBindingDefault: SC.Binding.single(),
  displayProperties: ['content', 'contentUrlKey', 'shouldAutoResize'],
  delegate: null,
  
  

  /**
  The content of the iframe can be bigger than the size specifed when creating
  the view. If you want the view to be auto-resized to the dimensions of the 
  iframe, then set the value of this property to YES.
  
  
  The web view can be auto resized only if the contents are from the same
  domain as the parent domain.
  @property{Boolean}
  */
  shouldAutoResize: NO,

  
  



  $iframe: function() {
    return this.$('iframe');
  },






  iFrameViewWillLoadUrl: function(view, url) {
    return url;
  },
  iFrameViewDidLoadUrl: function(view, url) {
    console.log('iFrameViewDidLoadUrl%@'.fmt(url));
    
    console.log(this.$iframe()[0]);
    
    
    /**
    resize the view automatically based on the content size, if the flag
    shouldAutoResize is set to YES
    */
    // if ( this.get('shouldAutoResize')){
    //   var newSize = this._computeContentSize();
    //   this.height(newSize.height);
    //   this.width(newSize.width);
    // } 
  },







  render: function(context, firstTime) {
    var content = this.get('content');
    var urlKey = this.get('contentUrlKey');
    var src = '';
    switch (content) {
    case SC.MULTIPLE_PLACEHOLDER:
    case SC.EMPTY_PLACEHOLDER:
    case SC.NULL_PLACEHOLDER:
      src = static_url('blank');
      break;
    default:
      src = (urlKey) ? content.get(urlKey) : content;
      break;
    }

    src = this.invokeDelegateMethod(this.delegate, 'iFrameViewWillLoadUrl', 
    this, src) || '';

    if (firstTime) {
      context.push('<iframe src="' + src + 
      '" style="position: absolute; width: 100%; height: 100%; border: 0px; margin: 0px; padding: 0p;"></iframe>');
    } else {
      var iframe = this.$iframe();
      // clear out the previous src, to force a reload
      iframe.attr('src', 'javascript:;'); 
      iframe.attr('src', src);
    }

    this.invokeDelegateMethod(this.delegate, 'iFrameViewDidLoadUrl', this, src);
    
    
  },
  
  
  
  
  
  
  

  /** @private */
  _contentDidChange: function(target, key, value, propertyRevision) {

    // handle changes to the content...
    if ((value = this.get('content')) != this._field_content) {

      // get the handler method
      var f = this._contentPropertyDidChange;

      // stop listening to old content.
      if (this._field_content) {
        if (SC.isArray(this._field_content)) {
          this._field_content.invoke('removeObserver', '*', this, f);
        } else if (this._field_content.removeObserver) {
          this._field_content.removeObserver('*', this, f);
        }
      }

      // start listening for changes on the new content object.
      this._field_content = value;
      if (value) {
        if (SC.isArray(value)) {
          value.invoke('addObserver', '*', this, f);
        } else if (value.addObserver) {
          value.addObserver('*', this, f);
        }
      }

      // notify everyone that everything is different now.
      this.allPropertiesDidChange();
      this.endPropertyChanges();
    }
  }.observes('content'),
  
  
  
  
  
  

  /** @private Invoked when properties on the content object change. */
  _contentPropertyDidChange: function(target, key, value, propertyRevision) {
    if (key === '*' || key === this.get('contentUrlKey')) {
      this.displayDidChange();
    }
  }
  
  
  
  
  
  
  

  
  /** Computes the size of the contents of the iframe from the DOM 
  @returns {Object} a JSON object representing the size in terms of height
  and width
  */  
  // _computeContentSize: function() {
  //   var size ;
  //   debugger;
  //   var iframeElt = this.$iframe();
  //   var contentDoc =  iframeElt?iframeElt[0].contentDocument: null;
  //   if (!contentDoc){
  //     size = {
  //       width: this.width(),
  //       height: this.height()
  //     };
  //   } else if (window.innerHeight) {
  //     size = { 
  //       width: window.innerWidth, 
  //       height: window.innerHeight 
  //     } ;
  // 
  //   } else if (document.documentElement && document.documentElement.clientHeight) {
  //     size = { 
  //       width: document.documentElement.clientWidth, 
  //       height: document.documentElement.clientHeight 
  //     } ;
  // 
  //   } else if (document.body) {
  //     size = { 
  //       width: document.body.clientWidth, 
  //       height: document.body.clientHeight 
  //     } ;
  //   }
  //   return size;
  // }
});
