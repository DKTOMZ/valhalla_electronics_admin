import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";
import mongoose from "mongoose";

/**
 * CurrencyRates schema for mongodb. Used to create a currency rate before db operations.
 */
const CurrencyRatesSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
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
 * Currency rate model for mongodb. Used to perform db CRUD operations.
 */
const CurrencyRates = mongoose.models.currencyRates || mongoose.model('currencyRates', CurrencyRatesSchema);

export default CurrencyRates;