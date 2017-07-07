module.exports = function (mapUrl, tileMapUrl, dateUtil, configData) {
  return {
    _tileLayer: null,
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

    setRefrence(map, mapComponent) {
      this.map = map
      this.mapComponent = mapComponent
    },
    addTileLayer(product, date, code, bounds) {
      bounds = this.formatBounds({bounds: bounds})
      var extent = ol.extent.applyTransform(bounds, ol.proj.getTransform("EPSG:4326", "EPSG:3857"))
      
      var url = `${tileMapUrl}${product}/${date.getFullYear()}/${product}_${date.getFullYear()}${dateUtil.dateToPeriod(date)}_FARMLANDMASK.${code}_GRADE`
      
      this._tileLayer = this.mapComponent.addXYZLayer(url, extent, this.map)

      this.map.addLayer(this._tileLayer)

      return this._tileLayer
    },
    removeTileLayer() {
      if (this._tileLayer) {
        this.map.removeLayer(this._tileLayer)
        this._tileLayer = null
      }
    },
    formatBounds(data) {
      var bounds = data.bounds;
      bounds = [bounds.lb_lon, bounds.lb_lat, bounds.rt_lon, bounds.rt_lat];
      return bounds;
    },
    setCenter(bounds) {
      var extent = ol.extent.applyTransform(bounds, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
      this.map.getView().fit(extent, this.map.getSize());
    },
    addAreaTileLayers(code, areas, filter) {
      var _this = this,
        areaLayers = [],
        map = this.map,
        bounds = this.formatBounds(areas[0])

      this.setCenter(bounds)

      const addAreas = (code, areas, map, filter) => {
        var layersName;

        for (let i = 0; i < areas.length; i++) {
          if (code) {
            if(areas[i].area_id == code) {

              if (!filter || !filter.includes(areas[i].area_id)) {
                var _layer = this.addRegion(areas[i].area_id, this.styles.bold, map, bounds);
                areaLayers.push(_layer)
              }

              if (areas[i].contain && areas[i].contain.length > 0) {
                areaLayers = areaLayers.concat(this.addTileAreaLayers('', areas[i].contain, map, bounds, filter)) 
              }
            } else {
              if (areas[i].contain && areas[i].contain.length > 0) {
                areaLayers = areaLayers.concat(this.addTileAreaLayers(code, areas[i].contain, map, bounds, filter)) 
              }
            }

          } else {

            if (!filter || !filter.includes(areas[i].area_id)) {
              var _layer = this.addRegion(areas[i].area_id, this.styles.bold, map, bounds);
              areaLayers.push(_layer)
            }

            if (areas[i].contain && areas[i].contain.length > 0) {
              areaLayers = areaLayers.concat(this.addTileAreaLayers('', areas[i].contain, map, bounds, filter)) 
            }
          }
        }
        return areaLayers
      }

      return addAreas(code, areas, map, filter)
    },
    addRegion(areaCode, styles, map, bounds) {
      var server = mapUrl;
      var layerName = "map:sz_gov_shape_data";
      var fieldName = "area_code";

      return this.addFilteredPGLayer(server, layerName, fieldName, areaCode, styles, map, bounds);
    },
    addFilteredPGLayer(server, layerName, fieldName, fieldVal, styles, map, bounds) {
      var extent = ol.extent.applyTransform(bounds, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));
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
      return "<StyledLayerDescriptor xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.0.0\" xsi:schemaLocation=\"http://www.opengis.net/sld StyledLayerDescriptor.xsd\">             <UserLayer> <Name>" + layerName + "</Name> <UserStyle> <Name>UserSelection</Name> <FeatureTypeStyle> <Rule> <Filter xmlns:gml=\"http://www.opengis.net/gml\"> <PropertyIsEqualTo> <PropertyName>" + fieldName + "</PropertyName> <Literal>" + fieldVal + "</Literal> </PropertyIsEqualTo> </Filter>  " + styles() + "  </Rule> </FeatureTypeStyle> </UserStyle> </UserLayer> </StyledLayerDescriptor>";
    },
    removeRegionLayers(layers) {
      for (var i = 0; i < layers.length; i++) {
        this.map.removeLayer(layers[i])
      }
    }
  }
} 