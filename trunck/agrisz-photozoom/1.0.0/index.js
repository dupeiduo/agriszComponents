module.exports = function () {
  return {
    name: 'my-photozoom',
    prop: {
      data () {
        return {
          value: 1,
          maxValue: 20,
          minValue: 0.1,
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
            @close="hidePhotoZoom"
						>
						<h3 slot="title" class="photo-zoom-title no-select">拍摄于{{imageDate}}</h3>
						<div class="pr zoom-content"  slot="content" >
              <div class="zoom-line"></div>
							<div class="zoom-button clear ps">
								<span class="iconfont icon-fangda fl" @click="bigZoom(maxValue)"></span>
								<span class="iconfont icon-minus fl" @click="smallZoom(minValue)"></span>
							</div>
							<div class="photo-zoom-content no-select" :style="{height: imgHeight}"> 
								<img :src="imageUrl" width="100%" :style="{ transform: 'scale('+value+','+value+')'}"/>
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
        },
        imgHeight: {
          type: String,
          default: '246px'
        }
      },
      methods: {
        hidePhotoZoom(){
          this.$emit('hidePhotoZoom')
        },
      	bigZoom(){
      		this.value += 0.5
      		if(this.value >= this.maxValue){
      			this.value = this.maxValue
      		}
      	},
      	smallZoom(){
      		this.value -= 0.5
      		if(this.value <= this.minValue ){
      			this.value = this.minValue
      		}
      	}
      },
      watch: {
        
      }
    }
  }
}