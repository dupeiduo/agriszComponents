module.exports = function () {
  return {
    name: 'my-photozoom',
    prop: {
      data () {
        return {
          value: 100,
          maxValue: 1200,
          minValue: 10,
          imgHeight: null,
          zoomContent: null,
          zoomTargeter: null,
          left: 0,
          top: 0,
          disX: 0,
          disY: 0,
          draging: false
        }
      },
      template: `<div>
					<my-dialog class="photo-zoom dialog-bg"
            v-show="showPhoto"
						:width="'470'"
            :height="'347'"
						:padBottom="'0px'"
						:titleHeight="'auto'"
						:titlePadding="'20px 8px 18px 16px'"
            :useModal="false"
            @close="hideZoomControl"
						>
						<h3 slot="title" class="photo-zoom-title no-select">拍摄于{{imageDate}}</h3>
						<div class="pr zoom-content"  slot="content" >
              <div class="zoom-line"></div>
							<div class="zoom-button clear ps">
								<span class="iconfont icon-fangda fl" @click="zoomIn(maxValue)"></span>
								<span class="iconfont icon-minus fl" @click="zoomOut(minValue)"></span>
							</div>
							<div class="photo-zoom-content no-select pr"
                @mousedown="dragZoom($event)"
                @mousemove="figureLenth"
                @mouseup="clearDrag">
                <img id="photo-zoom-image" 
                     :src="imageUrl" 
                     :style="{width: value + '%', left: left + '%', top: top + '%'}"
                     
                  />
              </div>
						</div>
					</my-dialog>
				</div>`,
      props: {
        imageDate: {
    			type: String,
    			default: '2015-06-8'
  		  },
        imageUrl: {
          type: String,
          default: '/static/assets/img/home/banner2.jpg'
        },
        showPhoto: {
          type: Boolean,
          default: true
        }
      },
      mounted() {
        this.zoomTargeter = document.getElementById('photo-zoom-image')
      },
      methods: {
        hideZoomControl(){
          this.$emit('hideZoomControl')
        },
      	zoomIn(){
      		this.value += 20
      		if(this.value >= this.maxValue){
      			this.value = this.maxValue
      		}
      	},
      	zoomOut(){
      		this.value -= 20
      		if(this.value <= this.minValue ){
      			this.value = this.minValue
      		}
      	},
        getCssValue(element, propertyName) {
          return element.currentStyle ? 
                 element.currentStyle[propertyName] : 
                 document.defaultView.getComputedStyle(element ,false)[propertyName]; 
        },
        dragZoom(event){
          event = event || window.event; 
          this.disX = event.clientX
          this.disY = event.clientY 
          this.draging = true
        },
        figureLenth(event) {
          if (this.draging) {
            event = event || window.event; 

            var moveLeft = event.clientX - this.disX;
            var moveTop = event.clientY - this.disY;
            
            this.left += moveLeft
            this.top += moveTop

            this.disX = event.clientX
            this.disY = event.clientY
          }
        },
        clearDrag() {
          this.draging = false
        }
      },
      watch: {
        
      }
    }
  }
}