export interface AdminClient {
    id: string,
    name: string,
    email: string,
    image: string,
    error?: string,
    created: Date,
    updated: Date
}

export interface AdminServer {
    _id: string,
    name: string,
    email: string,
    password?: string,
    image: string,
    emailVerified: boolean,
    created: Date,
    updated: Date
}