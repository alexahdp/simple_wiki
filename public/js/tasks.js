$(document).ready(function(){
	var TaskList = new TaskPull({el: '#task-pull', });
	var CTaskList = new TaskPull({el: '#complete-stack', });
	buffer = undefined;
	CTaskList.add = function(task) {
		//если это первая задача за день - необходимо создать новый день и в него добавлять задачи
		var today = new Date().getDateDMY();
		
		if(today == $('div.work-day.current .alert').text()){
			var parent_elem = $('div.work-day.current ol');
			var elem = $("<li class='complete-task'></li>").prependTo('div.work-day.current ol');
		}else{
			
			$('.work-day.current > div').removeClass('alert-success').addClass('alert-info');
			var elem = $("<div class='work-day current'><div class='alert alert-success'>"+today+"</div></div>'")
				.prependTo(
					$('div.work-day.current')
						.removeClass('current')
						.parent()
				);
			
			var ol = $("<ol></ol>").appendTo(elem);
			elem = $("<li class='complete-task'></li>").appendTo(ol);
		}
		elem.append(task);
	};
	
	//кнопка Добавить новую задачу
	$('#add_new_task_button').click(function(){
		add_new_task();
	});
	
	//Добавлять задачи нажатием Enter в поле ввода задачи
	$('#new_task').keypress(function(e){
		if(e.keyCode == 13) add_new_task();
	});
	
	/**
	 * Добавить новую задачу
	 */
	function add_new_task(){
		$.ajax({
			url: '/tasks',
			type: 'post',
			data: {task: $('#new_task').val()},
			dataType: 'json',
			success: function(answ){
				if (answ.success) {
					TaskList.add(answ.data);
					$('#new_task').val('');
				}else{
					alert("error");
				}
			},
			error: function(err){
				alert("error");
			}
		});
	}
	
	//сортировка задач в стэке
	$('#task-pull').sortable({
		cursor: 'move',
		stop: function(event, ui){
			var task_index = [];
			var index = $(ui.item[0]).index();
			for(var i = index; i<$(this).children().length; i++){
				task_index.push({'id': $($(this).children()[i]).children('span').attr('task_id'), 'index': index});
				index++;
			}
			//сохранять порядок задач после сортировки
			$.ajax({
				url: '/task_sort',
				type: 'post',
				dataType: 'json',
				data: {'task_order': JSON.stringify(task_index)},
				success: function(result){},
				error: function(){}
			});
		}
	});
	
	
	//кнопка задача выполнена
	$(document).on('click', '.task-complete-icon', function(){
		var task = $(this).parent();
		var id = task.children('span').attr('task_id');
		var data_t = {'complete': 1, 'date_complete': Math.floor(new Date().getTime() / 1000)};
		$.ajax({
			url: '/tasks/' + id,
			type: 'put',
			data: data_t,
			dataType: 'json',
			success: function(answ){
				if(answ.success){
					
					//если это первая задача за день - необходимо создать новый день и в него добавлять задачи
					var today = new Date().getDateDMY();
					
					if(today == $('div.work-day.current .alert').text()){
						var parent_elem = $('div.work-day.current ol');
						var elem = $("<li class='complete-task'></li>").prependTo('div.work-day.current ol');
					}else{
						
						$('.work-day.current > div').removeClass('alert-success').addClass('alert-info');
						var elem = $("<div class='work-day current'><div class='alert alert-success'>"+today+"</div></div>'")
							.prependTo(
								$('div.work-day.current')
									.removeClass('current')
									.parent()
							);
						
						var ol = $("<ol></ol>").appendTo(elem);
						elem = $("<li class='complete-task'></li>").appendTo(ol);
					}
					
					elem.append(task.children('span'));
					elem.append("<div class='date_complete'>"+new Date().getDateFull()+"</div>");
					elem.append("<i class='task-icon task-remove-icon icon-remove'></i>");
					elem.append("<i class='task-icon task-uncomplete-icon icon-arrow-right'></i>");
					task.remove();
				}else{
					alert("error");
				}
			},
			error: function(err){
				alert("error");
			}
		});
	});
	
	
	//кнопка удалить задачу
	$(document).on('click', '.task-remove-icon', function(){
		var task = $(this).parent();
		var id = task.children('span').attr('task_id');
		$.ajax({
			url: '/tasks/' + id,
			type: 'delete',
			dataType: 'json',
			success: function(answ){
				if(answ.success){
					task.remove();
				}else{
					alert("error");
				}
			},
			error: function(err){
				alert("error");
			}
		});
	});
	
	//кнопка вернуть в стэк задач
	$('.task-uncomplete-icon').on('click', function(){
		var task = $(this).parent();
		var id = task.children('span').attr('task_id');
		$.ajax({
			url: '/tasks/' + id,
			type: 'put',
			data: {complete: '0'},
			dataType: 'json',
			success: function(answ){
				if(answ.success){
					var elem = $("<li class='task'></li>").prependTo('#task-pull');
					elem.append(task.children('span'));
					elem.append("<i class='task-icon task-remove-icon icon-remove'></i>");
					elem.append("<i class='task-icon task-complete-icon icon-ok' title='Выполнена'></i>");
					task.remove();
				}else{
					alert("error");
				}
			},
			error: function(err){
				alert("error");
			}
		});
	});
	
	//редактировать текст задачи при двойном щелчке по ней
	$(document).on('dblclick', '.task span', function(){
		$("<input class='edit_task_input' type='text' value='"+ $(this).text() +"'/>").appendTo($(this).parent()).focus();
		$(this).hide();
		buffer = $(this).text();
	});
	
	//завершить редактирование задачи и отправить на сервер
	$(document).on('focusout keypress', '.edit_task_input', function(e){
		if(e.keyCode != undefined && e.keyCode != 13) return;
		
		var me = $(this);
		
		if(buffer == me.val()){
			me.parent().children('span').show();
			me.remove();
			return;
		}
		
		$.ajax({
			url: '/tasks/' + me.parent().children('span').attr('task_id'),
			type: 'put',
			dataType: 'json',
			data: {'task': me.val()},
			success: function(result){
				if(result.success){
					var task_text = me.val();
					me.parent().children('span').text(task_text).show();
					me.remove();
				}
			}
		})
	});
	
	//Получить с сервера выполненные задачи и добавить на макет
	function get_complete_tasks(page) {
		$.get('jtasks_complete/alexahdp/' + page, {}, function(res){
			var task_tmpl = _.template($('#complete_task_tmpl').html());
			var day_tmpl = _.template($('#work_day_tmpl').html());
			if (res.success === true) {
				$(Object.keys(res.items)).each(function(i, day) {
					$(day_tmpl({
						current: true,
						type: 'alert-success',
						date: day,
						task_tmpl: task_tmpl,
						tasks: res.items[day]
					})).appendTo('#complete-stack')
				});
			}
		}, 'json');
	}
	
	//Получить с сервера выполненные задачи и добавить на макет
	$.get('jtasks_/alexahdp', {}, function(res){
		if (res.success === true) {
			var task_tmpl = _.template($('#task_tmpl').html());
			$(res.items).each(function(i, task){
				$('#task-pull').append( task_tmpl(task) );
			});
		}
	}, 'json');
	
	
	get_complete_tasks(1);
	
	$(document).on('click', '#complete_task_pagination li', function(e){
		e.preventDefault();
		$('#complete-stack').empty();
		$(this).siblings().removeClass('active').end().addClass('active');
		get_complete_tasks($(this).text());
	});
});