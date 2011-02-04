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
 
  _valueStyle: {position: 'absolute', right: 5, top: '50%', height: 18, marginTop: -9, left: 'auto'},
 
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
      if(value !== undefined){
       if(SC.typeOf(value) === SC.T_STRING){
          context.begin('span').addStyle(this._valueStyle).text(value).end();
       }
       else if(SC.typeOf(value) === SC.T_BOOL){
         this.renderCheckbox(context,content.get('value'));
         //context.begin('span').addStyle(this._valueStyle).text("bool").end();
       }
       else{
         value = value.toString();
         context.begin('span').addStyle(this._valueStyle).text(value).end();
         
       }
      }
      else{
        console.log(value);
        context.begin('span').addStyle(this._valueStyle).text("unknown").end();
      }
      
    }
    else{
      if(this._checkboxRenderSource){
        var source = this._checkboxRenderSource;
        source.set('isSelected', context.get('value'));
        this._checkboxRenderDelegate.update(source, this.$('.sc-checkbox-view'));
      }
    }
  },
  
  mouseDown: function(evt){
    if (this._isInsideElementWithClassName('sc-checkbox-view',evt)) {
      this._addCheckboxActiveState() ;
      this._isMouseDownOnCheckbox = YES ;
      this._isMouseInsideCheckbox = YES ;
      return true ; 
    }
    return false;
  },
  
  mouseUp: function(evt) {
    var ret= false,  content, state, idx, set;

    // if mouse was down in checkbox -- then handle mouse up, otherwise 
    // allow parent view to handle event.
    if (this._isMouseDownOnCheckbox) {

      // update only if mouse inside on mouse up...
      if (this._isInsideElementWithClassName('sc-checkbox-view',evt)) {
        content = this.get('content') ;
        if (content && content.get) {
          var value = content.get('value') ;
          value = (value === SC.MIXED_STATE) ? YES : !value ;
  
          content.view.set(content.get('key'), value); // update view
          
          this.displayDidChange(); // repaint view...
        }
        ret = true;
      }
      this._removeCheckboxActiveState() ;
      
    }
    this._isMouseDownOnCheckbox = this._isMouseInsideCheckbox = false;
    return ret;
  },
  // ..........................................................
  // adapted from list item view
  // 
  renderCheckbox: function(context, state) {
    var renderer = this.get('theme').checkboxRenderDelegate;

    // note: checkbox-view is really not the best thing to do here; we should do
    // sc-list-item-checkbox; however, themes expect something different, unfortunately.
    context = context.begin('div')
     .addStyle(this._valueStyle)
     .addClass('sc-checkbox-view')
     .addClass('sc-regular-size')
     .addClass(this.get('theme').classNames)
     .addClass(renderer.get('name'));

    var source = this._checkboxRenderSource;
    if (!source) {
      source = this._checkboxRenderSource = 
      SC.Object.create({ renderState: {}, theme: this.get('theme') });
    }

    source
     .set('isSelected', state && (state !== SC.MIXED_STATE))
     .set('isEnabled', this.get('isEnabled'))
     .set('isActive', this._checkboxIsActive)
     .set('title', '');

    renderer.render(source, context);
    context = context.end();

    this._checkboxRenderDelegate = renderer;
  },
  /** 
    Determines if the event occured inside an element with the specified
    classname or not.
  */
  _isInsideElementWithClassName: function(className, evt) {
    var layer = this.get('layer');
    if (!layer) return NO ; // no layer yet -- nothing to do
    
    var el = SC.$(evt.target) ;
    var ret = NO, classNames ;
    while(!ret && el.length>0 && (el[0] !== layer)) {
      if (el.hasClass(className)) ret = YES ;
      el = el.parent() ;
    }
    el = layer = null; //avoid memory leaks
    return ret ;
  },
  // ..........................................................
  // checkbox helpers...
  // 
  _addCheckboxActiveState: function() {
    if (this.get('isEnabled')) {
      if (this._checkboxRenderDelegate) {
        var source = this._checkboxRenderSource;

        source.set('isActive', YES);
        
        this._checkboxRenderDelegate.update(source, this.$('.sc-checkbox-view'));
      } else {
        // for backwards-compatibility.
        this.$('.sc-checkbox-view').addClass('active');
      }
    }
  },
  
  _removeCheckboxActiveState: function() {
    if (this._checkboxRenderer) {
      var source = this._checkboxRenderSource;

      source.set('isActive', NO);
      
      this._checkboxRenderDelegate.update(source, this.$('.sc-checkbox-view'));
    } else {
      // for backwards-compatibility.
      this.$('.sc-checkbox-view').removeClass('active');
    }
  }
});
