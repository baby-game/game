import { useNavigate, useParams } from "react-router-dom";
import logo from '../../image/logo.png'
import { useEffect, useState } from "react";
import { isAddress, useBabyGameContract } from "../../hooks/useContract";
import { useWeb3React } from "@web3-react/core";
import { AddressZero } from '@ethersproject/constants'
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import TipPop from "../../components/pop/TipPop";
const ethers = require('ethers');
const BabyGameAddr = process.env.REACT_APP_CONTRACT_BABYGAME + ""

export default function Home({ }) {
  const navigate = useNavigate();
  const babyContract = useBabyGameContract(BabyGameAddr)
  const { account, library } = useWeb3React()
  const params = useParams()

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("loading")
  const [loadingText, setLoadingText] = useState<string>("")


  const [isTopInviter, setIsTopInviter] = useState<boolean>(false)

  const [isHaveInviter, setIsHaveInviter] = useState<boolean>(false)

  const [shareAddr, setShareAddr] = useState<string>("")

  const [sharePop, setSharePop] = useState<boolean>(false)


  useEffect(() => {
    init()
    getIsTopInviter()
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
    getUser()
  }

  useEffect(() => {
    if (isTopInviter || isHaveInviter) {
      setSharePop(false)
    } else {
      setSharePop(true)
    }
  }, [isTopInviter, isHaveInviter])

  const getIsTopInviter = async () => {
    let data = await babyContract?.isTopInviter(account)
    console.log("getIsTopInviter", data)
    setIsTopInviter(data)
  }

  // getUser
  const getUser = async () => {
    let data = await babyContract?.getUser(account)
    console.log("getUser", data)
    if (data.inviter == AddressZero) {
      setIsHaveInviter(false)
    } else {
      setIsHaveInviter(true)
    }
  }
  // register
  const sendRegister = async () => {
    if (shareAddr == "" || !isAddress(shareAddr)) {
      setLoading(true)
      setLoadingState("error")
      setLoadingText("请填写正确的地址")
      setTimeout(() => {
        setLoadingState("")
        setLoading(false)
      }, 2000);
      return
    }
    setLoading(true)
    setLoadingState("loading")
    setLoadingText("交易打包中")
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
      // setSharePop(true)
      setLoadingState("error")
      setLoadingText("交易失败")
      setTimeout(() => {
        setLoadingState("")
        setLoading(false)
      }, 2000);
    }
  }



  return <div className=" main">
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
          <p className=" font-bold text-xl mainTextColor mb-2  ">邀请链接</p>
        </div>
        <TextField size='small'
          style={{
            width: "100%",
            height: "16px !important"
          }}
          placeholder='填写推荐人地址'
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
            >确认</span>
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
        BABY Social DAO致力于Web3.0、Metaverse和NFT领域，让世界各地的区块链爱好者通过自动做市商竞赛寻找宝贝来重新定义资源融合。这样，区块链爱好者可以愉快地参与而不影响他们的日常生活和工作，同时获得相应的区块链财富。
      </p>
      <p className="indent-8">
        基于SOD综合应用的唯一性和独特性，BABY Social DAO非常看好其发展前景，社区成员将通过宝贝计划获取SOD筹码。
      </p>
    </div>

    <div className=" text-center">
      <p>
        <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
          onClick={() => {
            navigate("/ipo")
          }}
        >公会申请 </span>
      </p>
    </div>

    <div className=" text-center mt-5">
      <p>
        {
          isHaveInviter || isTopInviter ? <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
            onClick={() => {
              navigate("/plan")
            }}
          >宝贝计划 </span> : <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>宝贝计划 </span>
        }
      </p>
    </div>

    <div className=" text-center mt-5">
      <p>
        {
          isHaveInviter || isTopInviter ? <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
            onClick={() => {
              navigate("/community")
            }}
          >我的社区 </span> : <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>我的社区 </span>
        }
      </p>
    </div>

    <div className=" text-center mt-5">
      <p>
        {
          isHaveInviter || isTopInviter ? <span className=' border-solid border rounded-3xl py-2 px-16 mainTextColor font-bold borderMain cursor-pointer'
            onClick={() => {
              navigate("/wealth")
            }}
          >重生财富 </span> : <span className=' border-solid border rounded-3xl py-2 px-16 text-gray-400 font-bold  border-gray-400 cursor-pointer'>重生财富 </span>
        }
      </p>
    </div>
  </div>
}