import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import { connectDB as mongoDB, isValidID } from "../config/mongoose.config.js";
import { createHash, isValidPassword } from "../utils/security.js";

import {
  ERROR_INVALID_ID,
  ERROR_NOT_FOUND_ID,
  ERROR_NOT_FOUND_CREDENTIALS,
} from "../constants/messages.constant.js";

export default class UserManager {
  #userModel;

  constructor() {
    this.#userModel = UserModel;
  }

  getAll = async (paramFilters) => {
    try {
      const $and = [];
      if (paramFilters?.name)
        $and.push({ name: { $regex: paramFilters.name, $options: "i" } });
      const filters = $and.length > 0 ? { $and } : {};

      const usersFound = await this.#userModel.find(filters).lean();
      return usersFound;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getOneById = async (id) => {
    try {
      if (!isValidID(id)) {
        throw new Error(ERROR_INVALID_ID);
      }

      const userFound = await this.#userModel.findById(id).lean();
      if (!userFound) {
        throw new Error(ERROR_NOT_FOUND_ID);
      }

      return userFound;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  getOneByEmailAndPassword = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error(ERROR_NOT_FOUND_CREDENTIALS);
      }

      const userFound = await this.#userModel.findOne({ email }).lean();
      if (!userFound) {
        throw new Error(ERROR_NOT_FOUND_CREDENTIALS);
      }

      const hash = userFound.password ?? "";

      if (!isValidPassword(password, hash)) {
        throw new Error(ERROR_NOT_FOUND_CREDENTIALS);
      }

      return userFound;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  insertOne = async (data) => {
    try {
      data.password = createHash(data.password);
      const userCreated = new UserModel(data);

      await userCreated.save();

      return userCreated;
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        error.message = Object.values(error.errors)[0];
      }

      throw new Error(error.message);
    }
  };

  updateOneById = async (id, data) => {
    try {
      if (!isValidID(id)) {
        throw new Error(ERROR_INVALID_ID);
      }

      const userFound = await this.#userModel.findById(id);
      if (!userFound) {
        throw new Error(ERROR_NOT_FOUND_ID);
      }

      const newValues = {
        ...data,
        password: data.password
          ? createHash(data.password)
          : userFound.password,
      };

      userFound.set(newValues);
      await userFound.save();
      return userFound;
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        error.message = Object.values(error.errors)[0];
      }

      throw new Error(error.message);
    }
  };

  deleteOneById = async (id) => {
    try {
      if (!isValidID(id)) {
        throw new Error(ERROR_INVALID_ID);
      }

      const userFound = await this.#userModel.findById(id);
      if (!userFound) {
        throw new Error(ERROR_NOT_FOUND_ID);
      }

      await this.#userModel.findByIdAndDelete(id);

      return userFound;
    } catch (error) {
      throw new Error(error.message);
    }
  };
}
