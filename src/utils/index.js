"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLanguageFromMobile = exports.defaultPrivilegeTestFunctionString = void 0;
exports.defaultPrivilegeTestFunctionString = '(function(privilegeOptions,req){ return privilegeOptions[req.method.toLowerCase()].allowed; })';
function findLanguageFromMobile(mobile) {
    if (mobile.startsWith('994')) {
        return 'az';
    }
    else {
        return 'fa';
    }
}
exports.findLanguageFromMobile = findLanguageFromMobile;
