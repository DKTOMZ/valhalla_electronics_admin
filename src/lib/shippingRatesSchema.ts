import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";
import mongoose from "mongoose";

/**
 * ShippingRates schema for mongodb. Used to create a shipping rate before db operations.
 */
const ShippingRatesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    minimumDeliveryDays: {
        type: Number,
        required: true,
    },
    maximumDeliveryDays: {
        type: Number,
        required: false,
    },
    rate: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        required: false,
        default: CURRENT_DATE_TIME()
    },
    updated: {
        type: Date,
        required: false,
        default: CURRENT_DATE_TIME()
    }
},{ versionKey: false });

/**
 * Shipping rate model for mongodb. Used to perform db CRUD operations.
 */
const ShippingRates = mongoose.models.shippingRates || mongoose.model('shippingRates', ShippingRatesSchema);

export default ShippingRates;