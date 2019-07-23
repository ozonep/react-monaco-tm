const COMMENT_PATTERN = /\/\*[\s\S]*?\*\/\r?\n?|\/\/.{0,200}?(?:\r?\n|$)/g;
const TRAILING_LF_PATTERN = /\r?\n$/;

export const minifyCheck = (code) => {
    if (code.length < 40) return false;
    code = code.replace(COMMENT_PATTERN, '').replace(TRAILING_LF_PATTERN, '');
    let lines = code.split('\n').map(l => l.length).filter(l => l);
    return lines.length <= 1 || median(lines) > 200;
};

const median = (values) => {
    values.sort((a, b) => a - b);
    let half = Math.floor(values.length / 2);
    if (values.length % 2) {
        return values[half];
    }
    return (values[half - 1] + values[half]) / 2;
};
