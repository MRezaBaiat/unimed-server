"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayIncludes = exports.generateQueryResponse = exports.addWhiteListFilter = exports.isValidObjectId = exports.nameFilter = exports.ObjectId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.ObjectId = require('mongoose').Types.ObjectId;
function nameFilter(filter) {
    return { $regex: filter, $options: 'i' };
}
exports.nameFilter = nameFilter;
function isValidObjectId(id) {
    return id && mongoose_1.default.isValidObjectId(id);
}
exports.isValidObjectId = isValidObjectId;
function addWhiteListFilter(query, whiteList) {
    if (whiteList && whiteList.length !== 0) {
        query.andWhere({ _id: { $in: whiteList.map(i => { return { _id: i }; }) } });
    }
}
exports.addWhiteListFilter = addWhiteListFilter;
function generateQueryResponse(total, results, skip, limit) {
    return {
        total,
        results,
        currentPageIndex: (skip / limit),
        maxPageIndex: Math.floor((total + limit - 1) / limit) - 1
    };
}
exports.generateQueryResponse = generateQueryResponse;
function arrayIncludes(what) {
    return { $in: what };
}
exports.arrayIncludes = arrayIncludes;
