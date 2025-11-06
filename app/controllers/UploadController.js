const Func = require("../Func");
const Authen = require("../Authen");

const path = require('path');

const controllerName = path.parse(__filename).name;

// image Upload
exports.imageupload = async function (req, res, next) {
    try {

        const dataUse = Authen.getSession(req);
        const uid = dataUse?.User_id.toString();

        const validMimeTypes = ["image/jpg", "image/png", "image/jpeg"];

        const defaultPath = 'app-assets/images/profile/user-uploads/';
        const filePath = req.body.filePath || defaultPath; // ใช้ค่าจาก req.body หรือค่าเริ่มต้น

        const fileResponse = await Func.uploadFile(req, 'file', uid, validMimeTypes, filePath);

        return res.status(200).json(fileResponse);
    } catch ({ name, message }) {
        res.status(500).json({
            status: false,
            message: message,
        });
    }
};

exports.name = controllerName;