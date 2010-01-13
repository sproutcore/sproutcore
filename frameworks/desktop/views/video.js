// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.VideoView = SC.View.extend({

  classNames: 'sc-video-view',
  displayProperties: ['value', 'shouldAutoResize'],
  videoObject:null,
  
  currentTime : 0, //current time in secs
  duration : 0, //video duration in secs
  volume:0, //volume value from 0 to 1
  size:0, //total size of file
  loadedData:0, //loaded bits
  paused: YES, //is the video paused
  loaded: NO, //has the video loaded
  ended: NO, //did the video finished playing
  canPlay: NO, //can the video be played
  videoWidth:0,
  videoHeight:0,
  
  time: '00:00/00:00',
  degradeList: ['video','quicktime', 'flash'],
  
  render: function(context, firstTime) {
    var i, j, listLen, pluginsLen;
    if(firstTime){
      for(i=0, listLen = this.degradeList.length; i<listLen; i++){
        switch(this.degradeList[i]){
        case "video":
          if(SC.browser.safari){
            context.tagName('video');
            context.attr('src', this.src);
            context.attr('poster', this.poster);
         //   context.push('video tag not supported by your browser');
          }
          this.loaded='video';
          return;
        case "quicktime":
          var hasQT=false;
          if (navigator.plugins) {
            for (j=0, pluginsLen = navigator.plugins.length; j < pluginsLen; j++ ) {
              if (navigator.plugins[j].name.indexOf("QuickTime") >= 0) hasQT = true; 
            }
            if(!hasQT) break;
          }
          var id = SC.guidFor(this);
          context.push('<object width="100%" height="100%"');
          context.push('classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" ');
          context.push('id="object_'+id+'" ');
          context.push('codebase="http://www.apple.com/qtactivex/qtplugin.cab">');
          context.push('<param name="src" value="'+this.src+'"/>');
          context.push('<param name="autoplay" value="false"/>');
          context.push('<param name="loop" value="false"/>');
          context.push('<param name="controller" value="false"/>');
          context.push('<param name="postdomevents" value="true"/>');
          context.push('<embed width="100%" height="100%"');
          context.push('name="object_'+id+'" ');
          context.push('src="'+this.src+'" ');
          context.push('autostart="false" ');
          context.push('EnableJavaScript="true" ');
          context.push('postdomevents="true" ');
          context.push('pluginspage="www.apple.com/quicktime/download">');
          context.push('</embed></object>');
          context.push('</object>');
          i=listLen;
          this.loaded='quicktime';
          return;
        case "flash":
          this.loaded='flash';
          return;
        default:
          context.push('video is not supported by your browser');
          return;
      }
      }
    }
    else{
      
    }
  },
  
  
  didCreateLayer :function(){
    var videoElem = this.$()[0];
    var view=this;
    if(this.loaded==="video"){
      videoElem = this.$()[0];
      this.set('videoObject', videoElem);
      videoElem.addEventListener("durationchange", function () {
        SC.RunLoop.begin();
        view.set('duration', videoElem.duration);
        SC.RunLoop.end();
      }, false);
      videoElem.addEventListener("timeupdate", function () {
        SC.RunLoop.begin();
        view.set('currentTime', videoElem.currentTime);
        view.updateTime();
        SC.RunLoop.end();
      }, false);
      videoElem.addEventListener("loadstart", function () {
        SC.RunLoop.begin();
        view.set('volume', videoElem.volume);
        console.log('loadstart');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("progress", function (ev) {
        SC.RunLoop.begin();
        if(this.lengthComputable) view.set('size', ev.total);
        view.set('loadedData', ev.loaded);
        console.log('progress '+ev.loaded+","+ev.total );
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("suspend", function () {
        SC.RunLoop.begin();
        console.log('suspend');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("load", function () {
        SC.RunLoop.begin();
        console.log('load');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("abort", function () {
        SC.RunLoop.begin();
        console.log('abort');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("error", function () {
        SC.RunLoop.begin();
        console.log('error');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("loadend", function () {
        SC.RunLoop.begin();
        console.log('loadend');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("emptied", function () {
        SC.RunLoop.begin();
        console.log('emptied');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("stalled", function () {
        SC.RunLoop.begin();
        console.log('stalled');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("play", function () {
        SC.RunLoop.begin();
        view.set('paused', NO);
        console.log('play');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("pause", function () {
        SC.RunLoop.begin();
        view.set('paused', YES);
        console.log('pause');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("loadedmetadata", function () {
        SC.RunLoop.begin();
        view.set('videoWidth', videoElem.videoWidth);
        view.set('videoHeight', videoElem.videoHeight);
        
        console.log('loadedmetadata');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("loadeddata", function () {
        SC.RunLoop.begin();
        console.log('loadeddata');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("waiting", function () {
        SC.RunLoop.begin();
        console.log('waiting');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("playing", function () {
        SC.RunLoop.begin();
        console.log('playing');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("canplay", function () {
        SC.RunLoop.begin();
        view.set('canPlay', YES);
        console.log('canplay');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("canplaythrough", function () {
        SC.RunLoop.begin();
        console.log('canplaythrough');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("seeking", function () {
        SC.RunLoop.begin();
        console.log('seeking');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("seeked", function () {
        SC.RunLoop.begin();
        console.log('seeked');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("ended", function () {
        SC.RunLoop.begin();
        view.set('ended', YES);
        console.log('ended');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("ratechange", function () {
        SC.RunLoop.begin();
        console.log('ratechange');
        SC.RunLoop.end();
      }, false);     
      videoElem.addEventListener("volumechange", function () {
        SC.RunLoop.begin();
        console.log('volumechange');
        SC.RunLoop.end();
      }, false);     
      
    }
    
  },
  
  didAppendToDocument :function(){
    var vid=this._getVideoObject();
    var view=this;
    if(this.loaded==="quicktime"){
      this.set('videoObject', vid);
      view.set('duration', vid.GetDuration()/vid.GetTimeScale());
      console.log('duration set'+vid.GetDuration()/vid.GetTimeScale());
      view.set('volume', vid.GetVolume()/256);
      this.updateTime();
      vid.addEventListener("qt_durationchange", function () {
        SC.RunLoop.begin();
        view.set('duration', vid.GetDuration()/vid.GetTimeScale());
        console.log('qt_durationchange');
        SC.RunLoop.end();
      }, false);
      vid.addEventListener("qt_timechanged", function () {
        SC.RunLoop.begin();
        view.set('currentTime', vid.GetTime()/vid.GetTimeScale());
        console.log('qt_timechanged');
        view.updateTime();
        SC.RunLoop.end();
      }, false);
      vid.addEventListener("qt_begin", function () {
        SC.RunLoop.begin();
        view.set('volume', vid.GetVolume()/256);
        console.log('qt_begin');
        SC.RunLoop.end();
      }, false);
      vid.addEventListener("qt_loadedmetadata", function () {
        SC.RunLoop.begin();
        view.set('duration', vid.GetDuration()/vid.GetTimeScale());
        console.log('qt_loadedmetadata');
        SC.RunLoop.end();
      }, false);
      vid.addEventListener("qt_loadedfirstframe", function () {
        console.log('qt_loadedfirstframe');
      }, false);
      vid.addEventListener("qt_canplay", function () {
        SC.RunLoop.begin();
        view.set('canPlay', YES);
        console.log('qt_canplay');
        SC.RunLoop.end();
      }, false);
      vid.addEventListener("qt_canplaythrough", function () {
        console.log('qt_canplaythrough');
      }, false);
      vid.addEventListener("qt_load", function () {
        console.log('qt_load');
      }, false);
      vid.addEventListener("qt_ended", function () {
        console.log('qt_ended');
      }, false);
      vid.addEventListener("qt_error", function () {
        console.log('qt_error');
      }, false);
      vid.addEventListener("qt_pause", function () {
        SC.RunLoop.begin();
        view.set('paused', YES);
        console.log('qt_pause');
      }, false);
      vid.addEventListener("qt_play", function () {
        SC.RunLoop.begin();
        view.set('paused', NO);
        console.log('qt_play');
      }, false);
      vid.addEventListener("qt_progress", function () {
        console.log('qt_progress');
      }, false);
      vid.addEventListener("qt_waiting", function () {
        console.log('qt_waiting');
      }, false);
      vid.addEventListener("qt_stalled", function () {
        console.log('qt_stalled');
      }, false);
      vid.addEventListener("qt_volumechange", function () {
        console.log('qt_volumechange');
      }, false);
    }
  },
  
  seek:function(){
    var timeInSecs, totaltimeInSecs, formattedTime;
    var vid=this._getVideoObject();
    if(this.loaded==='video'){
      if(this.get('paused')) vid.currentTime=this.get('currentTime');
    }
    if(this.loaded==='quicktime'){
      vid.SetTime(this.get('currentTime')*vid.GetTimeScale());
    }
  }.observes('currentTime'),
  
  _addZeros:function(value){
    if(value.toString().length<2) return "0"+value;
    return value;
  },
  
  setVolume:function(){
    var vid=this._getVideoObject();
    if(this.loaded==="video") vid.volume=this.get('volume');
    if(this.loaded==="quicktime") vid.SetVolume(this.get('volume')*256);
  }.observes('volume'),
  
  
  play: function(){
    var vid=this._getVideoObject();
    if(this.loaded==="video") vid.play();
    if(this.loaded==="quicktime") vid.Play();
  },
  
  stop: function(){
    var vid=this._getVideoObject();
    if(this.loaded==="video")  vid.pause();
    if(this.loaded==="quicktime")  vid.Stop();
  },
  
  playPause: function(){
    var vid=this._getVideoObject();
    if(this.loaded==="video"){
      if(this.get('paused')){
        this.set('paused', NO);
        vid.play();
      }else{
        this.set('paused', YES);
        vid.pause();
      }
    }
    if(this.loaded==="quicktime"){
      if(this.get('paused')){
        this.set('paused', NO);
        vid.Play();
      }else{
        this.set('paused', YES);
        vid.Stop();
      }
    }   
  },
   
  fullScreen: function(){
    return;
  },
  
  closedCaption:function(){
    return;
  },
  
  _getVideoObject:function(){
    if(this.loaded==="video") return this.get('videoObject');
    if(this.loaded==="quicktime") return document['object_'+SC.guidFor(this)];
  },
  
  updateTime:function(){
    var currentTime=this.get('currentTime');
    var totaltimeInSecs = this.get('duration');
    var formattedTime = this._addZeros(Math.floor(currentTime/60))+':'+this._addZeros(Math.floor(currentTime%60))+"/"+this._addZeros(Math.floor(totaltimeInSecs/60))+':'+this._addZeros(Math.floor(totaltimeInSecs%60));
    this.set('time', formattedTime);
  }.observes('currentTime')
  
});
