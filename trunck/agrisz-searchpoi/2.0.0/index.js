module.exports = function (request) {
  return {
    name: 'my-searchpoi',
    prop: {
      data () {
        return {
          field: '',
          poiList: [],
          searchLoading: false,
          soIndex: -1,
          showTip: false,
          tipContent: '',
          tipPosition: [],
          showPanel: false,
          cancelHandler: null,
        }
      },
      template: `<div class="soso" :style="{right: right}">
                  <div class="soso-bg border-common-radius">
                    <div class="soso-text clear pr box-common-shadow border-common-radius">
                      <input type="text" v-model="field" class="fl placename" placeholder="请输入地点名称"
                        @keyup.13="getPointsData">
                      <div class="search-btn-con">
                        <i class="iconfont icon-fangdajing soso-icon fl"
                          @click="getPointsData"></i>
                        <el-popover
                          ref="popover1"
                          placement="bottom"
                          width="38px"
                          trigger="hover"
                          popper-class="soso-popover-text"
                          content="清空">
                        </el-popover>
                        <i v-show="poiList.length > 0" class="iconfont icon-iconfonticonfontclose delete-icon"
                          @click="deletePoi" v-popover:popover1></i>
                        <span class="soso-words ps" @click="getPointsData">搜索</span>
                      </div>
                    </div>

                    <div class="soso-content border-common-radius" v-if="showPanel">
                      <h3 class="empty-data" @click="deletePoi">点击清空“{{field}}”的搜索结果</h3>
                      <div  v-if="poiList.length > 0">
                        <p v-for="(item, index) in poiList"
                          :class="index == soIndex ? 'active': ''"
                          @click="selectPoi(index)">
                          {{1 + index  + '. ' + item.name}}
                        </p>
                      </div>
                      <div v-else-if="searchLoading" class="none-data" v-loading.lock="searchLoading">
                        <br><br>
                        －加载中……－
                        <br><br>
                      </div>
                      <div v-else class="none-data">
                        －暂无数据－
                      </div>
                    </div>
                  </div>
                  <div v-if="showTip" class="soso-marker-tip border-common-radius box-common-shadow" :style="{top: tipPosition[0], left: tipPosition[1]}">
                    <p>{{tipContent}}</p>
                    <div class="tip-arrow-bottom"></div>
                  </div>
                </div>`,
      props: {
        right: {
          type: String,
          default: '62px'
        },
        map: {
          type: Object,
          default: null
        },
        zoomLevel: {
          type: Number, 
          default: 14
        }
      },
      mounted() {

      },
      methods: {
        deletePoi() {
          if (this.cancelHandler && this.cancelHandler.cancelRequest) {
            this.cancelHandler.cancelRequest("cancel request")
            this.cancelHandler = null
          }

          this.showPanel = false
          this.field = ''
          this.poiList = []
          this.map.removeLayer(this.searchPoint)
          this.$emit('setCenter')
          this.map.un('pointermove', this.moveHandler)
        },
        selectPoi(index) {
           this.soIndex = index
          var _id = this.poiList[index].hotPointID,
            lonlat = this.poiList[index].lonlat.split(' ');
          
          var style = new ol.style.Style({
            image: new ol.style.Icon(({
              anchor: [0.5, 20],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: '/static/assets/img/map/altitude-red.png',
              imgSize: [20,31]
            }))
          });

          var source = this.searchPoint.getSource()

          lonlat[0] = Number(lonlat[0]);
          lonlat[1] = Number(lonlat[1]);
          var coodinate = ol.proj.fromLonLat(lonlat, 'EPSG:3857')
          this.map.getView().setCenter(coodinate);
          this.map.getView().setZoom(this.zoomLevel)
          this.changeStyle(_id, source, style)
          // when click search result do something ex:hide points
          this.$emit('getSource', source)
        },
        getPointsData() {
          this.showPanel = true
          if (this.field != '') {
            this.poiList = []
            this.searchByField(this.field, (data) => {
              this.poiList = data.pois;
              this.addPoints(data.pois)
            })
          }
        },
        searchByField(field, callback) {
          var _size = this.map.getSize(),
            bounds = this.map.getView().calculateExtent(_size),
            boundsStr = ''
          bounds = ol.extent.applyTransform(bounds, ol.proj.getTransform("EPSG:3857", "EPSG:4326"))
          boundsStr = bounds.join(',')

          this.searchLoading = true
          this.cancelHandler = request.searchPois(field, boundsStr)
          this.cancelHandler.then((response) => {
            if (response && response.status === 200) {
              this.cancelHandler = null
              var result = response.data
              var begin = result.indexOf('{');
              var end = result.lastIndexOf('}') + 1;
              var text = result.substring(begin, end);
              var object = JSON.parse(text);
              if (object.count == 0) {
                this.searchLoading = false
                return;
              }
              for (var i = 0; i < object.pois.length; i++) {
                object.pois[i].index = i + 1;
              }
              callback(object);
              this.searchLoading = false
            }
              
          });
        },
        addPoints(data) {
          var len = data.length;
          if (len > 0) {
            var features = new Array(len);
            for (var i = 0; i < len; i++) {
              var lonlat = data[i].lonlat.split(' ');
              lonlat[0] = Number(lonlat[0]);
              lonlat[1] = Number(lonlat[1]);
              features[i] = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform(lonlat, 'EPSG:4326',
                            'EPSG:3857')),
                address: data[i].address,
                name: data[i].name,
                id: data[i].hotPointID
              });
            }
            this.addFeatures(features);
          }
        },
        addFeatures(features) {
          if (this.searchPoint) {
            this.map.removeLayer(this.searchPoint);
          }
          
          var style = new ol.style.Style({
            image: new ol.style.Icon(({
              anchor: [0.5, 20],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: '/static/assets/img/map/altitude.png',
              imgSize: [20,31]
            }))
          });
          var source = new ol.source.Vector({
            features: features
          });

          this.searchPoint = new ol.layer.Vector({
            source: source,
            style: style
          });
          this.map.addLayer(this.searchPoint);
          this.searchPoint.setZIndex(10);

          this.map.on('pointermove', this.moveHandler)
        },
        moveHandler(event) {
          if (event.dragging) {
            this.showTip = false
            return;
          }
          var pixel = this.map.getEventPixel(event.originalEvent);

          this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
            if (layer == this.searchPoint && feature) {
              var _point = this.map.getPixelFromCoordinate(feature.getGeometry().getCoordinates())
              var left = parseInt(_point[0])
              var top = parseInt(_point[1])

              this.tipContent = feature.getProperties().name
              this.showTips(top, left)

              return 
            }
          });

          var hit = this.map.hasFeatureAtPixel(pixel);
          if (hit) {
            this.map.getViewport().style.cursor = 'pointer';
          } else {
            this.map.getViewport().style.cursor = 'default';
            this.showTip = false
          }
        },
        showTips(top, left) {
          this.showTip = true
          top = (top - 40) + 'px'
          left = left + 'px'
          this.tipPosition = [top, left]
        },
        changeStyle(id, source, style) {
          var defaultStyle = new ol.style.Style({
            image: new ol.style.Icon(({
              anchor: [0.5, 20],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: '/static/assets/img/map/altitude.png',
              imgSize: [20,31]
            }))
          });
          source.forEachFeature(function (feature) {
            if (feature.getProperties().id == id) {
              feature.setStyle(style)
            } else {
              feature.setStyle(defaultStyle)
            }
          })
        } 
      },
      watch: {
        
      }
    }
  }
}