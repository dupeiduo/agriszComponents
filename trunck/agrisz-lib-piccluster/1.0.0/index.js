'use strict'

module.exports = {
  _distance: 100,
  _zIndex: 10,
  _imageSize: { width: 61, height: 55, borderW: 69, borderH: 71 },
  _offsetX: 36,
  _offsetY: -65,
  _fontSize: 14,
  _sharedAssetServer: '',
  _activeStatus: false,
  _activeHoverZoom: false,
  _activeDirection: false,
  setDistance(distance) {
    this._distance = distance
  },
  setImageSize(width, height, borderW, borderH) {
    this._imageSize.width = width ? width : this._imageSize.width
    this._imageSize.height = height ? height : this._imageSize.height
    this._imageSize.borderW = borderW ? borderW : this._imageSize.borderW
    this._imageSize.borderH = borderH ? borderH : this._imageSize.borderH
  },
  setZIndex(zIndex) {
    this._zIndex = zIndex
  },
  setOffset(x,y) {
    this._offsetX = x
    this._offsetY = y
  },
  setFontSize(size) {
    this._fontSize = size
  },
  setRootAssertUrl(url) {
    this._sharedAssetServer = url
  },
  openHoverStyle() {
    this._activeStatus = true
  },
  closeHoverStyle() {
    this._activeStatus = false
  },
  openHoverZoom() {
    this._activeHoverZoom = true
  },
  closeHoverZoom() {
    this._activeHoverZoom = false
  },
  openDeric() {
    this._activeDirection = true
  },
  closeDeric() {
    this._activeDirection = false
  },
  centerTo(item, zoomLevel) {
    var picItem = this.getGeom(item.geom)

    zoomLevel = zoomLevel ? zoomLevel : 10
    var point = ol.proj.transform(picItem.coordinates, 'EPSG:4326', 'EPSG:3857')
    this.centerToAnimate(point, zoomLevel)
  },
  addPicturesLayer(map, picList, clickEventCb, hoverEventCb, zoomTo) {

    this.addReference(map, picList, clickEventCb, hoverEventCb)

    var features = this.getFeatures(this.picList)

    this.clusterLayer = this.addLayer(features)

    this.bindEvent()

    zoomTo && this.setMaxExtend()
  },
  addReference(map, picList, clickEventCb, hoverEventCb) {
    this.map = map
    this.picList = this.copyList(picList)
    this.clickEventCb = clickEventCb
    this.hoverEventCb = hoverEventCb
  },
  copyList(picList) {
    var clone = []
    if (picList && picList.length > 0) {
      for (var i = 0; i < picList.length; i++) {
        clone[i] = {}
        clone[i].pid = picList[i].pid
        clone[i].img_file = picList[i].img_file
        clone[i].geom = this.getGeom(picList[i].geom)
        clone[i].active = false
        if (this._activeDirection) {
          clone[i].deriction = picList[i].img_direction

        } else {
          clone[i].deriction = null
        }
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
      var type = "Point",
        coordinates = []
      return {type, coordinates}
    }
  },
  getFeatures(picList) {
    var features = []
    for (var i = 0; i < picList.length; i++) {
      features[i] = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform(picList[i].geom.coordinates, 'EPSG:4326',
                      'EPSG:3857')),
        pid: picList[i].pid,
        img: picList[i].img_file,
        active: picList[i].active,
        deriction: picList[i].deriction,
        index: i
      });
    }

    return features
  },
  addLayer(features) {
    var source = new ol.source.Vector({
      features: features
    });

    var clusterSource = new ol.source.Cluster({
      distance: this._distance,
      source: source
    });

    var styleCache = {};

    var clustersLayer = new ol.layer.Vector({
      source: clusterSource,
      zIndex: this._zIndex,
      style: (cluster) => {
        var clusterFeatures = cluster.get('features');
        var isActive = this.getActiveStatus(clusterFeatures);
        var featureNumber = clusterFeatures.length;
        var displayFeature = clusterFeatures[0];
        var imageUrl = this.getFeatureImageUrl(displayFeature); 
        var deriction = this.getFeatureDeriction(displayFeature)
        
        return this.getClusterStyle(featureNumber, imageUrl, isActive, deriction);
      }
    });

    this.map.addLayer(clustersLayer);
    return clustersLayer
  },
  removeLayer() {
    if (this.clusterLayer && this.map) {
      this.map.removeLayer(this.clusterLayer)
    }
  },
  bindEvent() {
    var map = this.map

    this.lastCbIndexs = null
    
    this.pictureLayerClickHandler = (event) => {
      if (event.dragging) return;
      var pixel = map.getEventPixel(event.originalEvent);

      map.forEachFeatureAtPixel(pixel, (feature, layer)=> {
        if (layer == this.clusterLayer) {
          var length = feature.getProperties().features.length;
          if (length > 1) {
            this.centerToAnimate(map.getCoordinateFromPixel(pixel), map.getView().getZoom() + 1)
            return;

          } else {
            var picItem = feature.getProperties().features[0].getProperties();
            var index = picItem.index
            var pid = picItem.pid
            this.clickEventCb({index, pid})
          }
        }
      });
    }

    this.mouseoverPicture = (event) => {
      if (event.dragging) return;

      var pixel = map.getEventPixel(event.originalEvent);

      if (this._activeStatus || this._activeHoverZoom) {
        map.forEachFeatureAtPixel(pixel, (feature, layer)=> {
          if (layer == this.clusterLayer) {
            var features = feature.getProperties().features
            var indexs = this.getIndexs(features)
            this.activeByIndexs(indexs)

            // resolve multiple calls
            if (!this.lastCbIndexs || this.unequalArray(this.lastCbIndexs, indexs)) {
              this.lastCbIndexs = indexs
              this.hoverEventCb(indexs)
            }
          }
        });
      }

      var hit = map.hasFeatureAtPixel(pixel);
      if (hit) {
        map.getViewport().style.cursor = 'pointer';

      } else {
        map.getViewport().style.cursor = 'default';
        this.clearHover()
      }
    }
    
    map.on('pointermove', this.mouseoverPicture)
    map.on('click', this.pictureLayerClickHandler)
  },
  getIndexs(features) {
    var indexs = []
    for (var i = 0; i < features.length; i++) {
      features[i].getProperties().active = true
      indexs.push(features[i].getProperties().index)
    }

    return indexs
  },
  unequalArray(source, dest) {
    var unequal
    if (source.length !== dest.length) {
      unequal = true
    } else {
      for (var i = 0; i < source.length; i++) {
        if (source[i] !== dest[i]) {
          unequal = true

          break
        }
      }
      unequal = false
    }

    return unequal
  },
  clearHover() {
    if (this._activeStatus || this._activeHoverZoom) {
      var indexList = this.getActiveItem()
      if (indexList.length > 0) {
        this.hoverEventCb([])
        this.deactiveByIndexs(indexList)
      }
    }
  },
  getActiveItem() {
    var indexList = []
    for (var i = 0; i < this.picList.length; i++) {
      if (this.picList[i].active && this.picList[i].active === true) {
        indexList.push(i)
      }
    }

    return indexList
  },
  activeByIndexs(indexList) {
    if (indexList && indexList.length > 0) {
      for (var i = 0; i < indexList.length; i++) {
        this.picList[indexList[i]].active = true
      }
      this.resetSource()
    }
  },
  deactiveByIndexs(indexList) {
    if (indexList && indexList.length > 0) {
      for (var i = 0; i < indexList.length; i++) {
        this.picList[indexList[i]].active = false
      }
      this.lastCbIndexs = null
      this.resetSource()
    }
  },
  resetSource(indexs) {
    var features = this.getFeatures(this.picList)

    var source = new ol.source.Vector({
      features: features
    });

    var clusterSource = new ol.source.Cluster({
      distance: this._distance,
      source: source
    });

    this.clusterLayer.setSource(clusterSource)
  },
  moveImageByIndex(index, dbclickCb, unbindAfterClick) {
    this.map.un('click', this.moveImgHandler)
    this.moveIndex = index
    this.dbclickCb = dbclickCb
    this.unbindAfterClick = unbindAfterClick

    if (!this.moveImgHandler) {
      this.moveImgHandler = (event) => {
        var coordinates =  ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
        
        var length = this.getLength(this.picList[index].geom.coordinates, coordinates)

        this.dbclickCb(coordinates, length)

        this.picList[this.moveIndex].geom.coordinates = coordinates
        this.resetSource()
        
        if (this.unbindAfterClick) {
          this.stopMoveImage()
        }
      }
    }

    this.map.on('click', this.moveImgHandler)
    this.map.getViewport().style.cursor = 'pointer';
  },
  stopMoveImage() {
    this.map.getViewport().style.cursor = 'default';
    this.map.un('click', this.moveImgHandler)
  },
  getLength(p1, p2) {
    p1 = ol.proj.transform(p1, 'EPSG:4326', 'EPSG:3857');
    p2 = ol.proj.transform(p2, 'EPSG:4326', 'EPSG:3857');
    var line = new ol.geom.LineString([p1, p2])
    var length = Math.round(line.getLength() * 100) / 100;
    var output;
    if (length > 500) {
      output = Math.round(length / 1000 * 100) / 100 + ' ' + '公里';
    } else {
      output = Math.round(length * 100) / 100 + ' ' + '米';
    }
    return output;
  },
  setMaxExtend(picList) {
    picList = picList ? picList : this.picList
    var pointArray = []
    for (var i = 0; i < picList.length; i++) {
      var geom = this.getGeom(picList[i].geom)
      pointArray[i] = ol.proj.transform(geom.coordinates, 'EPSG:4326',
                      'EPSG:3857')
    }
    var ext = ol.extent.boundingExtent(pointArray);
    this.map.getView().fit(ext, this.map.getSize());
  },
  centerToAnimate(center, zoomLevel) {
    this.map.getView().animate({zoom: zoomLevel, center: center, duration: 550, easing:  (t)=> Math.pow(t, 1.5)});
  },
  getActiveStatus(features) {
    var status = false

    if (features && features.length > 0) {
      for (var i = 0; i < features.length; i++) {
        if (features[i].getProperties().active && features[i].getProperties().active === true) {
          status = true
        }
      }
    }
    return status
  },
  getFeatureImageUrl(feature) {
    return feature.getProperties().img
  },
  getFeatureDeriction(feature) {
    return feature.getProperties().deriction
  },
  getClusterStyle(featureNumber, imageUrl, isActive, deriction) {
    var style = null

    imageUrl = this.getThumbnail(imageUrl, isActive)

    if (featureNumber === 1) {
      style = this.getSingleStyle(imageUrl, isActive, deriction)
    } else {
      style = this.getMultifyStyle(featureNumber, imageUrl, isActive)
    }

    return style
  },
  getSingleStyle(url, isActive, deriction) {
    var result = []

    var bg = this.getDerictionBgStyle(deriction, isActive)
    var border = this.getBorderImg(isActive)
    var size = this.getSize(isActive)
    var point = this.getDerictionPointStyle(deriction, isActive)

    var style = new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [0.5, 65],
        anchorYUnits: 'pixels',
        src: url,
        imgSize: [size.width, size.height]
      }))
    });

    if (bg && point) {
      result = [bg, border, style, point]
    } else {
      result = [border, style]
    }

    return result;
  },
  getMultifyStyle(number, url, isActive) {
    var border = this.getBorderImg(isActive)
    var size = this.getSize(isActive)

    var image = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 65],
        anchorYUnits: 'pixels',
        src: url,
        imgSize: [size.width, size.height]
      })
    });

    var point = this.getText(number)
    
    return [border, image, point];
  },
  getSize(active) {
    var size = {
      width: this._imageSize.width,
      height: this._imageSize.height
    }
    if (active && this._activeHoverZoom) {
      size.width += 10
      size.height += 10
    }

    return size
  },
  getBorderImg(active) {
    var imgName = (this._activeStatus && active) ? 'pic-border-hover.png' : 'pic-border.png'
    var border = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: "/static/assets/img/map/" + imgName,
        imgSize: [this._imageSize.borderW, this._imageSize.borderH]
      })
    });

    return border
  },
  getText(size) {
    var offsetX = this._offsetX, 
      offsetY = this._offsetY,
      fontSize = this._fontSize,
      icon = 'pic-point.png',
      anchor = [-25, 75]

    if (size < 100) {
      fontSize = fontSize + 'px';

    } else {
      fontSize = fontSize + 'px';
      anchor = [-18, 75]
      icon = 'pic-ellipse.png'
    } 

    var point = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: anchor,
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        src: "/static/assets/img/map/" + icon,
        imgSize: [this._imageSize.borderW, this._imageSize.borderH]
      }),
      text: new ol.style.Text({
        font: fontSize + ' Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,微软雅黑,Arial,sans-serif',
        text: size.toString(),
        fill: new ol.style.Fill({
          color: '#fff'
        }),
        offsetX: offsetX,
        offsetY: offsetY
      })
    });

    return point
  },
  getDerictionBgStyle(deriction, active) {
    var style = null
    var INVALID_DERICT = -9999
    if (this._activeDirection && active) {
      var picName = (!deriction || deriction === INVALID_DERICT) ? 'pic-noderict-bg.png' : 'pic-derict-bg.png'
      var rotate = (!deriction || deriction === INVALID_DERICT) ? 0 : deriction / 180 * Math.PI
      style = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 0.5],
          src: "/static/assets/img/map/" + picName,
          rotation: rotate,
          imgSize: [198, 198]
        })
      });
    }

    return style
  },
  getDerictionPointStyle(deriction, active) {
    var style = null
    var INVALID_DERICT = -9999
    if (this._activeDirection && active) {
      var picName = (!deriction || deriction === INVALID_DERICT) ? 'pic-noderict.png' : 'pic-derict.png'
      var rotate = (!deriction || deriction === INVALID_DERICT) ? 0 : deriction / 180 * Math.PI
      style = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [9, 17],
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
          src: "/static/assets/img/map/" + picName,
          rotation: rotate,
          imgSize: [18, 25]
        })
      });
    }

    return style
  },
  getThumbnail(url, isActive) {
    var size = this.getSize(isActive)
    if (this._sharedAssetServer === '') {
      console.error(">>>>> Please set image root assert path before addPicturesLayer")
      url = ""

    } else {
      var url = `${this._sharedAssetServer}/${url}?x-oss-process=image/resize,m_fixed,w_${size.width},h_${size.height}`
    }

    return url ;
  },
  destroy() {
    this.map.removeLayer(this.clusterLayer)
    this.map.un('click', this.pictureLayerClickHandler)
    this.map.un('pointermove', this.mouseoverPicture)
    this.map = null
    this.clusterLayer = null
    this.picList = null
    this.clickEventCb = null
    this._sharedAssetServer = ""
  }
}