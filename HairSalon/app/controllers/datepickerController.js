'use strict';
app.controller('datepickerController', function () {
    var vm = this;

    //Datepicker options
    vm.datepickerOptions = {
        minDate: new Date(), //Disabled date selection before today
        showWeeks: false, //Don't show weeks
        startingDay: 1, //Starting day at Monday
        dateDisabled: myDisabledDates //Disabled dates
    };

    //Disabled dates
    function myDisabledDates(dateAndMode) {
        var date = dateAndMode.date;
        var mode = dateAndMode.mode;
        var day = date.getDate();
        var dayOfWeek = date.getDay();
        var month = date.getMonth();
        //Disable dates on Sundays and from 1 to 15 of August
        return mode === 'day' && dayOfWeek === 0 || month === 7 && day in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    }
   

});