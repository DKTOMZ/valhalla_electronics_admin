import { UtilService } from "@/services/utilService";
import mongoose from "mongoose";
import { FrontendServices } from "./inversify.config";

const util = FrontendServices.get<UtilService>('UtilService');
/**
 * promoCode schema for mongodb. Used to create a promo code before db operations.
 */
const PromocodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    validUntil: {
        type: String,
        required: true,
    },
    discountPercent: {
        type: Number,
        required: true
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
 * Promocode model for mongodb. Used to perform db CRUD operations.
 */
const Promocode = mongoose.models.promocode || mongoose.model('promocode', PromocodeSchema);

export default Promocode;