"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KoaRouter = require("koa-router");
const fs = require("fs");
const logger_1 = require("./logger");
class Loader {
    constructor(app) {
        this.controller = {};
        this.service = {};
        this.koaRouter = new KoaRouter;
        this.hasLoad = false;
        this.app = app;
    }
    appDir() {
        return __dirname.substr(0, __dirname.length - 4);
    }
    fileLoader(url) {
        const merge = this.appDir() + url;
        return fs.readdirSync(merge).map((name) => {
            return merge + '/' + name;
        });
    }
    convertController(ctler, funcNames) {
        const tmp = {};
        funcNames.forEach((name) => {
            if (name !== 'constructor') {
                tmp[name] = {
                    class: ctler,
                    funcName: name
                };
            }
        });
        return tmp;
    }
    loadController() {
        const controllers = this.fileLoader('app/controller');
        controllers.forEach((ctl) => {
            const controller = require(ctl);
            const names = Object.getOwnPropertyNames(controller.prototype);
            logger_1.default.blue(ctl);
            this.controller[controller.name.toLowerCase()] = this.convertController(controller, names);
        });
    }
    loadRouter() {
        const routerUrl = this.appDir() + 'app/router.js';
        const routing = require(routerUrl)({
            controller: this.controller
        });
        Object.keys(routing).forEach((key) => {
            const [method, url] = key.split(' ');
            logger_1.default.blue(method + url);
            const d = routing[key];
            this.koaRouter[method](url, async (ctx) => {
                ctx.service = this.service;
                const instance = new d.class(ctx, this.app);
                await instance[d.funcName]();
            });
        });
        this.app.use(this.koaRouter.routes());
    }
    loadService() {
        this.app.use(async (ctx, next) => {
            if (!this.hasLoad) {
                this.hasLoad = true;
                const service = this.fileLoader('app/service');
                service.forEach((svr) => {
                    const sv = require(svr);
                    Object.defineProperty(this.service, sv.name, {
                        get: () => {
                            return new sv(ctx, this.app);
                        }
                    });
                });
            }
            await next();
        });
        // logger.blue(this.service.user);
    }
    loadConfig() {
        const configUrl = this.appDir() + (process.env.NODE_ENV === 'production' ? 'app/config.pro.js' : 'app/config.dev.js');
        const conf = require(configUrl);
        Object.defineProperty(this.app, 'config', {
            get: () => {
                return conf;
            }
        });
    }
    load() {
        this.loadController();
        this.loadService();
        this.loadConfig();
        this.loadRouter(); //依赖loadController
    }
}
exports.Loader = Loader;
