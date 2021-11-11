import { MapsBaseUrl, ApiKey } from './../conts';
import * as express from 'express';
import { IController } from '../shared/IController';
import axios, { AxiosResponse } from 'axios';
import { SimplePlace } from '../models/location.model';
import { Place, Option, RootObject, PlacesAutocompleteResponse } from '../models/placeInterfaces.model';
import { TripPlanningBL } from '../bl/tripPlanningBL';
import { SPFAlgorithm, LocationCluster, locationClusterConstructor, LocationNode } from '../bl/SPFAlgorithm';

const DEFAULT_PERIODS = {
	periods: [
		{ close: { day: 0, time: '2000' }, open: { day: 0, time: '0900' } },
		{ close: { day: 1, time: '2000' }, open: { day: 1, time: '0900' } },
		{ close: { day: 2, time: '2000' }, open: { day: 2, time: '0900' } },
		{ close: { day: 3, time: '2000' }, open: { day: 3, time: '0900' } },
		{ close: { day: 4, time: '2000' }, open: { day: 4, time: '0900' } },
		{ close: { day: 5, time: '2000' }, open: { day: 5, time: '0900' } },
		{ close: { day: 6, time: '2000' }, open: { day: 6, time: '0900' } },
	],
};

export class PlacesController implements IController {
	path = 'places';
	router = express.Router();

	constructor() {
		this.initializeRoutes();
	}

	public initializeRoutes() {
		this.router.post('/plan', async (req, res) => {
			const ids: Array<string> = req.body.places.map((place) => {
				return place.value;
			});
			const numOfDays: number = req.body.numOfDays;
			const nameToId = {};
			let promises: Array<Promise<AxiosResponse<Place>>> = [];
			ids.forEach((id) => {
				const request = axios.get<Place>(`${MapsBaseUrl}/place/details/json?place_id=${id}&key=${ApiKey}`);
				promises.push(request);
			});
			let responses = await Promise.all(promises);
			let places: Array<SimplePlace> = responses.map((response) => {
				let { data } = response;

				let days: { [id: number]: { openHour: number; closeHour: number } } = {};
				(data.result.opening_hours ?? DEFAULT_PERIODS).periods.map((period) => {
					const open = period.open.time;
					if (!period.close) {
						period.close = { time: '2359', day: period.open.day };
					}
					const close = period.close.time;
					days[period.close.day] = {
						openHour: parseInt(open.slice(0, 2)) + parseInt(open.slice(2)) / 60,
						closeHour: parseInt(close.slice(0, 2)) + parseInt(close.slice(2)) / 60,
					};
				});

				return {
					id: data.result.place_id,
					name: data.result.formatted_address,
					visitDuration: 1,
					days,
					location: data.result.geometry.location,
				};
			});

			let distancesPromise: Array<Promise<AxiosResponse<RootObject>>> = [];

			places.forEach((place) => {
				const destinations = places
					.filter((x) => x.id != place.id)
					.map((x) => {
						return x.location.lat + ',' + x.location.lng;
					})
					.join('|');
				const url = `${MapsBaseUrl}/distancematrix/json?destinations=${encodeURIComponent(
					destinations
				)}&mode=walking&language=en&origins=${encodeURIComponent(place.location.lat + ',' + place.location.lng)}&key=${ApiKey}`;
				distancesPromise.push(axios.get<RootObject>(`${url}`));
			});

			let distancesResult = await Promise.all(distancesPromise);
			let distancesData = distancesResult.map((distancesResponse) => {
				return distancesResponse.data;
			});
			let distances = {};
			for (let index1 = 0; index1 < places.length; index1++) {
				const currId = places[index1].id;
				const otherPlaces = places.filter((place) => place.id != currId);
				distances[currId] = {};

				for (let index2 = 0; index2 < otherPlaces.length; index2++) {
					distances[currId][otherPlaces[index2].id] = distancesData[index1].rows[0].elements[index2].duration.value;
				}
			}
			// for (let [index, value] of Object.entries(distancesData)) {
			// 	// Object.entries(distancesData).forEach((distanceData,index)=>{
			// 	if (!distances[nameToId[value.origin_addresses[0]]]) {
			// 		distances[nameToId[value.origin_addresses[0]]] = {};
			// 	}
			// 	let places = value.destination_addresses.map((x) => x);
			// 	for (let [index1, value1] of Object.entries(value.rows)) {
			// 		value1['elements'].forEach((element, index2) => {
			// 			distances[nameToId[value.origin_addresses[0]]][places[index2]] = element['duration'].value;
			// 		});
			// 	}
			// 	//  })
			// }
			// });

			const clusters = new TripPlanningBL().clusterLocations(places, numOfDays);
			const newClusters: LocationCluster[] = locationClusterConstructor(clusters, distances);
			const selectedLocationNodes: LocationNode[][] = newClusters.map((cluster) => new SPFAlgorithm().getOptimalPath(cluster));
			const resultLocations = selectedLocationNodes.map((selectedLocationsPerDay: LocationNode[]) => {
				return selectedLocationsPerDay.map((selectedLocationNode: LocationNode) => ({
					...selectedLocationNode.location,
					name: selectedLocationNode.name,
				}));
			});

			res.send(resultLocations).status(200);
		});

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
	}
}
