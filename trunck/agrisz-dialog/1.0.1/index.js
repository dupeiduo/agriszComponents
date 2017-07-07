module.exports = function () {
  return {
    name: 'my-dialog',
    prop: {
      data () {
        return {
          begin: false,
          disX: 0,
          disY: 0,
          container: null,
          targeter: null,
          showClass: 'my-dragable-dialog',
          clientH: 0
        }
      },
      template: `<div id="drag_container" 
                  :class="showClass"
                  :style="{background:useModal? 'rgba(0,0,0,.3)':'rgba(0,0,0,.0)',height: clientH + 'px'}"
                  @mousemove="figureLength($event)"
                  @mouseup="begin = false">
                    <div id="drag_target" class="targeter border-common-radius box-common-shadow" 
                      :style="{width: width + 'px', height: height + 'px', overflow: overFlow, paddingBottom: padBottom}"
                      @mouseenter="mouseEnterHandler"
                      @mouseleave="mouseOutHandler"
                      >
                      <div class="drag_container-bg pr pop-zIndex">
                        <span class="close no-select el-icon-close" @click="close"></span>
                        <div class="title no-selcet" 
                          @mousedown="beginDrag($event)"
                          :style="{width: (width - 60) + 'px', height: titleHeight, padding: titlePadding}">
                          
                          <slot name="title"></slot>
                        </div>

                      <div class="content">
                        <slot name="content"></slot>
                      </div>
                    </div>
                  </div>
                </div>`,
      props: {
        width: {
          type: String,
          default: '700'
        },
        height: {
          type: String,
          default: 'auto'
        },
        overFlow: {
          type: String,
          default: 'hidden'
        },
        titleHeight: {
          type: String,
          default: '20px'
        },
        titlePadding: {
          type: String,
          default: '30px 0 20px 20px'
        },
        padBottom: {
          type: String,
          default: ''
        },
        useModal: {
          type: Boolean,
          default: true
        }
      },
      mounted() {
        this.clientH = document.documentElement.clientHeight || document.body.clientHeight;
        this.container = document.getElementById('drag_container')
        this.targeter = document.getElementById('drag_target')
        this.removeModal()
      },
      methods: {
        mouseEnterHandler(){
          this.addModal()
        },
        mouseOutHandler(){
          this.removeModal()
        },
        addModal() {
          if(!this.begin && !this.useModal && this.showClass == ''){
            this.showClass = 'my-dragable-dialog'
          }
        },
        removeModal() {
          if (!this.begin && !this.useModal) {
            this.showClass = ''
          }
        },
        close() {
          this.$emit('close')
        },
        beginDrag(event) {
          event = event || window.event; 
          this.begin = true
          this.disX = event.clientX; 
          this.disY = event.clientY;
        },
        figureLength(event) {
          if (this.begin) {
            event = event || window.event; 
            var reLeft = event.clientX - this.disX; 
            var reTop = event.clientY - this.disY; 

            this.disX = event.clientX 
            this.disY = event.clientY

            var maxWidth = this.container.clientWidth - this.targeter.offsetWidth / 2; 
            var maxHeight = this.container.clientHeight - this.targeter.offsetHeight / 2; 

            var curLeft = Number(this.getCssValue(this.targeter, 'left').slice(0,-2))
            var curTop = Number(this.getCssValue(this.targeter, 'top').slice(0,-2))

            if (reLeft + curLeft < this.targeter.offsetWidth / 2 ) {
              reLeft = this.targeter.offsetWidth / 2
            } else if (reLeft + curLeft > maxWidth) {
              reLeft = maxWidth
            } else {
              reLeft = curLeft + reLeft
            }
            if (reTop + curTop < this.targeter.offsetHeight / 2 ) {
              reTop = this.targeter.offsetHeight / 2
            } else if (reTop + curTop > maxHeight) {
              reTop = maxHeight
            } else {
              reTop = curTop + reTop
            }

            this.targeter.style.left = reLeft + "px"; 
            this.targeter.style.top = reTop + "px"; 
          }
        },
        getCssValue(element, propertyName) {
          return element.currentStyle ? element.currentStyle[propertyName] : 
                 document.defaultView.getComputedStyle(element ,false)[propertyName]; 
        }
      },
      watch: {
        
      }
    }
  }
}