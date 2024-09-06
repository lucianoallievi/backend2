import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";
import { STANDARD, ROLES } from "../constants/roles.constant.js";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "El nombre es obligatorio."],
      uppercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "El apellido es obligatorio."],
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio."],
      lowercase: true,
      trim: true,
      unique: true,
      validate: {
        validator: async function (email) {
          const countDocuments = await this.model("users").countDocuments({
            _id: { $ne: this._id },
            email,
          });
          return countDocuments === 0;
        },
        message: "El email ya está registrado",
      },
    },
    age: { type: Number },
    password: { type: String, required: [true, "El password es obligatorio."] },
    cart: { type: Schema.Types.ObjectId },
    roles: {
      type: [String],
      uppercase: true,
      enum: { values: ROLES, message: "Rol no válido." },
      default: [STANDARD],
    },
  },
  { timestamp: true, versionKey: false }
);

userSchema.plugin(paginate);

const User = model("users", userSchema);

export default User;
