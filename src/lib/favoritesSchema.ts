import mongoose from "mongoose";

/**
 * Favorites schema for mongodb. Used to create a favorite product before db operations.
 */
const FavoritesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    products: {
        type: Array,
        required: true,
    },
    created: {
        type: Date,
        required: false,
        default: new Date()
    },
    updated: {
        type: Date,
        required: false,
        default: new Date()
    }
},{ versionKey: false });

/**
 * Favorites(products) model for mongodb. Used to perform db CRUD operations.
 */
const Favorites = mongoose.models.favorites || mongoose.model('favorites', FavoritesSchema);

export default Favorites;