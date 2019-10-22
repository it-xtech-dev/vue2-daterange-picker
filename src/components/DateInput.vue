<template>
  <input type="text" v-model="inputValue" ref="input" :class="isDateValid ? '' : invalidCssClass">
</template>

<script>
  export default {
    model: {
      prop: 'dateValue',
      event: 'updated',
    },
    props: {
      dateValue: {
        type: [Date],
        default () {
          return null
        }
      },
      formatter: {
        type: [Function]
      },
      parser: {
        type: [Function]
      },
      invalidCssClass: {
        type: String,
        default: 'valid-error'
      }
    },
    data () {
      return {
        isDateValid: true
      }
    },
    methods: {
      parse(dateString) {
        if (this.parser) {
          return this.parser(dateString);
        } else {
          if (!/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/.test(dateString)) {
            return {
              toString() {
                return "Invalid Date"
              }
            }
          }

          return new Date(dateString.replace(
              /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
              '$4:$5:$6 $2/$3/$1'
          ));
        }
      },
      format(dateObject) {
        if (this.formatter) {
          return this.formatter(dateObject);
        } else {
          // time is procesed with current timezone

          var yyyy = dateObject.getFullYear();
          var dd = dateObject.getDate();
          var mm = dateObject.getMonth() + 1;
          var hh = dateObject.getHours()
          var min = dateObject.getMinutes()
          var ss = dateObject.getSeconds();

          return yyyy + "-" + pad(mm) + "-" + pad(dd) + " " + pad(hh) + ":" + pad(min) + ":" + pad(ss);
        }

        function pad(val) {
          if (val < 10)
              return "0" + val;
          else return val;
        }        
      }
    },
    computed: {
      inputValue: {
        get() {
          //console.log(this.dateValue);
          var formated = this.format(this.dateValue);
          //console.log('formated', formated);
          return formated;
        },
        set(value) {
          const pos = this.$refs.input.selectionStart;
          var parsed = this.parse(value);
          var isDateValid = true
          if (parsed.toString() === "Invalid Date") {
            //console.warn("Date '" + value + "' cannot be parsed.");
            isDateValid = false;
          } else {
            //console.log('parsed', parsed);

            this.$emit("updated", parsed);
          }
          this.isDateValid = isDateValid
          // restore cursor position
          this.$nextTick(() => {
            this.$refs.input.value = value
            this.$refs.input.selectionEnd = pos
          })            
        }
      }
    },
    watch: {
    }
  }

</script>