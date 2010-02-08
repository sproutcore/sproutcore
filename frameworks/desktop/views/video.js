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
  captionsEnabled: NO,
  
  time: '00:00/00:00',
  degradeList: ['video','quicktime', 'flash'],
  
  render: function(context, firstTime) {
    var i, j, listLen, pluginsLen;
    var id = SC.guidFor(this);
    if(firstTime){
      for(i=0, listLen = this.degradeList.length; i<listLen; i++){
        switch(this.degradeList[i]){
        case "video":
          if(SC.browser.safari){
            context.tagName('video');
            context.attr('src', this.get('value'));
            context.attr('poster', this.poster);
            this.loaded='video';
            console.log('loaded using video tag');
            return;
          }
          break;
        case "quicktime":
          if(SC.browser.msie){
            context.push('<object id="qt_event_source" '+
                        'classid="clsid:CB927D12-4FF7-4a9e-A169-56E4B8A75598" '+         
                        'codebase="http://www.apple.com/qtactivex/qtplugin.cab#version=7,2,1,0"> '+
                        '</object> ');
          }
          context.push('<object width="100%" height="100%"');
          if(SC.browser.msie){
            console.log('adding style behavior');
            context.push('style="behavior:url(#qt_event_source);"');
          }
          context.push('classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" '+
                      'id="qt_'+id+'" '+
                      'codebase="http://www.apple.com/qtactivex/qtplugin.cab">'+
                      '<param name="src" value="'+this.get('value')+'"/>'+
                      '<param name="autoplay" value="false"/>'+
                      '<param name="loop" value="false"/>'+
                      '<param name="controller" value="false"/>'+
                      '<param name="postdomevents" value="true"/>'+
                      '<param name="scale" value="aspect"/>'+
                      '<embed width="100%" height="100%" '+
                      'name="flash_'+id+'" '+
                      'src="'+this.get('value')+'" '+
                      'autostart="false" '+
                      'EnableJavaScript="true" '+
                      'postdomevents="true" '+
                      'controller="false" '+
                      'scale="aspect" '+
                      'pluginspage="www.apple.com/quicktime/download">'+
                      '</embed></object>'+
                      '</object>');
          this.loaded='quicktime';
          console.log('loaded using quicktime');
          return;
        case "flash":
          console.log('loaded using flash');
          var flashURL= sc_static('videoCanvas.swf');
          context.push('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '+
                        'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" '+
                        'width="100%" '+
                        'height="100%" '+
                        'id="flash_'+id+'" '+
                        'align="middle">'+
        	              '<param name="allowScriptAccess" value="sameDomain" />'+
        	              '<param name="allowFullScreen" value="true" />'+
        	              '<param name="movie" value="'+flashURL+'?src='+encodeURI(this.get('value'))+'" />'+
        	              '<param name="quality" value="autohigh" />'+
        	              '<param name="scale" value="default" />'+
        	              '<param name="wmode" value="transparent" />'+
        	              '<param name="bgcolor" value="#ffffff" />	'+
        	              '<embed src="'+flashURL+'?src='+encodeURI(this.get('value'))+'" '+
        	              'quality="autohigh" '+
        	              'scale="default" '+
        	              'wmode="transparent" '+
        	              'bgcolor="#ffffff" '+
        	              'width="100%" '+
        	              'height="100%" '+
        	              'name="flash_'+id+'" '+
        	              'align="middle" '+
        	              'allowScriptAccess="sameDomain" '+
        	              'allowFullScreen="true" '+
        	              'type="application/x-shockwave-flash" '+
        	              'pluginspage="http://www.adobe.com/go/getflashplayer" />'+
        	              '</object>');
          this.loaded='flash';
          return;
        default:
          context.push('video is not supported by your browser');
          return;
        }
      }
    }
  },

  
  
  didCreateLayer :function(){
    var videoElem = this.$()[0];
    var view=this;
    if(this.loaded==="video"){
      videoElem = this.$()[0];
      this.set('videoObject', videoElem);
      SC.Event.add(videoElem, 'durationchange', this, function () {
        SC.RunLoop.begin();
        view.set('duration', videoElem.duration);
        SC.RunLoop.end();
      }) ;
      SC.Event.add(videoElem, 'timeupdate', this, function () {
          SC.RunLoop.begin();
          view.set('currentTime', videoElem.currentTime);
          view.updateTime();
          SC.RunLoop.end();
      }) ;
      SC.Event.add(videoElem, 'loadstart', this, function () {
        SC.RunLoop.begin();
        view.set('volume', videoElem.volume);
        console.log('loadstart');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'progress', this, function () {
        SC.RunLoop.begin();
        if(this.lengthComputable) view.set('size', ev.total);
         try{
            var trackCount=view.GetTrackCount(),i;
            for(i=1; i<=trackCount;i++){
              if("Closed Caption"===this.GetTrackType(i)){
                view._closedCaptionTrackIndex=i;
              }
            }
          }catch(f){}
        //view.set('loadedData', ev.loaded);
        //console.log('progress '+ev.loaded+","+ev.total );
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'suspend', this, function () {
        SC.RunLoop.begin();
        console.log('suspend');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'load', this, function () {
        SC.RunLoop.begin();
        console.log('load');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'abort', this, function () {
        SC.RunLoop.begin();
        console.log('abort');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'error', this, function () {
        SC.RunLoop.begin();
        console.log('error');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'loadend', this, function () {
        SC.RunLoop.begin();
        console.log('loadend');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'emptied', this, function () {
        SC.RunLoop.begin();
        console.log('emptied');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'stalled', this, function () {
        SC.RunLoop.begin();
        console.log('stalled');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'play', this, function () {
        SC.RunLoop.begin();
        view.set('paused', NO);
        console.log('play');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'pause', this, function () {
        SC.RunLoop.begin();
        view.set('paused', YES);
        console.log('pause');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'loadedmetadata', this, function () {
        SC.RunLoop.begin();
        view.set('videoWidth', videoElem.videoWidth);
        view.set('videoHeight', videoElem.videoHeight);
        
        console.log('loadedmetadata');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'loadeddata', this, function () {
        SC.RunLoop.begin();
        console.log('loadeddata');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'waiting', this, function () {
        SC.RunLoop.begin();
        console.log('waiting');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'playing', this, function () {
        SC.RunLoop.begin();
        console.log('playing');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'canplay', this, function () {
        SC.RunLoop.begin();
        view.set('canPlay', YES);
        console.log('canplay');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'canplaythrough', this, function () {
        SC.RunLoop.begin();
        console.log('canplaythrough');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'seeking', this, function () {
        SC.RunLoop.begin();
        console.log('seeking');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'seeked', this, function () {
        SC.RunLoop.begin();
        console.log('seeked');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'ended', this, function () {
        SC.RunLoop.begin();
        view.set('ended', YES);
        console.log('ended');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'ratechange', this, function () {
        SC.RunLoop.begin();
        console.log('ratechange');
        SC.RunLoop.end();
      });     
      SC.Event.add(videoElem, 'volumechange', this, function () {
        SC.RunLoop.begin();
        console.log('volumechange');
        SC.RunLoop.end();
      });     
      
    }
    
  },
  
  didAppendToDocument :function(){
    var vid=this._getVideoObject();
    var videoElem = this.$()[0];
    var view=this;
    
    if(this.loaded==="quicktime"){
      try{
        vid.GetDuration();
      }catch(e){
        console.log('loaded fail trying later');
        this.invokeLater(this.didAppendToDocument, 100);
        return;
      }
      this.set('videoObject', vid);
      view.set('duration', vid.GetDuration()/vid.GetTimeScale());
      view.set('volume', vid.GetVolume()/256);
      this.updateTime();
      SC.Event.add(videoElem, 'qt_durationchange', this, function () {
        SC.RunLoop.begin();
        view.set('duration', vid.GetDuration()/vid.GetTimeScale());
        console.log('qt_durationchange');
        SC.RunLoop.end();
      });
      // SC.Event.add(videoElem, 'qt_timechanged', this, function () {
        // SC.RunLoop.begin();
        //         view.set('currentTime', vid.GetTime()/vid.GetTimeScale());
        //         console.log('qt_timechanged');
        //         view.updateTime();
        //         SC.RunLoop.end();
      // });
      SC.Event.add(videoElem, 'qt_begin', this, function () {
        SC.RunLoop.begin();
        view.set('volume', vid.GetVolume()/256);
        console.log('qt_begin');
        SC.RunLoop.end();
      });
      SC.Event.add(videoElem, 'qt_loadedmetadata', this, function () {
        SC.RunLoop.begin();
        view.set('duration', vid.GetDuration()/vid.GetTimeScale());
        console.log('qt_loadedmetadata');
        SC.RunLoop.end();
      });
      SC.Event.add(videoElem, 'qt_loadedfirstframe', this, function () {
        console.log('qt_loadedfirstframe');
      });
      SC.Event.add(videoElem, 'qt_canplay', this, function () {
        SC.RunLoop.begin();
        view.set('canPlay', YES);
        console.log('qt_canplay');
        SC.RunLoop.end();
      });
      SC.Event.add(videoElem, 'qt_canplaythrough', this, function () {
        console.log('qt_canplaythrough');
      });
      SC.Event.add(videoElem, 'qt_load', this, function () {
        console.log('qt_load');
      });
      SC.Event.add(videoElem, 'qt_ended', this, function () {
        console.log('qt_ended');
      });
      SC.Event.add(videoElem, 'qt_error', this, function () {
        console.log('qt_error');
      });
      SC.Event.add(videoElem, 'qt_pause', this, function () {
        SC.RunLoop.begin();
        view.set('currentTime', vid.GetTime()/vid.GetTimeScale());
        view.updateTime();
        view.set('paused', YES);
        console.log('qt_pause');
      });
      SC.Event.add(videoElem, 'qt_play', this, function () {
        SC.RunLoop.begin();
        view.set('currentTime', vid.GetTime()/vid.GetTimeScale());
        view.updateTime();
        view.set('paused', NO);
        console.log('qt_play');
      });
      SC.Event.add(videoElem, 'qt_progress', this, function () {
        console.log('qt_progress');
      });
      SC.Event.add(videoElem, 'qt_waiting', this, function () {
        console.log('qt_waiting');
      });
      SC.Event.add(videoElem, 'qt_stalled', this, function () {
        console.log('qt_stalled');
      });
      SC.Event.add(videoElem, 'qt_volumechange', this, function () {
        console.log('qt_volumechange');
      });
    }
  },
  
  _qtTimer:function(){
    if(this.loaded==='quicktime' && !this.get('paused')){
      this.incrementProperty('currentTime');
      this.invokeLater(this._qtTimer, 1000);
    }
  }.observes('paused'),
  
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
    debugger;
    var vid=this._getVideoObject();
    if(this.loaded==="video") vid.play();
    if(this.loaded==="quicktime") vid.Play();
    if(this.loaded==="quicktime") vid.playVideo();
  },
  
  stop: function(){
    var vid=this._getVideoObject();
    if(this.loaded==="video")  vid.pause();
    if(this.loaded==="quicktime")  vid.Stop();
  },
  
  playPause: function(){
    
    debugger;
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
    if(this.loaded==="flash"){
      if(this.get('paused')){
        this.set('paused', NO);
        vid.playVideo();
      }else{
        this.set('paused', YES);
        vid.stopVideo();
      }
    }   
  },
   
  fullScreen: function(){
    return;
  },
  
  closedCaption:function(){
    try{
      if(this.get('captionsEnabled')){
        if(this._closedCaptionTrackIndex){
          this.SetTrackEnabled(this._closedCaptionTrackIndex,true);
          this.set('captionsEnabled', YES);
        }
      }else{
        this.SetTrackEnabled(this._closedCaptionTrackIndex,false);
        this.set('captionsEnabled', NO);
      }   
    }catch(a){}
    return;
  },
  
  _getVideoObject:function(){
    if(this.loaded==="video") return this.get('videoObject');
    if(this.loaded==="quicktime") return document['qt_'+SC.guidFor(this)];
    if(this.loaded==="flash") return window['flash_'+SC.guidFor(this)];
  },
  
  updateTime:function(){
    var currentTime=this.get('currentTime');
    var totaltimeInSecs = this.get('duration');
    var formattedTime = this._addZeros(Math.floor(currentTime/60))+':'+this._addZeros(Math.floor(currentTime%60))+"/"+this._addZeros(Math.floor(totaltimeInSecs/60))+':'+this._addZeros(Math.floor(totaltimeInSecs%60));
    this.set('time', formattedTime);
  }.observes('currentTime')
  
});
