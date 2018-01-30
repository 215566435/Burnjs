"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const loader_1 = require("./loader");
class Controller {
    constructor(ctx) {
        this.ctx = ctx;
    }
}
exports.Controller = Controller;
class Service {
    constructor(ctx) {
        this.ctx = ctx;
    }
}
exports.Service = Service;
class Burn extends Koa {
    constructor() {
        super();
        this.loader = new loader_1.Loader;
        this.port = 3000;
        this.ip = '127.0.0.1';
    }
    run() {
        this.loader.loadController();
        this.use(async (ctx, next) => {
            this.loader.loadService(ctx);
            await next();
        });
        const RouterMiddleware = this.loader.loadRouter();
        this.use(RouterMiddleware);
        this.listen(3000, '127.0.0.1', () => {
            console.log(`Burn服务器运行在:${this.ip}:${this.port}`);
        });
    }
}
const app = new Burn;
app.run();
