// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/*jslint evil: true */

/** @mixin
  @extends Greenhouse
  @author Mike Ball
  @author Evin Grano
  @version RC1
  @since RC1
*/
Greenhouse.mixin( /** @scope Greenhouse */{
  inspectorClosed: SC.State.create({
    
   parallelStatechart: 'inspector',

   enterState: function(){
     
   },
   exitState: function(){

   },
   
   // ..........................................................
   // Events
   //
   openInspector: function(){
     this.goState('openInspectorPicker');
   },
   
   dockInspector: function(){
     this.goState('dockedInspector');
   }
  }),
  
  openInspectorPicker: SC.State.create({
    parallelStatechart: 'inspector',

    enterState: function(){
      var picker = Greenhouse.appPage.get('inspectorPicker'),
          button = Greenhouse.appPage.getPath('mainView.toolBar.inspector');

      picker.popup(button, SC.PICKER_POINTER);
      picker.becomeFirstResponder();
    },
    exitState: function(){
      var picker = Greenhouse.appPage.get('inspectorPicker');
      picker.remove();
    },
   
    // ..........................................................
    // Events
    //
    cancel: function(){
      this.goState('closeInspectorPicker');
    },
    
    floatInspector: function(){
      this.goState('inspectorPalette');
    },
    
    dockInspector: function(){
      this.goState('dockedInspector');
    },
    
    undockInspector: function(){
      this.goState('inspectorPalette');
    }
  }),
  
  inspectorPalette: SC.State.create({
    
   parallelStatechart: 'inspector',

   enterState: function(){
     var picker = Greenhouse.appPage.get('inspectorPicker');
     picker.append();
     picker.set('isModal', NO);
     picker.set('isAnchored', NO);
     picker.$().toggleClass('sc-picker', NO);
     var content = picker.getPath('contentView.content'),
         toolbar = picker.getPath('contentView.toolbar');
     
     content.adjust('top', 28);    
     toolbar.set('isVisible', YES); 
   },
   exitState: function(){
     var picker = Greenhouse.appPage.get('inspectorPicker');
     picker.set('isModal', YES);
     picker.set('isAnchored', YES);
     picker.remove();
     
     var content = picker.getPath('contentView.content'),
         toolbar = picker.getPath('contentView.toolbar');
     
     content.adjust('top', 0);    
     toolbar.set('isVisible', NO);
   },
   
   // ..........................................................
   // Events
   //
   closeInspector: function(){
     this.goState('inspectorClosed');
   },
   
   dockInspector: function(){
     this.goState('dockedInspector');
   }
 })
});