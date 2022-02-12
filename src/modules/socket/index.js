"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatRoomId = exports.createUserRoomId = void 0;
function createUserRoomId(id) {
    return `user#${id}`;
}
exports.createUserRoomId = createUserRoomId;
function createChatRoomId(id) {
    return `chat-room#${id}`;
}
exports.createChatRoomId = createChatRoomId;
