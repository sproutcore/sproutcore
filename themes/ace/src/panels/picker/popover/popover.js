SC.AceTheme.Popover = SC.AceTheme.Dark.subtheme("popover");
SC.AceTheme.addTheme(SC.AceTheme.Popover);

SC.AceTheme.SolidPopover = SC.AceTheme.Popover.subtheme('solid');

// give popover/solid an alias of solid-popover
SC.AceTheme.addTheme(SC.AceTheme.SolidPopover.create({ name: 'solid-popover' }));
