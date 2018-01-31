const { Service } = require('../../dist/core');


class user extends Service {
    index(ctx) {
        const a = 2 + 3;
        // if (ctx == this.ctx) {
        //     console.log('相同');
        // }

    }
}

module.exports = user;