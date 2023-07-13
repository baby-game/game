import { menuIcon } from '../../image'
import { useBabyGameContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
const BabyGameAddr = process.env.REACT_APP_CONTRACT_BABYGAME + ""

function Wealth() {
    const babyContract = useBabyGameContract(BabyGameAddr)
    const { account, library } = useWeb3React()
    const [dataList, setDataList] = useState<any>([])
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
    }


    return (
        <div className=" main">
            <div className=' pt-32  mx-3 pb-10'>
                {/* <h3 className="indent-8 font-bold text-xl mainTextColor">重生财富</h3> */}
            </div>
            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <h3 className='mainTextColor font-bold text-2xl text-center mb-2'>重生财富</h3>
                <div>
                    <div className=' flex'>
                        <div className=' flex-1'>
                            <div>
                                <div className='  flex '>
                                    <img
                                        className=' w-5 h-5 mr-2'
                                        src={menuIcon} alt="" />
                                    <p className='text-gray-400 text-sm'>待提取重生财富奖励</p>
                                </div>
                                <p className='font-bold text-3xl leading-loose'>
                                    100000
                                    <span className=' text-sm ml-3'>SOD</span>
                                </p>
                            </div>
                            <div>
                                <div className=' flex'>
                                    <div className=' flex-1 flex '>
                                        <img
                                            className='  w-5 h-5 mr-2'
                                            src={menuIcon} alt="" />
                                        <p className='text-gray-400 text-sm'>已提取重生财富奖励</p>
                                    </div>
                                </div>
                                <p className='font-bold text-3xl leading-loose'>
                                    100000
                                    <span className=' text-sm ml-3'>SOD</span>
                                </p>
                            </div>
                        </div>

                        <div className=' w-24'>
                            <p className=' text-center'>
                                <span className=' border-solid border rounded-3xl py-1 px-6 text-gray-400 font-bold  border-gray-400 cursor-pointer'>提现</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
                <p className=' indent-8 text-sm'>
                    每期熔断时，50%个人做市本金退回，另外50%按1.5倍重生财富奖励以SOD实时价格，每日（8:00）金本位奖励SOD，按照300天周期平均固定。
                </p>
            </div>
        </div>
    )
}

export default Wealth