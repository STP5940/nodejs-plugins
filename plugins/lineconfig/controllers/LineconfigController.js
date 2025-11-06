const Storetokens = require('@app/Storetokens');
const LineBot = require('@app/LineBot');
const Authen = require('@app/Authen');
const Func = require('@root/app/Func');

const T_Lineconfig = require("@app/Models/T_Lineconfig");

const { validationResult } = require("express-validator");
const path = require('path');

const controllerName = path.parse(__filename).name;

class LineconfigController {

    // index แสดงข้อมูลทั้งหมด
    // permission: read
    static async index(req, res) {
        try {

            // getLineconfigById

            const dataUse = Authen.getSession(req);

            const Lineconfig = new T_Lineconfig();

            const lineconfigDetail = await Lineconfig.getLineconfigById(dataUse?.Company_id);

            // กำหนด URL ของโลโก้โดยอัตโนมัติ
            const serverHost = `${req.protocol}://${req.get('host')}`;

            const data = {
                use: dataUse,
                messages: req.flash(),
                controllerName: controllerName,
                translat: Func.getLanguage(dataUse?.language),
                encryptText: Func.encryptText,
                lineconfig: lineconfigDetail,
                serverHost: serverHost,
                isNotSecure: req.protocol == 'http' ? true : false,
            };

            return res.render("index", data);

        } catch ({ name, message, theme }) {
            res.status(500).render("erroruser", {
                error: {
                    status: 500,
                    theme: theme,
                    message: message,
                }
            });
        }
    }

    // show แสดงข้อมูลด้วยคีย์
    // permission: read
    static show(req, res) {
        try {

            const dataUse = Authen.getSession(req);

            const data = {
                use: dataUse,
                messages: req.flash(),
                controllerName: controllerName,
                translat: Func.getLanguage(dataUse?.language),
                encryptText: Func.encryptText,
            };

            return res.send("show");

        } catch ({ name, message, theme }) {
            res.status(500).render("erroruser", {
                error: {
                    status: 500,
                    theme: theme,
                    message: message,
                }
            });
        }
    }

    // create บันทึกข้อมูล (แสดงหน้ากรอกข้อมูล)
    // permission: create
    static create(req, res) {
        try {

            const dataUse = Authen.getSession(req);

            const data = {
                use: dataUse,
                messages: req.flash(),
                controllerName: controllerName,
                translat: Func.getLanguage(dataUse?.language),
                encryptText: Func.encryptText,
            };

            return res.send("create");

        } catch ({ name, message, theme }) {
            res.status(500).render("erroruser", {
                error: {
                    status: 500,
                    theme: theme,
                    message: message,
                }
            });
        }
    }

    // store บันทึกข้อมูล
    // permission: create
    static store(req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            req.flash("error", errorMessages);
            // return res.redirect('/user/demo');
            return res.send(errorMessages);
        }

        // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Error message ไปให้เลย
        // const dataUse = Authen.getSession(req);
        // const translat = await Func.getLanguage(dataUse?.language);

        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //   const errorMessages = errors.array().reduce((message, error) => {
        //     message[error.msg] = translat[error.msg];
        //     return message;
        //   }, {});

        //   return res.status(400).json({
        //     status: false,
        //     error: errorMessages,
        //     token: res.locals.csrfToken,
        //   });
        // }

        try {

            const dataUse = Authen.getSession(req);

            const data = {
                use: dataUse,
                messages: req.flash(),
                controllerName: controllerName,
                translat: Func.getLanguage(dataUse?.language),
                encryptText: Func.encryptText,
            };

            return res.send("store");

            // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Data เป็น Json แล้วส่งไปให้เลย
            // return res.status(200).json({
            //   status: true,
            //   message: "success",
            // });

        } catch ({ name, message, theme }) {
            res.status(500).render("erroruser", {
                error: {
                    status: 500,
                    theme: theme,
                    message: message,
                }
            });

            // ถ้าเป็นการดึงแบบ API ให้ส่ง Error message เป็นรูป Json
            // res.status(500).json({
            //   status: false,
            //   message: message,
            // });
        }
    }

    // edit  แก้ไขข้อมูล (แสดงหน้ากรอกข้อมูล)
    // permission: update
    static edit(req, res) {
        try {

            const dataUse = Authen.getSession(req);

            const data = {
                use: dataUse,
                messages: req.flash(),
                controllerName: controllerName,
                translat: Func.getLanguage(dataUse?.language),
                encryptText: Func.encryptText,
            };

            return res.send("edit");

        } catch ({ name, message, theme }) {
            res.status(500).render("erroruser", {
                error: {
                    status: 500,
                    theme: theme,
                    message: message,
                }
            });
        }
    }

    // update แก้ไขข้อมูล
    // permission: update
    static async update(req, res) {

        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     const errorMessages = errors.array().map(error => error.msg);
        //     req.flash("error", errorMessages);
        //     // return res.redirect('/user/demo');
        //     return res.send(errorMessages);
        // }

        // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Error message ไปให้เลย
        const dataUse = Authen.getSession(req);
        const translat = await Func.getLanguage(dataUse?.language);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().reduce((message, error) => {
                message[error.msg] = translat[error.msg];
                return message;
            }, {});

            return res.status(400).json({
                status: false,
                error: errorMessages,
                token: res.locals.csrfToken,
            });
        }

        try {

            const {
                _companyId, new_groupId, new_secret, new_accessToken,
                new_cmnew, new_pmnew, new_cmcomplete, new_pmcomplete
            } = req.body;

            const companyIdDecrypt = parseInt(Func.decryptText(_companyId));

            const dataUse = Authen.getSession(req);

            const Lineconfig = new T_Lineconfig();

            const lineconfigDetail = await Lineconfig.getLineconfigById(dataUse?.Company_id);

            if (lineconfigDetail) {
                console.log("Update Lineconfig");

                const lineconfigData = {
                    Company_id: companyIdDecrypt,
                    groupId: new_groupId,
                    secret: new_secret,
                    accessToken: new_accessToken,
                    cmnew: Func.isTrue(new_cmnew),
                    pmnew: Func.isTrue(new_pmnew),
                    cmcomplete: Func.isTrue(new_cmcomplete),
                    pmcomplete: Func.isTrue(new_pmcomplete),
                }

                await Lineconfig.updateLineconfigById(lineconfigDetail.Lineconfig_id, lineconfigData);
            } else {
                console.log("Create Lineconfig");

                const lineconfigData = {
                    Company_id: companyIdDecrypt,
                    groupId: new_groupId,
                    secret: new_secret,
                    accessToken: new_accessToken,
                    cmnew: Func.isTrue(new_cmnew),
                    pmnew: Func.isTrue(new_pmnew),
                    cmcomplete: Func.isTrue(new_cmcomplete),
                    pmcomplete: Func.isTrue(new_pmcomplete),
                }

                await Lineconfig.createLineconfigIfNotExists(lineconfigData)
            }

            // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Data เป็น Json แล้วส่งไปให้เลย
            return res.status(200).json({
                status: true,
                message: "success",
                token: res.locals.csrfToken,
            });

        } catch ({ name, message, theme }) {
            // ถ้าเป็นการดึงแบบ API ให้ส่ง Error message เป็นรูป Json
            res.status(500).json({
                status: false,
                message: message,
            });
        }
    }

    // delete ลบข้อมูล
    // permission: delete
    static destroy(req, res) {
        try {

            const dataUse = Authen.getSession(req);

            const data = {
                use: dataUse,
                messages: req.flash(),
                controllerName: controllerName,
                translat: Func.getLanguage(dataUse?.language),
                encryptText: Func.encryptText,
            };

            return res.send("destroy");

        } catch ({ name, message, theme }) {
            res.status(500).render("erroruser", {
                error: {
                    status: 500,
                    theme: theme,
                    message: message,
                }
            });
        }
    }

    // testconnection ทดสอบการเชื่อมต่อ
    // permission: read
    static async testconnection(req, res) {
        try {

            const { groupId, secret, accessToken } = req.body;

            const bot = new LineBot({
                channelAccessToken: accessToken,
                channelSecret: secret
            });

            // ส่งข้อความทดสอบผ่าน LINE Messaging API
            await bot.sendTextMessage(
                groupId,
                `🔔 ทดสอบการแจ้งเตือน\n` +
                `✅ ระบบแจ้งเตือนทำงานปกติ\n` +
                `⏰ ${Func.formatDateTimeThai(new Date())}`
            )

            // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Data เป็น Json แล้วส่งไปให้เลย
            return res.status(200).json({
                status: true,
                message: "success",
                token: res.locals.csrfToken,
            });

        } catch ({ name, message, theme, statusCode, statusMessage }) {

            // Error 401 จาก Line Notify
            if (statusCode === 401) {
                return res.status(statusCode).json({
                    status: false,
                    message: 'Channel access token is invalid',
                    token: res.locals.csrfToken,
                });
            }

            // Error 400 จาก Line Notify
            if (statusCode === 400) {
                return res.status(statusCode).json({
                    status: false,
                    message: 'Information is incorrect. Please check again.',
                    token: res.locals.csrfToken,
                });
            }

            // ถ้าเป็นการดึงแบบ API ให้ส่ง Error message เป็นรูป Json
            res.status(500).json({
                status: false,
                message: message,
                token: res.locals.csrfToken,
            });
        }
    }

    // webhook รับการแจ้งเตือนจาก LINE Messaging API
    // permission: read
    static async webhook(req, res) {
        try {

            // console.log(Func.encryptText(req.params?._companyId));

            const companyIdDecrypt = parseInt(Func.decryptText(req.params?._companyId));

            if (isNaN(companyIdDecrypt)) {
                return res.status(400).render("erroruser", {
                    error: {
                        status: 400,
                        message: "Invalid request: Unable to process the provided ID.",
                    }
                });
            }

            console.log("webhook ComId:", companyIdDecrypt);


            const data = req.body;

            // console.log(data);


            // ตรวจสอบว่ามี events หรือไม่
            if (!data.events || !Array.isArray(data.events)) {
                console.log('No events found in request');
                return res.status(200).json({ message: 'No events found' });
            }

            // ประมวลผล events แต่ละรายการ
            for (const event of data.events) {
                console.log('Processing event:', event.type);
                await handleLineEvent(event, companyIdDecrypt);
            }

            // const { events } = req.body;

            // console.log(req.body);
            // console.log(events);
            // if (events || events.length >= 1) {
            //     for (const event of events) {
            //         // ตรวจสอบว่าเป็นข้อความหรือไม่
            //         if (event.type === 'message' && event.message.type === 'text') {
            //             const replyToken = event.replyToken;
            //             const messageText = event.message.text;

            //             // ส่งข้อความตอบกลับ
            //             const bot = new LineBot({
            //                 channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
            //                 channelSecret: process.env.LINE_CHANNEL_SECRET
            //             });

            //             await bot.replyTextMessage(replyToken, `คุณส่งข้อความ: ${messageText}`);
            //         }
            //     }
            // }

            // ถ้าเป็นการดึงแบบ API ให้ทำการแปล Data เป็น Json แล้วส่งไปให้เลย
            return res.status(200).json({
                status: true,
                message: "success",
                // token: res.locals.csrfToken,
            });

        } catch ({ name, message, theme }) {
            // ถ้าเป็นการดึงแบบ API ให้ส่ง Error message เป็นรูป Json
            res.status(500).json({
                status: false,
                message: message,
            });
        }
    }
}

// ฟังก์ชันจัดการ LINE Event
async function handleLineEvent(event, companyId) {
    try {
        const Lineconfig = new T_Lineconfig();
        const lineconfigDetail = await Lineconfig.getLineconfigById(companyId);

        const { type, source } = event;

        // console.log(`Event type: ${type}, Source type: ${source?.type}, Source ID: ${source?.groupId || source?.roomId || source?.userId}`);

        // ตรวจสอบว่าเป็น Group หรือ Room
        if (lineconfigDetail && source.type === 'group' && source.groupId) {
            // console.log(`Group event detected. Group ID: ${source.groupId}`);
            // จัดการตามประเภท event
            switch (type) {
                case 'join':
                    // บอทถูกเชิญเข้ากลุ่ม
                    // console.log("Bot joined group:", source.groupId);
                    const bot = new LineBot({
                        channelAccessToken: lineconfigDetail?.accessToken,
                        channelSecret: lineconfigDetail?.secret
                    });

                    // ส่งข้อความทดสอบผ่าน LINE Messaging API
                    bot
                        .sendTextMessage(
                            source.groupId,
                            `🤝 แชทปลายทางแจ้งเตือน\n` +
                            `Group ID: ${source.groupId}`
                        )
                        .then(() => console.log('ส่งข้อความสำเร็จ'))
                        .catch(err => console.error('เกิดข้อผิดพลาด:', err));
                    break;

                case 'leave':
                    // บอทออกจากกลุ่ม
                    // await handleBotLeaveGroup(source.groupId, replyToken);
                    console.log("Bot left group:", source.groupId);
                    break;

                case 'message':
                    // มีข้อความในกลุ่ม
                    if (event?.message?.type == 'text') {
                        console.log(event?.message?.text);
                    }
                    // await handleGroupMessage(event);
                    break;

                // case 'memberJoined':
                //     // มีสมาชิกเข้าร่วมกลุ่ม
                //     await handleMemberJoined(event);
                //     break;

                default:
                    console.log(`Unhandled event type: ${type}`);
            }
        } /* else if (source.type === 'room' && source.roomId) {
            console.log(`Room event detected. Room ID: ${source.roomId}`);

            // จัดการ Room events
            switch (type) {
                case 'join':
                    await handleBotJoinRoom(source.roomId, replyToken);
                    break;

                case 'message':
                    await handleRoomMessage(event);
                    break;

                default:
                    console.log(`Unhandled room event type: ${type}`);
            }
        } else {
            console.log(`Event from individual user: ${source.userId}`);
        } */

    } catch (error) {
        console.error('Error handling LINE event:', error);
    }
}

module.exports = LineconfigController;