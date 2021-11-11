import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { LoadScript } from '@react-google-maps/api';

ReactDOM.render(
	<LoadScript googleMapsApiKey='AIzaSyD58m4Z_xT4KC_SJtUuFM5b8TsRoSgPLnY'>
		<React.StrictMode>
			<App />
		</React.StrictMode>
	</LoadScript>,
	document.getElementById('root')
);
