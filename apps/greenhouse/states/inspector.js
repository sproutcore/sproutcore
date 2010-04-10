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
     
    },
    exitState: function(){

    },
   
    // ..........................................................
    // Events
    //
    closeInspector: function(){
      this.goState('closeInspectorPicker');
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
     
   },
   exitState: function(){

   },
   
   // ..........................................................
   // Events
   //
   closeInspector: function(){
     this.goState('closeInspectorPicker');
   },
   
   dockInspector: function(){
     this.goState('dockedInspector');
   }
 })
});