import React, { FC, useEffect, useMemo, useState } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { Point } from './App';
import { Button } from '@mui/material';
import './s.css';

const containerStyle = {
	width: '400px',
	height: '400px',
};

const center = {
	lat: -3.745,
	lng: -38.523,
};

interface MyComponentProps {
	points: Point[][];
}

export const MyComponent: FC<MyComponentProps> = ({ points }) => {
	const [index, setIndex] = useState(0);
	const origin = useMemo(() => points[index][0], [points, index]);
	const destination = useMemo(() => points[index][points[index].length - 1], [points, index]);
	const waypoints = useMemo(() => {
		const a = points[index].slice(1, points[index].length - 1);
		return a.map((point) => ({ location: new google.maps.LatLng(point) }));
	}, [points, index]);

	const [result, setResult] = useState<google.maps.DirectionsResult>();
	const directionsService = useMemo(() => new google.maps.DirectionsService(), []);

	useEffect(() => {
		directionsService.route(
			{
				origin,
				destination,
				waypoints,
				travelMode: google.maps.TravelMode.WALKING,
			},
			(response, status) => {
				console.log(response);
				response && setResult(response);
			}
		);
	}, [origin, destination, waypoints]);

	return (
		<div>
			<GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
				<DirectionsRenderer directions={result} />
			</GoogleMap>
			<div className='buttons-con'>
				<Button variant='contained' onClick={() => setIndex(index - 1)} disabled={index === 0}>
					{'<'}
				</Button>
				<Button variant='contained' onClick={() => setIndex(index + 1)} disabled={index === points.length - 1}>
					{'>'}
				</Button>
			</div>
		</div>
	);
};

export default React.memo(MyComponent);
