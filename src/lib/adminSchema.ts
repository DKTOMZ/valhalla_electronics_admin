
import mongoose from "mongoose";
import { FrontendServices } from "./inversify.config";
import { UtilService } from "@/services/utilService";

const util = FrontendServices.get<UtilService>('UtilService');

/**
 * Admin schema for mongodb. Used to create an admin before database operations in auth processes.
 */
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        default: ''
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        match: [util.getEmailRegex(), 'Invalid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    image: {
        type: String,
        required: false,
        default: ''
    },
    emailVerified: {
        type: Boolean,
        required: false,
        default: false
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
 * Admin model for mongodb. Used to perform db CRUD operations.
 */
const Admin = mongoose.models.admins || mongoose.model('admins', adminSchema);

export default Admin;