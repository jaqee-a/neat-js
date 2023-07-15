"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InnovationFactory = void 0;
class InnovationFactory {
    static GenNewInnovationNumber() {
        return this.COUNTER++;
    }
}
exports.InnovationFactory = InnovationFactory;
Object.defineProperty(InnovationFactory, "COUNTER", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 0
});
