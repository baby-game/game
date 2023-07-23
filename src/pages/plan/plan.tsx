import { Dialog, DialogContent, FormControlLabel, InputAdornment, Radio, RadioGroup, Switch, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getProviderOrSigner, useBabyGameContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { ItemReward, formattingDate, verify } from '../../utils/formatting'
import { fromTokenValue, toTokenValue } from '../../utils'
import TokenBalance from '../../components/token/TokenBalance'
import TipPop from '../../components/pop/TipPop'
import BigNumber from "bignumber.js";
import { MAX_UNIT256 } from '../../constants'
import { Contract } from '@ethersproject/contracts'
import ERC20ABI from '../../abi/ERC20.json';
import HeadBar from '../../components/headbar'

const ethers = require('ethers');

const BabyGameAddr = process.env.REACT_APP_CONTRACT_BABYGAME + ""
const usdtAddr = process.env.REACT_APP_TOKEN_USDT + ""
const dayTime = process.env.REACT_APP_DAY + ""



function Plan() {

  const babyContract = useBabyGameContract(BabyGameAddr)
  const { account, library } = useWeb3React()
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("loading")
  const [loadingText, setLoadingText] = useState<string>("")


  const [sendAmount, setSendAmount] = useState<string>("")
  const [change, setChange] = useState<boolean>(false)

  const [accountBalance, setAccountBalance] = useState<string>("0")

  const [joinPop, setJoinPop] = useState<boolean>(false)

  const [joinWallet, setJoinWallet] = useState<string>("balance")

  const [baseDays, setBaseDays] = useState<number>(18)
  // const [reJoin, setReJoin] = useState<boolean>(false)

  // const [reJoinPop, setReJoinPop] = useState<boolean>(false)

  const [JoinItems, setJoinItems] = useState<any>([])
  let arr = [18, 48, 98, 188]

  const [rateList, setRateList] = useState<any>([])
  const [lastTime, setLastTime] = useState<string>("0")

  const [status1, setStatus1] = useState<string>("0")
  const [status2, setStatus2] = useState<string>("0")

  useEffect(() => {
    init()
    console.log("usdtAddr", usdtAddr)
  }, [account])

  const init = () => {
    getExpiredItemsValue()
    getUser()
    getJoinItems()
    getRate()
    getFusingStatus()
  }
  // fusingStatus
  const getFusingStatus = async () => {
    let data = await babyContract?.fusingStatus()
    console.log("getFusingStatus", data)
    setStatus1(data[0].toString())
    setStatus2(data[1].toString())
  }

  const getUser = async () => {
    let data = await babyContract?.getUser(account)
    console.log("getUser", data)
    setLastTime(data.lastSettleTime.toString())
    // setReJoin(data.reJoin)
  }

  const getRate = async () => {

    let promises = arr.map((item: any) => {
      return babyContract?.getStakeDayRate(item)
    });
    let data = await Promise.all(promises)
    console.log("getRate", data)
    setRateList(data)
  }


  //   getJoinItems
  const getJoinItems = async () => {
    let data = await babyContract?.getJoinItems(account, 0, 1000000000000)
    console.log("getJoinItems", data)
    setJoinItems(data)
  }

  const getExpiredItemsValue = async () => {
    try {
      let data = await babyContract?.expiredItemsValue(account)
      console.log("getExpiredItemsValue", data)
      setAccountBalance(data.amount.toString())
    } catch (error) {
      setAccountBalance("0")
    }
  }

  // function join(uint amount, uint amoutOutMin, uint baseDays,  bool flag) external; //flag: true, 用账户余额,false: 用钱包余额 baseDays: 18

  const sendJoin = async () => {

    let usdtErc20 = new Contract(usdtAddr, ERC20ABI, getProviderOrSigner(library, account || "") as any);
    const allowance: any = await usdtErc20?.allowance(account, BabyGameAddr);
    const decimals: any = await usdtErc20?.decimals()
    console.log("sendJoin decimals", decimals)
    console.log("sendJoin allowance", allowance.toString())
    setLoading(true)
    setLoadingState("loading")
    setLoadingText("交易打包中")
    let flag
    if (joinWallet === "balance") {
      console.log(" balance =", joinWallet)
      flag = false
    } else if (joinWallet === "accountBalance") {
      console.log(" accountBalance=", joinWallet)
      flag = true
    }

    if (new BigNumber(allowance.toString()).isLessThan(toTokenValue(sendAmount, decimals)) && !flag) {
      sendApprove(usdtErc20, BabyGameAddr, sendJoin)
    } else {
      setLoadingState("loading")
      setLoadingText("交易打包中")
      try {

        const gas: any = await babyContract?.estimateGas.join(toTokenValue(sendAmount, decimals), 0, baseDays, flag, { from: account })
        console.log("sendJoin gas", gas)

        const response = await babyContract?.join(toTokenValue(sendAmount, decimals), 0, baseDays, flag, {
          from: account,
          gasLimit: gas.mul(105).div(100)
        });
        let provider = new ethers.providers.Web3Provider(library.provider);

        let receipt = await provider.waitForTransaction(response.hash);
        if (receipt !== null) {
          if (receipt.status && receipt.status == 1) {
            init()
            setJoinPop(false)
            setSendAmount("")
            setLoadingState("success")
            setLoadingText("交易成功")
            setTimeout(() => {
              setChange(!change)
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
        console.log("sendJoin err", err)
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


  // reJoin
  const sendReJoin = async () => {
    setLoading(true)
    setLoadingState("loading")
    setLoadingText("交易打包中")
    // let flag = !reJoin
    let flag = true

    try {
      const gas: any = await babyContract?.estimateGas.reJoin(flag, { from: account })
      console.log("sendJoin gas", gas)
      const response = await babyContract?.reJoin(flag, {
        from: account,
        gasLimit: gas.mul(105).div(100)
      });

      let provider = new ethers.providers.Web3Provider(library.provider);

      let receipt = await provider.waitForTransaction(response.hash);
      if (receipt !== null) {
        if (receipt.status && receipt.status == 1) {
          init()
          // setReJoinPop(false)

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
      console.log("sendJoin err", err)
      setLoadingState("error")
      setLoadingText("交易失败")
      setTimeout(() => {
        setLoadingState("")
        setLoading(false)
      }, 2000);
    }
  }

  //takeBack
  const sendTakeBack = async () => {

    if (new BigNumber(accountBalance).isZero()) {
      setLoading(true)
      setLoadingState("error")
      setLoadingText("账号余额不足")
      setTimeout(() => {
        setLoadingState("")
        setLoading(false)
      }, 2000);
      return
    }
    setLoading(true)
    setLoadingState("loading")
    setLoadingText("交易打包中")

    // 1 <= 2  正常执行

    // 1 > 2  lasttime >= 1  reimburse

    if (new BigNumber(status1).isLessThanOrEqualTo(status2)) {
      try {
        if (!new BigNumber(lastTime).isLessThan(status1)) {
          const gas: any = await babyContract?.estimateGas.reimburse({ from: account })
          console.log("sendJoin gas", gas)
          const response = await babyContract?.reimburse({
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
              sendTakeBackLoadingErr()
            }
          }
        }

      } catch (error) {
        sendTakeBackLoadingErr()
      }

    } else {
      if(new BigNumber(lastTime).isLessThan(status1)){
        try {
          const gas: any = await babyContract?.estimateGas.setFusingTime({ from: account })
          console.log("sendJoin gas", gas)
          const response = await babyContract?.setFusingTime({
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
              sendTakeBackLoadingErr()
            }
          }
  
        } catch (error) {
          try {
            const gas: any = await babyContract?.estimateGas.takeBack(account, { from: account })
            console.log("sendJoin gas", gas)
            const response = await babyContract?.takeBack(account, {
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
                sendTakeBackLoadingErr()
              }
            }
          } catch (err: any) {
            sendTakeBackLoadingErr()
  
          }
        }
      }
    }
  }

  const sendTakeBackLoadingErr = () => {
    setLoadingState("error")
    setLoadingText("交易失败")
    setTimeout(() => {
      setLoadingState("")
      setLoading(false)
    }, 2000);
  }

  return (<>
    <HeadBar />
    <div className=" main">
      <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />

      <Dialog
        open={joinPop}
        onClose={() => {
          setJoinPop(false)
        }}
        sx={{
          '& .MuiDialog-paper': {
            width: 300,
            maxWidth: '80%',
            background: '#fff',
          }
        }}
        maxWidth="md"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <div>
            <p className=" font-bold text-xl mainTextColor mb-2  ">参与做市</p>
          </div>
          <div>
            <div>
              <p className=' text-sm'>
                参与做市金额: <span className='font-bold text-xl '>{sendAmount} </span> <span className=' text-sm ml-1 font-bold '>USDT</span>
              </p>
            </div>
            <RadioGroup
              row
              aria-labelledby="demo-error-radios"
              value={joinWallet}
              onChange={(e) => {
                console.log(e.target.value)
                setJoinWallet(e.target.value)
              }}
            >
              <FormControlLabel value="balance" sx={{
                '& .MuiTypography-root': {
                  fontSize: "0.875rem"
                },
              }} control={<Radio sx={{
                color: "rgb(60, 125, 104)",

                '&.Mui-checked': {
                  color: "rgb(60, 125, 104)",
                },
              }} />} label="钱包余额" />
              <FormControlLabel value="accountBalance" sx={{
                '& .MuiTypography-root': {
                  fontSize: "0.875rem"
                },
              }} control={<Radio sx={{
                color: "rgb(60, 125, 104)",
                '&.Mui-checked': {
                  color: "rgb(60, 125, 104)",
                },
              }} />} label="账户余额" />
            </RadioGroup>
          </div>

          <div className=" mt-5  text-center">
            <p>
              <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  sendJoin()
                }}
              >确认</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <div className='bg-white rounded-2xl  mt-32  mx-3 mb-5 p-3'>
        <div className='flex text-center'>
          <div className=' flex-1'>
            <p className=' text-sm text-gray-400'>USDT 钱包余额</p>
            <p className=' font-bold text-xl leading-loose'>
              {
                usdtAddr && account && <TokenBalance token={usdtAddr} addr={account + ""} change={change} decimalPlaces={2} />
              }
            </p>
          </div>
          <div className=' flex-1'>
            <p className=' text-sm text-gray-400'>USDT 账户余额</p>
            <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>{fromTokenValue(accountBalance, 18, 2)}</p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className=' mt-2'>
          <TextField size='small'
            style={{
              width: "100%",
              height: "16px !important"
            }}
            placeholder='点击或输入数量'
            value={sendAmount}
            onChange={(e) => {
              setSendAmount(verify(e.target.value))
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
            }} />
        </div>
        <div className=' flex flex-wrap py-3'>
          <div className=' w-1/3'>
            <p className=' text-center leading-10'>
              <span onClick={() => {
                setSendAmount("100")
              }} className={sendAmount == "100" ? "selectAmount" : "unSelectAmount"}> 100</span>
            </p>
          </div>

          <div className=' w-1/3'>
            <p className=' text-center leading-10'>
              <span onClick={() => {
                setSendAmount("200")
              }} className={sendAmount == "200" ? "selectAmount" : "unSelectAmount"}> 200</span>
            </p>
          </div>

          <div className=' w-1/3'>
            <p className=' text-center leading-10'>
              <span onClick={() => {
                setSendAmount("400")
              }} className={sendAmount == "400" ? "selectAmount" : "unSelectAmount"}> 400</span>
            </p>
          </div>

          <div className=' w-1/3'>
            <p className=' text-center leading-10'>
              <span onClick={() => {
                setSendAmount("500")
              }} className={sendAmount == "500" ? "selectAmount" : "unSelectAmount"}> 500</span>
            </p>
          </div>

          <div className=' w-1/3'>
            <p className=' text-center leading-10'>
              <span onClick={() => {
                setSendAmount("700")
              }} className={sendAmount == "700" ? "selectAmount" : "unSelectAmount"}> 700</span>
            </p>
          </div>

          <div className=' w-1/3'>
            <p className=' text-center leading-10'>
              <span onClick={() => {
                setSendAmount("1000")
              }} className={sendAmount == "1000" ? "selectAmount" : "unSelectAmount"}> 1000</span>
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className=' flex'>
          <div className='w-1/2'>
            <div>
              <p style={{
                lineHeight: "50px"
              }} className=' text-gray-400'>3-18天合约做市</p>
              <p className=' font-bold text-xl break-words whitespace-normal'>
              </p>
            </div>
          </div>
          <div className='w-1/2'>
            <p className=' text-center' style={{
              lineHeight: "50px"
            }}>
              {
                rateList[0] && new BigNumber(rateList[0].toString()).isGreaterThan(0) ? <span className=' border-solid border rounded-3xl py-2 px-4 mainTextColor font-bold borderMain cursor-pointer'
                  onClick={() => {
                    if (!new BigNumber(sendAmount).isGreaterThan(0)) {
                      setLoading(true)
                      setLoadingState("error")
                      setLoadingText("请填写数量")
                      setTimeout(() => {
                        setLoadingState("")
                        setLoading(false)
                      }, 2000);
                      return
                    } else {
                      setBaseDays(18)
                      setJoinPop(true)
                    }
                  }}
                >参与做市 </span> : <span className=' border-solid border rounded-3xl py-2 px-4  font-bold  cursor-pointer text-gray-400   border-gray-400'>参与做市 </span>
              }
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className=' flex'>
          <div className='w-1/2'>
            <div>
              <p style={{
                lineHeight: "50px"
              }} className=' text-gray-400'>3-48天合约做市</p>
              <p className=' font-bold text-xl break-words whitespace-normal'>
              </p>
            </div>
          </div>
          <div className='w-1/2'>
            <p className=' text-center' style={{
              lineHeight: "50px"
            }}>
              {
                rateList[1] && new BigNumber(rateList[1].toString()).isGreaterThan(0) ? <span className=' border-solid border rounded-3xl py-2 px-4 mainTextColor font-bold borderMain cursor-pointer'
                  onClick={() => {
                    if (!new BigNumber(sendAmount).isGreaterThan(0)) {
                      setLoading(true)
                      setLoadingState("error")
                      setLoadingText("请填写数量")
                      setTimeout(() => {
                        setLoadingState("")
                        setLoading(false)
                      }, 2000);
                      return
                    } else {
                      setBaseDays(48)
                      setJoinPop(true)
                    }
                  }}
                >参与做市 </span> : <span className=' border-solid border rounded-3xl py-2 px-4  font-bold  cursor-pointer text-gray-400   border-gray-400'>参与做市 </span>
              }
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className=' flex'>
          <div className='w-1/2'>
            <div>
              <p style={{
                lineHeight: "50px"
              }} className=' text-gray-400'>3-98天合约做市</p>
              <p className=' font-bold text-xl break-words whitespace-normal'>
              </p>
            </div>
          </div>
          <div className='w-1/2'>
            <p className=' text-center' style={{
              lineHeight: "50px"
            }}>
              {
                rateList[2] && new BigNumber(rateList[2].toString()).isGreaterThan(0) ? <span className=' border-solid border rounded-3xl py-2 px-4 mainTextColor font-bold borderMain cursor-pointer'
                  onClick={() => {
                    if (!new BigNumber(sendAmount).isGreaterThan(0)) {
                      setLoading(true)
                      setLoadingState("error")
                      setLoadingText("请填写数量")
                      setTimeout(() => {
                        setLoadingState("")
                        setLoading(false)
                      }, 2000);
                      return
                    } else {
                      setBaseDays(98)
                      setJoinPop(true)
                    }
                  }}
                >参与做市 </span> : <span className=' border-solid border rounded-3xl py-2 px-4  font-bold  cursor-pointer text-gray-400   border-gray-400'>参与做市 </span>
              }
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className=' flex'>
          <div className='w-1/2'>
            <div>
              <p style={{
                lineHeight: "50px"
              }} className=' text-gray-400'>3-188天合约做市</p>
              <p className=' font-bold text-xl break-words whitespace-normal'>
              </p>
            </div>
          </div>
          <div className='w-1/2'>
            <p className=' text-center' style={{
              lineHeight: "50px"
            }}>
              {
                rateList[3] && new BigNumber(rateList[3].toString()).isGreaterThan(0) ? <span className=' border-solid border rounded-3xl py-2 px-4 mainTextColor font-bold borderMain cursor-pointer'
                  onClick={() => {
                    if (!new BigNumber(sendAmount).isGreaterThan(0)) {
                      setLoading(true)
                      setLoadingState("error")
                      setLoadingText("请填写数量")
                      setTimeout(() => {
                        setLoadingState("")
                        setLoading(false)
                      }, 2000);
                      return
                    } else {
                      setBaseDays(188)
                      setJoinPop(true)
                    }
                  }}
                >参与做市 </span> : <span className=' border-solid border rounded-3xl py-2 px-4  font-bold  cursor-pointer text-gray-400   border-gray-400'>参与做市 </span>
              }
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl  mx-3 mb-5 p-3'>
        <div className=' flex'>

          <p className='mainTextColor font-bold w-1/2 '>入金记录</p>
          <p className=' text-center w-1/2' >
            {
              new BigNumber(status1).isLessThanOrEqualTo(status2) && new BigNumber(lastTime).isLessThan(status1) ? <span className=' border-solid border rounded-2xl py-1 px-4 text-gray-400 font-bold  cursor-pointer'
              >提现 </span> : <span className=' border-solid border rounded-2xl py-1 px-4 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  sendTakeBack()
                }}
              >提现 </span>
            }

          </p>
        </div>

        <div className=' pt-2 pb-4 ' style={{
          maxHeight: "330px",
          overflow: 'scroll'
        }} >
          {
            JoinItems && JoinItems.map((item: any) => {
              return <div className={new BigNumber(lastTime).isGreaterThan(item.dueTime.toString()) ? "text-xs rounded-md border p-1 m-1 " : "text-xs rounded-md border p-1 m-1 borderMain"} key={item.createTime.toString()}>
                <div className=' flex'>
                  <div className=' w-1/2'>
                    <p>本金: <span className='mainTextColor'>{fromTokenValue(item.value, 18, 3)}</span></p>
                  </div>
                  <div className=' w-1/2'>
                    <p>收益: <span className='mainTextColor'>{fromTokenValue(ItemReward(item), 18, 2)}</span></p>
                  </div>
                </div>
                <div>
                  <p>周期: <span className='mainTextColor'>{formattingDate(item.createTime)}</span>-<span className='mainTextColor'>{formattingDate(item.dueTime)}</span></p>
                </div>
              </div>
            })
          }
        </div>
      </div>
    </div>
  </>
  )
}

export default Plan