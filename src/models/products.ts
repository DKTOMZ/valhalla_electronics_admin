export interface Product {
    _id: string,
    name: string,
    brand: string,
    description: string,
    contents: string,
    price: number,
    images: {Key: string, link: string}[],
    category: string,
    properties: {},
    discount: number,
    stock: number,
    created: Date,
    updated: Date,
    currency: string
}