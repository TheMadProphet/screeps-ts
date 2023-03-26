import {Statistics} from "./statistics";

const originalFind = Room.prototype.find;

Room.prototype.find = function (this: any, ...params: any) {
    const cpuStart = Game.cpu.getUsed();
    const returnValue = originalFind.apply(this, params);

    Statistics.registerFindCpuUsage(Game.cpu.getUsed() - cpuStart);

    return returnValue;
};
