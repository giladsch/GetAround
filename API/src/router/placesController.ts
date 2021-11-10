import * as express from 'express';
import { IController } from '../shared/IController';
import { IUser } from '../models/user.model';
import axios from 'axios';

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

export class PlacesController implements IController {
	path = 'places';
	router = express.Router();

	constructor() {
		this.intializeRoutes();
	}

	public intializeRoutes() {
		this.router.post('/search', async (req, res) => {
			const { value } = req.body;
			console.log(value);
			const url = encodeURI(`${MapsBaseUrl}/place/autocomplete/json?input=${value}&key=${ApiKey}`);
			console.log(url);
			
			const response = (await axios.get<PlacesAutocompleteResponse>(url)).data;

			const options: Option[] = response.predictions.map((prediction) => ({
				value: prediction.place_id!,
				label: prediction.description,
			}));

			res.send(options).status(200);
		});

		this.router.post(this.path, async (req, res) => {
			const user: IUser = req.body;
			res.sendStatus(200);
		});

		this.router.get(`${this.path}/:id`, async (req, res) => {
			res.sendStatus(200);
		});
	}
}
