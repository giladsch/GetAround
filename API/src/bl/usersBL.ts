import { BaseDataAccess } from "../dal/baseDAL";
import { IUser, IUserModel } from "../models/user.model";
import { UsersDAL } from "../dal/usersDAL";

export class UsersBL {
  private userDataAccess: UsersDAL;

  constructor() {
    this.userDataAccess = new UsersDAL();
  }

  async create(document: IUser) {
    return await this.userDataAccess.create(document);
  }

  async findById(id: string) {
    return await this.userDataAccess.findById(id);
  }

  async findByName(name: string) {
    return await this.userDataAccess.findByName(name);
  }

  async findAll(): Promise<Array<IUser>> {
    return await this.userDataAccess.findAll();
  }

  async update(document: IUser) {
    await this.userDataAccess.update(document);
  }
}
