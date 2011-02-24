// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2011 Mike Ball
// ==========================================================================
/*globals Greenhouse */
Greenhouse.Theme = SC.AceTheme.create({
 
  // This name will identify the theme. Make it good. :)
  name: 'greenhouse'
});
 
// Tell SproutCore about your theme
SC.Theme.addTheme(Greenhouse.Theme);
 
// Make it the default theme
SC.defaultTheme = 'greenhouse';


Greenhouse.Theme.Well.containerRenderDelegate = SC.Object.create({
  name: 'container',
  
  render: function(dataSource, context) {},
  
  update: function() {}
});