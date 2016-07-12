
/**
 * @class
 * SproutCore's Aki theme.
 */
SC.AkiTheme = SC.BaseTheme.create({
  name: "aki",
  description: "A SproutCore built-in theme by Nicolas Badia and contributors. Only supports browsers that implement CSS3."
});

// register the theme with SproutCore
SC.Theme.addTheme(SC.AkiTheme);

// SC.ButtonView variants
SC.AkiTheme.PointLeft = SC.AkiTheme.subtheme("point-left", "point-left");
SC.AkiTheme.PointRight = SC.AkiTheme.subtheme("point-right", "point-right");
SC.AkiTheme.Capsule = SC.AkiTheme.subtheme("capsule", "capsule");

// Color variants
SC.AkiTheme.Dark = SC.AkiTheme.subtheme("dark");
SC.AkiTheme.Info = SC.AkiTheme.subtheme("info");
SC.AkiTheme.Success = SC.AkiTheme.subtheme("success");
SC.AkiTheme.Warning = SC.AkiTheme.subtheme("warning");
SC.AkiTheme.Danger = SC.AkiTheme.subtheme("danger");

// for backwards-compatibility with apps that do not set their
// own default theme:
SC.defaultTheme = 'aki';
