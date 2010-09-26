// ==========================================================================
// Project:   Greenhouse.Dir
// Copyright: Mike Ball
// ==========================================================================
/*jslint evil: true*/
/*globals Greenhouse*/

require('core');
/** @class

  dir properties
  @dir
  @name
  @contents
  
  @extends SC.ChildRecord
  @version 0.1
*/
Greenhouse.Dir = SC.ChildRecord.extend(
/** @scope Greenhouse.Dir.prototype */ {
  type: 'Dir',
  childRecordNamespace: Greenhouse,
  
  name: SC.Record.attr(String),
  dir: SC.Record.attr(String),  
  contents: SC.Record.toMany('Greenhouse.File', {nested: YES}),
  
  primaryKey: 'id',
  
  
  isFile: NO,

  path: function(){
    return this.get('dir') + this.get('name');
  }.property('name', 'dir').cacheable(),

  
  evalBody: function(){
    var bodyText = this.get('body'), body, designs = [];
    
   try{
      body = eval(bodyText || "");
      body.set('needsDesigner', YES);
      body.set('isContainerView',YES);
      this.writeAttribute('currentDesign', body, YES);
      this.notifyPropertyChange('currentDesign');
      for(var v in body){
        if(body.hasOwnProperty(v)){
          if(body[v] && body[v].kindOf){
            if(body[v].kindOf(SC.View)){
              designs.push(SC.Object.create({type: 'view', view: body.get(v), name: v}));
            }
            else if(body[v].kindOf(SC.Page)){
              designs.push(SC.Object.create({type: 'page', view: body.get(v), name: v}));
            }
            else if(body[v].kindOf(SC.Pane)){
              designs.push(SC.Object.create({type: 'pane', view: body.get(v), name: v}));
            }
          }
        }
      }
      this.writeAttribute('designs', designs, YES);
      this.notifyPropertyChange('designs');
      
    } catch (exception) {
      console.log("Couldn't eval body...");
    }
    
  },
  /*
    if this is a dir then return if the passed
    file's name and type matches
    @returns boolean
  */
  includesFile: function(file){
    if(!this.get('isFile')){
      var contents = this.get('contents'), ret;
      ret = contents.find(function(item){
        if(item.get('type') === file.get('type') && item.get('name') === file.get('name') && item !== file) return YES;
      });
      
      return ret ? YES : NO;
    }
    else{
      return NO;
    }
  }

}) ;

Greenhouse.Dir.mixin({

});
