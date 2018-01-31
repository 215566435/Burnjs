import * as Koa from 'koa';

import { BaseContext } from 'koa';
import { Loader } from './loader';
import logger from './logger';


var Scount = 0;
export interface KV {
    [key: string]: any
}

export class Controller {
    ctx: BaseContext;
    app: Koa;
    constructor(ctx: BaseContext, app: Koa) {
        this.ctx = ctx;
        this.app = app;
    }
}

export class Service {
    ctx: BaseContext;
    app: Koa;
    count: number;
    constructor(ctx: BaseContext, app: Koa) {
        this.count = Scount;
        Scount++;

        this.ctx = ctx;
        this.app = app;
    }
}


export class Burn extends Koa {
    private loader: Loader;
    private port: number;
    private ip: string;

    config: KV = {};

    constructor() {
        super();
        this.loader = new Loader(this);
        this.port = 3000;
        this.ip = '127.0.0.1';
    }

    run() {

        this.loader.load();
        this.listen(this.port, this.ip, () => {
            logger.green(`Burn服务器运行在:${this.ip}:${this.port}`)
        })
    }
}