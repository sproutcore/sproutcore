SC.AceTheme = SC.BaseTheme.create({
  name: "ace",
  description: "Coolness."
});

SC.Theme.addTheme(SC.AceTheme);

SC.AceTheme.Dark = SC.AceTheme.subtheme("dark");

// for backwards-compatibility with apps that do not set their
// own default theme:
SC.defaultTheme = 'ace';
