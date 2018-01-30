import * as Koa from 'koa';

import { Context } from 'koa';
import { Loader } from './loader';


export class Controller {
    ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }
}

export class Service {
    ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }
}


class Burn extends Koa {
    private loader: Loader;
    private port: number;
    private ip: string;

    constructor() {
        super();
        this.loader = new Loader;
        this.port = 3000;
        this.ip = '127.0.0.1';
    }

    run() {
        this.loader.loadController();
        this.use(async (ctx, next) => {
            this.loader.loadService(ctx);
            await next();
        })

        const RouterMiddleware = this.loader.loadRouter();
        this.use(RouterMiddleware);

        this.listen(3000, '127.0.0.1', () => {
            console.log(`Burn服务器运行在:${this.ip}:${this.port}`);
        })
    }
}

const app = new Burn;

app.run();