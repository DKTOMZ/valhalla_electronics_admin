export interface OrderProduct {
    _id: string,
    name: string,
    brand: string,
    description: string,
    contents: string,
    unitPrice: number,
    totalPrice: number,
    image: string,
    category: string,
    properties: any,
    quantity: number,
    productUrl: string
}

export interface OrderType {
    _id: string,
    userEmail: string,
    products: OrderProduct[],
    orderId: string,
    paymentId: string,
    subTotal: number,
    total: number,
    shippingRate: string,
    shippingFee: number,
    paymentMethod: string,
    deliveryStatus?: string,
    paymentStatus: string,
    discount?: number,
    promocode?: string,
    created?: Date,
    updated?: Date,
    currency: string
}