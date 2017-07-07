import meassureHandler from './meassure.js'
module.exports = function (config, configData, request, vueBus, store) {
  return {
    name: 'my-map',
    prop: {
      data(){
        return {
          showVec: false,
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
          TILE_LAYER_NAME: "map:sz_gov_shape_data",
        }
      },
      template: `<div @click="hidePop">
                  <div class="map-ctl map-zIndex">
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

                    <div v-if="useZoomCtl" class="zoom-ctl box-common-shadow border-common-radius">
                      <el-tooltip class="item" effect="dark"  popper-class="tooltip-opacity" content="放大" placement="left">
                        <span class="zoom-in no-select" @click="zoomCtl(true)">+</span>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark"  popper-class="tooltip-opacity" content="缩小" placement="left">
                        <span class="zoom-out no-select " @click="zoomCtl(false)">－</span>
                      </el-tooltip>
                    </div>

                  </div>

                  <div v-if="useTools" class="map-tools box-common-shadow map-zIndex">
                    <p class="no-select border-common-radius" @click="toggleToolPanel"><i class="iconfont icon-tool"></i>工具<span :class="showTool ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></span></p>
                    <ul v-show="showTool" class="border-common-radius">
                      <li v-for="(item, index) in toolData" 
                      @click="toolChange(index)"
                      ><i :class="'iconfont ' + item.icon"></i>{{item.name}}</li>
                    </ul>
                  </div>

                  <div v-if="seeLonlat" class="lonlat box-common-shadow border-common-radius map-zIndex"
                    :style="{top: lonlatPositon[1] + 'px', left: lonlatPositon[0] + 'px'}">
                    <p class="lonlat-str" v-html="lonlatStr"></p>
                    <p class="lonlat-tip">移动鼠标查看经纬度，<span class="map-highlight-tip">双击</span>结束</p>
                    <div class="tip-arrow-bottom"></div>
                  </div>

                  <div v-if="seeAltitude" class="altitude border-common-radius map-zIndex"
                    :style="{top: altitudePositon[1] + 'px', left: altitudePositon[0] + 'px'}">
                    <p><span class="map-highlight-tip">单击</span>查看海拔高度，<span class="map-highlight-tip">双击</span>结束</p>
                  </div>

                  <agrisz-weather 
                    v-if="useWeather"
                    :top="56" 
                    :right="137"
                    :showDetail="showWeaDetail"
                    :centerInfo="centerInfo"
                    @click.native="stopPop"
                    @toggleWeaDetail="toggleWeaDetail"
                    :weatherInfo="weatherInfo">
                  </agrisz-weather>
                </div>`,
      props: {
        useZoomCtl: {
          type: Boolean,
          default: true
        }, 
        centerCtl: {
          type: Object,
          default: null
        }, 
        switchCtl: {
          type: Boolean,
          default: false
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
        },
        // tools: {
        //   type: Array,
        //   default: ["zoom", "switch", "measure", "weather"]
        // },
        // defaultBounds: {
        //   type: Array,
        //   default: [59.16923446634909, 3.78384672174441, 120.85765914869889, 53.6085216306968]
        // }
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
          this.areaLayers = []
          this.tileAreaLayers = []
          
          this.tdtVecLayer = new ol.layer.Tile({
            title: "矢量数据",
            visible: this.showVec,
            source: new ol.source.XYZ({
              urls: defineUrl("vec")
            })
          });

          this.tdtImgLayer = new ol.layer.Tile({
            title: "影像数据",
            visible: !this.showVec,
            source: new ol.source.XYZ({
              urls: defineUrl("img")
            })
          });
          
          this.googleImgLayer = new ol.layer.Tile({
            title: "谷歌影像未加密地图",
            visible: !this.showVec,
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
            target: this.$el,
            interactions : ol.interaction.defaults({doubleClickZoom :false}),
            layers: [this.tdtVecLayer, this.googleImgLayer, tdtCvaLayer],
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
          this.map = map;

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
        stopPop(event) {
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
        setCenter() {
          if (this.centerCtl.bounds) {
            var extent = ol.extent.applyTransform(this.centerCtl.bounds, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
            this.map.getView().fit(extent, this.map.getSize());
          } else {
            this.$emit('setCenter')
          }
          this.mapViewChange()
        },
        getOffsetBounds(bounds, size, offset=260) {
          var offsetBounds = []
          var scale = (bounds[2] - bounds[0]) / size[0]

          offsetBounds[0] = bounds[0] - offset*scale
          offsetBounds[2] = bounds[2] - offset*scale
          offsetBounds[1] = bounds[1]
          offsetBounds[3] = bounds[3]
          
          return offsetBounds
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
          console.log(zoom)
        },
        bindLonLatEvt() {
          this.map.on('pointermove', this.getLonLat);
          this.map.on('dblclick', this.dblcLonlat);
          this.map.getViewport().style.cursor = 'pointer';
        },
        getLonLat(event) {
          if (event.draging) {
            return

          } else {
            var pixel =  this.map.getEventPixel(event.originalEvent);
            var coordinate = this.map.getCoordinateFromPixel(pixel)
            
            var lonlatStr = this.getLonLatByCoordinate(coordinate)
            this.renderLonLat(lonlatStr, pixel)
          }
        },
        getLonLatByCoordinate(coordinate) {
          var lonlat = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
          
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

          return lonlatStr
        },
        renderLonLat(lonlatStr, position) {
          this.lonlatPositon = [position[0] - 114, position[1] - 70]
          this.lonlatStr = lonlatStr
        },
        removeLonlat() {
          this.seeLonlat = false
          this.map.un('pointermove', this.getLonLat);
          this.map.un('dblclick', this.dblcLonlat);
        },
        dblcLonlat() {
          this.clearTools()
          setTimeout(()=> {
            this.doubleClickZoom(true)
          }, 1000)
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
            this.dblcLonlat()
            this.timeHandler = null
          } else {
            this.timeHandler = setTimeout(() => {
              var pixel =  this.map.getEventPixel(event.originalEvent),
              coordinate = this.map.getCoordinateFromPixel(pixel),
              lonlat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'),
              _overlay = this.addAltitudeTip(coordinate)

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
        addAltitudeTip(coordinate) {
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

          return this.addAltitudeOverlay(coordinate)
        },
        addAltitudeOverlay(coordinate) {
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
          popup.style.top = `-65px`

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

          if (!options.serverUrl) {
            console.error("Please set 'serverUrl'")
            return null
          }

          options.extent = options.extent ? options.extent : _extent
          var tiled = this.getTileLayer(options)
          map.addLayer(tiled);

          return tiled
        },
        addXYZLayer(url, extent, map) {
          if (!url) {
            console.error("Please set 'serverUrl'")
            return null
          }

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
          this.doubleClickZoom(true)
          this.meassureInteraction.stopDraw();
          vueBus.$emit('mapDrawHandler', {maptool: false})
        },
        mapDrawHandler({maptool, ndvi}) {
          if (ndvi) {
            this.clearTools()
            this.doubleClickZoom(false)
            this.meassureInteraction.stopDraw();
          }
        },
        clearTools() {
          this.removeLonlat()
          this.removeAltitude()

          this.meassureInteraction.stopDraw();
          vueBus.$emit('mapDrawHandler', {maptool: false})
          this.map.getViewport().style.cursor = 'default'
        },
        activeTools() {
          this.clearTools()
          vueBus.$emit('mapDrawHandler', {maptool: true})
          this.doubleClickZoom(false)
        },
        toggleToolPanel() {
          this.showTool = !this.showTool
          this.clearTools()
        },
        toolChange(index) {
          this.showTool = false
          this.activeTools()
          switch(index) {
            case 0: 
              this.seeLonlat = true
              this.bindLonLatEvt()
              break
            case 1: 
              this.seeAltitude = true
              this.bindAltitudeEvt()
              break
            case 2: 
              this.meassureInteraction('line')
              break
            case 3: 
              this.meassureInteraction('area')
              break
            default: 
              break
          }
        },
        /* 
          @options: {
            serverUrl: 'http://xxx.com',
            layerName: 'layer name',
            extent: [1, 2, 3, 4],
            visible: true,
            opacity: 1,
            zIndex: 3,
            styles: 'sld name',
            sld: '<sld></sld>'
          }
         */
        getTileLayer(options) {

          if (!options.serverUrl) {
            console.error("Please set 'serverUrl'")
            return null
          }
          
          var layer = null
          layer = new ol.layer.Tile({
            visible: options.visible,
            extent: options.extent,
            opacity: options.opacity,
            source: new ol.source.TileWMS({
              url: options.serverUrl,
              params: {
                LAYERS: options.layerName,
                tiled: true,
                FORMAT: "image/png",
                VERSION: '1.1.1',
              }
            })
          })

          updateParams(layer, "STYLES", options.styles)
          updateParams(layer, "SLD_BODY", options.sld)

          setLayerZIndex(layer, options.zIndex)

          return layer

          function updateParams(layer, key, value) {
            if (value) {
              layer.getSource().updateParams({[key]: value});
            }
          }

          function setLayerZIndex(layer, zIndex) {
            if (typeof zIndex ==='number') {
              layer.setZIndex(zIndex);
            }
          }
        },
        /* 
         * @metaList: an Array of object
         * @keys: an Array of object key
         */
        getFeatures(metaList, keys, desc) {
          var features = []
          if (desc) {
            for (var i = metaList.length - 1; i >= 0; i--) {
              appendFeature(features, metaList[i], keys)
            }

          } else {
            for (var i = 0; i < metaList.length; i++) {
              appendFeature(features, metaList[i], keys)
            }
          } 

          return features

          function appendFeature(features, metaObject, keys) {
            var item = getAttrs(metaObject, keys)
            var feature = {
              type: 'Feature',
              geometry: getGeom(metaObject.geom),
              properties: item
            }
            features.push(feature)
          }
          // easy copy
          function getAttrs(metaObject, keys) {
            var attribute = {}
            for(var i = 0; i < keys.length; i++) {
              attribute[keys[i]] = metaObject[keys[i]]
            }

            return attribute
          }
          function getGeom(geom) {
            if (typeof geom === "string") {
              geom = JSON.parse(geom)
            }

            return geom
          }
        },
        getMultyAreaLayer(mapUrl, codes, bounds) {
          var layerName = this.TILE_LAYER_NAME;
          var sld = this.getCodesSld(codes, layerName)
          var source = this.getImageSource(mapUrl, layerName, sld)
          var extent = this.getExtentByBounds(bounds)
          var areaLayer = this.getImageLayer(source, extent)

          return areaLayer
        },
        getCodesSld(codes, layerName) {
          var literals = ''

          for (var i = 0; i < codes.length; i++) {
            literals += `<ogc:Literal>${codes[i]}</ogc:Literal>`
          }
          var sld = '<?xml version="1.0" encoding="ISO-8859-1"?><StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml">  <UserLayer> <Name>' + layerName + '</Name> <UserStyle> <Title>GeoServer SLD Cook Book: Simple point</Title> <FeatureTypeStyle> <Rule> <ogc:Filter> <ogc:PropertyIsEqualTo> <ogc:Function name="in"> <ogc:PropertyName>area_code</ogc:PropertyName> ' + literals + ' </ogc:Function> <ogc:Literal>true</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter><PolygonSymbolizer><Fill> <CssParameter name="fill">#000000</CssParameter> <CssParameter name="fill-opacity">0</CssParameter></Fill><Stroke> <CssParameter name="stroke">#1665c1</CssParameter> <CssParameter name="stroke-width">1.6</CssParameter></Stroke></PolygonSymbolizer><PolygonSymbolizer><Fill> <CssParameter name="fill">#000000</CssParameter> <CssParameter name="fill-opacity">0</CssParameter></Fill><Stroke> <CssParameter name="stroke">#ffffff</CssParameter> <CssParameter name="stroke-width">0.2</CssParameter> </Stroke></PolygonSymbolizer></Rule></FeatureTypeStyle></UserStyle></UserLayer></StyledLayerDescriptor>'
          return sld
        },
        getImageSource(mapUrl, layerName, sld) {
          var source = new ol.source.TileWMS({
            url : mapUrl,
            params: {
              'VERSION': '1.1.1',
              'LAYERS': layerName,
              "tiled": true,
              "SLD_BODY": sld,
              "FORMAT": "image/png8"
            }
          })

          return source
        },
        getExtentByBounds(bounds) {
          var extent = ol.extent.applyTransform(bounds, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
          return extent
        },
        getImageLayer(source, extent) {
          var layer = new ol.layer.Tile({
            source: source,
            extent: extent,
          })
          layer.setZIndex(8)
          
          return layer
        },
        getOverlayPosition(detailPopup, direction, offset) {
          var top = 0
          var left = 0
          offset = typeof offset === "number" ? offset : 50
          switch(direction) {
            case "top":
              top = detailPopup.clientHeight + offset
              left = detailPopup.clientWidth / 2
              break
            case "left":
              top = detailPopup.clientHeight / 2
              left = detailPopup.clientWidth + offset
              break
            case "bottom":
              top = -detailPopup.clientHeight/2
              left = detailPopup.clientWidth / 2
              break
            case "right":
              top = detailPopup.clientHeight / 2
              left = -(detailPopup.clientWidth / 2 - offset)
              break
            default :
              top = detailPopup.clientHeight + offset
              left = detailPopup.clientWidth / 2
              break
          }
          return {left, top}
        },
        getDirection(detailPopup, pixel, showList) {
          var direction = ""
          var height = detailPopup.clientHeight
          var width = detailPopup.clientWidth

          var headerHeight = 48
          var listMenu = (showList ? 368 : 10) + this.menuWidth

          var topHeight = pixel[1] - headerHeight - height - 50
          var halfLeft = pixel[0] - (listMenu + width/2)
          var halfRight = this.screenWidth - pixel[0] - width/2

          var leftWidth = pixel[0] - (listMenu + width)
          var halfTop = pixel[1] - headerHeight - height/2 - 50

          var bottomHeight = this.getScreenHeight - pixel[1] - 48 - height

          var rightWidth = this.screenWidth - (listMenu + width)
          var halfBottom = this.getScreenHeight - pixel[1] - 48 - height/2

          if (topHeight >= 0 && halfLeft >= 0 && halfRight>= 0) {
            direction = "top"

          } else if (leftWidth >= 0 && halfTop >= 0 && halfBottom >= 0) {
            direction = "left"

          } else if (rightWidth >= 0 && halfTop >= 0 && halfBottom >= 0) {
            direction = "right"
            
          } else if (bottomHeight >= 0 && halfLeft >= 0 && halfRight>= 0) {
            direction = "bottom"
            
          } else {
            direction = "top"
          }
          return direction
        },
        getExtentFromPixel(pixel) {
          // transform the minY and maxY
          var pointA = this.map.getCoordinateFromPixel([pixel[0], pixel[3]])
          var pointB = this.map.getCoordinateFromPixel([pixel[2], pixel[1]])

          return pointA.concat(pointB)
        },
        getFitExtent(viewPixel, mapPixel) {
          var viewWidth = getLength(viewPixel[0], viewPixel[2])
          var viewHeight = getLength(viewPixel[1], viewPixel[3])
          
          var prodWidth = getLength(mapPixel[0], mapPixel[2])
          var prodHeight = getLength(mapPixel[1], mapPixel[3])

          var scaleX = getScale(viewWidth, prodWidth)
          var scaleY = getScale(viewHeight, prodHeight)

          var scale = rateWH(viewWidth, viewHeight) >= rateWH(prodWidth, prodHeight) 
                      ? scaleY : scaleX

          var curView = this.getExtentFromPixel(viewPixel)
          var mapView = this.getExtentFromPixel(mapPixel)

          var centerX = getCenter(mapView[0], mapView[2])
          var centerY = getCenter(mapView[1], mapView[3])

          var vCenterX = getCenter(curView[0], curView[2])
          var vCenterY = getCenter(curView[1], curView[3])

          var offsetX = vCenterX - centerX
          var offsetY = vCenterY - centerY
          
          var x1, x2, y1, y2

          x1 = (mapView[0] - centerX)/scale + centerX - offsetX
          x2 = (mapView[2] - centerX)/scale + centerX - offsetX

          y1 = (mapView[1] - centerY)/scale + centerY - offsetY
          y2 = (mapView[3] - centerY)/scale + centerY - offsetY

          return [x1, y1, x2, y2]

          function getCenter(min, max) {
            return (max + min)/2
          }

          function rateWH(width, height) {
            return width/height
          }

          function getScale(view, prod) {
            return view/prod
          }

          function getLength(min, max) {
            return max - min
          }
        },
      },
      watch: {
        showVec (show) {
          this.tdtVecLayer.setVisible(show)
           this.googleImgLayer.setVisible(!show)
        },
        centerCtl(newV, oldV) {
          if (newV.bounds && newV.bounds !== oldV.bounds) {
            this.setCenter()
          }
        }
      },
      components: {
      },
      computed: {
        screenWidth: ()=> store.getters.screenWidth,
        getScreenHeight: ()=> store.getters.getScreenHeight,
        menuWidth: ()=> store.getters.menuWidth,
      },
    }
  }
}