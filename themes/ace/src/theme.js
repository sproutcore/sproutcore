SC.AceTheme = SC.EmptyTheme.extend({
  name: "Ace",
  description: "Coolness.",
  classNames: ["ace"]
});

SC.Theme.register("sc-ace", SC.AceTheme);

SC.AceTheme.Dark = SC.AceTheme.subtheme("dark", "dark");

// until SC build tools automatically do this:
SC.Pane.prototype.baseThemeName = "sc-ace";
