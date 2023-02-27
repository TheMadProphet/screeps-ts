import {Statistics} from "./statistics";

const originalTravelTo = Creep.prototype.travelTo;

Creep.prototype.travelTo = function (this: any, ...params: any) {
    const cpuStart = Game.cpu.getUsed();
    const returnValue = originalTravelTo.apply(this, params);

    Statistics.registerPathfindingCpuUsage(Game.cpu.getUsed() - cpuStart);
    return returnValue;
};
