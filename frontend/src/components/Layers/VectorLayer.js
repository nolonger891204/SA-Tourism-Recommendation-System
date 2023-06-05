import { useContext, useEffect } from "react";
import MapContext from "../../hook/MapContext";
import OLVectorLayer from "ol/layer/Vector";

const VectorLayer = ({ name, source, style, zIndex = 0 }) => {
	const { map, feature, setExtent } = useContext(MapContext);

	useEffect(() => {
		if (!map) return;
		let vectorLayer = new OLVectorLayer({
			name,
			source,
			style
		});
		map.addLayer(vectorLayer);
		vectorLayer.setZIndex(zIndex);
		map.getLayers().forEach(function(l) {
			if (l.get("name") === "feature"){
				let source = l.getSource();
				setExtent(source.getExtent());
			}
		});
		return () => {
			if (map) {
				map.removeLayer(vectorLayer);
			}
		};
	}, [map]);

	const clearLayer = () => {
		map.getLayers().forEach((layer) => {
			if (layer.get('name') === 'feature') {
				layer.getSource().clear();
			}
		});
	};

	useEffect(()=>{
		if (!map) return;
		clearLayer();
		let vectorLayer = new OLVectorLayer({
			name,
			source,
			style
		});
		map.addLayer(vectorLayer);
		map.getLayers().forEach(function(l) {
			if (l.get("name") === "feature"){
				let source = l.getSource();
				setExtent(source.getExtent());
			}
		});
	}, [feature]);

	return null;
};

export default VectorLayer;