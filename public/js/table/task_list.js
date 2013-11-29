'use strict';

//Представление для списка задач
U.TaskListView = Backbone.View.extend({
	el: $('body'),
	
	events: {
		'click #add_new_task_button': 'addTask',
		'keydown .ddd'              : 'addTask',
	},
	
	initialize: function(root_el, options) {
		_.bindAll(this, 'render', 'addTask', 'appendTask');
		
		this.collection = new U.TaskList(options);
		this.collection.bind('add', this.appendTask, this);
		
		U.eventDispatcher.on('task:uncomplete', this.appendTask, this);
		
		//сортировка задач в стэке
		$('#task-pull', this.$el).sortable({
			cursor: 'move',
			stop: function(event, ui) {
				var task_id = $(ui.item[0]).find('.desc').attr('data-task_id');
				var task = U.taskListView.collection.get(task_id);
				task.save();
				var task_index = [];
				var index = $(ui.item[0]).index();
				for (var i = index; i < $(this).children().length; i++) {
					var t = U.taskListView.collection.get( $($(this).children()[i]).children('span.desc').attr('data-task_id') );
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
		if (typeof(e.keyCode) != 'undefined' && e.keyCode !== 13) return;
		
		var me = this,
			task = new U.Task(),
			attr = {
				task: $('#new_task', this.$el).val(),
				exec: $('.task-exec', this.$el).val()
			};
		
		task.save(attr, {
			success: function(model, response) {
				me.appendTask(model);
				$('#new_task', me.$el).val('');
			}
		});
	},
	
	appendTask: function(task) {
		var taskView = new U.TaskView({ model: task });
		$('#task-pull', this.$el).append( taskView.render().el );
	},
	
	newTask: function(e, task) {
		if (e.target == this) return;
		this.appendTask(task);
	},
	
	prependTask: function(task) {
		this.$el.prepend( task_view.render().el );
	}
});