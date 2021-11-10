import { PlacesController } from "./router/placesController";
import { App } from "./app";
import { config } from "dotenv";

config();

const placesCont: PlacesController = new PlacesController();
const app = new App([placesCont], 8000);

app.listen();