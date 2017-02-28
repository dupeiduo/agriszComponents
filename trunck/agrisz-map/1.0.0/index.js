module.exports = function (config, configData) {
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
          }
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
        }
      },
      mounted: function () {
        this.init()
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
        addTileAreaLayers(code, areas, map) {
          var _this = this,
            areaLayers = []
          return ((code, areas, map) => {
            var layersName;
            for (let i = 0; i < areas.length; i++) {
              if(areas[i].area_id == code) {
                var _layer = this.addRegion(areas[i].area_id, this.styles.bold, map);
                areaLayers.push(_layer)
                if (areas[i].contain) {
                  for (let j = 0; j < areas[i].contain.length; j++) {
                    layersName = 'map:area_' + areas[i].contain[j].area_id
                    var _layer = this.addRegion(areas[i].contain[j].area_id, this.styles.normal, map);
                    areaLayers.push(_layer)
                  }
                }
                return areaLayers;
              } 
              if(areas[i].area_id != code && areas[i].contain) {
                areaLayers = areaLayers.concat(this.addTileAreaLayers(code, areas[i].contain, map));
              }
            }
            return areaLayers
          })(code, areas, map)
        },
        addRegion(areaCode, styles, map) {
          var server = config.mapUrl;
          var layerName = "map:sz_gov_shape_data";
          var fieldName = "area_code";

          return this.addFilteredPGLayer(server, layerName, fieldName, areaCode, styles, map);
        },
        addFilteredPGLayer(server, layerName, fieldName, fieldVal, styles, map) {
          var layer = new ol.layer.Image({
            source: new ol.source.ImageWMS({
              url : server,
              params: {
                'VERSION': '1.1.1',
                'LAYERS': layerName,
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
          if (area && area.code && area.areas && area.code !== oldV.code) {
            this.areaLayers = this.removeLayers(this.areaLayers, this.map);
            this.areaLayers = this.addAreaLayers(area.code, area.areas, this.map)
          }
        },
        addTileAreas(area, oldV) {
          if (area && area.code && area.areas && area.code !== oldV.code) {
            this.tileAreaLayers = this.removeLayers(this.tileAreaLayers, this.map);
            this.tileAreaLayers = this.addTileAreaLayers(area.code, area.areas, this.map)
          }
        }
      }
    }
  }
}