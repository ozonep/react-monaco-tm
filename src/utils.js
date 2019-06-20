export const debounce = (fn, time) => {
    let timeout;
    return function () {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    }
};

export const processSize = size => (/^\d+$/.test(size) ? `${size}px` : size);