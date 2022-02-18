import {utils} from 'ethers';

function removeTrailingZeros(str) {
    return str.replace(/\.?0+$/, "");
}

function numstrToBN(input, dec = 18) {
    if (!input) return BigNumber.from(0);
    const spl = input.split(".");
    if (spl[1]?.length > dec) {
        input = [spl[0], spl[1].slice(0, dec)].join(".");
    }
    return utils.parseUnits(input, dec);
}

function BNToNumstr(bn, dec = 18, prec = 3) {
    let res = BNToNumstrStrict(bn, dec, prec);
    if (res.split(".")[1]) res = removeTrailingZeros(res);
    return res;
}

function BNToNumstrStrict(bn, dec, prec) {
    if (!bn) return "0";
    const spl = utils.formatUnits(bn, dec).split(".");
    if (prec === 0) return spl[0];
    return [spl[0], ((spl[1] || "") + "0".repeat(prec)).slice(0, prec)].join(".");
}


function dateTimeFromUnix(timestamp) {
    const a = new Date(timestamp * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    // const sec = a.getSeconds();
    return date + ' ' + month + ', ' + ' ' + hour + ':' + min;
}

export {numstrToBN, BNToNumstr, dateTimeFromUnix};
