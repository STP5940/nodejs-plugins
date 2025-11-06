require('module-alias/register');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const uuid = require('uuid');
const rateLimit = require('express-rate-limit');
const requestIp = require('request-ip');

const LargeDataMiddleware = require('./app/LargeDataMiddleware');
const createLogger = require('./app/Winstonlogger');
const Storetokens = require("./app/Storetokens");

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');

const app = express();

// เชื่อ Nginx ที่ส่ง header X-Forwarded-For มา
app.set('trust proxy', 1);

// 413 Payload Too Large
// อนุญาติให้ส่งข้อมูลขนาดใหญ่เฉพาะบาง route ที่ต้องการ สูงสุด 99 MB
const largeDataMiddleware = new LargeDataMiddleware(app, '99mb');
largeDataMiddleware.apply([
    // รายการ URL ที่ให้ส่งข้อมูลขนาดใหญ่ได้
    // '/user/api/demo/store',
]);

// Rate limiter maximum of 800 requests per 1 hour per IP address
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 800,
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => {
        const pathsToSkip = [
            '/app-assets/',                 // app-assets เก็บข้อมูลไฟล์ .css และ .js
            '/assets/',                     // assets เก็บข้อมูลไฟล์ .css และ .js
            '/app-extensions/',             // Reuse Extensions
            '/app-scriptPage/',             // script ในแต่ละเพจ
            '/app-validateForm/',           // validate ข้อมูล
            '/user/language/th/show'        // แสดงภาษาปัจจุบัน
        ];

        const filesToSkip = [
            '/translations.js',             // ฟังก์ชั่นแปลภาษา
            '/sw.js'                        // Service Worker
        ];

        // Check if the request path starts with any of the pathsToSkip
        if (pathsToSkip.some(path => req.path.startsWith(path))) {
            return true;
        }

        // Check if the request path ends with any of the filesToSkip
        if (filesToSkip.some(file => req.path.endsWith(file))) {
            return true;
        }

        // Check if the request path ends with '.js'
        if (req.path.endsWith('.js')) {
            return true;
        }

        return false; // Allow all other requests
    }
});

// Apply the rate limiter middleware to all requests
app.use(limiter);

// Middleware to get user IP address
app.use(requestIp.mw());

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'content-type', 'X-access-token');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

// Winston logging
app.use((req, res, next) => {
    req.createLogger = createLogger;
    next();
});

// view engine setup
const coreViewsPath = path.join(__dirname, 'views');
app.set('views', coreViewsPath);
app.set('view engine', 'ejs');

// logs format
const loggerDebug = process.env.MORGAN_FORMAT || 'dev';
app.use(logger(loggerDebug, {
    skip: (req, res) => {
        const ext = req.path.split('.').pop();
        return ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg'].includes(ext);
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to generate and attach a one-time token to each request
app.use((req, res, next) => {
    const token = uuid.v4();
    Storetokens.makedAdd(token);
    res.locals.csrfToken = token;
    next();
});

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    res.locals.theme = req.session?.theme;
    next();
});

if (process.env.SESSION_REDIS && process.env.SESSION_REDIS.toLowerCase() === 'true') {
    const redis = require("redis");
    const RedisStore = require("connect-redis").default;
    const redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    });

    redisClient.connect().catch(console.error);

    let redisStore = new RedisStore({
        client: redisClient,
    });

    const sessionMiddleware = session({
        store: redisStore,
        secret: process.env.MY_SECRET_KEY || 'default_secret_key',
        resave: false,
        saveUninitialized: true,
        /* cookie: { secure: true } */
    });

    app.use(sessionMiddleware);

    // จากนั้นค่อยโหลด plugins
    const PluginLoader = require('./plugins/loader');
    const pluginLoader = new PluginLoader(app);

    console.time('Loading plugins successfully');
    pluginLoader.loadPlugins().then(() => {
        console.timeEnd('Loading plugins successfully');
    });
} else {
    // ถ้าไม่ใช้ Redis ให้ใช้ session แบบปกติ
    const sessionMiddleware = session({
        secret: process.env.MY_SECRET_KEY || 'default_secret_key',
        resave: false,
        saveUninitialized: true,
        /* cookie: { secure: true } */
    });

    app.use(sessionMiddleware);

    // จากนั้นค่อยโหลด plugins
    const PluginLoader = require('./plugins/loader');
    const pluginLoader = new PluginLoader(app);

    console.time('Loading plugins successfully');
    pluginLoader.loadPlugins().then(() => {
        console.timeEnd('Loading plugins successfully');
    });
}

// สร้าง Path จาก root ของโปรเจค
app.locals.viewsRoot = (filePath) => {
    const viewsDir = path.join(__dirname, 'views');
    const targetPath = path.join(viewsDir, filePath);

    // ตรวจสอบว่า targetPath ยังคงอยู่ภายใน viewsDir
    if (!targetPath.startsWith(viewsDir)) {
        throw new Error('Access denied: Attempt to access outside of views directory');
    }

    return targetPath;
};

// หลังจากโหลด plugins แล้ว ตั้งค่า views paths ใหม่โดยรวม paths หลักด้วย
// แก้ไขโค้ดเพื่อตรวจสอบว่า app.get('views') เป็น array หรือไม่
app.set('views', [
    path.join(__dirname, 'views'), // core views
    ...(app.get('views') || [])    // plugin views (ถ้ามี)
]);

app.use('/', indexRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.locals.theme = req.session?.theme;

    // render the error page
    res.status(err.status || 500);

    /* console.log(err); */
    if (req.app.get('env') == 'development') {
        /* res.render('error'); */
        return res.render('erroruser');
    } else {
        return res.render('erroruser');
        /* res.send('SERVER ERROR ' + err.status) */
    }

});

module.exports = app;