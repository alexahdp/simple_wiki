//Рабочий стол - объект, управляющий всеми виджетами

Desktop = Backbone.View.extend({
	el: $('body'),
	events: {},
	
	initialize: function() {
		var me = this;
		me.$el = $('.widgets-container');
		
		me.collection = new WidgetList();
		me.collection.bind('add', this.appendWidget, this);
		
		var user_widgets = [
			{options: { width: 'span6',  widget: null }},
			{options: { width: 'span12', widget: 'tasks_user' }},
			{options: { width: 'span6',  widget: null }},
			{options: { width: 'span3',  widget: null }}
		];
		
		$(user_widgets).each(function(i, li) {
			me.addWidget(li.options);
		});
		
		//this.layout = {
		//	cells: [
		//		{id: 'tasks-complete',   wClass: 'span2', options: {exec: ['alex']}},
		//		{id: null, wClass: 'span2'},
		//	]
		//};
		
		
		
		
		//me.$el = $($('#desktop_template').html()).eq(0).appendTo('.widget-container');
		me.$el = $('.widget-container');
		
		
		this.render();
		
		$(document).on('click', '.widget', function(e){
			if($(e.target).hasClass('close')){
				$(this).remove();
			}else if($(e.target).hasClass('widget-menu')){
				$('#widget-settings-modal').modal()
			}
		});
		
		$('.containers-list li').draggable({
			helper: 'clone',
			start: function(e, ui){
				$('.widget-container').addClass('active');
			},
			stop: function(e, ui){}
		});
		
		
		$('.widgets-list li').draggable({
			helper: 'clone',
			start: function(e, ui){
				$('.widget-container').addClass('active');
			},
			stop: function(e, ui){
				$('.widget-container').removeClass('active');
			}
		});
		
		
		$('.widget-container').droppable({
			accept: '.prototype',
			activate: function(e, ui) {
			},
			deactivate: function(e, ui) {
				$(this).find(".fictive-widget").remove()
			},
			drop: function(e, ui) {
				me.appendWidget({widget: null, width: $(ui.draggable).attr('data-width')})
				$('.widget-container').sortable( "refresh" );
				//getLayout();
			}
		});
	},
	
	render: function() {
		var me = this;
		
		$(me.$el).droppable({
			accept: '.item',
			activeClass: 'active',
			drop: function(e, ui) {
				var widget_data = Widgets[$(ui.draggable).attr('data-widget')];
				var attrs = {id: widget_data.id, options: widget_data.options};
				var widget = new Widget(attrs);
				widget.save(attrs, {
					success: function(model, response) {
						me.appendWidget(widget);
					}
				});
			}
		});
		
		//$(me.layout.cells).each(function(i, li){
		//	var wc = me.$el.append("<div class='widget-container "+ li.wClass +"'>");
		//	if (li.id !== null) {
		//		me.collection.add(li);
		//		//me.appendWidget( me.collection.get(li.widget_id) );
		//	}
		//});
		
		//_(this.collection.models).each(function(widget) {
		//	me.appendWidget(widget);
		//}, this);
	},
	
	addWidget: function(options) {
		var tmpl = _.template($('#widget-tmpl').html());
		var el = $(tmpl(options)).appendTo('.widget-container');
		$('.widget-settings', el).toolbar({
			content: '#widget-settings-options', 
			position: 'right'
		});
		//Widgets[widget.id].create(el, widget.get('options'));
	},
	
	appendWidget: function(widget) {
		//var widget_container = $("<div>").addClass(widget.get('options').width).appendTo(this.$el);
		//Widgets[widget.id].create(widget_container, widget.get('options'));
		this.addWidget(widget);
		var layout = this.getLayout();
		console.log(layout);
	},
	
	getLayout: function() {
		layout = [];
		$('.widget-container > .widget').each(function(i, li) {
			var o = {};
			o.options = {width: $(li).attr('data-width')};
			layout.push(o);
		});
		return layout;
	}
});