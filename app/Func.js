const fs = require('fs');
const path = require('path');
const moment = require("moment");
const crypto = require('crypto');
const UAParser = require('ua-parser-js');
const NodeCache = require("node-cache");

const translationsen_en = require('./translations/translations-en');
const translationsen_th = require('./translations/translations-th');

// กำหนดคีย์และ IV ในรูปแบบ Buffer
// สร้างผ่าน generateKeyAndIV();
const key = Buffer.from(process.env.SECURITY_KEY || '', 'hex');
const iv = Buffer.from(process.env.SECURITY_IV || '', 'hex');

// กำหนดระยะเวลาในการ cache ข้อมูล
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 }); // TTL = 1 วัน

/**
 * แปลงค่า string 'True' เป็น boolean
 *
 * @param {boolean} _Boolean - ข้อความที่ต้องการแปลง เช่น 'true' เป็น true
 * @returns {boolean} ค่าที่ถูกแปลงเป็น boolean
 */
const isTrue = function isTrue(_Boolean) {
  return (_Boolean?.toString()?.toUpperCase() === 'TRUE' ? true : false);
};

/**
 * สร้างสตริงสุ่มตามความยาวที่ระบุ
 *
 * @param {number} _length - ความยาวของสตริงที่ต้องการสร้าง
 * @returns {string} สตริงสุ่มที่สร้างขึ้น
 */
const makeId = function makeId(_length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (var i = 0; i < _length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

/**
 * คืนค่าวันที่ในรูปแบบที่ระบุ
 *
 * @param {Date|string} [date=new Date()] - วันที่ที่ต้องการฟอร์แมต (ถ้าไม่ส่งมาจะใช้วันที่ปัจจุบัน)
 * @param {string} [_format="YYYYMMDDHHmmss"] - รูปแบบของวันที่ที่ต้องการ (ค่าเริ่มต้นคือ "YYYYMMDDHHmmss")
 * @returns {string} วันที่ในรูปแบบที่ระบุ
 */
const getFormatDate = function getFormatDate(date = new Date(), _format = "YYYYMMDDHHmmss") {
  const momentDate = moment(date);
  return momentDate.format(_format);
};

/**
 * แปลงวันที่และเวลาให้อยู่ในรูปแบบ ISO-8601
 *
 * @param {Date} _DateTime - วันที่และเวลาที่ต้องการแปลง
 * @returns {string} วันที่และเวลาในรูปแบบ ISO-8601
 */
const formatDateSave = function formatDateSave(_DateTime) {
  const formattedDateTime = _DateTime.toISOString(); // ใช้ฟังก์ชัน toISOString() เพื่อรับวันที่และเวลาในรูปแบบ ISO-8601

  return formattedDateTime;
};

/**
 * คืนค่าปีจากข้อมูลที่ระบุ
 *
 * @param {Date} _DateTime - วันที่และเวลาที่ต้องการดึงปี
 * @returns {string} ปีในรูปแบบ "YYYY"
 */
const getYearFromDate = function getYearFromDate(_DateTime) {
  const now = _DateTime;
  const dateStringWithTime = moment(now).format("YYYY");

  return dateStringWithTime;
};

/**
 * แปลง UNIX timestamp เป็นวันที่และเวลาที่อ่านได้ง่าย
 *
 * @param {number} _unixTimestamp - _unixTimestamp ที่ต้องการแปลง
 * @returns {string} เดือนในรูปแบบภาษาอังกฤษ
 *
 * @example
 * // ตัวอย่างการใช้งาน
 * timeConverter(new Date().getTime());
 * timeConverter(1688619561388);
 */
const timeConverter = function timeConverter(_unixTimestamp) {
  const date = new Date(_unixTimestamp);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hour = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();

  return `${day} ${month} ${year} ${hour}:${min}:${sec}`;
};

/**
 * แปลงสตริงวันที่เป็นรูปแบบวันที่ในภาษาไทย
 *
 * @param {string} _dateStr - สตริงวันที่ ที่ต้องการแปลง
 * @param {boolean} [_short=false] - กำหนดว่าจะแสดงชื่อเดือนแบบย่อหรือไม่ (ค่าเริ่มต้นคือแบบเต็ม)
 * @returns {string} รูปแบบเดือนในภาษาไทย
 */
const formatDateThai = function formatDateThai(_dateStr, _short = false) {
  const date = new Date(_dateStr);

  const monthNamesThai = [
    ["มกราคม", "ม.ค."],
    ["กุมภาพันธ์", "ก.พ."],
    ["มีนาคม", "มี.ค."],
    ["เมษายน", "เม.ย."],
    ["พฤษภาคม", "พ.ค."],
    ["มิถุนายน", "มิ.ย."],
    ["กรกฎาคม", "ก.ค."],
    ["สิงหาคม", "ส.ค."],
    ["กันยายน", "ก.ย."],
    ["ตุลาคม", "ต.ค."],
    ["พฤศจิกายน", "พ.ย."],
    ["ธันวาคม", "ธ.ค."],
  ];

  const day = date.getDate();
  const month = monthNamesThai[date.getMonth()][_short ? 1 : 0];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * แปลงสตริงวันที่เป็นรูปแบบวันที่และเวลาในภาษาไทย
 *
 * @param {string} _dateStr - สตริงวันที่ ที่ต้องการแปลง
 * @param {boolean} [_short=false] - กำหนดว่าจะแสดงชื่อเดือนแบบย่อหรือไม่ (ค่าเริ่มต้นคือแบบเต็ม)
 * @returns {string} เดือนในภาษาไทยแบบย่อ หรือแบบเต็ม
 */
const formatDateTimeThai = function formatDateTimeThai(_dateStr, _short = false) {
  const date = new Date(_dateStr);

  const monthNamesThai = [
    ["มกราคม", "ม.ค."],
    ["กุมภาพันธ์", "ก.พ."],
    ["มีนาคม", "มี.ค."],
    ["เมษายน", "เม.ย."],
    ["พฤษภาคม", "พ.ค."],
    ["มิถุนายน", "มิ.ย."],
    ["กรกฎาคม", "ก.ค."],
    ["สิงหาคม", "ส.ค."],
    ["กันยายน", "ก.ย."],
    ["ตุลาคม", "ต.ค."],
    ["พฤศจิกายน", "พ.ย."],
    ["ธันวาคม", "ธ.ค."],
  ];

  const day = date.getDate();
  const month = monthNamesThai[date.getMonth()][_short ? 1 : 0];
  const year = date.getFullYear();
  const hour = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();

  return `${day} ${month} ${year} ${hour}:${min}:${sec}`;
};

/**
 * คืนค่าการแปลภาษาตามที่ระบุ
 *
 * @param {string} _language - รหัสภาษาที่ต้องการ ('en' สำหรับภาษาอังกฤษ, 'th' สำหรับภาษาไทย)
 * @returns {Object} การแปลภาษาที่ตรงกับรหัสภาษาที่ระบุ
 */
const getLanguage = function getLanguage(_language) {
  let result;

  switch (_language) {
    case 'en':
      result = translationsen_en;
      break;
    case 'th':
      result = translationsen_th;
      break;
    default:
      result = translationsen_th;
      break;
  }

  return result;
};

/**
 * สร้าง key และ iv สุ่มสำหรับการเข้ารหัส AES-256
 * @returns {object} - วัตถุที่ประกอบด้วย key และ iv
 */
const generateKeyAndIV = function generateKeyAndIV() {
  const key = crypto.randomBytes(32)?.toString('hex'); // สร้าง key 32 bytes = 256 bits
  const iv = crypto.randomBytes(16)?.toString('hex'); // สร้าง IV สุ่มขนาด 16 bytes = 128 bits

  return { key, iv };
}

/**
 * เข้ารหัสข้อความโดยใช้วิธีการ AES-256-CBC
 *
 * @param {string} _text - ข้อความที่ต้องการเข้ารหัส
 * @returns {string} ข้อความที่เข้ารหัสแล้วในรูปแบบ hex
 */
const encryptText = function encryptText(_encryptText) {
  // const key = process.env.MY_SECRET_KEY;

  // Check Text is empty
  if (!_encryptText) {
    // console.error('Text to encrypt is empty');
    return undefined;
  }

  // Validate key and IV
  if (!key || key.length !== 32) {
    throw new Error('Invalid encryption key: must be 32 bytes');
  }
  if (!iv || iv.length !== 16) {
    throw new Error('Invalid IV: must be 16 bytes');
  }

  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(_encryptText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // คืนค่า IV พร้อมกับข้อความที่ถูกเข้ารหัส
    return encrypted;
  } catch (error) {
    console.error('Encryption failed');
    // console.error('Encryption failed:', error);
    return undefined;
  }
}

/**
 * ถอดรหัสข้อความที่ถูกเข้ารหัสด้วยวิธีการ AES-256-CBC
 *
 * @param {string} _encryptedText - ข้อความที่เข้ารหัสแล้วในรูปแบบ hex
 * @returns {string} ข้อความที่ถูกถอดรหัส
 */
const decryptText = function decryptText(_encryptedText) {
  // Check Text is empty
  if (!_encryptedText) {
    // console.error('Text to decrypt is empty');
    return undefined;
  }

  // Validate key and IV
  if (!key || key.length !== 32) {
    throw new Error('Invalid encryption key: must be 32 bytes');
  }
  if (!iv || iv.length !== 16) {
    throw new Error('Invalid IV: must be 16 bytes');
  }

  // ลองถอดรหัสข้อความ
  try {
    // สร้าง Decipher ด้วย key และ IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(_encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed');
    // console.error('Decryption failed:', error);
    return undefined;
  }
}

/**
 * ดึงข้อมูลเกี่ยวกับเครื่องผู้ใช้จากข้อมูล User-Agent ที่กำหนด
 *
 * @param {string} _dataAgent - ข้อมูล User-Agent ของเครื่องผู้ใช้
 * @returns {object} ข้อมูลเกี่ยวกับเครื่องผู้ใช้ที่ได้รับการวิเคราะห์
 */
const getAgentClient = function getAgentClient(_dataAgent) {

  const uaResult = new UAParser().setUA(_dataAgent)?.getResult();

  const browser = uaResult.browser.name?.toLowerCase();
  const browserVersion = uaResult.browser.version;

  const device = uaResult.os.name?.toLowerCase();
  const deviceVersion = uaResult.os.version;

  const mobileDeviceKeywords = ['android', 'avantgo', 'blackberry', 'bolt', 'boost', 'cricket', 'docomo', 'fone', 'hiptop', 'mini', 'mobi', 'palm', 'phone', 'pie', 'tablet', 'up.browser', 'up.link', 'webos', 'wos'];
  const regex = new RegExp(`(${mobileDeviceKeywords.join('|')})`, 'i');

  return {
    browser: browser,
    browserVersion: browserVersion,
    device: device,
    deviceVersion: deviceVersion,
    platform: regex.test(_dataAgent) ? 'mobile' : 'desktop',
  };
}


/**
 * อัปโหลดไฟล์และคืนค่าข้อมูลไฟล์ที่อัปโหลด
 * 
 * @param {Object} req - คำขอจาก client ที่มีข้อมูลไฟล์
 * @param {string} _tagFilename - คีย์หรือแท็กของไฟล์ในอ็อบเจ็กต์คำขอ
 * @param {string} _keyUpload - รหัสผู้ใช้หรือคีย์อ้างอิงผู้ที่ทำการอัปโหลด
 * @param {string[]} validMimeTypes - ชนิดของไฟล์ที่อนุญาตให้อัปโหลด
 * @param {string} _filePath - ที่อยู่เส้นทางที่ต้องการบันทึกไฟล์ (ค่าเริ่มต้นคือ Folder public)
 * @returns {Promise<Object>} ข้อมูลของไฟล์ที่อัปโหลด
 * @throws {Error} ถ้าไฟล์ไม่พบหรือชนิดของไฟล์ไม่ถูกต้อง
 */
const uploadFile = async function uploadFile(req, _tagFilename, _keyUpload, validMimeTypes, _filePath = '/') {
  // 1. ตรวจสอบพารามิเตอร์พื้นฐาน
  if (!req.files || !req.files[_tagFilename]) {
    return {
      status: false,
      message: "File Not Found",
    };
  }

  const uploadedFile = req.files[_tagFilename];
  const { size, encoding, mimetype, name: originalname } = uploadedFile;

  // 2. ตรวจสอบ MIME type
  if (!validMimeTypes.includes(mimetype)) {
    throw new Error("Invalid file type");
  }

  // 3. ตรวจสอบขนาดไฟล์ (จำกัดที่ 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds limit");
  }

  // 4. ทำความสะอาดชื่อไฟล์และ path แบบเข้มงวด (ปรับปรุงใหม่)
  const sanitizeInput = (input, isPath = false) => {
    if (typeof input !== 'string') return '';

    // สำหรับ path อนุญาตให้มี / แต่ป้องกัน traversal
    if (isPath) {
      return input
        .replace(/\.\.\//g, '') // ลบ ../
        .replace(/\.\.\\/g, '') // ลบ ..\
        .replace(/[^a-zA-Z0-9-_./]/g, ''); // อนุญาตเฉพาะอักขระปลอดภัยและ /
    }
    // สำหรับชื่อไฟล์ ให้แทนที่ / ด้วย _
    else {
      return input
        .replace(/\.\./g, '')
        .replace(/[\/\\]/g, '_')
        .replace(/[^a-zA-Z0-9-_.]/g, '');
    }
  };

  // ใช้ isPath: true สำหรับ filePath
  const sanitizedFilePath = sanitizeInput(_filePath, true);
  // isPath: false (default) สำหรับชื่อไฟล์
  const sanitizedOriginalName = sanitizeInput(originalname);

  // 5. สร้างชื่อไฟล์แบบสุ่มและปลอดภัย
  const fileExt = path.extname(sanitizedOriginalName).toLowerCase();
  const randomId = this.makeId(5).substring(0, 8);
  const filename = `${_keyUpload}_${randomId}${fileExt}`;

  // 6. สร้าง path ปลายทางอย่างปลอดภัย
  const baseDir = path.resolve('public');

  // ตรวจสอบและสร้าง directory ปลายทาง
  const fullDirPath = path.join(baseDir, sanitizedFilePath);

  // ตรวจสอบว่า path ไม่พยายามออกนอก base directory
  if (!fullDirPath.startsWith(baseDir)) {
    throw new Error("Invalid file path");
  }

  // สร้าง directory ถ้ายังไม่มี
  if (!fs.existsSync(fullDirPath)) {
    fs.mkdirSync(fullDirPath, { recursive: true });

    // ตั้งค่า permission เฉพาะบนระบบที่ไม่ใช่ Windows
    if (process.platform !== 'win32') {
      fs.chmodSync(fullDirPath, 0o755); // rwxr-xr-x
    }
  }

  // 7. สร้าง path สำหรับไฟล์และตรวจสอบอีกครั้ง
  const uploadPath = path.join(fullDirPath, filename);

  // ตรวจสอบซ้ำว่า path ยังอยู่ใน directory ที่อนุญาต
  if (!uploadPath.startsWith(baseDir)) {
    throw new Error("Invalid file path");
  }

  // 8. ย้ายไฟล์
  try {
    await uploadedFile.mv(uploadPath);
  } catch (err) {
    throw new Error(`File upload failed: ${err.message}`);
  }

  // ตั้งค่า permission ที่ปลอดภัย
  // เฉพาะบนระบบที่ไม่ใช่ Windows
  if (process.platform !== 'win32') {
    fs.chmodSync(uploadPath, 0o644);
  }

  // 9. สร้าง URL path ที่ปลอดภัย
  const safePath = path.join(sanitizedFilePath, filename).replace(/\\/g, '/');

  return {
    status: true,
    message: "Upload file success",
    fieldname: "file",
    originalname: sanitizedOriginalName,
    encoding,
    mimetype,
    filename,
    destination: `/${sanitizedFilePath}`,
    path: `/${safePath}`,
    size,
  };
};

/**
 * ดึงข้อมูลจากแคช ถ้าไม่มีข้อมูลในแคชจะเรียกใช้ฟังก์ชันดึงข้อมูลและบันทึกลงแคช
 *
 * @param {string} key - คีย์ที่ใช้ค้นหาในแคช
 * @param {Function} fetchFunction - ฟังก์ชันที่ใช้ในการดึงข้อมูลใหม่เมื่อไม่มีข้อมูลในแคช
 * @returns {Promise<any>} - ข้อมูลที่ได้จากแคชหรือจากฟังก์ชันดึงข้อมูล
 */
const getCache = async function getCache(key, fetchFunction) {
  const cachedData = cache.get(key);
  if (cachedData) {
    // console.log(`Cache hit: ${key}`);
    return Promise.resolve(cachedData);
  } else {
    // console.log(`Cache miss: ${key}`);
    return fetchFunction().then(data => {
      cache.set(key, data);
      return data;
    });
  }
}

/**
 * บันทึกข้อมูลลงในแคช
 *
 * @param {string} key - คีย์ที่ใช้ในการบันทึกข้อมูลในแคช
 * @param {any} value - ข้อมูลที่จะบันทึกลงในแคช
 * @returns {boolean} - คืนค่า `true` ถ้าบันทึกข้อมูลสำเร็จ, `false` ถ้าไม่สำเร็จ
 */
const setCache = function setCache(key, value) {
  const success = cache.set(key, value);
  if (success) {
    // console.log(`Data cached successfully: ${key}`);
  } else {
    console.error(`Failed to cache data: ${key}`);
  }
  return success;
}

/**
 * ลบข้อมูลออกจากแคชตาม key ที่กำหนด
 * @param {string|Array<string>} key - คีย์หรืออาร์เรย์ของคีย์ที่ต้องการลบออกจากแคช
 * @returns {number} - จำนวนข้อมูลที่ถูกลบออกจากแคช
 */
const deleteCache = function deleteCache(key) {
  return cache.del(key);
}

/**
 * ลบข้อมูลทั้งหมดออกจากแคช
 * @returns {void}
 */
const flushAllCache = function flushAllCache() {
  cache.flushAll();
}

module.exports = {
  isTrue,
  makeId,
  getFormatDate,
  formatDateSave,
  getYearFromDate,
  timeConverter,
  formatDateThai,
  formatDateTimeThai,
  getLanguage,
  generateKeyAndIV,
  encryptText,
  decryptText,
  getAgentClient,
  getCache,
  setCache,
  deleteCache,
  flushAllCache,
  uploadFile, // ยังไม่ได้เขียน test case

  cache,
};
