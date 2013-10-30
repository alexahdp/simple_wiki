_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g,
	evaluate: /\[\[(.+?)\]\]/g
};
$(function(){
// Задача
Task = Backbone.Model.extend({
	idAttribute: '_id',
	urlRoot: '/tasks',
	defaults: {
		complete: false,
		date_add: (new Date().getTime())
	},
	complete: function() {
		this.save({complete: true});
	}
});

TaskList = Backbone.Collection.extend({
	model: Task,
	url: '/jtasks_complete/alexahdp',
	
	initialize: function(options) {
		this.dbSync(options);
	},
	
	dbSync: function(options) {
		var me = this;
		this.fetch({
			update: true,
			data: options,
			success: function(models, response) {
				me.add(response.items);
			}
		});
	}
});

//Представление для списка задач
TaskListView = Backbone.View.extend({
	el: $('body'),
	events: {
		'click .add_new_task_button': 'addTask',
		'keydown .new_task': 'addTask',
		'change .select-user': 'selectUser'
	},
	
	initialize: function(root_el, options) {
		var me = this;
		me.$el = root_el;
		_.bindAll(this, 'render', 'addTask', 'appendTask', 'selectUser');
		
		me.collection = new TaskList(options);
		me.collection.bind('add', this.appendTask, this);
		me.collection.widgetSettings = options;
		
		//сортировка задач в стэке
		//$('.task-pull', me.$el).sortable({
		//	cursor: 'move',
		//	stop: function(event, ui) {
		//		var task_id = $(ui.item[0]).find('.desc').attr('data-task_id');
		//		var task = tasks_list_view.collection.get(task_id);
		//		task.save();
		//		var task_index = [];
		//		var index = $(ui.item[0]).index();
		//		for (var i = index; i < $(this).children().length; i++) {
		//			var t = tasks_list_view.collection.get( $($(this).children()[i]).children('span.desc').attr('data-task_id') );
		//			t.set({'index': index});
		//			t.save();
		//			index++;
		//		}
		//	}
		//});
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
		var attr = {
			task: $('.new_task', this.$el).val(),
			exec: $('.task-exec', this.$el).val()
		};
		task.save(attr, {
			success: function(model, response) {
				me.appendTask(model);
				$('.new_task', this.$el).val('');
			}
		});
	},
	
	appendTask: function(task) {
		var task_view = new TaskView({
			model: task
		});
		$('.task-pull', this.$el).append(task_view.render().el);
	},
	
	selectUser: function(e) {
		this.collection.saveSettings({exec: [e.target.value]});
		this.collection.reset();
		$('.task-pull').children().remove();
		this.collection.dbSync(this.collection.widgetSettings);
	},
	
	newTask: function(e, task) {
		if(e.target == this) return;
		this.appendTask(task);
	},
	
	prependTask: function(task) {
		$('.task-pull', this.$el).prepend( task_view.render().el );
	}
});

TaskView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#complete_task_tmpl').html()),
	events: {
		'click .task-remove-icon'  : 'remove',
		'click .task-complete-icon': 'complete',
		'dblclick .desc'           : 'edit_task',
		'keypress .edit_task_input': 'end_edit'
	},
	
	complete: function() {
		this.model.complete();
		EventDispatcher.trigger('task:complete', this.model);
		this.unrender();
	},
	
	initialize: function() {
		_.bindAll(this, 'render', 'complete','unrender', 'edit_task', 'remove', 'end_edit');
		
		this.model.bind('change', this.render);
		this.model.bind('remove', this.unrender);
	},
	
	edit_task: function(e) {
		$("<input class='edit_task_input' type='text' value='" + this.model.get('task')+"'/>").appendTo(this.$el).focus();
		$(e.target).hide();
		this.$el.data('buffer', this.model.get('task'));
	},
	
	end_edit: function(e) {
		if(typeof(e.keyCode) != 'undefined' && e.keyCode != 13) return;
		var me = this;
		
		this.model.set({task: $(e.target).val()});
		this.model.save({
			success: function(){
				e.target.remove();
				me.$el.find('.desc').show();
			}
		});
	},
	
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.addClass('task');
		return this;
	},
	
	unrender: function() {
		$(this.el).remove();
	},
	
	remove: function() {
		var me = this;
		var task = this.model;
		this.model.destroy({
			wait: true,
			success: function(model, response){
				console.log(response);
				me.unrender();
			},
			error: function(){}
		});
	}
});

new TaskListView($('.work-day ol').eq(0));
})