function getNewCustomError(): { new (string?): Error } {
    return class extends Error {
        constructor(...args) {
            super(...args);
            Object.setPrototypeOf(this, new.target.prototype);
        }
    };
}

export const GameNotFoundError = getNewCustomError();
export const GameAlreadyFullError = getNewCustomError();