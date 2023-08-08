import { useNavigate, useParams } from "react-router-dom";
import logo from '../../image/logo.png'
import { useEffect, useState } from "react";
import { isAddress, useBabyGameContract, useIpoContract } from "../../hooks/useContract";
import { useWeb3React } from "@web3-react/core";
import { AddressZero } from '@ethersproject/constants'
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import TipPop from "../../components/pop/TipPop";
import HeadBar from "../../components/headbar";
import { useTranslation } from "react-i18next";
import BigNumber from "bignumber.js";

const ethers = require('ethers');
const BabyGameAddr = process.env.REACT_APP_CONTRACT_BABYGAME + ""
const ipoAddr = process.env.REACT_APP_CONTRACT_IPO + ""

export default function Home({ }) {
  const navigate = useNavigate();
  const babyContract = useBabyGameContract(BabyGameAddr)
  const ipoContract = useIpoContract(ipoAddr)

  const { account, library } = useWeb3React()
  const params = useParams()
  const { t } = useTranslation()

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("loading")
  const [loadingText, setLoadingText] = useState<string>("")

  const [isTopInviter, setIsTopInviter] = useState<boolean>(false)
  const [isHaveInviter, setIsHaveInviter] = useState<boolean>(false)

  const [loadingHome, setLoadingHome] = useState<boolean>(false)

  const [shareAddr, setShareAddr] = useState<string>("")
  const [sharePop, setSharePop] = useState<boolean>(false)

  const [ipoAmount, setIpoAmount] = useState<string>("0")

  useEffect(() => {
    setLoadingHome(false)
    init()
    if (params.shareAddress) {
      console.log(" referrerCode ===", params.shareAddress)
      if (isAddress(params.shareAddress) && params.shareAddress !== AddressZero) {
        setShareAddr(params.shareAddress)
      }
    } else {
      setShareAddr("")
    }
  }, [account])

  const init = () => {
    // getUser()
    // getIsTopInviter()
    getLeaves()
    getUserState()
  }


  const getUserState = async () => {
    try {
      let data = await Promise.all([await babyContract?.getUser(account), await babyContract?.isTopInviter(account)])
      console.log("getUserState", data)
      setIsTopInviter(data[1])
      if (data[0][0].inviter == AddressZero) {
        setIsHaveInviter(false)
      } else {
        setIsHaveInviter(true)
      }
      setLoadingHome(true)
    } catch (error) {
      console.log("getUserState", error)
      setIsHaveInviter(false)
      setIsTopInviter(false)
      setLoadingHome(true)
    }
  }

  const getLeaves = async () => {
    let data = await ipoContract?.leaves()
    console.log("getLeaves", data, data.toString())
    setIpoAmount(new BigNumber(data.a.toString()).plus(data.b.toString()).plus(data.c.toString()).toString())
  }

  // const getIsTopInviter = async () => {
  //   let data = await babyContract?.isTopInviter(account)
  //   console.log("getIsTopInviter", data)
  //   setIsTopInviter(data)
  // }

  // getUser
  // const getUser = async () => {
  //   let data = await babyContract?.getUser(account)
  //   console.log("getUser", data)
  //   if (data[0].inviter == AddressZero) {
  //     setIsHaveInviter(false)
  //   } else {
  //     setIsHaveInviter(true)
  //   }
  // }
  // register
  const sendRegister = async () => {
    if (shareAddr == "" || !isAddress(shareAddr)) {
      setLoading(true)
      setLoadingState("error")
      setLoadingText(`${t("PleaseFillInTheCorrectAddress")}`)
      setTimeout(() => {
        setLoadingState("")
        setLoading(false)
      }, 2000);
      return
    }
    setLoading(true)
    setLoadingState("loading")
    setLoadingText(`${t("TransactionPacking")}`)
    try {
      const gas: any = await babyContract?.estimateGas.register(shareAddr, { from: account })
      console.log("sendJoin gas", gas)
      const response = await babyContract?.register(shareAddr, {
        from: account,
        gasLimit: gas.mul(105).div(100)
      });
      let provider = new ethers.providers.Web3Provider(library.provider);

      let receipt = await provider.waitForTransaction(response.hash);
      if (receipt !== null) {
        if (receipt.status && receipt.status == 1) {
          init()
          setSharePop(false)
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


  return <>
    <HeadBar setOpen={setSharePop} />
    <div className=" main">
      <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />

      <Dialog
        open={sharePop}
        onClose={() => {
          setSharePop(false)
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
            <p className=" font-bold text-xl mainTextColor mb-2  ">{t("inviteLink")}</p>
          </div>
          <TextField size='small'
            style={{
              width: "100%",
              height: "16px !important"
            }}
            placeholder={`${t("FillInThe")}`}
            value={shareAddr}
            onChange={(e) => {
              setShareAddr(e.target.value)
            }}
          />

          <div className=" mt-5  text-center">
            <p>
              <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  sendRegister()
                }}
              > {t("confirm")}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div className=" pt-32 pb-10 text-center  "  >
        <div className=" flex " style={{
          width: "150px",
          margin: "0 auto"
        }}>
          <img className=" rounded-full w-16 h-16  " src={logo} alt="" />
          <span className=" font-bold text-2xl mainTextColor ml-3 " style={{
            lineHeight: "64px",
            width: "70px"
          }}>BABY</span>
        </div>
      </div>

      <div className=" mx-3 pb-10 text-gray-400">
        <p className="indent-8 pb-3">
          {t("home1")}
        </p>
        <p className="indent-8">
          {t("home2")}
        </p>
      </div>

      {
        loadingHome && <>
          {/* {
            new BigNumber(ipoAmount).isZero() ? <></> : <div className=" text-center mt-5">
              <p>
                <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                  onClick={() => {
                    navigate("/ipo")
                  }}
                > {t("ipo")}</span>
              </p>
            </div>
          } */}

          <div className=" text-center mt-5">
            <p>
              <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  if (isHaveInviter || isTopInviter) {
                    navigate("/plan")
                  } else {
                    setSharePop(true)
                    return
                  }
                }}
              > {t("BabyPlan")} </span>
            </p>
          </div>

          <div className=" text-center mt-5">
            <p>
              <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  if (isHaveInviter || isTopInviter) {
                    navigate("/community")
                  } else {
                    setSharePop(true)
                    return
                  }
                }}
              > {t("myCommunity")}</span>
            </p>
          </div>

          <div className=" text-center mt-5">
            <p>
              <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
                onClick={() => {
                  if (isHaveInviter || isTopInviter) {
                    navigate("/wealth")
                  } else {
                    setSharePop(true)
                    return
                  }
                }}
              > {t("rebornWealth")}</span>
            </p>
          </div>

        </>
      }

    </div>
  </>

}