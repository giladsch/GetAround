import { UsersController } from "./router/usersController";
import { App } from "./app";
import { config } from "dotenv";

config();

const app = new App([new UsersController()], 3000);

app.listen();
