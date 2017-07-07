module.exports = function (config, configData, request) {
  return {
    name: 'my-map',
    prop: {
      data(){
        return {
          showVec: true,
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
          toolIndex: -1,
          toolData:[
            { key: 'lonlat',name: '经纬度' },
            { key: 'altitude',name: '海拔' },
            { key: 'line',name: '侧距离' },
            { key: 'area',name: '侧面积' }
          ],
          seeLonlat: false,
          seeAltitude: false,
          drawLine: false,
          drawArea: false
        }
      },
      template: `<div>
                  <div class="map-ctl">
                    <el-tooltip class="item" effect="light" :content="!showVec ? '地图' : '卫星'" placement="left">
                        <span class="layer-ctl"
                          v-if="switchCtl"
                          :style="{background: background, top: (top - 104) + 'px'}"
                          @click="showVec = !showVec">
                            <img 
                            v-if="showVec"
                            class="img-layer" src="static/assets/img/map/map.png" width="24px">
                            <img
                            v-if="!showVec" 
                            class="vec-layer" src="static/assets/img/map/vec.png" width="24px">
                        </span>
                      </el-tooltip>
                    <span class="center-ctl"
                      v-if="centerCtl && centerCtl.use"
                      :style="{background: background, top: top + 'px', borderRadius: borderRadius}"
                      @click="setCenter">
                      <el-tooltip class="item" effect="light" content="置中" placement="left">
                        <i class="iconfont icon-dingwei center-to"></i>
                      </el-tooltip>
                    </span>

                    

                  </div>
                  <div v-if="useTools" class="map-tools">
                    <p @click="showTool = !showTool"><i class="el-icon-date"></i>工具<span class="el-icon-arrow-down"></span></p>
                    <ul v-show="showTool">
                      <li v-for="(item, index) in toolData" 
                      :class="index == toolIndex ? 'active': ''"
                      @click="toolChange(index)"
                      ><i class="el-icon-date"></i>{{item.name}}</li>
                    </ul>
                  </div>
                  <div v-if="seeLonlat" class="lonlat"
                    :style="{top: lonlatPositon[1] + 'px', left: lonlatPositon[0] + 'px'}">
                    <p class="lonlat-str" v-html="lonlatStr"></p>
                    <p class="lonlat-tip">移动鼠标查看经纬度，双击结束</p>
                  </div>
                  <div v-if="seeAltitude" class="altitude"
                    :style="{top: altitudePositon[1] + 'px', left: altitudePositon[0] + 'px'}">
                    <p>单击查看海拔高度，双击结束</p>
                  </div>
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
          default: '#72a7fc'
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
        }
      },
      mounted: function () {
        this.init()
        this.addInteraction = this.drawHandler()
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
            source: new ol.source.XYZ({
              urls: defineUrl("vec")
            })
          });

          vm.tdtImgLayer = new ol.layer.Tile({
            title: "影像数据",
            visible:false,
            source: new ol.source.XYZ({
              urls: defineUrl("img")
            })
          });

          var tdtCvaLayer = new ol.layer.Tile({
            title: "文字注记",
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
              }),
              new ol.control.MousePosition({
                coordinateFormat: ol.coordinate.toStringHDMS,
                projection: 'EPSG:4326'
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
          this.$emit('initMap', map)
        },
        setCenter () {
          var extent = ol.extent.applyTransform(this.centerCtl.bounds, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
          this.map.getView().fit(extent, this.map.getSize());
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
        },
        toolChange(index) {
          if (this.toolIndex === index) {
            this.toolIndex = -1
          } else {
            this.toolIndex = index
          }
        },
        showLonLat(bind) {
          if (bind) {
            this.map.on('pointermove', this.getLonLat);
            this.map.on('dblclick', this.clearTools);
          } else {
            this.map.un('pointermove', this.getLonLat);
            this.map.un('dblclick', this.clearTools);
          }
        },
        getLonLat(event) {
          if (event.draging) {
            return
          } else {
            var pixel =  this.map.getEventPixel(event.originalEvent);
            var coordinate = this.map.getCoordinateFromPixel(pixel)
            var lonlat = ol.coordinate.toStringHDMS(ol.proj.transform(
              coordinate, 'EPSG:3857', 'EPSG:4326'));
            if (lonlat.indexOf('N')) {
              var lon = '北纬' + lonlat.split('N')[0]
              if (lonlat.indexOf('E')) {
                var lat = '东经' + lonlat.split('N')[1].split('E')[0]
              } else {
                var lat = '西经' + lonlat.split('N')[1].split('W')[0]
              }
            } else if (lonlat.indexOf('S')) {
              var lon =  '南纬' + lonlat.split('S')[0]
              if (lonlat.indexOf('E')) {
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
          this.lonlatPositon = [position[0] - 80, position[1] - 10]
          this.lonlatStr = lonlatStr
        },
        getAltitude(bind) {
          if (bind) {
            this.map.on('click', this.addAltitude);
            this.map.on('pointermove', this.showAltitudeTip);
          } else {
            this.clearTools()
            this.map.un('click', this.addAltitude);
            this.map.un('pointermove', this.showAltitudeTip);
          }
        },
        showAltitudeTip(event) {
          if (!event.draging) {
            var pixel = this.map.getEventPixel(event.originalEvent);
            this.altitudePositon = [pixel[0] - 86, pixel[1] + 10]
          }
        },
        addAltitude(event) {
          if (this.timeHandler) {
            clearTimeout(this.timeHandler)
            this.clearTools()
            this.timeHandler = null
          } else {
            this.timeHandler = setTimeout(() => {
              var pixel =  this.map.getEventPixel(event.originalEvent);
              var coordinate = this.map.getCoordinateFromPixel(pixel)
              request.pointAltitude(coordinate).then((response)=> {
                if (response.status === 200 && response.data.status === 0) {
                  this.addMarker(response.data.data.altitude, coordinate)
                }
              })

              this.timeHandler = null
            }, 300)
          }
              
        },
        addMarker(altitude, coordinate) {
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
                  src: '/static/assets/img/map/map-altitude.png'
                }),
              }),
            new ol.style.Style({
              text: new ol.style.Text({
                text: altitude.toString() + ' 千米',
                offsetY: 0,
                fill: new ol.style.Fill({
                  color: '#333'
                })
              })
            })
          ];
        
          var pointLayer = new ol.layer.Vector({
            source: source,
            style: textStyle
          });

          this.map.addLayer(pointLayer);
          pointLayer.setZIndex(10)
          this.altitudeLayer.push(pointLayer);
        },
        clearTools() {
          if (this.altitudeLayer) {
            for (var i = 0; i < this.altitudeLayer.length; i++) {
              this.map.removeLayer(this.altitudeLayer[i])
            }
            this.altitudeLayer = []
          }
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
                addSingleLayer(areas[i].bounds, layersName, "outer", map);
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
        addTileAreaLayers(code, areas, map, filter, extent) {
          var _this = this,
            areaLayers = []
          return ((code, areas, map) => {
            var layersName;
            for (let i = 0; i < areas.length; i++) {
              if (code) {
                if(areas[i].area_id == code) {
                  if (filter) {
                    if (filter === '!p' || (filter.indexOf("filteredCode") >= 0 && filter.indexOf(areas[i].area_id) >= 0)) {
                      var _layer = null
                    } else {
                      var _layer = this.addRegion(areas[i].area_id, this.styles.bold, map, extent);
                      areaLayers.push(_layer)
                    }
                  } else {
                    var _layer = this.addRegion(areas[i].area_id, this.styles.bold, map, extent);
                    areaLayers.push(_layer)
                  }
                    
                  if (areas[i].contain && (!filter || filter !== "!c")) {
                    for (let j = 0; j < areas[i].contain.length; j++) {
                      layersName = 'map:area_' + areas[i].contain[j].area_id
                      var _layer = this.addRegion(areas[i].contain[j].area_id, this.styles.normal, map, extent);
                      areaLayers.push(_layer)
                    }
                  }
                  return areaLayers;
                } else if (areas[i].contain && (!filter || filter !== "!c")) {
                  areaLayers = areaLayers.concat(this.addTileAreaLayers(code, areas[i].contain, map, extent));
                }
              } else {
                var _layer = this.addRegion(areas[i].area_id, this.styles.bold, map, extent);
                areaLayers.push(_layer)
              }
            }
            return areaLayers
          })(code, areas, map)
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
        drawHandler() {
          var vm = this
          var map = this.map;
          var wgs84Sphere = new ol.Sphere(6378137);

          var source = new ol.source.Vector();

          var vector = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
              }),
              stroke: new ol.style.Stroke({
                color: 'rgba(252, 20, 38, 0.8)',
                width: 2
              }),
              image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                  color: 'rgba(252, 20, 38, 0.8)'
                })
              })
            })
          });

          var sketch;

          var helpTooltipElement;
          var helpTooltip;

          var measureTooltipElement;
          var measureTooltip;
          var closeElement;

          var continuePolygonMsg = '单击确定地点，双击结束';
          var continueLineMsg = '单击选择地点，双击结束';

          var pointerMoveHandler = function pointerMoveHandler(evt) {
            if (evt.dragging) {
              return;
            }
            /** @type {string} */
            var helpMsg = '点击选择起点';

            if (sketch) {
              var geom = sketch.getGeometry();
              if (geom instanceof ol.geom.Polygon) {
                helpMsg = continuePolygonMsg;
              } else if (geom instanceof ol.geom.LineString) {
                helpMsg = continueLineMsg;
              }
            }

            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);

            helpTooltipElement.classList.remove('hidden');
          };


          var typeSelect = document.getElementById('type');
          var useGeodesic = false;

          var draw; // global so we can remove it later

          var formatLength = function formatLength(line) {
            var length;
            if (useGeodesic) {
              var coordinates = line.getCoordinates();
              length = 0;
              var sourceProj = map.getView().getProjection();
              for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
                var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                length += wgs84Sphere.haversineDistance(c1, c2);
              }
            } else {
              length = Math.round(line.getLength() * 100) / 100;
            }
            var output;
            if (length > 100) {
              output = Math.round(length / 1000 * 100) / 100 + ' ' + 'km';
            } else {
              output = Math.round(length * 100) / 100 + ' ' + 'm';
            }
            return output;
          };

          var formatArea = function formatArea(polygon) {
            var area;
            if (useGeodesic) {
              var sourceProj = map.getView().getProjection();
              var geom = /** @type {ol.geom.Polygon} */polygon.clone().transform(sourceProj, 'EPSG:4326');
              var coordinates = geom.getLinearRing(0).getCoordinates();
              area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
            } else {
              area = polygon.getArea();
            }
            var output;
            if (area > 10000) {
              output = Math.round(area / 1000000 * 100) / 100 + ' ' + 'km<sup>2</sup>';
            } else {
              output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
            }
            return output;
          };

          function addInteraction(type) {
            clearDrawEle()
            if (type === 'clear') {
              resetSource()
              return;
            }

            map.addLayer(vector);
            vector.setZIndex(12)
            type = type == 'area' ? 'Polygon' : 'LineString';
            draw = new ol.interaction.Draw({
              source: source,
              type: type,
              style: new ol.style.Style({
                fill: new ol.style.Fill({
                  color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                  color: 'rgba(252, 20, 38, 0.5)',
                  width: 1
                }),
                image: new ol.style.Circle({
                  radius: 5,
                  stroke: new ol.style.Stroke({
                    color: 'rgba(252, 20, 38, 0.7)'
                  }),
                  fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                  })
                })
              })
            });
            map.addInteraction(draw);

            createMeasureTooltip();
            createHelpTooltip();
            map.on('pointermove', pointerMoveHandler);
            var listener;
            draw.on('drawstart', function (evt) {
              // set sketch
              sketch = evt.feature;

              /** @type {ol.Coordinate|undefined} */
              var tooltipCoord = evt.coordinate;

              listener = sketch.getGeometry().on('change', function (evt) {
                var geom = evt.target;
                var output;
                if (geom instanceof ol.geom.Polygon) {
                  output = '总面积' + formatArea(geom);
                  tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof ol.geom.LineString) {
                  output = '总长度' + formatLength(geom);
                  tooltipCoord = geom.getLastCoordinate();
                }
                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
              });
            }, this);

            draw.on('drawend', function () {
              measureTooltipElement.className = 'tooltip tooltip-static';
              closeElement = creteCloseBtn(type == 'area');
              measureTooltipElement.appendChild(closeElement);
              measureTooltip.setOffset([0, -7]);
              // unset sketch
              sketch = null;
              // unset tooltip so that a new one can be created
              measureTooltipElement = null;
              createMeasureTooltip();
              ol.Observable.unByKey(listener);
            }, this);
          }

          function createHelpTooltip() {
            if (helpTooltipElement) {
              helpTooltipElement.parentNode.removeChild(helpTooltipElement);
            }
            helpTooltipElement = document.createElement('div');
            helpTooltipElement.className = 'tooltip hidden';
            helpTooltip = new ol.Overlay({
              element: helpTooltipElement,
              offset: [15, 0],
              positioning: 'bottom-left'
            });
            map.addOverlay(helpTooltip);
            map.getViewport().addEventListener('mouseout', function () {
              helpTooltipElement.classList.add('hidden');
            });
          }

          function createMeasureTooltip() {
            if (measureTooltipElement) {
              measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = document.createElement('div');
            measureTooltipElement.className = 'tooltip tooltip-measure';
            measureTooltip = new ol.Overlay({
              element: measureTooltipElement,
              offset: [0, -15],
              positioning: 'bottom-center'
            });
            map.addOverlay(measureTooltip);
          }

          function creteCloseBtn(isArea) {
            var ele
            ele = document.createElement('span');
            ele.className = 'measure-close';
            ele.innerHTML = '&times'
            if (isArea) {
              ele.dataset.tip = '结束本次侧面'
            } else {
              ele.dataset.tip = '结束本次侧距'
            }
            ele.onclick = function (event) {
              vm.toolIndex = -1
              clearDrawEle()
              resetSource()
            }
            ele.onmousemove = function (event) {
              helpTooltipElement.parentNode.style.display = 'none'
            }
            ele.onmouseout = function (event) {
              helpTooltipElement.parentNode.style.display = 'block'
            }
            return ele
          }

          function clearDrawEle() {
            map.removeInteraction(draw);
            map.un('pointermove', pointerMoveHandler);
            map.removeLayer(vector);
            removeElement()
          }

          function removeElement() {
            var parent = document.getElementsByClassName('ol-overlaycontainer-stopevent')
            var childs = parent[0].childNodes; 
            if (childs && childs.length) {
              for(var i = childs.length - 1; i >= 0; i--) { 
                if (childs[i].className.indexOf('ol-overlay-container') >= 0) {
                  parent[0].removeChild(childs[i]);
                }
              }
            }
          }

          function resetSource() {
            closeElement = null
            source = new ol.source.Vector()
            vector.setSource(source)
          }

          return addInteraction;

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
          if (area && area.areas && area.areas.length > 0) {
            this.areaLayers = this.removeLayers(this.areaLayers, this.map);
            this.areaLayers = this.addAreaLayers(area.code, area.areas, this.map)
          }
        },
        addTileAreas(area, oldV) {
          if (area && area.areas && area.areas.length > 0) {
            this.tileAreaLayers = this.removeLayers(this.tileAreaLayers, this.map);
            this.tileAreaLayers = this.addTileAreaLayers(area.code, area.areas, this.map, area.filter, area.extent)
          }
        },
        toolIndex(index, oldI) {
          if (index !== -1) {
            this.seeLonlat = this.toolData[index].key === 'lonlat' ? (!this.seeLonlat) : false
            this.seeAltitude = this.toolData[index].key === 'altitude' ? (!this.seeAltitude) : false
            this.drawArea = this.toolData[index].key === 'area' ? (!this.drawArea) : false
            this.drawLine = this.toolData[index].key === 'line' ? (!this.drawLine) : false
          } else {
            this.seeLonlat = false
            this.seeAltitude = false
            this.drawArea = false
            this.drawLine = false
          }
        },
        seeLonlat(show) {
          this.showLonLat(show)
        },
        seeAltitude(show) {
          this.getAltitude(show)
        },
        drawLine(draw) {
          if (draw) {
            this.addInteraction('line')
          } else {
            this.addInteraction('clear')
          }
        },
        drawArea(draw) {
          if (draw) {
            this.addInteraction('area')
          } else {
            this.addInteraction('clear')
          }
        }
      }
    }
  }
}