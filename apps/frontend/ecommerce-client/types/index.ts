export interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export * from './product';
export * from './showroom';
export * from './flash-sale';
export * from './order';
export * from './cart';
export * from './return-request';
export * from './checkout';