// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
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
      var designer = Greenhouse.designController.get('content');

      if(designer){
        designer.designProperties.pushObject("newProperty"); //TODO: generate better name....
        designer.propertyDidChange('editableProperties');
      }
    },
    deleteProperty: function(){
      var prop = Greenhouse.propertyController.get('content'),
          designer = Greenhouse.designController.get('content'),
          view;
      if(prop && designer){
        view = prop.view;
        view[prop.view] = undefined;
        delete view[prop.key]; //FIXME: [MB] this isn't removing the property...
        designer.designProperties.removeObject(prop.key);
        view.propertyDidChange(prop.key);
        if(view.displayDidChange) view.displayDidChange();
        designer.propertyDidChange('editableProperties');
      }
    }
  }),
  
  noDock: SC.State.create({
    parentState: 'pageSelected',

    enterState: function(){
      var dock = Greenhouse.appPage.get('dockView');
      dock.set('layout', {top: 0, bottom: 0, right: 0, width: 0});
      var design = Greenhouse.appPage.get('designAreaView');
      design.set('layout', {top: 0, bottom: 0, right: 0, left: 0});
    },
    exitState: function(){

    },
   
    // ..........................................................
    // Events
    //
    toggleDockedLibrary: function(){
      this.goState('docked');
    },

    toggleDockedInspector: function(){
      this.goState('docked');
    }
  }),

  docked: SC.State.create({
    parentState: 'pageSelected',

    enterState: function(){
      var dock = Greenhouse.appPage.get('dockView');
      dock.set('layout', {top: 0, bottom: 0, right: 0, width: 230});
      var design = Greenhouse.appPage.get('designAreaView');
      design.set('layout', {top: 0, left: 0, right: 230, bottom: 0});
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
