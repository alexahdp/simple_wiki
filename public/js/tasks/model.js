'use strict';

// Задача
U.Task = Backbone.Model.extend({
	idAttribute: '_id',
	urlRoot: '/tasks',
	
	defaults: {
		complete: '0',
		date_add: new Date().getTimeInSeconds()
	},
	
	complete: function() {
		this.save({complete: '1', 'date_complete': new Date().getTimeInSeconds()});
	},
	
	uncomplete: function(){
		this.save({complete: '0', 'date_complete': new Date().getTimeInSeconds()});
	}
});

// Список задач
U.TaskList = Backbone.Collection.extend({
	model: U.Task,
	url: function(){
		return 'jtasks_/' + U.user;
	},
	
	//initialize: function(options) {
	//	this.fetch({reset: true});
	//}
});

// Список задач
U.CompleteTaskList = Backbone.Collection.extend({
	model: U.Task,
	url: function(){
		return 'jtasks_complete/' + U.user;
	},
	
	//initialize: function(options) {
	//	this.fetch();
	//}
});