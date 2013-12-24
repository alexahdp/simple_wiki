var defSync = Backbone.sync;

function Uequal(options) {
	//mode, cb, data
	Backbone.sync = function(method, model, opts){
		options.cb(method, model, opts, options.data);
		//model.trigger('request', model);
	};
}

////Model
////Создание новой задачи
asyncTest('create task', function(){
	Uequal({
		cb: function(method, model, opts){
			var taskToServer = model.attributes;
			equal(taskToServer.task, 'aaa', 'Create Task');
			equal(taskToServer.complete, '0', 'Create Task');
			equal(typeof taskToServer.date_add, 'number', 'Create Task');
			start();
		}
	});
	var task = new U.Task({task: 'aaa'});
	task.save();
});

////Model.js
////завершение задачи
asyncTest('complete task', function(){
	Uequal({
		cb: function(method, model, opts){
			var taskToServer = model.attributes;
			equal(taskToServer.complete, '1', 'Complete task');
			start();
		}
	});
	var task = new U.Task({task: 'aaa'});
	task.complete();
});

////Collection
////Создание коллекции и загрузка задач
asyncTest('TaskList - load tasks', function(){
	Uequal({
		cb: function(mode, collection, options, data){
			options.success(data);
			equal(collection.models.length, 1, 'read tasks');
			start();
		},
		data: [
			{_id: 'fdfdfdsfdf234gdsaf', task: 'bbb', date_add: 1387480488, exec: 'alexahdp'}
		]
	});
	var taskList = new U.TaskList();
	taskList.fetch();
});

//View
//Создание представления коллекции, инициализация коллекции и загрузка задач
asyncTest('TaskListView - load tasks', function(){
	Uequal({
		cb: function(mode, collection, options, data) {
			options.success(data);
			equal(collection.models.length, 3, 'read tasks');
			equal($('li', '#task-pull').length, 3, 'render tasks');
			equal($('.desc[data-task_id="1fdfdfdsfdf234gdsaf"]', '#task-pull').length, 1);
			//.date_add
			
			//remove task
			Uequal({
				cb: function(mode, model, options) {
					equal(model.attributes.task, 'aaa', 'remove task');
					options.success(options);
					equal($('.desc[data-task_id="1fdfdfdsfdf234gdsaf"]', '#task-pull').length, 0);
				}
			});
			$('li .task-remove-icon', '#task-pull').eq(0).trigger('click');
			
			//complete task
			Uequal({
				cb: function(mode, model, options) {
					var task = model.attributes;
					equal(task.task, 'bbb', 'complete task');
					task.complete = '1';
					options.success(task);
					setTimeout(function(){
						equal($('.desc[data-task_id="2fdfdfdsfdf234gdsaf"]', '#task-pull').length, 0);
					},0);
				}
			});
			U.eventDispatcher.on('task:complete', function(task){
				setTimeout(function(){
					equal(task.attributes.task, 'bbb');
				}, 0);
			});
			$('li .task-complete-icon', '#task-pull').eq(0).trigger('click');
			
			
			start();
		},
		data: [
			{_id: '1fdfdfdsfdf234gdsaf', task: 'aaa', date_add: 1387480488, exec: 'alexahdp', index: 0, complete: '0'},
			{_id: '2fdfdfdsfdf234gdsaf', task: 'bbb', date_add: 1387480488, exec: 'alexahdp', index: 1, complete: '0'},
			{_id: '3cdfdfdsfdf234gdsaf', task: 'ccc', date_add: 1387480488, exec: 'alexahdp', index: 2, complete: '0'}
		]
	});
	//Backbone.sync = defSync;
	var taskList = new U.TaskListView($('#task-pull'));
});

//
asyncTest('CompleteTaskListView', function(){
	Uequal({
		cb: function(mode, collection, options, data) {
			options.success(data);
			equal(collection.models.length, 3, 'read tasks');
			equal($('li', '#complete-stack').length, 3, 'render tasks');
			equal($('span[task_id="4fdfdfdsfdf234gdsaf"]', '#complete-stack').length, 1);
			
			start();
		},
		data: [
			{_id: '4fdfdfdsfdf234gdsaf', task: 'ddd', date_add: 1387480488, date_complete: 1387481488, exec: 'alexahdp', index: 0, complete: '1'},
			{_id: '5fdfdfdsfdf234gdsaf', task: 'eee', date_add: 1387480488, date_complete: 1387482488, exec: 'alexahdp', index: 1, complete: '1'},
			{_id: '6cdfdfdsfdf234gdsaf', task: 'fff', date_add: 1387480488, date_complete: 1387483488, exec: 'alexahdp', index: 2, complete: '1'}
		]
	});
	var completeTaskListView = new U.CompleteTaskListView($('#complete-stack'));
});

