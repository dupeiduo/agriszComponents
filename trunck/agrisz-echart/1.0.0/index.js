module.exports = function() {
  return {
    name: 'my-echart',
    prop: {
      props: ['options'],
      template: '<div></div>',
      mounted: function () {
        var vm = this
        
        if (vm.options) {
          let myCharts = echarts.init(vm.$el)
          myCharts.setOption(vm.options);
        }
      },
      watch: {
        options: function (options) {
          var vm = this
          if (vm.options) {
            let myCharts = echarts.init(vm.$el)
            myCharts.setOption(vm.options);
          }
        }
      },
      destroyed: function () {
        console.log('destroy')
      },
      methods: {
         
      }
    }
  }
}