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
		this.collection.bind('reset', this.appendAll, this);
		
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
		if (typeof(e.keyCode) != 'undefined' && e.keyCode !== 13) {
			console.log("ERROR");
			return;
		}
		
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
	
	appendAll: function(tasks){
		var me = this;
		//_.each(this.collection.models, function(val, i){
		//	console.log(val);
		//	val.unrender();
		//});
		tasks.forEach(function(val, i){
			me.collection.add({model: val}, {silent: true});
			me.appendTask(val);
		});
	},
	
	appendTask: function(task) {
		var taskView = new U.TaskView({ model: task });
		$('#task-pull', this.$el).append( taskView.render().el );
	},
	
	changeUser: function(){
		var me = this;
		//this.collection.reset(this.collection.models);
		this.collection.fetch({
			success: function(collection, resp){
				//_.each(resp, function(val, i){
				//	me.appendTask(new U.Task(val));
				//});
				me.collection.reset(resp, {silent: true});
			}
		});
		
	},
	
	newTask: function(e, task) {
		if (e.target == this) return;
		this.appendTask(task);
	},
	
	prependTask: function(task) {
		this.$el.prepend( task_view.render().el );
	}
});