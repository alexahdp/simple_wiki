'use strict';

U.CompleteTaskListView = Backbone.View.extend({
	el: $('body'),
	events: {
		'click .add_new_task_button': 'addTask',
		'keydown .new_task': 'addTask',
		'new_task': 'newTask'
	},
	
	initialize: function(root_el) {
		var me = this;
		
		_.bindAll(this, 'render', 'addTask', 'appendTask');
		
		//EventDispatcher.on('task:complete', this.appendTask, this);
		
		me.collection = new U.CompleteTaskList();
		me.collection.bind('add', this.appendTask);
		
		this.render();
		
		//сортировка задач в стэке
		$('.task-pull', me.$el).sortable({
			cursor: 'move',
			stop: function(event, ui) {
				var task_id = $(ui.item[0]).find('.desc').attr('data-task_id');
				var task = U.tasks_list_view.collection.get(task_id);
				task.save();
				var task_index = [];
				var index = $(ui.item[0]).index();
				for (var i = index; i < $(this).children().length; i++) {
					var t = U.tasks_list_view.collection.get( $($(this).children()[i]).children('span.desc').attr('data-task_id') );
					t.set({'index': index});
					t.save();
					index++;
				}
			}
		});
	},
	
	render: function() {
		var self = this;
		_(this.collection.models).each(function(task) {
			self.appendTask(task);
		}, this);
	},
	
	addTask: function(e) {
		if(typeof(e.keyCode) != 'undefined' && e.keyCode !== 13) return;
		
		var me = this;
		var task = new Task;
		var attr = { task: $('.new_task', this.$el).val() };
		task.save(attr, {
			success: function(model, response) {
				me.appendTask(model);
				$('.new_task', this.$el).val('');
				$.trigger('new_task', task);
			}
		});
	},
	
	appendTask: function(task) {
		var task_view = new U.CompleteTaskView({
			model: task
		});
		$('#complete-stack', this.$el).append(task_view.render().el);
	},
	
	newTask: function(e, task){
		if(e.target == this) return;
		this.appendTask(task);
	}
});