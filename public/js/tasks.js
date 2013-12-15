'use strict';

//
U.taskListView = new U.TaskListView($('#task-pull'));

//
U.completeTaskListView = new U.CompleteTaskListView($('#task-pull'));

$('#user-navigation-container .btn').on('click', function(e){
	console.log('change user');
	e.preventDefault();
	$(this).addClass('active').siblings().removeClass('active');
	U.user = $(this).attr('data-id');
	U.eventDispatcher.trigger('task:changeUser');
});