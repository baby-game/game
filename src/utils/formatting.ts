import BigNumber from "bignumber.js";

export function formatAccount(value: any, lenStart: number, lenEnd: number) {
    if (!value) { return ""; }
    if (!lenStart) { lenStart = 8; }
    if (!lenEnd) { lenEnd = 8; }
    return value.slice(0, lenStart) + "..." + value.slice(-lenEnd)
}

export const verify = (value: any) => {
    let str = value;
    let len1 = str.substr(0, 1);
    let len2 = str.substr(1, 1);
    if (str.length > 1 && len1 == 0 && len2 != ".") {
        str = str.substr(1, 1);
    }
    if (len1 == ".") {
        str = "";
    }
    if (str.indexOf(".") != -1) {
        let str_ = str.substr(str.indexOf(".") + 1);
        if (str_.indexOf(".") != -1) {
            str = str.substr(0, str.indexOf(".") + str_.indexOf(".") + 1);
        }
    }
    if (str.length > 1 && str.charAt(str.length - 1) == '-') {
        str = str.substr(0, str.length - 1);
    }
    return str.replace(/[^\-^\d^\.]+/g, '');
};

export const formattingDate = (timestamp: any) => {
    console.log("formattingDate",new Date().getTime(),timestamp)

    const date = new Date(Number(timestamp.toString()) * 1000)
    if(new BigNumber(timestamp).isLessThan(new Date().getTime())){

        return  "可领取"
    }

    const year = date.getFullYear()
    // const month = date.getMonth() + 1
    // const day = date.getDate()


    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    // const formattedDate = `${year}年${month}月${day} ${hours}:${minutes}`
    const formattedDate = `${year}.${month}.${day}  ${hours}:${minutes}`

    return formattedDate;
}

