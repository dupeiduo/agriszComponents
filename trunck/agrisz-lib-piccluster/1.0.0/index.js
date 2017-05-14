'use strict'

module.exports = {
  _distance: 100,
  _zIndex: 10,
  _imageSize: { width: 61, height: 53, borderW: 67, borderH: 71 },
  _offsetX: 36,
  _offsetY: -32,
  _fontSize: 14,
  _sharedAssetServer: '',
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
  centerTo(item, zoomLevel) {
    var picItem = this.getGeom(item.geom)

    zoomLevel = zoomLevel ? zoomLevel : 10
    var point = ol.proj.transform(picItem.coordinates, 'EPSG:4326', 'EPSG:3857')
    this.centerToAnimate(point, zoomLevel)
  },
  addPicturesLayer(map, picList, clickEventCb, zoomTo) {

    this.addReference(map, picList, clickEventCb)

    var features = this.getFeatures(this.picList)

    this.clusterLayer = this.addLayer(features)

    this.bindEvent()

    zoomTo && this.setMaxExtend()
  },
  addReference(map, picList, clickEventCb) {
    this.map = map
    this.picList = this.copyList(picList)
    this.clickEventCb = clickEventCb
  },
  copyList(picList) {
    var clone = []
    if (picList && picList.length > 0) {
      for (var i = 0; i < picList.length; i++) {
        clone[i] = {}
        clone[i].pid = picList[i].pid
        clone[i].img_file = picList[i].img_file
        clone[i].geom = this.getGeom(picList[i].geom)
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
        var featureNumber = clusterFeatures.length;
        
        var displayFeature = clusterFeatures[0];
        var imageUrl = this.getFeatureImageUrl(displayFeature); 
        
        return this.getClusterStyle(featureNumber, imageUrl);
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
      var pixel = map.getEventPixel(event.originalEvent);
      var hit = map.hasFeatureAtPixel(pixel);
      if (hit) {
        map.getViewport().style.cursor = 'pointer';
      } else {
        map.getViewport().style.cursor = 'default';
      }
    }
    
    map.on('pointermove', this.mouseoverPicture)
    map.on('click', this.pictureLayerClickHandler)
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
  getFeatureImageUrl(feature) {
    return feature.getProperties().img
  },
  getClusterStyle(featureNumber, imageUrl) {
    var style = null

    imageUrl = this.getThumbnail(imageUrl)

    if (featureNumber === 1) {
      style = this.getSingleStyle(imageUrl)
    } else {
      style = this.getMultifyStyle(featureNumber, imageUrl)
    }

    return style
  },
  getSingleStyle(url) {

    var border = this.getBorderImg()

    var style = new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [0.495, 0.58],
        src: url,
        imgSize: [this._imageSize.width, this._imageSize.height]
      }))
    });

    return [border, style];
  },
  getMultifyStyle(size, url) {
    var border = this.getBorderImg()

    var image = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.495, 0.58],
        src: url,
        imgSize: [this._imageSize.width, this._imageSize.height]
      })
    });

    var point = this.getText(size)
    
    return [border, image, point];
  },
  getBorderImg() {
    var border = new ol.style.Style({
      image: new ol.style.Icon({
        src: "/static/assets/img/map/pic-border.png",
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
      anchor = [-25, 42]

    if (size < 100) {
      fontSize = fontSize + 'px';

    } else {
      fontSize = fontSize + 'px';
      anchor = [-18, 42]
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
  getThumbnail(url) {
    if (this._sharedAssetServer === '') {
      console.error(">>>>> Please set image root assert path before addPicturesLayer")
      url = ""

    } else {
      var url = `${this._sharedAssetServer}/${url}?x-oss-process=image/resize,m_fixed,w_${this._imageSize.width},h_${this._imageSize.height}`
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