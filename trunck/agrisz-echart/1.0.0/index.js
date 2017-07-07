module.exports = function() {
  return {
    name: 'my-echart',
    prop: {
      props: ['options'],
      template: '<div class="echart-common-settings"></div>',
      mounted: function () {
        if (this.options) {
          this.myCharts = echarts.init(this.$el)
          this.myCharts.setOption(this.options);

          this.initEvents()
        }
      },
      watch: {
        options: function (options) {
          if (this.options) {
            this.myCharts = echarts.init(this.$el)
            this.myCharts.setOption(this.options);

            this.initEvents()
          }
        }
      },
      destroyed: function () {
        if (this.myCharts && this.myCharts.off) {
          this.myCharts.off('datazoom', this.datazoom);
          console.log('destroy')
        }
      },
      methods: {
        initEvents() {
          this.myCharts.on('datazoom', this.datazoom);
        },
        datazoom(params) {
          this.$emit("datazoom", params)
        }
      }
    }
  }
}