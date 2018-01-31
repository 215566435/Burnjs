import * as KoaRouter from 'koa-router';
import * as fs from 'fs';
import logger from './logger';
import { BaseContext } from 'koa';
import { Burn, KV } from './core';


interface FileModule {
    module: any,
    filename: string
}

export class Loader {
    private controller: KV = {};
    private service: KV = {};
    private koaRouter: any = new KoaRouter;
    private hasLoad: boolean = false;
    private app: Burn;


    constructor(app: Burn) {
        this.app = app;
    }

    private appDir() {
        return __dirname.substr(0, __dirname.length - 4);
    }

    private fileLoader(url: string): Array<FileModule> {
        const merge = this.appDir() + url;

        return fs.readdirSync(merge).map((name) => {
            return {
                module: require(merge + '/' + name),
                filename: name
            };
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
        controllers.forEach((mod) => {
            const names = Object.getOwnPropertyNames(mod.module.prototype);
            Object.defineProperty(this.controller, mod.module.name.toLowerCase(), {
                value: this.convertController(mod.module, names)
            })
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
                service.forEach((mod) => {
                    Object.defineProperty(this.service, mod.module.name, {
                        get: () => {
                            return new mod.module(ctx, this.app);
                        }
                    })
                })
            }
            await next();
        })

        // logger.blue(this.service.user);
    }

    loadMiddleware() {
        const middleware = this.fileLoader('app/middleware');
        const registedMid = this.app.config['middleware'];

        registedMid.forEach((name: string) => {
            logger.blue(name);

            for (const index in middleware) {
                const mod = middleware[index];
                const fname = mod.filename.split('.')[0];
                if (name === fname) {
                    this.app.use(mod.module());
                }
            }
        })
    }

    loadConfig() {
        const configUrl = this.appDir()
            + (process.env.NODE_ENV === 'production' ? 'app/config.pro.js' : 'app/config.dev.js');

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
        this.loadMiddleware();
        this.loadRouter();//依赖loadController 
    }
}
