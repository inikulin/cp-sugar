var assert = require('assert');
var del    = require('del');
var exists = require('fs').existsSync;
var ml     = require('multiline');
var exec   = require('../').exec;
var spawn  = require('../').spawn;

describe('exec', function () {
    it('Should resolve with trimmed stdout', function () {
        return exec(
            ml(function () {
                /*
                node -e "console.log(' Hey ya! ')"
                */
            }))
            .then(function (stdout) {
                assert.strictEqual(stdout, 'Hey ya!');
            });
    });

    it('Should reject with process error', function () {
        return exec(
            ml(function () {
                /*
                node -e "throw 'oops!'"
                */
            }))
            .then(function () {
                throw 'Promise rejection expected';
            })
            .catch(function (err) {
                assert(/throw 'oops!'/.test(err.message));
            });
    });
});

describe('spawn', function () {
    beforeEach(function () {
        return del('yoyo.txt');
    });

    afterEach(function () {
        return del('yoyo.txt');
    });

    it('Should resolve when process finished', function () {
        return spawn(
            ml(function () {
                /*
                node -e "require('fs').writeFileSync('yoyo.txt', 'test')"
                */
            }), true)
            .then(function () {
                return exists('yoyo.txt');
            })
            .then(assert);
    });

    it('Should reject if process has non-zero exit code', function () {
        return spawn(
            ml(function () {
                /*
                node -e "process.exit(1)"
                */
            }), true)
            .then(function () {
                throw 'Promise rejection expected';
            })
            .catch(function (err) {
                assert.strictEqual(err.message, 'Command `node` exited with code 1.');
            });
    });

    it('Should reject with process error', function () {
        return spawn(
            ml(function () {
                /*
                node -e "throw 'oops!'"
                */
            }), true)
            .then(function () {
                throw 'Promise rejection expected';
            })
            .catch(function (err) {
                assert(/Command `node` exited with code \d+./.test(err.message));
            });
    });
});
