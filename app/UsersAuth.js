const Storetokens = require("./Storetokens");
const { redisStore, redisClient } = require('./Redis');

const T_Users = require("./Models/T_Users");
const SYS_Signinlogs = require("./Models/SYS_Signinlogs");
const TM_Permissions = require("./Models/TM_Permissions");
const TM_UsersrolePermissions = require("./Models/TM_UsersrolePermissions");

const Authen = require("./Authen");

// Users Path API
const pathsToAPI = [
    '/api/'        // User Path API
];

const authorize = (_controllerName = '_controllerName', _permission = '_permission') => {
    return async function (req, res, next) {

        try {

            const dataUse = Authen.getSession(req);

            // เช็คว่าเป็นแคส crud ถ้าไม่ใช้ไม่ต้องทำงานต่อ
            const validPermissions = ["read", "update", "create", "delete"];
            if (!validPermissions.includes(_permission.toLowerCase())) {
                // เป็น api return json
                if (pathsToAPI.some(path => req.path.startsWith(path))) {
                    return res.status(401).json({
                        status: false,
                        token: res.locals.csrfToken,
                        error: "Access Denied",
                        message: "Access Denied",
                    });
                }

                return res.status(401).render("Users/notauthorized", {
                    use: dataUse,
                    ControllerName: _controllerName,
                    permission: _permission,
                });
            }

            const Permissions = new TM_Permissions();
            const UsersrolePermissions = new TM_UsersrolePermissions();

            // authorize Step 1 เช็คว่า เมนูเปิดใช้สิทธิใหม
            let getPermissions = await Permissions.getPermissionsByController(_controllerName);

            // ถ้าเป็น SuperAdmin Bypass AccesspermissionsController (กำหนดสิทธิเมนู)
            // *** ให้แค่ SuperAdmin เท่านั้น
            // if (_controllerName === 'AccesspermissionsController' && dataUse.priority == 1) {
            //     getPermissions = {
            //         prefix: 'F',
            //         controller: 'AccesspermissionsController',
            //         name: 'จัดการกลุ่มสมาชิก',
            //         read: true,
            //         update: true,
            //         create: true,
            //         delete: true,
            //     }
            // }

            // ถ้าโมดูลนั้นปิดใช้งาน ไม่ต้องทำงานต่อ
            if (!getPermissions || getPermissions[_permission] === false) {
                // เป็น api return json
                if (pathsToAPI.some(path => req.path.startsWith(path))) {
                    return res.status(401).json({
                        status: false,
                        token: res.locals.csrfToken,
                        error: "Access Denied",
                        message: "Access Denied",
                    });
                }

                return res.status(401).render("Users/notauthorized", {
                    use: dataUse,
                    ControllerName: _controllerName,
                    permission: _permission,
                });
            }

            // authorize Step end กำหนดว่ามีสิทธิใช้งานโมดูลหรือไม่
            if (req.session['permission']) {
                // เคยกำหนด permission ลง session
                req.session['permission'][_controllerName] = {
                    ...req.session['permission'][_controllerName], // Preserve existing permissions
                    read: getPermissions?.read,
                    update: getPermissions?.update,
                    create: getPermissions?.create,
                    delete: getPermissions?.delete,
                };
            } else {
                // ยังไม่เคยกำหนด permission ลง session
                req.session['permission'] = {
                    [_controllerName]: {
                        read: getPermissions?.read,
                        update: getPermissions?.update,
                        create: getPermissions?.create,
                        delete: getPermissions?.delete,
                    }
                };
            }

            // เช็ค authorize เคส Users
            if (dataUse.priority > 2) {

                const getUsersrolePermissions = await UsersrolePermissions.getUsersrolePermissionsByroleIdAndpermissionsId(dataUse.Usersrole_id, getPermissions.Permissions_id);

                // อัปเดทข้อมูลสิทธิการเข้าถึง
                const menuPermision = req.session['permission'][_controllerName];
                req.session['permission'][_controllerName] = {
                    read: (menuPermision?.read ? getUsersrolePermissions?.read : false),
                    update: (menuPermision?.update ? getUsersrolePermissions?.update : false),
                    create: (menuPermision?.create ? getUsersrolePermissions?.create : false),
                    delete: (menuPermision?.delete ? getUsersrolePermissions?.delete : false),
                };

                // ถ้ากลุ่มโมดูลนั้นปิดใช้งานสิทธิ ไม่ต้องทำงานต่อ
                if (!getUsersrolePermissions || getUsersrolePermissions[_permission] === false) {
                    // เป็น api return json
                    if (pathsToAPI.some(path => req.path.startsWith(path))) {
                        return res.status(401).json({
                            status: false,
                            token: res.locals.csrfToken,
                            error: "Access Denied",
                            message: "Access Denied",
                        });
                    }

                    return res.status(401).render("Users/notauthorized", {
                        use: dataUse,
                        ControllerName: _controllerName,
                        permission: _permission,
                    });
                }
            }

            // เช็ค authorize เคส Company
            if (dataUse.priority == 2) {
                const getUsersrolePermissions = await UsersrolePermissions.getUsersrolePermissionsByroleIdAndpermissionsId(dataUse.Usersrole_id, getPermissions.Permissions_id);

                // อัปเดทข้อมูลสิทธิการเข้าถึง
                const menuPermision = req.session['permission'][_controllerName];
                req.session['permission'][_controllerName] = {
                    read: (menuPermision?.read ? getUsersrolePermissions?.read : false),
                    update: (menuPermision?.update ? getUsersrolePermissions?.update : false),
                    create: (menuPermision?.create ? getUsersrolePermissions?.create : false),
                    delete: (menuPermision?.delete ? getUsersrolePermissions?.delete : false),
                };

                // ถ้ากลุ่มโมดูลนั้นปิดใช้งานสิทธิ ไม่ต้องทำงานต่อ
                if (!getUsersrolePermissions || getUsersrolePermissions[_permission] === false) {
                    // เป็น api return json
                    if (pathsToAPI.some(path => req.path.startsWith(path))) {
                        return res.status(401).json({
                            status: false,
                            token: res.locals.csrfToken,
                            error: "Access Denied",
                            message: "Access Denied",
                        });
                    }

                    return res.status(401).render("Users/notauthorized", {
                        use: dataUse,
                        ControllerName: _controllerName,
                        permission: _permission,
                    });
                }
            }

            req.createLogger.info({
                defaultMeta: { controller: _controllerName, action: _permission },
                message: {
                    status: 'request',
                    ipcurrent: req.clientIp,
                    timestamp: new Date().toISOString(),
                    user_id: dataUse?.User_id.toString(),
                    username: dataUse?.username.toString(),
                    params: req.params,
                    bodys: req.body
                }
            });
            next();

        } catch (error) {
            return res.status(500).json({
                status: false,
                token: res.locals.csrfToken,
                error: "Internal Server Error",
                // message: error,
            });
        }
    }
}

const usersAuth = async function (req, res, next) {

    try {


        const Signinlogs = new SYS_Signinlogs();

        // ถ้ารายการถูกลบหมด ให้ลบรายการใน redis ทั้งหมดของ user นั้นๆ
        // ดักกรณีที่ไม่มี logs session ในฐานข้อมูล
        const keys = await redisClient.sendCommand(["keys", "sess:*"]);

        // ดึงช้อมูลรายละเอียดทุก session เพื่อเตรียมลบรายการที่ไม่ใช้แล้ว
        const valuePromises = keys.map(key => redisClient.get(key));
        const values = await Promise.all(valuePromises);

        // ดึงรายการทั้งหมดของ user นั้นๆ
        const sessionLists = keys.map(key => key.replace(redisStore.prefix, ''));
        const signinlogs = await Signinlogs.getSigninlogsByUidAndSession(req.session?.User_id, sessionLists);

        for (let i = 0; i < keys.length; i++) {
            let redisValues;
            try {
                redisValues = JSON.parse(values[i]); // Safely parse JSON
            } catch (err) {
                // console.error(`Error parsing Redis value for key ${keys[i]}: ${err.message}`);
                continue; // Skip this iteration if parsing fails
            }

            // ลบรายการที่ไม่มีข้อมูล
            if (!redisValues?.User_id && !redisValues?.theme) {
                redisStore.destroy(keys[i].replace(redisStore.prefix, ''));
            }

            // ลบรายการที่ถูกบังคับออกจากระบบ และรายการที่ user คนนั้นๆ ลบออกทั้งหมด
            if (redisValues?.User_id == req.session?.User_id && signinlogs.length === 0) {
                redisStore.destroy(keys[i].replace(redisStore.prefix, ''));
            }
        }

        const userlogged = signinlogs.find(log => log.User_id.toString() === req.session?.User_id);

        if (req.session && req.session.loggedin && req.session.active && userlogged) {

            // ตรวจสอบว่า Account active อยู่หรือไม่
            if (req.session.username) {
                const Users = new T_Users();
                const dataUse = await Users.getActiveByUsername(req.session.username);
                if (dataUse && !dataUse?.active) {
                    // บังคับ logout
                    req.session.destroy();
                    return res.redirect('/login');
                }
            }

            next();
        } else {
            return res.redirect('/login');
        }

    } catch ({ name, message, theme }) {
        console.log(name);

        res.status(500).render("erroruser", {
            error: {
                status: 500,
                theme: theme,
                message: `
                Internal Server Error. Please try again later.<br/>
                <code>Error Code: ${message}</code>
                `,
            }
        });
    }
}

const tokenSubmit = async function (req, res, next) {

    const method = req.method;

    if (method == 'GET') {
        return res.status(405).render('erroruser', {
            error: {
                status: 405,
                message: "Token not support method: GET"
            }
        });
        // return res.status(405).send('Token not support method: GET');
    }

    const _csrfToken = req.body._csrfToken;

    // Validate the token
    if (
        !_csrfToken // ไม่มีการส่งข้อมูลมา
        || await Storetokens.usedHas(_csrfToken) == true // เป็นค่าที่ถูกสร้างจากระบบ
        || await Storetokens.makedHas(_csrfToken) == false // เช็คว่ายังไม่เคยถูกใช้งาน
    ) {

        // เป็น api return json
        if (pathsToAPI.some(path => req.path.startsWith(path))) {
            return res.status(401).json({
                status: false,
                token: res.locals.csrfToken,
                error: "Invalid or expired token",
            });
        }

        return res.status(401).render('erroruser', {
            error: {
                status: 401,
                message: "Invalid or expired token"
            }
        });
        // return res.status(401).send('Invalid or expired token');
    }

    // Mark the token as used
    Storetokens.usedAdd(_csrfToken);
    next();
}


module.exports = { usersAuth, authorize, tokenSubmit };