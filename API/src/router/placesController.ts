import * as express from "express";
import { IController } from "../shared/IController";
import { UsersBL } from "../bl/usersBL";
import { IUser } from "../models/user.model";

export class UsersController implements IController {
  path = "places";
  x =
    "/place/findplacefromtext/json?input=israel&inputtype=textquery&key=AIzaSyD58m4Z_xT4KC_SJtUuFM5b8TsRoSgPLnY";
  router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path, async (req, res) => {});

    this.router.post(this.path, async (req, res) => {
      const user: IUser = req.body;
      res.sendStatus(200);
    });

    this.router.get(`${this.path}/:id`, async (req, res) => {
      res.sendStatus(200);
    });
  }
}
