SC.AceTheme = SC.BaseTheme.create({
  name: "ace",
  description: "A SproutCore built-in theme by Alex Iskander and contributors. Only supports browsers that implement CSS3."
});

SC.Theme.addTheme(SC.AceTheme);

SC.AceTheme.Dark = SC.AceTheme.subtheme("dark");

// for backwards-compatibility with apps that do not set their
// own default theme:
SC.defaultTheme = 'ace';
