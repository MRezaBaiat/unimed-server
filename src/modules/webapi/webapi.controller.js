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
exports.WebapiController = void 0;
const common_1 = require("@nestjs/common");
const users_repo_1 = __importDefault(require("../../databases/users.repo"));
const api_1 = require("api");
let WebapiController = class WebapiController {
    constructor(usersRepo) {
        this.usersRepo = usersRepo;
    }
    handleGetOnlines() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.usersRepo.crud()
                .where({ type: api_1.UserType.DOCTOR, ready: true })
                .project({ _id: 1, name: 1, imageUrl: 1, specialization: 1 })
                .limit(10)
                .populate(['specialization']);
        });
    }
};
__decorate([
    (0, common_1.Get)('/onlines'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebapiController.prototype, "handleGetOnlines", null);
WebapiController = __decorate([
    (0, common_1.Controller)('webapi'),
    __metadata("design:paramtypes", [users_repo_1.default])
], WebapiController);
exports.WebapiController = WebapiController;
