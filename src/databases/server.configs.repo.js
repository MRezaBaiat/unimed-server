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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerConfigsSchema = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const api_1 = require("api");
const mongoose_2 = require("mongoose");
const query_builder_1 = __importDefault(require("./utils/query.builder"));
exports.ServerConfigsSchema = mongoose_1.SchemaFactory.createForClass(api_1.ServerConfig).pre(['find', 'findOne', 'findOneAndUpdate'], function () {
    this.lean();
});
let ServerConfigsRepo = class ServerConfigsRepo {
    constructor(configsDB) {
        this.configsDB = configsDB;
        this.configsDB.findOne({}).then((configs) => {
            if (configs) {
                return;
            }
            console.log('CREATING');
            this.crud().create({
                android: {
                    versionCode: '1.0',
                    changeLog: 'no change',
                    downloadLink: 'www.unimed.com',
                    forceUpdate: false
                },
                ios: {
                    versionCode: '1.0',
                    changeLog: 'no change',
                    downloadLink: 'www.unimed.com',
                    forceUpdate: false
                },
                retryThreshold: 2000,
                trickleIce: true,
                iceTransportPolicy: 'relay',
                iceServers: [
                    {
                        username: 'webrtc_user1',
                        credential: 'fsfji54235fslnvlk987cvzq',
                        urls: [
                            'turn:185.112.33.110:3478?transport=tcp'
                        ]
                    },
                    {
                        username: 'matap',
                        credential: 'M@t@p12',
                        urls: [
                            'turn:turn.hamavahost.ir:5349'
                        ]
                    },
                    {
                        username: '30HYY6cRDxxU8nr44gmwl_WNqdA4wWaholAuicL2HT-mxIK5mYFoXApGvvGbte0WAAAAAF6cE0NtYXRhcA==',
                        credential: '44d2d42a-821c-11ea-8c40-02ca4b67e38f',
                        urls: [
                            'turn:eu-turn6-back.xirsys.com:80?transport=udp'
                        ]
                    }
                ],
                mediaConstraints: {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        channelCount: 2
                    },
                    video: {
                        mandatory: {
                            minWidth: 640,
                            minHeight: 360,
                            minFrameRate: 30
                        }
                    }
                },
                forceSpeaker: false,
                termsandconditions: ''
            });
        });
    }
    crud() {
        return new query_builder_1.default(this.configsDB, api_1.ServerConfig);
    }
    getConfigs() {
        return this.configsDB.findOne({});
    }
};
ServerConfigsRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('server_config')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ServerConfigsRepo);
exports.default = ServerConfigsRepo;
