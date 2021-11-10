import { PlacesController } from "./router/placesController";
import { App } from "./app";
import { config } from "dotenv";

config();

const app = new App([new PlacesController()], 8000);

app.listen();
