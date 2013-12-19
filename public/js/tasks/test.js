var defSync = Backbone.sync;

function Uequal(mode, cb, options) {
	if (mode == 'create' || mode == 'update') {
		Backbone.sync = function(method, model, opts){
			cb(model.attributes);
		}
	} else {
		Backbone.sync = function(method, model, opts){
			opts.success(model, options, opts);
			cb(method, model, opts);
		}
	}
	
	//$(document).ajaxSend(function(e, jqXHR, options){
	//	//console.log(e, jqXHR, options);
	//	cb(options);
	//	jqXHR.abort();
	//});
}

asyncTest('create task', function(){
	Uequal('create', function(taskToServer){
		equal(taskToServer.task, 'aaa', 'Create Task');
		equal(taskToServer.complete, '0', 'Create Task');
		equal(typeof taskToServer.date_add, 'number', 'Create Task');
		start();
		
	});
	var task = new U.Task({task: 'aaa'});
	task.save();
});

asyncTest('complete task', function(){
	Uequal('update', function(taskToServer){
		equal(taskToServer.complete, '1', 'Complete task');
		start();
	});
	var task = new U.Task({task: 'aaa'});
	task.complete();
});

asyncTest('TaskList - load tasks', function(){
	var tasks = [
		{task: 'bbb', date_add: 1387480488, exec: 'alexahdp'}
	];
	Uequal('read', function(op, taskList, opts){
		equal(taskList.models.length, 1, 'read tasks');
		start();
	}, tasks);
	var taskList = new U.TaskList();
});