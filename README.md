## HTTP Method REST API
```bash
GET     — R(etrieve)  เรียกดูข้อมูล
POST    — C(reate)    เพิ่มข้อมูล
PUT     — U(pdate)    แก้ไขข้อมูล
DELETE  — D(elete)    ลบข้อมูล
```

## วิธีติดตั้งโปรเจค

```bash
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
git clone https://github.com/STP5940/nodejs-plugins.git
```

## ติดตั้ง package ที่จำเป็นในโปรเจค และตั้งค่า config

```bash
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
$ cd nodejs-plugins
```

```bash
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
$ npm install
```

```bash
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
$ copy .env.example .env
```

## ตัวอย่างการตั้งค่าไฟล์ .env (sqlserver)

```bash
DB_HOST=127.0.0.1
DB_PORT=1433
DB_DATABASE=databasename
DB_USERNAME=SA
DB_PASSWORD=p@ssword
MY_SECRET_KEY=MY_SECRET_KEY
SALTROUNDS=13
LANGUAGE=th
PORT=3000

WEBSITENAME=WEBSITENAME
SECURITY_KEY=
SECURITY_IV=

CLIENT_ID=
CLIENT_SECRET=

SESSION_REDIS=false
REDIS_HOST=localhost
REDIS_PORT=6379

DEBUG=true

DATABASE_URL=sqlserver://${DB_HOST}:${DB_PORT};database=${DB_DATABASE};user=${DB_USERNAME};password=${DB_PASSWORD};trustServerCertificate=true
```

## ติดตั้ง Prisma CLI

```bash
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
$ npm install prisma -g
```

## สร้าง structure ฐานข้อมูล และใส่ข้อมูลตัวอย่าง

- *** ใช้ฐานข้อมูล ในเครื่องตัวเอง

```bash
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
$ npx prisma migrate reset
$ npx prisma migrate dev --name init
```

```bash
# Table: T_Users
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
$ npm run seed
```

- คำสั่งอื่นๆ

```bash
# เรียกใช้ Prisma Studio เพื่อใช้แก้ไขข้อมูลในฐานข้อมูล
$ npx prisma studio
```

```bash
# สร้างไฟล์มิกเรตใหม่ อัปเดตฐานข้อมูล
$ npx prisma migrate dev
```

```bash
# init คือชื่อของการ migrate ตัวอย่าง
$ npx prisma migrate dev --name create_signinlogs_table
```

## Unit Test (JEST)

```bash
# ทดสอบการทำงานของฟังก์ชั่น Unit Test
$ npm run test
```

## ใช้ Redis ในการจัดการ session

- แก้ไขไฟล์ .env เพื่อเปิดใช้งานการเก็บ session ลง Redis

```bash
# true เปิดการใช้งาน, false ปิดการใช้งาน
SESSION_REDIS=false
```

## ทดสอบใช้งาน Redis

- ติดตั้ง [microsoftarchive/redis](https://github.com/microsoftarchive/redis/releases)

```bash
$ redis-cli
```

```bash
# ล้างข้อมูลทั้งหมด
$ redis-cli FLUSHALL
```

```bash
# ดึงข้อมูลทั้งหมด
$ redis-cli KEYS *
```

```bash
# ดึงรายการ token ที่ยังไม่ถูกใช้งาน
$ redis-cli SMEMBERS makedTokens
```

```bash
# ดึงรายการ token ที่ถูกใช้งานแล้ว
$ redis-cli SMEMBERS usedTokens
```

```bash
# ใช้คำสั่ง ping เพื่อทดสอบการทำงานของ redis
127.0.0.1:6379> ping
PONG
```

## เครื่องมือในการจัดการ Redis UI

[AnotherRedis Desktop Manager](https://github.com/qishibo/AnotherRedisDesktopManager/releases)

## เริ่มการทำงานโปรแกรม

```bash
$ npm start
```

- เข้าสู่ระบบ [localhost:3000/login](http://localhost:3000/login)

```bash
# Administrator
USERNAME: root
PASSWORD: root
```

```bash
2FA-Secret-key: MNVXXGNT2FUXXEQUGIKXWAO5KUMR4AB3
```

## ติดตั้ง Extensions Visual Studio Code

- ติดตั้ง EJS Beautify
- Press Ctrl+Shift+P
- Format Document With...
- Configure Default Formatter...

## ตั้งค่าข้อความระบบเปลี่ยนภาษา

- ต้องกำหนดให้ 2 ไฟล์ให้มี Key เหมือนกัน

```bash
# ภาษาไทย
./app/translations/translations-th.js
# ภาษาอังกฤษ
./app/translations/translations-en.js
```

```bash
# Example
<!-- เปลี่ยนภาษา -->
<script src="/translations.js"></script>

<script>
    loadTranslations("<%= use.language || 'th' %>").then(() => {
      updateTranslations();
      updateTranslations_placeholder();
    });
</script>
<!-- สิ้นสุด เปลี่ยนภาษา -->
```

### สร้างไฟล์ Controller

```bash
$ node artisan -make:c Demo
```

### สร้างไฟล์ Models

```bash
$ node artisan -make:m TM_Demo
```

### สร้าง SECURITY_KEY และ SECURITY_IV

```bash
$ node artisan generatekey
```

### Deploy to production with pm2

- ไฟล์ ecosystem.config เลือก interpreter ที่ต้องการได้เลย node หรือ bun
- ถ้า Windows server ยังลง bun ไม่ได้ ให้ใช้ interpreter เป็น node

- เริ่มแอปพลิเคชันด้วย PM2 (production)

```bash
$ npm run deploy
```

- เริ่มแอปพลิเคชันด้วย PM2 (development)

```bash
# Dev: './dist'
$ pm2 start ecosystem.config.js
# OR Prod
$ pm2 start ecosystem.config.js --env production
```

- รีสตาร์ทแอปพลิเคชันด้วย PM2

```bash
# Dev: './dist'
$ pm2 restart WebServer
```

```bash
# Restart prod
$ pm2 restart CMMS-WebApp
# Save startup service
$ pm2 save
```

- แสดงโหมดการตรวจสอบแบบเรียลไทม์ของ PM2
```bash
$ pm2 monit
```