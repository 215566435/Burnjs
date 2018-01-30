const { Controller } = require('../../dist/app');

class base extends Controller {
    index() {
        this.ctx.body = 'asd'
        this.ctx.service.user.index();

        console.log(this.ctx.params)
    }
    parse() {

    }

}

module.exports = base;