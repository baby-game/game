import { getProviderOrSigner, useIpoContract, useRouterContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { MAX_UNIT256 } from '../../constants';
import { Contract } from '@ethersproject/contracts';
import ERC20ABI from '../../abi/ERC20.json';
import BigNumber from "bignumber.js";
import { toTokenValue } from '../../utils';
import TipPop from '../../components/pop/TipPop';
import HeadBar from '../../components/headbar';
import { useTranslation } from 'react-i18next';

const ethers = require('ethers');

const ipoAddr = process.env.REACT_APP_CONTRACT_IPO + ""
const usdtAddr = process.env.REACT_APP_TOKEN_USDT + ""
const tokenkAddr = process.env.REACT_APP_TOKEN_TOKEN + ""
function Ipo() {
    const { t } = useTranslation()

    const ipoContract = useIpoContract(ipoAddr)
    const routerContract = useRouterContract();

    const { account, library } = useWeb3React()

    const [isJoined, setIsJoined] = useState<boolean>(false);

    const [leave1, setLeave1] = useState<string>("0");
    const [leave2, setLeave2] = useState<string>("0");
    const [leave3, setLeave3] = useState<string>("0");
    const [leave4, setLeave4] = useState<string>("0");

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
        setLeave4(data.d.toString())
    }

    const sendJoin = async (leaveType: number) => {
        console.log("sendJoin leaveType", leaveType)
        let sendAmount = 0
        if (leaveType == 0) {
            sendAmount = 10000
        } else if (leaveType == 1) {
            sendAmount = 5000
        } else if (leaveType == 2) {
            sendAmount = 2000
        } else if (leaveType == 4) {
            sendAmount = 500
        }

        let usdtErc20 = new Contract(usdtAddr, ERC20ABI, getProviderOrSigner(library, account || "") as any);
        const allowance: any = await usdtErc20?.allowance(account, ipoAddr);

        const decimals: any = await usdtErc20?.decimals()

        setLoading(true)

        setLoadingState("loading")
        setLoadingText(`${t("TransactionPacking")}`)

        if (new BigNumber(allowance.toString()).isLessThan(toTokenValue(sendAmount, decimals))) {
            sendApprove(usdtErc20, ipoAddr, sendJoin, leaveType)
        } else if (leaveType == 4) {
            setLoadingState("loading")
            setLoadingText(`${t("TransactionPacking")}`)
            try {

                let info = await routerContract?.getAmountsOut(toTokenValue(new BigNumber(sendAmount).multipliedBy(55).dividedBy(200).toString(), decimals), [usdtAddr, tokenkAddr])

                console.log("sendJoin info", info, info.toString(), info[1].toString())

                const gas: any = await ipoContract?.estimateGas.joinNew(leaveType, info[1].toString(), { from: account })
                console.log("sendJoin gas", gas)
                const response = await ipoContract?.joinNew(leaveType, info[1].toString(), {
                    from: account,
                    gasLimit: gas.mul(105).div(100)
                });
                let provider = new ethers.providers.Web3Provider(library.provider);
                let receipt = await provider.waitForTransaction(response.hash);
                if (receipt !== null) {
                    if (receipt.status && receipt.status == 1) {
                        init()
                        sendLoadingSuccess()
                    } else {
                        sendLoadingErr()
                    }
                }
            } catch (err: any) {
                console.log("sendJoin err", err)
                sendLoadingErr()
            }
        } else {
            setLoadingState("loading")
            setLoadingText(`${t("TransactionPacking")}`)
            try {

                let info = await routerContract?.getAmountsOut(toTokenValue(new BigNumber(sendAmount).multipliedBy(55).dividedBy(200).toString(), decimals), [usdtAddr, tokenkAddr])

                console.log("sendJoin info", info, info.toString(), info[1].toString())

                const gas: any = await ipoContract?.estimateGas.join(leaveType, info[1].toString(), { from: account })
                console.log("sendJoin gas", gas)
                const response = await ipoContract?.join(leaveType, info[1].toString(), {
                    from: account,
                    gasLimit: gas.mul(105).div(100)
                });
                let provider = new ethers.providers.Web3Provider(library.provider);
                let receipt = await provider.waitForTransaction(response.hash);
                if (receipt !== null) {
                    if (receipt.status && receipt.status == 1) {
                        init()
                        sendLoadingSuccess()
                    } else {
                        sendLoadingErr()
                    }
                }
            } catch (err: any) {
                console.log("sendJoin err", err)
                sendLoadingErr()
            }
        }
    }

    const sendLoadingErr = () => {
        setLoadingState("error")
        setLoadingText(`${t("transactionFailed")}`)
        setTimeout(() => {
            setLoadingState("")
            setLoading(false)
        }, 2000);
    }

    const sendLoadingSuccess = () => {
        setLoadingState("success")
        setLoadingText(`${t("successfulTransaction")}`)
        setTimeout(() => {
            setLoading(false)
            setLoadingState("")
        }, 2000);
    }

    const sendApprove = async (approveContract: any, approveAddress: string, send: Function, leaveType?: number) => {
        setLoadingState("loading")
        setLoadingText(`${t("Authorizing")}`)

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
                    setLoadingText(`${t("AuthorizationSuccessful")}`)

                    if (leaveType != undefined) {
                        send(leaveType)
                    } else {
                        send()
                    }
                } else {
                    setLoadingState("error")
                    setLoadingText(`${t("AuthorizationFailed")}`)
                    setTimeout(() => {
                        setLoadingState("")
                        setLoading(false)
                    }, 2000);
                }
            }
        } catch (err: any) {
            setLoadingState("error")
            setLoadingText(`${t("AuthorizationFailed")}`)
            setTimeout(() => {
                setLoadingState("")
                setLoading(false)
            }, 2000);
        }
    }


    return (<>
        <HeadBar />
        <div className='main'>
            <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />
            <div className=' pt-32  mx-3 pb-10'>
                <h3 className="indent-8 font-bold text-xl mainTextColor">{t("ipo1")} </h3>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>{t("GlobalCreationAssociation")} </h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>{t("Quota")} </p>
                        <p className='  font-bold text-3xl leading-loose'>{leave1}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>{t("theAmount")} </p>
                        <p className='  font-bold text-3xl leading-loose'>10000 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>
                <div>
                    <p className='text-gray-400'>{t("ipo2")} </p>
                </div>
                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            isJoined || new BigNumber(leave1).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>10000 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                                onClick={() => {
                                    sendJoin(0)
                                }}
                            >10000 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>{t("GlobalSuperGuild")} </h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>{t("Quota")} </p>
                        <p className='  font-bold text-3xl leading-loose'>{leave2}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>{t("theAmount")} </p>
                        <p className='  font-bold text-3xl leading-loose'>5000 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>
                <div>
                    <p className='text-gray-400'>{t("ipo3")} </p>
                </div>
                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            isJoined || new BigNumber(leave2).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>5000 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                                onClick={() => {
                                    sendJoin(1)
                                }}
                            >5000 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>{t("GlobalCommunityGuild")} </h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>{t("Quota")} </p>
                        <p className='  font-bold text-3xl leading-loose'>{leave3}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>{t("theAmount")} </p>
                        <p className='  font-bold text-3xl leading-loose'>2000 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>
                <div>
                    <p className='text-gray-400'>{t("ipo4")} </p>
                </div>
                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            isJoined || new BigNumber(leave3).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>2000 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                                onClick={() => {
                                    sendJoin(2)
                                }}
                            >2000 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl mt-2'>申请S3 </h3>
                <div className=' flex my-3'>
                    <div className=' flex-1 text-center'>
                        <p className='  text-gray-400 text-sm'>{t("Quota")} </p>
                        <p className='  font-bold text-3xl leading-loose'>{leave4}</p>
                    </div>
                    <div className=' flex-1 text-center'>
                        <p className='text-gray-400 text-sm'>{t("theAmount")} </p>
                        <p className='  font-bold text-3xl leading-loose'>500 <span className=' text-sm'>USDT</span></p>
                    </div>
                </div>

                <div className=" text-center my-2 py-2">
                    <p>
                        {
                            isJoined || new BigNumber(leave3).isZero() ? <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>500 USDT </span> : <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                                onClick={() => {
                                    sendJoin(4)
                                }}
                            >500 USDT </span>
                        }
                    </p>
                </div>
            </div>

            <div className=' pt-5 mx-3 pb-10'>
                <p className=' indent-8 text-gray-400'>{t("ipo5")}</p>
            </div>
        </div>
    </>
    )
}

export default Ipo