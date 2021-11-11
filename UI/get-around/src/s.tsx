import React, { useEffect, useMemo, useState } from "react";
import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "400px",
  height: "400px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

export const MyComponent = () => {
  const [origin, setOrigin] = useState({ lat: 41.756797, lng: -73.954298 });
  const [destination, setDestination] = useState({
    lat: 41.756796,
    lng: -73.954296,
  });
  const [waypoints, setWaypoints] = useState<google.maps.DirectionsWaypoint[]>(
    []
  );
  const [result, setResult] = useState<google.maps.DirectionsResult>();
  const directionsService = useMemo(
    () => new google.maps.DirectionsService(),
    []
  );


  useEffect(() => {
    setWaypoints([
      ...waypoints,
      { location: new google.maps.LatLng({ lat: 41.756796, lng: -73.954298 }) },
    ]);
    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        console.log(response);
        console.log(status);
        response && setResult(response);
      }
    );

  }, [origin, destination]);

  return (
	  <>	  
       <GoogleMap  mapContainerStyle={containerStyle} center={center} zoom={10}>
      <DirectionsRenderer  directions={result} />
    </GoogleMap>
	</>
  );
};

export default React.memo(MyComponent);
