module.exports = function(parent) {
  var map = parent.map;
  var wgs84Sphere = new ol.Sphere(6378137);

  var source = new ol.source.Vector();

  var vector = new ol.layer.Vector({
    source: source,
    style: drawEndStyle()
  });

  map.addLayer(vector);
  vector.setZIndex(12)

  function drawEndStyle() {
    var style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ffcc33'
        })
      })
    })

    return style
  }

  var sketch;

  var helpTooltipElement;
  var helpTooltip;

  var measureTooltipElement;
  var measureTooltip;
  var closeElement;

  var continueLineMsg = '<span class="map-highlight-tip">单击</span>确定地点，<span class="map-highlight-tip">双击</span>结束';
  var continuePolygonMsg = '<span class="map-highlight-tip">单击</span>选择地点，<span class="map-highlight-tip">双击</span>结束';


  function pointerMoveHandler(evt) {
    if (evt.dragging) {
      return;
    }

    var helpMsg = '<span class="map-highlight-tip">点击</span>选择起点';
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

  var draw;

  function formatLength(line) {
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
    if (length > 500) {
      output = Math.round(length / 1000 * 100) / 100 + ' ' + '公里';
    } else {
      output = Math.round(length * 100) / 100 + ' ' + '米';
    }
    return output;
  };

  function formatArea(polygon) {
    var area;
    if (useGeodesic) {
      var sourceProj = map.getView().getProjection();
      var geom = /** @type {ol.geom.Polygon} */ polygon.clone().transform(sourceProj, 'EPSG:4326');
      var coordinates = geom.getLinearRing(0).getCoordinates();
      area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
    } else {
      area = polygon.getArea();
    }
    var output;
    var mu = area * 15 / 10000
    if (mu >= 10000) {
      output = Math.round(mu / 15) + " 公顷" 
      // output = Math.round(area / 1000000 * 100) / 100 + ' 平方公里';
    } else {
      output = Math.round(mu) + " 亩" 
      // output = Math.round(area * 100) / 100 + ' 平方米';
    }
    return output;
  };

  function meassureInteraction(type) {
    type = type == 'area' ? 'Polygon' : 'LineString';
    draw = new ol.interaction.Draw({
      source: source,
      type: type
    });
    map.addInteraction(draw);

    var featureId = new Date().getTime()

    createMeasureTooltip(featureId);
    createHelpTooltip();

    map.on('pointermove', pointerMoveHandler);

    var listener;
    draw.on('drawstart', function(evt) {
      sketch = evt.feature;
      var tooltipCoord = evt.coordinate;

      listener = sketch.getGeometry().on('change', function(evt) {
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

    draw.on('drawend', function(evt) {
      sketch = evt.feature
      evt.feature.id = featureId

      measureTooltipElement.className = 'tooltip tooltip-static';
      closeElement = creteCloseBtn(type == 'Polygon', featureId);
      measureTooltipElement.appendChild(closeElement);
      measureTooltip.setOffset([0, -7]);

      sketch = null;
      measureTooltipElement = null
      ol.Observable.unByKey(listener);

      setTimeout(() => {
        parent.$emit("stopDraw")
      }, 0)
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
      offset: [15, 20],
      positioning: 'bottom-left'
    });
    map.addOverlay(helpTooltip);
    map.getViewport().addEventListener('mouseout', function() {
      helpTooltipElement.classList.add('hidden');
    });
  }

  function createMeasureTooltip(id) {
    if (measureTooltipElement) {
      measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.id = id
    measureTooltipElement.className = 'tooltip tooltip-measure';
    measureTooltip = new ol.Overlay({
      id: id,
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
  }

  function creteCloseBtn(isArea, id) {
    var ele
    ele = document.createElement('span');
    ele.id = id
    ele.className = 'measure-close';
    ele.innerHTML = '&times'
    if (isArea) {
      ele.dataset.tip = '移除该面积测量结果'
    } else {
      ele.dataset.tip = '移除该距离测量结果'
    }
    ele.onclick = function(event) {
      var id = event.target.id
      parent.toolIndex = -1
      removeElementById(id)
      resetSource(id)
    }
    ele.onmousemove = function(event) {
      helpTooltipElement.parentNode.style.display = 'none'
    }
    ele.onmouseout = function(event) {
      helpTooltipElement.parentNode.style.display = 'block'
    }
    return ele
  }


  function removeElementById(id) {
    var parent = document.getElementsByClassName('ol-overlaycontainer-stopevent')
    var childs = parent[0].childNodes;

    if (childs && childs.length) {

      for (var i = childs.length - 1; i >= 0; i--) {

        if (childs[i].className.indexOf('ol-overlay-container') >= 0) {
          var overlays = childs[i].childNodes

          if (overlays && overlays.length > 0 && overlays[0].id === id) {
            parent[0].removeChild(childs[i]);
            break
          }
        }
      }
    }
  }

  function removeAllElement() {
    var parent = document.getElementsByClassName('ol-overlaycontainer-stopevent')
    var childs = parent[0].childNodes;

    if (childs && childs.length) {

      for (var i = childs.length - 1; i >= 0; i--) {

        if (childs[i].className.indexOf('ol-overlay-container') >= 0) {
          parent[0].removeChild(childs[i])
        }
      }
    }
  }

  function resetSource(id) {
    source.forEachFeature((feature) => {
      var _id = feature.id;
      if (id == _id) {
        source.removeFeature(feature)
        return
      } 
    })

    vector.setSource(source)
  }

  function stopDraw() {
    map.removeInteraction(draw)
    map.un('pointermove', pointerMoveHandler);
    map.removeOverlay(helpTooltip)
    if (sketch) {
      map.removeOverlay(measureTooltip)
    }
  }

  function clearDraw() {
    source = new ol.source.Vector()
    vector.setSource(source)

    stopDraw()
    removeAllElement()
  }

  meassureInteraction.clearDraw = clearDraw
  meassureInteraction.stopDraw = stopDraw

  return meassureInteraction;

}