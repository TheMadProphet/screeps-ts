const consoleLog = console.log;

function isPositionArray(variable: any): variable is PathStep[] | RoomPosition[] {
    if (!Array.isArray(variable)) return false;

    for (const step of variable) {
        if (typeof step.x !== "number" || typeof step.y !== "number") {
            return false;
        }
    }

    return true;
}

function replacer(key: string, value: any) {
    if (isPositionArray(value)) {
        return value.length;
    }

    return value;
}

/** Override original console.log(), convert object parameters to JSON string */
export function improveLog() {
    console.log = function (...dataList) {
        const transformedData = _.map(dataList, data => {
            if (typeof data === "object") {
                return JSON.stringify(data, replacer, "  ");
            } else {
                return data;
            }
        });

        consoleLog(transformedData.join(" "));
    };
}
