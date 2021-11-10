import * as express from "express";
import { IController } from "../shared/IController";
import { UsersBL } from "../bl/usersBL";
import { IUser } from "../models/user.model";

export class PlacesController implements IController {
  path = "places";
  router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get('', async (req, res) => {
      res.send(true).status(200);
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
