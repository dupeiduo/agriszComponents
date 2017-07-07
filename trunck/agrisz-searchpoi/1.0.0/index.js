module.exports = function (request) {
  return {
    name: 'my-searchpoi',
    prop: {
      data () {
        return {
          field: '',
          poiList: [],
          searchLoading: false
        }
      },
      template: `<div class="soso" :style="{right: right}">
                  <div class="soso-bg">
                    <div class="soso-text clear"  v-loading.body="searchLoading">
                      <input type="text" v-model="field" class="fl placename" placeholder="请输入地点名称"
                        @keypress="getPointsData">
                      <i class="iconfont icon-fangdajing soso-icon fl"
                        @click="getPointsData"></i>
                      <i v-show="poiList.length > 0" class="iconfont icon-iconfonticonfontclose delete-icon"
                        @click="deletePoi"></i>
                    </div>

                    <div class="soso-content">
                      <p v-for="(item, index) in poiList"
                        @click="selectPoi(index)">
                        {{1 + index  + '. ' + item.name}}
                      </p>
                    </div>
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
          this.field = ''
          this.poiList = []
          this.map.removeLayer(this.searchPoint)
          this.$emit('setCenter')
        },
        selectPoi(index) {
          var _id = this.poiList[index].hotPointID,
            lonlat = this.poiList[index].lonlat.split(' ');
          
          var style = new ol.style.Style({
            image: new ol.style.Icon(({
              anchor: [0.5, 20],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: '/static/assets/img/' + 'planting/pl-position.png',
              imgSize: [30,30]
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
          if (this.field != '') {
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
          request.searchPois(field, boundsStr).then((response) => {
            if (response.status === 200) {
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
              src: '/static/assets/img/' + 'planting/search29.png',
              imgSize: [30,30]
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
          this.searchPoint.on('click', function (event) {
            event;
          })
        },
        changeStyle(id, source, style) {
          var defaultStyle = new ol.style.Style({
            image: new ol.style.Icon(({
              anchor: [0.5, 20],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: '/static/assets/img/' + 'planting/search29.png',
              imgSize: [30,30]
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