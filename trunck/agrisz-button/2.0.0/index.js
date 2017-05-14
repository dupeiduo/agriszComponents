module.exports = function () {
  return {
    name: 'my-button',
    prop: {
      data: function() {
        return {
        }
      },
      template: `<div class="btns-container" v-show="buttons.length > 0">
                  <span class="btn border-common-radius" 
                    v-for="(item, index) in buttons" :data-tip="tipContent"
                    :class="(curIndex == index ? 'active' : '') + (showTip ? (' enable' + item[tipField]) : '')"
                    @click="btnClick(index)"
                    >
                    {{(field ? item[field] : item.name)}}<span v-if="showCount" class="counts">{{item[tipField] == 1 ? '  (' + item[countField] + ')' : ''}}</span>
                  </span>
                </div>`,
      props: {
        buttons: {
          type: Array,
          default: []
        },
        curIndex: {
          type: Number,
          default: 0
        },
        field: {
          type: String,
          default: 'name'
        },
        tipContent: {
          type: String,
          default: '暂无该政区市场数据'
        },
        background: {
          type: String,
          default: '#3ac958'
        },
        showTip: {
          type: Boolean,
          default: false
        },
        showCount: {
          type: Boolean,
          default: false
        },
        tipField:{
          type: String,
          default: 'is_exist'
        },
        countField:{
          type: String,
          default: 'market_count'
        }
      },
      mounted() {

      },
      methods: {
        btnClick(index) {
          if (this.showTip && this.buttons[index][this.tipField] === 0) {
            return
          } else {
            this.$emit('btnClick', index)
          }
        }
      },
      watch: {
        
      }
    }
  }
}
