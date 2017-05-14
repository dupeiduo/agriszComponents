module.exports = function (formatData, dateUtil, configData) {
  return {
    formatAreas: function (data) {
      if (data.status == '0') {
        var _count = 0
        for (var i = 0; i < data.data.length; i++) {
          if (data.data[i].is_exist == 1) {
            _count += data.data[i].market_count
          }
        }
        if (data.data[0].area_name !=="全国") {
          data.data.sort(compareStr);
          data.data.unshift({
            area_id: "000000",
            area_name: "全国",
            is_exist: 1,
            market_count: _count
          });
        }
        return data.data;
      } else {
        return [];
        console.log(data.error_msg); 
      }

      function compareStr(obj1, obj2) {
        var str1 = pinyin.getCamelChars(obj1.area_name[0]);
        var str2 = pinyin.getCamelChars(obj2.area_name[0]);
        if (str1.localeCompare(str2) === 0) {
          return (str1 > str2);
        } else {
          return str1.localeCompare(str2);
        }
      }
    },
    formatMarkets: function(data) {
      var markets = {}
      if (data.total_page == 0) {
        markets = null;
      } else {
        var _data = data.market_datas;
        markets.totalPage = data.total_page;
        markets.data = [];

        for (var i = 0; i < _data.length; i++) {
          markets.data[i] = {};
          markets.data[i].market_id = _data[i].market_id;
          markets.data[i].market_name = _data[i].market_name;
          markets.data[i].market_name = _data[i].market_name;
          markets.data[i].farm_product_name = data.farm_product_name;


          markets.data[i].rateFlag = configData.market.rateFlag[_data[i].date_flag];
          if (!_data[i].cur_price) {
            markets.data[i].cur_price = '<span class="no-cur-data">-暂无-</span>';
            markets.data[i].desc = '<span class="no-cur-data">-暂无-</span>';
            markets.data[i].color = 'market-gray';
          } else { 
            markets.data[i].price = _data[i].cur_price.toFixed(2);
            if (_data[i].cur_price - _data[i].pre_price == 0) {
              markets.data[i].color = 'crop-trend';
              markets.data[i].desc = '持平';
              markets.data[i].image = 'iconfont icon-chiping crop-trend';
              markets.data[i].delta = '';
            } else if (_data[i].cur_price - _data[i].pre_price > 0) {
              markets.data[i].color = 'crop-up';
              markets.data[i].image = 'iconfont icon-shangsheng crop-up';
              markets.data[i].desc = '上升' + Number(_data[i].ratio).toFixed(2) + '%';
              markets.data[i].delta = (_data[i].cur_price - _data[i].pre_price).toFixed(2);
            } else {
              markets.data[i].color = 'crop-down';
              markets.data[i].image = 'iconfont icon-xiajiang crop-down';
              markets.data[i].desc = '下降' + Number(_data[i].ratio).toFixed(2) + '%';
              markets.data[i].delta = (_data[i].pre_price - _data[i].cur_price).toFixed(2);
            }
          }
        }
      }
      return markets
    },
    formatAvgPrice: function (data) {
      var result = [];
      if (data.status == '0') {
        for (var i = 0; i < data.data.length; i++) {
          result[i] = {};
          result[i].farm_product_name = data.data[i].farm_product_name;
          result[i].farm_product_id = data.data[i].farm_product_id;
          result[i].date = data.data[i].date.split(' ')[0];
          if (data.data[i].cur_price == -1) {
            result[i].cur_price = "-";
            result[i].delta = "";
            result[i].ratio = "-";
          } else {
            result[i].cur_price = Number(data.data[i].cur_price).toFixed(1);
            if (data.data[i].ratio < 0) {
              result[i].delta = "xiajiang crop-down";
              result[i].ratio = -Number(data.data[i].ratio).toFixed(1);
            } else if (data.data[i].ratio > 0) {
              result[i].delta = "shangsheng crop-up";
              result[i].ratio = Number(data.data[i].ratio).toFixed(1);
            } else if (data.data[i].ratio == 0) {
              result[i].delta = "chiping crop-trend";
              result[i].ratio = Number(data.data[i].ratio).toFixed(1);
            }
          }
        }
      } 
      return result;
    },
    formartNewsData: function (data) {
      var news = {};
      if (data && data.total != 0 && data.data && data.data.length > 0) {
        news.total = data.total;
        processData(data.data);
        return news;
      } else {
        return {total: 0, data: []};
      }

      function processData(data) {
        news.data = [];
        news.content = [];
        for(var i = 0;i < data.length; i++){
          var publish_time = new Date(data[i].publish_time).getTime(),
            timestamp = new Date().getTime(),
            paragraph = data[i].main_body.replace(/<\/?.+?>/g,"");

          news.data[i] = {};
          news.data[i].id = data[i].id;
          news.data[i].news_img = data[i].news_img;
          news.data[i].title = data[i].title;
          news.data[i].publish_time = getTimeToNow(timestamp, publish_time, data[i].publish_time);
          news.data[i].paragraph = paragraph;
          news.data[i].i = i;

          news.content[i] = data[i];
          news.content[i].label = data[i].label ? data[i].label : "";
          news.content[i].source = data[i].source ? data[i].source : "";
          news.content[i].paragraph = paragraph;
        }
      }

      function getTimeToNow(timestamp, publishtamp, publishTime) {
        var time ,
          second = parseInt(timestamp - publishtamp) / 1000,
          day = parseInt(second / 60 / 60 / 24),
          hour = parseInt(second / 60 / 60),
          minute = parseInt(second / 60);

        if (day < 7 && day >= 1){
          time = day + '天前';
        } else if (hour < 24 && hour >= 1){
          time = hour + '小时前';
        } else if (minute < 60 && second >= 60){
          time = minute + '分钟前';
        } else if (second < 60){
          time = '1分钟前';
        } else {
          time = publishTime.split(' ')[0].replace('-','年').replace('-','月') + '日';
        }
        return time;
      }
    },
    formatAreaData: function (data, growthTarget, droughtTarget) {
      var targets = [], areas = [], total = [], 
        selItem = [], growth = [], drought = []
      
      var itemKeys = [5,4,3,2,1,6],
        growthItem = [ "好", "稍好","持平","稍差","差", "云" ],
        droughtItem = [ "特旱", "重旱", "中旱", "轻旱", "无旱", "云"]

      for (var i = 0; i < data.son_value.length; i++) {
        var growthRow = [], droughtRow = [], 
          growthTotal = [], droughtTotal = [],
          item = [];

        var name = data.son_value[i].area_name
        var a = 0
        for(var key in itemKeys) {
          if (data.son_value[i][growthTarget]) {
            let _area = (parseInt(data.son_value[i][growthTarget][itemKeys[key]].a) / 10000 * 15 / 10000).toFixed(2)
            growthRow.push({a: _area, p: data.son_value[i][growthTarget][itemKeys[key]].p})
            a += Number(_area)
          } else if (data.son_value[i][droughtTarget]) {
            let _area = (parseInt(data.son_value[i][droughtTarget][itemKeys[key]].a) / 10000 * 15 / 10000).toFixed(2)
            a += Number(_area)
            growthRow.push({a: '-', p: '-'})
          } else {
            growthRow.push({a: '-', p: '-'})
          }

          if (data.son_value[i][droughtTarget]) {
            let _area = (parseInt(data.son_value[i][droughtTarget][itemKeys[key]].a) / 10000 * 15 / 10000).toFixed(2)
            droughtRow.push({a:_area, p: data.son_value[i][droughtTarget][itemKeys[key]].p})
          } else {
            droughtRow.push({a: '-', p: '-'})
          }

          if (total.length === 0) {
            if (data.self_value[growthTarget]) {
              let _area = (parseInt(data.self_value[growthTarget][itemKeys[key]].a) / 10000 * 15 / 10000).toFixed(2)
              growthTotal.push({a: _area, p: data.self_value[growthTarget][itemKeys[key]].p})
            } else {
              growthTotal.push({a: ''})
            }
            if (data.self_value[droughtTarget]) {
              let _area = (parseInt(data.self_value[droughtTarget][itemKeys[key]].a) / 10000 * 15 / 10000).toFixed(2)
              droughtTotal.push({a: _area, p: data.self_value[droughtTarget][itemKeys[key]].p})
            } else {
              droughtTotal.push({a: ''})
            }
          }

        }

        item = item.concat([name, a.toFixed(2)]).concat(growthRow.concat(droughtRow))

        areas.push(item)
        total = total.length === 0 ? growthTotal.concat(droughtTotal) : total
      
      }

      targets = growthItem.concat(droughtItem)

      selItem = [
        {name: '长势', contain: []},
        {name: '旱情', contain: []}
      ]
      for (var i = 0; i < growthItem.length - 1; i++) {
        var _growth = growthItem[i]
        selItem[0].contain.push({name: _growth})

        var _drought = droughtItem[i]
        selItem[1].contain.push({name: _drought})
      }
      

      return {total, areas, targets, selItem}
    },
    formatCropData: function (data) {
      if (data && data.status == 0 && data.data && data.data.length > 0) {
        if (data.data[0].name !== "全部") {
          data.data.unshift({name: '全部', id: null})
        }
        return data.data;
      } else {
        return [];
      }
    },
    combineBounds(areas) {
      var boundsArr = []
      for (var i = 0; i < areas.length; i++) {
        boundsArr.push(this.formatBounds(areas[i]))
      }
      
      return getMaxExtend(boundsArr)
      
      function getMaxExtend(boundsArr) {
        var lblon = Number.POSITIVE_INFINITY, 
          lblat = Number.POSITIVE_INFINITY, 
          rtlon = Number.NEGATIVE_INFINITY, 
          rtlat = Number.NEGATIVE_INFINITY

        for (var i = 0; i < boundsArr.length; i++) {
          if (lblon > boundsArr[i][0]) {
            lblon = boundsArr[i][0]
          }

          if (lblat > boundsArr[i][1]) {
            lblat = boundsArr[i][1]
          }

          if (rtlon < boundsArr[i][2]) {
            rtlon = boundsArr[i][2]
          }

          if (rtlat < boundsArr[i][3]) {
            rtlat = boundsArr[i][3]
          }
        }
        
        return [lblon, lblat, rtlon, rtlat]
      }
    },
    formatSurInfo(data) {
      var result = {}
      result.srList = []
      result.cropName = data.object_name
      result.cropId = data.object_id
      result.code = data.area_codes

      for (var i = 0; i < data.sr_list.length; i++) {
        var eleItem = {
          id: data.sr_list[i].element_id,
          layerName: data.sr_list[i].layer_name,
          srId: data.sr_list[i].sr_id,
          extend: data.sr_list[i].extend
        }
        result.srList.push(eleItem)
      }

      return result
    },
    formatSurEleInfo(data) {
      var result = []
      for (var i = 0; i < data.length; i++) {
        var eleItem = {
          group: data[i].group,
          id: data[i].id,
          name: data[i].name,
          tag: data[i].tag
        }
        result.push(eleItem)
      }

      return result
    },
    formatSurProduct(data) {
      var result = {}
      result.cropList = []
      result.pdfUrl = data.user_pdf

      for (var i = 0; i < data.authorized_sur.length; i++) {
        var cropItem = {
          desc: data.authorized_sur[i].desc,
          imageUrl: data.authorized_sur[i].preview_image,
          title: data.authorized_sur[i].title,
          name: data.authorized_sur[i].title,
          surId: data.authorized_sur[i].sur_id
        }
        result.cropList.push(cropItem) 
      }

      return result
    },
    formatNdviInfo(data) {
      var result = []
      for (var i = data.length - 1; i >= 0; i--) {
        result[i] = {}
        result[i].date = data[i].date
        result[i].layerName = data[i].ndvi_layer_name
      }
      return result
    },
    formatLandArea(data) {
      var tbData = [], pieData = [], typeIds = [], typeInfo = [], _value

      for (var i = 0; i < data.length; i++) {
        tbData[i] = {}
        pieData[i] = {}

        tbData[i].value = (Number(data[i].area) * 15 / 10000).toFixed(2)
        tbData[i].landType = data[i].type_name
        tbData[i].id = data[i].type_id
        tbData[i].percent = (Number(data[i].percent) * 100).toFixed(2) + '%' 
        tbData[i].show = true

        pieData[i].value = (Number(data[i].area) * 15 / 10000).toFixed(2)
        _value = Number(pieData[i].value).toFixed(0)
        pieData[i].name = `${data[i].type_name}: \n${_value} 亩`

        typeIds[i] = data[i].type_id

        typeInfo[i] = {label: data[i].type_name,value: data[i].type_id}
      }
      typeInfo.unshift({label: "全部", value: 0})
      return {tbData, pieData, typeIds, typeInfo}
    },
    formatLine4Ndvi(data) {
      var line = {}
      line.xAxis = []
      line.yAxis = []
      line.data = [],
      line.diffYear = []

      for (var i = 0; i < data.length; i++) {
        var _yAxis = data[i].ndvi_value.toFixed(2)
        // _yAxis = _yAxis < 0.2 ? 0.2 : _yAxis
        var _data  ={
          name: new Date(data[i].date),
          value: [data[i].date.split(' ')[0], _yAxis]
        }

        line.xAxis[i] = data[i].date.split(' ')[0]
        line.yAxis[i] = _yAxis
        line.data[i] = _data
      }

      var start = data[0].date.substr(0,4)
      var end = data[data.length - 1].date.substr(0,4)
      getDiffYear(parseInt(start), parseInt(end))

      function getDiffYear(start, end) {
        var years = end - start
        for (var i = 0; i < years; i++) {
          if (i % 2 != 0) {
            var arr = [{xAxis: (start + i) + '-01-01'}, {xAxis: (parseInt(start + i) + 1) + '-01-01'}];
            line.diffYear.push(arr);
          } 
        }
      }

      return line 
    },
    formatHomeData: function (carouselData, reportData) {
      var carousel = {},
        text;
      if (carouselData.length > 0) {
        text = carouselData[0].text;
        carousel.carousel_img = carouselData[0].carousel_img;
      } else {
        text = '{"1": {"title": "全天候数据在线更新","content":"系统已实现遥感数据、气象数据的自动在线更新。保证分析数据及时更新，满足用户对指导农业生产时效性的需求。"},"2": {"title": "全自动化的处理模式","content":"系统从数据的获取，处理和信息提取，到专题产品的展现实现全自动化，在正常情况下不需要进行人工干预，保证的分析结果的快速客观。"},"3": {"title": "全部计算模型的高精度","content":"系统所采用的农作物分布模型、农作物旱情模型、农作物长势模型、单产模型等均为经过实践检验的成熟计算模型，保证计算分析结果符合实际使用精度要求。"}}';
        carousel.carousel_img = "http://dev-temp.oss-cn-beijing.aliyuncs.com/test/rscloud-offline/user-content/images/banner/banner/Topbanner.jpg";
      }
      text = JSON.parse(text);
      carousel.BannerTitle = []
      for(var key in text) {
        carousel.BannerTitle.push(text[key])
      }

      var report = [],
        reportTitle = [];
      if (reportData && reportData.data && reportData.data.length > 0) {
        report = reportData.data;
        for (var i = 0; i < report.length; i++) {
          reportTitle.push(report[i].title);
        }
      }
      return { carousel:carousel, report:report, reportTitle:reportTitle };
    },
    formatMonitorList: function (data) {
      for (var i = 0; i < data.length; i++) {
        data[i].i = i + 1;
      }
      
      return data;
    },
    formatReports: function (data) {
      for(var  i = 0;i < data.data.length; i++){
        data.data[i].time = data.data[i].content_time.split(' ')[0].replace(/-/g, "/");
        data.data[i].report_class = '';
        data.data[i].report_label = '';
        if(data.data[i].is_new){
          data.data[i].report_class = "re-orange";
          data.data[i].report_label = "新";
        }else if(data.data[i].is_hot){
          data.data[i].report_class = "re-red";
          data.data[i].report_label = "热";
        }
      }

      return data.data;
    },
    formatDLData: function (data, start, end) {
      var result = new Object(),
        years = end - start,
        monthsZH = ["一月", "二月", "三月", "四月", "五月", "六月" ,"七月", "八月", "九月", "十月", "十一月", "十二月"],
        periodZH = ["上旬", "中旬", "下旬"];
      
      result.index = 0
      result.data = []
      for (let y = 0; y <= years; y++) {
        for(let p = 1; p <= 36; p++) {
          let periodData = {};
          let month = dateUtil.periodToMonth(p)
          let day = dateUtil.periodToDay(p)
          let period = (p > 3) ? (p - (month - 1) * 3) : p

          if (data) {
            if (!data[start + y]) {
              periodData.hasData = false
            } else {
              if (p < 10) {
                periodData.hasData = (data[start + y][`0${p}`] === 1)
              } else {
                periodData.hasData = (data[start + y][p] === 1)
              }
            }
            if (periodData.hasData) {
              result.index = result.data.length
            }
            periodData.date = `${start + y}-${month}-${day}`

          } else {
            periodData.hasData = false
            periodData.date = `${start + y}-${month}-${day}`
            var __year = new Date().getFullYear()
            var __month = new Date().getMonth() + 1
            __month = __month < 10 ? '0' + __month : __month
            if (__year == start + y && __month == month) {
              result.index = result.data.length
            }
          }

          periodData.period = monthsZH[month - 1] + periodZH[period - 1]

          result.data.push(periodData)
        }
      }
      return result
    },
    formatMonitorBar: function (data, options) {
      var bar = {};
      bar.data1 = [];
      bar.data2 = [];
      bar.data3 = [];
      bar.data4 = [];
      bar.data5 = [];
      bar.data6 = [];
      bar.parxAxis = [];
      bar.parStart = 0;
      bar.legend = options.legend;
        
      var option = {
        startDate: options.startDate,
        endDate: options.endDate,
        data: data.data,
        ENCN: true
      };
      var _data = formatData.apiDataToPeriod(option);

      bar.parxAxis = _data.X;

      var _width = 900;
      var _index = _width / 60;
      bar.parStart = (1 - (_index / _data.X.length).toFixed(2)) * 100;

      for (var i = 0; i < _data.Y.length; i++) {
        if (_data.Y[i]) {
          bar.data1.push(_data.Y[i]['1'].p);
          bar.data2.push(_data.Y[i]['2'].p);
          bar.data3.push(_data.Y[i]['3'].p);
          bar.data4.push(_data.Y[i]['4'].p);
          bar.data5.push(_data.Y[i]['5'].p);
          bar.data6.push(_data.Y[i]['6'].p);
        }
        else {
          bar.data1.push('');
          bar.data2.push('');
          bar.data3.push('');
          bar.data4.push('');
          bar.data5.push('');
          bar.data6.push('');
        } 
      }

      return bar;
    },
    formatMonitorLine: function (data, options) {
      var line = {};
      line.years = [], line.current = [], line.previous = [], line.max = [], 
      line.minValue = Number.POSITIVE_INFINITY, line.maxValue = Number.NEGATIVE_INFINITY,line.min = [], line.average = [],
      line.lineColor = line.lineColor ? line.lineColor : [];

      data = data.data;
      for(var key in data) {
        line.years.push(key);
      }
      line.years.sort(function() {return -1});

      var params = {
        startDate: new Date( options.startDate.getFullYear() + '-01-01'),
        endDate: new Date(options.endDate.getFullYear() + '-12-31'),
        ENCN: true,
        data: data
      };
      var datas = formatData.apiDataToPeriod(params);
      getAllPeriod();
      line.lineStart = (1 - 1 / 5).toFixed(2) * 100 + 0.5;

      for (var i = 0; i < 5; i++) {
        var _data = datas.Y.slice(36 * i, (36 * 6) * (i + 1));
        var eachFiveYears = getFiveYears(_data);
        line.current = line.current.concat(eachFiveYears.current);
        line.previous = line.previous.concat(eachFiveYears.previous);
        line.max = line.max.concat(eachFiveYears.max);
        line.min = line.min.concat(eachFiveYears.min);
        line.average = line.average.concat(eachFiveYears.average);
      }
      return line;
      
      function getAllPeriod() {
        var arrPeriod = [];
        
        for (var y = 0; y < 5; y++) {
          var _year = line.years[y + 5].toString();
          var _month;
          for (var i = 0; i < 36; i++) {
            var periodEn = configData.dateItem.periodENCN[i];
            if (i + 1 < 10) {
              arrPeriod.push(_year + '/' + periodEn['0' + (i + 1)]);
            }
            else {
              arrPeriod.push(_year + '/' + periodEn[(i + 1)]);
            }
          }
          if (!line.initalize && y % 2 != 0) {
            var _period = configData.dateItem.periodENCN[0]['01'];
            var _start = (_year - 1) + '/' + _period;
            var _end = _year + '/' + _period;
            var _arr = [{xAxis: _start}, {xAxis: _end}];
            line.lineColor.push(_arr); 
          }
        }

        line.initalize = true;
        line.linexAxis = arrPeriod;
        lineDifColor(line.years.slice(5));
      }

      function getFiveYears(_data) {
        var fiveYearsResult = {};

        fiveYearsResult.current = [], fiveYearsResult.previous = [], fiveYearsResult.max = [], fiveYearsResult.min = [], fiveYearsResult.average = [], fiveYearsResult.data = [];
        fiveYearsResult.data[0] = _data.slice(0,36);
        fiveYearsResult.data[1] = _data.slice(36,72);
        fiveYearsResult.data[2] = _data.slice(73,108);
        fiveYearsResult.data[3] = _data.slice(109,144);
        fiveYearsResult.data[4] = fiveYearsResult.previous = toFixed2(_data.slice(144,180));
        fiveYearsResult.current = toFixed2(_data.slice(180,216));

        for (var i = 0; i < 36; i++) {
          fiveYearsResult.max[i] = -Infinity;
          fiveYearsResult.min[i] = Infinity;
          fiveYearsResult.average[i] = '';
          var averageNum = 0;
          for (var y = 0; y < 5; y++) {
            var _value = parseInt(fiveYearsResult.data[y][i]);
            if (!!_value) {
              fiveYearsResult.max[i] = (_value > fiveYearsResult.max[i]) ? Number(_value).toFixed(2) : fiveYearsResult.max[i];
              fiveYearsResult.min[i] = (_value < fiveYearsResult.min[i]) ? Number(_value).toFixed(2) : fiveYearsResult.min[i];
              fiveYearsResult.average[i] = Number(fiveYearsResult.average[i]) + Number(Number(_value).toFixed(2));
              averageNum ++;
            }
          }
          fiveYearsResult.max[i] = (fiveYearsResult.max[i] == -Infinity) ? '-' : fiveYearsResult.max[i];
          fiveYearsResult.min[i] = (fiveYearsResult.min[i] == Infinity) ? '-' : fiveYearsResult.min[i];

          fiveYearsResult.average[i] = fiveYearsResult.average[i] ? Number(fiveYearsResult.average[i] / averageNum).toFixed(2) : '-';

          getMinMax(fiveYearsResult.max[i], fiveYearsResult.min[i])
          getMinMax(fiveYearsResult.current[i], fiveYearsResult.current[i])
          getMinMax(fiveYearsResult.previous[i], fiveYearsResult.previous[i])
        }
        return fiveYearsResult;
      }

      function getMinMax(max, min) {
        if (!isNaN(min) && Number(min) > 0 && line.minValue > Number(min)) {
          line.minValue = Number(min)
        }
        if (!isNaN(max) && line.maxValue < Number(max)) {
          line.maxValue = Number(max)
        }
      }

      function toFixed2(array) {
        for (var i = 0; i < array.length; i++) {
          if (!array[i]) {
            array[i] = '-'
          } else {
            array[i] = Number(array[i]).toFixed(2);
          }
        }
        return array;
      }

      function lineDifColor(years) {
        if (!line.lineYearColor) {
          line.lineYearColor = [];
          for (var i = 0; i < 5; i++) {
            // var cy = years[i].toString().substr(2,2);
            if (i % 2 != 0) {
              var arr = [{xAxis: years[i] + '/1/上旬'}, {xAxis: (parseInt(years[i]) + 1) + '/1/上旬'}];
              line.lineYearColor.push(arr);
            } 
          }
        }
      }

      return line;
    },
    formatCps: function (data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].publish_time) {
          data[i].publish_time = data[i].publish_time.split(' ')[0];
        }
      }
      return data;
    },
    formatCpData: function (data, id, code) {
      code = data.data[id].area_code ? data.data[id].area_code : code;
      var cp = areaCpData(data.data[id].scps, code);
      if (!cp) {
        console.log('Do not have id is '+ id +' layer data.');
        return null; 
      } 
      return { cp:cp,  areaList: data.data[id].area_list}; 

      function areaCpData(data, code) {
        for (var i = 0; i < data.length; i++) { 
          if (code == data[i].code) {
            return data[i];
          }
        }
        return null;
      }
    },
    formatDcp: function (data, id, code) {
      var dynamicData = {};
      var len = data.data[id].length;
      dynamicData.layerArr = [];
      dynamicData.dates = [];
      dynamicData.data = data.data[id];

      for (var i = len - 1; i >= 0; i--) {
        for(var j = 0; j < dynamicData.data[i].scp_list.length; j++) {
          if (code == dynamicData.data[i].scp_list[j].code) {
            dynamicData.scp = dynamicData.data[i].scp_list[j];

            dynamicData.area_code = dynamicData.data[0].area_code;
            
            break;
          }
        }

        var dateStr = dynamicData.data[i].target_time;
        dateStr = dateStr.split(' ')[0];
        dynamicData.layerArr.unshift(dynamicData.data[i].scp_list);
        dynamicData.dates.unshift(new Date(dateStr));
      }
      return dynamicData;
    },
    formatRepType: function (data) {
      if (data && data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          data[i].special_class = "report-common";
          data[i].special_label = "";
          if(data[i].is_new) {
            data[i].special_class = "report-new";
            data[i].special_label = "新";
          }else if(data[i].is_hot) {
            data[i].special_class = "report-hot";
            data[i].special_label = "热";
          }
        }
        return data;
      } else {
        console.log('There is something wrong with report type data.');
        return null;
      }
    },
    formatReportList: function (data) {
      for (var i = 0; i < data.length; i++) {
        data[i].report_class = "";
        data[i].report_label = "";
        data[i].vertical = "";
        data[i].time = data[i].content_time.split(' ')[0].replace(/-/g, "/"); 
        // if($('.report-single').hasClass('vertical') || $('.vertical-btn').attr('class').indexOf('active') > 0) {
        //   data[i].vertical = ' vertical';
        // }
        if(data[i].is_new){
          data[i].report_class = "re-orange";
          data[i].report_label = "新";
        }
        else if(data[i].is_hot){
          data[i].report_class = "re-red";
          data[i].report_label = "热";
        }
      }

      return data;
    },
    formatReportVList: function (data, result) {
      result = result ? result : new QuarterList(result)
      result.loopData(data)

      return result;

      function QuarterList() {
        this.datastore = []

        this.getCurrent = getCurrent
        this.getQuarter = getQuarter
        this.getCurYear = getCurYear
        this.getCurQuarter = getCurQuarter
        this.loopData = loopData
        this.appendList = appendList
        this.appendQuarter = appendQuarter
        this.appendData = appendData
        this.appendYear = appendYear
        this.judgeNew = judgeNew
        
        this.current = this.getCurrent()
        this.start = this.getCurrent()
      }

      function getCurrent() {
        var date = new Date(),
          year = date.getFullYear(),
          month = date.getMonth() + 1,
          quarter = this.getQuarter(month)

        return {year, quarter}
      }

      function judgeNew() {
        var date = new Date(),
          year = date.getFullYear(),
          month = date.getMonth() + 1,
          quarter = this.getQuarter(month),
          isNew = false

        if (this.current.year === year && this.current.quarter === quarter) {
          isNew = true
        } 
        return isNew
      }

      function appendList(data, year, quarter) {
        var object = {
            title: data.title,
            img_url: data.img_url,
            pdf_url: data.pdf_url,
            misc: data.misc,
            time: data.time.replace(/-/g, "/"),
            topic_id: data.topic_id,
            report_id: data.report_id,
            report_class: '',
            report_label: ''
          }
        if (this.current.year === year) {
          this.appendQuarter(object, quarter)
        } else {
          this.appendYear(object, year, quarter)
        }
      }

      function appendData(object, quarter) {
        var curYear = this.getCurYear()
        var curQuarter = this.getCurQuarter(curYear, quarter)

        if (curQuarter) {
          object && curQuarter.push(object)
        } else {
          if (!object) {
            var isNew = this.judgeNew()
            if (isNew) {
              curYear.push({quarter: quarter, value: [], isNew})
            } else {
              curYear.push({quarter: quarter, value: []})
            }
          } else {
            curYear.push({quarter: quarter, value: [object]})
          }
        }
      }

      function appendQuarter(object, quarter) {

        if(this.current.quarter > quarter) {
          this.appendData(null, this.current.quarter)
          this.current.quarter = this.current.quarter - 1

          this.appendQuarter(object, quarter)

        } else if (this.current.quarter === quarter) {
          this.appendData(object, quarter)
          
        } else {
          return
        }
      }

      function appendYear(object, year, quarter) {
        var curYear = this.getCurYear()

        if (this.current.year > year) {
          if (curYear.length === 0) {

            for (var i = this.start.quarter; i >= 0; i--) {
              this.current.quarter = i
              this.appendData(null, i)
            }
          }

          this.current.year = this.current.year - 1
          this.current.quarter = quarter
          this.appendYear(object, year, quarter)

        } else if (this.current.year === year) {
          this.appendQuarter(object, quarter)

        } else {
          return
        }
      }

      function getCurYear() {
        var year = this.current.year,
          existYear = false,
          curYear;

        for (var y = 0; y < this.datastore.length; y++) {
          if (this.datastore[y].year === year) {
            curYear = this.datastore[y].value
            existYear = true
          }
        }

        if (!existYear) {
          var length = this.datastore.push({year: year, value: []})
          curYear = this.datastore[length - 1].value
        }

        return curYear
      }

      function getCurQuarter(curYear, quarter) {
        var existQuarter = null
        for (var q = 0; q < curYear.length; q++) {
          if (curYear[q].quarter === quarter) {
            existQuarter = curYear[q].value
            break
          }
        }
        return existQuarter
      }

      function getQuarter(month) {
        var quarter = -1
        month = parseInt(month)
        switch(month) {
          case 1: case 2: case 3 : 
            quarter = 0
            break
          case 4: case 5: case 6 : 
            quarter = 1
            break
          case 7: case 8: case 9 : 
            quarter = 2
            break
          case 10: case 11: case 12 : 
            quarter = 3
            break
        }
        return quarter
      }

      function loopData(data) {
        for (var i = 0; i < data.length; i++) {
          data[i].time = data[i].content_time.split(' ')[0];
          var year  = data[i].time.substr(0, 4),
            quarter = this.getQuarter(data[i].time.substr(5, 2))

          if (year === '0000') {
            console.error('report content_time format error')
            continue
          }

          this.appendList(data[i], parseInt(year), quarter)
        }
      }
    },
    formatAnalyze: function (_data, startDate, endDate, anIndex, pageSize) {
      var params = {
        startDate: startDate,
        endDate: endDate,
        data: _data.data,
        ENCN: true
      };
      var data = formatData.apiDataToPeriod(params);

      var analyze = {};
      analyze.tbData = [];
      analyze.pieData = data.Y;
      analyze.sum = data.X.length - 1;
      analyze.pageIndex = 0;
      analyze.totalPage = Math.ceil(analyze.sum / pageSize);

      var index = '', level, isGrow;

      for (var i = 0; i < data.X.length; i++) {
        anIndex = anIndex.remove('-1');
        anIndex = anIndex.remove('-5');
        index = anIndex;

        // data.Y[i] dosen't exist 
        if (!data.Y[i]) {
          analyze.tbData[i] = {};
          analyze.tbData[i].date = data.X[i];
          analyze.tbData[i].level = '－';
          analyze.tbData[i].levelClass = 'no-data';
          analyze.tbData[i].compare = '－';
          analyze.tbData[i].pieKey = index 
          analyze.tbData[i].pieIndex = "－";
          continue;
        }
        if (data.Y[i].misc.p == -9999) {
          data.Y[i].misc.p = '－';
        }

        level = data.Y[i].misc.lv;
        level = configData.productLegendConf[index][level]['name'];
        isGrow = (configData.growTarget.name.indexOf(index) >= 0);

        analyze.tbData[i] = {};
        analyze.tbData[i].date = data.X[i];
        analyze.tbData[i].level = level;
        analyze.tbData[i].levelClass = (data.Y[i].misc.lv + '-' + isGrow);
        analyze.tbData[i].compare = data.Y[i].misc.p;
        analyze.tbData[i].pieKey = index 
        analyze.tbData[i].pieIndex = i;

        // add class name
        analyze.tbData[i].className = 'evaluat-top icon-shangsheng';
        analyze.tbData[i].compare = analyze.tbData[i].compare.remove('%');
        if (analyze.tbData[i].compare == '－') {
          analyze.tbData[i].className = 'no-data';
        }
        else if (analyze.tbData[i].compare > 10) {
          analyze.tbData[i].compare += '%';
          analyze.tbData[i].className = 'evaluat-top icon-shangsheng';
        } else if (analyze.tbData[i].compare < -10) {
          analyze.tbData[i].compare += '%';
          analyze.tbData[i].className = 'evaluat-bottom icon-xiajiang';
        } else{
          analyze.tbData[i].compare += '%';
          analyze.tbData[i].className = 'evaluat-level icon-chiping';
        } 
      }

      return analyze;
    },
    formatWPLayerName: function (data) {
      for(var year in data.data) {
        for(var day in data.data[year]) {
          return data.data[year][day].tif_name;
        }
      }
      return null;
    },
    formatBounds: function (data) {
      var bounds = data.bounds;
      bounds = [bounds.lb_lon, bounds.lb_lat, bounds.rt_lon, bounds.rt_lat];
      return bounds;
    },
    formatAllMarkets: function (data) {
      if (data.status == '0') {
        var _count = 0
        for (var i = 0; i < data.data.length; i++) {
          if (data.data[i].is_exist == 1) {
            _count += data.data[i].market_count
          }
        }
        if (data.data[0].area_name !=="全国") {
          data.data.sort(compareStr);
          data.data.unshift({
            area_id: "000000",
            area_name: "全国",
            is_exist: 1,
            market_count: _count
          });
        }
        return data.data;
      } else {
        return [];
        console.log(data.error_msg); 
      }

      function compareStr(obj1, obj2) {
        var str1 = pinyin.getCamelChars(obj1.area_name[0]);
        var str2 = pinyin.getCamelChars(obj2.area_name[0]);
        if (str1.localeCompare(str2) === 0) {
          return (str1 > str2);
        } else {
          return str1.localeCompare(str2);
        }
      }
    },
    formatMarketBar: function (data) {
      var bar = {};
      var _data = data.data;
      bar.xAxis = []; 
      bar.yAxis = [];
      for(var code in _data) {
        bar.xAxis.push(_data[code].area_name);
        bar.yAxis.push(_data[code].price);
      }
      return bar;
    },
    formatMarketLine: function (data) {
      var _data = data.data;
      var line = {};

      line.xAxis = [];
      line.yAxis = [];
      line.maxPrice = Number.NEGATIVE_INFINITY;
      line.minPrice = Number.POSITIVE_INFINITY;

      for (var i = 0; i < _data.length; i++) {
        var point = _data[i];
        if (!point) {
          continue;
        }
        if (!point.date || !point.price) {
          console.log('API data format is very wrong!');
          continue;
        }

        var date = point.date.split(' ')[0].replace(/-/g, "/");
        var price = point.price;

        if (price > 0 && line.maxPrice < price) {
          line.maxPrice = price;
        }
        if (price > 0 && line.minPrice > price) {
          line.minPrice = price
        }
        if (price < 0) {
          price = '-';
        }

        line.yAxis.push(price);
        line.xAxis.push(date);
      }

      return line;
    },
    formatPriceLine: function (data) {
      var price = {};
      var _data = data.data;
      price.data = _data.prices,
      price.maxPrice = Number.NEGATIVE_INFINITY,
      price.minPrice = Number.POSITIVE_INFINITY,
      price.startDate = dateUtil.formatDateZH(new Date( _data.start_date.split(' ')[0])),
      price.endDate = dateUtil.formatDateZH(new Date( _data.end_date.split(' ')[0]));

      price.xAxis = [];
      price.yAxis = [];
      for (var i = 0; i < price.data.length; i++) {
        var date = price.data[i].date.split(' ')[0].replace(/-/g, "/");
        if (price.data[i].price > 0 && price.maxPrice < price.data[i].price) {
          price.maxPrice = price.data[i].price;
        }
        if (price.data[i].price > 0 && price.minPrice > price.data[i].price) {
          price.minPrice = price.data[i].price;
        }
        if (price.data[i].price < 0) {
          price.data[i].price = '-';
        }
        price.yAxis.push(price.data[i].price);
        price.xAxis.push(date);
      }
      return price;
    },
    formatMarketInfo: function (data) {
      var markets = {};
      
      var _data = data.market_datas;
      markets.totalPage = data.total_page;
      markets.data = [];

      for (var i = 0; i < _data.length; i++) {
        markets.data[i] = {};
        markets.data[i].market_id = _data[i].market_id;
        markets.data[i].market_name = _data[i].market_name;
        markets.data[i].market_name = _data[i].market_name;
        markets.data[i].farm_product_name = data.farm_product_name;

        markets.data[i].rateFlag = configData.market.rateFlag[_data[i].date_flag];
        if (!_data[i].cur_price) {
          markets.data[i].cur_price = '<span class="no-cur-data">-暂无-</span>';
          markets.data[i].desc = '<span class="no-cur-data">-暂无-</span>';
          markets.data[i].color = 'market-gray';
        } else { 
          markets.data[i].price = _data[i].cur_price.toFixed(2);
          if (_data[i].cur_price - _data[i].pre_price == 0) {
            markets.data[i].color = 'market-blue';
            markets.data[i].desc = '持平';
            markets.data[i].image = 'market-blue icon-chiping';
            markets.data[i].delta = '';
          } else if (_data[i].cur_price - _data[i].pre_price > 0) {
            markets.data[i].color = 'market-red';
            markets.data[i].image = 'market-red icon-shangsheng';
            markets.data[i].desc = '上升' + Number(_data[i].ratio).toFixed(2) + '%';
            markets.data[i].delta = (_data[i].cur_price - _data[i].pre_price).toFixed(2);
          } else {
            markets.data[i].color = 'market-green';
            markets.data[i].image = 'market-green icon-xiajiang';
            markets.data[i].desc = '下降' + Number(_data[i].ratio).toFixed(2) + '%';
            markets.data[i].delta = (_data[i].pre_price - _data[i].cur_price).toFixed(2);
          }
        }
      }
      return markets;
    },
    formatMarketNews: function (data) {
      var news = {};
      news.data = [];
      news.content = [];
      news.total = data.total;
      var _data =data.data;

      for(var i = 0;i < _data.length; i++){
        var publish_time = new Date(_data[i].publish_time).getTime(),
          timestamp = new Date().getTime(),
          paragraph = _data[i].main_body.replace(/<\/?.+?>/g,"");

        news.data[i] = {};
        news.data[i].news_img = _data[i].news_img;
        news.data[i].title = _data[i].title;
        news.data[i].publish_time = getTimeToNow(timestamp, publish_time, _data[i].publish_time);
        news.data[i].paragraph = paragraph;
        news.data[i].i = i;

        news.content[i] = _data[i];
        news.content[i].publish_time = news.data[i].publish_time
        news.content[i].label = _data[i].label ? _data[i].label : "";
        news.content[i].source = _data[i].source ? _data[i].source : "";
        news.content[i].paragraph = paragraph;
      }

      return news;

      function getTimeToNow(timestamp, publishtamp, publishTime) {
        var time ,
          second = parseInt(timestamp - publishtamp) / 1000,
          day = parseInt(second / 60 / 60 / 24),
          hour = parseInt(second / 60 / 60),
          minute = parseInt(second / 60);

        if (day < 7 && day >= 1){
          time = day + '天前';
        } else if (hour < 24 && hour >= 1){
          time = hour + '小时前';
        } else if (minute < 60 && second >= 60){
          time = minute + '分钟前';
        } else if (second < 60){
          time = '1分钟前';
        } else {
          time = publishTime.split(' ')[0].replace(/-/g,'/')
        }
        return time;
      }
    },
    formatTdtPoi: function (data) {
      var point = {};
      
      var begin = data.indexOf('{');
      var end = data.lastIndexOf('}') + 1;
      var text = data.substring(begin, end);

      try {
        var poiObject = JSON.parse(text);
      }
      catch(e) {
        var poiObject = eval(text)
      }
      
      if (poiObject.status == 0) {
        point = poiObject.result;
      } else {
        point = null;
      }

      return point;
    },
    formateEnterprise: function (data) {
      var result = []
      for (var i = 0; i < data.length; i++) {
        result[i] = {}
        result[i].id = data[i].id
        result[i].name = data[i].name
        result[i].address = data[i].address
        result[i].geom = data[i].geom
      }
      return result
    },
    formatSoilAreas: function (data) {
      var result = {}

      var getProvince = (province) => {
        var _province = [], _city = [], _county = []
        for (var j = 0; j < province.length; j++) {
          var proItem = {
            area_id: province[j].area_id,
            area_name: province[j].area_name,
            bounds: this.formatBounds(province[j])
          }
          _province.push(proItem)

          if (province[j].contain && province[j].contain.length > 0) {
            var data = getCity(province[j].contain, province[j].area_id)
            _city = _city.concat(data.city)
            _county = _county.concat(data.county)
          }
        }
        return {province: _province, city: _city, county: _county}
      }

      var getCity = (city, parent) => {
        var _city = [], _county = []
        for (var j = 0; j < city.length; j++) {
          var cityItem = {
            area_id: city[j].area_id,
            area_name: city[j].area_name,
            bounds: this.formatBounds(city[j]),
            parent: parent
          }
          _city.push(cityItem)
          if (city[j].contain && city[j].contain.length > 0) {
            _county = _county.concat(getCounty(city[j].contain, city[j].area_id))
          }
          
        }
        return {city: _city, county: _county}
      }

      var getCounty = (county, parent) => {
        var _county = []
        for (var j = 0; j < county.length; j++) {
          var couItem = {
            area_id: county[j].area_id,
            area_name: county[j].area_name,
            bounds: this.formatBounds(county[j]),
            parent: parent
          }
          _county.push(couItem)
        }
        return _county
      }

      result.province = []
      result.city = []
      result.county = []

      for (var i = 0; i < data.length; i++) {
        if (data[i].grade === 1) {
          var item = {
            area_id: data[i].area_id,
            area_name: "全国",
            bounds: this.formatBounds(data[i])
          }
          result.province.push(item)

          var _data = getProvince(data[i].contain)
          result.province = result.province.concat(_data.province)
          result.city = _data.city
          result.county = _data.county

        } else if (data[i].grade === 2) {
          if (data[i].contain && data[i].contain.length > 0) {
            var _data = getCity(data[i].contain, data[i].area_id)
            result.city = result.city.concat(_data.city)
            result.county = result.county.concat(_data.county)
          }
        } else if (data[i].grade === 3) {
          if (data[i].contain && data[i].contain.length > 0) {
            var _data = getCounty(data[i].contain, data[i].area_id)
            result.county = result.county.concat(_data)
          }
        }
      }

      return result
    },
    formatMonitorPoints: function (data) {
      var normalData = configData.soil.programs
      var targets = configData.soil.targets

      var getTimes = function (normal, actual) {
        var times
        actual = Number(actual).toFixed(2)
        if (typeof normal === "number") {
          times = actual / normal - 1
          times = times > 0 ? times.toFixed(2) : 0
        } else if (typeof normal === "object") {
          times = []
          for (var i = 0; i < normal.length; i++) {
            var _times = actual / normal[i] - 1
            _times = _times > 0 ? _times.toFixed(2) : 0
            times.push(_times) 
          }
        }
        return times
      }

      var getNormalLists = function (ph) {
        var normalList = []
        if (ph > 7.5) {
          normalList = normalData.ph_2
        } else if (ph>= 6.5 && ph <= 7.5) {
          normalList = normalData.ph_1
        } else {
          normalList = normalData.ph_0
        }
        return normalList
      }

      var processData = function (data) {
        var result = {}
        var overproof = 0
        var normalList = getNormalLists(data.ph)
        var maxTimes = 0
        var maxValue = 0
        for(var key in data) {
          if (normalList[key]) {
            var normal = normalList[key]
            var times = getTimes(normal, data[key])
            var defaultTimes = typeof times === "object" ? times[1] : times
            if (defaultTimes > 0) {
              if (maxTimes < defaultTimes) {
                maxTimes =  defaultTimes
                result.default = {
                  times: maxTimes,
                  actual: data[key].toFixed(2),
                  name: targets[key]
                }
              }
              overproof++

            } else {
              maxTimes = 0
            }

            if (data[key] > maxValue) {
              maxValue = data[key]
            }

            result[key] = {
              normal: normal,
              actual: data[key].toFixed(2),
              times: times,
              name: targets[key]
            }
            if (!result.default) {
              result.default = {
                  times: maxTimes,
                  actual: data[key].toFixed(2),
                  name: targets[key]
                }
            }
            result.maxValue = maxValue.toFixed(2)
          }

        }
        
        if (overproof === 0) {
          result.desc = "无超标项"
        } else {
          result.desc = overproof + "项超标"
        }
        result.overproof = overproof
        
        return result
      }

      var loopData = function (data) {
        var result = []
        for (var i = 0; i < data.length; i++) {
          result[i] = {}
          result[i].id = data[i].id
          result[i].point = [data[i].x, data[i].y]
          result[i].ph =  data[i].ph
          result[i].date_time =  data[i].date_time
          result[i].geom =  data[i].geom
          result[i].station =  data[i].station

          var formated = processData(data[i])
          result[i].as =  formated.as
          result[i].cd =  formated.cd
          result[i].cr =  formated.cr
          result[i].cu =  formated.cu
          result[i].hg =  formated.hg
          result[i].ni =  formated.ni
          result[i].pb =  formated.pb
          result[i].zn =  formated.zn
          result[i].six =  formated.six
          result[i].ddt =  formated.ddt
          result[i].default =  formated.default
          result[i].desc =  formated.desc
          result[i].overproof =  formated.overproof
          result[i].maxValue =  formated.maxValue
        }
        return result
      }

      
      return loopData(data)
    }
  }
}