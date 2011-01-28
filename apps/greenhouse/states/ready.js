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
  readyStates: SC.State.design({
    initialSubstate: 'readyWaiting',
    
    
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
        this.gotoState('gettingFile');
      }
    },

    unselectFile: function(){
     // TODO: [EG, MB] add the action for unselecting 
     this.gotoState('readyWaiting');
    },

    reloadIframe: function(){
      Greenhouse.filesController.set('selection', null);
      Greenhouse.gettingFile._firstTime = YES;

      Greenhouse.iframe.location.reload();
      this.gotoState('iframeLoading');
    },

    resizePage: function(sender){
      var s = sender.getPath('content.size'),
          def = {top: 20, left: 20, right: 20, bottom: 83},
          iframe = Greenhouse.get('iframe'),
          view;


      view = iframe.SC.designPage.getPath('designMainPane.container');

      if(!s){
        view.set('classNames', ['design']);
        view.set('layout', def);
      }
      else{
        view.set('classNames', []);
        view.set('layout', SC.merge({centerX:0, centerY: 0}, s));
      }

    },
    // ..........................................................
    // Ready substates
    // 
    readyWaiting: SC.State.design({
    }),

    gettingFile: SC.State.design({

      init: function(){
        sc_super();
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
        this.gotoHistoryState('pageSelected');
      },

      fileSelectedIsNotAPage: function(){
        this.gotoState('fileSelected');
      }
    }),

    fileSelected: SC.State.design({

      enterState: function(){
        //TODO: draw message saing we can't do anythign with this right now...
      },
      exitState: function(){}
    }),

    pageSelected: SC.State.design({

      parentState: 'ready',
      initialSubstate: 'noDock',

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
      },
      // ..........................................................
      // pageSelected substates
      // 
       noDock: SC.State.design({
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
           this.gotoState('docked');
         },

         toggleDockedInspector: function(){
           this.gotoState('docked');
         }
       }),

       docked: SC.State.design({
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
           this.gotoState('noDock');
         }
      })
    })
  })  
});
