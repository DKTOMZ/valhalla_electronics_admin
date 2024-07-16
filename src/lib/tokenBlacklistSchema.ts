import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";
import mongoose from "mongoose";

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
        default: CURRENT_DATE_TIME()
    },
    updated: {
        type: Date,
        required: false,
        default: CURRENT_DATE_TIME()
    }
},{ versionKey: false });

/**
 * TokenBlacklist model for mongodb. Used to perform db CRUD operations.
 */
const TokenBlacklist = mongoose.models.tokenBlacklist || mongoose.model('tokenBlacklist', tokenBlacklistSchema);

export default TokenBlacklist;