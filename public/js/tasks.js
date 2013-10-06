/**
 * Получить время в в виде HH:mm, минуты округляются в 10-минутном диапазоне
 */
Date.prototype.getTimeHM = function(){
	m = 10 * Math.floor(this.getMinutes() / 10);
	m = m == 0 ? '00' : m;
	minutes = this.getMinutes()==0 ? '00' : m;
	hours = this.getHours().toString();
	if (hours.length < 2) hours = '0' + hours;
	return (hours + ':' + minutes);
};

/**
 * Получить дату в виде: dd.mm.yyyy
 */
Date.prototype.getDateDMY = function(){
	monthz = parseInt(this.getMonth().toString(), 10) + 1;
	if (monthz.toString().length < 2){
		monthz = '0' + monthz;
	}
	dat = this.getDate().toString();
	if (dat.length < 2){
		dat = '0' + dat;
	}
	return (dat + '.' + monthz + "."+this.getFullYear().toString());
};

/**
 * Получить дату и время в виде: HH:mm dd.mm.yyyy
 */
Date.prototype.getDateFull = function(){
	return (this.getTimeHM()+" "+this.getDateDMY());
};


$(document).ready(function(){
	
	buffer = undefined;
	
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
				if(answ.success){
					$('#task-pull').append(
						"<li class='task'>"+
							"<span class='desc' task_id='"+answ.id+"'>"+$('#new_task').val()+"</span>"+
							"<div class='date_add'>"+new Date().getDateFull()+"</div>"+
							"<i class='task-icon task-remove-icon icon-remove'></i>"+
							"<i class='task-icon task-complete-icon icon-ok'></i>"+
						"</li>"
					);
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
				url: '/taskss',
				type: 'put',
				dataType: 'json',
				data: {'task_index': JSON.stringify(task_index)},
				success: function(result){},
				error: function(){}
			});
		}
	});
	
	
	//кнопка задача выполнена
	$('.task-complete-icon').on('click', function(){
		var task = $(this).parent();
		var id = task.children('span').attr('task_id');
		var data_t = {'complete': 1};
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
	$('.task-remove-icon').on('click', function(){
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
			url: '/tasks/complete',
			type: 'post',
			data: {task_id: id, complete: 0},
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
	$('.task span').on('dblclick', function(){
		$("<input class='edit_task_input' type='text' value='"+$(this).text()+"'/>").appendTo($(this).parent()).focus();
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
			},
			error: function(){
				
			}
		})
	});
});