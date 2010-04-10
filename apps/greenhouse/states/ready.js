// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals Greenhouse js_beautify*/
/** @mixin
  @extends Greenhouse
  @author Mike Ball
  @author Evin Grano
  @version RC1
  @since RC1
*/
Greenhouse.mixin( /** @scope Greenhouse */{
  // ..........................................................
  // Ready States
  // 
  ready: SC.State.create({

    enterState: function(){
      console.log('greenhouse has landed');
      var c = Greenhouse.getPath('mainPage.mainPane.container');
      c.set('nowShowing', Greenhouse.getPath('appPage.mainView'));
    },
    exitState: function(){

    },
    
    // ..........................................................
    //  Events
    // 
    run: function(){
      var target = Greenhouse.targetController.get('name');
      window.open(target, "","");
    },
    
    selectFile: function(){
      var c = Greenhouse.fileController.get('content');
      if(c) {
        c.refresh();
        this.goState('gettingFile');
      }
    },
    
    unselectFile: function(){
       // TODO: [EG, MB] add the action for unselecting 
       this.goState('readyWaiting');
     }
    
  }),
  
  readyWaiting: SC.State.create({
    
    parentState: 'ready',

    enterState: function(){
      
    },
    exitState: function(){

    }
    
  }),
  
  gettingFile: SC.State.create({
    
    parentState: 'ready',
    
    initState: function(){
      this._firstTime = YES;
    },
    
    enterState: function(){
      //TODO draw spinner
    },
    exitState: function(){
    },
    
    fileSelectedIsAPage: function(){
      Greenhouse.loadIframeWithPage(this._firstTime);
      this._firstTime = NO;
      this.goHistoryState('pageSelected');
    },
    
    fileSelectedIsNotAPage: function(){
      this.goState('fileSelected');
    }
  }),
  
  fileSelected: SC.State.create({

    parentState: 'ready',

    enterState: function(){
      //TODO: draw message saing we can't do anythign with this right now...
    },
    exitState: function(){}
  }),
  
  pageSelected: SC.State.create({

    parentState: 'ready',
    initialSubState: 'noDock',

    enterState: function(){},
    exitState: function(){},
    
    // ..........................................................
    // Events
    // 
    save: function(){
      var designPage, content = Greenhouse.fileController.get('content');
      designPage = Greenhouse.iframe.SC.designsController.get('page');
      //check if this page has a name...
      designPage.setPath('designController.selection', null);
      if(!designPage.get('pageName')) designPage.set('pageName', content.get('pageName'));
      designPage = designPage.emitDesign();
      content.set('body', js_beautify(designPage));
      content.commitRecord(); 
    },
    addProperty: function(){
      var view = Greenhouse.designController.get('view'), 
          c = Greenhouse.designController.get('content');

      if(view && c){
        Greenhouse.designController.propertyWillChange('content');
        var designAttrs = c.get('designAttrs');
        if(designAttrs) designAttrs = designAttrs[0];
        designAttrs.newProperty = null; //TODO: generate better name....
        Greenhouse.designController.propertyDidChange('content'); 
      }
    },
    deleteProperty: function(){
      var c = Greenhouse.propertyController.get('content'),
          view = c.get('view');
      if(c && view){
        var designAttrs = view.designer.get('designAttrs');
        if(designAttrs) designAttrs = designAttrs[0];
        delete designAttrs[c.key];
        view.designer.set('designAttrs', [designAttrs]);      
        delete view[c.key];
        view.propertyDidChange(c.key);
        view.displayDidChange();
        Greenhouse.designController.propertyDidChange('content'); 
        //TODO: MB this isn't forcing property changes to work
      }
    }
  }),
  
  noDock: SC.State.create({
    parentState: 'pageSelected',

    enterState: function(){
      var dock = Greenhouse.appPage.get('dockView');
      dock.set('layout', {top: 0, bottom: 0, right: 0, width: 0});
      var design = Greenhouse.appPage.get('designAreaView');
      design.set('layout', {top: 0, bottom: 50, right: 0, left: 0});
    },
    exitState: function(){

    },
   
    // ..........................................................
    // Events
    //
    dockLibrary: function(){
      this.goState('docked');
    },

    dockInspector: function(){
      this.goState('docked');
    }
  }),

  docked: SC.State.create({
    parentState: 'pageSelected',

    enterState: function(){
      var dock = Greenhouse.appPage.get('dockView');
      dock.set('layout', {top: 0, bottom: 0, right: 0, width: 350});
      var design = Greenhouse.appPage.get('designAreaView');
      design.set('layout', {top: 0, left: 0, right: 350, bottom: 0});
    },
    exitState: function(){

    },
   
    // ..........................................................
    // Events
    //
    undock: function(){
      this.goState('noDock');
    }
 })
  
});