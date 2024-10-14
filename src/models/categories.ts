export interface Category {
    _id: string,
    name: string,
    parentCategory: Category,
    properties: CategoryProperty[],
    childCategories: string[],
    images: {Key: string, link: string}[],
    created: Date,
    updated: Date
}

export interface CategoryProperty {
    name: string,
    value: string,
    custom?: boolean
}