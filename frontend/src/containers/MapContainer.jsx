import React, { useContext } from "react";
import { fromLonLat, toLonLat } from "ol/proj";
import { Map } from "../components/Map/Map";
import { Layers, MapBoxLayer, VectorLayer } from "../components/Layers";
import Geolocation from 'ol/Geolocation.js';
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Icon, Circle as CircleStyle, Style, Fill, Stroke } from "ol/style";
import { vector } from "../components/Sources";
import MapContext from "../hook/MapContext";
import GeoJSON from "ol/format/GeoJSON";
import PinGreen from './../assets/pin_green.svg';
import { spots } from "../assets/spot";

const MapContainer = ({mapView, setMapView}) => {
  const { secondResult } = useContext(MapContext);

  /* RECORD FEATURE */
  var recordGeojsonObject = {
    "type": "FeatureCollection",
    "name": "taipei_spot",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  };

  recordGeojsonObject["features"] = secondResult?.map(({ name }) => {
    var result_name = name;
    var coord;
    spots.map(({name, lat, lon}, index) => {
      if ( result_name === name ) {
        coord = [lon, lat];
      } 
    });
    return {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": coord,
      },
      "properties": {
        "name": name
      },
    }
  });

  console.log(recordGeojsonObject);

  return (
    <div id="map_container"
      style={{
        height: "300px",
        width: "100%",
        borderRadius: "5px",
        overflow: "hidden",
      }}
    >
      <Map>
        <Layers>
          <MapBoxLayer name={"basemap_mapbox"} zIndex={1} />
          <VectorLayer 
            name={"feature"} 
            source={vector({
              features: new GeoJSON().readFeatures(recordGeojsonObject, { featureProjection: 'EPSG:3857' }),
            })}
            style={
              new Style({
                image: new Icon({
                  anchor: [0.5, 16],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'pixels',
                  width: 40,
                  height: 40,
                  src: PinGreen,
                })
              })
            }
            zIndex={1} 
          />
        </Layers>
      </Map>
    </div>
  );
};

export { MapContainer }