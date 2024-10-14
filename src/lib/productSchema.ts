import mongoose from "mongoose";
import { FrontendServices } from "./inversify.config";
import { UtilService } from "@/services/utilService";

const util = FrontendServices.get<UtilService>('UtilService');
/**
 * Product schema for mongodb. Used to create a product before db operations.
 */
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    contents: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    images: {
        type: Array,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    properties: {
        type: Object,
        required: true
    },
    discount:  {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    },
    created: {
        type: Date,
        required: false,
        default: util.getCurrentDateTime()
    },
    updated: {
        type: Date,
        required: false,
        default: util.getCurrentDateTime()
    },
    currency: {
        type: String,
        required: true,
    }
},{ versionKey: false });

/**
 * Product model for mongodb. Used to perform db CRUD operations.
 */
const Product = mongoose.models.products || mongoose.model('products', productSchema);

export default Product;