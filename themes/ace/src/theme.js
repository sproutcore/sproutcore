SC.AceTheme = SC.EmptyTheme.extend({
  name: "Ace",
  description: "Coolness.",
  classNames: ["ace", "light"]
});

SC.Theme.register("sc-ace", SC.AceTheme);

// until SC build tools automatically do this:
SC.Pane.prototype.theme = "sc-ace";