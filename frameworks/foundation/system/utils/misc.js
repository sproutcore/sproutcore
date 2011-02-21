SC.mixin( /** @scope SC */ {
  _downloadFrames: 0, // count of download frames inserted into document

  /**
    Starts a download of the file at the named path.

    Use this method when you want to cause a file to be downloaded to a users
    desktop instead of having it display in the web browser.  Note that your
    server must return a header indicating that the file  is intended for
    download also.
  */
  download: function(path) {
    var tempDLIFrame=document.createElement('iframe'),
        frameId = 'DownloadFrame_' + this._downloadFrames;
    SC.$(tempDLIFrame).attr('id',frameId);
    tempDLIFrame.style.border='10px';
    tempDLIFrame.style.width='0px';
    tempDLIFrame.style.height='0px';
    tempDLIFrame.style.position='absolute';
    tempDLIFrame.style.top='-10000px';
    tempDLIFrame.style.left='-10000px';
    // Don't set the iFrame content yet if this is Safari
    if (!SC.browser.isSafari) {
      SC.$(tempDLIFrame).attr('src',path);
    }
    document.getElementsByTagName('body')[0].appendChild(tempDLIFrame);
    if (SC.browser.isSafari) {
      SC.$(tempDLIFrame).attr('src',path);
    }
    this._downloadFrames = this._downloadFrames + 1;
    if (!SC.browser.isSafari) {
      var r = function() {
        document.body.removeChild(document.getElementById(frameId));
        frameId = null;
      } ;
      r.invokeLater(null, 2000);
    }
    //remove possible IE7 leak
    tempDLIFrame = null;
  },

  // Get the computed style from specific element. Useful for cloning styles
  getStyle: function(oElm, strCssRule){
    var strValue = "";
    if(document.defaultView && document.defaultView.getComputedStyle){
      strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
    }
    else if(oElm.currentStyle){
     strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
      return p1.toUpperCase();
     });
     strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
  },

  // Convert double byte characters to standard Unicode. Considers only
  // conversions from zenkaku to hankaky roomaji
  uniJapaneseConvert: function (str){
    var nChar, cString= '', j, jLen;
    //here we cycle through the characters in the current value
    for (j=0, jLen = str.length; j<jLen; j++){
      nChar = str.charCodeAt(j);

      //here we do the unicode conversion from zenkaku to hankaku roomaji
      nChar = ((nChar>=65281 && nChar<=65392)?nChar-65248:nChar);

      //MS IME seems to put this character in as the hyphen from keyboard but not numeric pad...
      nChar = ( nChar===12540?45:nChar) ;
      cString = cString + String.fromCharCode(nChar);
    }
    return cString;
  }


});
