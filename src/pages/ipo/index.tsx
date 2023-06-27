import Button from '@mui/material/Button'
import { getProviderOrSigner, useIpoContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { MAX_UNIT256 } from '../../constants';
import { Contract } from '@ethersproject/contracts';
import ERC20ABI from '../../abi/ERC20.json';
import BigNumber from "bignumber.js";
import { toTokenValue } from '../../utils';
import TipPop from '../../components/pop/TipPop';

const ethers = require('ethers');

const ipoAddr = process.env.REACT_APP_CONTRACT_IPO + ""
const usdtAddr = process.env.REACT_APP_TOKEN_USDT + ""
function Ipo() {

    const ipoContract = useIpoContract(ipoAddr)
    const { account, library } = useWeb3React()

    const [isJoined, setIsJoined] = useState<boolean>(false);

    const [leave1, setLeave1] = useState<string>("0");
    const [leave2, setLeave2] = useState<string>("0");
    const [leave3, setLeave3] = useState<string>("0");

    // const [leaveType, setLeaveType] = useState<number>(0)

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingState, setLoadingState] = useState<string>("loading")
    const [loadingText, setLoadingText] = useState<string>("")

    useEffect(() => {
        init()
    }, [account])

    const init = () => {
        getJoined();
        getLeaves();
    }
    // function leaves () external view returns (uint a, uint b, uint c);
    // function join (uint gType) external; 0, 1, 2
    // function joined (address) external view returns (bool);
    // function closed() external view returns (bool);

    const getJoined = async () => {
        let data = await ipoContract?.joined(account)
        console.log("getJoined", data)
        setIsJoined(data)
    }

    const getLeaves = async () => {
        let data = await ipoContract?.leaves()
        console.log("getLeaves", data, data.toString())
        setLeave1(data.a.toString())
        setLeave2(data.b.toString())
        setLeave3(data.c.toString())
    }


    const sendJoin = async (leaveType: number) => {
        console.log("sendJoin leaveType", leaveType)
        let sendAmount
        if (leaveType == 0) {
            sendAmount = 10000
        } else if (leaveType == 1) {
            sendAmount = 5000
        } else if (leaveType == 2) {
            sendAmount = 2000
        }

        let usdtErc20 = new Contract(usdtAddr, ERC20ABI, getProviderOrSigner(library, account || "") as any);
        const allowance: any = await usdtErc20?.allowance(account, ipoAddr);

        const decimals: any = await usdtErc20?.decimals()

        console.log("sendJoin decimals", decimals)
        console.log("sendJoin allowance", allowance.toString())
        console.log("sendJoin sendAmount", sendAmount)
        setLoading(true)

        if (new BigNumber(allowance.toString()).isLessThan(toTokenValue(sendAmount, decimals))) {
            sendApprove(usdtErc20, ipoAddr, sendJoin, leaveType)
        } else {
            setLoadingState("loading")
            setLoadingText("交易打包中")
            try {
                const gas: any = await ipoContract?.estimateGas.join(leaveType, { from: account })
                const response = await ipoContract?.join(leaveType, {
                    from: account,
                    gasLimit: gas.mul(105).div(100)
                });
                let provider = new ethers.providers.Web3Provider(library.provider);

                let receipt = await provider.waitForTransaction(response.hash);
                if (receipt !== null) {
                    if (receipt.status && receipt.status == 1) {
                        init()
                        setLoadingState("success")
                        setLoadingText("交易成功")
                        setTimeout(() => {
                            setLoading(false)
                            setLoadingState("")
                        }, 2000);
                    } else {
                        setLoadingState("error")
                        setLoadingText("交易失败")
                        setTimeout(() => {
                            setLoadingState("")
                            setLoading(false)
                        }, 2000);
                    }
                }
            } catch (err: any) {
                setLoadingState("error")
                setLoadingText("交易失败")
                setTimeout(() => {
                    setLoadingState("")
                    setLoading(false)
                }, 2000);
            }
        }
    }

    const sendApprove = async (approveContract: any, approveAddress: string, send: Function, leaveType?: number) => {
        setLoadingState("loading")
        setLoadingText("授权中")
        try {
            const gas: any = await approveContract?.estimateGas.approve(approveAddress, MAX_UNIT256, { from: account });
            const response = await approveContract?.approve(approveAddress, MAX_UNIT256, {
                from: account,
                gasLimit: gas.mul(105).div(100)
            });
            let provider = new ethers.providers.Web3Provider(library.provider);

            let receipt = await provider.waitForTransaction(response.hash);
            if (receipt !== null) {
                if (receipt.status && receipt.status == 1) {
                    setLoadingState("success")
                    setLoadingText("授权成功")
                    if (leaveType != undefined) {
                        send(leaveType)
                    } else {
                        send()
                    }
                } else {
                    setLoadingState("error")
                    setLoadingText("授权失败")

                    setTimeout(() => {
                        setLoadingState("")
                        setLoading(false)
                    }, 2000);
                }
            }
        } catch (err: any) {
            setLoadingState("error")
            setLoadingText("授权失败")
            setTimeout(() => {
                setLoadingState("")
                setLoading(false)
            }, 2000);
        }
    }


    return (
        <div className='main'>
            <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />
            <div className=' pt-32  mx-3 pb-10'>
                <h3 className="indent-8 font-bold text-xl mainTextColor">BABY社交道牵头面向全球招募公会，旨在汇聚更多KOL和品牌社群，共同参与社区治理 </h3>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>全球创世公会</h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>名额</p>
                        <p className='  font-bold text-3xl leading-loose'>{leave1}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>金额</p>
                        <p className='  font-bold text-3xl leading-loose'>10000 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>
                <div>
                    <p className='text-gray-400'>获赠S5级别，享受超级公会专项奖等四重收益</p>
                </div>
                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            isJoined || new BigNumber(leave1).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>10000 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                            onClick={()=>{
                                sendJoin(0)
                            }}
                            >10000 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>全球超级公会</h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>名额</p>
                        <p className='  font-bold text-3xl leading-loose'>{leave2}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>金额</p>
                        <p className='  font-bold text-3xl leading-loose'>5000 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>
                <div>
                    <p className='text-gray-400'>获赠S4级别，享受超级公会专项奖等四重收益</p>
                </div>
                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            isJoined || new BigNumber(leave2).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>5000 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                            onClick={()=>{
                                sendJoin(1)
                            }}
                            >5000 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>全球社区公会</h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>名额</p>
                        <p className='  font-bold text-3xl leading-loose'>{leave3}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>金额</p>
                        <p className='  font-bold text-3xl leading-loose'>2000 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>
                <div>
                    <p className='text-gray-400'>获赠S3级别，享受社区公会专项奖等四重收益</p>
                </div>
                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            isJoined || new BigNumber(leave3).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>2000 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                            onClick={()=>{
                                sendJoin(2)
                            }}
                            >2000 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className=' pt-5 mx-3 pb-10'>
                <p className=' indent-8 text-gray-400'>同一账户只能获得其中一个公会名额，熔断重启后公会资格仍保留</p>
            </div>
        </div>
    )
}

export default Ipo