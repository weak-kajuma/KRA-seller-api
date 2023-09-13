export const combination = (
    nums: number[],
    k: number
): Array<Array<number>> => {
    let ans = [];
    if (nums.length < k) {
        return [];
    }
    if (k === 1) {
        for (let i = 0; i < nums.length; i++) {
            ans[i] = [nums[i]];
        }
    } else {
        for (let i = 0; i < nums.length - k + 1; i++) {
            let row = combination(nums.slice(i + 1), k - 1);
            for (let j = 0; j < row.length; j++) {
                ans.push([nums[i]].concat(row[j]));
            }
        }
    }
    return ans;
};

export const permutation = (
    nums: number[],
    k: number
): Array<Array<number>> => {
    let ans = [];
    if (nums.length < k) {
        return [];
    }
    if (k === 1) {
        for (let i = 0; i < nums.length; i++) {
            ans[i] = [nums[i]];
        }
    } else {
        for (let i = 0; i < nums.length; i++) {
            let parts = nums.slice(0);
            parts.splice(i, 1)[0];
            let row = permutation(parts, k - 1);
            for (let j = 0; j < row.length; j++) {
                ans.push([nums[i]].concat(row[j]));
            }
        }
    }
    return ans;
};

export const range = (begin: number, end: number) =>
    [...Array(end - begin + 1)].map((_, i) => begin + i);

export const noDupeRange = (begin: number, end: number, dup: number[]) =>
    range(begin, end).filter((e) => !dup.includes(e));
