// ========================================================================
// Controller Tests
// ========================================================================
/*globals module test ok isObj equals expects */

// stub in required method implementations.
var klass = SC.Controller.extend({
  
  // used to configure different tests.
  isCommitEnabled: YES,
  isDiscardEnabled: YES,
  isCommitSuccessful: YES,
  isDiscardSuccessful: YES,
  
  changesCommitted: NO, 
  changesDiscarded: NO,
  
  commitChangesImmediately: NO,
  
  canCommitChanges: function() {
    return this.get('isCommitEnabled') ;
  },
  
  performCommitChanges: function() { 
    return this.changesCommitted = this.get('isCommitSuccessful') ; 
  },
  
  canDiscardChanges: function() {
    return this.get('isDiscardEnabled') ;
  },
  
  performDiscardChanges: function() { 
    return this.changesDiscarded = this.get('isDiscardSuccessful') ; 
  }
  
});

var c, root, child, child2 ; // global variables

module("Single SC.Controller", {
  
  setup: function() {
    c = klass.create() ;
  }
  
});

test("hasChanges should be true after change", function() {
  equals(c.get('hasChanges'), NO) ;
  c.editorDidChange() ;
  equals(c.get('hasChanges'), YES) ;
});

test("hasChanges should be false after commit", function() {
  c.editorDidChange() ;
  equals(c.get('hasChanges'), YES) ;
  c.commitChanges() ;
  equals(c.get('hasChanges'), NO) ;
});

test("hasChanges should be false after discard", function() {
  c.editorDidChange() ;
  equals(c.get('hasChanges'), YES) ;
  c.discardChanges() ;
  equals(c.get('hasChanges'), NO) ;
});

test("hasChanges should be true if commit fails", function() {
  c.editorDidChange() ;
  
  // disable canCommit
  c.isCommitEnabled = NO ;
  equals(c.commitChanges(), NO) ;
  equals(c.get('hasChanges'), YES) ;
  
  // disable performCommit
  c.isCommitEnabled = YES ;  c.isCommitSuccessful = NO ;
  equals(c.commitChanges(), NO) ;
  equals(c.get('hasChanges'), YES) ;
});

test("hasChanges should be true if discard fails", function() {
  c.editorDidChange() ;
  
  // disable canCommit
  c.isDiscardEnabled = NO ;
  equals(c.discardChanges(), NO) ;
  equals(c.get('hasChanges'), YES) ;
  
  // disable performCommit
  c.isDiscardEnabled = YES ;  c.isDiscardSuccessful = NO ;
  equals(c.discardChanges(), NO) ;
  equals(c.get('hasChanges'), YES) ;
});

test("commit should fail if there are no changes to commit", function() {
  equals(c.get('hasChanges'), NO) ;
  equals($ok(c.commitChanges()), NO) ;
});

test("discard should fail if there are no changes to commit", function() {
  equals(c.get('hasChanges'), NO) ;
  equals($ok(c.discardChanges()), NO) ;
});

test("changes should commit immediately if enabled", function() {
  c.set('commitChangesImmediately', YES) ;
  c.editorDidChange() ;
  ok(null !== c._commitTimeout, '_commitTimeout') ;
});

test("changes should NOT commit immediately UNLESS enabled", function() {
  c.set('commitChangesImmediately', NO) ;
  c.editorDidChange() ;
  equals((c._commitTimeout == null), YES) ;
});

module("Chained SC.Controllers", {
  
  // root is the root controller, 
  // child belongs to the root parent.
  // child2 belongs to the root parent also.  This is used only for a few tests.
  setup: function() {
    c = klass.create() ;
    root = c;
    child = klass.create({ context: root }) ;
    child2 = klass.create({ context: root }) ;
  }
  
});

test("root.hasChanges should be true after child.change", function() {
  equals(root.get('hasChanges'), NO) ;
  child.editorDidChange() ;
  equals(root.get('hasChanges'), YES) ;
});

test("child.hasChanges should be FALSE after root.commit", function() {
  child.editorDidChange() ;
  equals(child.get('hasChanges'), YES) ;
  root.commitChanges() ;
  equals(child.get('hasChanges'), NO) ;
});

test("child.hasChanges should be FALSE after root.discard", function() {
  child.editorDidChange() ;
  equals(child.get('hasChanges'), YES) ;
  root.discardChanges() ;
  equals(child.get('hasChanges'), NO) ;
});

test("root.hasChanges should be FALSE after child.commit if root DOES NOT have other changes", function() {
  // edit child only
  child.editorDidChange() ;
  equals(root.get('hasChanges'), YES) ;

  child.commitChanges() ;
  equals(root.get('hasChanges'), NO) ;
});

test("root.hasChanges should be TRUE after child.commit if root DOES have other changes", function() {
  // edit child and root
  child.editorDidChange() ;
  root.editorDidChange() ;
  
  equals(root.get('hasChanges'), YES) ;
  child.commitChanges() ;
  equals(root.get('hasChanges'), YES) ;
});

test("root.hasChanges should be FALSE after child.discard if root DOES NOT have other changes", function() {
  // edit child only
  child.editorDidChange() ;
  
  equals(root.get('hasChanges'), YES) ;
  child.discardChanges() ;
  equals(root.get('hasChanges'), NO) ;
});

test("root.hasChanges should be TRUE after child.discard if root DOES have other changes", function() {
  // edit child and root
  child.editorDidChange() ;
  root.editorDidChange() ;
  
  equals(root.get('hasChanges'), YES) ;
  child.discardChanges() ;
  equals(root.get('hasChanges'), YES) ;
});

test("child.hasChanges should be TRUE if another child cannot commit", function() {
  // edit child and child2
  child.editorDidChange() ;
  child2.editorDidChange() ;
  
  // disable canCommit in child2
  child2.isCommitEnabled = NO ;
  
  // now try to commit.  child not be committed.
  equals($ok(root.commitChanges()), NO) ;
  
  // verify child.
  equals(child.changesCommitted, NO) ;
  equals(child.get('hasChanges'), YES) ;
  equals(root.get('hasChanges'), YES) ;
});

test("child.hasChanges should be TRUE if another child cannot discard", function() {
  // edit child and child2
  child.editorDidChange() ;
  child2.editorDidChange() ;
  
  // disable canCommit in child2
  child2.isDiscardEnabled = NO ;
  
  // now try to commit.  child not be committed.
  equals($ok(root.discardChanges()), NO) ;
  
  // verify child.
  equals(child.changesDiscarded, NO) ;
  equals(child.get('hasChanges'), YES) ;
  equals(root.get('hasChanges'), YES) ;
});

test("root.hasChanges should be TRUE if any child fails to commit", function() {
  // NOTE: Commits are not atomic.  IN this case, child2 fails while child1 succeeds.
  // the hasChanges state of child2 and root must both be TRUE in this case, but 
  // child1's state is undefined.  It may have commited or it may not.
  
  child.editorDidChange() ;
  child2.editorDidChange() ;
  child2.isCommitSuccessful = NO ;
  
  equals($ok(root.commitChanges()), NO) ;
  equals(root.get('hasChanges'), YES) ;
  equals(child2.get('hasChanges'), YES) ;
});

test("root.hasChanges should be TRUE if any child fails to discard", function() {
  // NOTE: Commits are not atomic.  IN this case, child2 fails while child1 succeeds.
  // the hasChanges state of child2 and root must both be TRUE in this case, but 
  // child1's state is undefined.  It may have commited or it may not.
  
  child.editorDidChange() ;
  child2.editorDidChange() ;
  child2.isDiscardSuccessful = NO ;
  
  equals($ok(root.discardChanges()), NO) ;
  equals(root.get('hasChanges'), YES) ;
  equals(child2.get('hasChanges'), YES) ;
});

test("child.commitChangesImmediately should be inherited from the root", function() {
  var Klass = SC.Controller.extend({ commitChangesImmediately: NO });
  
  // child created with context passed...
  var root  = Klass.create({ commitChangesImmediately: YES });
  var child = Klass.create({ context: root });
  equals(root.get('commitChangesImmediately'), YES);
  equals(child.get('commitChangesImmediately'), YES);
  
  // context set after creation...
  var root  = Klass.create({ commitChangesImmediately: YES });
  var child = Klass.create();
  equals(root.get('commitChangesImmediately'), YES);
  equals(child.get('commitChangesImmediately'), NO);
  child.set('context', root);
  equals(child.get('commitChangesImmediately'), YES);
});
