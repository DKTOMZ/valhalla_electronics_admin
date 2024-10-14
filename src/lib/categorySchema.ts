import mongoose from "mongoose";
import { FrontendServices } from "./inversify.config";
import { UtilService } from "@/services/utilService";

const util = FrontendServices.get<UtilService>('UtilService');

/**
 * Category schema for mongodb. Used to create a category before db operations.
 */
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    parentCategory: {
        type: Object,
        required: false,
        default: {name:''}
    },
    properties: {
        type: Array,
        required: false,
        default: []
    },
    childCategories: {
        type: Array,
        required: false,
        default: []
    },
    images: {
        type: Array,
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
 * Category model for mongodb. Used to perform db CRUD operations.
 */
const Category = mongoose.models.categories || mongoose.model('categories', categorySchema);

export default Category;