"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRecord = mapRecord;
function mapRecord(record, mapper) {
    return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, mapper(key, value)]));
}
//# sourceMappingURL=tools.js.map