// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  Represents a single task which can be run by a task queue. Note that tasks
  are actually allowed to add themselves back onto the queue if they did not/
  might not finish.
*/
SC.Task = SC.Object.extend({

  /**
    This method should be implemented by subclasses of SC.Task to perform the
    actual task.
  */
  startTask: function (queue) {
    if (this.run) {
      //@if(debug)
      SC.warn("Developer Warning: The `run()` method of SC.Task has been renamed to `startTask()`. Please update your SC.Task subclasses appropriately.");
      //@endif
      this.run(queue);
    }
  },

  /** @private Used by SC.TaskQueue to run the task. */
  start: function (queue) {
    // We simply call `startTask()`. This allows us to bring in the task framework, which replaces SC.Task with the more advanced
    // version and still have everything work the same.
    this.startTask(queue);
  }
});
