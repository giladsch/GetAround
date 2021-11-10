import * as express from "express";
import { IController } from "../shared/IController";
import { UsersBL } from "../bl/usersBL";
import { IUser } from "../models/user.model";

// // middleware that is specific to this router
// router.use((req, res, next)=> {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the home page route

export class UsersController implements IController {
  path = "/users";
  router = express.Router();
  private usersBl: UsersBL;
  static counter = 0;

  constructor() {
    this.usersBl = new UsersBL();
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path, async (req, res) => {
      const start = new Date().getTime();
      await this.usersBl.findByName("gilad");

      // const users = await this.usersBl.findAll();
      // console.log(UsersController.counter++);
      res.send({ time: (new Date().getTime() - start) / 1000 });
    });

    this.router.post(this.path, async (req, res) => {
      const user: IUser = req.body;
      this.usersBl.create(user);
      res.sendStatus(200);
    });

    this.router.get(`${this.path}/name`, async (req, res) => {
      const users = await this.usersBl.findByName(req.params.name);
      res.send(users);
    });

    this.router.get(`${this.path}/yossi`, async (req, res) => {
      const users = await this.usersBl.findByName(req.params.name);
      res.send(users);
    });

    this.router.get(`${this.path}/:id`, async (req, res) => {
      const user = await this.usersBl.findById(req.params.id);
      res.send(user);
    });

    this.router.put(`${this.path}`, async (req, res) => {
      const user: IUser = req.body;
      this.usersBl.update(user);
      res.sendStatus(200);
    });
  }
}

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
