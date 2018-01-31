const { Controller } = require('../../dist/core');

class User extends Controller {
    index() {
        this.ctx.body = 'asd';

        this.ctx.service.user.index(this.ctx);
        this.ctx.service.user.count;
    }
    parse() {

    }

}

module.exports = User;