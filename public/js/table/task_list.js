'use strict';

$(function(){
	
	//Представление для списка задач
	U.TaskListView = Backbone.View.extend({
		el: $('body'),
		events: {
			'click #add_new_task_button': 'addTask',
			'keydown .ddd': 'addTask',
			//'change .select-user': 'selectUser'
		},
		
		initialize: function(root_el, options) {
			var me = this;
			
			_.bindAll(this, 'render', 'addTask', 'appendTask');
			//me.$el = root_el;
			me.collection = new U.TaskList(options);
			me.collection.bind('add', this.appendTask, this);
			
			//сортировка задач в стэке
			$('#task-pull', me.$el).sortable({
				cursor: 'move',
				stop: function(event, ui) {
					var task_id = $(ui.item[0]).find('.desc').attr('data-task_id');
					var task = tasks_list_view.collection.get(task_id);
					task.save();
					var task_index = [];
					var index = $(ui.item[0]).index();
					for (var i = index; i < $(this).children().length; i++) {
						var t = tasks_list_view.collection.get( $($(this).children()[i]).children('span.desc').attr('data-task_id') );
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
			var task = new U.Task();
			var attr = {
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
			var task_view = new U.TaskView({
				model: task
			});
			$('#task-pull', this.$el).append(task_view.render().el);
		},
		
		selectUser: function(e) {
			this.collection.saveSettings({exec: [e.target.value]});
			this.collection.reset();
			$('#task-pull', this.$el).children().remove();
			this.collection.dbSync(this.collection.widgetSettings);
		},
		
		newTask: function(e, task) {
			if(e.target == this) return;
			this.appendTask(task);
		},
		
		prependTask: function(task) {
			this.$el.prepend( task_view.render().el );
		}
	});
});