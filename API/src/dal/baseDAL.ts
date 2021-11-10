import { Document, Model, Types } from "mongoose";

export class BaseDataAccess<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  public async create(document: T) {
    this.model.create(document);
  }

  public async findById(id: string) {
    return await this.model.findById(id);
  }

  public async findAll() {
    return this.model.find();
  }

  public async delete(id: string) {
    return await this.model.deleteOne(id);
  }

  public async update(document: T) {
    return await this.model.updateOne({ _id: document._id }, document);
  }

  public async filter(filter: any) {
    return await this.model.find(filter);
  }

  private toObjectId(_id: string): Types.ObjectId {
    return Types.ObjectId.createFromHexString(_id);
  }
}
