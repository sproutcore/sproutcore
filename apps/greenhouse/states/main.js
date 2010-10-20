// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @mixin
  @extends Greenhouse
  @author Mike Ball
  @author Evin Grano
  @version RC1
  @since RC1
*/
Greenhouse.mixin( /** @scope Greenhouse */{
    
  loading: SC.State.create({
    
    enterState: function(){
      console.log('greenhouse is loading');
      var c = Greenhouse.getPath('mainPage.mainPane.container');
      c.set('nowShowing', Greenhouse.getPath('mainPage.loading'));
    },
    exitState: function(){
      
    },
    
    // ..........................................................
    // Events
    //
    /*
      called when the file list call completes
    */
    fileListCallDidComplete: function(){
      //eval all the appropriate files
      this.goState('iframeLoading');
    },

    /*
      called when the file choose call completes
    */
    fetchTargetsDidComplete: function(){
      //eval all the appropriate files
      this.goState('chooseApp');
    }
    
  }),
  
  chooseApp: SC.State.create({
    
    enterState: function(){
      var c = Greenhouse.getPath('mainPage.mainPane.container');
      c.set('nowShowing', Greenhouse.getPath('mainPage.appPicker'));
    },
    exitState: function(){
      
    },
    
    // ..........................................................
    // Events
    //
    loadApplication: function(){
      Greenhouse.filesController.reload();
      Greenhouse.viewConfigsController.reload();
      this.goState('loading');
    }
  }),
  
  iframeLoading: SC.State.create({
    
    enterState: function(){
      var c = Greenhouse.getPath('mainPage.mainPane.container');
      c.set('nowShowing', Greenhouse.getPath('appPage.mainView'));
      //TODO disable views and display a loading spinner
    },
    exitState: function(){
      
    },
    
    // ..........................................................
    // Events
    //
    iframeLoaded: function(){
      this.goState('syncRunLoops');
    }
  }),
  
  syncRunLoops: SC.State.create({
    
    enterState: function(){
      this._setupRunLoops();
      this._grabDropTargets();
      this._setupGreenhouse();
      this._setupEventBlocker();
      this.invokeLater(function(){this.goState('readyWaiting');}); //totally cheating!!
    },
    exitState: function(){
      
    },
    
    // ..........................................................
    // Monkey-Patch Run Loop
    // 
    _setupRunLoops: function(){
      var iframe = Greenhouse.get('iframe'), innerBegin, outerBegin, innerEnd, outerEnd, outerSC = SC;

      // ..........................................................
      // run loop patches...
      // 
      outerBegin = function() {    
        var runLoop = outerSC.RunLoop.currentRunLoop;
        if (!runLoop) runLoop = outerSC.RunLoop.currentRunLoop = outerSC.RunLoop.runLoopClass.create();
        runLoop.beginRunLoop();
        return outerSC.RunLoop ;
      };
      outerEnd = function() {
        var runLoop = outerSC.RunLoop.currentRunLoop;
        if (!runLoop) {
          throw "SC.RunLoop.end() called outside of a runloop!";
        }
        runLoop.endRunLoop();
        return outerSC.RunLoop ;
      };

      innerBegin = function() {    
        var runLoop = iframe.SC.RunLoop.currentRunLoop;
        if (!runLoop) runLoop = iframe.SC.RunLoop.currentRunLoop = iframe.SC.RunLoop.runLoopClass.create();
        runLoop.beginRunLoop();
        return iframe.SC.RunLoop ;
      };

      innerEnd = function() {
        var runLoop = iframe.SC.RunLoop.currentRunLoop;
        if (!runLoop) {
          throw "SC.RunLoop.end() called outside of a runloop!";
        }
        runLoop.endRunLoop();
        return iframe.SC.RunLoop ;
      };

      //outer begin
      outerSC.RunLoop.begin = function() { 
        //console.log('outer begin');
        var outer = outerBegin();
        innerBegin();
        return outer;
      };

      //inner begin
      iframe.SC.RunLoop.begin = function() {
        //console.log('inner begin');
        var inner = innerBegin();
        outerBegin();
        return inner;
      };

      //inner end
      iframe.SC.RunLoop.end = function() {
        //console.log('inner end');
        outerEnd();
        return innerEnd();
      };

      //Outer End
      outerSC.RunLoop.end = function() {
        //console.log('outer end');
        innerEnd();
        return outerEnd();
      };
     },

    _grabDropTargets: function(){
      var iframe = Greenhouse.get('iframe'), 
          innerTargets,
          webViewFrame,
          webView = Greenhouse.appPage.get('webView');

      var pv = webView.get('parentView');
        webViewFrame = webView.get('frame');
      webViewFrame = pv.convertFrameToView(webViewFrame, null);


      //add existing targets
      innerTargets = iframe.SC.Drag._dropTargets;

      for(var dt in innerTargets){
        if(innerTargets.hasOwnProperty(dt)){
          SC.Drag.addDropTarget(innerTargets[dt]);
        }
      }

      //make sure we get any new ones
      iframe.SC.Drag.addDropTarget = function(target) {
        iframe.SC.Drag._dropTargets[iframe.SC.guidFor(target)] = target ;
        SC.Drag._dropTargets[iframe.SC.guidFor(target)] = target ;
      };


      iframe.SC.Drag.removeDropTarget = function(target) {
        delete iframe.SC.Drag._dropTargets[iframe.SC.guidFor(target)] ;
        delete SC.Drag._dropTargets[iframe.SC.guidFor(target)];
      };


      SC.Drag.prototype._findDropTarget = function(evt) {
        var loc = { x: evt.pageX, y: evt.pageY } ;

        var target, frame ;
        var ary = this._dropTargets() ;
        for (var idx=0, len=ary.length; idx<len; idx++) {
          target = ary[idx] ;

          // If the target is not visible, it is not valid.
          if (!target.get('isVisibleInWindow')) continue ;

          // get clippingFrame, converted to the pane.
          frame = target.convertFrameToView(target.get('clippingFrame'), null) ;

          //if this is in the iframe adjust the frame accordingly
          if(target.get('targetIsInIFrame')){
             frame.x = frame.x + webViewFrame.x;
             frame.y = frame.y + webViewFrame.y;
           }
          // check to see if loc is inside.  If so, then make this the drop target
          // unless there is a drop target and the current one is not deeper.
          if (SC.pointInRect(loc, frame)) return target;
        } 
        return null ;
      };
      //all inner drags are actually outer drags
      iframe.SC.Drag.start = SC.Drag.start;
    },

    _setupGreenhouse: function(){
      var iframe = Greenhouse.get('iframe');
      iframe.SC._Greenhouse = Greenhouse;
    },
    
    _setupEventBlocker: function(){
      var eventBlocker = Greenhouse.appPage.get('eventBlocker');
      Greenhouse.set('eventBlocker', eventBlocker);
    }
  })
});
