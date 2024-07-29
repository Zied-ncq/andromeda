export class ProcessHelper{

    static normalizeWpidWithoutVersion(wpid) {
        const result = wpid;
        const regex = /(\w+)(-[vV][0-9]+\.[0-9]+)/;
        return result.replace(regex, `$1`);
    }

    static upperFirstChar(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Convert a snake_case string to camelCase.
     * @param {string} str - The snake_case string.
     * @returns {string} - The camelCase string.
     */
    static snakeToCamel(str) {
        return str.replace(/(_\w)/g, (matches) => matches[1].toUpperCase());
    }

    /**
     * Recursively convert all keys in an object from snake_case to camelCase.
     * @param {Object|Array} obj - The object or array to be converted.
     * @returns {Object|Array} - The new object or array with camelCase keys.
     */
    static convertKeysToCamelCase(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => convertKeysToCamelCase(item));
        } else if (obj !== null && obj.constructor === Object) {
            return Object.keys(obj).reduce((result, key) => {
                const camelKey = snakeToCamel(key);
                result[camelKey] = convertKeysToCamelCase(obj[key]);
                return result;
            }, {});
        }
        return obj;
    }
}