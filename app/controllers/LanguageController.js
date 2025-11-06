// Filename: LanguageController.js 
// Created time: 10-04-2024 23:14:44

const Storetokens = require("../Storetokens");
const Authen = require("../Authen");
const Func = require("../Func");

const translationsen_en = require('@app/translations/translations-en');
const translationsen_th = require('@app/translations/translations-th');

const { validationResult } = require("express-validator");
const path = require('path');
const fs = require('fs');

const controllerName = path.parse(__filename).name;

// index แสดงข้อมูลทั้งหมด
// router.get('/user/demo', usersAuth, DemoController.index);
exports.index = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    return res.send("index");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// show แสดงข้อมูลด้วยคีย์
// router.get('/user/demo/:_id/show', usersAuth, DemoController.show);
exports.show = async function (req, res, next) {
  try {

    const language = req.params._id;

    switch (language) {
      case 'en':
        // โหลดไฟล์แปลภาษาอังกฤษใน plugins
        const enTranslations = await loadTranslationPlugin('en', req.session.currentPlugin);
        return res.send({
          ...enTranslations, // โหลดไฟล์แปลภาษาหลักของ Core ระบบก่อน เพื่อไม่ให้ใช้ชื่อเดียวกันใน plugins
          ...translationsen_en,
        });
      case 'th':
        // โหลดไฟล์แปลภาษาไทยใน plugins
        const thTranslations = await loadTranslationPlugin('th', req.session.currentPlugin);
        return res.send({
          ...thTranslations, // โหลดไฟล์แปลภาษาหลักของ Core ระบบก่อน เพื่อไม่ให้ใช้ชื่อเดียวกันใน plugins
          ...translationsen_th,
        });
      default:
        return res.send(translationsen_th);
    }

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// create บันทึกข้อมูล (แสดงหน้ากรอกข้อมูล)
// router.get('/user/demo/create', usersAuth, DemoController.create);
exports.create = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    return res.send("create");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// store บันทึกข้อมูล
// router.post('/user/demo/store', usersAuth, tokenSubmit, DemoController.store);
exports.store = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages);
    // return res.redirect('/user/demo');
    return res.send(errorMessages);
  }

  try {

    const dataUse = Authen.getSession(req);

    return res.send("store");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// edit  แก้ไขข้อมูล (แสดงหน้ากรอกข้อมูล)
// router.get('/user/demo/:_id/edit', usersAuth, DemoController.edit);
exports.edit = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    return res.send("edit");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// update แก้ไขข้อมูล
// router.post('/user/demo/update', usersAuth, tokenSubmit, DemoController.update);
exports.update = async function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages);
    // return res.redirect('/user/demo');
    return res.send(errorMessages);
  }

  try {

    // const dataUse = Authen.getSession(req);

    // 1. ตรวจสอบและทำความสะอาดค่า language parameter
    const language = req.params.language;

    // อนุญาตเฉพาะค่าภาษาที่กำหนดไว้ล่วงหน้า (whitelist)
    const allowedLanguages = ['en', 'th']; // ตัวอย่างภาษาที่อนุญาต

    // แปลงเป็นตัวพิมพ์เล็กและตรวจสอบ
    const normalizedLanguage = language.toLowerCase();

    if (!allowedLanguages.includes(normalizedLanguage)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid language parameter'
      });
    }

    // 2. ตั้งค่าภาษาใน session
    req.session.language = normalizedLanguage;

    // 3. ตอบกลับอย่างปลอดภัย (ป้องกัน XSS)
    return res.json({
      status: true,
      language: normalizedLanguage,
      message: 'Language updated successfully'
    });
  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

// delete ลบข้อมูล
// router.get('/user/demo/:_id/destroy', usersAuth, DemoController.destroy);
exports.destroy = async function (req, res, next) {
  try {

    const dataUse = Authen.getSession(req);

    return res.send("destroy");

  } catch ({ name, message }) {
    res.status(500).json({
      status: false,
      message: message,
    });
  }
};

/**
 * โหลดการแปลภาษาจากปลั๊กอินต่างๆ
 * @param {string} lang - รหัสภาษาที่ต้องการโหลด (ค่าเริ่มต้นคือภาษาไทย)
 * @param {string|null} currentPlugin - ชื่อปลั๊กอินปัจจุบัน (ถ้ามี) ที่ควรมีความสำคัญสูงสุด
 * @returns {Object} อ็อบเจ็กต์ที่รวมการแปลจากทุกปลั๊กอิน
 */
function loadTranslationPlugin(lang = 'th', currentPlugin = null) {
  // สร้างอ็อบเจ็กต์เปล่าสำหรับเก็บการแปลที่รวบรวมจากปลั๊กอินทั้งหมด
  const mergedTranslations = {};
  // กำหนดเส้นทางไปยังไดเรกทอรีที่เก็บปลั๊กอินทั้งหมด
  const pluginsDir = path.join(__dirname, '../../plugins');

  try {
    // ดึงรายชื่อไดเรกทอรีทั้งหมดในโฟลเดอร์ปลั๊กอิน
    const allDirs = fs.readdirSync(pluginsDir).filter(dir => {
      const pluginPath = path.join(pluginsDir, dir);
      // กรองเฉพาะรายการที่เป็นไดเรกทอรี ไม่ใช่ไฟล์
      return fs.statSync(pluginPath).isDirectory();
    });

    // กรองเฉพาะปลั๊กอินที่มีไฟล์ menu.json และมีไฟล์การแปลภาษาที่ต้องการ
    let pluginDirs = allDirs.filter(dir => {
      const pluginPath = path.join(pluginsDir, dir);
      const menuJsonPath = path.join(pluginPath, 'menu.json');

      // ตรวจสอบว่ามีไฟล์ menu.json หรือไม่
      if (!fs.existsSync(menuJsonPath)) return false;

      try {
        // อ่านและแปลงข้อมูล menu.json เป็นอ็อบเจ็กต์
        const menuJson = JSON.parse(fs.readFileSync(menuJsonPath, 'utf8'));
        // ตรวจสอบว่ามีการกำหนดค่า title หรือไม่
        if (!menuJson.title) return false;

        // ตรวจสอบว่ามีไฟล์การแปลภาษาสำหรับภาษาที่ต้องการหรือไม่
        const translationsDir = path.join(pluginPath, 'translations');
        const translationFile = `translations-${lang}.js`;
        return fs.existsSync(path.join(translationsDir, translationFile));
      } catch (e) {
        // หากเกิดข้อผิดพลาดในการอ่านหรือแปลงข้อมูล ไม่นับเป็นปลั๊กอินที่ถูกต้อง
        return false;
      }
    });

    // ประมวลผลแต่ละปลั๊กอินที่ผ่านการกรองเพื่อรวบรวมการแปลชื่อเมนู
    for (const pluginDir of pluginDirs) {
      const pluginPath = path.join(pluginsDir, pluginDir);
      const menuJsonPath = path.join(pluginPath, 'menu.json');

      try {
        // อ่านไฟล์ menu.json เพื่อดึงคีย์ของชื่อเมนู
        const menuJson = JSON.parse(fs.readFileSync(menuJsonPath, 'utf8'));
        const titleKey = menuJson.title;

        // โหลดไฟล์การแปลภาษาและดึงค่าการแปลของชื่อเมนู
        const translationsDir = path.join(pluginPath, 'translations');
        const translationFile = `translations-${lang}.js`;
        const translationFilePath = path.join(translationsDir, translationFile);

        const translations = require(translationFilePath);
        // หากมีการแปลสำหรับคีย์ชื่อเมนู ให้เพิ่มลงในอ็อบเจ็กต์รวม
        if (translations[titleKey]) {
          mergedTranslations[titleKey] = translations[titleKey];
        }
      } catch (e) {
        // บันทึกข้อผิดพลาดหากไม่สามารถโหลดการแปลชื่อเมนูได้
        console.error(`Error loading title translation for ${pluginDir}:`, e.message);
      }
    }

    // จัดเรียงปลั๊กอิน โดยให้ความสำคัญกับปลั๊กอินปัจจุบัน (ถ้ามี)
    if (currentPlugin) {
      pluginDirs = [
        // วางปลั๊กอินปัจจุบันไว้ที่ตำแหน่งแรก
        ...pluginDirs.filter(plugin => plugin === currentPlugin),
        // ตามด้วยปลั๊กอินอื่นๆ ที่ไม่ใช่ปลั๊กอินปัจจุบัน
        ...pluginDirs.filter(plugin => plugin !== currentPlugin)
      ];
    }

    // โหลดการแปลทั้งหมดจากปลั๊กอิน ตามลำดับความสำคัญที่กำหนด
    for (const pluginDir of pluginDirs) {
      const translationFilePath = path.join(
        pluginsDir,
        pluginDir,
        'translations',
        `translations-${lang}.js`
      );

      // ตรวจสอบว่าไฟล์การแปลภาษามีอยู่จริง
      if (fs.existsSync(translationFilePath)) {
        try {
          // ล้างแคชเพื่อให้แน่ใจว่าได้ข้อมูลการแปลล่าสุด
          delete require.cache[require.resolve(translationFilePath)];
          const translations = require(translationFilePath);

          // ผสานการแปล โดยข้ามคีย์ที่ซ้ำกัน (เก็บค่าแรกที่พบเท่านั้น)
          Object.entries(translations).forEach(([key, value]) => {
            if (!mergedTranslations.hasOwnProperty(key)) {
              mergedTranslations[key] = value;
            } else {
              // ข้ามคีย์ที่ซ้ำกัน (ปิดการแสดงผล log ไว้)
              // console.log(`Skipping duplicate key: ${key} from ${pluginDir}`);
            }
          });
        } catch (e) {
          // บันทึกข้อผิดพลาดหากไม่สามารถโหลดการแปลได้
          console.error(`Error loading translations for ${pluginDir}:`, e.message);
        }
      }
    }

    // ส่งคืนอ็อบเจ็กต์ที่รวมการแปลทั้งหมด
    return mergedTranslations;
  } catch (e) {
    // จัดการข้อผิดพลาดหลักและส่งคืนอ็อบเจ็กต์ว่าง
    console.error('Error loading translations:', e.message);
    return {};
  }
}

exports.name = controllerName;