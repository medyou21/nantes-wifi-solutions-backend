import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
  role: "admin" | "superadmin";
}

const adminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default model<IAdmin>("Admin", adminSchema);