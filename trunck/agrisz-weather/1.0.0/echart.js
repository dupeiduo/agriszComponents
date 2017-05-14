module.exports = {
  skycon: [ "CLEAR_DAY", "CLEAR_NIGHT", "PARTLY_CLOUDY_DAY",
      "PARTLY_CLOUDY_NIGHT", "CLOUDY", "RAIN", "SNOW", "WIND", "FOG"],

  skyconZhs: ["晴", "晴", "多云", "多云", "阴", "雨", "雪", "风", "雾"],
  skyconIcons: [ "icon-tianqitubiao_qing", "icon-qingye", "icon-tianqitubiao_duoyun", 
                 "icon-wanshangtubiao_wanshangduoyun", "icon-tianqitubiao_yin", 
                 "icon-tianqitubiao_zhongyu", "icon-tianqitubiao_zhongxue", 
                 "icon-fengxiang", "icon-tianqitubiao_wu",
               ],
  skyconColors: ["#E0AB05", "#E0AB05", "#6565A8", "#6565A8", "#6565A8", "#1291F9", "#3BADE0", "#333", "#516865"],          
  skyconIndex: -1,
  setCurrentSkycon(key) {
    this.skyconIndex = this.skycon.indexOf(key)
  },
  getSkyconZh() {
    return this.skyconZhs[this.skyconIndex]
  },
  getSkyconIcon() {
    return this.skyconIcons[this.skyconIndex]
  },
  getSkyconColor() {
    return this.skyconColors[this.skyconIndex]
  },
  getAqi(aqi) {
    var content = '',
      color = ''

    if (aqi <= 50 ) {
      content = "空气质量优"
      color = "#02e300"
    } else if (aqi <= 88 ) {
      content = "空气质量良"
      color = "#d3d302"
    } else if (aqi <= 100 ) {
      content = "空气轻度污染"
      color = "ff790d"
    } else if (aqi <= 150 ) {
      content = "空气中度污染"
      color = "#fd0100"
    } else if (aqi <= 200 ) {
      content = "空气重度污染"
      color = "#660066"
    } else if (aqi <= 300 ) {
      content = "空气严重污染"
      color = "#950251"
    } else {
      content = "出门请防毒"
      color = "#55000c"
    }

    return {content, color}
  },
  getTempChartData(hourly) {
    var xAxis = [], 
      yAxis = [], 
      icons = [],
      options = []

    for (var i = 0; i < hourly.temperature.length; i++) {
      xAxis[i] = this.getHoursByDateStr(hourly.temperature[i].datetime)
      yAxis[i] = Number(hourly.temperature[i].value).toFixed(0)
    }

    icons = this.getIcons(hourly.skycon)
    options = this.tempChart(xAxis, yAxis, icons)

    return {options, icons}
  },
  getWindChartData(wind) {
    var xAxis = [], 
      yAxis = []

    for (var i = 0; i < wind.length; i++) {
      var name = this.getWindContent(wind[i].direction, wind[i].speed),
        value = this.getWindlevel(wind[i].speed)

      xAxis[i] = this.getHoursByDateStr(wind[i].datetime)
      yAxis[i] = {name, value}
    }

    return this.windChart(xAxis, yAxis)
  },
  getFiveDaysChartData(daily) {
    var xAxis = [], 
      yAxisArr = [],
      xTitle = [],
      options = null

    yAxisArr[0] = []
    yAxisArr[1] = []

    for (var i = 0; i < daily.temperature.length; i++) {
      xAxis[i] = this.getWeekDayByDate(daily.temperature[i].date)
      yAxisArr[0][i] = Number(daily.temperature[i].max).toFixed(0)
      yAxisArr[1][i] = Number(daily.temperature[i].min).toFixed(0)

      xTitle[i] = this.getXTitle(daily.skycon[i].date, daily.skycon[i].value)
    }

    options = this.fiveDaysChart(xAxis, yAxisArr)
    return {options, xTitle}
  },
  getRainLevel(intensity) {
    var rain = null
    if (intensity <= 0.9 && intensity > 0.05) {
      rain = {intensity: "小雨", level: 1, icon: "icon-tianqitubiao_xiaoyu", color: "#1291F9"}

    } else if (intensity > 0.9 && intensity < 2.87)  {
      rain = {intensity: "中雨", level: 2, icon: "icon-tianqitubiao_zhongyu", color: "#1291F9"}

    } else if (intensity > 2.87)  {
      rain = {intensity: "大雨", level: 3, icon: "icon-tianqitubiao_dayu", color: "#1291F9"}

    }
    return rain
  },
  getHoursByDateStr(dateStr) {
    var hours = dateStr.toString().split(' ')[1]

    return hours
  },
  getIcons(skycon) {
    var icons = [],
      pre = '',
      cur = ''
    for (var i = 0; i < skycon.length; i++) {
      cur = skycon[i].value
      if (cur === pre) {
        icons.push('')
      } else {
        pre = cur
        icons.push(cur)
      }
    }

    return icons
  },
  getWindContent(direction, speed) {
    var direc = this.getWindDirection(direction),
      speedLevel = this.getWindlevel(speed),
      content

    if (speedLevel === 0) {
      content = "无风"

    } else {
      content = direc + "风" + speedLevel + '级'
    }

    return content
  },
  getWindlevel(speed) {
    var meterPerSecond = speed * 5 / 18,
      speedLevel = 0

    var levelSource = [
                        [0, 0.2], [0.3, 1.5], [1.6,3.3], [1.6,3.3],
                        [3.4, 5.4], [5.5, 7.9], [8 ,10.7], [10.8 ,13.8],
                        [13.9, 17.1], [17.2, 20.7], [20.8,24.4], [24.5, 28.4],
                        [28.5, 32.6], [32.7, 36.9]
                      ]

    for (var i = 0; i < levelSource.length; i++) {
      if (meterPerSecond > 37) {
        speedLevel = 12
        break

      } else if (meterPerSecond <= 0.2) {
        speedLevel = 0
        break

      } else if (meterPerSecond <= levelSource[i][1]) {
        speedLevel = i + 1
        break
      }
    }            
    return speedLevel
  },
  getWindDirection(direction) {
    var windDire

    var direcArr = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"]
    var direcGrade = [[350, 10], [10, 80], [80, 100], [100, 170], [170, 190], 
                      [190, 260], [260, 280], [280, 350]]

    for (var i = 0; i < direcGrade.length; i++) {
      if (i === 0) {
        if (direction >= direcGrade[i][0] || direction <= direcGrade[i][1]) {
          windDire = direcArr[i]
          break
        }

      } else if (direction <= direcGrade[i][1] && direction > direcGrade[i][0]) {
        windDire = direcArr[i]
        break
      }
    }

    return windDire
  },
  getWeekDayByDate(date) {
    var day = date.substr(5).replace(/-/, '/'),
      dayStr = this.getDayStr(date)

    return dayStr + day
  },
  getXTitle(date, skycon) {
    this.setCurrentSkycon(skycon)
    var week = this.getDayStr(date),
      date = date.substr(5).replace(/-/, '/'),
      name = this.getSkyconZh(),
      color = this.getSkyconColor(),
      icon = this.getSkyconIcon()

    return {week, date, name, color, icon}
  },
  getDayStr(date) {
    var nearly = ["今天", "明天", "后天"],
      weeks = ["周日","周一","周二","周三","周四","周五","周六"],
      day,
      cur = new Date().getDate(),
      targ = parseInt(date.slice(-2)),
      index = new Date(date).getDay()


    if (cur === targ) {
      day = nearly[0]

    } else if (cur === targ - 1) {
      day = nearly[1]
    } else if (cur === targ - 2) {
      day = nearly[2]
    } else {
      day = weeks[index]
    }

    return  day
  },
  getSkycon(key) {
    // TODO: add color and icons
    var icon = "icon-tianqitubiao_wu", 
      color = "#999",
      skyconZh = "晴天";

    var skycon = [ "CLEAR_DAY", "CLEAR_NIGHT", "PARTLY_CLOUDY_DAY",
      "PARTLY_CLOUDY_NIGHT", "CLOUDY", "RAIN", "SNOW", "WIND", "FOG"]

    var skyconZhs = ["扬沙","小转中雪","小雨","小雪","沙尘暴","雾","晴天","日出","强沙尘暴","霾","雷阵雨带冰雹","浮沉","多云","雷阵雨","大雪","冻雨","暴雪","大转暴雪","大转暴雨","大雨","暴雨","中转大雪","阵雪","晚上阵雨","中雪","中转大雨","晚上多云","阵雪","雨夹雪","阵雨","中雨","阴"]

    var icons = [ "icon-tianqitubiao_yangsha","icon-tianqitubiao_xiaozhuanzhongxue","icon-tianqitubiao_xiaoyu","icon-tianqitubiao_xiaoxue","icon-tianqitubiao_shachenbao","icon-tianqitubiao_wu","icon-tianqitubiao_qing","icon-tianqitubiao_richu",
                  "icon-tianqitubiao_qiangshachenbao","icon-tianqitubiao_mai","icon-tianqitubiao_leizhenyudaibingbao","icon-tianqitubiao_fuchen","icon-tianqitubiao_duoyun","icon-tianqitubiao_leizhenyu","icon-tianqitubiao_daxue","icon-tianqitubiao_dongyu",
                  "icon-tianqitubiao_baoxue","icon-tianqitubiao_dazhuanbaoxue","icon-tianqitubiao_dazhuanbaoyu","icon-tianqitubiao_dayu","icon-tianqitubiao_baoyu","icon-tianqitubiao_zhongzhuandaxue","icon-wanshangtubiao_zhenxue","icon-wanshangtubiao_wanshangzhenyu",
                  "icon-tianqitubiao_zhongxue","icon-tianqitubiao_zhongzhuandayu","icon-wanshangtubiao_wanshangduoyun","icon-tianqitubiao_zhenxue","icon-tianqitubiao_yujiaxue","icon-tianqitubiao_zhenyu","icon-tianqitubiao_zhongyu","icon-tianqitubiao_yin"
    ]
    
    var colors = ["#576e6b","#3aaee1","#3c97f9","#449bf9","#3aace0","#4a635f","#506866","#e3b022",
                  "#f9c417","#de4500","#63533f","#2270a0","#556c6a","#7b7bb5","#2370a0","#3aade0",
                  "#327ca8","#43b1e1","#4db5e4","#52a2f9","#3594f9","#3391f8","#4cb4e2","#36abe0",
                  "#4a9ef9","#3cade0","#3593f9","#6566a8","#4bb4e3","#54b6e3","#409ef9","#4cabf9",
                  "#6d6fac"
    ]
    
    for (var i = 0; i < skycon.length; i++) {
      if (key === skycon[i]) {
        skyconZh = skyconZhs[i]
        icon = icons[i]
        color = colors[i] 
      }
    }

    return {icon, color, skyconZh}
  },
  tempChart(xAxis, yAxis, icons) {
    var option = {
      tooltip: {
        show: false,
        trigger: 'axis',
        formatter:'最高气温:{c}℃',
      },
      color: ['#61afd1'],
      grid: {
        bottom: '65px',
        height: '100px',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxis,
        splitLine: {
          show: true,
          interval: 0,
          lineStyle: {
            color: '#afafaf',
            type: 'dotted'
          }
        },
      },
      yAxis: {
        show: false
      },
      dataZoom: [{ 
        type: 'slider',
        start: 0,
        end: 6.25,
        backgroundColor: '#f6f6f6',
        fillerColor: '#659be3',
        borderColor: '#dee4e8',
        bottom: '1%',
        showDetail: false,
        dataBackground: {
          lineStyle: {
            width:0,
          },
          areaStyle: {
            opacity: 0
          }
        },
        handleIcon: 'M8.2,13.6V3.9H6.3v9.7H3.1v14.9h3.3v9.7h1.8v-9.7h3.3V13.6H8.2z M9.7,24.4H4.8v-1.4h4.9V24.4z M9.7,19.1H4.8v-1.4h4.9V19.1z',
        handleSize: '100%',
        zoomLock: true,
         handleStyle: {
            opacity: 0,
        }

      }],
      label: {
        normal: {
          show: true,
          formatter: '{c} ℃',
          textStyle: {
            color: '#000'
          }
        }
      },
      series: [{
        name: '最高气温',
        type: 'line',
        data: yAxis,
      }]
    };
    return option
  },
  windChart(xAxis, yAxis) {
    var option = {
      color: ['#000'],
      xAxis: [{
        type: 'category',
        data: xAxis,
        axisTick: {
          alignWithLabel: true
        }
      }],
      grid: {
        width: '260px',
        bottom: '65px',
        left: '2px',
        height: '100px',
      },
      yAxis: [{
        show: false,
      }],
      dataZoom: [{ 
        type: 'slider',
        start: 0,
        end: 6.25,
        backgroundColor: '#f6f6f6',
        fillerColor: '#659be3',
        borderColor: '#dee4e8',
        bottom: '1%',
        showDetail: false,
        dataBackground: {
          lineStyle: {
            width:0,
          },
          areaStyle: {
            opacity: 0
          }
        },
        handleIcon: 'M8.2,13.6V3.9H6.3v9.7H3.1v14.9h3.3v9.7h1.8v-9.7h3.3V13.6H8.2z M9.7,24.4H4.8v-1.4h4.9V24.4z M9.7,19.1H4.8v-1.4h4.9V19.1z',
        handleSize: '100%',
        zoomLock: true,
         handleStyle: {
            opacity: 0,
        }

      }],
      series: [{
        animation: false,
        name: '风向风速',
        type: 'bar',
        barWidth: '1px',
        data: yAxis,
        itemStyle: {
          normal: {
            color: '#ddd'
          }
        },
        label: {
          normal: {
            show: true,
            position: 'top',
            formatter: function(params) {
                return params.data.name
            },
            textStyle: {
              color: '#000',
            }
          }
        },
      }]
    };
    return option
  },
  fiveDaysChart(xAxis, yAxisArr) {
    var option = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        bottom: '25px',
        height: '120px',
      },
      xAxis: {
        show: true,
        type: 'category',
        boundaryGap: false,
        data: xAxis,
        splitArea: {
            show: true
        },
        splitLine: {
          show: true,
          interval: 0,
          lineStyle: {
            color: '#afafaf',
            type: 'dotted'
          }
        },
        axisLabel: {
          textStyle: {
            color: '#fff'
          }
        }
      },
      yAxis: {
        show: false,
        type: 'value',
        axisLabel: {
          formatter: '{value} °C'
        },
        min: Math.min.apply(yAxisArr[1], yAxisArr[1]) - Math.max.apply(yAxisArr[0], yAxisArr[0]) * 0.15,
        max: Math.max.apply(yAxisArr[0], yAxisArr[0]) * 1.15
      },
      series: [{
        name: '最高气温',
        type: 'line',
        data: yAxisArr[0],
        label: {
          normal: {
            show: true,
            position: 'top',
            formatter: '{c} ℃',
          }
        }
      }, {
        name: '最低气温',
        type: 'line',
        data: yAxisArr[1],
        label: {
          normal: {
            show: true,
            position: 'bottom',
            formatter: '{c} ℃',
          }
        }
      }]
    };
    return option
  }
}