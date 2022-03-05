"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const Kavenegar = __importStar(require("kavenegar"));
const utils_1 = require("../../utils");
const axios = require('axios');
let SmsService = class SmsService {
    constructor() {
        this.smsApi = Kavenegar.KavenegarApi({
            apikey: process.env.SMS_API_KEY
        });
    }
    sendAZSms(mobile, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const login = 'Azdan';
            const password = '@2Az_/*d@nC02o';
            const controlid = Math.floor(100000 + Math.random() * 900000);
            const title = 'Azdan Az Co';
            const xmlBodyStr = `<?xml version="1.0" encoding="UTF-8"?>
<request>
    <head>
        <operation>submit</operation>
        <login>${login}</login>
        <password>${password}</password>
        <title>${title}</title>
        <scheduled>now</scheduled>
        <isbulk>false</isbulk>
        <controlid>${controlid}</controlid>
    </head>          
    <body>
        <msisdn>${mobile}</msisdn>
        <message>${message}</message>
    </body> 
</request>
`;
            axios.post('https://sms.atatexnologiya.az/bulksms/api', xmlBodyStr, {
                headers: {
                    'Content-Type': 'text/xml'
                }
            }).then(res => console.log(res.data))
                .catch(console.error);
        });
    }
    sendOTP(mobile, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const lang = (0, utils_1.findLanguageFromMobile)(mobile);
            if (lang === 'fa') {
                return this.smsApi.VerifyLookup({
                    token: otp,
                    receptor: mobile,
                    template: 'code'
                }, (response, status) => {
                    console.log(status);
                    console.log(response);
                });
            }
            else {
                return this.sendAZSms(mobile, `UniMed birdəfəlik istifadə kodu: ${otp}`);
            }
        });
    }
};
SmsService = __decorate([
    (0, common_1.Injectable)()
], SmsService);
exports.default = SmsService;
