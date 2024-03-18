export interface PromocodeType {
    _id: string,
    code: string,
    validUntil: string,
    discountPercent: number,
    created: Date,
    updated: Date
}