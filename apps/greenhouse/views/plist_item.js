// ==========================================================================
// Project:   Greenhouse.PlistItemView
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  This class is here to receive custom editor events
  @extends SC.View
*/
Greenhouse.PlistItemView = SC.View.extend(
/** @scope Greenhouse.ListItem.prototype */ {
 
 // contentValueKey: 'key',
 // 
  render: function(context, firstTime){
    var content = this.get('content'),
       key, value;
    console.log(content);
    if(firstTime){
      // handle label -- always invoke
      key = this.get('contentValueKey');
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;

      if(value){
       if(SC.typeOf(value) === SC.T_STRING){
 
       }
       else if(SC.typeOf(value) === SC.T_BOOLEAN){
 
       }
       else{
         value = value.toString();
       }
      }
      else{
       value = "";
      }
      value = value + ": " + content.get('value');
      context.push(value);
      //this.renderLabel(context, value);
    }
  },
  
  renderValue: function(context, content){

    context.begin('span')
      .addStyle({left: '50%'})
      .push(content.get('value'))
    .end();
  }
});
