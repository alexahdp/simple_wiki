'use strict';

//Представление для списка задач
U.TaskListView = Backbone.View.extend({
	el: $('body'),
	
	prepend: true,
	
	events: {
		'click #add_new_task_button' : 'addTask',
		'keydown .ddd'               : 'addTask',
		'switch-change #append-mode' : 'switchMode'
	},
	
	initialize: function(root_el) {
		_.bindAll(this, 'render', 'createTask', 'addTask', 'appendTask', 'appendAll');
		
		this.collection = new U.TaskList();
		this.collection.on('add', this.createTask, this);
		this.collection.on('reset', this.appendAll, this);
		this.collection.fetch();
		
		U.eventDispatcher.on('task:uncomplete', this.appendTask, this);
		U.eventDispatcher.on('task:changeUser', this.changeUser, this);
		
		this.collection.on('reset', function(col, opts){
			_.each(opts.previousModels, function(model){
				model.trigger('unrender');
			});
		});
		
		//сортировка задач в стэке
		$('#task-pull', this.$el).sortable({
			cursor: 'move',
			stop: function(event, ui) {
				var taskId = $(ui.item[0]).find('.desc').attr('data-task_id');
				var task = U.taskListView.collection.get(taskId);
				task.save();
				var index = $(ui.item[0]).index();
				for (var i = index; i < $(this).children().length; i++) {
					var t = U.taskListView.collection.get( $($(this).children()[i]).children('span.desc').attr('data-task_id') );
					t.set({'index': index});
					t.save();
					index++;
				}
			}
		});
		
		//автоматически загружать изменения других пользователей
		//var me = this;
		//setInterval(function(){
		//	$.get('/jtasks_updates/' + U.user, {last_query: U.last_query}, function(res){
		//		U.last_query = res.last_query;
		//		$.each(res.tasks, function(i, task) {
		//			console.log(task);
		//			if (task['removed'] == '1') {
		//				var task_obj = me.collection.get(task._id);
		//				task_obj.trigger('unrender');
		//				me.collection.remove(task.id, {silent: true});
		//			} else {
		//				me.collection.add(li, {silent: true});
		//				me.createTask(li);
		//			}
		//		});
		//		
		//	})
		//}, 7000);
		
		//setInterval(function() {
		//	channel.fetch();
		//}, 10000);
	},
	
	render: function() {
		var me = this;
		_(this.collection.models).each(function(task) {
			me.appendTask(task);
		}, this);
	},
	
	addTask: function(e) {
		if (typeof(e.keyCode) != 'undefined' && e.keyCode !== 13) {
			return;
		}
		
		var me = this,
			task = new U.Task(),
			attr = {
				task: $('#new_task', this.$el).val(),
				exec: U.user,
				index: me.prepend ? $('#task-pull').children().length : 0
			};
		
		task.save(attr, {
			success: function(model, response) {
				model.id = response._id;
				me.collection.add(model, {silent: true});
				me.createTask(model);
				$('#new_task', me.$el).val('');
			}
		});
	},
	
	createTask: function(model){
		this.prepend ? this.appendTask(model) : this.prependTask(model);
	},
	
	appendAll: function(tasks){
		var me = this;
		tasks.forEach(function(val, i){
			me.collection.add({model: val}, {silent: true});
			me.appendTask(val);
		});
	},
	
	appendTask: function(task) {
		task.index = $('#task-pull').children().length;
		var taskView = new U.TaskView({ model: task });
		$('#task-pull', this.$el).append( taskView.render().el );
	},
	
	changeUser: function(){
		this.collection.fetch();
	},
	
	newTask: function(e, task) {
		if (e.target == this) return;
		this.appendTask(task);
	},
	
	prependTask: function(task) {
		task.index = 0;
		var taskView = new U.TaskView({ model: task });
		$('#task-pull', this.$el).prepend( taskView.render().el );
		var index = 1;
		for (var i = 1; i < $('#task-pull').children().length; i++) {
			var t = U.taskListView.collection.get( $($('#task-pull').children()[i]).children('span.desc').attr('data-task_id') );
			t.set({'index': index});
			t.save();
			index++;
		}
	},
	
	switchMode: function(e){
		this.prepend = ! this.prepend;
	}
});