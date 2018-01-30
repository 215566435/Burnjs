import * as KoaRouter from 'koa-router';
import * as fs from 'fs';
import logger from './logger';
import { BaseContext } from 'koa';
import * as Koa from 'koa';

export class Loader {
    private controller: {
        [key: string]: any
    } = {};
    private service: {
        [key: string]: any
    } = {};
    private koaRouter: any = new KoaRouter;

    private hasLoad: boolean = false;

    private app: Koa;

    constructor(app: Koa) {
        this.app = app;
    }

    private appDir() {
        return __dirname.substr(0, __dirname.length - 4);
    }

    private fileLoader(url: string) {
        const merge = this.appDir() + url;

        return fs.readdirSync(merge).map((name) => {
            return merge + '/' + name;
        });
    }
    private convertController(ctler: object, funcNames: Array<string>) {
        const tmp: { [key: string]: any } = {};
        funcNames.forEach((name) => {
            if (name !== 'constructor') {
                tmp[name] = {
                    class: ctler,
                    funcName: name
                };
            }
        })
        return tmp;
    }

    loadController() {
        const controllers = this.fileLoader('app/controller');
        controllers.forEach((ctl) => {
            const controller = require(ctl);
            const names = Object.getOwnPropertyNames(controller.prototype);

            logger.blue(controller.name);
            this.controller[controller.name] = this.convertController(controller, names);
        })
    }

    loadRouter() {
        const routerUrl = this.appDir() + 'app/router.js';
        const routing = require(routerUrl)({
            controller: this.controller
        });

        Object.keys(routing).forEach((key) => {
            const [method, url] = key.split(' ');
            logger.blue(method + url)
            const d = routing[key];
            this.koaRouter[method](url, async (ctx: BaseContext) => {
                ctx.service = this.service;
                const instance = new d.class(ctx, this.app);
                await instance[d.funcName]();
            })
        })

        this.app.use(this.koaRouter.routes())
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
                    })
                })
            }
            await next();
        })

        // logger.blue(this.service.user);
    }

    loadConfig() {
        const configUrl = this.appDir() + 'app/config.js';
        const conf = require(configUrl);

        Object.defineProperty(this.app, 'config', {
            get: () => {
                return conf
            }
        })
    }

    load() {
        this.loadController();
        this.loadService();
        this.loadConfig();
        this.loadRouter();//依赖loadController
    }
}
