module.exports = {
  _lineColor: '#20a0ff',
  _lineWidth: 3,
  _fillColor: 'rgba(255, 255, 255, 0.4)',
  _pointColor: '#20a0ff',
  _radius: 7,
  _draw: null,
  _features: null,
  _drawLayer: null,
  _polygonsLayer: null,
  _showHoverTip: false,
  _disableHover: false,
  _activeClick: false,
  _selectId: null,

  setPointColor(color) {
    this._pointColor = color
  },
  setRadius(radius) {
    this._radius = radius
  },
  setLineColor(color) {
    this._lineColor = color
    if (this._drawLayer) {
      this._drawLayer.setStyle(this.getNormalStyle(color))
    }
  },
  setLineWidth(width) {
    this._lineWidth = width
  },
  setFillColor(color) {
    this._fillColor = color
  },
  openHoverTip(tipDom, hoverCb) {
    this._showHoverTip = true
    if (tipDom) {
      this.useCustomTip = true
    }
    if (hoverCb) {
      this.hoverCb = hoverCb
    }
    this.popupContainer = null
    this.initOverlay(tipDom)
  },
  closeHoverTip() {
    this._showHoverTip = false
  },
  enableHoverTip(disable) {
    this._disableHover = disable
  },
  openClickEvent(clickCb) {
    this._activeClick = true
    if (clickCb) {
      this.clickCb = clickCb
    }
  },
  closeClickEvent() {
    this._activeClick = false
  },
  setRefrence(map) {
    this.map = map

    this.drawStart = (event) => {

      var sketch = event.feature;
      var geometry = sketch.getGeometry()

      var listener = geometry.on('change', (evt)=> {
        var geom = evt.target;
        this.area = this.formatArea(geom)
      });
    }

    this.drawEnd = (event) => {
      var sketch = event.feature;
      var geometry = sketch.getGeometry()
      var geomStr = (new ol.format.GeoJSON()).writeGeometry(geometry)
      this.drawEndCb(this.area, geomStr)

      this.stopDraw()
    }

    this.hoverPolygon = (event) => {
      var pixel = this.map.getEventPixel(event.originalEvent);
      var coordinates = event.coordinate 
      this.hideOverlay()
      this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer == this._polygonsLayer) {
          this.setHoverStyle(feature)

          if (this._showHoverTip) {
            this.showOverlay(feature, coordinates)
          }
          if (this.hoverCb) {
            var id = feature.get('id')
            var index = feature.get('index')
            this.hoverCb({id, index})
          }

        } else if (feature) {
          // draw feature fill color
          // feature.setStyle(this.getHoverStyle(this._lineColor, this._fillColor))
        }
      });

      var hit = this.map.hasFeatureAtPixel(pixel);
      if (hit) {
        this.map.getViewport().style.cursor = 'pointer'

      } else {
        this.map.getViewport().style.cursor = 'default'

        this.pointerOutFeature()
      }
    }
    this.clickPolygon = (event) => {
      if (event.drag) {
        return
      }

      var pixel = this.map.getEventPixel(event.originalEvent)
      var coordinates = event.coordinate 

      this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer == this._polygonsLayer) {
          var id = feature.get('id')
          var index = feature.get('index')
          this.clickCb({id, index, coordinates, pixel})

        } else if (feature) {
          var id = null
          var index = -1
          this.clickCb({id, index, coordinates, pixel})
        }
      });
    }
  },
  initOverlay(tipDom) {
    if (this.map) {
      if (tipDom && !this.popupContainer) {
        this.popupContainer = tipDom

        this.landPopup = new ol.Overlay({
          element: this.popupContainer
        });
        this.map.addOverlay(this.landPopup);

      } else if (!this.popupContainer) {
        this.popupContainer = document.createElement('div')
        this.landPopup = new ol.Overlay({
          element: this.popupContainer
        });
        this.map.addOverlay(this.landPopup);
      }
        

    } else {
      console.log("Please 'setRefrence(this.map)' brefore 'openHoverTip()'")
    }
  },
  pointerOutFeature() {
    if (this._polygonsLayer) {
      var source = this._polygonsLayer.getSource()
      this.clearHoverFill(source)
    }

    if (this._drawLayer) {
      var drawSource = this._drawLayer.getSource()
      this.clearHoverFill(drawSource)
    }
  },
  clearHoverFill(source) {
    if (source) {
      source.forEachFeature((feature) => {
        if (this._selectId && this._selectId == feature.get('id')) {
          this.setHoverStyle(feature)

        } else {
          this.setNormalStyle(feature)
        } 
      })
    }
  },
  showOverlay(feature, coordinates) {
    if (this._disableHover) {
      this.popupContainer.style.display = "none"

    } else {
      if (!this.useCustomTip) {
        var title = feature.get('title')
        var desc = feature.get('desc')

        let popup = document.createElement('div')
        let html = `<h3 class="popup-title">
                      ${title}
                    </h3>
                    <div class="popup-desc-container">
                      <p class="popup-desc">${desc}</p>
                    </div>`

        popup.className = 'deep-monitor-popup'
        popup.innerHTML = html

        // let height = document.body.clientHeight + 150
        // popup.style.top = `-${height}px`
        // to solve the .ol-overlaycontainer-stopevent {position: fixed;}

        popup.style.left = `-50px`
        popup.style.top = `-150px`
        this.popupContainer.appendChild(popup)

      } else {
        this.popupContainer.style.display = "block"
      }

      this.landPopup.setPosition(coordinates);
    }
  },
  hideOverlay() {
    var popParent = document.getElementsByClassName('deep-monitor-popup')
    if (popParent && popParent.length > 0) {
      popParent[0].parentNode.removeChild(popParent[0])
    }
    if (this.useCustomTip) {
      this.popupContainer.style.display = "none"
    }
  },
  drawPolygon(drawEndCb, clickCb) {
    this.drawEndCb = drawEndCb
    this.clickCb = clickCb
    this.initFeatureToMap()
  },
  initFeatureToMap() {
    if (!this._features) {
      this._features = new ol.Collection();

      this._drawLayer = new ol.layer.Vector({
        source: new ol.source.Vector({features: this._features}),
        style: this.getNormalStyle(this._lineColor)
      });
      this._drawLayer.setMap(this.map);
      this._drawLayer.on('pointermove', this.hoverPolygon)
    }
  },
  startDraw() {
    this._draw = new ol.interaction.Draw({
      features: this._features,
      type: "Polygon",
      style: this.getNormalStyle(this._lineColor)
    });

    this.map.addInteraction(this._draw);
    this._draw.on('drawstart', this.drawStart)
    this._draw.on('drawend', this.drawEnd)
  },
  stopDraw() {
    this._draw.un('drawstart', this.drawStart)
    this._draw.un('drawend', this.drawEnd)
    this.map.removeInteraction(this._draw)
  },
  removeDrawLayer() {
    this._features = new ol.Collection()
    var source = new ol.source.Vector({features: this._features})
    this._drawLayer.setSource(source)
    this._drawLayer.un('pointermove', this.hoverPolygon)
  },
  getAreaByGeojson(geojson) {
    if (typeof geojson === "string") {
      geojson = JSON.parse(geojson)
    }
    var polygon = new ol.geom.Polygon(geojson.coordinates);
    var area = this.formatArea(polygon)

    return area
  },
  formatArea(polygon) {
    var area = polygon.getArea();
    var output = Math.round(area * 100) / 100

    return output;
  },
  removePolygonByIndex(index) {
    this.polygonStore.splice(index, 1)

    var features = this.getGeoFeature(this.polygonStore)

    this.renderFeaturesToLayer(features)
  },
  removePolygons() {
    this.map.un('pointermove', this.hoverPolygon)
    if (this._polygonsLayer) {
      this.map.removeLayer(this._polygonsLayer)
      this._polygonsLayer = null
    }
  },
  renderPolygons(geometrys) {
    this.polygonStore = this.cloneGeom(geometrys)

    var features = this.getGeoFeature(this.polygonStore)

    this.renderFeaturesToLayer(features)
  },
  cloneGeom(polygons) {
    var clone = []
    if (polygons && polygons.length > 0) {
      for (var i = 0; i < polygons.length; i++) {
        clone[i] = {}
        clone[i].id = polygons[i].marker_id
        clone[i].title = polygons[i].title
        clone[i].geom = this.getGeom(polygons[i].geom)
        clone[i].desc = polygons[i].desc
        clone[i].color = polygons[i].color
        clone[i].index = i
      }
    }
      
    return clone
  },
  getGeom(geom) {
    if (geom) {
      if (typeof geom === "string") {
        geom = JSON.parse(geom)
      }

      var type = geom.type,
        coordinates = geom.coordinates

      return {type, coordinates}
    } else {
      var type = "Polygon",
        coordinates = []
      return {type, coordinates}
    }
  },
  getGeoFeature(geomCollection) {
    var features = [];
    var gsForamt = new ol.format.GeoJSON();

    for (var i = 0; i < geomCollection.length; i++) {
      var geomItem = geomCollection[i]

      var item = this.getFeatureAttr(geomItem)
      features.push(item)
    }

    var geojsonObject = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3857'
        }
      },
      'features': features
    };

    var geomFeature = gsForamt.readFeatures(geojsonObject);
    
    return geomFeature;
  },
  getFeatureAttr(geomItem) {
    return {
      'type': 'Feature',
      'geometry': geomItem.geom,
      'properties': {
        id: geomItem.id, 
        title: geomItem.title,
        desc: geomItem.desc,
        index: geomItem.index,
        color: geomItem.color
      }
    }
  },
  renderFeaturesToLayer(features) {
    if (!this._polygonsLayer) {
      this.addPolygonsLayer(features)

    } else {
      this.setPolygonsSource(features)
    }
      
  },
  addPolygonsLayer(features) {
    var style = this.getStyle()

    this._polygonsLayer =  new ol.layer.Vector({
      source: new ol.source.Vector({ wrapX: false }),
      zIndex: 10
    })

    this._polygonsLayer.getSource().addFeatures(features);

    this._polygonsLayer.setStyle(style);

    this.map.on('pointermove', this.hoverPolygon)

    if (this._activeClick) {
      this.map.on('click', this.clickPolygon)
    }

    this.map.addLayer(this._polygonsLayer)
  },
  setPolygonsSource(features) {
    this._polygonsLayer.getSource().clear()
    this._polygonsLayer.getSource().addFeatures(features)
  },
  highlightById(id) {
    this._selectId = id
    var source = this._polygonsLayer.getSource()
    if (source) {
      source.forEachFeature((feature) => {
        var fsId = feature.get('id')
        if (fsId == id) {
          this.setHoverStyle(feature)
        }
      })
    }
  },
  cancelHighlight() {
    this._selectId = null
    var source = this._polygonsLayer.getSource()
    if (source) {
      source.forEachFeature((feature) => {
        this.setNormalStyle(feature)
      })
    }
  },
  setHoverStyle(feature) {
    var lineColor = feature.get('color') ? feature.get('color') : this._lineColor
    feature.setStyle(this.getHoverStyle(lineColor, this._fillColor))
  },
  setNormalStyle(feature) {
    var lineColor = feature.get('color') ? feature.get('color') : this._lineColor
    feature.setStyle(this.getNormalStyle(lineColor))
  },
  getStyle() {
    return (feature)=> {
      var color = feature.get('color') ? feature.get('color') : this._lineColor
      var style = this.getNormalStyle(color)
      return style
    }
  },
  getNormalStyle(lineColor) {
    var style = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: this._lineWidth + 2
        })
      }),
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: lineColor,
          width: this._lineWidth
        }),
        image: new ol.style.Circle({
          radius: this._radius,
          fill: new ol.style.Fill({
            color: this._pointColor
          })
        })
      })
    ]
    return style
  },
  getHoverStyle(lineColor, fillColor) {
    var style = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: this._lineWidth + 2
        })
      }),
      new ol.style.Style({
        fill: new ol.style.Fill({
          color: fillColor
        }),
        stroke: new ol.style.Stroke({
          color: lineColor,
          width: this._lineWidth
        }),
        image: new ol.style.Circle({
          radius: this._radius,
          fill: new ol.style.Fill({
            color: this._pointColor
          })
        })
      })
    ]
    return style
  },
  destroy() {

  }
}