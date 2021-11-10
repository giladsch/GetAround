import { MapsBaseUrl, ApiKey } from "./../conts";
import * as express from "express";
import { IController } from "../shared/IController";
import { UsersBL } from "../bl/usersBL";
import { IUser } from "../models/user.model";
import axios, { AxiosResponse } from "axios";

export class PlacesController implements IController {
  path = "places";
  router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`/aaaaa`, async (req, res) => {
      const ids: Array<string> = [
        "ChIJi8mnMiRJABURuiw1EyBCa2o",
        "ChIJi8mnMiRJABURuiw1EyBCa2o",
        "ChIJi8mnMiRJABURuiw1EyBCa2o",
        "ChIJi8mnMiRJABURuiw1EyBCa2o",
      ];
      let promises: Array<Promise<AxiosResponse<Root>>> = [];
      ids.forEach((id) => {
        const request = axios.get<Root>(
          `${MapsBaseUrl}/place/details/json?place_id=${id}&key=${ApiKey}`
        );
        promises.push(request);
      });
      let responses = await Promise.all(promises);
      let x = responses.map((respons) => {
        return respons.data;
      });
    });
  }
}

export interface Root {
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

// interface PlacesDetailsResponse{
//     html_attributions:Array<String>;
//     result:Place;
//     status:PlacesDetailsStatus;
//     info_messages?:Array<string>;

// }
interface Place {
  address_components?: Array<AddressComponent>;
  adr_address?: string;
  business_status?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  geometry?: Geometry;
  icon?: string;
  icon_background_color?: string;
  icon_mask_base_uri?: string;
  international_phone_number?: string;
  name?: string;
  opening_hours?: string;
  permanently_closed?: boolean;
  photos?: Array<PlacePhoto>;
}

interface PlacePhoto {}

// interface PlaceOpeningHours{

// }

// interface Geometry{

// }

// interface AddressComponent{

// }

// interface PlacesDetailsStatus {

// }
interface PlaceAutocompletePrediction {
  description: string;
  place_id: string;
  reference: string;
  types?: Array<string>;
  terms: Array<PlaceAutocompleteTerm>;
}

interface PlaceAutocompleteTerm {
  offset: number;
  value: string;
}
