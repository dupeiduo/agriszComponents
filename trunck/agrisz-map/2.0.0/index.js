import meassureHandler from './meassure.js'
module.exports = function (config, configData, request, vueBus) {
  return {
    name: 'my-map',
    prop: {
      data(){
        return {
          showVec: false,
          styles: {
            selected: function selected() {
            var normalColor = configData.sld.normal.color
            var sld = "<PolygonSymbolizer>\n          <Fill>\n            <CssParameter name=\"fill\">#000000</CssParameter>\n            <CssParameter name=\"fill-opacity\">0</CssParameter>\n          </Fill>\n          <Stroke>\n              <CssParameter name=\"stroke\">#0695ed</CssParameter>\n              <CssParameter name=\"stroke-width\">3.6</CssParameter>\n          </Stroke>\n      </PolygonSymbolizer>\n      <PolygonSymbolizer>\n          <Fill>\n              <CssParameter name=\"fill\">#000000</CssParameter>\n              <CssParameter name=\"fill-opacity\">0</CssParameter>\n          </Fill>\n          <Stroke>\n              <CssParameter name=\"stroke\">#ffffff</CssParameter>\n              <CssParameter name=\"stroke-width\">0.2</CssParameter>\n          </Stroke>\n      </PolygonSymbolizer>\n      <PerpendicularOffset>-30</PerpendicularOffset>";
              return sld
            },
            normal: function normal() {
              var normalColor = configData.sld.normal.color
              var sld = "<PolygonSymbolizer>\n          <Fill>\n            <CssParameter name=\"fill\">#000000</CssParameter>\n            <CssParameter name=\"fill-opacity\">0</CssParameter>\n          </Fill>\n          <Stroke>\n              <CssParameter name=\"stroke\">"+ normalColor +"</CssParameter>\n              <CssParameter name=\"stroke-width\">1</CssParameter>\n          </Stroke>\n      </PolygonSymbolizer>\n      <PolygonSymbolizer>\n          <Fill>\n              <CssParameter name=\"fill\">#000000</CssParameter>\n              <CssParameter name=\"fill-opacity\">0</CssParameter>\n          </Fill>\n          <Stroke>\n              <CssParameter name=\"stroke\">#ffffff</CssParameter>\n              <CssParameter name=\"stroke-width\">0.2</CssParameter>\n          </Stroke>\n      </PolygonSymbolizer>\n      <PerpendicularOffset>-30</PerpendicularOffset>";
              return sld
            },
            bold: function bold() {
              var boldColor = configData.sld.bold.color
              var sld = "<PolygonSymbolizer>\n          <Fill>\n            <CssParameter name=\"fill\">#000000</CssParameter>\n            <CssParameter name=\"fill-opacity\">0</CssParameter>\n          </Fill>\n          <Stroke>\n              <CssParameter name=\"stroke\">"+ boldColor +"</CssParameter>\n              <CssParameter name=\"stroke-width\">1.6</CssParameter>\n          </Stroke>\n      </PolygonSymbolizer>\n      <PolygonSymbolizer>\n          <Fill>\n              <CssParameter name=\"fill\">#000000</CssParameter>\n              <CssParameter name=\"fill-opacity\">0</CssParameter>\n          </Fill>\n          <Stroke>\n              <CssParameter name=\"stroke\">#ffffff</CssParameter>\n              <CssParameter name=\"stroke-width\">0.2</CssParameter>\n          </Stroke>\n      </PolygonSymbolizer>\n      <PerpendicularOffset>-30</PerpendicularOffset>";
              return sld
            },
            highlighted: function highlighted() {
              var highlightedColor = configData.sld.highlighted.color
              var sld = "<PolygonSymbolizer>\n          <Fill>\n            <CssParameter name=\"fill\">#000000</CssParameter>\n            <CssParameter name=\"fill-opacity\">0</CssParameter>\n          </Fill>\n          <Stroke>\n              <CssParameter name=\"stroke\">"+ highlightedColor +"</CssParameter>\n              <CssParameter name=\"stroke-width\">1.6</CssParameter>\n          </Stroke>\n      </PolygonSymbolizer>\n      <PolygonSymbolizer>\n          <Fill>\n              <CssParameter name=\"fill\">#000000</CssParameter>\n              <CssParameter name=\"fill-opacity\">0</CssParameter>\n          </Fill>\n          <Stroke>\n              <CssParameter name=\"stroke\">#ffffff</CssParameter>\n              <CssParameter name=\"stroke-width\">0.2</CssParameter>\n          </Stroke>\n      </PolygonSymbolizer>\n      <PerpendicularOffset>-30</PerpendicularOffset>";
              return sld
            }
          },
          lonlatPositon: [0, 0],
          lonlatStr: '',
          altitudeLayer: [],
          altitudePositon: [0, 0],
          timeHandler: null,
          showTool: false,
          toolData:[
            { icon: 'icon-weidu' ,key: 'lonlat',name: '经纬度' },
            { icon: 'icon-altitude-', key: 'altitude',name: '海拔' },
            { icon: 'icon-meter', key: 'line',name: '测距离' },
            { icon: 'icon-area', key: 'area',name: '测面积' }
          ],
          seeLonlat: false,
          seeAltitude: false,
          drawLine: false,
          drawArea: false,
          weatherInfo: null,
          showWeaDetail: false,
          centerInfo: null,
        }
      },
      template: `<div @click="hidePop">
                  <div class="map-ctl">
                    <el-tooltip class="item" effect="dark"  popper-class="tooltip-opacity" :content="showVec ? '卫星' : '地图'" placement="left">
                      <span class="layer-ctl box-common-shadow border-common-radius"
                        v-if="switchCtl"
                        :style="{background: background, top: (top - 104) + 'px'}"
                        @click="showVec = !showVec">
                          <img 
                          v-if="!showVec"
                          class="img-layer" src="static/assets/img/map/map.png" width="24px">
                          <img
                          v-if="showVec" 
                          class="vec-layer" src="static/assets/img/map/vec.png" width="24px">
                      </span>
                    </el-tooltip>
                    
                    <el-tooltip class="item" effect="dark"  popper-class="tooltip-opacity" content="置中" placement="left">
                      <span class="center-ctl box-common-shadow border-common-topradius"
                        v-if="centerCtl && centerCtl.use"
                        :style="{background: background, top: top + 'px', borderRadius: borderRadius}"
                        @click="setCenter">
                          <i class="iconfont icon-icon4 center-to"></i>
                      </span>
                    </el-tooltip>

                    <div class="zoom-ctl box-common-shadow border-common-radius">
                      <el-tooltip class="item" effect="dark"  popper-class="tooltip-opacity" content="放大" placement="left">
                        <span class="zoom-in no-select" @click="zoomCtl(true)">+</span>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark"  popper-class="tooltip-opacity" content="缩小" placement="left">
                        <span class="zoom-out no-select " @click="zoomCtl(false)">－</span>
                      </el-tooltip>
                    </div>

                  </div>
                  <div v-if="useTools" class="map-tools box-common-shadow">
                    <p class="no-select border-common-radius" @click="toggleToolPanel"><i class="iconfont icon-tool"></i>工具<span :class="showTool ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></span></p>
                    <ul v-show="showTool" class="border-common-radius">
                      <li v-for="(item, index) in toolData" 
                      @click="toolChange(index)"
                      ><i :class="'iconfont ' + item.icon"></i>{{item.name}}</li>
                    </ul>
                  </div>
                  <div v-if="seeLonlat" class="lonlat box-common-shadow border-common-radius"
                    :style="{top: lonlatPositon[1] + 'px', left: lonlatPositon[0] + 'px'}">
                    <p class="lonlat-str" v-html="lonlatStr"></p>
                    <p class="lonlat-tip">移动鼠标查看经纬度，<span class="map-highlight-tip">双击</span>结束</p>
                    <div class="tip-arrow-bottom"></div>
                  </div>
                  <div v-if="seeAltitude" class="altitude border-common-radius"
                    :style="{top: altitudePositon[1] + 'px', left: altitudePositon[0] + 'px'}">
                    <p><span class="map-highlight-tip">单击</span>查看海拔高度，<span class="map-highlight-tip">双击</span>结束</p>
                  </div>
                  
                      <agrisz-weather 
                        v-show="useWeather"
                        :top="56" 
                        :right="385"
                        :showDetail="showWeaDetail"
                        :centerInfo="centerInfo"
                        @click.native="stopPop"
                        @toggleWeaDetail="toggleWeaDetail"
                        :weatherInfo="weatherInfo"></agrisz-weather>
                    
                </div>`,
      props: {
        centerCtl: {
          type: Object,
          default: null
        }, 
        switchCtl: {
          type: Boolean,
          default: false
        }, 
        addAreas: {
          type: Object,
          default: null
        }, 
        addTileAreas: {
          type: Object,
          default: null
        }, 
        minZoom: {
          type: Number,
          default: 2
        }, 
        maxZoom: {
          type: Number,
          default: 18
        }, 
        background: {
          type: String,
          default: '#fff'
        },
        top: {
          type: Number,
          default: 104
        },
        borderRadius: {
          type: String,
          default: '4px 4px 0 0'
        },
        useTools: {
          type: Boolean,
          default: false
        },
        useWeather: {
          type: Boolean,
          default: true
        }
      },
      mounted: function () {
        this.init()
        this.meassureInteraction = meassureHandler(this)
        this.$on("stopDraw", this.stopDraw)
        vueBus.$on('mapDrawHandler', this.mapDrawHandler)
        vueBus.$on('doubleClickZoom', this.doubleClickZoom)
        this.initWeather()
      },
      destroyed: function () {
        this.removeLayers(this.areaLayers, this.map)
      },
      methods: {
        init() {
          var vm = this;
          vm.areaLayers = []
          vm.tileAreaLayers = []
          vm.tdtVecLayer = new ol.layer.Tile({
            title: "矢量数据",
            visible: vm.showVec,
            source: new ol.source.XYZ({
              urls: defineUrl("vec")
            })
          });

          // vm.tdtImgLayer = new ol.layer.Tile({
          //   title: "影像数据",
          //   visible: !vm.showVec,
          //   source: new ol.source.XYZ({
          //     urls: defineUrl("img")
          //   })
          // });
          
          vm.TDTAnnotationRoadLayer = vm.getTDTAnnotationRoadLayer()
          
          vm.tdtImgLayer = new ol.layer.Tile({
            title: "谷歌影像未加密地图",
            visible: !vm.showVec,
            source: new ol.source.XYZ({url: 'http://www.google.cn/maps/vt?lyrs=s@189&x={x}&y={y}&z={z}'}),
            zIndex: -100
          });

          var tdtCvaLayer = new ol.layer.Tile({
            title: "文字注记",
            visible: true,
            source: new ol.source.XYZ({
              urls: defineUrl("cva")
            })
          });

          function defineUrl(layerType) {
            var urlArr = [];
            for (var i = 0; i < 8; i++) {
              var url = "http://t" + i + ".tianditu.com/DataServer?T=" + layerType + "_w&x={x}&y={y}&l={z}";
              urlArr.push(url);
            }
            return urlArr;
          }

          var map = new ol.Map({
            target: vm.$el,
            interactions : ol.interaction.defaults({doubleClickZoom :false}),
            layers: [vm.tdtVecLayer, vm.tdtImgLayer, tdtCvaLayer],
            controls: ol.control.defaults().extend([
              new ol.control.ScaleLine({
                target: document.getElementById('scaleline')
              })
            ]),
            view: new ol.View({
              center: ol.proj.fromLonLat([104.48, 39.85]),
              zoom: 4,
              minZoom: this.minZoom ? this.minZoom : 2,
              maxZoom: this.maxZoom ? this.maxZoom : 18
            })
          });
          tdtCvaLayer.setZIndex(5);
          vm.map = map;

          this.doubleClickZoom(true);
          this.$emit('initMap', map)
        },
        initWeather() {
          this.weatherInfo = {}
          this.map.getView().on('change', this.mapViewChange)
        },
        hidePop() {
          this.showWeaDetail = false
        },
        stopPop() {
          event.stopPropagation()
        },
        mapViewChange() {
          var center = this.map.getView().getCenter(),
            zoom = this.map.getView().getZoom()
          this.centerInfo = {center, zoom}
        },
        toggleWeaDetail(show) {
          this.showWeaDetail = show
        },
        doubleClickZoom(use) {
          if (use) {
            this.dbclkInteraction = new ol.interaction.DoubleClickZoom()
            this.map.addInteraction(this.dbclkInteraction)

          } else if (this.dbclkInteraction) {
            this.map.removeInteraction(this.dbclkInteraction)
          } 
        },
        getTDTAnnotationRoadLayer() {
          var resolutions = [];
          var matrixIds = [];
          var proj3857 = ol.proj.get('EPSG:3857');
          var maxResolution = ol.extent.getWidth(proj3857.getExtent()) / 256;
          for (var i = 0; i < 18; i++) {
            matrixIds[i] = i.toString();
            resolutions[i] = maxResolution / Math.pow(2, i);
          }
          var tianditu_annotation_road_layer = new ol.layer.Tile({
            source: new ol.source.WMTS({
              url: "http://t{0-6}.tianditu.com/cia_w/wmts",
              layer: 'cia',
              matrixSet: 'w',
              format: 'tiles',
              tileGrid: new ol.tilegrid.WMTS({
                origin: ol.extent.getTopLeft(proj3857.getExtent()),
                resolutions: resolutions,
                matrixIds: matrixIds
              })
            }),
            zIndex: 100
          });
          return tianditu_annotation_road_layer;
        },
        setCenter () {
          if (this.centerCtl.bounds) {
            var extent = ol.extent.applyTransform(this.centerCtl.bounds, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
            this.map.getView().fit(extent, this.map.getSize());
          } else {
            this.$emit('setCenter')
          }
          this.mapViewChange()
        },
        zoomCtl(zoomIn) {
          var view = this.map.getView()
          var zoom = view.getZoom()
          if (zoomIn && zoom < this.maxZoom) {
            zoom += 1
          }
          if (!zoomIn && zoom > this.minZoom) {
            zoom -= 1
          }
          view.setZoom(zoom)
          this.mapViewChange()
        },
        bindLonLatEvt() {
          this.map.on('pointermove', this.getLonLat);
          this.map.on('dblclick', this.clearTools);
          this.map.getViewport().style.cursor = 'pointer';
        },
        getLonLat(event) {
          if (event.draging) {
            return
          } else {
            var pixel =  this.map.getEventPixel(event.originalEvent);
            var coordinate = this.map.getCoordinateFromPixel(pixel)
            var lonlat = ol.coordinate.toStringHDMS(ol.proj.transform(
              coordinate, 'EPSG:3857', 'EPSG:4326'));
            if (lonlat.indexOf('N') > 0) {
              var lon = '北纬' + lonlat.split('N')[0]
              if (lonlat.indexOf('E') > 0) {
                var lat = '东经' + lonlat.split('N')[1].split('E')[0]
              } else {
                var lat = '西经' + lonlat.split('N')[1].split('W')[0]
              }
            } else if (lonlat.indexOf('S') > 0) {
              var lon =  '南纬' + lonlat.split('S')[0]
              if (lonlat.indexOf('E') > 0) {
                var lat = '东经' + lonlat.split('S')[1].split('E')[0]
              } else {
                var lat = '西经' + lonlat.split('S')[1].split('W')[0]
              }
            }
            var lonlatStr = lat + '&nbsp;&nbsp;' + lon
            this.renderLonLat(lonlatStr, pixel)
          }
        },
        renderLonLat(lonlatStr, position) {
          this.lonlatPositon = [position[0] - 114, position[1] - 70]
          this.lonlatStr = lonlatStr
        },
        removeLonlat() {
          this.seeLonlat = false
          this.map.un('pointermove', this.getLonLat);
          this.map.un('dblclick', this.clearTools);
        },
        bindAltitudeEvt() {
          this.map.on('click', this.addAltitude);
          this.map.on('pointermove', this.showAltitudeTip);
          this.map.getViewport().style.cursor = 'pointer';
        },
        showAltitudeTip(event) {
          if (!event.draging) {
            var pixel = this.map.getEventPixel(event.originalEvent);
            this.altitudePositon = [pixel[0] + 15, pixel[1] - 30]
          }
        },
        addAltitude(event) {
          if (this.timeHandler) {
            clearTimeout(this.timeHandler)
            this.clearTools()
            this.timeHandler = null
          } else {
            this.timeHandler = setTimeout(() => {
              var pixel =  this.map.getEventPixel(event.originalEvent),
              coordinate = this.map.getCoordinateFromPixel(pixel),
              lonlat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'),
              _overlay = this.addPointTip(coordinate)

              request.pointAltitude(lonlat).then((response)=> {
                if (response.status === 200 && response.data.status === 0) {
                  _overlay.innerHTML = `海拔 ${response.data.data.altitude} 米`
                } else {
                  _overlay.innerHTML = `暂无数据`
                }
              })

              this.timeHandler = null
            }, 300)
          } 
        },
        removeAltitude() {
          this.seeAltitude = false

          if (this.altitudeLayer) {
            for (var i = 0; i < this.altitudeLayer.length; i++) {
              this.map.removeLayer(this.altitudeLayer[i])
            }
            this.altitudeLayer = []
          }

          let altitudePopups = document.getElementsByClassName('altitude-popup') 
          for (let i = 0; i < altitudePopups.length; i++) {
            altitudePopups[i].parentNode.removeChild(altitudePopups[i])
            i--
          }

          this.map.un('click', this.addAltitude);
          this.map.un('pointermove', this.showAltitudeTip);
        },
        addPointTip(coordinate) {
          this.altitudeLayer = this.altitudeLayer ? this.altitudeLayer : [];

          var feature = new ol.Feature({
            geometry: new ol.geom.Point(coordinate)
          });

          var source = new ol.source.Vector({
            features: [feature]
          });

          var textStyle = [
            new ol.style.Style({
                image: new ol.style.Icon({
                  anchor: [0.5, 1],
                  src: '/static/assets/img/map/altitude.png'
                }),
              })
          ];
        
          var _altitudeLayer = new ol.layer.Vector({
            source: source,
            style: textStyle
          });

          this.map.addLayer(_altitudeLayer);
          _altitudeLayer.setZIndex(10)
          this.altitudeLayer.push(_altitudeLayer);

          return this.addOverlay(coordinate)
        },
        addOverlay(coordinate) {
          let popup = document.createElement('div')

          let content = document.createElement('p')
          content.className = 'altitude-popup-p'
          content.innerHTML = "加载中……"

          let arrow = document.createElement('div')
          arrow.className = 'tip-arrow-bottom'

          popup.className = 'altitude-popup box-common-shadow border-common-radius'
          popup.appendChild(content)
          popup.appendChild(arrow)

          document.body.appendChild(popup)

          let height = document.body.clientHeight + 65
          popup.style.left = `-48px`
          popup.style.top = `-${height}px`

          let pop = new ol.Overlay({
            element: popup,
            insertFirst: false
          });
          this.map.addOverlay(pop);
          pop.setPosition(coordinate)

          return content
        },
        addGeoLayer: function(options, map) {
          var _size = map.getSize(),
              _extent = map.getView().calculateExtent(_size);

          var tiled = new ol.layer.Tile({
            visible: options.visible,
            extent: options.extent ? options.extent : _extent,
            opacity: options.opacity ? options.opacity : 1,
            source: new ol.source.TileWMS({
              url: options.serverUrl ? options.serverUrl : config.mapUrl,
              params: {
                FORMAT: "image/png",
                'VERSION': '1.1.1',
                tiled: true,
                STYLES: options.styles ? options.styles : '',
                LAYERS: options.layerName,
              }
            })
          });

          map.addLayer(tiled);

          if (options.sld) {
            if(tiled.getSource().getParams().SLD_BODY){
              delete tiled.getSource().getParams().SLD_BODY;
            }
            tiled.getSource().updateParams({SLD_BODY: options.sld});
          }

          if (options.zIndex && typeof options.zIndex ==='number') {
            tiled.setZIndex(options.zIndex);
          }
          return tiled
        },
        addAreaLayers(code, areas, map) {
          var _this = this,
            areaLayers = []
          return getAreaLayers(code, areas, map)
          function getAreaLayers(code, areas, map) {
            var layersName;
            for (let i = 0; i < areas.length; i++) {
              if (code) {
                if(areas[i].area_id == code) {
                  layersName = 'map:area_' + areas[i].area_id;
                  addSingleLayer(areas[i].bounds, layersName, "outer", map);
                  if (areas[i].contain) {
                    for (let j = 0; j < areas[i].contain.length; j++) {
                      layersName = 'map:area_' + areas[i].contain[j].area_id
                      addSingleLayer(areas[i].contain[j].bounds, layersName, 'inner', map);
                    }
                  }
                  return areaLayers;
                } 
                if(areas[i].area_id != code && areas[i].contain) {
                  getAreaLayers(code, areas[i].contain, map);
                }
              } else {
                layersName = 'map:area_' + areas[i].area_id;
                addSingleLayer(areas[i].bounds, layersName, "outer", map)
              }
            }

            return areaLayers
          }

          function addSingleLayer(bounds, layerName, lineType, map) {
            let layer, extent, layerOptions;
            
            extent = ol.extent.applyTransform(
              [bounds.lb_lon, bounds.lb_lat, bounds.rt_lon, bounds.rt_lat], 
              ol.proj.getTransform("EPSG:4326", "EPSG:3857"));

            layerOptions = {
              visible: true,
              extent: extent,
              layerName: layerName,
              sld: getAreaSld(lineType)
            }
            layer = _this.addGeoLayer(layerOptions, map);
            layer.setZIndex(8);
            areaLayers.push(layer);
          }

          function getAreaSld (type) {
            var sld = '<StyledLayerDescriptor version="1.0.0" '+
                     'xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" '+
                     'xmlns="http://www.opengis.net/sld" '+
                     'xmlns:ogc="http://www.opengis.net/ogc" '+
                     'xmlns:xlink="http://www.w3.org/1999/xlink" '+
                     'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'+
                      '<NamedLayer>'+
                        '<Name>default_polygon</Name>'+
                        '<UserStyle>'+
                          '<Title>Default Polygon</Title>'+
                          '<Abstract>A sample style that draws a polygon</Abstract>'+
                          '<FeatureTypeStyle>'+
                            '<Rule>'+
                              '<Name>rule1</Name>'+
                              '<Title>Gray Polygon with Black Outline</Title>'+
                              '<Abstract>A polygon with a gray fill and a 1 pixel black outline</Abstract>';

            sld += '<PolygonSymbolizer>'+
                      '<Fill>'+
                        '<CssParameter name="fill">'+ configData.sld[type].fill +'</CssParameter>'+
                         '<CssParameter name="fill-opacity">'+ configData.sld[type].fillOpacity +'</CssParameter>'+
                      '</Fill>'+
                      '<Stroke>'+
                        '<CssParameter name="stroke">'+ configData.sld[type].stroke +'</CssParameter>'+
                        '<CssParameter name="stroke-width">10</CssParameter>';
            if (type == 'inner') {
              sld += '</Stroke>'+
                '</PolygonSymbolizer>';
            }   
            else if (type == "outer") {
              sld += '<CssParameter name="stroke-linecap">'+ configData.sld[type].strokeLinecap +'</CssParameter>'+
                  '</Stroke>'+
                '</PolygonSymbolizer>';
            } else if (type == "selected") {
              sld += '</Stroke>'+
                  '</PolygonSymbolizer>'+
                  '<PolygonSymbolizer>'+
                    '<Fill>'+
                      '<CssParameter name="fill">'+ configData.sld[type].fill1 +'</CssParameter>'+
                       '<CssParameter name="fill-opacity">'+ configData.sld[type].fillOpacity1 +'</CssParameter>'+
                    '</Fill>'+
                    '<Stroke>'+
                      '<CssParameter name="stroke">'+ configData.sld[type].stroke1 +'</CssParameter>'+
                      '<CssParameter name="stroke-width">'+ configData.sld[type].strokeWidth1 +'</CssParameter>'+
                    '</Stroke>'+
                  '</PolygonSymbolizer>'+
                 '<PerpendicularOffset>'+ configData.sld[type].perpendicularOffset +'</PerpendicularOffset>';
            }
            sld += '</Rule>'+
                  '</FeatureTypeStyle>'+
                '</UserStyle>'+
              '</NamedLayer>'+
            '</StyledLayerDescriptor>';
            return sld;
          }
        },
        addTileAreaLayers(code, areas, map, extent) {
          var _this = this,
            areaLayers = []
          return ((code, areas, map) => {
            var layersName;
            for (let i = 0; i < areas.length; i++) {
              if (code) {
                if(areas[i].area_id == code) {
                  var _layer = this.addRegion(areas[i].area_id, this.styles.bold, map, extent);
                  areaLayers.push(_layer)
                  if (areas[i].contain) {
                    for (let j = 0; j < areas[i].contain.length; j++) {
                      layersName = 'map:area_' + areas[i].contain[j].area_id
                      var _layer = this.addRegion(areas[i].contain[j].area_id, this.styles.normal, map, extent);
                      areaLayers.push(_layer)
                    }
                  }
                  return areaLayers;
                } 
                if(areas[i].area_id != code && areas[i].contain) {
                  areaLayers = areaLayers.concat(this.addTileAreaLayers(code, areas[i].contain, map, extent));
                }
              } else {
                var _layer = this.addRegion(areas[i].area_id, this.styles.bold, map, extent);
                areaLayers.push(_layer)
              }
            }
            return areaLayers
          })(code, areas, map)

          return areaLayers
        },
        addRegion(areaCode, styles, map, extent) {
          var server = config.mapUrl;
          var layerName = "map:sz_gov_shape_data";
          var fieldName = "area_code";

          return this.addFilteredPGLayer(server, layerName, fieldName, areaCode, styles, map, extent);
        },
        addFilteredPGLayer(server, layerName, fieldName, fieldVal, styles, map, extent) {
          extent = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
          var layer = new ol.layer.Image({
            extent: extent,
            source: new ol.source.ImageWMS({
              url : server,
              params: {
                'VERSION': '1.1.1',
                'LAYERS': layerName,
                "tiled": true,
                "SLD_BODY": this.getFilterSldWithStyle(layerName, fieldName, fieldVal, styles)
              }
            })
          });
          map.addLayer(layer);
          layer.setZIndex(8)
          return layer
        },
        getFilterSldWithStyle(layerName, fieldName, fieldVal, styles) {
          return "<StyledLayerDescriptor\n                xmlns=\"http://www.opengis.net/sld\"\n                xmlns:ogc=\"http://www.opengis.net/ogc\"\n                xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n                xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n                version=\"1.0.0\"\n                xsi:schemaLocation=\"http://www.opengis.net/sld StyledLayerDescriptor.xsd\">\n            <UserLayer>\n                <Name>" + layerName + "</Name>\n                <UserStyle>\n                    <Name>UserSelection</Name>\n                    <FeatureTypeStyle>\n                        <Rule>\n                            <Filter xmlns:gml=\"http://www.opengis.net/gml\">\n                                <PropertyIsEqualTo>\n                                    <PropertyName>" + fieldName + "</PropertyName>\n                                    <Literal>" + fieldVal + "</Literal>\n                                </PropertyIsEqualTo>\n                            </Filter>\n\n                        " + styles() + "\n\n                        </Rule>\n                    </FeatureTypeStyle>\n                </UserStyle>\n            </UserLayer>\n        </StyledLayerDescriptor>";
        },
        addXYZLayer(url, extent, map) {
          let layer = new ol.layer.Tile({
            extent: extent,
            source: new ol.source.XYZ({
              url: url +'/{z}/{x}/{-y}.png'
            })
          });
          map.addLayer(layer);
          layer.setZIndex(2);
          return layer
        },
        removeLayers (layers, map) {
          if (layers.length > 0) {
            for (var i = 0; i < layers.length; i++) {
              map.removeLayer(layers[i])
            }
            return []
          }
        },
        stopDraw() {
          this.meassureInteraction.stopDraw();
          vueBus.$emit('mapDrawHandler', {maptool: false})
        },
        mapDrawHandler({maptool, ndvi}) {
          if (ndvi) {
            this.clearTools(true)
            this.setMapToolStatus()
            this.meassureInteraction.stopDraw();
          }
        },
        clearTools(disableDbZoom) {
          this.removeLonlat()
          this.removeAltitude()

          this.setMapDefaultStatus(disableDbZoom)
        },
        toggleToolPanel() {
          this.showTool = !this.showTool
          this.clearTools(true)
          this.setMapToolStatus()
          this.meassureInteraction.stopDraw();
          vueBus.$emit('mapDrawHandler', {maptool: false})
        },
        toolChange(index) {
          this.showTool = false
          this.clearTools(true)

          switch(index) {
            case 0: 
              this.seeLonlatHandler()
              break
            case 1: 
              this.seeAltitudeHandler()
              break
            case 2: 
              this.drawLineHandler()
              break
            case 3: 
              this.drawAreaHandler()
              break
            default: 
              break
          }
        },
        setMapDefaultStatus(disableDbZoom) {
          vueBus.$emit('mapDrawHandler', {maptool: false})
          
          this.map.getViewport().style.cursor = 'default'

          if (typeof disableDbZoom === "boolean" && disableDbZoom) {
            vueBus.$emit('doubleClickZoom', false)
          } else {
            setTimeout(()=> {
              vueBus.$emit('doubleClickZoom', true)
            }, 1000)
          }
        },
        setMapToolStatus() {
          vueBus.$emit('mapDrawHandler', {maptool: true})
          vueBus.$emit('doubleClickZoom', false)
          this.map.getViewport().style.cursor = 'pointer'
        },
        seeLonlatHandler() {
          this.setMapToolStatus()
          this.seeLonlat = true
          this.bindLonLatEvt()
        },
        seeAltitudeHandler() {
          this.setMapToolStatus()
          this.seeAltitude = true
          this.bindAltitudeEvt()
        },
        drawLineHandler() {
          this.setMapToolStatus()
          this.meassureInteraction('line')
        },
        drawAreaHandler() {
          this.setMapToolStatus()
          this.meassureInteraction('area')
        }
      },
      watch: {
        showVec (show) {
          this.tdtVecLayer.setVisible(show)
           this.tdtImgLayer.setVisible(!show)
        },
        centerCtl(newV, oldV) {
          if (newV.bounds && newV.bounds !== oldV.bounds) {
            this.setCenter()
          }
        },
        addAreas (area, oldV) {
          if (area && !area.code) {
            this.areaLayers = this.removeLayers(this.areaLayers, this.map);
            this.areaLayers = this.addAreaLayers(area.code, area.areas, this.map)
            
          } else if (area && area.code && area.areas && area.code !== oldV.code) {
            this.areaLayers = this.removeLayers(this.areaLayers, this.map);
            this.areaLayers = this.addAreaLayers(area.code, area.areas, this.map)
          }
        },
        addTileAreas(area, oldV) {
          if (area && !area.code) {
            this.tileAreaLayers = this.removeLayers(this.tileAreaLayers, this.map);
            this.tileAreaLayers = this.addTileAreaLayers(area.code, area.areas, this.map, area.extent)
          } else if (area && area.code && area.areas && area.code !== oldV.code) {
            this.tileAreaLayers = this.removeLayers(this.tileAreaLayers, this.map);
            this.tileAreaLayers = this.addTileAreaLayers(area.code, area.areas, this.map, area.extent)
          }
        }
      },
      components: {
      }
    }
  }
}