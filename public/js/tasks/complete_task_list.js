'use strict';

U.CompleteTaskListView = Backbone.View.extend({
	el: $('body'),
	
	page: 1,
	
	events: {
		'click .add_new_task_button': 'addTask',
		'keydown .new_task'         : 'addTask',
		'new_task'                  : 'newTask',
		'click .more'               : 'getMore'
	},
	
	initialize: function() {
		_.bindAll(this, 'render', 'addTask', 'appendTask');
		
		this.collection = new U.CompleteTaskList();
		this.collection.on('add', this.appendTask);
		this.collection.on('reset', this.appendAll, this);
		this.collection.fetch();
		
		U.eventDispatcher.on('task:complete', this.prependTask, this);
		U.eventDispatcher.on('task:changeUser', this.changeUser, this);
		
		this.collection.on('reset', function(col, opts){
			_.each(opts.previousModels, function(model){
				model.trigger('unrender');
			});
		});
		
		this.render();
	},
	
	
	addTask: function(e) {
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
	
	
	appendAll: function(tasks){
		var me = this;
		tasks.forEach(function(val, i){
			me.collection.add({model: val}, {silent: true});
			me.appendTask(val);
		});
	},
	
	
	appendTask: function(task) {
		var taskView = new U.CompleteTaskView({
			model: task
		});
		$('#complete-stack', this.$el).append(taskView.render().el);
	},
	
	
	changeUser: function(){
		this.collection.fetch();
	},
	
	getMore: function(){
		var me = this;
		//через fetch ни хуя не заработало, все время сбрасывало коллекцию, поэтому таким уродским методом (reset: false не помогло
		$.get('jtasks_complete/' + U.user, {page: me.page}, function(res){
			me.collection.add(res);
			me.page++;
		});
	},
	
	newTask: function(e, task){
		if(e.target == this) return;
		this.appendTask(task);
	},
	
	prependTask: function(task) {
		var taskView = new U.CompleteTaskView({
			model: task
		});
		$('#complete-stack', this.$el).prepend(taskView.render().el);
	},
	
	render: function() {
		var self = this;
		_(this.collection.models).each(function(task) {
			self.appendTask(task);
		}, this);
	}
});