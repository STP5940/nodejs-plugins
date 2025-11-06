// overrideRenderMiddleware.js
const path = require('path');

module.exports = function () {
    return function (req, res, next) {
        // เก็บ method เดิมไว้
        const originalRender = res.render.bind(res);

        // สร้าง method สำหรับ plugin โดยเฉพาะ
        res.render = function (view, data = {}, callback) {
            // ตรวจสอบว่ามี plugin context หรือไม่
            if (res.locals.currentPlugin) {
                const pluginName = res.locals.currentPlugin;
                const pluginViewPath = path.join(pluginName, 'views', view);

                // ลองหาไฟล์ view ของ plugin ก่อน
                return originalRender(pluginViewPath, data, (err, html) => {
                    if (err) {
                        // ถ้าไม่พบ view ใน plugin ให้ render หน้า erroruser
                        if (typeof callback === 'function') {
                            // ถ้ามี callback ให้ส่ง error ไป
                            return callback(err);
                        } else {
                            // ถ้าไม่มี callback ให้ render หน้า erroruser
                            return originalRender("erroruser", {
                                error: {
                                    status: 500,
                                    theme: data?.error?.theme,
                                    message: data?.error?.message || 'View not found',
                                }
                            }, (err2, errorHtml) => {
                                // ถ้า erroruser ไม่พบด้วย, ส่งข้อความธรรมดาแทน
                                if (err2) {
                                    return res.status(404).send(err.message || 'View not found');
                                }
                                res.status(404).send(errorHtml);
                            });
                        }
                    }

                    // ถ้าไม่มี error, ส่ง HTML ตามปกติ
                    if (typeof callback === 'function') {
                        callback(err, html);
                    } else {
                        res.send(html);
                    }
                });
            }

            // ถ้าไม่มี plugin context ให้ render จาก root views ตามปกติ
            return originalRender(view, data, callback);
        };

        // เก็บ method เดิมไว้ใน property ใหม่
        res._originalRender = originalRender;

        next();
    };
};