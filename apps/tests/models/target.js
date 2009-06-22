// ==========================================================================
// Project:   TestRunner.Target
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Describes a target in the build system.

  @extends SC.Record
*/
TestRunner.Target = SC.Record.extend(
/** @scope TestRunner.Target.prototype */ {

  primaryKey: "name",
  
  /**
    Name of target.  This is also the primary key.
  */
  name: SC.Record.attr(String),
  
  /**
    Parent of target.  Only non-null for nested targets.
  */
  parent: SC.Record.toOne("TestRunner.Target"),

  /**
    URL to use to load tests.
  */
  testsUrl: SC.Record.attr(String, { key: "link_tests" }),
  
  /**
    The isExpanded state.  Defaults to NO on load.
  */
  isExpanded: SC.Record.attr(Boolean, { defaultValue: NO }),
  
  /**
    Children of this target.  Computed by getting the loaded targets
  */
  children: function() {
    var store = this.get('store');
    var ret = TestRunner.get('targets').filterProperty('parent', this);
    if (ret) ret = ret.sortProperty('kind', 'displayName');
    return (ret && ret.get('length')>0) ? ret : null ;
  }.property().cacheable(),
  
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
    //if (this.get('name') === '/sproutcore') return null;
    var parent = this.get('parent');
    if (parent && (parent.get('name') === '/sproutcore')) return 'sproutcore';
    else return (this.get('kind') || 'unknown').toLowerCase();
  }.property('kind', 'parent').cacheable(),
  
  /**
    Returns all of the tests associated with this target by fetching the
    testsUrl.
  */
  tests: function() {
    return this.get('store').findAll(TestRunner.Test);
  }.property('testsUrl').cacheable()

    @property
  */
  docsUrl: SC.Record.attr(String, { key: "link_docs" }),
  
  /**
    Link to the test index json
    
    @property
  */
  testsUrl: SC.Record.attr(String, { key: "link_tests" }),
  
  /**
    Link to the target itself.  This is only useful for applications.
    
    @property
  */
  rootUrl: SC.Record.attr(String, { key: "link_root" }),
  
  
  /**
    The parent target, if there is one.  This is a reference to the primary
    key.
    
    @property
  */
  parent: SC.Record.hasOne("TestRuner.Target"),
  
  /**
    The display name for the target.  Computed by taking the last part of the
    target name.
  */
  displayName: function() {
    var name = this.get('name').split('/');
    name = name[name.length-1] || '(none)';
    return name.titleize();
  }.property('name').cacheable()
  
}) ;
