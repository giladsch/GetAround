import React, { FC } from 'react';
import logo from './assets/logo.png';
import mapPhoto from './assets/map.jpeg';
import AsyncSelect from 'react-select/async';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import axios from 'axios';
import './App.css';

interface PlacesAutocompleteResponse {
	predictions: PlaceAutocompletePrediction[];
	status: 'OK' | 'ZERO_RESULTS' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
	error_message?: string;
	info_messages?: string;
}

interface Option {
	value: string;
	label: string;
}

interface PlaceAutocompletePrediction {
	description: string;
	matched_substrings: PlaceAutocompleteMatchedSubstring[];
	structured_formatting: PlaceAutocompleteStructuredFormat;
	terms: PlaceAutocompleteTerm[];
	place_id?: string;
	reference?: string;
	types?: string[];
}

interface PlaceAutocompleteMatchedSubstring {
	length: number;
	offset: number;
}

interface PlaceAutocompleteStructuredFormat {
	main_text: string;
	main_text_matched_substrings: PlaceAutocompleteMatchedSubstring[];
	secondary_text: string;
	secondary_text_matched_substrings?: PlaceAutocompleteMatchedSubstring[];
}

interface PlaceAutocompleteTerm {
	offset: number;
	value: string;
}

const ApiKey = 'AIzaSyD58m4Z_xT4KC_SJtUuFM5b8TsRoSgPLnY';
const MapsBaseUrl = 'https://maps.googleapis.com/maps/api';

const _loadOptions = async (inputValue: string): Promise<Option[]> => {
	const response = (await axios.get<PlacesAutocompleteResponse>(`${MapsBaseUrl}/place/autocomplete/json?input=${inputValue}&types=geocode&key=${ApiKey}`)).data;

	const options: Option[] = response.predictions.map((prediction) => ({ value: prediction.place_id!, label: prediction.description }));

	return options;
};

const loadOptions = AwesomeDebouncePromise(_loadOptions, 500);

const App: FC = () => {
	return (
		<div className='App'>
			<div className='App-header'>
				<img src={logo} className='App-logo' alt='logo' />
				<img src={mapPhoto} className='Map-logo' alt='logo' />
			</div>
			<div className='App-body'>
				<form>
					<AsyncSelect
						isMulti
						cacheOptions
						noOptionsMessage={() => 'Loading...'}
						placeholder='Search For Attractions'
						loadOptions={loadOptions}
					/>
				</form>
			</div>
			<div className='circle first-circle'></div>
			<div className='circle second-circle'></div>
		</div>
	);
};

export default App;
