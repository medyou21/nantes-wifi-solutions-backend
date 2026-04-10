import { Schema, model, Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  createdAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, trim: true },
    company: { type: String, trim: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IContact>('Contact', contactSchema);
