'use strict';


U.TaskView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#task_tmpl').html()),
	
	events: {
		'click .task-remove-icon'  : 'remove',
		'click .task-complete-icon': 'complete',
		'dblclick .desc'           : 'edit_task',
		'keypress .edit_task_input': 'end_edit'
	},
	
	complete: function() {
		this.model.complete();
		this.model.set('date_complete', new Date().getTimeInSeconds());
		this.model.save();
		U.event_dispatcher.trigger('task:complete', this.model);
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
			}
		});
	}
});