import { UtilService } from "@/services/utilService";
import mongoose from "mongoose";
import { FrontendServices } from "./inversify.config";

const util = FrontendServices.get<UtilService>('UtilService');
/**
 * Token Blacklist schema for mongodb. Used to store used tokens that have not yet expired as revoked/blacklisted.
 */
const tokenBlacklistSchema = new mongoose.Schema({
    tokenJti: {
        type: String,
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
 * TokenBlacklist model for mongodb. Used to perform db CRUD operations.
 */
const TokenBlacklist = mongoose.models.tokenBlacklist || mongoose.model('tokenBlacklist', tokenBlacklistSchema);

export default TokenBlacklist;