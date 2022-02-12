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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = __importDefault(require("fs"));
const url_1 = require("url");
const not_found_error_1 = __importDefault(require("../../errors/not-found-error"));
const util_1 = __importDefault(require("util"));
const mongoose_1 = require("mongoose");
const mongodb_1 = require("mongodb");
const files_repo_1 = __importDefault(require("../../databases/files.repo"));
const utils_1 = require("../../databases/utils");
const badrequest_error_1 = __importDefault(require("../../errors/badrequest-error"));
const service_unavailable_error_1 = require("../../errors/service.unavailable.error");
const mongoose_2 = require("@nestjs/mongoose/");
const { pipeline } = require('stream');
const pump = util_1.default.promisify(pipeline);
let FilesService = class FilesService {
    constructor(filesRepo, connection) {
        this.filesRepo = filesRepo;
        this.connection = connection;
        this.bucket = new mongodb_1.GridFSBucket(connection.db);
    }
    pipeToFile(file, destinationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return pump(file.file, fs_1.default.createWriteStream(destinationPath));
        });
    }
    createUrl(id) {
        return `${process.env.PUBLIC_URL}/api/files?id=${id}`;
    }
    createChatMediaUrl(id) {
        return `${process.env.PUBLIC_URL}/api/files/chat?id=${id}`;
    }
    copyFromStream(stream, filename, mimetype, metadata, oldUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const id = new utils_1.ObjectId();
                    const uploadStream = this.bucket.openUploadStreamWithId(id, filename, {
                        contentType: mimetype,
                        metadata: Object.assign({}, metadata)
                    });
                    stream.on('end', () => __awaiter(this, void 0, void 0, function* () {
                        console.log('end on stream');
                    }));
                    uploadStream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                        console.log('finish on upload stream');
                        yield this.filesRepo.crud().withId(id).set({ url: metadata.roomId ? this.createChatMediaUrl(String(id)) : this.createUrl(String(id)), oldUrl }).updateOne();
                        const file = yield this.filesRepo.crud().withId(id).findOne();
                        resolve(file);
                    }));
                    uploadStream.on('error', reject);
                    stream.on('error', reject);
                    stream.pipe(uploadStream);
                }
                catch (e) {
                    console.log(e);
                    reject(e);
                }
            });
        });
    }
    upload(request, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    request.multipart((field, file, filename, encoding, mimetype) => {
                        this.copyFromStream(file, filename, mimetype, metadata).then(resolve).catch(reject);
                    }, (err) => {
                        if (err) {
                            console.error(err);
                            reject(new service_unavailable_error_1.ServiceUnavailableError());
                        }
                    });
                }
                catch (e) {
                    console.error(e);
                    reject(new service_unavailable_error_1.ServiceUnavailableError());
                }
            });
        });
    }
    download(id, request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!utils_1.ObjectId.isValid(id)) {
                    throw new badrequest_error_1.default('invalid file id');
                }
                const oId = new utils_1.ObjectId(id);
                const fileInfo = yield this.filesRepo.crud().withId(id).findOne();
                if (!fileInfo) {
                    throw new not_found_error_1.default('file not found');
                }
                if (request.headers.range) {
                    const range = request.headers.range.substr(6).split('-');
                    const start = parseInt(range[0], 10);
                    const end = parseInt(range[1], 10) || null;
                    const readStream = this.bucket.openDownloadStream(oId, {
                        start,
                        end
                    });
                    response.status(206);
                    response.headers({
                        'Accept-Ranges': 'bytes',
                        'Content-Type': fileInfo.contentType,
                        'Content-Range': `bytes ${start}-${end || fileInfo.length - 1}/${fileInfo.length}`,
                        'Content-Length': (end || fileInfo.length) - start,
                        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`
                    });
                    response.raw.on('close', () => {
                        readStream.destroy();
                    });
                    response.send(readStream);
                }
                else {
                    const readStream = this.bucket.openDownloadStream(oId);
                    response.raw.on('close', () => {
                        readStream.destroy();
                    });
                    response.status(200);
                    response.headers({
                        'Accept-Range': 'bytes',
                        'Content-Type': fileInfo.contentType,
                        'Content-Length': fileInfo.length,
                        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`
                    });
                    response.send(readStream);
                }
            }
            catch (e) {
                console.error(e);
                throw new service_unavailable_error_1.ServiceUnavailableError();
            }
        });
    }
    delete(fileUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileId = new url_1.URL(fileUrl).searchParams.get('q');
            return this.filesRepo.crud().withId(fileId).deleteOne();
        });
    }
};
FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_2.InjectConnection)()),
    __metadata("design:paramtypes", [files_repo_1.default, mongoose_1.Connection])
], FilesService);
exports.FilesService = FilesService;
