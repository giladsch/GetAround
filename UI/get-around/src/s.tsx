import React, { useEffect, useMemo, useState } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
	width: '400px',
	height: '400px',
};

const center = {
	lat: -3.745,
	lng: -38.523,
};

export const MyComponent = () => {
	const [origin, setOrigin] = useState({ lat: 40.756795, lng: -73.954298 });
	const [destination, setDestination] = useState({ lat: 41.756795, lng: -78.954298 });
	const [result, setResult] = useState<google.maps.DirectionsResult>();
	const directionsService = useMemo(() => new google.maps.DirectionsService(), []);

	useEffect(() => {
		directionsService.route(
			{
				origin,
				destination,
				travelMode: google.maps.TravelMode.TRANSIT,
			},
			(response, status) => {
				console.log(response);
				console.log(status);
				response && setResult(response);
			}
		);
	}, [origin, destination]);

	return (
		<GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
			<DirectionsRenderer directions={result} />
		</GoogleMap>
	);
};

export default React.memo(MyComponent);
