"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KoaRouter = require("koa-router");
const fs = require("fs");
const logger_1 = require("./logger");
class Loader {
    constructor() {
        this.controller = {};
        this.service = {};
        this.koaRouter = new KoaRouter;
        this.hasLoad = false;
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
            logger_1.default.blue(names);
            this.controller[controller.name] = this.convertController(controller, names);
        });
    }
    loadRouter() {
        const routerUrl = this.appDir() + 'app/router.js';
        const routing = require(routerUrl)({
            controller: this.controller
        });
        Object.keys(routing).forEach((key) => {
            const [method, url] = key.split(' ');
            const d = routing[key];
            this.koaRouter[method](url, async (ctx) => {
                ctx.service = this.service;
                const instance = new d.class(ctx);
                await instance[d.funcName]();
            });
        });
        return this.koaRouter.routes();
    }
    loadService(ctx) {
        if (!this.hasLoad) {
            this.hasLoad = true;
            const service = this.fileLoader('app/service');
            service.forEach((svr) => {
                const sv = require(svr);
                Object.defineProperty(this.service, sv.name, {
                    get: () => {
                        return new sv(ctx);
                    }
                });
            });
        }
        // logger.blue(this.service.user);
    }
}
exports.Loader = Loader;
