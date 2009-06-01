// ==========================================================================
// Project:   TestRunner.Target
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Describes a single target in the current project.  A target can have a name,
  a type and one or more tests that are loaded on demand.

  @extends SC.Record
  @author Charles Jolley
*/
TestRunner.Target = SC.Record.extend(
/** @scope TestRunner.Target.prototype */ {

  primaryKey: "name",
  
  /**
    The target name.  This is the primary key
    
    @property
  */
  name: SC.Record.attr(String),
  
  /**
    The kind of target.  Usually is one of "app" or "framework".
    
    @property
  */
  kind: SC.Record.attr(String),

  /**
    Link to the document index json

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
