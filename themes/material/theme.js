
/**
 * @class
 * SproutCore's Material theme.
 */
SC.MaterialTheme = SC.BaseTheme.create({
  name: "material",
  description: "A SproutCore built-in theme by Nicolas Badia and contributors. Only supports browsers that implement CSS3."
});

// register the theme with SproutCore
SC.Theme.addTheme(SC.MaterialTheme);

// SC.ButtonView variants
SC.MaterialTheme.PointLeft = SC.MaterialTheme.subtheme("point-left", "point-left");
SC.MaterialTheme.PointRight = SC.MaterialTheme.subtheme("point-right", "point-right");
SC.MaterialTheme.Capsule = SC.MaterialTheme.subtheme("capsule", "capsule");

// Color variants
SC.MaterialTheme.Dark = SC.MaterialTheme.subtheme("dark");
SC.MaterialTheme.Info = SC.MaterialTheme.subtheme("info");
SC.MaterialTheme.Success = SC.MaterialTheme.subtheme("success");
SC.MaterialTheme.Warning = SC.MaterialTheme.subtheme("warning");
SC.MaterialTheme.Danger = SC.MaterialTheme.subtheme("danger");

// for backwards-compatibility with apps that do not set their
// own default theme:
SC.defaultTheme = 'material';
