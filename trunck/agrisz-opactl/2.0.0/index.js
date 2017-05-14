module.exports = function () {
  return {
    name: 'opacity-ctl',
    prop: {
      template: `<div>
                  <span class="demonstration no-select">{{title}}</span>
                    <el-slider class="slider" 
                      :disabled="useable"
                      v-model="value"></el-slider>
                  <span class="ps no-select" :style="{right: right}">{{value}}%</span>
                  <el-switch class="opacity-switch"
                      :width=56
                      @change="changeState"
                      v-model="showOpacity"
                      on-color="#8fc31f"
                      off-color="#95adc4"
                      on-text="显示"
                      off-text="隐藏">
                  </el-switch>
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
          default: '44px'
        },
        disabled: {
          type: Boolean,
          default: false
        }
      },
      data() {
        return {
          value: 90,
          showOpacity: true,
        }
      },
      mounted() {
        this.value = this.opacity
      },
      methods: {
        changeState(show){
          if(show) {
            this.value = 90
          }else {
            this.value = 0
          }
        }
      },
      watch: {
        value(value) {
          this.$emit('changeOpacity', value)
        },
        opacity(value) {
          this.value = value
          if(this.value > 0) {
            this.showOpacity = true
          }else {
            this.showOpacity = false
          }
        }
      }
    }
  }
}