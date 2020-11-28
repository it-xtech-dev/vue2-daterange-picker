<template>
    <div class="vue-daterange-picker">
        <!-- add only to suppress eslint warning on date input component which in fact is not used inside this component but can be used outside -->
        <date-input v-if="false"></date-input>
        <div @click="togglePicker(null, true)" ref="toggler">
            <!--
              Allows you to change the input which is visible before the picker opens

              @param {Date} startDate - current startDate
              @param {Date} endDate - current endDate
              @param {object} ranges - object with ranges
            -->
            <slot
                    name="input"
                    :startDate="start"
                    :endDate="end"
                    :ranges="ranges"
            >
                <i class="glyphicon glyphicon-calendar fa fa-calendar"></i>&nbsp;
                <span>{{rangeText}}</span>
                <b class="caret"></b>
            </slot>
        </div>
        <transition name="slide-fade" mode="out-in">
            <div class="daterangepicker backdrop" v-if="open">
                <div
                        class="ltr"
                        :class="pickerStyles"
                        v-on-clickaway="clickAway"
                >
                    <div class="calendars row no-gutters">
                <!--
                  Allows you to change the range

                  @param {Date} startDate - current startDate
                  @param {Date} endDate - current endDate
                  @param {object} ranges - object with ranges
                -->
                        <slot
                                name="ranges"
                                :startDate="start"
                                :endDate="end"
                                :ranges="filteredRanges"
                                v-if="filteredRanges"
                        >
                            <calendar-ranges class="col-12 col-md-auto"
                                            @clickRange="clickRange"
                                            :ranges="filteredRanges"
                                            :selected="{ startDate: start, endDate: end }"
                            ></calendar-ranges>
                        </slot>

                        <div class="drp-calendar col left" :class="{single: singleDatePicker}">
                            <div class="daterangepicker_input d-none d-sm-block" v-if="false">
                                <input class="input-mini form-control" type="text" name="daterangepicker_start"
                                      :value="startText"/>
                                <i class="fa fa-calendar glyphicon glyphicon-calendar"></i>
                            </div>
                            <div class="calendar-table">
                                <calendar :monthDisplayed="primaryPickerDateDisplayed"
                                          :locale-data="locale"
                                          :start="start" :end="end"
                                          :minDate="min" :maxDate="max"
                                          :showDropdowns="showDropdowns"

                                          @month-changed="changeLeftMonth"
                                          :dateFormat="dateFormatFn"

                                          @date-click="dateClick" 
                                          @hover-date="hoverDate"
                                          :showWeekNumbers="showWeekNumbers"
                                          context="primary"
                                ></calendar>
                            </div>
                            <calendar-time v-if="timePicker"
                                          @update="onUpdateStartTime"
                                          :miniuteIncrement="timePickerIncrement"
                                          :hour24="timePicker24Hour"
                                          :secondPicker="timePickerSeconds"
                                          :currentTime="start"
                            />
                        </div>

                        <div class="drp-calendar col right" v-if="!singleDatePicker">
                            <div class="daterangepicker_input" v-if="false">
                                <input class="input-mini form-control" type="text" name="daterangepicker_end"
                                      :value="endText"/>
                                <i class="fa fa-calendar glyphicon glyphicon-calendar"></i>
                            </div>
                            <div class="calendar-table">
                                <calendar :monthDisplayed="seconaryPickerDateDisplayed"
                                          :localeData="locale"
                                          :start="start" :end="end"
                                          :minDate="min" :maxDate="max"
                                          :showDropdowns="showDropdowns"

                                          @month-changed="changeRightMonth"
                                          :dateFormat="dateFormatFn"

                                          @date-click="dateClick" 
                                          @hover-date="hoverDate"
                                          :showWeekNumbers="showWeekNumbers"

                                          context="secondary"
                                ></calendar>
                            </div>
                            <calendar-time v-if="timePicker"
                                          @update="onUpdateEndTime"
                                          :miniuteIncrement="timePickerIncrement"
                                          :hour24="timePicker24Hour"
                                          :secondPicker="timePickerSeconds"
                                          :currentTime="end"
                            />
                        </div>
                    </div>

                    <div class="drp-buttons" v-if="!autoApply">
                        <span class="drp-selected">{{rangeText}}</span>
                        <button
                                class="cancelBtn btn btn-sm btn-default"
                                type="button"
                                @click="clickAway"
                        >{{locale.cancelLabel}}
                        </button>
                        <button
                                class="applyBtn btn btn-sm btn-success"
                                :disabled="in_selection"
                                type="button"
                                @click="clickedApply"
                        >{{locale.applyLabel}}
                        </button>
                    </div>

                </div>
            </div>
        </transition>
    </div>
</template>

<script>
  import dayjs from 'dayjs'
  import 'dayjs/locale/en-gb'
  import Calendar from './Calendar.vue'
  import CalendarTime from './CalendarTime'
  import CalendarRanges from './CalendarRanges'
  import DateInputImport from './DateInput'
  import {localeData, nextMonth, prevMonth, validateDateRange, yearMonth} from './util'
  import {mixin as clickaway} from 'vue-clickaway'

  // initialize default locale
  dayjs.locale('en-gb')

  export default {
    inheritAttrs: false,
    components: {Calendar, CalendarTime, CalendarRanges, DateInput: DateInputImport },
    mixins: [clickaway],
    model: {
      prop: 'dateBind',
      event: 'update',
    },
    props: {
      /**
       * minimum date allowed to be selected
       * @default null
       */
      minDate: {
        type: [String, Date],
        default () {
          return null
        }
      },
      /**
       * maximum date allowed to be selected
       * @default null
       */
      maxDate: {
        type: [String, Date],
        default () {
          return null
        }
      },
      /**
       * Show the week numbers on the left side of the calendar
       */
      showWeekNumbers: {
        type: Boolean,
        default: false,
      },
      /**
       * Allows you to select only one date (instead of range). This will hide the ranges with different start/end
       */
      singleDatePicker: {
        type: Boolean,
        default: false,
      },
      /**
       * Show the dropdowns for month and year selection above the calendars
       */
      showDropdowns: {
        type: Boolean,
        default: false,
      },
      /**
       * Show the dropdowns for time (hour/minute) selection below the calendars
       */
      timePicker: {
        type: Boolean,
        default: false,
      },
      /**
       * Determines the increment of minutes in the minute dropdown
       */
      timePickerIncrement: {
        type: Number,
        default: 1,
      },
      /**
       * Use 24h format for the time
       */
      timePicker24Hour: {
        type: Boolean,
        default: true,
      },
      /**
       * Allows you to select seconds except hour/minute
       */
      timePickerSeconds: {
        type: Boolean,
        default: false,
      },
      /**
       * Auto apply selected range. If false you need to click an apply button
       */
      autoApply: {
        type: Boolean,
        default: false,
      },
      /**
       * Object containing locale data used by the picker. See example below the table
       *
       * @default *see below
       */
      localeData: {
        type: Object,
        default () {
          return {}
        },
      },
      /**
       * This is the v-model prop which the component uses.
       */
      dateBind: { // for v-model
        type: [Date, Object],
        default: null,
        required: true,
        validator(value) {
          // https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
          if (isValidInput(value)) {
            return true;
          } else if  (
              value.hasOwnProperty('startDate') 
              && value.hasOwnProperty('endDate')
              && isValidInput(value.startDate)
              && isValidInput(value.endDate)
              ) {
                return true
          } else {
            // eslint-disable-next-line
            console.warn("v-model should be Date or { startDate: Date, endDate: Date } specified value does not meet this conditions.")
            return false;
          }

          function isValidInput(check) {
            return typeof check.getMonth === 'function' 
                || check === null
          }
        }        
      },
      /**
       * Gets or sets predefined calendar ranges. Object with key/value array for predefined ranges. Passing null or empty object will hide ranges section.
       * @default *see below
       */
      ranges: {
        type: Object,
        default () {
          return {
            'Today': [dayjs().startOf('day'), dayjs().endOf('day')],
            'Yesterday': [dayjs().subtract(1, 'days').startOf('day'), dayjs().subtract(1, 'days').endOf('day')],
            'This month': [dayjs().startOf('month').startOf('day'), dayjs().endOf('month').endOf('day')],
            'This year': [dayjs().startOf('year').startOf('day'), dayjs().endOf('year').endOf('day')],
            'Last week': [dayjs().subtract(1, 'week').startOf('week').startOf('day'), dayjs().subtract(1, 'week').endOf('week').endOf('day')],
            'Last month': [dayjs().subtract(1, 'month').startOf('month').startOf('day'), dayjs().subtract(1, 'month').endOf('month').endOf('day')],
          }
        }
      },
      /**
       * Gets or sets value determining whether predefined candar ranges should be displayed.
       */
      showRanges: {
        type: Boolean,
        default: true
      },
      /**
       * which way the picker opens - "center", "left" or "right"
       */
      // opens: {
      //   type: String,
      //   default: 'center'
      // },
      /**
       function(classes, date) - special prop type function which accepts 2 params:
        "classes" - the classes that the component's logic has defined,
        "date" - tha date currently processed.
         You should return Vue class object which should be applied to the date rendered.
       */
      dateFormat: Function
    },
    data () {
      let data = {
        locale: localeData(this.localeData)
      }

      var initialDates = this.getBindedDates();

      let startDate = initialDates.startDate || new Date();
      let endDate = initialDates.endDate || startDate;

      data.primaryPickerDateDisplayed =  initialDates.startDate;
      data.seconaryPickerDateDisplayed = initialDates.endDate;
      data.start = startDate;
      if (this.singleDatePicker) {
        // ignore endDate for singleDatePicker
        data.end = data.start
      } else {
        data.end = endDate;
      }
      data.in_selection = false
      data.open = false

      // update day names order to firstDay
      if (data.locale.firstDay !== 0) {
        let iterator = data.locale.firstDay
        while (iterator > 0) {
          data.locale.daysOfWeek.push(data.locale.daysOfWeek.shift())
          iterator--
        }
      }
      return data
    },
    methods: {
      dateFormatFn (classes, date) {
        let dt = new Date(date)
        dt.setHours(0, 0, 0, 0)
        let start = new Date(this.start)
        start.setHours(0, 0, 0, 0)
        let end = new Date(this.end)
        end.setHours(0, 0, 0, 0)

        classes['in-range'] = dt >= start && dt <= end

        return this.dateFormat ? this.dateFormat(classes, date) : classes
      },
      changeLeftMonth (value) {
        let newDate = new Date(value.year, value.month, 1);
        this.primaryPickerDateDisplayed = newDate
        if ((yearMonth(this.primaryPickerDateDisplayed) >= yearMonth(this.seconaryPickerDateDisplayed))) {
          this.seconaryPickerDateDisplayed = validateDateRange(nextMonth(newDate), this.minDate, this.maxDate);
          if (yearMonth(this.primaryPickerDateDisplayed) === yearMonth(this.seconaryPickerDateDisplayed)) {
            this.primaryPickerDateDisplayed = validateDateRange(prevMonth(this.primaryPickerDateDisplayed), this.minDate, this.maxDate)
          }
        }
      },
      changeRightMonth (value) {
        let newDate = new Date(value.year, value.month, 1);
        this.seconaryPickerDateDisplayed = newDate
        if ((yearMonth(this.seconaryPickerDateDisplayed) <= yearMonth(this.primaryPickerDateDisplayed))) {
          this.primaryPickerDateDisplayed = validateDateRange(prevMonth(newDate), this.minDate, this.maxDate);
          if (yearMonth(this.primaryPickerDateDisplayed) === yearMonth(this.seconaryPickerDateDisplayed)) {
            this.seconaryPickerDateDisplayed = validateDateRange(nextMonth(this.seconaryPickerDateDisplayed), this.minDate, this.maxDate)
          }
        }
      },
      normalizeDatetime (value, oldValue) {
        let newDate = new Date(value);
        if (this.timePicker && oldValue) {
          newDate.setHours(oldValue.getHours());
          newDate.setMinutes(oldValue.getMinutes());
          newDate.setSeconds(oldValue.getSeconds());
          newDate.setMilliseconds(oldValue.getMilliseconds());
        }

        return newDate;
      },
      dateClick (value, context) {
        if (context === 'primary') {
          if (this.in_selection) {
            this.in_selection = false
            this.end = this.normalizeDatetime(value, this.end);

            if (this.end < this.start) {
              this.in_selection = true
              this.start = this.normalizeDatetime(value, this.start);
            }
            if (!this.in_selection && this.autoApply) {
              this.clickedApply();
            }
          } else {
            this.start = this.normalizeDatetime(value, this.start);
            this.end = this.normalizeDatetime(value, this.end);
            if (!this.singleDatePicker) {
              this.in_selection = true
            } else if (this.autoApply) {
              this.clickedApply();
            }
          }          
        } else if (context === 'secondary') {
          this.end = this.normalizeDatetime(value, this.end);
          this.in_selection = false;
        } else {
          throw "Unknown context '" + context + "'";
        }
      },
      hoverDate (value, /*context*/) {
        let dt = this.normalizeDatetime(value, this.end);
        if (this.in_selection && dt >= this.start)
          this.end = dt
      },
      togglePicker (value, event) {
        if (typeof value === 'boolean') {
          this.open = value
        } else {
          this.open = !this.open
        }
        if (this.open) {
          this.primaryPickerDateDisplayed = this.start || this.minDate || new Date();
          this.seconaryPickerDateDisplayed = this.end || this.maxDate || new Date();
        }

        if (event === true)
          /**
           * Emits whenever the picker opens/closes
           * @param {boolean} open - the current state of the picker
           * @param {Function} togglePicker - function (show, event) which can be used to control the picker. where "show" is the new state and "event" is boolean indicating whether a new event should be raised
           */
          this.$emit('toggle', this.open, this.togglePicker)

      },
      clickedApply () {
        // this.open = false
        this.togglePicker(false, true)
        /**
         * Emits when the user selects a range from the picker and clicks "apply" (if autoApply is true).
         * @param {json} value - json object containing the dates: {startDate, endDate}
         */
        if (this.singleDatePicker) {
          this.$emit('update', this.start )
        }
        else
        {
          this.$emit('update', {startDate: this.start, endDate: this.end})
        }
        
      },
      clickAway () {
        if (this.open) {
          // reset start and end
          let startDate = this.dateRange.startDate
          let endDate = this.dateRange.endDate
          this.start = startDate ? new Date(startDate) : null
          this.end = endDate ? new Date(endDate) : null
          // this.open = false
          this.togglePicker(false, true)
        }
      },
      clickRange (value) {
        this.start = new Date(value[0])
        this.end = new Date(value[1])
        this.primaryPickerDateDisplayed = new Date(value[0])
        if (this.autoApply)
          this.clickedApply()
      },
      onUpdateStartTime (value) {
        let start = new Date(this.start);
        start.setHours(value.hours);
        start.setMinutes(value.minutes);
        start.setSeconds(value.seconds);

        this.start = start;
      },
      onUpdateEndTime (value) {
        let end = new Date(this.end);
        end.setHours(value.hours);
        end.setMinutes(value.minutes);
        end.setSeconds(value.seconds);

        this.end = end;
      },
      getBindedDates() {
        if (this.dateBind.hasOwnProperty('startDate')
            && this.dateBind.hasOwnProperty('endDate')
            ) 
        {
          return this.dateBind;
        } else {
          return {
            startDate: this.dateBind,
            endDate: null
          }
        }        
      }
    },
    computed: {
      dateRange() {
        return this.getBindedDates();
      },
      startText () {
        // return this.start.toLocaleDateString()+
        if (this.start === null)
          return ''
        return dayjs(this.start).format(this.locale.format)
      },
      endText () {
        if (this.end === null)
          return ''
        // return new Date(this.end).toLocaleDateString()
        return dayjs(new Date(this.end)).format(this.locale.format)
      },
      filteredRanges() {
        if (this.showRanges === false) return null;

        var hasOptions = false;
        var output = {};
        if (this.singleDatePicker) {
          // filter ranges to same date only
          for (var prop in this.ranges) {
              if (this.ranges.hasOwnProperty(prop)) {
                  var range = this.ranges[prop];
                  if (range[0].isSame(range[1], 'day')) {
                    hasOptions = true;
                    output[prop] = range;
                  }
              }
          }
        } else if (this.ranges) {
          output = this.ranges
          hasOptions = Object.keys(this.ranges).length > 0
        }
        if (hasOptions) {
          return output
        }
        else
        {
          return null;
        }
      },
      rangeText () {
        let range = this.startText;
        if (!this.singleDatePicker) {
          range += this.locale.separator + this.endText;
        }
        return range;
      },
      min () {
        return this.minDate ? new Date(this.minDate) : null
      },
      max () {
        return this.maxDate ? new Date(this.maxDate) : null
      },
      pickerStyles () {
        return {
          'show-calendar': this.open,
          'show-ranges': this.filteredRanges != null,
          'show-weeknumbers': this.showWeekNumbers,
          single: this.singleDatePicker
        }
      },
      isClear () {
        return !this.dateRange.startDate || !this.dateRange.endDate
      }
    },
    watch: {
      minDate () {
        let dt = validateDateRange(this.primaryPickerDateDisplayed, this.minDate || new Date(), this.maxDate)
        this.changeLeftMonth({year: dt.getFullYear(), month: dt.getMonth()})
      },
      maxDate () {
        let dt = validateDateRange(this.seconaryPickerDateDisplayed, this.minDate, this.maxDate || new Date())
        this.changeRightMonth({year: dt.getFullYear(), month: dt.getMonth()})
      },  
      'dateRange.startDate' (value) {
        this.start = value;
        // if (this.isClear) {
        //   this.start = null
        //   this.end = null
        // } else {
        //   this.start = new Date(this.dateRange.startDate)
        //   this.end = new Date(this.dateRange.endDate)
        // }
      },
      'dateRange.endDate' (value) {
        this.end = value;
        //  (!!value && !this.isClear) ? new Date(value) : null
        // if (this.isClear) {
        //   this.start = null
        //   this.end = null
        // } else {
        //   this.start = new Date(this.dateRange.startDate)
        //   this.end = new Date(this.dateRange.endDate)
        // }
      }
    }
  }

  //expose dateinput component
  export const DateInput = DateInputImport;

</script>

<style lang="scss">
    @import '../assets/daterangepicker.css';
</style>

<style lang="scss" scoped>
    .reportrange-text {
        background: #fff;
        cursor: pointer;
        padding: 5px 10px;
        border: 1px solid #ccc;
        width: 100%;
    }

    /* Enter and leave animations can use different */
    /* durations and timing functions.              */
    .slide-fade-enter-active {
        transition: all .2s ease;
    }

    .slide-fade-leave-active {
        transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }

    .slide-fade-enter, .slide-fade-leave-to
        /* .slide-fade-leave-active for <2.1.8 */
    {
        transform: translateX(10px);
        opacity: 0;
    }

    .vue-daterange-picker {
        position: relative;
        display: inline-block;
    }
</style>