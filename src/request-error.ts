// Request error handling

"use strict";

/**
 * Request Error
 */
export interface RequestError {
    /**
     * HTTP Status code
     */
    status: number;

    /**
     * String body returned by the server
     */
    body: string;
}

/**
 * Error handler for common errors
 */
export type CommonErrorHandler =
    | {
          /**
           * Handler for server errors
           */
          serverError: () => void;

          /**
           * Handler for network errors
           */
          networkError: () => void;
      }
    | {
          /**
           * Wraps both: Networks and server errors
           * If you set this, do not set either serverError or networkError
           */
          temporalError: () => void;
      };

/**
 * Error handler for common errors on authenticated requests
 */
export type CommonAuthenticatedErrorHandler = CommonErrorHandler & {
    /**
     * Handler for unauthorized errors
     */
    unauthorized: () => void;
};

/**
 * Callback to handle errors
 */
export interface RequestErrorHandlerCallback {
    /**
     * HTTP status code
     */
    status: number | "*";

    /**
     * Error code
     */
    code: string;

    /**
     * Callback function
     */
    callback: () => void;
}

/**
 * Utility class to parse and handle API errors
 */
export class RequestErrorHandler {
    /**
     * Registered callbacks
     */
    private callbacks: RequestErrorHandlerCallback[];

    constructor() {
        this.callbacks = [];
    }

    /**
     * Adds callback
     * @param status The HTTP status code
     * @param code The API error code
     * @param callback The callback
     * @returns Self
     */
    public add(status: number | "*", code: string, callback: () => void): RequestErrorHandler {
        this.callbacks.push({
            status: status,
            code: code,
            callback: callback,
        });

        return this;
    }

    /**
     * Handles error
     * @param error Request error
     */
    public handle(error: RequestError) {
        // Get error code from body

        let errorCode = "";
        const data = error.body;
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                errorCode = parsedData.code || parsedData.error_code || "";
            } catch (err) {
                errorCode = "";
            }
        }

        for (const callback of this.callbacks) {
            if (callback.status === "*" || callback.status === error.status) {
                if (callback.code === "*" || errorCode === callback.code) {
                    callback.callback && callback.callback();
                    return;
                }
            }
        }
    }
}
