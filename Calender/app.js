
//Testing Functions for G Calender in English Language;
var Gcalendar = calendars.instance();
console.log(Gcalendar)
let leapYear = Gcalendar.leapYear(1440);
console.log('leapYear Function: ' + leapYear);
let weekOfYear = Gcalendar.weekOfYear(1440, 9, 10);
console.log('weekOfYear Function: ' + weekOfYear);
let daysInMonth = Gcalendar.daysInMonth(1440, 8);
console.log('daysInMonth Function: ' + daysInMonth);
let toJD = Gcalendar.toJD(1440, 9, 10);
console.log('toJD Function: ' + toJD);
let fromJD = Gcalendar.fromJD(2247261.5);
console.log('fromJD Function: ' + fromJD);
let toJSDate = Gcalendar.toJSDate(1440, 9, 10);
console.log('toJSDate Function: ' + toJSDate);
let fromJSDate = Gcalendar.fromJSDate(new Date());
console.log('fromJSDate Function: ' + fromJSDate);


//Testing Functions for H Calender in English Language;
var Hcalendar = calendars.instance('ummalqura');
console.log('ummalqura Calender: ', Hcalendar);
console.log('name Function: ', Hcalendar.name);
console.log('hasYearZero Function: ', Hcalendar.hasYearZero);
console.log('minMonth Function: ', Hcalendar.minMonth);
console.log('firstMonth Function: ', Hcalendar.firstMonth);
console.log('minDay Function: ', Hcalendar.minDay);
console.log('regionalOptions Function: ', Hcalendar.regionalOptions);
let hleapYear = Hcalendar.leapYear(1440);
console.log('leapYear Function: ', hleapYear);
let hweekOfYear = Hcalendar.weekOfYear(1440, 9, 10);
console.log('weekOfYear Function: ', hweekOfYear);
let hdaysInMonth = Hcalendar.daysInMonth(1440, 8);
console.log('daysInMonth Function: ', hdaysInMonth);
let hweekDay = Hcalendar.weekDay(1440, 9, 10);
console.log('weekDay Function: ', hweekDay);
let htoJD = Hcalendar.toJD(1440, 9, 10);
console.log('toJD Function: ', htoJD);
let hfromJD = Hcalendar.fromJD(2458618.5);
console.log('fromJD Function: ', hfromJD);
let hisValid = Hcalendar.isValid(1440, 9, 10);
console.log('isValid Function: ', hisValid);
let _validate = Hcalendar._validate(1440, 9, 10, 'hi');
console.log('_validate Function: ', _validate)

