const {
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
  cache
} = require('../app/Func');

describe('Utility Functions Test', () => {

  // ทดสอบฟังก์ชัน isTrue ให้คืนค่าเป็น true เมื่อใส่สตริง "true"
  test('isTrue should return true for "true" string', () => {
    expect(isTrue('true')).toBe(true);
  });

  // ทดสอบฟังก์ชัน isTrue ให้คืนค่าเป็น false เมื่อใส่สตริง "false"
  test('isTrue should return false for "false" string', () => {
    expect(isTrue('false')).toBe(false);
  });

  // ทดสอบฟังก์ชัน makeId ให้คืนค่าความยาวของสตริงที่สร้างได้ตรงกับที่ระบุ
  test('makeId should return a string of correct length', () => {
    const length = 10;
    const id = makeId(length);
    expect(id).toHaveLength(length);  // ตรวจสอบว่า ID ที่ได้มีความยาว 10
  });

  // ทดสอบฟังก์ชัน getFormatDate ให้คืนค่าเป็นวันที่ในรูปแบบที่ถูกต้อง
  test('getFormatDate should return date in correct format', () => {
    const date = new Date('2024-03-30T15:14:56');
    expect(getFormatDate(date)).toBe('20240330151456'); // ตรวจสอบว่าเป็นวันที่ในรูปแบบ 'yyyyMMddHHmmss'
  });

  // ทดสอบฟังก์ชัน formatDateSave ให้คืนค่าเป็น ISO string ที่ตรงตามรูปแบบ
  test('formatDateSave should return ISO string', () => {
    const date = new Date('2024-03-30T15:14:56Z');
    expect(formatDateSave(date)).toBe('2024-03-30T15:14:56.000Z');  // ตรวจสอบรูปแบบ ISO 8601
  });

  // ทดสอบฟังก์ชัน getYearFromDate ให้คืนค่าเป็นปีจากวันที่ที่ระบุ
  test('getYearFromDate should return correct year', () => {
    const date = new Date('2024-03-30');
    expect(getYearFromDate(date)).toBe('2024');  // ตรวจสอบว่าเป็นปี 2024
  });

  // ทดสอบฟังก์ชัน timeConverter ให้คืนค่าที่อ่านได้ง่ายจาก timestamp
  test('timeConverter should return human-readable date', () => {
    const timestamp = 1711786496000; // 2024-03-30T15:14:56Z
    expect(timeConverter(timestamp)).toBe('30 Mar 2024 15:14:56');  // ตรวจสอบวันที่ที่อ่านง่าย
  });

  // ทดสอบฟังก์ชัน formatDateThai ให้คืนค่ารูปแบบวันที่ในภาษาไทย
  test('formatDateThai should return Thai date format', () => {
    expect(formatDateThai('2024-03-30')).toBe('30 มีนาคม 2024');  // ตรวจสอบวันที่ในภาษาไทย
  });

  // ทดสอบฟังก์ชัน formatDateTimeThai ให้คืนค่ารูปแบบวันที่และเวลาในภาษาไทย
  test('formatDateTimeThai should return Thai date-time format', () => {
    expect(formatDateTimeThai('2024-03-30T15:14:56')).toBe('30 มีนาคม 2024 15:14:56');  // ตรวจสอบวันที่และเวลา
  });

  // ทดสอบฟังก์ชัน getLanguage ให้คืนค่าภาษาและคำแปลที่ถูกต้อง
  test('getLanguage should return correct translations', () => {
    expect(getLanguage('en')).toBe(require('../app/translations/translations-en'));  // ตรวจสอบการแปลภาษา
  });

  // ทดสอบฟังก์ชัน generateKeyAndIV ให้คืนค่า key และ iv ที่มีความยาวถูกต้อง
  test('generateKeyAndIV should return key and iv', () => {
    const { key, iv } = generateKeyAndIV();
    expect(key).toHaveLength(64);  // ตรวจสอบความยาวของ key
    expect(iv).toHaveLength(32);   // ตรวจสอบความยาวของ iv
  });

  // ทดสอบฟังก์ชัน encryptText และ decryptText ให้ทำงานได้ถูกต้อง
  test('encryptText and decryptText should work correctly', () => {
    const text = 'Hello, World!';
    const encrypted = encryptText(text);  // เข้ารหัสข้อความ
    const decrypted = decryptText(encrypted);  // ถอดรหัสข้อความ
    expect(decrypted).toBe(text);  // ตรวจสอบว่าเดิมเป็นข้อความเดิมหรือไม่
  });

  // ทดสอบฟังก์ชัน getAgentClient ให้สามารถแยกข้อมูลจาก user-agent ได้
  test('getAgentClient should parse user-agent', () => {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    const result = getAgentClient(userAgent);  // แยกข้อมูลจาก user-agent
    expect(result.platform).toBe('desktop');  // ตรวจสอบว่าเป็น desktop หรือไม่
  });
});

describe('Cache Functions Test', () => {

  beforeEach(() => {
    cache.flushAll(); // ล้างแคชก่อนการทดสอบ
  });

  
  // ทดสอบว่า setCache สามารถบันทึกข้อมูลลงแคชได้
  test('setCache should successfully set data to cache', () => {
    const key = 'testKey';
    const value = 'sample data';

    // ทดสอบว่า setCache สามารถบันทึกข้อมูลลงแคชได้
    const success = setCache(key, value);

    // ตรวจสอบว่าแคชมีข้อมูลที่บันทึกไว้
    const cachedData = cache.get(key);

    expect(success).toBe(true);  // ฟังก์ชัน setCache ต้องคืนค่า true
    expect(cachedData).toBe(value);  // ข้อมูลในแคชต้องตรงกับข้อมูลที่บันทึก
  });

  // ทดสอบว่า getCache จะคืนค่าข้อมูลจากแคชหากแคชมีข้อมูลแล้ว
  test('getCache should return cached data when cache has data', async () => {
    const key = 'testKey';
    const cachedValue = 'cached data';
    const fetchFunction = jest.fn().mockResolvedValue('fetched data');

    // บันทึกข้อมูลลงแคชก่อน
    setCache(key, cachedValue);

    // ทดสอบ getCache โดยให้แคชมีข้อมูลแล้ว
    const result = await getCache(key, fetchFunction);

    // ตรวจสอบว่าแคชมีข้อมูลแล้ว และไม่เรียกฟังก์ชัน fetchFunction
    expect(result).toBe(cachedValue);  // ข้อมูลที่คืนต้องเป็นข้อมูลที่บันทึกในแคช
    expect(fetchFunction).not.toHaveBeenCalled();  // ฟังก์ชัน fetchFunction ต้องไม่ถูกเรียก
  });

   // ทดสอบว่า getCache จะดึงข้อมูลใหม่และบันทึกลงแคชเมื่อแคชไม่มีข้อมูล
  test('getCache should fetch and cache new data if not present in cache', async () => {
    const key = 'testKey';
    const fetchedValue = 'fetched data';
    const fetchFunction = jest.fn().mockResolvedValue(fetchedValue);

    // ทดสอบ getCache เมื่อไม่มีข้อมูลในแคช
    const result = await getCache(key, fetchFunction);

    // ตรวจสอบว่าข้อมูลใหม่ถูกดึงมาและบันทึกลงแคช
    expect(result).toBe(fetchedValue);  // ข้อมูลที่คืนต้องเป็นข้อมูลที่ถูกดึงมา
    expect(fetchFunction).toHaveBeenCalled();  // ฟังก์ชัน fetchFunction ต้องถูกเรียก
    expect(cache.get(key)).toBe(fetchedValue);  // ข้อมูลที่บันทึกลงแคชต้องเป็นข้อมูลที่ถูกดึงมา
  });
});