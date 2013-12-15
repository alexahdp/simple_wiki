'use strict';

//
U.taskListView = new U.TaskListView($('#task-pull'));

//
U.completeTaskListView = new U.CompleteTaskListView($('#task-pull'));



// Событие смены пользователя вынесено отдельно, поскольку должно вызываться и для основных задач и для плановых
$('#user-navigation-container .btn').on('click', function(e){
	e.preventDefault();
	$(this).addClass('active').siblings().removeClass('active');
	
	var username = $(this).attr('data-id');
	$.post('/tasks/change_user/' + username, function(){
		U.user = username;
		U.eventDispatcher.trigger('task:changeUser');
	});
});