// ==========================================================================
// Project:   Greenhouse.PlistItemView
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  This class is here to receive custom editor events
  @extends SC.View
*/
Greenhouse.PlistItemView = SC.View.extend(SC.Control,
/** @scope Greenhouse.ListItem.prototype */ {
 
  classNames: ['sc-list-item-view'],
 
 
  contentValueKey: 'key',
 
  _valueStyle: {position: 'absolute', right: 5, top: '50%', height: 18, marginTop: -9},
 
  render: function(context, firstTime){
    var content = this.get('content'),
       key, propertyKey, value, displayValue;
    
    if(firstTime){
      // handle label -- always invoke
      key = this.get('contentValueKey');
      propertyKey = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
      value = content.get('value');
      
      //do the label
      context.begin('label').addStyle({paddingLeft: 5}).text(propertyKey).end();
      if(value){
       if(SC.typeOf(value) === SC.T_STRING){
          context.begin('span').addStyle(this._valueStyle).text(value).end();
       }
       else if(SC.typeOf(value) === SC.T_BOOL){
         context.begin('span').addStyle(this._valueStyle).text("bool").end();
       }
       else{
         value = value.toString();
         context.begin('span').addStyle(this._valueStyle).text(value).end();
         
       }
      }
      else{
        context.begin('span').addStyle(this._valueStyle).text("unknown").end();
      }
      
    }
  },
  
  mouseDown: function(evt){
    
    return NO;
  },
  
  mouseUp: function(evt){
    
    return NO;
  }
});
