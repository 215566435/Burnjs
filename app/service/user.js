const { Service } = require('../../dist/core');


class user extends Service {
    index() {
        const a = 2 + 3;
    }
}

module.exports = user;