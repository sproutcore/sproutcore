// ========================================================================
// SC.UserDefaults Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */
var taskQueue;
module("User Defaults",{
  setup: function(){
    taskQueue = SC.TaskQueue.create();
  }
});



test("Adding a task should not cause it to run.",function(){
  var task = SC.Task.create({ run: function(){ this.ran = YES; } });
  taskQueue.push(task);
  
  ok(!task.ran, "Task should not have run");
});


test("Adding a task and calling run() should cause the task to be run.",function(){
  var task = SC.Task.create({ run: function(){ this.ran = YES; } });
  taskQueue.push(task);
  taskQueue.run();
  
  ok(task.ran, "Task should have run");
});

test("Adding multiple tasks and calling run should run the tasks in order.",function(){
  var ri = 0;
  var task = SC.Task.extend({ run: function(){ this.ran = ri++; } }), t1, t2, t3, t4;
  taskQueue.push(t1 = task.create());
  taskQueue.push(t2 = task.create());
  taskQueue.push(t3 = task.create());
  taskQueue.push(t4 = task.create());
  taskQueue.run();
  
  equals(t1.ran, 0, "Task 1 should be first");
  equals(t2.ran, 1, "Task 1 should be second");
  equals(t3.ran, 2, "Task 1 should be third");
  equals(t4.ran, 3, "Task 1 should be fourth");
});
