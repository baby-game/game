import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useWeb3React } from "@web3-react/core";
import { useERC20 } from "../../hooks/useContract";
import {Web3Provider} from "@ethersproject/providers";
import { AddressZero } from '@ethersproject/constants'

interface ITokenBalance {
    token: string,
    addr?: string
    decimalPlaces: number,
    tokenType?: number,
    setTokenBalance?:Function
}

export default function TokenBalance({ token, addr, decimalPlaces, tokenType,setTokenBalance }: ITokenBalance) {

    const { library } = useWeb3React();
    const tokenContract = useERC20(token);
    const [decimals, setDecimals] = useState<number>(0);
    const [balance, setBalance] = useState<string>('0');

    useEffect(() => {

        if (token ==AddressZero) {
            const provider = new Web3Provider(library.provider);
            provider.getBalance(addr + "").then((balance: any) => {
                setDecimals(18);
                setBalance(balance.toString());
                if(setTokenBalance) setTokenBalance(balance.toString());
            });
        } else {
            
                tokenContract?.balanceOf(addr).then(function (balance: any) {
                    setBalance(balance.toString());
                    if(setTokenBalance) setTokenBalance(balance.toString());

                    if(tokenType == 721){
                        return
                    }
                    tokenContract?.decimals().then(function (decimals: any) {
                        console.log(decimals, "TokenBalance")
                        setDecimals(Number(decimals.toString()));
                    });
                });
          

        };
    },[tokenContract]);

    return <>{
        tokenType == 721 ? <>{balance}</> : <>
            {
                decimals == 0 ? <></> : <>{new BigNumber(balance).dividedBy(10 ** decimals).toFixed(decimalPlaces)}</>
            }
        </>
    }
    </>
}