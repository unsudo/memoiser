/**
 * Memoise a synchronous function call.
 * @param {*} fn - Function or method to memoise.
 * @param {*} keygenFn - Callback that generates a unique key to store the result under it.
 * @param {Object} expiration - Cache expiration properties.
 * @param {number} [expiration.ttl=null] - Cache lifetime in ms, otherwise null for no expiration.
 * @param {*} [expiration.onExpire=() => null] - Callback to be invoked when cache expires.
 * @returns {*} - Function that when invoked returns the result.
 */
function memoiseSync(fn, keygenFn, { ttl = null, onExpire = () => null } = {}) {
    const cache = {};

    return (...args) => {
        const key = keygenFn(...args);

        // Already stored in cache
        if (cache[key]) {
            const time = cache[key].ttl;

            if (time && Date.now() > time) {
                delete cache[key];
                return onExpire();
            }

            return cache[key].value;
        }

        // Store in cache
        cache[key] = {
            value: fn(...args),
            ttl: ttl ? (Date.now() + ttl) : null
        }

        return cache[key].value;
    }
}

/**
 * Memoise an asynchronous function call.
 * @param {*} fn - Async function or method to memoise.
 * @param {*} keygenFn - Callback that generates a unique key to store the result under it.
 * @param {Object} expiration - Cache expiration properties.
 * @param {number} [expiration.ttl=null] - Cache lifetime in ms, otherwise null for no expiration.
 * @param {*} [expiration.onExpire=() => null] - Callback to be invoked when cache expires.
 * @returns {*} - Async function that when invoked returns a promise
 *     which will be resolved with the result.
 */
function memoiseAsync(fn, keygenFn, { ttl = null, onExpire = () => null } = {}) {
    const cache = {};

    return async (...args) => {
        const key = keygenFn(...args);

        // Already stored in cache
        if (cache[key]) {
            const time = cache[key].ttl;

            if (time && Date.now() > time) {
                delete cache[key];
                return onExpire();
            }

            return cache[key].value;
        }

        // Store in cache
        cache[key] = {
            value: await fn(...args),
            ttl: ttl ? (Date.now() + ttl) : null
        }

        return cache[key].value;
    }
}

module.exports = { memoiseSync, memoiseAsync };
