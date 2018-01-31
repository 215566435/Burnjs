"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Router = require("koa-router");
const route = new Router;
function loader() {
    const dirs = fs.readdirSync(__dirname + '/router');
    dirs.forEach((filename) => {
        const mod = require(__dirname + '/router/' + filename).default;
        Object.keys(mod).map((key) => {
            const [method, path] = key.split(' ');
            const handler = mod[key];
            route[method](path, handler);
        });
    });
    return route.routes();
}
exports.loader = loader;
