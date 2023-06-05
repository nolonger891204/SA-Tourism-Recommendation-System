import { useEffect, useContext } from "react";
import MapContext from "../../hook/MapContext";
import * as ol from "ol";

const Map = ({ children }) => {
	const { map, mapRef, zoom, center, extent, setMap } = useContext(MapContext);

	// on component mount
	useEffect(() => {
		let options = { 
			view: new ol.View({ zoom, center }),
			layers: [],
			controls: [],
			overlays: [],
		};
		
		let mapObject = new ol.Map(options);

		mapObject.setTarget(mapRef.current);
		setMap(mapObject);

		return () => {
			mapObject.setTarget(undefined);
		}
	}, []);

	// zoom change handler
	useEffect(() => {
		if (!map) return;
		map.getView().setZoom(zoom);
	}, [zoom]);

	// center change handler
	useEffect(() => {
		if (!map) return;
		map.getView().setCenter(center);
	}, [center]);

	// fit extend
	useEffect(() => {
		if (extent) {
			map.getView().fit(extent,{
				maxZoom: 15,
				padding: [50, 50, 50, 50]
			});
		}
	}, [extent])

	return (
		<div ref={mapRef} className="map" >
			{children}
		</div>
	)
}

export { Map };