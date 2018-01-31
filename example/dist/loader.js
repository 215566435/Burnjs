"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Router = require("koa-router");
class Loader {
    constructor() {
        this.router = new Router;
        this.controller = {};
    }
    loadController() {
        const dirs = fs.readdirSync(__dirname + '/controller');
        dirs.forEach((filename) => {
            const property = filename.split('.')[0];
            const mod = require(__dirname + '/controller/' + filename).default;
            if (mod) {
                const methodNames = Object.getOwnPropertyNames(mod.prototype).filter((names) => {
                    if (names !== 'constructor') {
                        return names;
                    }
                });
                Object.defineProperty(this.controller, property, {
                    get() {
                        const merge = {};
                        methodNames.forEach((name) => {
                            merge[name] = {
                                type: mod,
                                methodName: name
                            };
                        });
                        return merge;
                    }
                });
            }
        });
    }
    loadRouter() {
        this.loadController();
        const mod = require(__dirname + '/router.js');
        const routers = mod(this.controller);
        console.log(routers);
        Object.keys(routers).forEach((key) => {
            const [method, path] = key.split(' ');
            this.router[method](path, async (ctx) => {
                const _class = routers[key].type;
                const handler = routers[key].methodName;
                const instance = new _class(ctx);
                instance[handler]();
            });
        });
        return this.router.routes();
    }
}
exports.Loader = Loader;
