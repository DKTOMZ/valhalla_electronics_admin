import mongoose from "mongoose";
import { FrontendServices } from "./inversify.config";
import { UtilService } from "@/services/utilService";

const util = FrontendServices.get<UtilService>('UtilService');
/**
 * Currencies schema for mongodb. Used to create a currency before db operations.
 */
const currencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    shortName: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
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
    }
},{ versionKey: false });

/**
 * Currencies model for mongodb. Used to perform db CRUD operations.
 */
const Currency = mongoose.models.currencies || mongoose.model('currencies', currencySchema);

export default Currency;