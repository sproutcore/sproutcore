// ==========================================================================
// Project:   Greenhouse.Target
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  Describes a target in the build system.

  @extends SC.Record
*/
Greenhouse.Target = SC.Record.extend(
/** @scope Greenhouse.Target.prototype */ {

  primaryKey: "name",
  
  /**
    Name of target.  This is also the primary key.
  */
  name: SC.Record.attr(String),
  
  /**
    Parent of target.  Only non-null for nested targets.
  */
  parent: SC.Record.toOne("Greenhouse.Target"),

  /**
    URL to use to load tests.
  */
  testsUrl: SC.Record.attr(String, { key: "link_tests" }),
  
  /**  
    URL to use to load the app.  If no an app, returns null
  */
  appUrl: function() {
    return (this.get('kind') === 'app') ? this.get('name')+"?designMode=YES" : null;
  }.property('kind', 'name').cacheable(),
  
  /**
    The isExpanded state.  Defaults to NO on load.
  */
  isExpanded: SC.Record.attr(Boolean, { defaultValue: NO }),
  
  /**
    Display name for this target
  */
  displayName: function() {
    var name = (this.get('name') || '(unknown)').split('/');
    return name[name.length-1];
  }.property('name').cacheable(),
  
  /**
    The icon to display.  Based on the type.
  */
  targetIcon: function() {
    var ret = 'sc-icon-document-16';
    switch(this.get('kind')) {
      case "framework":
        ret = 'sc-icon-folder-16';
        break;
        
      case "app":
        ret = 'sc-icon-options-16';
        break;
    }
    return ret ;
  }.property('kind').cacheable(),
  
  /**
    This is the group key used to display.  Will be the kind unless the item
    belongs to the sproutcore target.
  */
  sortKind: function() {
    if (this.get('name') === '/sproutcore') return null;
    var parent = this.get('parent');
    if (parent && (parent.get('name') === '/sproutcore')) return 'sproutcore';
    else return (this.get('kind') || 'unknown').toLowerCase();
  }.property('kind', 'parent').cacheable()
}) ;

Greenhouse.TARGETS_QUERY = SC.Query.remote(Greenhouse.Target);
