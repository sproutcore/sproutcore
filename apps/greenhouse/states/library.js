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
    },
    
    floatLibrary: function(){
      this.goState('libraryPicker');
    }
 }),
 
 libraryPicker: SC.State.create({
   
   parallelStatechart: 'library',

   enterState: function(){
     var picker = Greenhouse.appPage.get('libraryPicker');
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
     var picker = Greenhouse.appPage.get('libraryPicker');
     picker.set('isModal', YES);
     picker.set('isAnchored', YES);
     picker.remove();
     
     var content = picker.getPath('contentView.content'),
         toolbar = picker.getPath('contentView.toolbar');
     
     content.adjust('top', 0);    
     toolbar.set('isVisible', NO);
   },
   
   closeLibrary: function(){
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
