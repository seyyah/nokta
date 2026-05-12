export interface BatchOptions {
    concurrency?: number;
    retries?: number;
    minTimeout?: number;
    maxTimeout?: number;
    onProgress?: (completed: number, total: number, item: unknown) => void;
}
export declare function isRateLimitError(error: unknown): boolean;
export declare function batchProcess<T, R>(items: T[], processor: (item: T, index: number) => Promise<R>, options?: BatchOptions): Promise<R[]>;
export declare function batchProcessWithSSE<T, R>(items: T[], processor: (item: T, index: number) => Promise<R>, sendEvent: (event: {
    type: string;
    [key: string]: unknown;
}) => void, options?: Omit<BatchOptions, "concurrency" | "onProgress">): Promise<R[]>;
//# sourceMappingURL=utils.d.ts.map