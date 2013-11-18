_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g,
	evaluate: /\[\[(.+?)\]\]/g
};

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
	return (this.getDateDMY()+" "+this.getTimeHM());
};