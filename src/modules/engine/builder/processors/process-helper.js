export class ProcessHelper{

    static normalizeProcessDefWithoutVersion(processDef) {
        const result = processDef;
        const regex = /(\w+)(-[vV][0-9]+\.[0-9]+)/;
        return result.replace(regex, `$1`);
    }

    static upperFirstChar(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}