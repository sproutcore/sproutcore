/**
 * @class
 * SproutCore's Ace theme.
 */
SC.AceTheme = SC.BaseTheme.create({
  name: "ace",
  description: "A SproutCore built-in theme by Alex Iskander and contributors. Only supports browsers that implement CSS3."
});

SC.Theme.addTheme(SC.AceTheme);

// Dark Variant
/**
 * @class SC.AceTheme.Dark
 * SproutCore's Ace theme's Dark Side. Used in popovers or wherever you
 * choose (use it by making the view or one of its parents have a
 * themeName of 'dark').
 */
SC.AceTheme.Dark = SC.AceTheme.subtheme("dark");

// for backwards-compatibility with apps that do not set their
// own default theme:
SC.defaultTheme = 'ace';
