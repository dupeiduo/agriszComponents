module.exports = function (store) {
  return {
    name: 'pop-message',
    prop: {
      template: `<div class="pop-message" :class="className" :style="{left: (screenWidth - menuWidth)/2 + 103 + 'px',top: (getScreenHeight - 48)/2 + 45 +'px'}">{{popTitle}}</div>`,
      props:{
        popTitle:{
          type: String,
          default: ''
        },
        showTime: {
          type: Number,
          default: 2000
        }
      },
      data() {
        return {
          className: '',
          timeHandler: null,
          timeHandlerInner: null
        }
      },
      computed: {
        screenWidth: ()=> {
          if (store) {
            return store.getters.screenWidth

          } else {
            return document.documentElement.clientWidth || document.body.clientWidth
          }
        },
        getScreenHeight: ()=> {
          if (store) {
            return store.getters.getScreenHeight

          } else {
            document.documentElement.clientHeight || document.body.clientHeight
          }
        },
        menuWidth: ()=> {
          if (store) {
            return store.getters.menuWidth
            
          } else {
            return 0
          }
        },
      },
      methods: {
        hidePopMsgImmediate() {
          this.className = ''
          if (this.timeHandler) {
            clearTimeout(this.timeHandler);
            this.timeHandler = null;
          }
          this.clearHide()
        },
        hideDialog() {
          this.timeHandlerInner = setTimeout(() => {
            this.timeHandlerInner = null
            this.className = ''
          }, 1000)
        },
        clearHide() {
          if (this.timeHandlerInner) {
            clearTimeout(this.timeHandlerInner)
            this.timeHandlerInner = null
          }
        },
        showUnAutoHideDialog() {
          if (this.timeHandler) {
            clearTimeout(this.timeHandler)
            this.timeHandler = null
          }
          this.clearHide()
          this.className = 'pop-message-show'
        },
        showDialog(){
          this.clearLastShow()

          this.clearHide()

          this.className = 'pop-message-show'
          this.timeHandler = setTimeout(() => {
            this.className = 'pop-message-show pop-msg-fadeout'
            this.timeHandler = null

            this.clearHide()

            this.hideDialog()

          }, this.showTime - 1000)

        },
        clearLastShow() {
          if (this.timeHandler) {
            this.className = 'pop-message-show'
            clearTimeout(this.timeHandler)
            this.timeHandler = null
          }
        }
      }
    }
  }
}