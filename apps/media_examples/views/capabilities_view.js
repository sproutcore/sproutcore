// ==========================================================================
// Project:   Media Examples - A Media Playback sandbox.
// Copyright: ©2012 Michael Krotscheck and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals MediaExamples */

/**
 * @class
 * 
 * (Document Your View Here)
 * 
 * @extends SC.View
 */
MediaExamples.CapabilitiesView = SC.View.extend(SC.FlowedLayout,
/** @scope MediaExamples.CapabilitiesView.prototype */
{
  layoutDirection : SC.LAYOUT_VERTICAL,

  childViews : [ 'hasAudioPlayback', 'hasVideoPlayback', 'hasMicrophone', 'hasVideoCamera', 'isHTML5AudioSupported', 'isHTML5VideoSupported', 'isHTML5StreamApiSupported', 'isQuicktimeSupported', 'isFlashSupported' ],

  fillWidth : YES,

  hasAudioPlayback : SC.LabelView.extend({
    layout : {
      height : 22
    },
    value : "Audio Playback: " + SC.mediaCapabilities.get("hasAudioPlayback")
  }),

  hasVideoPlayback : SC.LabelView.extend({
    layout : {
      height : 22
    },
    value : "Video Playback: " + SC.mediaCapabilities.get("hasAudioPlayback")
  }),

  hasMicrophone : SC.LabelView.extend({
    layout : {
      height : 22
    },
    value : "Microphone: " + SC.mediaCapabilities.get("hasMicrophone")
  }),

  hasVideoCamera : SC.LabelView.extend({
    layout : {
      height : 22
    },
    value : "Video Camera: " + SC.mediaCapabilities.get("hasVideoCamera")
  }),

  isHTML5AudioSupported : SC.LabelView.extend({
    layout : {
      height : 22
    },
    value : "HTML5 Audio: " + SC.mediaCapabilities.get("isHTML5AudioSupported")
  }),

  isHTML5VideoSupported : SC.LabelView.extend({
    layout : {
      height : 22
    },
    value : "HTML5 Video: " + SC.mediaCapabilities.get("isHTML5VideoSupported")
  }),

  isHTML5StreamApiSupported : SC.LabelView.extend({
    layout : {
      height : 22
    },
    value : "Stream API: " + SC.mediaCapabilities.get("isHTML5StreamApiSupported")
  }),

  isQuicktimeSupported : SC.LabelView.extend({
    layout : {
      height : 22
    },
    value : "Quicktime Plugin: " + SC.mediaCapabilities.get("isQuicktimeSupported")
  }),

  isFlashSupported : SC.LabelView.extend({
    layout : {
      height : 22
    },
    value : "Flash Plugin: " + SC.mediaCapabilities.get("isFlashSupported")
  }),
});
