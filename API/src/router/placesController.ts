import { MapsBaseUrl, ApiKey } from "./../conts";
import * as express from "express";
import { IController } from "../shared/IController";
import axios, { AxiosResponse } from "axios";
import { SimplePlace } from "../models/location.model";
import { Place, Option, RootObject, PlacesAutocompleteResponse } from "../models/placeInterfaces.model";
import { TripPlanningBL } from "../bl/tripPlanningBL";
import { SPFAlgorithm, LocationCluster, locationClusterConstructor } from "../bl/SPFAlgorithm";

export class PlacesController implements IController {
  path = "places";
  router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`/aaaaa`, async (req, res) => {
      const ids: Array<string> = [
        "ChIJrRMgU7ZhLxMRxAOFkC7I8Sg",
        "ChIJaUtr7LFhLxMRZv_QkugkuUc",
        "ChIJkRvJRqRhLxMRTpu4WRhK6CM",
        "ChIJ2UYsr1RgLxMRnVSDeOy_ZLg",
      ];
      let promises: Array<Promise<AxiosResponse<Place>>> = [];
      ids.forEach((id) => {
        const request = axios.get<Place>(
          `${MapsBaseUrl}/place/details/json?place_id=${id}&key=${ApiKey}`
        );
        promises.push(request);
      });
      let responses = await Promise.all(promises);
      let places: Array<SimplePlace> = responses.map((response) => {
        let { data } = response;
        let days: { [id: number]: { openHour: number; closeHour: number } } =
          {};
        data.result.opening_hours.periods.map((period) => {
          const open = period.open.time;
          const close = period.close.time;
          days[period.close.day] = {
            openHour: parseInt(open.slice(0, 2)) + parseInt(open.slice(2)) / 60,
            closeHour: parseInt(close.slice(0, 2)) + parseInt(close.slice(2)) / 60,
          };
        });

        return {
          id: data.result.place_id,
          name: data.result.name,
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
            return x.location.lat + "," + x.location.lng;
          })
          .join("|");
        const url = `${MapsBaseUrl}/distancematrix/json?destinations=${encodeURIComponent(
          destinations
        )}&mode=walking&language=en&origins=${encodeURIComponent(
          place.location.lat + "," + place.location.lng
        )}&key=${ApiKey}`;
        distancesPromise.push(axios.get<RootObject>(`${url}`));
      });

      let distancesResult = await Promise.all(distancesPromise);
      let distancesData = distancesResult.map((distancesResponse) => {
        return distancesResponse.data;
      });
      let distances = {}
      for (let [index, value] of Object.entries(distancesData)) {
      // Object.entries(distancesData).forEach((distanceData,index)=>{
        if(!distances[value.origin_addresses[0]]){
          distances[value.origin_addresses[0]]={}
        }
       let places =  value.destination_addresses.map(x=>x)
       for (let [index1, value1] of Object.entries(value.rows)) {
        value1["elements"].forEach((element,index2)=>{
        distances[value.origin_addresses[0]][places[index2]] = 
         element["duration"].value
      });
      }
      //  })
      }
      // });

      const clusters = new TripPlanningBL().clusterLocations(places,2);
      const newClusters: LocationCluster[] = locationClusterConstructor(clusters, distances);
      const result = newClusters.map(cluster => new SPFAlgorithm().getOptimalPath(cluster)); 
      res.send({ distancesData, places,distances }).status(200);
    });

    this.router.post("/search", async (req, res) => {
      const { value } = req.body;
      console.log(value);
      const url = encodeURI(
        `${MapsBaseUrl}/place/autocomplete/json?input=${value}&key=${ApiKey}`
      );
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
