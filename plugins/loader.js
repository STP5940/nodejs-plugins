const fs = require('fs');
const path = require('path');
const express = require('express');

const overrideRenderMiddleware = require('@plugins/overrideRenderMiddleware');

class PluginLoader {
    constructor(app) {
        this.app = app;
        this.pluginsPath = path.join(__dirname, '../plugins');

        // โหลด views path ของ plugin
        const viewsPath = path.join(this.pluginsPath);
        if (fs.existsSync(viewsPath)) {
            // เพิ่มเข้าไปใน views array โดยไม่ลบ path เดิม
            this.app.set('views', [
                ...this.app.get('views'),
                viewsPath,
            ]);
        }
    }

    async loadPlugins() {
        try {
            const files = fs.readdirSync(this.pluginsPath, { withFileTypes: true });
            const directories = files.filter(file => file.isDirectory());
            if (directories.length === 0) {
                // console.log('No plugins directory...');
            }
        } catch (err) {
            console.error('Error:', err);
        }

        const pluginDirs = fs.readdirSync(this.pluginsPath)
            .filter(file => fs.statSync(path.join(this.pluginsPath, file)).isDirectory());

        const results = await Promise.allSettled(pluginDirs.map(name => this.loadPlugin(name)));

        results.forEach((result, idx) => {
            if (result.status === 'fulfilled') {
                console.log(`✅ ${pluginDirs[idx]} [OK]`);
            } else {
                console.error(`❌ ${pluginDirs[idx]} [FAILED]:`, result.reason);
            }
        });
    }

    loadPlugin(pluginName) {
        const pluginPath = path.join(this.pluginsPath, pluginName);

        try {
            // Load routes
            const routesPath = path.join(pluginPath, 'routes');
            if (fs.existsSync(routesPath)) {
                const routeFiles = fs.readdirSync(routesPath);

                routeFiles.forEach(file => {
                    if (file.endsWith('.js')) {
                        const routePath = path.join(routesPath, file);
                        const router = require(routePath);

                        // ใช้ชื่อ plugin เป็น base path
                        const pluginRouter = express.Router();

                        // เพิ่ม locals สำหรับการใช้ใน views
                        pluginRouter.use((req, res, next) => {

                            // กำหนดชื่อ plugin ลงใน res.locals
                            // กรองตรวจสอบว่าเป็น static file หรือไม่
                            const isStaticFile = req.path.match(/\.(jpg|jpeg|png|gif|css|js|ico|svg|woff|woff2|ttf|eot)$/i);
                            if (!isStaticFile) {
                                req.session.currentPlugin = pluginName;
                            }

                            // กำหนดชื่อ plugin ลงใน res.locals
                            res.locals.currentPlugin = pluginName;
                            // เพิ่ม url เข้าไปใน res.locals
                            res.locals.url = (assetPath) => `/user/plugins/${pluginName}/${assetPath.replace(/^\//, '')}`;
                            next();
                        });

                        // เพิ่ม middleware สำหรับการ override render
                        pluginRouter.use(overrideRenderMiddleware());

                        pluginRouter.use('/', router);
                        this.app.use(`/user/plugins/${pluginName}`, pluginRouter);
                    }
                });
            }

            // Serve static files
            const publicPath = path.join(pluginPath, 'public');
            if (fs.existsSync(publicPath)) {
                this.app.use(`/user/plugins/${pluginName}`, express.static(publicPath));
            }

            console.log(`Loaded plugin: ${pluginName}`);
        } catch (err) {
            console.error(`Error loading plugin ${pluginName}:`, err);
        }
    }
}

module.exports = PluginLoader;