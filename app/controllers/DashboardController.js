
const Authen = require("../Authen");
const Func = require("../Func");

const { validationResult } = require("express-validator");
const path = require('path');

const controllerName = path.parse(__filename).name;

exports.show = async function (req, res, next) {

  try {

    const dataUse = Authen.getSession(req);

    const data = {
      use: dataUse,
      controllerName: controllerName,
      translat: Func.getLanguage(dataUse?.language)
    };

    return res.render("Users/index", data);

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }

};

exports.modeupdate = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages);
    // return res.redirect('/user/demo');
    return res.send(errorMessages);
  }

  try {

    Authen.getSession(req);

    const darkmode = req.params.darkmode;

    req.session.theme = darkmode === 'true' ? 'sun' : 'moon';

    return res.status(200).send({
      theme: darkmode
    });
  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

exports.name = controllerName;