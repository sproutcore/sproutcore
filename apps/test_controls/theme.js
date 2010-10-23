// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Styling becomes easier when your app has its own theme to target.
  The theme's name will be included in every view's class names in DOM,
  so you can apply styles without being exceedingly specific.
  
  If working with Chance, the $theme variable (which has its initial
  value set in your Buildfile) will allow you to target the theme
  automatically:
  
  Example:
  
      $theme.button {
        border: 1px solid black;
      }
*/
TestControls.Theme = SC.AceTheme.create({ 
  name: 'test-controls'
});

SC.Theme.addTheme(TestControls.Theme);

// this makes all panes use your app's theme by default
// QUESTION: should we make this be set by the Buildfile?
//    :theme => 'test-controls' 
// generates JS: 
//    SC.defaultTheme = 'test-controls'
SC.defaultTheme = 'test-controls';
