WidgetListPanelView = Backbone.View.extend({
	el: $('body'),
	events: {},
	
	initialize: function(root_el) {
		var me = this;
		me.$el = root_el;
		
		me.$el = $($('#widget_panel').html()).eq(0).appendTo(root_el);
		
		$('.widget_list_panel .item').draggable({
			helper: 'clone'
		});
		
		$('.containers_list .item').draggable({
			helper: 'clone',
			start: function() {
				$('.widget-container').addClass('active');
			},
			stop: function() {
				$('.widget-container').removeClass('active');
			}
		});
		
		this.render();
		
		////сортировка задач в стэке
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
		var me = this;
	}
});