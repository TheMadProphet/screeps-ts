import {Statistics} from "./statistics";

const originalTravelTo = Creep.prototype.travelTo;

Creep.prototype.travelTo = function (this: any, ...params: any) {
    const cpuStart = Game.cpu.getUsed();
    const returnValue = originalTravelTo.apply(this, params);

    let usedCpu = Game.cpu.getUsed() - cpuStart;
    if (returnValue === OK && usedCpu > 0.2) {
        usedCpu -= 0.2;
    }

    Statistics.registerPathfindingCpuUsage(usedCpu);

    return returnValue;
};
