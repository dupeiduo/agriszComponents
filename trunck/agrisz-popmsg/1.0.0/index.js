module.exports = function () {
  return {
    name: 'pop-message',
    prop: {
      template: `<div class="pop-message" :class="className" >{{popTitle}}</div>`,
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
          className: ''
        }
      },
      methods: {
        showDialog(){
          if (this.timeHandler) {
            this.className = 'pop-message-show'
            clearTimeout(this.timeHandler)
          }
          this.className = 'pop-message-show'
          this.timeHandler = setTimeout(() => {
            this.className = 'pop-message-show fadeout'
          }, this.showTime - 1000)
        }
      }
    }
  }
}