// ==========================================================================
// Project:   Greenhouse.PlistItemView
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  This class is here to receive custom editor events
  @extends SC.View
*/
Greenhouse.PlistItemView = SC.ListItemView.extend(
/** @scope Greenhouse.ListItem.prototype */ {
 
 
 render: function(context, firstTime){
   var content = this.get('content'),
       del     = this.displayDelegate,
       key, value;
   
   // handle label -- always invoke
   key = this.getDelegateProperty('contentValueKey', del) ;
   value = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
   if (value && SC.typeOf(value) !== SC.T_STRING) value = value.toString();
   if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
   value = value + ": " + content.get('value');
   
   this.renderLabel(context, value);
   
   //this.renderValue(context, content);
 },
 
 renderValue: function(context, content){
   
   context.begin('span')
     .addStyle({left: '50%'})
     .push(content.get('value'))
   .end();
 }
});
