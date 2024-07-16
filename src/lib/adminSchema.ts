import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";
import { emailRegex } from "@/utils/regex";
import mongoose from "mongoose";

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
        match: [emailRegex, 'Invalid email']
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
        default: CURRENT_DATE_TIME()
    },
    updated: {
        type: Date,
        required: false,
        default: CURRENT_DATE_TIME()
    }
},{ versionKey: false });

/**
 * Admin model for mongodb. Used to perform db CRUD operations.
 */
const Admin = mongoose.models.admins || mongoose.model('admins', adminSchema);

export default Admin;