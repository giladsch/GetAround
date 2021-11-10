import { Location } from "../router/placesController";

export interface SimplePlace {
  id: string;
  location: Location;
  days: { [id: number]: { openHour: string; closeHour: string } };
  visitDuration: number;
}
