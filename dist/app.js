"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const loader_1 = require("./loader");
const logger_1 = require("./logger");
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
        this.loader = new loader_1.Loader(this);
        this.port = 3000;
        this.ip = '127.0.0.1';
    }
    run() {
        this.loader.load();
        this.listen(this.port, this.ip, () => {
            logger_1.default.green(`Burn服务器运行在:${this.ip}:${this.port}`);
        });
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
