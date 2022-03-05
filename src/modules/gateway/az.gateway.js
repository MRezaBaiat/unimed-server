"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto = require('crypto');
class AzGateway {
    constructor(test) {
        this.merchantId = 'azdanaz';
        this.currency = 994;
        this.secretKey = '123456qwerty';
        this.url = test ? 'https://test.millikart.az:7444/gateway/payment' : 'https://pay.millikart.az/gateway/payment';
    }
    createSignature(amount, description, reference) {
        return crypto.createHash('md5').update(`Mid = ${this.merchantId}; amount = ${amount}; currency = ${this.currency}; description = ${description}; reference = ${reference}; language = az; Secret key = ${this.secretKey}`).digest('hex').toUpperCase();
    }
    createTokenLink(amount, description, reference) {
        return `${this.url}/register?mid=${this.merchantId}&amount=${amount}&currency=${this.currency}&description=${description}&reference=${reference}&language=az&signature=${this.createSignature(amount, description, reference)}&redirect=0`;
    }
    createCheckStatusLink(reference) {
        return `${this.url}/status?mid=${this.merchantId}&reference=${reference}`;
    }
    generateToken(amount, reference) {
        return axios_1.default.post(this.createTokenLink(amount, `Pay${amount}`, reference));
    }
    verifyTransaction(reference) {
        return axios_1.default.post(this.createCheckStatusLink(reference));
    }
}
exports.default = AzGateway;
