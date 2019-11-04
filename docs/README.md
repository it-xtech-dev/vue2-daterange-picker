# Vue date range picker

It's a fork of vue2-daterange-picker (https://github.com/Innologica/vue2-daterange-picker) with moment.js dependency replaced with lightweight dayjs.js. Also picker behavior and apperance has been modified a bit.


## Installation

No npm package avaiable yet. You can clone git project and create local package for your project usage or use one of the output .js files to include.

## Usage

check: https://github.com/Innologica/vue2-daterange-picker

## Example

<demo></demo>

## Props
<component-props component="DateRangePicker"/>
* sample locale data
```JS
{
    direction: 'ltr',
    format: moment.localeData().longDateFormat('L'),
    separator: ' - ',
    applyLabel: 'Apply',
    cancelLabel: 'Cancel',
    weekLabel: 'W',
    customRangeLabel: 'Custom Range',
    daysOfWeek: moment.weekdaysMin(),
    monthNames: moment.monthsShort(),
    firstDay: moment.localeData().firstDayOfWeek()
}
```
* default ranges object (set to false to hide ranges)
```JS
{
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'This month': [moment().startOf('month'), moment().endOf('month')],
    'This year': [moment().startOf('year'), moment().endOf('year')],
    'Last week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
    'Last month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
}
```
## Events
<component-events component="DateRangePicker"/>
## Slots
<component-slots component="DateRangePicker"/>