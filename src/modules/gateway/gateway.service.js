"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayService = void 0;
const common_1 = require("@nestjs/common");
const api_1 = require("api");
const zarinpal_checkout_1 = __importDefault(require("zarinpal-checkout"));
const transactions_service_1 = require("../transactions/transactions.service");
const sms_service_1 = __importDefault(require("../notifications/sms.service"));
const url_1 = __importDefault(require("url"));
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const depositZarinpal = zarinpal_checkout_1.default.create('6ed2d4e3-cb2d-495d-bb58-6ad8ee6123bb', process.env.STAGE === 'dev');
const errors = {
    101: 'Payment already verified',
    '-51': 'Unsuccessful payment'
};
let GatewayService = class GatewayService {
    constructor(smsService, transactionsService, usersRepo) {
        this.smsService = smsService;
        this.transactionsService = transactionsService;
        this.usersRepo = usersRepo;
    }
    verifyDepositTransaction(amount, Authority, user, res, os) {
        return __awaiter(this, void 0, void 0, function* () {
            let redirectUrl = 'matap://paymentdone/profile';
            if (os && os === 'web') {
                redirectUrl = 'https://pwa.matap.site';
            }
            redirectUrl = `${process.env.PAYMENT_DONE_URL}?call=${redirectUrl}&os=${os}`;
            return depositZarinpal.PaymentVerification({
                Amount: Number(amount),
                Authority
            }).then((response) => __awaiter(this, void 0, void 0, function* () {
                if (response.status !== 100) {
                    if (response.status === 101) {
                        console.log('payment was already verified , redirecting to ', redirectUrl);
                        res.status(302).redirect(redirectUrl);
                        return;
                    }
                    errors[String(response.status)] && console.log(errors[String(response.status)]);
                    throw new Error('error in payment , status was ' + response.status);
                }
                else {
                    yield this.transactionsService.create({
                        amount,
                        type: api_1.TransactionType.CHARGE_BY_GATEWAY,
                        trackingCode: String(response.RefID),
                        issuer: {
                            _id: user._id,
                            name: `${user.mobile} (${user.name})`,
                            type: 'user'
                        },
                        target: {
                            _id: user._id,
                            name: `${user.mobile} (${user.name})`
                        }
                    });
                    if (res) {
                        console.log('payment successful. redirecting to', redirectUrl);
                        res.status(302).redirect(redirectUrl);
                    }
                }
            })).catch((e) => {
                console.log(e);
                throw e;
            });
        });
    }
    ;
    generateToken(amount, doctorCode, userId, res, os = 'android') {
        console.log('yielding callback ' + `${process.env.PUBLIC_URL}/api/gateway/cb?userid=${userId}&amount=${amount}&os=${os}&doctorCode=${doctorCode} for user ${userId}`);
        return depositZarinpal.PaymentRequest({
            Amount: Number(amount),
            CallbackURL: `${process.env.PUBLIC_URL}/api/gateway/cb?userid=${userId}&amount=${amount}&os=${os}&doctorCode=${doctorCode}`,
            Description: 'Visit Request payment'
        }).then(response => {
            if (response.status === 100) {
                return res.status(200).send(response.url);
            }
            throw new Error(response.status);
        }).catch(err => {
            throw new Error(err);
        });
    }
    checkUnverifiedTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = this;
            const result = { deposit: { success: [], fails: [] }, services: { success: [], fails: [] } };
            yield depositZarinpal.UnverifiedTransactions().then(function (data) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (data.status == 100) {
                        for (const authority of data.authorities) {
                            const { Authority, Amount, Channel, CallbackURL, Referer, Email, CellPhone, Date } = authority;
                            const userid = new url_1.default.URL(CallbackURL).searchParams.get('userid');
                            const user = yield instance.usersRepo.crud().withId(userid).project({ _id: 1, name: 1, mobile: 1, type: 1 }).findOne();
                            if (user) {
                                yield instance.verifyDepositTransaction(Number(Amount) / 10, Authority, user, undefined, undefined)
                                    .then(() => {
                                    result.deposit.success.push({ authority });
                                })
                                    .catch((error) => {
                                    result.deposit.fails.push({ authority, error: error.toString() });
                                });
                            }
                            else {
                                result.deposit.fails.push({ authority, error: 'User was not found ' + userid });
                            }
                        }
                    }
                    else {
                        result.deposit.requestError = 'response was not 100 = ' + data.status;
                    }
                });
            }).catch((e) => {
                result.deposit.requestError = e.toString();
                console.log(e);
            });
            return result;
        });
    }
    ;
};
GatewayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sms_service_1.default, transactions_service_1.TransactionsService, users_repo_1.default])
], GatewayService);
exports.GatewayService = GatewayService;
