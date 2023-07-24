import { menuIcon } from '../../image'
import { useBabyGameContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import HeadBar from '../../components/headbar'
import TipPop from '../../components/pop/TipPop'
import { fromTokenValue } from '../../utils'
import BigNumber from "bignumber.js";
import { Days } from '../../constants'

const ethers = require('ethers');

const BabyGameAddr = process.env.REACT_APP_CONTRACT_BABYGAME + ""
const dayTime = process.env.REACT_APP_DAY + ""

function Wealth() {
    const babyContract = useBabyGameContract(BabyGameAddr)
    const { account, library } = useWeb3React()
    const [dataList, setDataList] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingState, setLoadingState] = useState<string>("loading")
    const [loadingText, setLoadingText] = useState<string>("")
    useEffect(() => {
        init()
    }, [account])
    const init = () => {
        getReparations()
    }
    // getReparations
    const getReparations = async () => {
        let data = await babyContract?.getReparations(account)
        console.log("getReparations", data)
        if (data !== undefined) {
            data[0].amount.toString()
            setDataList(data.reverse())
        }
    }
    // getReimburse
    const sendGetReimburse = async (index: number) => {

        setLoadingState("loading")
        setLoadingText("交易打包中")
        try {

            const gas: any = await babyContract?.estimateGas.getReimburse(index, account, { from: account })
            console.log("sendJoin gas", gas)
            const response = await babyContract?.getReimburse(index, account, {
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

    const sendLoadingErr = () => {
        setLoadingState("error")
        setLoadingText("交易失败")
        setTimeout(() => {
            setLoadingState("")
            setLoading(false)
        }, 2000);
    }

    const sendLoadingSuccess = () => {
        setLoadingState("success")
        setLoadingText("交易成功")
        setTimeout(() => {
            setLoading(false)
            setLoadingState("")
        }, 2000);
    }


    const ItemEarnings = (item: any) => {
        const timeNow = new BigNumber(new Date().getTime() / 1000).dividedBy(dayTime).toFixed(0)
        let returnAmount = "0"
        if (new BigNumber(timeNow).isLessThan(item.startDayIndex.toString())) {
            returnAmount = fromTokenValue(new BigNumber(item.amount.toString()).multipliedBy(new BigNumber(timeNow).minus(item.startDayIndex.toString())).dividedBy(300).toString(), 18, 3)
        } else {
            returnAmount = fromTokenValue(new BigNumber(item.amount.toString()).multipliedBy(new BigNumber(item.endDayIndex.toString()).minus(item.startDayIndex.toString())).dividedBy(300).toString(), 18, 3)
        }

        return returnAmount
    }

    const ItemUnEarnings = (item: any) => {
        return fromTokenValue(new BigNumber(item.amount.toString()).multipliedBy(new BigNumber(300).plus(item.startDayIndex.toString()).minus(item.endDayIndex.toString())).dividedBy(300).toString(), 18, 3)
    }

    return (<>
        <HeadBar />
        <div className=" main">
            <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />

            <div className=' pt-32  mx-3 pb-10'>
                {/* <h3 className="indent-8 font-bold text-xl mainTextColor">重生财富</h3> */}
            </div>

            {
                dataList && dataList.map((item: any, index: number) => {
                    return <div className='bg-white rounded-2xl  mx-3 mb-5 p-3' key={index}>
                        <h3 className='mainTextColor font-bold text-2xl text-center mb-2'>重生财富第{dataList.length - index}期</h3>
                        <div>
                            <div className=' flex'>
                                <div className=' w-52'>
                                    <div>
                                        <div className='  flex mb-2'>
                                            <img
                                                className=' w-5 h-5 mr-2'
                                                src={menuIcon} alt="" />
                                            <p className='text-gray-400 text-sm '>待提取重生财富奖励</p>
                                        </div>
                                        <p className='font-bold text-xl  break-words '>
                                            {
                                                ItemEarnings(item)
                                            }
                                            <span className=' text-sm ml-3'>USDT</span>
                                        </p>
                                    </div>
                                    <div>
                                        <div className=' flex  my-2'>
                                            <div className=' flex-1 flex '>
                                                <img
                                                    className='  w-5 h-5 mr-2'
                                                    src={menuIcon} alt="" />
                                                <p className='text-gray-400 text-sm'>已提取重生财富奖励</p>
                                            </div>
                                        </div>
                                        <p className='font-bold text-xl break-words '>
                                            {
                                                ItemUnEarnings(item)
                                            }
                                            <span className=' text-sm ml-3 '>USDT</span>
                                        </p>
                                    </div>
                                </div>

                                <div className=' flex-1'>
                                    <p className='  text-right'>
                                        {
                                            new BigNumber(item.startDayIndex.toString()).isGreaterThan(item.endDayIndex.toString()) ? <span className=' border-solid border rounded-3xl py-1 px-6 text-gray-400 font-bold  border-gray-400 cursor-pointer'>提现</span> : <span className=' border-solid border rounded-3xl py-1 px-6   mainTextColor font-bold borderMain cursor-pointer'
                                                onClick={() => {
                                                    sendGetReimburse(index)
                                                }}>提现</span>
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                })
            }

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <p className=' indent-8 text-sm'>
                    每期熔断时，50%个人做市本金退回，另外50%按1.5倍重生财富奖励。以SOD实时价格，每日（8:00）金本位奖励SOD，按照300天周期平均固定。
                </p>
            </div>
        </div>
    </>

    )
}

export default Wealth