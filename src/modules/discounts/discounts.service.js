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
exports.DiscountsService = void 0;
const common_1 = require("@nestjs/common");
const discounts_repo_1 = __importDefault(require("../../databases/discounts.repo"));
const dictionary_1 = __importDefault(require("../../utils/dictionary"));
let DiscountsService = class DiscountsService {
    constructor(discountsRepo) {
        this.discountsRepo = discountsRepo;
    }
    checkAvailability(userId, code, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            userId = String(userId);
            const coupon = yield this.discountsRepo.crud().where({ code }).findOne();
            if (!coupon) {
                console.log('no 1');
                return { error: dictionary_1.default.Strings.DISCOUNT_CODE_NOT_FOUND[lang] };
            }
            if (coupon.usages.length >= coupon.totalUsageLimit) {
                console.log('no 2');
                return { error: dictionary_1.default.Strings.DISCOUNT_CODE_NOT_FOUND[lang] };
            }
            if (coupon.perUserLimit !== -1) {
                const usages = coupon.usages.filter(id => id === userId);
                if (usages.length >= coupon.perUserLimit) {
                    console.log('discount already used for ' + userId);
                    return { error: dictionary_1.default.Strings.DISCOUNT_ALREADY_USED[lang] };
                }
            }
            return { amount: coupon.amount, _id: coupon._id };
        });
    }
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { skip, limit, sort, whiteList, search, populations, projection } = query;
            const condition = this.discountsRepo.crud()
                .whereTextLike({ title: search }, 'or')
                .searchId({ _id: search }, 'or')
                .whiteListFilter(whiteList);
            if (query.search) {
                condition.where({ code: search });
            }
            return condition
                .project(projection || { __v: 0, usages: 0 })
                .skip(skip)
                .limit(limit)
                .populate(populations)
                .sort(sort)
                .query();
        });
    }
    checkAndGet(patientUserid, discountCode, lang) {
        return __awaiter(this, void 0, void 0, function* () {
            if (discountCode && discountCode.length === 6) {
                const coupon = yield this.checkAvailability(patientUserid, discountCode, lang);
                if (coupon) {
                    return { discountId: coupon._id, discountAmount: coupon.amount, error: coupon.error };
                }
            }
            return { discountId: undefined, discountAmount: undefined };
        });
    }
};
DiscountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [discounts_repo_1.default])
], DiscountsService);
exports.DiscountsService = DiscountsService;
