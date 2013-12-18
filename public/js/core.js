/**
 * @author Pezikov Alexander <alexahdp@gmail.com>
 * @version 0.2.0
 */

'use strict';

/**
 * @namespace Глобальное пространство имен для всего клиент-сайда
 */
var U = {};

// настройки шаблонизатора underscore
_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g,
	evaluate: /\[\[(.+?)\]\]/g
};

U.eventDispatcher = _.clone(Backbone.Events)

/**
 * Получить время в секундах с начала Linux-эпохи (perl time)
 */
Date.prototype.getTimeInSeconds = function() {
	return Math.floor(new Date().getTime() / 1000);
}

/**
 * Получить время в в виде HH:mm, минуты округляются в 10-минутном диапазоне
 */
Date.prototype.getTimeHM = function() {
	var m = this.getMinutes();
	m = m.toString().length == 1 ? '0' + m : m;
	var minutes = this.getMinutes() == 0 ? '00' : m;
	var hours = this.getHours().toString();
	if (hours.length < 2) hours = '0' + hours;
	return (hours + ':' + minutes);
};

/**
 * Получить дату в виде: dd.mm.yyyy
 */
Date.prototype.getDateDMY = function() {
	var month = parseInt(this.getMonth().toString(), 10) + 1;
	if (month.toString().length < 2) month = '0' + month;
	
	var date = this.getDate().toString();
	if (date.length < 2) date = '0' + date;
	
	return (date + '.' + month + "." + this.getFullYear().toString());
};

/**
 * Получить дату и время в виде: HH:mm dd.mm.yyyy
 */
Date.prototype.getDateFull = function() {
	return (this.getDateDMY()+" "+this.getTimeHM());
};

function log(args) {
	console.log(args);
}