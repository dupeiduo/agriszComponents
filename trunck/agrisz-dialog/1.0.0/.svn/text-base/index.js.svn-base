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
        }
      },
      template: `<div id="drag_container" class="my-dragable-dialog"
                  @mousemove="figureLength($event)"
                  @mouseup="begin = false">
                  <div id="drag_target" class="targeter" 
                    :style="{width: width + 'px', height: height + 'px', overflow: overFlow, paddingBottom: padBottom}">
                    <span class="close no-select" @click="close">&times;</span>
                    <div class="title no-selcet" 
                      @mousedown="beginDrag($event)"
                      :style="{width: (width - 60) + 'px', height: titleHeight, padding: titlePadding}">
                      
                      <slot name="title"></slot>
                    </div>

                    <div class="content">
                      <slot name="content"></slot>
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
          default: '15px 0 0 60px'
        },
        padBottom: {
          type: String,
          default: '35px'
        }
      },
      mounted() {
        this.container = document.getElementById('drag_container')
        this.targeter = document.getElementById('drag_target')
      },
      methods: {
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