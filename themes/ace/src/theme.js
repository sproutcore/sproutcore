SC.AceTheme = SC.BaseTheme.create({
  name: "ace",
  description: "Coolness."
});

SC.Theme.addTheme(SC.AceTheme);

SC.AceTheme.Dark = SC.AceTheme.subtheme("dark");

// until SC build tools automatically do this:
SC.Pane.prototype.baseTheme = "ace";
