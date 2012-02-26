// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

module("SC.mediaCapabilities", {
  setup : function() {
    // Store these so we can reset all this later.
    oldBrowserAgent = navigator.userAgent;
    oldBrowserLanguage = navigator.language || navigator.browserLanguage;
    oldCompareVersion = SC.browser.compareVersion;
  },
  teardown : function() {
    SC.browser = SC._detectBrowser(oldBrowserAgent, oldBrowserLanguage);
    SC.browser.compareVersion = oldCompareVersion;
    delete oldBrowserAgent;
    delete oldBrowserLanguage;
    delete oldCompareVersion;
  }
});

/**
 * Helper function, resets the user agent in the browser detection.
 * 
 * @param userAgentString
 * @param language
 */
function resetUserAgent(userAgentString, language) {
  SC.browser = SC._detectBrowser(userAgentString, oldBrowserLanguage);
  SC.browser.compareVersion = oldCompareVersion;
  delete SC.browser._versionSplit;
}

/**
 * Is Flash supported?
 * 
 * These unit tests are largely meaningless, because we can't actually control
 * the navigator.plugins array or the window.ActiveXObject class, nor can we
 * manipulate the existence of the getUserMedia properties. Without being able
 * to toggle them dynamically, the best we can test is whether the return value
 * of the capabilities object is the same as is available via plugins... and
 * since that would consist of (at this time) the exact same code, it's somewhat
 * redundant. Still, this unit test is included in case something changes in the
 * future.
 * 
 * @see Department of Redundancy Department
 */
test("Test Flash Support", function() {

  doesFlashExist = NO;

  // Non-IE detection
  if (navigator.plugins) {
    for ( var i = 0; i < navigator.plugins.length; i++) {
      if (navigator.plugins[i].name.indexOf("Shockwave Flash") >= 0) {
        doesFlashExist = YES;
      }
    }
  } else if (window.ActiveXObject) {
    try {
      var control = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      delete control;
      doesFlashExist = YES;
    } catch (e) {
    }
  }

  equals(SC.mediaCapabilities.get('isFlashSupported'), doesFlashExist, "Flash plugin result must match what the browser supports.");
});

/**
 * Is Quicktime supported?
 */
test("Test Quicktime Support", function() {

  doesQuicktimeExist = NO;

  // Non-IE detection
  if (navigator.plugins) {
    for ( var i = 0; i < navigator.plugins.length; i++) {
      if (navigator.plugins[i].name.indexOf("Shockwave Flash") >= 0) {
        doesQuicktimeExist = YES;
      }
    }
  } else if (window.ActiveXObject) {
    try {
      var control = new ActiveXObject('QuickTime.QuickTime');
      delete control;
      doesQuicktimeExist = YES;
    } catch (e) {
    }
  }

  equals(SC.mediaCapabilities.get('isQuicktimeSupported'), doesQuicktimeExist, "Quicktime plugin result must match what the browser supports.");
});

/**
 * Test version support for the HTML5 audio tag.
 */
test("Test HTML5 Audio Support", function() {
  var isAudioSupported = NO;
  try {
    var doc = document.createElement('Audio');
    isAudioSupported = !!doc.canPlayType;
    delete doc;
  } catch (e) {
  }

  equals(SC.mediaCapabilities.get('isHTML5AudioSupported'), isAudioSupported, "Audio Support flag must match what we've been able to determine from the browser.");
});

/**
 * Test version support for the HTML5 video tag.
 */
test("Test HTML5 Video Support", function() {
  var isVideoSupported = NO;
  try {
    var doc = document.createElement('Video');
    isVideoSupported = !!doc.canPlayType;
    delete doc;
  } catch (e) {
  }

  equals(SC.mediaCapabilities.get('isHTML5VideoSupported'), isVideoSupported, "Video Support flag must match what we've been able to determine from the browser.");
});

/**
 * Test version support for the HTML5 getUserMedia spec.
 */
test("Test HTML5 User Media Support", function() {

  var isMediaSupported = !!navigator.getUserMedia;
  equals(SC.mediaCapabilities.get('isHTML5StreamApiSupported'), isMediaSupported, "Stream Support flag must match what we've been able to determine from the browser.");
});

/**
 * Check for video recording support. This test assumes all previous tests have
 * passed.
 */
test("Test Video Recording support", function() {
  // This is true if we either have flash available or if we support user media.
  var isRecordingSupported = SC.mediaCapabilities.get('isHTML5StreamApiSupported') || SC.mediaCapabilities.get('isFlashSupported');
  equals(SC.mediaCapabilities.get('hasVideoRecorder'), isRecordingSupported, "Video Recording support flag must match what we've found in the browser");
});

/**
 * Check for video recording support. This test assumes all previous tests have
 * passed.
 */
test("Test Video Recorder detection", function() {
  // This is true if we either have flash available or if we support user media.
  var isRecordingSupported = SC.mediaCapabilities.get('isHTML5StreamApiSupported') || SC.mediaCapabilities.get('isFlashSupported');
  equals(SC.mediaCapabilities.get('hasMicrophone'), isRecordingSupported, "Microphone support flag must match what we've found in the browser");
});

/**
 * Check for video recording support. This test assumes all previous tests have
 * passed.
 */
test("Test Microphone detection", function() {
  // This is true if we either have flash available or if we support user media.
  var isRecordingSupported = SC.mediaCapabilities.get('isHTML5StreamApiSupported') || SC.mediaCapabilities.get('isFlashSupported');
  equals(SC.mediaCapabilities.get('hasMicrophone'), isRecordingSupported, "Microphone support flag must match what we've found in the browser");
}); 

/**
 * Check for video playback support. This test assumes all previous tests have
 * passed.
 */
test("Test Video Playback detection", function() {
  // This is true if we either have flash available or if we support user media.
  var isVideoPlaybackSupported = SC.mediaCapabilities.get('isHTML5VideoSupported') || SC.mediaCapabilities.get('isQuicktimeSupported') || SC.mediaCapabilities.get('isFlashSupported');
  equals(SC.mediaCapabilities.get('hasVideoPlayback'), isVideoPlaybackSupported, "Video Playback support flag must match what we've found in the browser");
});

/**
 * Check for audio playback support. This test assumes all previous tests have
 * passed.
 */
test("Test Audio Playback detection", function() {
  // This is true if we either have flash available or if we support user media.
  var isAudioPlaybackSupported = SC.mediaCapabilities.get('isHTML5AudioSupported') || SC.mediaCapabilities.get('isQuicktimeSupported') || SC.mediaCapabilities.get('isFlashSupported');
  equals(SC.mediaCapabilities.get('hasAudioPlayback'), isAudioPlaybackSupported, "Audio Playback support flag must match what we've found in the browser");
});
