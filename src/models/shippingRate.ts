export interface ShippingRate {
    _id: string,
    name: string,
    minimumDeliveryDays: number,
    maximumDeliveryDays?: number,
    rate: number,
    created: Date,
    updated: Date,
}