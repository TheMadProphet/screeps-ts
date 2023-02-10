const consoleLog = console.log;

/** Override original console.log(), convert object parameters to JSON string */
export function improveLog() {
    console.log = function (...dataList) {
        const transformedData = _.map(dataList, data => {
            if (typeof data === "object") {
                return JSON.stringify(data, undefined, "  ");
            } else {
                return data;
            }
        });

        consoleLog(transformedData.join(" "));
    };
}
