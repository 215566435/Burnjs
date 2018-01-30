import * as Koa from 'koa';

import { BaseContext } from 'koa';
import { Loader } from './loader';
import logger from './logger';


export class Controller {
    ctx: BaseContext;

    constructor(ctx: BaseContext) {
        this.ctx = ctx;
    }
}

export class Service {
    ctx: BaseContext;

    constructor(ctx: BaseContext) {
        this.ctx = ctx;
    }
}


class Burn extends Koa {
    private loader: Loader;
    private port: number;
    private ip: string;

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

const app = new Burn;

app.run();

// const numCPUs = os.cpus().length;

// if (cluster.isMaster) {
//     // Fork workers.
//     for (let i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }

//     cluster.on('exit', function (worker, code, signal) {
//         console.log('worker ' + worker.process.pid + ' died');
//     });
// } else {
//     const app = new Burn;

//     app.run();
// }

