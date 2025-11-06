const T_Users = require("./Models/T_Users");
const T_Company = require("./Models/T_Company");

getSession = function getSession(req) {

    let DataSession = {
        loggedin: req.session.loggedin,
        User_id: req.session.User_id,
        firstname: req.session.firstname,
        lastname: req.session.lastname,
        username: req.session.username,
        mail: req.session.mail,
        phone: req.session.phone,
        Company_id: req.session.Company_id,
        Employee_id: req.session.Employee_id,
        websiteTitle: req.session.websiteTitle,
        websiteLogo: req.session.websiteLogo,
        profile: req.session.profile,
        Usersrole_id: req.session.Usersrole_id,
        priority: req.session.priority,
        description: req.session.description,
        tfa: req.session.tfa,
        tfaactive: req.session.tfaactive,
        signinaccount: req.session.signinaccount,
        changepassword: req.session.changepassword,
        language: req.session.language,
        theme: req.session.theme,
        active: req.session.active,
        permission: req.session.permission || {},
    };

    return DataSession
}

updateSession = async function updateSession(req) {
    // เรียกใช้เพื่ออัปเดท session ในกรณีที่ต้องการข้อมูลล่าสุดไปใช้งาน
    // เรียกใช้ก่อน getSession()

    try {

        const Users = new T_Users();
        const Company = new T_Company();

        const dataUse = await Users.getUserByUsername(req.session.username);

        const imageProfile = (dataUse?.TM_Usersrole?.priority == 2 ? dataUse?.T_Company?.profile : dataUse?.T_Employee?.profile);

        let websiteTitle = process.env.WEBSITENAME;
        let websiteLogo = undefined;
        let companyId = undefined;
        switch (dataUse?.TM_Usersrole?.priority) {
            case 1: // SuperAdmin
                websiteTitle = process.env.WEBSITENAME;
                break;
            case 2: // Company
                websiteTitle = dataUse?.T_Company?.name;
                websiteLogo = dataUse?.T_Company?.profile;
                companyId = dataUse?.T_Company?.Company_id;
                break;
            default: // Users
                const companyDetail = await Company.getCompanyById(dataUse?.T_Employee?.Company_id);
                websiteTitle = companyDetail?.name;
                websiteLogo = companyDetail?.profile;
                companyId = dataUse?.T_Employee?.Company_id;
        }

        if (dataUse) {
            req.session.firstname = dataUse?.firstname;
            req.session.lastname = dataUse?.lastname;
            req.session.username = dataUse?.username;
            req.session.mail = dataUse?.mail;
            req.session.phone = dataUse?.phone;
            req.session.Company_id = companyId;
            req.session.Employee_id = dataUse?.T_Employee?.Employee_id;
            req.session.websiteTitle = websiteTitle;
            req.session.websiteLogo = websiteLogo;
            req.session.profile = imageProfile;
            req.session.Usersrole_id = dataUse?.TM_Usersrole?.Usersrole_id;
            req.session.priority = dataUse?.TM_Usersrole?.priority;
            req.session.description = dataUse?.TM_Usersrole?.description;
            req.session.tfa = dataUse?.T_Twofactor?.Twofactor_id;
            req.session.tfaactive = dataUse?.T_Twofactor?.active;
            req.session.signinaccount = dataUse?.T_Twofactor?.signinaccount;
            req.session.changepassword = dataUse?.T_Twofactor?.changepassword;
            req.session.active = dataUse?.active;

            return true;
        }

        return false;
    } catch ({ name, message }) {
        throw new Error("Session Update Failed. Please verify your database connection.");
    }
}

getComname = function getComname(req) {
    return req.cookies.Comname;
}

setComname = function setComname(res, Comname) {
    return res.cookie('Comname', Comname);
}

getDbname = function getDbname(req) {
    return req.cookies.Dbname;
}

setDbname = function setDbname(res, Dbname) {
    return res.cookie('Dbname', Dbname);
}

module.exports = {
    getSession, updateSession, getComname, setComname, getDbname, setDbname
}