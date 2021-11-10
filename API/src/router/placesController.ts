import { MapsBaseUrl, ApiKey } from "./../conts";
import * as express from "express";
import { IController } from "../shared/IController";
import axios, { AxiosResponse } from "axios";
import { SimplePlace } from "../models/location.model";
import kmeans from "kmeans-ts";

interface PlacesAutocompleteResponse {
  predictions: PlaceAutocompletePrediction[];
  status:
    | "OK"
    | "ZERO_RESULTS"
    | "INVALID_REQUEST"
    | "OVER_QUERY_LIMIT"
    | "REQUEST_DENIED"
    | "UNKNOWN_ERROR";
  error_message?: string;
  info_messages?: string;
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

export interface Place {
  html_attributions: Array<String>;
  status: string;
  result: Result;
  info_messages?: Array<string>;
}

export interface Result {
  address_components: AddressComponent[];
  adr_address: string;
  business_status: string;
  formatted_address: string;
  formatted_phone_number: string;
  geometry: Geometry;
  icon: string;
  icon_background_color: string;
  icon_mask_base_uri: string;
  international_phone_number: string;
  name: string;
  opening_hours: OpeningHours;
  photos: Photo[];
  place_id: string;
  plus_code: PlusCode;
  rating: number;
  reference: string;
  reviews: Review[];
  types: string[];
  url: string;
  user_ratings_total: number;
  utc_offset: number;
  vicinity: string;
  website: string;
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Geometry {
  location: Location;
  viewport: Viewport;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Viewport {
  northeast: Northeast;
  southwest: Southwest;
}

export interface Northeast {
  lat: number;
  lng: number;
}

export interface Southwest {
  lat: number;
  lng: number;
}

export interface OpeningHours {
  open_now: boolean;
  periods: Period[];
  weekday_text: string[];
}

export interface Period {
  close: Close;
  open: Open;
}

export interface Close {
  day: number;
  time: string;
}

export interface Open {
  day: number;
  time: string;
}

export interface Photo {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
}

export interface PlusCode {
  compound_code: string;
  global_code: string;
}

export interface Review {
  author_name: string;
  author_url: string;
  language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface Distance {
  text: string;
  value: number;
}

export interface Duration {
  text: string;
  value: number;
}

export interface Element {
  distance: Distance;
  duration: Duration;
  status: string;
}

export interface Row {
  elements: Element[];
}

export interface RootObject {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: Row[];
  status: string;
}

interface PlaceAutocompleteTerm {
  offset: number;
  value: string;
}

interface Option {
  value: string;
  label: string;
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
        let days: { [id: number]: { openHour: string; closeHour: string } } =
          {};
        data.result.opening_hours.periods.map((period) => {
          const open = period.open.time;
          const close = period.close.time;
          days[period.close.day] = {
            openHour: open.slice(0, 2) + ":" + open.slice(2),
            closeHour: close.slice(0, 2) + ":" + close.slice(2),
          };
        });

        return {
          id: data.result.place_id,
          visitDuration: 1,
          days,
          location: data.result.geometry.location,
        };
      });

      let distances: Array<Promise<AxiosResponse<RootObject>>> = [];

      places.forEach(async (place) => {
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
        distances.push(axios.get<RootObject>(`${url}`));
      });

      let distancesResult = await Promise.all(distances);
      let distancesData = distancesResult.map((distancesResponse) => {
        return distancesResponse.data.rows;
      });

      res.send({ distancesData, places }).status(200);
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
