import { BaseDataAccess } from "./baseDAL";
import { IUserModel, User, IUser } from "../models/user.model";

export class UsersDAL {
  private userDataAccess: BaseDataAccess<IUserModel>;

  constructor() {
    this.userDataAccess = new BaseDataAccess(User);
  }

  async create(user: IUser) {
    this.userDataAccess.create(<IUserModel>user);
  }

  async findById(id: string) {
    return await this.userDataAccess.findById(id);
  }

  async findAll() {
    return await this.userDataAccess.findAll();
  }

  async update(user: IUser) {
    this.userDataAccess.update(user);
  }

  async findByName(name: String) {
    return await this.userDataAccess.filter({ name: name });
  }
}
