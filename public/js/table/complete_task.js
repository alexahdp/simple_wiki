'use strict';

U.CompleteTaskView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#complete_task_tmpl').html()),
	events: {
		'click .task-uncomplete-icon'  : 'uncomplete',
		'click .task-remove-icon'  : 'remove',
	},
	
	initialize: function() {
		_.bindAll(this, 'render', 'unrender', 'remove');
		
		this.model.bind('change', this.render);
		this.model.bind('remove', this.unrender);
	},
	
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.addClass('complete-task');
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
				me.unrender();
			},
			error: function(){}
		});
	},
	
	uncomplete: function() {
		var me = this;
		var task = this.model;
		this.unrender();
		task.set('complete', '0');
		U.tasks_list_view.appendTask(task);
		task.save();
	}
});