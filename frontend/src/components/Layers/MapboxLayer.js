import { useContext, useEffect } from "react";
import MapContext from "./../../hook/MapContext";
import MapboxVector from 'ol/layer/MapboxVector.js';

const MapBoxLayer = ({ name, zIndex = 0 }) => {
  const { map } = useContext(MapContext);

	useEffect(() => {
		if (!map) return; 
    let vectorLayer = new MapboxVector({
        styleUrl: 'mapbox://styles/tinglong/ckyn5bs5300qb15o4lf1broft',
        accessToken:
          'pk.eyJ1IjoidGluZ2xvbmciLCJhIjoiY2t5bjViOTg4MnRueDMzcWh6MXdyc2ZneSJ9.aOZ26FMqwm5KU6NV7Ucg-A',
        name
    });
    map.addLayer(vectorLayer);
    vectorLayer.setZIndex(zIndex);
    return () => {
      if (map) {
        map.removeLayer(vectorLayer);
      }
    };
  }, [map]);

  return null;
}

export default MapBoxLayer;