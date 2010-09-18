// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
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
  modalReady: SC.State.create({
 
    parallelStatechart: 'modals',

    newBindingPopup: function(item){
      Greenhouse.createBindingPopup.set('newItem', item);
      this.goState('createBindingPopup');
    },
    
    newCustomView: function(){
      this.goState('addCustomView');
    },
    
    editProperty: function(){
      this.goState('editProperties');
    },

    newPageElement: function(item){
      Greenhouse.set('newItem', item);
      this.goState('addToPage');
    },
    openProjectPicker: function(){
      this.goState('projectPicker');
    }
  }),
  
  projectPicker: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      var picker = Greenhouse.appPage.get('projectPicker'),
          button = Greenhouse.appPage.getPath('mainView.toolBar.project');

      picker.popup(button, SC.PICKER_POINTER);
      picker.becomeFirstResponder();
    },
    exitState: function(){
      var picker = Greenhouse.appPage.get('projectPicker');
      picker.remove();
    },
    
    cancel: function(){
      this.goState('modalReady');
    },
    
    newPageFile: function(){
      this.goState('newPage');
    }
  }),
  
  
  createBindingPopup: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      Greenhouse.set("newBindingFromKey", null);
      Greenhouse.set("newBindingToKey", null);
      var modal = Greenhouse.dialogPage.get('modal');
      modal.set('contentView', Greenhouse.dialogPage.get('createBindingView'));
      modal.set('layout', {centerX: 0, centerY: 0, width: 200, height: 180});
      modal.append();
    },
    exitState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.remove();
      Greenhouse.set("newBindingFromKey", null);
      Greenhouse.set("newBindingToKey", null);
      this.set('newItem', null);
    },
    cancel: function(){
      this.goState('modalReady');
    },

    create: function(){
      var fromKey = Greenhouse.get("newBindingFromKey"),
          toKey = Greenhouse.get("newBindingToKey"),
          newItem = this.get('newItem'),
          view = Greenhouse.designController.get('view'), 
          c = Greenhouse.designController.get('content');

      if(view && c){
        Greenhouse.designController.propertyWillChange('content');
        var designAttrs = c.get('designAttrs');
        if(designAttrs) designAttrs = designAttrs[0];
        newItem.addItem(fromKey, toKey, designAttrs);
        Greenhouse.designController.propertyDidChange('content');
      }

      this.goState('modalReady');
    }
    
  }),
  
  addCustomView: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.set('contentView', Greenhouse.dialogPage.get('customViewModal'));
      modal.set('layout', {centerX: 0, centerY: 0, width: 350, height: 380});
      Greenhouse.set('newDesignClass', null);
      Greenhouse.set('newDesignDefaults', null);
      Greenhouse.set('newDesignViewConfig', null);
      Greenhouse.set('newDesignType', null);
      modal.append();
    },
    exitState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.remove();
      Greenhouse.set('newDesignClass', null);
      Greenhouse.set('newDesignDefaults', null);
      Greenhouse.set('newDesignViewConfig', null);
      Greenhouse.set('newDesignType', null);
      
    },
    
    cancel: function(){
      this.goState('modalReady');
    },

    add: function(){
      var viewConfig = Greenhouse.get('newDesignViewConfig');
      var array = viewConfig.get(Greenhouse.get('newDesignType'));
      
      var newView = array.pushObject({name: Greenhouse.get('newDesignClass'), 
                         scClass: Greenhouse.get('newDesignClass'), 
                         defaults: eval("("+Greenhouse.get('newDesignDefaults')+")")});

      viewConfig.commitRecord();
      Greenhouse.viewConfigsController.notifyPropertyChange(Greenhouse.get('newDesignType'));
      Greenhouse.viewConfigsController.refreshContent();
            
      this.goState('modalReady');
    }
  }),
  
  newPage: SC.State.create({
    parentState: 'projectPicker',
    parallelStatechart: 'modals',

    enterState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.set('contentView', Greenhouse.dialogPage.get('pageFile'));
      modal.set('layout', {centerX: 0, centerY: 0, width: 350, height: 300});

      Greenhouse.set('newFileName', null);
      Greenhouse.set('newFilePath', Greenhouse.fileController.get('path'));
      Greenhouse.set('newPageName', null);

      modal.append();
    },
    exitState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.remove();
      Greenhouse.set('newFileName', null);
      Greenhouse.set('newFilePath', null);
      Greenhouse.set('newPageName', null);
    },
    
    cancel: function(){
      this.goState('projectPicker');
    },

    create: function(){
      var f = Greenhouse.fileController.get('content'), ret, child, page = Greenhouse.get('newPageName'),
          fileName = Greenhouse.get('newFileName'), filePath = Greenhouse.get('newFilePath') + "/";

      if(!fileName.match(/\.js/)) fileName = fileName + ".js";

      ret = ['// SproutCore ViewBuilder Design Format v1.0',
        '// WARNING: This file is automatically generated.  DO NOT EDIT.  Changes you',
        '// make to this file will be lost.', '',
        '%@ = SC.Page.design({});'.fmt(page),''].join("\n");

      var contents = f.get('contents');

      contents.pushObject({type: 'File', dir: filePath, name: fileName, body:ret});
      child = contents.objectAt(contents.get('length') - 1);
      child.commitRecord();

      this.goState('projectPicker');
    }
  }),
  
  editProperties: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      var picker = Greenhouse.dialogPage.get('propertyPicker');
      picker.set('contentView', Greenhouse.dialogPage.get('propertyEditor'));
      var list = Greenhouse.inspectorsPage.getPath('propertiesInspector.list.contentView');
      var content = Greenhouse.propertyController.get('content');

      //TODO: I should probably popup this picker in the plist item view....
      picker.popup(list.itemViewForContentObject(content));
      picker.becomeFirstResponder();

      //TODO: copy correct here? 
      Greenhouse.propertyEditorController.set('content', SC.copy(content));
    },
    exitState: function(){
      var picker = Greenhouse.dialogPage.get('propertyPicker');
      picker.remove();
      Greenhouse.propertyEditorController.set('content', null);
    },
    
    cancel: function(){
      this.goState('modalReady');
    },

    update: function(){
      var val = Greenhouse.propertyEditorController.get('value'), 
          view = Greenhouse.propertyEditorController.get('view'),
          key = Greenhouse.propertyEditorController.get('key'),
          origKey = Greenhouse.propertyController.get('key'),
          content = Greenhouse.designController.get('content'), designAttrs;



      // designAttrs = content.get('designAttrs');
      //  if(designAttrs) designAttrs = designAttrs[0];
 
      if(key !== origKey){
        view[origKey] = undefined;
        delete view[origKey];
        view.designer.designProperties.removeObject(origKey);
        view.designer.designProperties.pushObject(key);
        view.designer.propertyDidChange('editableProperties');
        //delete designAttrs[origKey];
      }

      view[key] = eval(val);
      view.propertyDidChange(key);
      if(view.displayDidChange) view.displayDidChange();

      Greenhouse.propertyController.set('key',key);
      Greenhouse.propertyController.set('value', val);

      this.goState('modalReady');
    }
  }),
  
  addToPage: SC.State.create({

    parallelStatechart: 'modals',

    enterState: function(){
      Greenhouse.set('newPageItemName', '');
      var modal = Greenhouse.dialogPage.get('modal');
      modal.set('contentView', Greenhouse.dialogPage.get('newItemForPage'));
      modal.set('layout', {width: 200, height: 120, centerX: 0, centerY: 0});
      modal.append();
    },
    exitState: function(){
      var modal = Greenhouse.dialogPage.get('modal');
      modal.remove();
      Greenhouse.set('newItem', null);
      Greenhouse.set('newPageItemName', '');
    },
    cancel: function(){
      this.goState('modalReady');
    },

    add: function(){
      var newItem = Greenhouse.get('newItem'),
          name = Greenhouse.get('newPageItemName');

      newItem.addItemToPage(name);
      this.goState('modalReady');
    }
  })
});
