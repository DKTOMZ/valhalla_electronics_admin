import { Product } from "./products";

export interface FavoritesType {
    userId: string,
    product: Product,
    created: Date,
    updated: Date
}