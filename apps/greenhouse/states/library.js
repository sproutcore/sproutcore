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
  libraryClosed: SC.State.create({
    
    parallelStatechart: 'library',
   
    // ..........................................................
    // Events
    //
    openLibrary: function(){
      this.goState('openLibraryPicker');
    },
   
    dockLibrary: function(){
      this.goState('dockedLibrary');
    }
  }),
  
  openLibraryPicker: SC.State.create({
    
    parallelStatechart: 'library',
    
    enterState: function(){
      var picker = Greenhouse.appPage.get('libraryPicker'),
          button = Greenhouse.appPage.getPath('mainView.toolBar.library');

      picker.popup(button, SC.PICKER_POINTER);
      picker.becomeFirstResponder();
    },
   
    exitState: function(){
      var picker = Greenhouse.appPage.get('libraryPicker');
      picker.remove();
    },
   
    cancel: function(){
      this.goState('libraryClosed');
    }
 }),
 
 dockedLibrary: SC.State.create({

  parallelStatechart: 'library',

  enterState: function(){
    
  },
  exitState: function(){

  }
  
  // ..........................................................
  // Events
  //
 })
});
