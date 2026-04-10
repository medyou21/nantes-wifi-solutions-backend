import { Schema, model, Document } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  price: number;
  description: string;
  features: string[];
}

const offerSchema = new Schema<IOffer>({
  title:       { type: String, required: true },
  price:       { type: Number, required: true },
  description: { type: String, required: true },
  features:    [{ type: String }],
});

export default model<IOffer>('Offer', offerSchema);
