const { Controller } = require('../../dist/core');

class base extends Controller {
    index() {
        this.ctx.body = 'asd'
        this.ctx.service.user.index();
        console.log(this.app.config);
    }
    parse() {

    }

}

module.exports = base;