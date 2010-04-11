require("src/theme");

SC.AceTheme.renderers.Picker = SC.EmptyTheme.renderers.Picker.extend({
  POINTER_DISTANCE_FROM_EDGE: 44,
  render: function(context){
    
  },
  
  update: function() {
    
  }
});

SC.AceTheme.renderers.picker = SC.AceTheme.renderers.Picker.create();