
export interface ErrorResponse extends Error {
    code: number;
    message: string;
}

export type SuccessResponse = {
    code: number;
    message: string;
    data: any;
}
