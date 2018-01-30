const { Controller } = require('../../dist/core');

class User extends Controller {
    index() {
        this.ctx.body = 'asd'
        this.ctx.service.user.index();
    }
    parse() {

    }

}

module.exports = User;