// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;

/** 
  @class   SC.Controller

  The controller base class provides some common functions you will need
  for controllers in your applications, especially related to maintaining
  an editing context.

  In general you will not use this class, but you can use a subclass such
  as ObjectController, CollectionController, or ArrayController.

  h2. EDITING CONTEXTS
  
  One major function of a controller is to mediate between changes in the
  UI and changes in the model.  In particular, you usually do not want 
  changes you make in the UI to be applied to a model object directly.  
  Instead, you often will want to collect changes to an object and then
  apply them only when the user is ready to commit their changes.

  The editing contact support in the controller class will help you
  provide this capability.
  
  @extends SC.Object
*/
SC.Controller = SC.Object.extend(
  /** @scope SC.Controller.prototype  */
  {  
  
  /**
    The controller will set this property to true whenever there are 
    changes that need to be committed.  This property is true whenever
    the controller itself has uncommitted changes or when any dependent
    editors have uncommitted changes.  In your own subclass, call 
    this.objectDidChange(this) to register changes.

    @type Boolean
  */
  hasChanges: false,
  
  /**
    This is the controller's parent controller usually.  The controller will
    notify this controller when its changes are committed or discarded.

    @type SC.Controller
  */
  context: null,
  
  /**
    If this is false, then the controller will only commit changes when you
    explicitly call commitChanges.  Otherwise it will commit them
    immediately.  You usually want this set to false.  It is initially set to
    true for compatibility.

    @type Boolean
  */
  commitChangesImmediately: true,
  
  /**
  * Sets the commitChangesImmediately to the parent context's value if a context was passed.
  * The Controller also observes changes to the context property and adjusts the commitChangesImmediately prop
  */
  init: function()
  {
    sc_super();
    this._contextObserver();
  },
  
  /**
  * @private
  */
  _contextObserver: function()
  {
    if ( this.context )
    {
      // inherit the parent contexts inherit property
      this.commitChangesImmediately = this.context.commitChangesImmediately;
    }
  }.observes('context'),
  
  /**
    If the controller has uncommitted changes, call this method to 
    commit them.  This method will commit the changes for any dependent
    editors as well.  This will return true if the commit completed and 
    false or an error object if it failed.
  */
  commitChanges: function() {
    this._commitTimeout = null ; // clear timeout 
    var ret = this._canCommitChanges() ;
    if (!$ok(ret)) return ret ;
    return this._performCommitChanges() ;
  },
  
  /**
    If this controller has uncommitted changes that you do not want to keep,
    call this method to discard them.  This method will also discard 
    changes for any dependent editors as well.
  */
  discardChanges: function() {
    var ret = this._canDiscardChanges() ;
    if (!$ok(ret)) return ret ;
    return this._performDiscardChanges() ;
  },
  
  /**
    This method will return an appropriate controller object for the 
    value of the property you name.  This will return one of:
  
    <table>
    <tr> <th>Value Type</th>        <th>Returns</th> </tr>
    <tr> <td>Array-compatible</td>  <td>SC.ArrayController</td></tr>
    <tr> <td>SC.Collection</td>     <td>SC.CollectionController</td></tr>
    <tr> <td>Kind of SC.Object</td> <td>SC.ObjectController</td></tr>
    <tr> <td>other</td>             <td>value</td></tr>
    </table>
  
    This is a helper method used by subclasses to create the appropriate 
    type of controller.
  
  */
  controllerForValue: function(value) {
    var ret = null ;
    switch($type(value)) {
      case T_OBJECT:
        if (value.kindOf(SC.Collection)) {
          ret = SC.CollectionController ;          
        } else ret = SC.ObjectController ;
        break ;
      case T_ARRAY:
        ret = SC.ArrayController ;
        break ;
      default:
        ret = null ;
    }
    
    return (ret) ? ret.create({ content: value, context: this }) : value;
  },
  
  /**
    Call this method whenever you have uncommitted changes.  This will
    handle notifying your parent context as well.
  
    @param {SC.Controller} editor 
      This is the object that has uncommitted changes.  Normally you should 
      not pass a value.  If you do pass an object, then that object will  
      become a dependent editor of the receiver.
  */
  editorDidChange: function(editor) {
    if (!editor) editor = this ; // set default value
    
    // if this is another editor, add it to the list of editors that need
    // to be notified of a change.
    if (editor != this) {
      if (!this._dirtyEditors) this._dirtyEditors = SC.Set.create();
      this._dirtyEditors.add(editor) ;
    } else {
      this._hasLocalChanges = true ;
    }
    if (!this.get('hasChanges')) {
      this.set('hasChanges', true) ;
      
      // if we have a parent context notify them
      if (this.context) {
        this.context.editorDidChange(this) ; 
        
      // otherwise, if commit changes immediately is true, schedule commit.
      // commit is only done once per cycle so that at least all the
      // changes you might make at one time will be batched.
      } else if (this.get('commitChangesImmediately')) {
        if (!this._commitTimeout) {
          this._commitTimeout = this.commitChanges.bind(this).defer();
        }
      }
    }
  },
  
  /**
    Call this method when your object no longer has uncommitted changes.
    This will clear your hasChanges property and notify your parent context.
    This is called automatically whenever changes are committed or discarded
    on your controller.
  */  
  editorDidClearChanges: function(editor) {
    if (!editor) editor = this ; // set default value
    
    if (editor != this) {
      // if we are currently clearing changes, then we will clean up the
      // hasChanges state and dirtyeditors in bulk when this is all done.
      // so do nothing.
      if (this._clearingChanges) return ;
      if (this._dirtyEditors) this._dirtyEditors.remove(editor) ;
    } else {
      this._hasLocalChanges = false ;
    }
    
    // _dirtyEditors may be undefined so use !! to force this to a bool value.
    var hasChanges = !!(this._hasLocalChanges || (this._dirtyEditors && this._dirtyEditors.length > 0)) ;
    
    if (this.get('hasChanges') != hasChanges) {
      this.set('hasChanges', hasChanges) ;
      if (this.context) this.context.editorDidClearChanges(editor) ;
    }
  },
  
  /**
    Override this method to determine if your controller can commit the
    changes.  This should validate your changes.  Return false or an error
    object if you cannot commit the change.  This method will not be called
    unless hasChanges is true and all your dependent editors are return
    true as well.
  */  
  canCommitChanges: function() {
    return true ;
  },
  
  /**
    Override this method to actually commit the changes for your controller.
    This will only be called if all controllers indicate that they can
    commit.  Return true if you succeeded or false or an error if you failed.
  */
  performCommitChanges: function() {
    return $error('performCommitChanges is not implemented') ;
  },
  
  /**
    Override this method to determine if your controller can discard the 
    changes it has built up.  This method will not be called unless you
    have set hasChanges to true.  Return false or an error object if you
    cannot discard the change.
  */
  canDiscardChanges: function() {
    return true ;
  },
  
  /**
    Override this method to actually discard the changes for your controller.
    This will only be called if all controllers indicate that they can discard
    their changes.  Return true if you succeed or false or an error if you 
    failed.
  */
  performDiscardChanges: function() {
    return $error('performDiscardChanges is not implemented');
  },
  
  // ....................................
  // PRIVATE
  
  _canCommitChanges: function() {
    if (!this.get('hasChanges')) return false ;
    
    // validate editors.
    var ret = true ;
    if (this._dirtyEditors) {
      ret = this._dirtyEditors.invokeWhile(true, '_canCommitChanges') ;
      if (!$ok(ret)) return ret ;
    }
    
    // then validate receiver
    return this.canCommitChanges() ;
  },
  
  _performCommitChanges: function() {
    if (!this.get('hasChanges')) return true ;
    
    // first commit any editors.  If not successful, return. otherwise,
    // clear editors.
    var ret = true ;
    if (this._dirtyEditors) {
      this._clearingChanges = true ;
      ret = this._dirtyEditors.invokeWhile(true, '_performCommitChanges') ;
      this._clearingChanges = false ;
      
      if ($ok(ret)) {
        this._dirtyEditors = null ;
      } else return ret ;
    }

    // now commit changes for the receiver.
    ret = this.performCommitChanges() ;
    if ($ok(ret)) this.editorDidClearChanges() ;
    return ret ;
  },

  _canDiscardChanges: function() {
    if (!this.get('hasChanges')) return false ;
    // validate editors.
    var ret = true ;
    if (this._dirtyEditors) {
      ret = this._dirtyEditors.invokeWhile(true, '_canDiscardChanges') ;
      if (!$ok(ret)) return ret ;
    }
    
    // then validate receiver
    return this.canDiscardChanges() ;
  },
  
  _performDiscardChanges: function() {
    if (!this.get('hasChanges')) return true ;
    
    // first discard changes for any editors.  If not successful, return. 
    // otherwise, clear editors.
    var ret = true ;
    if (this._dirtyEditors) {
      this._clearingChanges = true ;
      ret = this._dirtyEditors.invokeWhile(true, '_performDiscardChanges') ;
      this._clearingChanges = false ;
      if ($ok(ret)) {
        this._dirtyEditors = null ;
      } else return ret ;
    }
    
    // now discard changes for the receiver.
    ret = this.performDiscardChanges() ;
    if ($ok(ret)) this.editorDidClearChanges() ;
    return ret ;
  }
  
}) ;
