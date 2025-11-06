class MyError extends Error {
    constructor(message, httpcode) {
        // console.error(message)
        super(message);
        this.name = this.constructor.name;
        this.httpcode = httpcode;
    }
}

module.exports = MyError;