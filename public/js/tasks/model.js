'use strict';

$(function(){
	
	//
	window.U = {};
	
	// Задача
	U.Task = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: '/tasks',
		
		defaults: {
			complete: 0,
			date_add: (new Date().getTime())
		},
		
		complete: function() {
			this.save({complete: 1});
		}
	});
	
	// Список задач
	U.TaskList = Backbone.Collection.extend({
		model: U.Task,
		url: 'jtasks_/alexahdp',
		
		initialize: function(options) {
			this.dbSync(options);
		},
		
		saveSettings: function(options) {
			
		},
		
		dbSync: function(options) {
			var me = this;
			this.fetch({
				update: true,
				data: options,
				success: function(models, response) {
					me.add(response);
				}
			});
		}
	});
	
	// Список задач
	U.CompleteTaskList = Backbone.Collection.extend({
		model: U.Task,
		url: 'jtasks_complete/alexahdp',
		
		initialize: function(options) {
			this.dbSync(options);
		},
		
		saveSettings: function(options) {
			
		},
		
		dbSync: function(options) {
			var me = this;
			this.fetch({
				update: true,
				data: options,
				success: function(models, response) {
					me.add(response);
				}
			});
		}
	});
});