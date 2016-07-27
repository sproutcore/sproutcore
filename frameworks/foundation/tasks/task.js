// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  Represents a single task which can be run by a task queue. Note that tasks
  are actually allowed to add themselves back onto the queue if they did not/
  might not finish.

  @extends SC.Object
 */
SC.Task = SC.Object.extend({

  /**
    Walk like a duck

    @type Boolean
  */
  isTask: true,

  run: function(queue) {
    // if needed, you could put the task back on the queue for later finishing.
  }

});
