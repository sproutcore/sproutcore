// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals SC */

sc_require('views/media_slider');
/** @class

  (Document Your View Here)

  @extends SC.View
*/
SC.MediaControlsView = SC.View.extend({

  target: null,
  
  childViews: 'playButton progressView timeView minusLabelView volumeView plusLabelView theaterButton'.w(),
  classNames: 'sc-media-controls',
  
  leftHandleInset:null,   //until a bug in the way bindings are handled is fixed, these have to be defined
  rightHandleInset:null,  //for the slider to be able to have its notEmpty bindings function and drop in
  handleWidth:null,       //their placeholder values.
  
  playObserver: function(){
    if(this.getPath('target.paused')){
      this.get('playButton').set('icon', 'play');
    }else{
      this.get('playButton').set('icon', 'stop');
    }
  }.observes('*target.paused'),
  
  playButton: SC.ButtonView.design({
    title: '',
    titleMinWidth: 35,
    icon: 'play',
    noStyle: YES,
    layout: { top: 0, left: 0, width: 20, height:20},
    action: "playPause",
    targetBinding: "*owner.target",
    renderStyle: 'renderImage',
    theme: ''
  }),
  progressView: SC.MediaSlider.design({
    layout: { top: 0, left: 20, right: 220, height:20},
    value:0,
    minimum: 0,
    step:0.1,
    valueBinding: "*owner.target.currentTime" ,
    maximumBinding: "*owner.target.duration",
    mediaViewBinding: "*owner.target"
  }),
  
  timeView: SC.LabelView.design({
    layout: { top: 0, right: 160, width: 60, height:20},
    classNames: 'time',
    textAlign: SC.ALIGN_CENTER,
    valueBinding: '*owner.target.time'
  }),
  theaterButton: SC.ButtonView.design({
    title: '',
    icon: 'theater',
    renderStyle: 'renderImage',
    theme: '',
    titleMinWidth: 35,
    layout: { top: 0, right: 140, width: 20, height:20},
    action: "fullScreen",
    targetBinding: "*owner.target"
  }),
  minusLabelView: SC.LabelView.design({
    layout: { top: 0, right: 120, width: 20, height:20},
    value: '',
    icon: 'minus'
  }),
  volumeView: SC.MediaSlider.design({
    layout: { top: 0, right: 20, width: 100, height:20},
    value:0,
    valueBinding: "*owner.target.volume" ,
    minimum: 0,
    maximum: 1,
    step: 0.01
  }),
  plusLabelView: SC.LabelView.design({
    layout: { top: 0, right: 0, width: 20, height:20},
    value: '',
    icon: 'plus'
  })  
});
