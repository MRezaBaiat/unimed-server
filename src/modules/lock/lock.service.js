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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const redlock_1 = __importDefault(require("redlock"));
let LockService = class LockService {
    constructor(redisService) {
        this.redisService = redisService;
        this.redLock = new redlock_1.default([this.redisService.createClient()], {
            driftFactor: 0.01,
            retryCount: 20,
            retryDelay: 200,
            retryJitter: 200,
            automaticExtensionThreshold: 500
        });
        this.redLock.on('clientError', function (err) {
            console.error('A redis error has occurred:', err);
        });
    }
    async lock(lockTag, cb, duration = 4000) {
        if (!lockTag) {
            throw new Error('lock tag can not be void');
        }
        lockTag = String(lockTag);
        console.log('locking', lockTag, 'at', new Date().toString());
        let mLock;
        return new Promise((resolve, reject) => {
            this.redLock.lock(lockTag, duration).then(async (l) => {
                mLock = l;
                return cb(true)
                    .then(resolve)
                    .catch(reject);
            }).catch((e) => {
                console.error('failed to get lock for ' + lockTag);
                console.error(e);
                return cb(false)
                    .then(resolve)
                    .catch(reject);
            });
        }).finally(() => {
            mLock && mLock.unlock().then(() => {
                console.log('unlocked', lockTag, 'at', new Date().toString());
            }).catch(console.log);
        });
    }
};
LockService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], LockService);
exports.LockService = LockService;
