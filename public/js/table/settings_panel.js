// Панель управления - выводит кнопки, переключатели на панель управления (.settings-container)

WidgetListPanelView = Backbone.View.extend({
	el: $('body'),
	events: {},
	
	initialize: function(root_el) {
		var me = this;
		me.$el = root_el;
		
		me.$el = $($('#widget_panel').html()).eq(0).appendTo('.settings-container');
		
		//
		$('.widget_list_panel .item').draggable({
			helper: 'clone',
			start: function(){
				$('.widget-container').addClass('active');
			},
			stop: function(){
				
			}
		});
		
		//
		$('.widget-container').droppable({
			accept: '.item',
			activate: function(e, ui){
				$(this).append("<div class='fictive-widget'>");
			},
			deactivate: function(e, ui){
				$(this).find(".fictive-widget").remove()
			}
		});
		
		$('.show-widget-containers').change(function(){
			$('.widget').toggleClass('active');
			if($('.show-widget-containers').is(':checked')){
				$('.widget_container_list .item').draggable({
					helper: 'clone'
				});
			}else{
				$('.widget_container_list .item').draggable('destroy');
			}
		});
		
	}
});