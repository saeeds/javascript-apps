; (function ($) { // Hide scope, no $ conflict
	'use strict';
	function Calendars() {
		this.regionalOptions = [];
		/** Localised values.
			@memberof Calendars
			@property {string} [invalidCalendar='Calendar {0} not found']
				Error message for an unknown calendar.
			@property {string} [invalidDate='Invalid {0} date']
				Error message for an invalid date for this calendar.
			@property {string} [invalidMonth='Invalid {0} month']
				Error message for an invalid month for this calendar.
			@property {string} [invalidYear='Invalid {0} year']
				Error message for an invalid year for this calendar.
			@property {string} [differentCalendars='Cannot mix {0} and {1} dates']
				Error message for mixing different calendars. */
		this.regionalOptions[''] = {
			invalidCalendar: 'Calendar {0} not found',
			invalidDate: 'Invalid {0} date',
			invalidMonth: 'Invalid {0} month',
			invalidYear: 'Invalid {0} year',
			differentCalendars: 'Cannot mix {0} and {1} dates'
		};
		this.local = this.regionalOptions[''];
		this.calendars = {};
		this._localCals = {};
	}
	/** Create the calendars plugin.
		<p>Provides support for various world calendars in a consistent manner.</p>
		<p>Use the global instance, <code>$.calendars</code>, to access the functionality.</p>
		@class Calendars
		@example $.calendars.instance('julian').newDate(2014, 12, 25) */
	Calendars.prototype = {

		/** Obtain a calendar implementation and localisation.
			@memberof Calendars
			@param {string} [name='gregorian'] The name of the calendar, e.g. 'gregorian', 'persian', 'islamic'.
			@param {string} [language=''] The language code to use for localisation (default is English).
			@return {Calendar} The calendar and localisation.
			@throws Error if calendar not found.
			@example $.calendars.instance()
$.calendars.instance('persian')
$.calendars.instance('hebrew', 'he') */
		instance: function (name, language) {
			name = (name || 'gregorian').toLowerCase();
			language = language || '';
			var cal = this._localCals[name + '-' + language];
			if (!cal && this.calendars[name]) {
				cal = new this.calendars[name](language);
				this._localCals[name + '-' + language] = cal;
			}
			if (!cal) {
				throw (this.local.invalidCalendar || this.regionalOptions[''].invalidCalendar).
					replace(/\{0\}/, name);
			}
			return cal;
		},

		/** Create a new date - for today if no other parameters given.
			@memberof Calendars
			@param {CDate|number} [year] The date to copy or the year for the date.
			@param {number} [month] The month for the date (if numeric <code>year</code> specified above).
			@param {number} [day] The day for the date (if numeric <code>year</code> specified above).
			@param {BaseCalendar|string} [calendar='gregorian'] The underlying calendar or the name of the calendar.
			@param {string} [language=''] The language to use for localisation (default English).
			@return {CDate} The new date.
			@throws Error if an invalid date.
			@example $.calendars.newDate()
$.calendars.newDate(otherDate)
$.calendars.newDate(2001, 1, 1)
$.calendars.newDate(1379, 10, 12, 'persian') */
		newDate: function (year, month, day, calendar, language) {
			calendar = ((typeof year !== 'undefined' && year !== null) && year.year ? year.calendar() :
				(typeof calendar === 'string' ? this.instance(calendar, language) : calendar)) || this.instance();
			return calendar.newDate(year, month, day);
		},

		/** A simple digit substitution function for localising numbers via the
			{@linkcode GregorianCalendar.regionalOptions|Calendar digits} option.
			@memberof Calendars
			@param {string[]} digits The substitute digits, for 0 through 9.
			@return {CalendarsDigits} The substitution function.
			@example digits: $.calendars.substituteDigits(['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']) */
		substituteDigits: function (digits) {
			return function (value) {
				return (value + '').replace(/[0-9]/g, function (digit) {
					return digits[digit];
				});
			};
		},

		/** Digit substitution function for localising Chinese style numbers via the
			{@linkcode GregorianCalendar.regionalOptions|Calendar digits} option.
			@memberof Calendars
			@param {string[]} digits The substitute digits, for 0 through 9.
			@param {string[]} powers The characters denoting powers of 10, i.e. 1, 10, 100, 1000.
			@return {CalendarsDigits} The substitution function.
			@example digits: $.calendars.substituteChineseDigits(
  ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'], ['', '十', '百', '千']) */
		substituteChineseDigits: function (digits, powers) {
			return function (value) {
				var localNumber = '';
				var power = 0;
				while (value > 0) {
					var units = value % 10;
					localNumber = (units === 0 ? '' : digits[units] + powers[power]) + localNumber;
					power++;
					value = Math.floor(value / 10);
				}
				if (localNumber.indexOf(digits[1] + powers[1]) === 0) {
					localNumber = localNumber.substr(1);
				}
				return localNumber || digits[0];
			};
		}
	};
	/** Generic date, based on a particular calendar.
		@class CDate
		@param {BaseCalendar} calendar The underlying calendar implementation.
		@param {number} year The year for this date.
		@param {number} month The month for this date.
		@param {number} day The day for this date.
		@return {CDate} The date object.
		@throws Error if an invalid date. */
	function CDate(calendar, year, month, day) {
		this._calendar = calendar;
		this._year = year;
		this._month = month;
		this._day = day;
		if (this._calendar._validateLevel === 0 &&
			!this._calendar.isValid(this._year, this._month, this._day)) {
			throw ($.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate).
				replace(/\{0\}/, this._calendar.local.name);
		}
	}
	/** Pad a numeric value with leading zeroes.
		@private
		@param {number} value The number to format.
		@param {number} length The minimum length.
		@return {string} The formatted number. */
	function pad(value, length) {
		value = '' + value;
		return '000000'.substring(0, length - value.length) + value;
	}
	CDate.prototype = {

		/** Create a new date.
			@memberof CDate
			@param {CDate|number} [year] The date to copy or the year for the date (default to this date).
			@param {number} [month] The month for the date (if numeric <code>year</code> specified above).
			@param {number} [day] The day for the date (if numeric <code>year</code> specified above).
			@return {CDate} The new date.
			@throws Error if an invalid date.
			@example date.newDate()
date.newDate(otherDate)
date.newDate(2001, 1, 1) */
		newDate: function (year, month, day) {
			return this._calendar.newDate((typeof year === 'undefined' || year === null ? this : year), month, day);
		},

		/** Set or retrieve the year for this date.
			@memberof CDate
			@param {number} [year] The year for the date.
			@return {number|CDate} The date's year (if no parameter) or the updated date.
			@throws Error if an invalid date.
			@example date.year(2001)
var year = date.year() */
		year: function (year) {
			return (arguments.length === 0 ? this._year : this.set(year, 'y'));
		},

		/** Set or retrieve the month for this date.
			@memberof CDate
			@param {number} [month] The month for the date.
			@return {number|CDate} The date's month (if no parameter) or the updated date.
			@throws Error if an invalid date.
			@example date.month(1)
var month = date.month() */
		month: function (month) {
			return (arguments.length === 0 ? this._month : this.set(month, 'm'));
		},

		/** Set or retrieve the day for this date.
			@memberof CDate
			@param {number} [day] The day for the date.
			@return {number|CData} The date's day (if no parameter) or the updated date.
			@throws Error if an invalid date.
			@example date.day(1)
var day = date.day() */
		day: function (day) {
			return (arguments.length === 0 ? this._day : this.set(day, 'd'));
		},

		/** Set new values for this date.
			@memberof CDate
			@param {number} year The year for the date.
			@param {number} month The month for the date.
			@param {number} day The day for the date.
			@return {CDate} The updated date.
			@throws Error if an invalid date.
			@example date.date(2001, 1, 1) */
		date: function (year, month, day) {
			if (!this._calendar.isValid(year, month, day)) {
				throw ($.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate).
					replace(/\{0\}/, this._calendar.local.name);
			}
			this._year = year;
			this._month = month;
			this._day = day;
			return this;
		},

		/** Determine whether this date is in a leap year.
			@memberof CDate
			@return {boolean} <code>true</code> if this is a leap year, <code>false</code> if not.
			@example if (date.leapYear()) ...*/
		leapYear: function () {
			return this._calendar.leapYear(this);
		},

		/** Retrieve the epoch designator for this date, e.g. BCE or CE.
			@memberof CDate
			@return {string} The current epoch.
			@example var epoch = date.epoch() */
		epoch: function () {
			return this._calendar.epoch(this);
		},

		/** Format the year, if not a simple sequential number.
			@memberof CDate
			@return {string} The formatted year.
			@example var year = date.formatYear() */
		formatYear: function () {
			return this._calendar.formatYear(this);
		},

		/** Retrieve the month of the year for this date,
			i.e. the month's position within a numbered year.
			@memberof CDate
			@return {number} The month of the year: <code>minMonth</code> to months per year.
			@example var month = date.monthOfYear() */
		monthOfYear: function () {
			return this._calendar.monthOfYear(this);
		},

		/** Retrieve the week of the year for this date.
			@memberof CDate
			@return {number} The week of the year: 1 to weeks per year.
			@example var week = date.weekOfYear() */
		weekOfYear: function () {
			return this._calendar.weekOfYear(this);
		},

		/** Retrieve the number of days in the year for this date.
			@memberof CDate
			@return {number} The number of days in this year.
			@example var days = date.daysInYear() */
		daysInYear: function () {
			return this._calendar.daysInYear(this);
		},

		/** Retrieve the day of the year for this date.
			@memberof CDate
			@return {number} The day of the year: 1 to days per year.
			@example var doy = date.dayOfYear() */
		dayOfYear: function () {
			return this._calendar.dayOfYear(this);
		},

		/** Retrieve the number of days in the month for this date.
			@memberof CDate
			@return {number} The number of days.
			@example var days = date.daysInMonth() */
		daysInMonth: function () {
			return this._calendar.daysInMonth(this);
		},

		/** Retrieve the day of the week for this date.
			@memberof CDate
			@return {number} The day of the week: 0 to number of days - 1.
			@example var dow = date.dayOfWeek() */
		dayOfWeek: function () {
			return this._calendar.dayOfWeek(this);
		},

		/** Determine whether this date is a week day.
			@memberof CDate
			@return {boolean} <code>true</code> if a week day, <code>false</code> if not.
			@example if (date.weekDay()) ... */
		weekDay: function () {
			return this._calendar.weekDay(this);
		},

		/** Retrieve additional information about this date.
			@memberof CDate
			@return {object} Additional information - contents depends on calendar.
			@example var info = date.extraInfo() */
		extraInfo: function () {
			return this._calendar.extraInfo(this);
		},

		/** Add period(s) to a date.
			@memberof CDate
			@param {number} offset The number of periods to adjust by.
			@param {string} period One of 'y' for years, 'm' for months, 'w' for weeks, 'd' for days.
			@return {CDate} The updated date.
			@example date.add(10, 'd') */
		add: function (offset, period) {
			return this._calendar.add(this, offset, period);
		},

		/** Set a portion of the date.
			@memberof CDate
			@param {number} value The new value for the period.
			@param {string} period One of 'y' for year, 'm' for month, 'd' for day.
			@return {CDate} The updated date.
			@throws Error if not a valid date.
			@example date.set(10, 'd') */
		set: function (value, period) {
			return this._calendar.set(this, value, period);
		},

		/** Compare this date to another date.
			@memberof CDate
			@param {CDate} date The other date.
			@return {number} -1 if this date is before the other date,
					0 if they are equal, or +1 if this date is after the other date.
			@example if (date1.compareTo(date2) < 0) ... */
		compareTo: function (date) {
			if (this._calendar.name !== date._calendar.name) {
				throw ($.calendars.local.differentCalendars || $.calendars.regionalOptions[''].differentCalendars).
					replace(/\{0\}/, this._calendar.local.name).replace(/\{1\}/, date._calendar.local.name);
			}
			var c = (this._year !== date._year ? this._year - date._year :
				this._month !== date._month ? this.monthOfYear() - date.monthOfYear() :
					this._day - date._day);
			return (c === 0 ? 0 : (c < 0 ? -1 : +1));
		},

		/** Retrieve the calendar backing this date.
			@memberof CDate
			@return {BaseCalendar} The calendar implementation.
			@example var cal = date.calendar() */
		calendar: function () {
			return this._calendar;
		},

		/** Retrieve the Julian date equivalent for this date,
			i.e. days since January 1, 4713 BCE Greenwich noon.
			@memberof CDate
			@return {number} The equivalent Julian date.
			@example var jd = date.toJD() */
		toJD: function () {
			return this._calendar.toJD(this);
		},

		/** Create a new date from a Julian date.
			@memberof CDate
			@param {number} jd The Julian date to convert.
			@return {CDate} The equivalent date.
			@example var date2 = date1.fromJD(jd) */
		fromJD: function (jd) {
			return this._calendar.fromJD(jd);
		},

		/** Convert this date to a standard (Gregorian) JavaScript Date.
			@memberof CDate
			@return {Date} The equivalent JavaScript date.
			@example var jsd = date.toJSDate() */
		toJSDate: function () {
			return this._calendar.toJSDate(this);
		},

		/** Create a new date from a standard (Gregorian) JavaScript Date.
			@memberof CDate
			@param {Date} jsd The JavaScript date to convert.
			@return {CDate} The equivalent date.
			@example var date2 = date1.fromJSDate(jsd) */
		fromJSDate: function (jsd) {
			return this._calendar.fromJSDate(jsd);
		},

		/** Convert to a string for display.
			@memberof CDate
			@return {string} This date as a string. */
		toString: function () {
			return (this.year() < 0 ? '-' : '') + pad(Math.abs(this.year()), 4) +
				'-' + pad(this.month(), 2) + '-' + pad(this.day(), 2);
		}
	};
	/** Basic functionality for all calendars.
		Other calendars should extend this:
		<pre>OtherCalendar.prototype = new BaseCalendar();</pre>
		@class BaseCalendar */
	function BaseCalendar() {
		this.shortYearCutoff = '+10';
	}
	BaseCalendar.prototype = {
		_validateLevel: 0, // "Stack" to turn validation on/off

		/** Create a new date within this calendar - today if no parameters given.
			@memberof BaseCalendar
			@param {CDate|number} year The date to duplicate or the year for the date.
			@param {number} [month] The month for the date (if numeric <code>year</code> specified above).
			@param {number} [day] The day for the date (if numeric <code>year</code> specified above).
			@return {CDate} The new date.
			@throws Error if not a valid date or a different calendar is used.
			@example var date = calendar.newDate(2014, 1, 26)
var date2 = calendar.newDate(date1)
var today = calendar.newDate() */
		newDate: function (year, month, day) {
			if (typeof year === 'undefined' || year === null) {
				return this.today();
			}
			if (year.year) {
				this._validate(year, month, day,
					$.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate);
				day = year.day();
				month = year.month();
				year = year.year();
			}
			return new CDate(this, year, month, day);
		},

		/** Create a new date for today.
			@memberof BaseCalendar
			@return {CDate} Today's date.
			@example var today = calendar.today() */
		today: function () {
			return this.fromJSDate(new Date());
		},

		/** Retrieve the epoch designator for this date.
			@memberof BaseCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@return {string} The current epoch.
			@throws Error if an invalid year or a different calendar is used.
			@example var epoch = calendar.epoch(date) 
var epoch = calendar.epoch(2014) */
		epoch: function (year) {
			var date = this._validate(year, this.minMonth, this.minDay,
				$.calendars.local.invalidYear || $.calendars.regionalOptions[''].invalidYear);
			return (date.year() < 0 ? this.local.epochs[0] : this.local.epochs[1]);
		},

		/** Format the year, if not a simple sequential number
			@memberof BaseCalendar
			@param {CDate|number} year The date to format or the year to format.
			@return {string} The formatted year.
			@throws Error if an invalid year or a different calendar is used.
			@example var year = calendar.formatYear(date)
var year = calendar.formatYear(2014) */
		formatYear: function (year) {
			var date = this._validate(year, this.minMonth, this.minDay,
				$.calendars.local.invalidYear || $.calendars.regionalOptions[''].invalidYear);
			return (date.year() < 0 ? '-' : '') + pad(Math.abs(date.year()), 4);
		},

		/** Retrieve the number of months in a year.
			@memberof BaseCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@return {number} The number of months.
			@throws Error if an invalid year or a different calendar is used.
			@example var months = calendar.monthsInYear(date)
var months = calendar.monthsInYear(2014) */
		monthsInYear: function (year) {
			this._validate(year, this.minMonth, this.minDay,
				$.calendars.local.invalidYear || $.calendars.regionalOptions[''].invalidYear);
			return 12;
		},

		/** Calculate the month's ordinal position within the year -
			for those calendars that don't start at month 1!
			@memberof BaseCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@param {number} [month] The month to examine (if numeric <code>year</code> specified above).
			@return {number} The ordinal position, starting from <code>minMonth</code>.
			@throws Error if an invalid year/month or a different calendar is used.
			@example var pos = calendar.monthOfYear(date)
var pos = calendar.monthOfYear(2014, 7) */
		monthOfYear: function (year, month) {
			var date = this._validate(year, month, this.minDay,
				$.calendars.local.invalidMonth || $.calendars.regionalOptions[''].invalidMonth);
			return (date.month() + this.monthsInYear(date) - this.firstMonth) %
				this.monthsInYear(date) + this.minMonth;
		},

		/** Calculate actual month from ordinal position, starting from <code>minMonth</code>.
			@memberof BaseCalendar
			@param {number} year The year to examine.
			@param {number} ord The month's ordinal position.
			@return {number} The month's number.
			@throws Error if an invalid year/month.
			@example var month = calendar.fromMonthOfYear(2014, 7) */
		fromMonthOfYear: function (year, ord) {
			var m = (ord + this.firstMonth - 2 * this.minMonth) %
				this.monthsInYear(year) + this.minMonth;
			this._validate(year, m, this.minDay,
				$.calendars.local.invalidMonth || $.calendars.regionalOptions[''].invalidMonth);
			return m;
		},

		/** Retrieve the number of days in a year.
			@memberof BaseCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@return {number} The number of days.
			@throws Error if an invalid year or a different calendar is used.
			@example var days = calendar.daysInYear(date)
var days = calendar.daysInYear(2014) */
		daysInYear: function (year) {
			var date = this._validate(year, this.minMonth, this.minDay,
				$.calendars.local.invalidYear || $.calendars.regionalOptions[''].invalidYear);
			return (this.leapYear(date) ? 366 : 365);
		},

		/** Retrieve the day of the year for a date.
			@memberof BaseCalendar
			@param {CDate|number} year The date to convert or the year to convert.
			@param {number} [month] The month to convert (if numeric <code>year</code> specified above).
			@param {number} [day] The day to convert (if numeric <code>year</code> specified above).
			@return {number} The day of the year: 1 to days per year.
			@throws Error if an invalid date or a different calendar is used.
			@example var doy = calendar.dayOfYear(date)
var doy = calendar.dayOfYear(2014, 7, 1) */
		dayOfYear: function (year, month, day) {
			var date = this._validate(year, month, day,
				$.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate);
			return date.toJD() - this.newDate(date.year(),
				this.fromMonthOfYear(date.year(), this.minMonth), this.minDay).toJD() + 1;
		},

		/** Retrieve the number of days in a week.
			@memberof BaseCalendar
			@return {number} The number of days.
			@example var days = calendar.daysInWeek() */
		daysInWeek: function () {
			return 7;
		},

		/** Retrieve the day of the week for a date.
			@memberof BaseCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@param {number} [month] The month to examine (if numeric <code>year</code> specified above).
			@param {number} [day] The day to examine (if numeric <code>year</code> specified above).
			@return {number} The day of the week: 0 to number of days - 1.
			@throws Error if an invalid date or a different calendar is used.
			@example var dow = calendar.dayOfWeek(date)
var dow = calendar.dayOfWeek(2014, 1, 26) */
		dayOfWeek: function (year, month, day) {
			var date = this._validate(year, month, day,
				$.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate);
			return (Math.floor(this.toJD(date)) + 2) % this.daysInWeek();
		},

		/** Retrieve additional information about a date.
			@memberof BaseCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@param {number} [month] The month to examine (if numeric <code>year</code> specified above).
			@param {number} [day] The day to examine (if numeric <code>year</code> specified above).
			@return {object} Additional information - content depends on calendar.
			@throws Error if an invalid date or a different calendar is used.
			@example var info = calendar.extraInfo(date)
var info = calendar.extraInfo(2014, 1, 26) */
		extraInfo: function (year, month, day) {
			this._validate(year, month, day,
				$.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate);
			return {};
		},

		/** Add period(s) to a date.
			Cater for no year zero.
			@memberof BaseCalendar
			@param {CDate} date The starting date.
			@param {number} offset The number of periods to adjust by.
			@param {string} period One of 'y' for years, 'm' for months, 'w' for weeks, 'd' for days.
			@return {CDate} The updated date.
			@throws Error if a different calendar is used.
			@example calendar.add(date, 10, 'd') */
		add: function (date, offset, period) {
			this._validate(date, this.minMonth, this.minDay,
				$.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate);
			return this._correctAdd(date, this._add(date, offset, period), offset, period);
		},

		/** Add period(s) to a date.
			@memberof BaseCalendar
			@private
			@param {CDate} date The starting date.
			@param {number} offset The number of periods to adjust by.
			@param {string} period One of 'y' for years, 'm' for months, 'w' for weeks, 'd' for days.
			@return {number[]} The updated date as year, month, and day. */
		_add: function (date, offset, period) {
			this._validateLevel++;
			var d;
			if (period === 'd' || period === 'w') {
				var jd = date.toJD() + offset * (period === 'w' ? this.daysInWeek() : 1);
				d = date.calendar().fromJD(jd);
				this._validateLevel--;
				return [d.year(), d.month(), d.day()];
			}
			try {
				var y = date.year() + (period === 'y' ? offset : 0);
				var m = date.monthOfYear() + (period === 'm' ? offset : 0);
				d = date.day();
				var resyncYearMonth = function (calendar) {
					while (m < calendar.minMonth) {
						y--;
						m += calendar.monthsInYear(y);
					}
					var yearMonths = calendar.monthsInYear(y);
					while (m > yearMonths - 1 + calendar.minMonth) {
						y++;
						m -= yearMonths;
						yearMonths = calendar.monthsInYear(y);
					}
				};
				if (period === 'y') {
					if (date.month() !== this.fromMonthOfYear(y, m)) { // Hebrew
						m = this.newDate(y, date.month(), this.minDay).monthOfYear();
					}
					m = Math.min(m, this.monthsInYear(y));
					d = Math.min(d, this.daysInMonth(y, this.fromMonthOfYear(y, m)));
				}
				else if (period === 'm') {
					resyncYearMonth(this);
					d = Math.min(d, this.daysInMonth(y, this.fromMonthOfYear(y, m)));
				}
				var ymd = [y, this.fromMonthOfYear(y, m), d];
				this._validateLevel--;
				return ymd;
			}
			catch (e) {
				this._validateLevel--;
				throw e;
			}
		},

		/** Correct a candidate date after adding period(s) to a date.
			Handle no year zero if necessary.
			@memberof BaseCalendar
			@private
			@param {CDate} date The starting date.
			@param {number[]} ymd The added date.
			@param {number} offset The number of periods to adjust by.
			@param {string} period One of 'y' for years, 'm' for months, 'w' for weeks, 'd' for days.
			@return {CDate} The updated date. */
		_correctAdd: function (date, ymd, offset, period) {
			if (!this.hasYearZero && (period === 'y' || period === 'm')) {
				if (ymd[0] === 0 || // In year zero
					(date.year() > 0) !== (ymd[0] > 0)) { // Crossed year zero
					var adj = {
						y: [1, 1, 'y'], m: [1, this.monthsInYear(-1), 'm'],
						w: [this.daysInWeek(), this.daysInYear(-1), 'd'],
						d: [1, this.daysInYear(-1), 'd']
					}[period];
					var dir = (offset < 0 ? -1 : +1);
					ymd = this._add(date, offset * adj[0] + dir * adj[1], adj[2]);
				}
			}
			return date.date(ymd[0], ymd[1], ymd[2]);
		},

		/** Set a portion of the date.
			@memberof BaseCalendar
			@param {CDate} date The starting date.
			@param {number} value The new value for the period.
			@param {string} period One of 'y' for year, 'm' for month, 'd' for day.
			@return {CDate} The updated date.
			@throws Error if an invalid date or a different calendar is used.
			@example calendar.set(date, 10, 'd') */
		set: function (date, value, period) {
			this._validate(date, this.minMonth, this.minDay,
				$.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate);
			var y = (period === 'y' ? value : date.year());
			var m = (period === 'm' ? value : date.month());
			var d = (period === 'd' ? value : date.day());
			if (period === 'y' || period === 'm') {
				d = Math.min(d, this.daysInMonth(y, m));
			}
			return date.date(y, m, d);
		},

		/** Determine whether a date is valid for this calendar.
			@memberof BaseCalendar
			@param {number} year The year to examine.
			@param {number} month The month to examine.
			@param {number} day The day to examine.
			@return {boolean} <code>true</code> if a valid date, <code>false</code> if not.
			@example if (calendar.isValid(2014, 2, 31)) ... */
		isValid: function (year, month, day) {
			this._validateLevel++;
			var valid = (this.hasYearZero || year !== 0);
			if (valid) {
				var date = this.newDate(year, month, this.minDay);
				valid = (month >= this.minMonth && month - this.minMonth < this.monthsInYear(date)) &&
					(day >= this.minDay && day - this.minDay < this.daysInMonth(date));
			}
			this._validateLevel--;
			return valid;
		},

		/** Convert the date to a standard (Gregorian) JavaScript Date.
			@memberof BaseCalendar
			@param {CDate|number} year The date to convert or the year to convert.
			@param {number} [month] The month to convert (if numeric <code>year</code> specified above).
			@param {number} [day] The day to convert (if numeric <code>year</code> specified above).
			@return {Date} The equivalent JavaScript date.
			@throws Error if an invalid date or a different calendar is used.
			@example var jsd = calendar.toJSDate(date)
var jsd = calendar.toJSDate(2014, 1, 26) */
		toJSDate: function (year, month, day) {
			var date = this._validate(year, month, day,
				$.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate);
			return $.calendars.instance().fromJD(this.toJD(date)).toJSDate();
		},

		/** Convert the date from a standard (Gregorian) JavaScript Date.
			@memberof BaseCalendar
			@param {Date} jsd The JavaScript date.
			@return {CDate} The equivalent calendar date.
			@example var date = calendar.fromJSDate(jsd) */
		fromJSDate: function (jsd) {
			return this.fromJD($.calendars.instance().fromJSDate(jsd).toJD());
		},

		/** Check that a candidate date is from the same calendar and is valid.
			@memberof BaseCalendar
			@private
			@param {CDate|number} year The date to validate or the year to validate.
			@param {number} [month] The month to validate (if numeric <code>year</code> specified above).
			@param {number} [day] The day to validate (if numeric <code>year</code> specified above).
			@param {string} error Error message if invalid.
			@throws Error if an invalid date or a different calendar is used. */
		_validate: function (year, month, day, error) {
			if (year.year) {
				if (this._validateLevel === 0 && this.name !== year.calendar().name) {
					throw ($.calendars.local.differentCalendars || $.calendars.regionalOptions[''].differentCalendars).
						replace(/\{0\}/, this.local.name).replace(/\{1\}/, year.calendar().local.name);
				}
				return year;
			}
			try {
				this._validateLevel++;
				if (this._validateLevel === 1 && !this.isValid(year, month, day)) {
					throw error.replace(/\{0\}/, this.local.name);
				}
				var date = this.newDate(year, month, day);
				this._validateLevel--;
				return date;
			}
			catch (e) {
				this._validateLevel--;
				throw e;
			}
		}
	};
	// Singleton manager
	$.calendars = new Calendars();
	// Date template
	$.calendars.cdate = CDate;
	// Base calendar template
	$.calendars.baseCalendar = BaseCalendar;

})(window);

(function ($) {
	// function for extending a class
	function extend(base, constructor) {
		var prototype = new Function();
		prototype.prototype = base.prototype;
		constructor.prototype = new prototype();
		constructor.prototype.constructor = constructor;
	}
	/** Implementation of the Proleptic Gregorian Calendar.
	See <a href=":http://en.wikipedia.org/wiki/Gregorian_calendar">http://en.wikipedia.org/wiki/Gregorian_calendar</a>
	and <a href="http://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar">http://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar</a>.
	@class GregorianCalendar
	@augments BaseCalendar
	@param {string} [language=''] The language code (default English) for localisation. */
	function GregorianCalendar(language) {
		$.calendars.baseCalendar.call(this);
		this.local = this.regionalOptions[language] || this.regionalOptions[''];
	}
	extend($.calendars.baseCalendar, GregorianCalendar);
	/** The calendar name.
			@memberof GregorianCalendar */
	GregorianCalendar.prototype.name = 'Gregorian';
    /** Julian date of start of Gregorian epoch: 1 January 0001 CE.
			@memberof GregorianCalendar */
	GregorianCalendar.prototype.jdEpoch = '1721425.5';
    /** Days per month in a common year.
			@memberof GregorianCalendar */
	GregorianCalendar.prototype.daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	/** <code>true</code> if has a year zero, <code>false</code> if not.
			@memberof GregorianCalendar */
	GregorianCalendar.prototype.hasYearZero = false;
	/** The minimum month number.
			@memberof GregorianCalendar */
	GregorianCalendar.prototype.minMonth = 1;
	/** The first month in the year.
		@memberof GregorianCalendar */
	GregorianCalendar.prototype.firstMonth = 1,
		/** The minimum day number.
			@memberof GregorianCalendar */
		GregorianCalendar.prototype.minDay = 1;
	/** Convert a number into a localised form.
			 @callback CalendarsDigits
			 @param {number} value The number to convert.
			 @return {string} The localised number.
			 @example digits: $.calendars.substituteDigits(['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']) */

	/** Localisations for the plugin.
		Entries are objects indexed by the language code ('' being the default US/English).
		Each object has the following attributes.
		@memberof GregorianCalendar
		@property {string} [name='Gregorian'] The calendar name.
		@property {string[]} [epochs=['BCE','CE']] The epoch names.
		@property {string[]} [monthNames=[...]] The long names of the months of the year.
		@property {string[]} [monthNamesShort=[...]] The short names of the months of the year.
		@property {string[]} [dayNames=[...]] The long names of the days of the week.
		@property {string[]} [dayNamesShort=[...]] The short names of the days of the week.
		@property {string[]} [dayNamesMin=[...]] The minimal names of the days of the week.
		@property {CalendarsDigits} [digits=null] Convert numbers to localised versions.
		@property {string} [dateFormat='mm/dd/yyyy'] The date format for this calendar.
				See the options on {@linkcode BaseCalendar.formatDate|formatDate} for details.
		@property {number} [firstDay=0] The number of the first day of the week, starting at 0.
		@property {boolean} [isRTL=false] <code>true</code> if this localisation reads right-to-left. */
	GregorianCalendar.prototype.regionalOptions = { // Localisations
		'': {
			name: 'Gregorian',
			epochs: ['BCE', 'CE'],
			monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
				'July', 'August', 'September', 'October', 'November', 'December'],
			monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			digits: null,
			dateFormat: 'mm/dd/yyyy',
			firstDay: 0,
			isRTL: false
		}
	};
	/** Determine whether this date is in a leap year.
		@memberof GregorianCalendar
		@param {CDate|number} year The date to examine or the year to examine.
		@return {boolean} <code>true</code> if this is a leap year, <code>false</code> if not.
		@throws Error if an invalid year or a different calendar is used. */
	GregorianCalendar.prototype.leapYear = function (year) {
		var date = this._validate(year, this.minMonth, this.minDay,
			$.calendars.local.invalidYear || $.calendars.regionalOptions[''].invalidYear);
		year = date.year() + (date.year() < 0 ? 1 : 0); // No year zero
		return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	};
	/** Determine the week of the year for a date - ISO 8601.
			@memberof GregorianCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@param {number} [month] The month to examine (if numeric <code>year</code> specified above).
			@param {number} [day] The day to examine (if numeric <code>year</code> specified above).
			@return {number} The week of the year, starting from 1.
			@throws Error if an invalid date or a different calendar is used. */
	GregorianCalendar.prototype.weekOfYear = function (year, month, day) {
		// Find Thursday of this week starting on Monday
		var checkDate = this.newDate(year, month, day);
		checkDate.add(4 - (checkDate.dayOfWeek() || 7), 'd');
		return Math.floor((checkDate.dayOfYear() - 1) / 7) + 1;
	};

	/** Retrieve the number of days in a month.
		@memberof GregorianCalendar
		@param {CDate|number} year The date to examine or the year of the month.
		@param {number} [month] The month (if numeric <code>year</code> specified above).
		@return {number} The number of days in this month.
		@throws Error if an invalid month/year or a different calendar is used. */
	GregorianCalendar.prototype.daysInMonth = function (year, month) {
		var date = this._validate(year, month, this.minDay,
			$.calendars.local.invalidMonth || $.calendars.regionalOptions[''].invalidMonth);
		return this.daysPerMonth[date.month() - 1] +
			(date.month() === 2 && this.leapYear(date.year()) ? 1 : 0);
	},

		/** Determine whether this date is a week day.
			@memberof GregorianCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@param {number} [month] The month to examine (if numeric <code>year</code> specified above).
			@param {number} [day] The day to examine (if numeric <code>year</code> specified above).
			@return {boolean} <code>true</code> if a week day, <code>false</code> if not.
			@throws Error if an invalid date or a different calendar is used. */
		GregorianCalendar.prototype.weekDay = function (year, month, day) {
			return (this.dayOfWeek(year, month, day) || 7) < 6;
		};

	/** Retrieve the Julian date equivalent for this date,
		i.e. days since January 1, 4713 BCE Greenwich noon.
		@memberof GregorianCalendar
		@param {CDate|number} year The date to convert or the year to convert.
		@param {number} [month] The month to convert (if numeric <code>year</code> specified above).
		@param {number} [day] The day to convert (if numeric <code>year</code> specified above).
		@return {number} The equivalent Julian date.
		@throws Error if an invalid date or a different calendar is used. */
	GregorianCalendar.prototype.toJD = function (year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate);
		year = date.year();
		month = date.month();
		day = date.day();
		if (year < 0) { year++; } // No year zero
		// Jean Meeus algorithm, "Astronomical Algorithms", 1991
		if (month < 3) {
			month += 12;
			year--;
		}
		var a = Math.floor(year / 100);
		var b = 2 - a + Math.floor(a / 4);
		return Math.floor(365.25 * (year + 4716)) +
			Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
	};

	/** Create a new date from a Julian date.
		@memberof GregorianCalendar
		@param {number} jd The Julian date to convert.
		@return {CDate} The equivalent date. */
	GregorianCalendar.prototype.fromJD = function (jd) {
		// Jean Meeus algorithm, "Astronomical Algorithms", 1991
		var z = Math.floor(jd + 0.5);
		var a = Math.floor((z - 1867216.25) / 36524.25);
		a = z + 1 + a - Math.floor(a / 4);
		var b = a + 1524;
		var c = Math.floor((b - 122.1) / 365.25);
		var d = Math.floor(365.25 * c);
		var e = Math.floor((b - d) / 30.6001);
		var day = b - d - Math.floor(e * 30.6001);
		var month = e - (e > 13.5 ? 13 : 1);
		var year = c - (month > 2.5 ? 4716 : 4715);
		if (year <= 0) { year--; } // No year zero
		return this.newDate(year, month, day);
	};

	/** Convert this date to a standard (Gregorian) JavaScript Date.
		@memberof GregorianCalendar
		@param {CDate|number} year The date to convert or the year to convert.
		@param {number} [month] The month to convert (if numeric <code>year</code> specified above).
		@param {number} [day] The day to convert (if numeric <code>year</code> specified above).
		@return {Date} The equivalent JavaScript date.
		@throws Error if an invalid date or a different calendar is used. */
	GregorianCalendar.prototype.toJSDate = function (year, month, day) {
		var date = this._validate(year, month, day,
			$.calendars.local.invalidDate || $.calendars.regionalOptions[''].invalidDate);
		var jsd = new Date(date.year(), date.month() - 1, date.day());
		jsd.setHours(0);
		jsd.setMinutes(0);
		jsd.setSeconds(0);
		jsd.setMilliseconds(0);
		// Hours may be non-zero on daylight saving cut-over:
		// > 12 when midnight changeover, but then cannot generate
		// midnight datetime, so jump to 1AM, otherwise reset.
		jsd.setHours(jsd.getHours() > 12 ? jsd.getHours() + 2 : 0);
		return jsd;
	};

	/** Create a new date from a standard (Gregorian) JavaScript Date.
		@memberof GregorianCalendar
		@param {Date} jsd The JavaScript date to convert.
		@return {CDate} The equivalent date. */
	GregorianCalendar.prototype.fromJSDate = function (jsd) {
		return this.newDate(jsd.getFullYear(), jsd.getMonth() + 1, jsd.getDate());
	};

	// Gregorian calendar implementation
	$.calendars.calendars.gregorian = GregorianCalendar;

})(window);


(function ($) { // Hide scope, no $ conflict
	'use strict';
	function extend(base, constructor) {
		var prototype = new Function();
		prototype.prototype = base.prototype;
		constructor.prototype = new prototype();
		constructor.prototype.constructor = constructor;
	}
	/** Implementation of the UmmAlQura or 'saudi' calendar.
		See also <a href="http://en.wikipedia.org/wiki/Islamic_calendar#Saudi_Arabia.27s_Umm_al-Qura_calendar">http://en.wikipedia.org/wiki/Islamic_calendar#Saudi_Arabia.27s_Umm_al-Qura_calendar</a>.
		<a href="http://www.ummulqura.org.sa/About.aspx">http://www.ummulqura.org.sa/About.aspx</a>
		<a href="http://www.staff.science.uu.nl/~gent0113/islam/ummalqura.htm">http://www.staff.science.uu.nl/~gent0113/islam/ummalqura.htm</a>
		@class UmmAlQuraCalendar
		@param {string} [language=''] The language code (default English) for localisation. */
	function UmmAlQuraCalendar(language) {
		$.calendars.baseCalendar.call(this);
		this.local = this.regionalOptions[language || ''] || this.regionalOptions[''];
	}
	extend($.calendars.baseCalendar, UmmAlQuraCalendar);

	/** The calendar name.
			@memberof UmmAlQuraCalendar */
	UmmAlQuraCalendar.prototype.name = 'UmmAlQura';
	//jdEpoch: 1948440, // Julian date of start of UmmAlQura epoch: 14 March 1937 CE
	//daysPerMonth: // Days per month in a common year, replaced by a method.
	/** <code>true</code> if has a year zero, <code>false</code> if not.
		@memberof UmmAlQuraCalendar */
	UmmAlQuraCalendar.prototype.hasYearZero = false;
	/** The minimum month number.
		@memberof UmmAlQuraCalendar */
	UmmAlQuraCalendar.prototype.minMonth = 1;
	/** The first month in the year.
		@memberof UmmAlQuraCalendar */
	UmmAlQuraCalendar.prototype.firstMonth = 1;
	/** The minimum day number.
		@memberof UmmAlQuraCalendar */
	UmmAlQuraCalendar.prototype.minDay = 1;

	/** Localisations for the plugin.
		Entries are objects indexed by the language code ('' being the default US/English).
		Each object has the following attributes.
		@memberof UmmAlQuraCalendar
		@property {string} name The calendar name.
		@property {string[]} epochs The epoch names (before/after year 0).
		@property {string[]} monthNames The long names of the months of the year.
		@property {string[]} monthNamesShort The short names of the months of the year.
		@property {string[]} dayNames The long names of the days of the week.
		@property {string[]} dayNamesShort The short names of the days of the week.
		@property {string[]} dayNamesMin The minimal names of the days of the week.
		@property {string} dateFormat The date format for this calendar.
				See the options on <a href="BaseCalendar.html#formatDate"><code>formatDate</code></a> for details.
		@property {number} firstDay The number of the first day of the week, starting at 0.
		@property {boolean} isRTL <code>true</code> if this localisation reads right-to-left. */
	UmmAlQuraCalendar.prototype.regionalOptions = { // Localisations
		'': {
			name: 'Umm al-Qura',
			epochs: ['BH', 'AH'],
			monthNames: ['Al-Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' Al-Thani', 'Jumada Al-Awwal', 'Jumada Al-Thani',
				'Rajab', 'Sha\'aban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'],
			monthNamesShort: ['Muh', 'Saf', 'Rab1', 'Rab2', 'Jum1', 'Jum2', 'Raj', 'Sha\'', 'Ram', 'Shaw', 'DhuQ', 'DhuH'],
			dayNames: ['Yawm al-Ahad', 'Yawm al-Ithnain', 'Yawm al-Thalāthā’', 'Yawm al-Arba‘ā’', 'Yawm al-Khamīs', 'Yawm al-Jum‘a', 'Yawm al-Sabt'],
			dayNamesShort: ['Ahd', 'Ith', 'Thu', 'Arb', 'Khm', 'Jum', 'Sbt'],
			dayNamesMin: ['Ah', 'Ith', 'Th', 'Ar', 'Kh', 'Ju', 'Sa'],
			digits: null,
			dateFormat: 'yyyy/mm/dd',
			firstDay: 6,
			isRTL: true
		}
	};

	/** Determine whether this date is in a leap year.
		@memberof UmmAlQuraCalendar
		@param {CDate|number} year The date to examine or the year to examine.
		@return {boolean} <code>true</code> if this is a leap year, <code>false</code> if not.
		@throws Error if an invalid year or a different calendar used. */
	UmmAlQuraCalendar.prototype.leapYear = function (year) {
		var date = this._validate(year, this.minMonth, this.minDay, $.calendars.local.invalidYear);
		return (this.daysInYear(date.year()) === 355);
	};

	/** Determine the week of the year for a date.
		@memberof UmmAlQuraCalendar
		@param {CDate|number} year The date to examine or the year to examine.
		@param {number} [month] The month to examine (if only <code>year</code> specified above).
		@param {number} [day] The day to examine (if only <code>year</code> specified above).
		@return {number} The week of the year.
		@throws Error if an invalid date or a different calendar used. */
	UmmAlQuraCalendar.prototype.weekOfYear = function (year, month, day) {
		// Find Sunday of this week starting on Sunday
		var checkDate = this.newDate(year, month, day);
		checkDate.add(-checkDate.dayOfWeek(), 'd');
		return Math.floor((checkDate.dayOfYear() - 1) / 7) + 1;
	},

		/** Retrieve the number of days in a year.
			@memberof UmmAlQuraCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@return {number} The number of days.
			@throws Error if an invalid year or a different calendar used. */
		UmmAlQuraCalendar.prototype.daysInYear = function (year) {
			var daysCount = 0;
			for (var i = 1; i <= 12; i++) {
				daysCount += this.daysInMonth(year, i);
			}
			return daysCount;
		};

	/** Retrieve the number of days in a month.
		@memberof UmmAlQuraCalendar
		@param {CDate|number} year The date to examine or the year of the month.
		@param {number} [month] The month (if only <code>year</code> specified above).
		@return {number} The number of days in this month.
		@throws Error if an invalid month/year or a different calendar used. */
	UmmAlQuraCalendar.prototype.daysInMonth = function (year, month) {
		var date = this._validate(year, month, this.minDay, $.calendars.local.invalidMonth);
		var mcjdn = date.toJD() - 2400000 + 0.5; // Modified Chronological Julian Day Number (MCJDN)
		// the MCJDN's of the start of the lunations in the Umm al-Qura calendar are stored in the 'ummalquraData' array
		var index = 0;
		for (var i = 0; i < ummalquraData.length; i++) {
			if (ummalquraData[i] > mcjdn) {
				return (ummalquraData[index] - ummalquraData[index - 1]);
			}
			index++;
		}
		return 30; // Unknown outside
	},

		/** Determine whether this date is a week day.
			@memberof UmmAlQuraCalendar
			@param {CDate|number} year The date to examine or the year to examine.
			@param {number} [month] The month to examine (if only <code>year</code> specified above).
			@param {number} [day] The day to examine (if only <code>year</code> specified above).
			@return {boolean} <code>true</code> if a week day, <code>false</code> if not.
			@throws Error if an invalid date or a different calendar used. */
		UmmAlQuraCalendar.prototype.weekDay = function (year, month, day) {
			return this.dayOfWeek(year, month, day) !== 5;
		};

	/** Retrieve the Julian date equivalent for this date,
		i.e. days since January 1, 4713 BCE Greenwich noon.
		@memberof UmmAlQuraCalendar
		@param {CDate|number} year The date to convert or the year to convert.
		@param {number} [month] The month to convert (if only <code>year</code> specified above).
		@param {number} [day] The day to convert (if only <code>year</code> specified above).
		@return {number} The equivalent Julian date.
		@throws Error if an invalid date or a different calendar used. */
	UmmAlQuraCalendar.prototype.toJD = function (year, month, day) {
		var date = this._validate(year, month, day, $.calendars.local.invalidDate);
		var index = (12 * (date.year() - 1)) + date.month() - 15292;
		var mcjdn = date.day() + ummalquraData[index - 1] - 1;
		return mcjdn + 2400000 - 0.5; // Modified Chronological Julian Day Number (MCJDN)
	};

	/** Create a new date from a Julian date.
		@memberof UmmAlQuraCalendar
		@param {number} jd The Julian date to convert.
		@return {CDate} The equivalent date. */
	UmmAlQuraCalendar.prototype.fromJD = function (jd) {
		var mcjdn = jd - 2400000 + 0.5; // Modified Chronological Julian Day Number (MCJDN)
		// the MCJDN's of the start of the lunations in the Umm al-Qura calendar 
		// are stored in the 'ummalquraData' array
		var index = 0;
		for (var i = 0; i < ummalquraData.length; i++) {
			if (ummalquraData[i] > mcjdn) {
				break;
			}
			index++;
		}
		var lunation = index + 15292; //UmmAlQura Lunation Number
		var ii = Math.floor((lunation - 1) / 12);
		var year = ii + 1;
		var month = lunation - 12 * ii;
		var day = mcjdn - ummalquraData[index - 1] + 1;
		return this.newDate(year, month, day);
	};

	/** Determine whether a date is valid for this calendar.
		@memberof UmmAlQuraCalendar
		@param {number} year The year to examine.
		@param {number} month The month to examine.
		@param {number} day The day to examine.
		@return {boolean} <code>true</code> if a valid date, <code>false</code> if not. */
	UmmAlQuraCalendar.prototype.isValid = function (year, month, day) { // jshint unused:false
		var valid = $.calendars.baseCalendar.prototype.isValid.apply(this, arguments);
		if (valid) {
			year = (typeof year.year !== 'undefined' && year.year !== null ? year.year : year);
			valid = (year >= 1276 && year <= 1500);
		}
		return valid;
	};
	/** Check that a candidate date is from the same calendar and is valid.
		@memberof UmmAlQuraCalendar
		@private
		@param {CDate|number} year The date to validate or the year to validate.
		@param {number} month The month to validate (if only <code>year</code> specified above).
		@param {number} day The day to validate (if only <code>year</code> specified above).
		@param {string} error Error message if invalid.
		@throws Error if different calendars used or invalid date. */
	UmmAlQuraCalendar.prototype._validate = function (year, month, day, error) {
		var date = $.calendars.baseCalendar.prototype._validate.apply(this, arguments);
		if (date.year < 1276 || date.year > 1500) {
			throw error.replace(/\{0\}/, this.local.name);
		}
		return date;
	};

	// UmmAlQura calendar implementation
	$.calendars.calendars.ummalqura = UmmAlQuraCalendar;

	var ummalquraData = [
		20, 50, 79, 109, 138, 168, 197, 227, 256, 286, 315, 345, 374, 404, 433, 463, 492, 522, 551, 581,
		611, 641, 670, 700, 729, 759, 788, 818, 847, 877, 906, 936, 965, 995, 1024, 1054, 1083, 1113, 1142, 1172,
		1201, 1231, 1260, 1290, 1320, 1350, 1379, 1409, 1438, 1468, 1497, 1527, 1556, 1586, 1615, 1645, 1674, 1704, 1733, 1763,
		1792, 1822, 1851, 1881, 1910, 1940, 1969, 1999, 2028, 2058, 2087, 2117, 2146, 2176, 2205, 2235, 2264, 2294, 2323, 2353,
		2383, 2413, 2442, 2472, 2501, 2531, 2560, 2590, 2619, 2649, 2678, 2708, 2737, 2767, 2796, 2826, 2855, 2885, 2914, 2944,
		2973, 3003, 3032, 3062, 3091, 3121, 3150, 3180, 3209, 3239, 3268, 3298, 3327, 3357, 3386, 3416, 3446, 3476, 3505, 3535,
		3564, 3594, 3623, 3653, 3682, 3712, 3741, 3771, 3800, 3830, 3859, 3889, 3918, 3948, 3977, 4007, 4036, 4066, 4095, 4125,
		4155, 4185, 4214, 4244, 4273, 4303, 4332, 4362, 4391, 4421, 4450, 4480, 4509, 4539, 4568, 4598, 4627, 4657, 4686, 4716,
		4745, 4775, 4804, 4834, 4863, 4893, 4922, 4952, 4981, 5011, 5040, 5070, 5099, 5129, 5158, 5188, 5218, 5248, 5277, 5307,
		5336, 5366, 5395, 5425, 5454, 5484, 5513, 5543, 5572, 5602, 5631, 5661, 5690, 5720, 5749, 5779, 5808, 5838, 5867, 5897,
		5926, 5956, 5985, 6015, 6044, 6074, 6103, 6133, 6162, 6192, 6221, 6251, 6281, 6311, 6340, 6370, 6399, 6429, 6458, 6488,
		6517, 6547, 6576, 6606, 6635, 6665, 6694, 6724, 6753, 6783, 6812, 6842, 6871, 6901, 6930, 6960, 6989, 7019, 7048, 7078,
		7107, 7137, 7166, 7196, 7225, 7255, 7284, 7314, 7344, 7374, 7403, 7433, 7462, 7492, 7521, 7551, 7580, 7610, 7639, 7669,
		7698, 7728, 7757, 7787, 7816, 7846, 7875, 7905, 7934, 7964, 7993, 8023, 8053, 8083, 8112, 8142, 8171, 8201, 8230, 8260,
		8289, 8319, 8348, 8378, 8407, 8437, 8466, 8496, 8525, 8555, 8584, 8614, 8643, 8673, 8702, 8732, 8761, 8791, 8821, 8850,
		8880, 8909, 8938, 8968, 8997, 9027, 9056, 9086, 9115, 9145, 9175, 9205, 9234, 9264, 9293, 9322, 9352, 9381, 9410, 9440,
		9470, 9499, 9529, 9559, 9589, 9618, 9648, 9677, 9706, 9736, 9765, 9794, 9824, 9853, 9883, 9913, 9943, 9972, 10002, 10032,
		10061, 10090, 10120, 10149, 10178, 10208, 10237, 10267, 10297, 10326, 10356, 10386, 10415, 10445, 10474, 10504, 10533, 10562, 10592, 10621,
		10651, 10680, 10710, 10740, 10770, 10799, 10829, 10858, 10888, 10917, 10947, 10976, 11005, 11035, 11064, 11094, 11124, 11153, 11183, 11213,
		11242, 11272, 11301, 11331, 11360, 11389, 11419, 11448, 11478, 11507, 11537, 11567, 11596, 11626, 11655, 11685, 11715, 11744, 11774, 11803,
		11832, 11862, 11891, 11921, 11950, 11980, 12010, 12039, 12069, 12099, 12128, 12158, 12187, 12216, 12246, 12275, 12304, 12334, 12364, 12393,
		12423, 12453, 12483, 12512, 12542, 12571, 12600, 12630, 12659, 12688, 12718, 12747, 12777, 12807, 12837, 12866, 12896, 12926, 12955, 12984,
		13014, 13043, 13072, 13102, 13131, 13161, 13191, 13220, 13250, 13280, 13310, 13339, 13368, 13398, 13427, 13456, 13486, 13515, 13545, 13574,
		13604, 13634, 13664, 13693, 13723, 13752, 13782, 13811, 13840, 13870, 13899, 13929, 13958, 13988, 14018, 14047, 14077, 14107, 14136, 14166,
		14195, 14224, 14254, 14283, 14313, 14342, 14372, 14401, 14431, 14461, 14490, 14520, 14550, 14579, 14609, 14638, 14667, 14697, 14726, 14756,
		14785, 14815, 14844, 14874, 14904, 14933, 14963, 14993, 15021, 15051, 15081, 15110, 15140, 15169, 15199, 15228, 15258, 15287, 15317, 15347,
		15377, 15406, 15436, 15465, 15494, 15524, 15553, 15582, 15612, 15641, 15671, 15701, 15731, 15760, 15790, 15820, 15849, 15878, 15908, 15937,
		15966, 15996, 16025, 16055, 16085, 16114, 16144, 16174, 16204, 16233, 16262, 16292, 16321, 16350, 16380, 16409, 16439, 16468, 16498, 16528,
		16558, 16587, 16617, 16646, 16676, 16705, 16734, 16764, 16793, 16823, 16852, 16882, 16912, 16941, 16971, 17001, 17030, 17060, 17089, 17118,
		17148, 17177, 17207, 17236, 17266, 17295, 17325, 17355, 17384, 17414, 17444, 17473, 17502, 17532, 17561, 17591, 17620, 17650, 17679, 17709,
		17738, 17768, 17798, 17827, 17857, 17886, 17916, 17945, 17975, 18004, 18034, 18063, 18093, 18122, 18152, 18181, 18211, 18241, 18270, 18300,
		18330, 18359, 18388, 18418, 18447, 18476, 18506, 18535, 18565, 18595, 18625, 18654, 18684, 18714, 18743, 18772, 18802, 18831, 18860, 18890,
		18919, 18949, 18979, 19008, 19038, 19068, 19098, 19127, 19156, 19186, 19215, 19244, 19274, 19303, 19333, 19362, 19392, 19422, 19452, 19481,
		19511, 19540, 19570, 19599, 19628, 19658, 19687, 19717, 19746, 19776, 19806, 19836, 19865, 19895, 19924, 19954, 19983, 20012, 20042, 20071,
		20101, 20130, 20160, 20190, 20219, 20249, 20279, 20308, 20338, 20367, 20396, 20426, 20455, 20485, 20514, 20544, 20573, 20603, 20633, 20662,
		20692, 20721, 20751, 20780, 20810, 20839, 20869, 20898, 20928, 20957, 20987, 21016, 21046, 21076, 21105, 21135, 21164, 21194, 21223, 21253,
		21282, 21312, 21341, 21371, 21400, 21430, 21459, 21489, 21519, 21548, 21578, 21607, 21637, 21666, 21696, 21725, 21754, 21784, 21813, 21843,
		21873, 21902, 21932, 21962, 21991, 22021, 22050, 22080, 22109, 22138, 22168, 22197, 22227, 22256, 22286, 22316, 22346, 22375, 22405, 22434,
		22464, 22493, 22522, 22552, 22581, 22611, 22640, 22670, 22700, 22730, 22759, 22789, 22818, 22848, 22877, 22906, 22936, 22965, 22994, 23024,
		23054, 23083, 23113, 23143, 23173, 23202, 23232, 23261, 23290, 23320, 23349, 23379, 23408, 23438, 23467, 23497, 23527, 23556, 23586, 23616,
		23645, 23674, 23704, 23733, 23763, 23792, 23822, 23851, 23881, 23910, 23940, 23970, 23999, 24029, 24058, 24088, 24117, 24147, 24176, 24206,
		24235, 24265, 24294, 24324, 24353, 24383, 24413, 24442, 24472, 24501, 24531, 24560, 24590, 24619, 24648, 24678, 24707, 24737, 24767, 24796,
		24826, 24856, 24885, 24915, 24944, 24974, 25003, 25032, 25062, 25091, 25121, 25150, 25180, 25210, 25240, 25269, 25299, 25328, 25358, 25387,
		25416, 25446, 25475, 25505, 25534, 25564, 25594, 25624, 25653, 25683, 25712, 25742, 25771, 25800, 25830, 25859, 25888, 25918, 25948, 25977,
		26007, 26037, 26067, 26096, 26126, 26155, 26184, 26214, 26243, 26272, 26302, 26332, 26361, 26391, 26421, 26451, 26480, 26510, 26539, 26568,
		26598, 26627, 26656, 26686, 26715, 26745, 26775, 26805, 26834, 26864, 26893, 26923, 26952, 26982, 27011, 27041, 27070, 27099, 27129, 27159,
		27188, 27218, 27248, 27277, 27307, 27336, 27366, 27395, 27425, 27454, 27484, 27513, 27542, 27572, 27602, 27631, 27661, 27691, 27720, 27750,
		27779, 27809, 27838, 27868, 27897, 27926, 27956, 27985, 28015, 28045, 28074, 28104, 28134, 28163, 28193, 28222, 28252, 28281, 28310, 28340,
		28369, 28399, 28428, 28458, 28488, 28517, 28547, 28577,
		// From 1356
		28607, 28636, 28665, 28695, 28724, 28754, 28783, 28813, 28843, 28872, 28901, 28931, 28960, 28990, 29019, 29049, 29078, 29108, 29137, 29167,
		29196, 29226, 29255, 29285, 29315, 29345, 29375, 29404, 29434, 29463, 29492, 29522, 29551, 29580, 29610, 29640, 29669, 29699, 29729, 29759,
		29788, 29818, 29847, 29876, 29906, 29935, 29964, 29994, 30023, 30053, 30082, 30112, 30141, 30171, 30200, 30230, 30259, 30289, 30318, 30348,
		30378, 30408, 30437, 30467, 30496, 30526, 30555, 30585, 30614, 30644, 30673, 30703, 30732, 30762, 30791, 30821, 30850, 30880, 30909, 30939,
		30968, 30998, 31027, 31057, 31086, 31116, 31145, 31175, 31204, 31234, 31263, 31293, 31322, 31352, 31381, 31411, 31441, 31471, 31500, 31530,
		31559, 31589, 31618, 31648, 31676, 31706, 31736, 31766, 31795, 31825, 31854, 31884, 31913, 31943, 31972, 32002, 32031, 32061, 32090, 32120,
		32150, 32180, 32209, 32239, 32268, 32298, 32327, 32357, 32386, 32416, 32445, 32475, 32504, 32534, 32563, 32593, 32622, 32652, 32681, 32711,
		32740, 32770, 32799, 32829, 32858, 32888, 32917, 32947, 32976, 33006, 33035, 33065, 33094, 33124, 33153, 33183, 33213, 33243, 33272, 33302,
		33331, 33361, 33390, 33420, 33450, 33479, 33509, 33539, 33568, 33598, 33627, 33657, 33686, 33716, 33745, 33775, 33804, 33834, 33863, 33893,
		33922, 33952, 33981, 34011, 34040, 34069, 34099, 34128, 34158, 34187, 34217, 34247, 34277, 34306, 34336, 34365, 34395, 34424, 34454, 34483,
		34512, 34542, 34571, 34601, 34631, 34660, 34690, 34719, 34749, 34778, 34808, 34837, 34867, 34896, 34926, 34955, 34985, 35015, 35044, 35074,
		35103, 35133, 35162, 35192, 35222, 35251, 35280, 35310, 35340, 35370, 35399, 35429, 35458, 35488, 35517, 35547, 35576, 35605, 35635, 35665,
		35694, 35723, 35753, 35782, 35811, 35841, 35871, 35901, 35930, 35960, 35989, 36019, 36048, 36078, 36107, 36136, 36166, 36195, 36225, 36254,
		36284, 36314, 36343, 36373, 36403, 36433, 36462, 36492, 36521, 36551, 36580, 36610, 36639, 36669, 36698, 36728, 36757, 36786, 36816, 36845,
		36875, 36904, 36934, 36963, 36993, 37022, 37052, 37081, 37111, 37141, 37170, 37200, 37229, 37259, 37288, 37318, 37347, 37377, 37406, 37436,
		37465, 37495, 37524, 37554, 37584, 37613, 37643, 37672, 37701, 37731, 37760, 37790, 37819, 37849, 37878, 37908, 37938, 37967, 37997, 38027,
		38056, 38085, 38115, 38144, 38174, 38203, 38233, 38262, 38292, 38322, 38351, 38381, 38410, 38440, 38469, 38499, 38528, 38558, 38587, 38617,
		38646, 38676, 38705, 38735, 38764, 38794, 38823, 38853, 38882, 38912, 38941, 38971, 39001, 39030, 39059, 39089, 39118, 39148, 39178, 39208,
		39237, 39267, 39297, 39326, 39355, 39385, 39414, 39444, 39473, 39503, 39532, 39562, 39592, 39621, 39650, 39680, 39709, 39739, 39768, 39798,
		39827, 39857, 39886, 39916, 39946, 39975, 40005, 40035, 40064, 40094, 40123, 40153, 40182, 40212, 40241, 40271, 40300, 40330, 40359, 40389,
		40418, 40448, 40477, 40507, 40536, 40566, 40595, 40625, 40655, 40685, 40714, 40744, 40773, 40803, 40832, 40862, 40892, 40921, 40951, 40980,
		41009, 41039, 41068, 41098, 41127, 41157, 41186, 41216, 41245, 41275, 41304, 41334, 41364, 41393, 41422, 41452, 41481, 41511, 41540, 41570,
		41599, 41629, 41658, 41688, 41718, 41748, 41777, 41807, 41836, 41865, 41894, 41924, 41953, 41983, 42012, 42042, 42072, 42102, 42131, 42161,
		42190, 42220, 42249, 42279, 42308, 42337, 42367, 42397, 42426, 42456, 42485, 42515, 42545, 42574, 42604, 42633, 42662, 42692, 42721, 42751,
		42780, 42810, 42839, 42869, 42899, 42929, 42958, 42988, 43017, 43046, 43076, 43105, 43135, 43164, 43194, 43223, 43253, 43283, 43312, 43342,
		43371, 43401, 43430, 43460, 43489, 43519, 43548, 43578, 43607, 43637, 43666, 43696, 43726, 43755, 43785, 43814, 43844, 43873, 43903, 43932,
		43962, 43991, 44021, 44050, 44080, 44109, 44139, 44169, 44198, 44228, 44258, 44287, 44317, 44346, 44375, 44405, 44434, 44464, 44493, 44523,
		44553, 44582, 44612, 44641, 44671, 44700, 44730, 44759, 44788, 44818, 44847, 44877, 44906, 44936, 44966, 44996, 45025, 45055, 45084, 45114,
		45143, 45172, 45202, 45231, 45261, 45290, 45320, 45350, 45380, 45409, 45439, 45468, 45498, 45527, 45556, 45586, 45615, 45644, 45674, 45704,
		45733, 45763, 45793, 45823, 45852, 45882, 45911, 45940, 45970, 45999, 46028, 46058, 46088, 46117, 46147, 46177, 46206, 46236, 46265, 46295,
		46324, 46354, 46383, 46413, 46442, 46472, 46501, 46531, 46560, 46590, 46620, 46649, 46679, 46708, 46738, 46767, 46797, 46826, 46856, 46885,
		46915, 46944, 46974, 47003, 47033, 47063, 47092, 47122, 47151, 47181, 47210, 47240, 47269, 47298, 47328, 47357, 47387, 47417, 47446, 47476,
		47506, 47535, 47565, 47594, 47624, 47653, 47682, 47712, 47741, 47771, 47800, 47830, 47860, 47890, 47919, 47949, 47978, 48008, 48037, 48066,
		48096, 48125, 48155, 48184, 48214, 48244, 48273, 48303, 48333, 48362, 48392, 48421, 48450, 48480, 48509, 48538, 48568, 48598, 48627, 48657,
		48687, 48717, 48746, 48776, 48805, 48834, 48864, 48893, 48922, 48952, 48982, 49011, 49041, 49071, 49100, 49130, 49160, 49189, 49218, 49248,
		49277, 49306, 49336, 49365, 49395, 49425, 49455, 49484, 49514, 49543, 49573, 49602, 49632, 49661, 49690, 49720, 49749, 49779, 49809, 49838,
		49868, 49898, 49927, 49957, 49986, 50016, 50045, 50075, 50104, 50133, 50163, 50192, 50222, 50252, 50281, 50311, 50340, 50370, 50400, 50429,
		50459, 50488, 50518, 50547, 50576, 50606, 50635, 50665, 50694, 50724, 50754, 50784, 50813, 50843, 50872, 50902, 50931, 50960, 50990, 51019,
		51049, 51078, 51108, 51138, 51167, 51197, 51227, 51256, 51286, 51315, 51345, 51374, 51403, 51433, 51462, 51492, 51522, 51552, 51582, 51611,
		51641, 51670, 51699, 51729, 51758, 51787, 51816, 51846, 51876, 51906, 51936, 51965, 51995, 52025, 52054, 52083, 52113, 52142, 52171, 52200,
		52230, 52260, 52290, 52319, 52349, 52379, 52408, 52438, 52467, 52497, 52526, 52555, 52585, 52614, 52644, 52673, 52703, 52733, 52762, 52792,
		52822, 52851, 52881, 52910, 52939, 52969, 52998, 53028, 53057, 53087, 53116, 53146, 53176, 53205, 53235, 53264, 53294, 53324, 53353, 53383,
		53412, 53441, 53471, 53500, 53530, 53559, 53589, 53619, 53648, 53678, 53708, 53737, 53767, 53796, 53825, 53855, 53884, 53913, 53943, 53973,
		54003, 54032, 54062, 54092, 54121, 54151, 54180, 54209, 54239, 54268, 54297, 54327, 54357, 54387, 54416, 54446, 54476, 54505, 54535, 54564,
		54593, 54623, 54652, 54681, 54711, 54741, 54770, 54800, 54830, 54859, 54889, 54919, 54948, 54977, 55007, 55036, 55066, 55095, 55125, 55154,
		55184, 55213, 55243, 55273, 55302, 55332, 55361, 55391, 55420, 55450, 55479, 55508, 55538, 55567, 55597, 55627, 55657, 55686, 55716, 55745,
		55775, 55804, 55834, 55863, 55892, 55922, 55951, 55981, 56011, 56040, 56070, 56100, 56129, 56159, 56188, 56218, 56247, 56276, 56306, 56335,
		56365, 56394, 56424, 56454, 56483, 56513, 56543, 56572, 56601, 56631, 56660, 56690, 56719, 56749, 56778, 56808, 56837, 56867, 56897, 56926,
		56956, 56985, 57015, 57044, 57074, 57103, 57133, 57162, 57192, 57221, 57251, 57280, 57310, 57340, 57369, 57399, 57429, 57458, 57487, 57517,
		57546, 57576, 57605, 57634, 57664, 57694, 57723, 57753, 57783, 57813, 57842, 57871, 57901, 57930, 57959, 57989, 58018, 58048, 58077, 58107,
		58137, 58167, 58196, 58226, 58255, 58285, 58314, 58343, 58373, 58402, 58432, 58461, 58491, 58521, 58551, 58580, 58610, 58639, 58669, 58698,
		58727, 58757, 58786, 58816, 58845, 58875, 58905, 58934, 58964, 58994, 59023, 59053, 59082, 59111, 59141, 59170, 59200, 59229, 59259, 59288,
		59318, 59348, 59377, 59407, 59436, 59466, 59495, 59525, 59554, 59584, 59613, 59643, 59672, 59702, 59731, 59761, 59791, 59820, 59850, 59879,
		59909, 59939, 59968, 59997, 60027, 60056, 60086, 60115, 60145, 60174, 60204, 60234, 60264, 60293, 60323, 60352, 60381, 60411, 60440, 60469,
		60499, 60528, 60558, 60588, 60618, 60648, 60677, 60707, 60736, 60765, 60795, 60824, 60853, 60883, 60912, 60942, 60972, 61002, 61031, 61061,
		61090, 61120, 61149, 61179, 61208, 61237, 61267, 61296, 61326, 61356, 61385, 61415, 61445, 61474, 61504, 61533, 61563, 61592, 61621, 61651,
		61680, 61710, 61739, 61769, 61799, 61828, 61858, 61888, 61917, 61947, 61976, 62006, 62035, 62064, 62094, 62123, 62153, 62182, 62212, 62242,
		62271, 62301, 62331, 62360, 62390, 62419, 62448, 62478, 62507, 62537, 62566, 62596, 62625, 62655, 62685, 62715, 62744, 62774, 62803, 62832,
		62862, 62891, 62921, 62950, 62980, 63009, 63039, 63069, 63099, 63128, 63157, 63187, 63216, 63246, 63275, 63305, 63334, 63363, 63393, 63423,
		63453, 63482, 63512, 63541, 63571, 63600, 63630, 63659, 63689, 63718, 63747, 63777, 63807, 63836, 63866, 63895, 63925, 63955, 63984, 64014,
		64043, 64073, 64102, 64131, 64161, 64190, 64220, 64249, 64279, 64309, 64339, 64368, 64398, 64427, 64457, 64486, 64515, 64545, 64574, 64603,
		64633, 64663, 64692, 64722, 64752, 64782, 64811, 64841, 64870, 64899, 64929, 64958, 64987, 65017, 65047, 65076, 65106, 65136, 65166, 65195,
		65225, 65254, 65283, 65313, 65342, 65371, 65401, 65431, 65460, 65490, 65520, 65549, 65579, 65608, 65638, 65667, 65697, 65726, 65755, 65785,
		65815, 65844, 65874, 65903, 65933, 65963, 65992, 66022, 66051, 66081, 66110, 66140, 66169, 66199, 66228, 66258, 66287, 66317, 66346, 66376,
		66405, 66435, 66465, 66494, 66524, 66553, 66583, 66612, 66641, 66671, 66700, 66730, 66760, 66789, 66819, 66849, 66878, 66908, 66937, 66967,
		66996, 67025, 67055, 67084, 67114, 67143, 67173, 67203, 67233, 67262, 67292, 67321, 67351, 67380, 67409, 67439, 67468, 67497, 67527, 67557,
		67587, 67617, 67646, 67676, 67705, 67735, 67764, 67793, 67823, 67852, 67882, 67911, 67941, 67971, 68000, 68030, 68060, 68089, 68119, 68148,
		68177, 68207, 68236, 68266, 68295, 68325, 68354, 68384, 68414, 68443, 68473, 68502, 68532, 68561, 68591, 68620, 68650, 68679, 68708, 68738,
		68768, 68797, 68827, 68857, 68886, 68916, 68946, 68975, 69004, 69034, 69063, 69092, 69122, 69152, 69181, 69211, 69240, 69270, 69300, 69330,
		69359, 69388, 69418, 69447, 69476, 69506, 69535, 69565, 69595, 69624, 69654, 69684, 69713, 69743, 69772, 69802, 69831, 69861, 69890, 69919,
		69949, 69978, 70008, 70038, 70067, 70097, 70126, 70156, 70186, 70215, 70245, 70274, 70303, 70333, 70362, 70392, 70421, 70451, 70481, 70510,
		70540, 70570, 70599, 70629, 70658, 70687, 70717, 70746, 70776, 70805, 70835, 70864, 70894, 70924, 70954, 70983, 71013, 71042, 71071, 71101,
		71130, 71159, 71189, 71218, 71248, 71278, 71308, 71337, 71367, 71397, 71426, 71455, 71485, 71514, 71543, 71573, 71602, 71632, 71662, 71691,
		71721, 71751, 71781, 71810, 71839, 71869, 71898, 71927, 71957, 71986, 72016, 72046, 72075, 72105, 72135, 72164, 72194, 72223, 72253, 72282,
		72311, 72341, 72370, 72400, 72429, 72459, 72489, 72518, 72548, 72577, 72607, 72637, 72666, 72695, 72725, 72754, 72784, 72813, 72843, 72872,
		72902, 72931, 72961, 72991, 73020, 73050, 73080, 73109, 73139, 73168, 73197, 73227, 73256, 73286, 73315, 73345, 73375, 73404, 73434, 73464,
		73493, 73523, 73552, 73581, 73611, 73640, 73669, 73699, 73729, 73758, 73788, 73818, 73848, 73877, 73907, 73936, 73965, 73995, 74024, 74053,
		74083, 74113, 74142, 74172, 74202, 74231, 74261, 74291, 74320, 74349, 74379, 74408, 74437, 74467, 74497, 74526, 74556, 74586, 74615, 74645,
		74675, 74704, 74733, 74763, 74792, 74822, 74851, 74881, 74910, 74940, 74969, 74999, 75029, 75058, 75088, 75117, 75147, 75176, 75206, 75235,
		75264, 75294, 75323, 75353, 75383, 75412, 75442, 75472, 75501, 75531, 75560, 75590, 75619, 75648, 75678, 75707, 75737, 75766, 75796, 75826,
		75856, 75885, 75915, 75944, 75974, 76003, 76032, 76062, 76091, 76121, 76150, 76180, 76210, 76239, 76269, 76299, 76328, 76358, 76387, 76416,
		76446, 76475, 76505, 76534, 76564, 76593, 76623, 76653, 76682, 76712, 76741, 76771, 76801, 76830, 76859, 76889, 76918, 76948, 76977, 77007,
		77036, 77066, 77096, 77125, 77155, 77185, 77214, 77243, 77273, 77302, 77332, 77361, 77390, 77420, 77450, 77479, 77509, 77539, 77569, 77598,
		77627, 77657, 77686, 77715, 77745, 77774, 77804, 77833, 77863, 77893, 77923, 77952, 77982, 78011, 78041, 78070, 78099, 78129, 78158, 78188,
		78217, 78247, 78277, 78307, 78336, 78366, 78395, 78425, 78454, 78483, 78513, 78542, 78572, 78601, 78631, 78661, 78690, 78720, 78750, 78779,
		78808, 78838, 78867, 78897, 78926, 78956, 78985, 79015, 79044, 79074, 79104, 79133, 79163, 79192, 79222, 79251, 79281, 79310, 79340, 79369,
		79399, 79428, 79458, 79487, 79517, 79546, 79576, 79606, 79635, 79665, 79695, 79724, 79753, 79783, 79812, 79841, 79871, 79900, 79930, 79960,
		79990
	];

})(window);
