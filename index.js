var Module = require('module');

function fakeLoader(request, parent, isMain) {
    if (!this.originalLoader) {
        throw new Error('Loader has not been replaced');
    }

    if (this.registeredMocks[request]) {
        return this.registeredMocks[request];
    }

    if (!this.registeredAllowables[request]) {
        if (this.options.warnOnUnregistered) {
            console.warn('WARNING: loading non-allowed module: ' + request);
        }

        if (this.options.errorOnUnregistered) {
            throw new Error('ERROR: loading non-allowed module: ' + request);
        }
    }

    return this.originalLoader(request, parent, isMain);
}

function Fraudster(options){
    this.registeredMocks = {};
    this.registeredAllowables = {};
    this.originalLoader = null;
    this.originalCache = null;
    this.options = {
        warnOnReplace: false,
        warnOnUnregistered: true
    };

    for(var key in options){
        this.options[key] = options[key];
    }
}

Fraudster.prototype.enable = function () {
    if (this.originalLoader) {
        return;
    }

    this.originalLoader = Module._load;
    Module._load = fakeLoader.bind(this);
};

Fraudster.prototype.disable = function () {
    if (!this.originalLoader) {
        return;
    }

    Module._load = this.originalLoader;
    this.originalLoader = null;
};

Fraudster.prototype.registerMock = function (key, mock) {
    if (this.registeredMocks.hasOwnProperty(key)) {
        if(this.options.warnOnReplace){
            console.warn('WARNING: Replacing existing mock for module: ' + key);
        }

        if(this.options.errorOnReplace){
            throw new Error('ERROR: Replacing existing mock for module: ' + key);
        }
    }
    this.registeredMocks[key] = mock;
};

Fraudster.prototype.deregisterMock = function (key) {
    if (this.registeredMocks.hasOwnProperty(key)) {
        delete this.registeredMocks[key];
    }
};

Fraudster.prototype.registerAllowable = function (key) {
    this.registeredAllowables[key] = true;
};

Fraudster.prototype.registerAllowables = function (keys) {
    var fraudster = this;

    keys.forEach(function (key) {
        fraudster.registerAllowable(key);
    });
};

Fraudster.prototype.deregisterAllowable = function (key) {
    delete this.registeredAllowables[key];
};

Fraudster.prototype.deregisterAllowables = function (keys) {
    var fraudster = this;

    keys.forEach(function (key) {
        fraudster.deregisterAllowable(key);
    });
};

Fraudster.prototype.deregisterAll = function (){
    this.registeredMocks = {};
    this.registeredAllowables = {};
};

module.exports = Fraudster;
