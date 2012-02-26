// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ¬©2012 Michael Krotscheck and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * @class
 * 
 * An easy-to-reference list of media capabilities which the current running
 * browser supports such as HTML5 and Plugin detection. It is modeled after
 * Flash Player's browser capabilities class, with all the non-media related
 * properties removed. The browser version support reference is
 * http://caniuse.com, and we've taken a very bullish approach: Partial support
 * or support via browser-custom properties is not considered "supported" for
 * our purposes.
 * 
 * @see http://caniuse.com/
 * @since SproutCore 1.8
 * @author Michael Krotscheck
 */
SC.mediaCapabilities = SC.Object.create(
/** @scope SC.mediaCapabilities */
{
  /**
   * Specifies whether the browser has audio playback capabilities.
   * 
   * @type Boolean
   */
  hasAudioPlayback : function() {
    return this.get('isHTML5AudioSupported') || this.get('isQuicktimeSupported') || this.get('isFlashSupported');
  }.property('isHTML5AudioSupported', 'isQuicktimeSupported', 'isFlashSupported').cacheable(),

  /**
   * Specifies whether the browser has video playback capabilities.
   * 
   * @type Boolean
   */
  hasVideoPlayback : function() {
    return this.get('isHTML5VideoSupported') || this.get('isQuicktimeSupported') || this.get('isFlashSupported');
  }.property('isHTML5VideoSupported', 'isQuicktimeSupported', 'isFlashSupported').cacheable(),

  /**
   * Specifies whether the browser supports audio recording via the HTML5 stream
   * API or the Adobe Flash plugin.
   * 
   * @type Boolean
   */
  hasMicrophone : function() {
    return this.get('isFlashSupported') || this.get('isHTML5StreamApiSupported');
  }.property('isFlashSupported', 'isHTML5StreamApiSupported').cacheable(),

  /**
   * Specifies whether the browser supports video recording via the HTML5 stream
   * API or the Adobe Flash Plugin.
   * 
   * @type Boolean
   */
  hasVideoCamera : function() {
    return this.get('isFlashSupported') || this.get('isHTML5StreamApiSupported');
  }.property('isFlashSupported', 'isHTML5StreamApiSupported').cacheable(),

  /**
   * Specifies whether the browser supports the HTML5 <audio> tag. Versions are
   * taken from http://caniuse.com
   * 
   * @see http://caniuse.com
   * @type Boolean
   */
  isHTML5AudioSupported : function() {
    try {
      var doc = document.createElement('audio');
      isAudioSupported = !!doc.canPlayType;
      delete doc;
      return isAudioSupported;
    } catch (e) {
      return NO;
    }
  }.property().cacheable(),

  /**
   * Specifies whether the browser supports the HTML5 getUserMedia/Stream API.
   * 
   * NOTE: As of February 2012, this feature is still in Draft status and is
   * likely to change frequently. It's included here for the sake of
   * completeness, however concrete implementations don't yet exist.
   * 
   * @type Boolean
   */
  isHTML5StreamApiSupported : function() {
    return !!navigator.getUserMedia;
  }.property().cacheable(),

  /**
   * Specifies whether the browser supports the HTML5 <video> tag.
   * 
   * @type Boolean
   */
  isHTML5VideoSupported : function() {
    try {
      var doc = document.createElement('video');
      isVideoSupported = !!doc.canPlayType;
      delete doc;
      return isVideoSupported;
    } catch (e) {
      return NO;
    }
  }.property().cacheable(),

  /**
   * Specifies whether the browser supports quicktime media playback.
   * 
   * @type Boolean
   */
  isQuicktimeSupported : function() {

    // Non-IE detection
    if (navigator.plugins) {
      for ( var i = 0; i < navigator.plugins.length; i++) {
        if (navigator.plugins[i].name.indexOf("QuickTime") >= 0) {
          return YES;
        }
      }
    }

    // IE ActiveX detection
    if (window.ActiveXObject) {
      var control = null;
      try {
        control = new ActiveXObject('QuickTime.QuickTime');
        delete control;
        return YES;
      } catch (e) {
        // Do nothing- the ActiveX object isn't available.
      }

      try {
        // This generates a user prompt in Internet Explorer 7
        control = new ActiveXObject('QuickTimeCheckObject.QuickTimeCheck');
        delete control;
        return YES;
      } catch (e) {
        // Do nothing- The ActiveX object isn't available.
      }
    }

    // We didn't find it.
    return NO;
  }.property().cacheable(),

  /**
   * Specifies whether the browser supports the Adobe Flash plugin.
   * 
   * @type Boolean
   */
  isFlashSupported : function() {

    // Non-IE detection
    if (navigator.plugins) {
      for ( var i = 0; i < navigator.plugins.length; i++) {
        if (navigator.plugins[i].name.indexOf("Shockwave Flash") >= 0) {
          return YES;
        }
      }
    }

    // IE ActiveX detection
    if (window.ActiveXObject) {
      try {
        var control = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        delete control;
        return YES;
      } catch (e) {
        // Do nothing- The ActiveX object isn't available.
      }
    }

    // We didn't find it.
    return NO;
  }.property().cacheable(),
});
