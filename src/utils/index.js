"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPrivilegeTestFunctionString = void 0;
exports.defaultPrivilegeTestFunctionString = '(function(privilegeOptions,req){ return privilegeOptions[req.method.toLowerCase()].allowed; })';
