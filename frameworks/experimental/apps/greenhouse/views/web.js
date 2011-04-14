// ==========================================================================
// Project:   Greenhouse.WebView
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  provides access to the iframes memoryspace
  @extends SC.WebView
*/
Greenhouse.WebView = SC.WebView.extend(
/** @scope Greenhouse.WebView.prototype */ {
  
  iframeDidLoad: function() {
    //fit the iframe to size of the contents.
    if (this.get('shouldAutoResize') === YES){
      var contentWindow;
      var iframeElt = this.$('iframe')[0];
      if(iframeElt && iframeElt.contentWindow){
        contentWindow = iframeElt.contentWindow;
        this.contentWindow = contentWindow;
        if(contentWindow && contentWindow.document && contentWindow.document.documentElement){
          var docElement = contentWindow.document.documentElement;
          // setting the width before the height gives more accurate results.. 
          // atleast for the test iframe content i'm using.
          //TODO: try out document flows other than top to bottom.
          if (!SC.browser.isIE){
            this.$().width(docElement.scrollWidth);
            this.$().height(docElement.scrollHeight);          
          } else {
            this.$().width(docElement.scrollWidth + 12);
            this.$().height(docElement.scrollHeight + 5);          
          }
        }
      }
    }
    else{
      var iframe = this.$('iframe')[0];
      if(iframe) this.contentWindow = iframe.contentWindow;
    }
    Greenhouse.set('iframe', this.contentWindow);
    Greenhouse.sendAction('iframeLoaded');
  }
});
