// LargeDataMiddleware.js
const express = require('express');  // เพิ่มบรรทัดนี้

class LargeDataMiddleware {
    constructor(app, sizeLimit = '5mb') {
        // กำหนด sizeLimit ใน constructor
        this.app = app;
        this.sizeLimit = sizeLimit;
        this.middleware = express.urlencoded({ limit: this.sizeLimit, extended: false });
    }

    apply(urls) {
        urls.forEach(url => {
            this.app.use(url, this.middleware);
        });
    }
}

module.exports = LargeDataMiddleware;
