'use strict';
import echart from './echart.js'

module.exports = function (request) {
  return {
    name: 'agrisz-weather',
    prop: {
      template: `<div class="weather-tool-common map-zIndex" :style="{top: top + 'px', right: right + 'px'}">
                  <div class="weather-brief">
                    <template v-if="loading">
                      <div class="fore-loading-container">
                        <span class="fore-loading-icon" v-loading.lock="loading"></span>
                        <span class="fore-loading-content">加载中...</span>
                      </div>
                    </template>
                    <template v-else-if="noData">
                      <div class="no-data-container">
                        <span class="no-data-content">暂无该地天气数据</span>
                      </div>
                    </template>
                    <template v-else>
                      <el-tooltip :content="realtimeSkycon" placement="bottom" effect="light">
                        <span class="iconfont pointer weather-icon" 
                          :class="realtimeIcon"
                          :style="{color: realtimeColor}"
                          @click="togglePanel(0)"></span>
                      </el-tooltip>
                      <span class="temprature pr pointer no-select" @click="togglePanel(1)">{{minMaxTemperature}}℃</span>
                      <span class="split-line">|</span>
                      <el-tooltip :content="currentPosition" placement="bottom" effect="light">
                        <span class="area-name ps">{{currentPosition}}</span>
                      </el-tooltip>
                    </template>
                  </div>
                  <div v-if="showDetail" class="weather-detail border-common-radius box-common-shadow pr clear" :style="{height: panelHeight + 'px'}">
                    <ul class="weather-menu">
                      <li class="no-select pr" v-for="(item, index) in panelList" 
                        @click="openPanel(index)"
                        :class="panelIndex === index ? 'active': ''"
                        :label="item.label" :name="item.name">
                        <span class="tool-pop-arrow ps"></span>
                        {{item.label}}
                      </li>
                    </ul>
                    <img class=" morecolor-cloud ps" src="/static/assets/img/weather/morecolor-cloud.png" :style="{bottom: panelBottom + '%'}"/>
                    <div v-if="panelIndex === 0" class="real-time-wrap pr">
                      <div class="real-time pr">
                       <h3 class="real-time-name">{{temperature | toFixedZero}}</h3>
                       <span class="real-time-degree ps">℃</span>
                       <span class="real-time-status ps cloud-icon">{{realtimeSkycon}}</span>
                      </div>
                      <p class="real-time-right ps">
                        <span><i class="iconfont icon-fengxiang wind-icon"></i><em v-html="windContent"></em></span>
                        <span><i class="iconfont icon-shidu moisture-icon"></i>湿度 <b>{{humidity}}</b></span>
                        <span style="position: relative; top: -2px">AQI:&nbsp;&nbsp;<em :style="{color: pm25.color}">{{pm25.content}}</em></span>
                      </p>
                      <div v-if="warnInfo.exist" class="warn-info">
                        <template  v-for="item in warnInfo.content">
                            <p>{{item}}</p>
                        </template>
                      </div>
                      <div v-else class="real-time-introduce">
                        {{forecastContentBefore}}<i>{{forecastContentAfter}}</i><span class="iconfont" :class="forecastIcon" :style="{color: forecastColor}"></span>
                      </div>
                    </div>
                    <div v-else-if="panelIndex === 1" class="five-prediction">
                      <div class="weather-forecast clear">
                        <span class="fl font14">今天</span>
                        <span class="fl status">
                          <i class="iconfont" 
                             :class="detailData[0].icon"
                             :style="{color: detailData[0].color}"
                             >
                          </i>{{detailData[0].name}}</span>
                        <em class="fr">{{detailData[0].min}}℃ 到 {{detailData[0].max}}℃</em>
                      </div>
                      <ul class="weather-time clear">
                          <li v-for="(item,index) in weatherTime">
                            <em>{{index === 0 ? '现在':item.hourly + '点'}}</em>
                            <i class="iconfont" :class="item.icon" :style="{color:item.color}"></i>
                            <span>{{item.tem.toFixed(0)}}℃</span>
                          </li>
                      </ul>
                      <ul class="week-weather">
                        <li v-for="item in detailData.slice(1)" class="clear">
                          <span class="fl font14">{{item.week}}</span>
                          <span class="fl status">
                            <i class="iconfont" 
                               :class="item.icon"
                               :style="{color: item.color}"
                               >
                            </i>{{item.name}}</span>
                          <em class="fr">{{item.min}}℃ 到 {{item.max}}℃</em>
                        </li>
                      </ul>
                      <div class="clear weather-icon">
                        <router-link :to="'/weather?position='+center.join(',')+'&zoom='+zoom" class="more-weather fr">更多预报<i class="iconfont icon-icon-copy-copy"></i></router-link>
                      </div>
                    </div>
                    <div v-else>
                      -出错了啦！-
                    </div>
                  </div>
                </div>`,
      props: {
        top: {
          type: Number,
          default: 60
        },
        right: {
          type: Number,
          default: 385
        },
        weatherInfo: {
          type: Object,
          default: {}
        },
        showDetail: {
          type: Boolean,
          default: false
        },
        centerInfo: {
          type: Object,
          default: null
        }
      },
      data: function data() {
        return {
          center: [],
          zoom: 0,

          panelIndex: 0,
          curPanel: '',
          className: '',
          panelHeight: null,
          panelBottom: null,
          panelList: [
            {
              label: "实时天气",
              name: "first"
            },
            {
              label: "天气预报",
              name: "second"
            }
          ],
          windContent: "", //风向
          humidity: 0, // 湿度
          realtimeIcon: "icon-tianqitubiao_qing",
          realtimeColor: "#c6b56d",
          currentPosition: "……",
          realtimeSkycon: '晴天', // 天气

          minMaxTemperature: '9/20',
          pm25: 0,
          temperature: 0,

          forecastContentBefore: "",
          forecastContentAfter: "",
          forecastIcon: "icon-tianqitubiao_dongyu",
          forecastColor: "#376786",

          warnInfo: {
            exist: false,
            warnContent: ''
          },
          windChartData: [],
          tempChartData: [],
          fiveDaysChartData: {},
          fiveDaysIcons: [],

          dailyLen: 0,

          iconsPosition: 0,
          totalWidth: 0,

          rainLevel: 0,

          detailTotalWidth: 0,
          detailiconsPosition: 0,

          detailData: [],
          reqTimeHandler: null,
          loading: true,
          noData: false,
          realtimeReq: null,
          forecastReq: null,
          positionReq: null,
          detaiData: [],
          weatherTime: []
        };
      },
      mounted() {},
      filters: {
        toFixedZero(value) {
          return value.toFixed(0)
        },
      }, 
      methods: {
        initReq({center, zoom}) {
          if (center.length === 2) {
            var lonlat = ol.proj.toLonLat(center),
              grade = zoom > 9 ? 4 : 3

            if (this.realtimeReq || this.forecastReq || this.positionReq) {
              this.positionReq.cancelRequest("cancel request")
              this.realtimeReq.cancelRequest("cancel request")
              this.forecastReq.cancelRequest("cancel request")
            } 

            this.doRequest(lonlat, grade)
          }
        },
        doRequest(lonlat, grade) {
          this.loading = true
          this.realtimeReq = request.weatherRealtime(lonlat)
          this.forecastReq = request.weatherForecast(lonlat)
          this.positionReq = request.weatherPosition(lonlat, grade)

          Promise.all([
            this.realtimeReq,
            this.forecastReq,
            this.positionReq
          ])
          .then(([realtimeData, forecastData, positionData]) => {

            if (positionData.status === 200 && positionData.data.status === 0) {
              this.currentPosition = positionData.data.data[grade]
              if(realtimeData && realtimeData.status === 200 && realtimeData.data.status === 0 && realtimeData.data.data.status === "ok") {                
                this.renderRealtimeWeather(realtimeData.data.data.result)
              }  
              if(forecastData && forecastData.status === 200 && forecastData.data.status === 0 && forecastData.data.data.status === "ok") {
                this.renderForecastWeather(forecastData.data.data.result)
              }
              this.noData = false

            } else {
              this.noData = true
            }

            this.loading = false
            this.realtimeReq = null
            this.forecastReq = null
            this.positionReq = null
          })
          .catch((reason) => {
            this.noData = true
            this.loading = false
            console.log("No current position data. The error is", reason)
          });
        },
        renderRealtimeWeather(data) {
          this.temperature = data.temperature
          this.pm25 = echart.getAqi(data.aqi)
          this.humidity = Number(data.humidity * 100).toFixed(0) + '%'
          this.windContent = echart.getBoldWindContent(data.wind.direction, data.wind.speed)
          
          var rain = data.precipitation.local.intensity
          this.renderRainInfo(rain, data.skycon)
        },
        renderForecastWeather(data) {
          var warnInfo = this.setWarnInfo(data.alert)
          this.warnInfo = warnInfo
          this.setChartsData(data)

          this.minMaxTemperature = (data.daily.temperature[0].min).toFixed(0) + '/' + 
                                 (data.daily.temperature[0].max).toFixed(0)

          if (!this.warnInfo.exist && this.rainLevel === 0) {
            this.setForecastInfo(data.minutely.precipitation)
          }
        },
        renderRainInfo(rain, skycon) {
          if (rain > 0.05) {
            var rainInfo = echart.getRainLevel(rain)
            
            this.rainLevel = rainInfo.level
            this.realtimeSkycon = rainInfo.intensity
            this.realtimeIcon = rainInfo.icon
            this.realtimeColor = rainInfo.color

            this.forecastContentBefore = "正在下雨"
            this.forecastContentAfter = ""
            this.forecastIcon = rainInfo.icon

          } else {
            echart.setCurrentSkycon(skycon)
            this.rainLevel = 0
            this.realtimeSkycon = echart.getSkyconZh()
            this.realtimeIcon = echart.getSkyconIcon()
            this.realtimeColor = echart.getSkyconColor()
          }
        },
        setChartsData(data) {
          var tempChartInfo = echart.getTempChartData(data.hourly)
          this.tempChartData = tempChartInfo.options

          this.windChartData = echart.getWindChartData(data.hourly.wind)

          var fiveDaysInfo = echart.getFiveDaysChartData(data.daily)
          this.fiveDaysChartData = fiveDaysInfo.options
          this.detailData = fiveDaysInfo.xTitle
          this.dailyData = data.daily.temperature
          this.weatherTime = []
          
          var hourIndexs = [0, 5, 10, 15, 20, 25]
          for (var i = 0; i < hourIndexs.length; i++) {
            var _skycon = data.hourly.skycon[hourIndexs[i]].value
            echart.setCurrentSkycon(_skycon)
            var dateStr = data.hourly.temperature[hourIndexs[i]].datetime
            var hourly = this.getHour(dateStr)
            var tem = data.hourly.temperature[hourIndexs[i]].value
            var name = echart.getSkyconZh()
            var icon = echart.getSkyconIcon()
            var color = echart.getSkyconColor()
            this.weatherTime.push({hourly, tem, name, icon, color})
          }
          for(var i = 0;i < this.detailData.length; i++){
            this.detailData[i].min = this.dailyData[i].min.toFixed(0)
            this.detailData[i].max = this.dailyData[i].max.toFixed(0)
          } 
          this.dailyLen = data.daily.temperature.length
        },
        getHour(dateStr) {
          var time = dateStr.split(' ')[1]
          var hour = time.split(':')[0]
          hour = parseInt(hour)

          return hour
        },
        dailyZoomEvent(params) {
          this.setTitleIconPosition(params.start)
        },
        setTitleIconPosition(start) {
          var len = this.dailyLen,
            width = 260,
            inscreen = 4,
            eachWidth = width / inscreen,
            moveLength

          this.detailTotalWidth = eachWidth * len;
          this.detailiconsPosition = -(this.detailTotalWidth * start / 100)
        },
        setWarnInfo(alert) {
          var warnInfo = {}
          
          if (alert && alert.status === "ok" && alert.content.length > 0) {
            warnInfo.content = []
            warnInfo.content.length = alert.content.length
            this.panelHeight = warnInfo.exist ? alert.content.length * 20 + 178 : 178
            warnInfo.exist = true
            
            for (var i = 0; i < alert.content.length; i++) {
              console.log(alert.content[i].title)
              warnInfo.content[i] = alert.content[i].title
            }
          } else {
            warnInfo.exist = false
            warnInfo.content = []
          }
          
          return warnInfo
        },
        getWarnContent(status, location, code) {
          var type = ["台风","暴雨","暴雪","寒潮","大风","沙尘暴","高温","干旱","雷电","冰雹","霜冻","大雾","霾","道路结冰","森林火灾","雷雨大风"]
          var level = ["蓝色","黄色","橙色","红色"]
          var tIndex = parseInt(code.toString().substr(0,2))
          var lIndex = parseInt(code.toString().substr(2,2))

          return `${location}${type[tIndex]}${level[lIndex]}${status}`
        },
        setForecastInfo(precipitation) {
          for (var i = 0; i < precipitation.length; i++) {
            if (precipitation[i] > 0.05) {
              var rainInfo = echart.getRainLevel(precipitation[i])
              this.forecastContentBefore = (i + 1) + "分钟后可能会下" + rainInfo.intensity
              this.forecastContentAfter = ""
              this.forecastIcon = rainInfo.icon
              this.forecastColor = rainInfo.color

              break
            }
          }
          this.forecastContentBefore = "未来的一小时不会下雨"
          this.forecastContentAfter = ""
          this.forecastIcon = ""
        },
        togglePanel(index) {
          this.$emit('toggleWeaDetail', !this.showDetail)
          this.openPanel(index)
          console.log(index)
        },
        openPanel(index) {
          this.panelIndex = index
          if (index === 0) {
            this.panelHeight = 180
            this.panelBottom = 4
          } else {
            this.setTitleIconPosition(0)
            this.panelHeight = 306
            this.panelBottom = 2
          }
        },
        infoChanged(info) {
          var changed = false

          if (this.zoom !== info.zoom) {
            if (info.zoom < 9 && this.zoom >= 9 || info.zoom >= 9 && this.zoom < 9) {
              changed = true
            }
          }

          if (this.center.length > 0) {
            if (this.center[0].toFixed(7) !== info.center[0].toFixed(7) && this.center[1].toFixed(7) !== info.center[1].toFixed(7)) {
              changed = true
            }
          } else {
            changed = true
          }
          
          return changed
        }
      },
      watch: {
        centerInfo(info) {
          if (this.infoChanged(info)) {

            if (this.reqTimeHandler) {
              clearTimeout(this.reqTimeHandler)
              this.reqTimeHandler = null
            }

            this.reqTimeHandler = setTimeout(()=> {
              this.zoom = info.zoom
              this.center = info.center

              this.reqTimeHandler = null
              this.initReq(info)
            }, 300)
          }
        }
       }
    }
  };
};