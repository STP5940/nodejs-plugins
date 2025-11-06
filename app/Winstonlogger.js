const winston = require('winston');
const Transport = require('winston-transport');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const moment = require('moment');

// Define the sensitive fields
const sensitiveFields = [
    'password', 'new_password', 'confirm_new_password',
    '_csrfToken', 'confirm_twofactor'
];

// Function to sanitize sensitive bodys dynamically based on sensitiveFields
const sanitizeDetails = (_details) => {
    const sanitized = { ..._details };
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '***CENSOR***';  // Replace sensitive fields with 'CENSOR'
        }
    });
    return sanitized;
};

class PrismaTransport extends Transport {
    async log(info, callback) {
        setImmediate(() => this.emit('logged', info));

        const sanitizedMessage = info.message;
        const sanitizedMeta = info.defaultMeta;

        try {
            // Sanitize the 'bodys' object inside message if it exists
            if (sanitizedMessage && sanitizedMessage.bodys) {
                sanitizedMessage.bodys = sanitizeDetails(sanitizedMessage.bodys);
            }

            // Sanitize the 'params' object inside message if it exists
            if (sanitizedMessage && sanitizedMessage.params) {
                sanitizedMessage.params = sanitizeDetails(sanitizedMessage.params);
            }

            // console.log(sanitizedMessage);
            // console.log(sanitizedMeta);
            callback();
        } catch (error) {
            console.error('Failed to log to Prisma:', error);
            callback(error);
        }
    }
}

// เซ็นเซอร์ข้อมูลที่สำคัญ
// Custom log format to sanitize sensitive data before writing to the log file
const sanitizeFormat = winston.format((info) => {
    if (info.message && info.message.bodys) {
        info.message.bodys = sanitizeDetails(info.message.bodys);
    }
    if (info.message && info.message.params) {
        info.message.params = sanitizeDetails(info.message.params);
    }
    return info;
})();

const reorderMeta = winston.format((info) => {
    if (info.defaultMeta) {
        const { controller, action, ...rest } = info.defaultMeta;
        info.defaultMeta = {
            controller,
            action,
            ...rest
        };
    }

    return info;
})();

// const customJsonFormat = winston.format.printf((info) => {
//     const { level, message, defaultMeta } = info;

//     return JSON.stringify({
//         defaultMeta: defaultMeta,
//         level,
//         message,
//     });
// });

const customJsonFormat = winston.format.printf((info) => {
    const { level, message, defaultMeta } = info;

    const normalizedMessage = typeof message === 'object'
        ? tryParseJsonStrings(message)
        : message;

    return JSON.stringify({
        defaultMeta,
        level,
        message: normalizedMessage,
    });
});

const tryParseJsonStrings = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const result = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];

        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                // ถ้าพาร์สสำเร็จ และได้ array หรือ object -> ใช้ค่าใหม่
                if (typeof parsed === 'object') {
                    result[key] = tryParseJsonStrings(parsed); // recursive parse
                } else {
                    result[key] = value; // primitive ไม่แปลง
                }
            } catch (e) {
                result[key] = value; // ไม่ใช่ JSON -> เก็บตามเดิม
            }
        } else if (typeof value === 'object' && value !== null) {
            result[key] = tryParseJsonStrings(value); // recursive object
        } else {
            result[key] = value; // primitive value
        }
    }

    return result;
};

// เอารายการ read ออกไม่ต้องเก็บ
const filterEmptyMessage = winston.format((info) => {
    const bodys = info.message?.bodys;
    const params = info.message?.params;

    if (
        Object.keys(bodys).length === 0 &&
        Object.keys(params).length === 0
    ) {
        return false;
    }

    return info;
})();

const winstonlogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        filterEmptyMessage,
        sanitizeFormat,
        reorderMeta,
        customJsonFormat
    ),
    transports: [
        new winston.transports.File({
            filename: `logs/user-activity-${moment().format('YYYY-MM-DD')}.log`,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                filterEmptyMessage,
                sanitizeFormat,
                reorderMeta,
                customJsonFormat
            )
        }),
        new PrismaTransport()
    ]
});

module.exports = winstonlogger;
