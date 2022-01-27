import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import { APP_URL } from '../config';

const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    ownerID: { type: String, required: true },
    price: { type: Number, default: 0 },
    manufactureDate: { type: String, required: false },
    expiryDate: { type: String, required: true },
    status: { type: String, required: true, default: 'Pending' },
    productCode: { type: String, required: true },
    isAvailable: { type: Boolean, default: false },
    thumbnail: {
        type: String,
        required: true,
        get: (thumbnail) => {
            // http://localhost:5000/uploads/products/1616443169266-52350494.png
            if (process.env.ON_PROD == 'true') {
                return `${thumbnail}`;
            }
            return `${APP_URL}/${thumbnail}`;
        },
    },
}, { timestamps: true, toJSON: { getters: true }, id: false });

export default mongoose.model('Product', productSchema, 'products');