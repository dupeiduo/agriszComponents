module.exports = function () {
  return {
    name: 'opacity-ctl',
    prop: {
      template: `<div>
                  <span class="demonstration no-select">{{title}}</span>
                    <el-slider class="slider" 
                      :disabled="useable"
                      v-model="value" ></el-slider>
                    <span class="ps no-select" :style="{right: right}">{{value}}%</span>
                </div>`,
      props: {
        opacity: {
          type: Number,
          default: 90
        },
        useable: {
          type: Boolean,
          default: false
        },
        title: {
          type: String,
          default: '透明度'
        },
        right: {
          type: String,
          default: '-15px'
        }
      },
      data() {
        return {
          value: 90
        }
      },
      mounted() {
        this.value = this.opacity
      },
      watch: {
        value(value) {
          this.$emit('changeOpacity', value)
        },
        opacity(value) {
          this.value = value
        }
      }
    }
  }
}