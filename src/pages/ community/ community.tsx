import { useWeb3React } from "@web3-react/core"
import { useEffect, useState } from "react"
import { useBabyGameContract } from "../../hooks/useContract"
import BigNumber from "bignumber.js";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import TipPop from "../../components/pop/TipPop";
import { fromTokenValue } from "../../utils";
import copy from 'copy-to-clipboard';
import { formatAccount } from "../../utils/formatting";
import { copyIcon } from "../../image";
import HeadBar from "../../components/headbar";

const ethers = require('ethers');

const BabyGameAddr = process.env.REACT_APP_CONTRACT_BABYGAME + ""

function Community() {

  const babyContract = useBabyGameContract(BabyGameAddr)
  const { account, library } = useWeb3React()

  const [canReward, setCanReward] = useState<string>('0');

  const [scale, setScale] = useState<string>("0")
  const [scalePop, setScalePop] = useState<boolean>(false)
  //   struct User {
  //     address inviter; //推荐人
  //     uint value; //有效
  //     uint scale; //等级
  //     uint lastSettleTime;
  //     bool reJoin; //是否自动入市, 也就是入金到期后自动续期

  //     uint inviteAwardValue; //直推奖
  //     uint scaleAwardValue;  //社区奖
  //     uint contributionAwardValue; //贡献奖

  //     uint inviteValue; //伞下总业绩
  //     address maxZone;  //大区
  // uint inviteCount;  //推荐人数
  //       uint inviteTotalCount; //社区人数
  // }
  const [inviteAwardValue, setInviteAwardValue] = useState<string>("0")
  const [scaleAwardValue, setScaleAwardValue] = useState<string>("0")
  const [contributionAwardValue, setContributionAwardValue] = useState<string>("0")
  const [inviteValue, setInviteValue] = useState<string>("0")
  const [value, setValue] = useState<string>("0")
  const [inviteCount, setInviteCount] = useState<string>("0")
  const [inviteTotalCount, setInviteTotalCount] = useState<string>("0")



  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("loading")
  const [loadingText, setLoadingText] = useState<string>("")

  const getUser = async () => {
    let data = await babyContract?.getUser(account)
    console.log("getUser", data)
    setScale(data.scale.toString())
    setInviteAwardValue(data.inviteAwardValue.toString())
    setScaleAwardValue(data.scaleAwardValue.toString())
    setContributionAwardValue(data.contributionAwardValue.toString())
    setInviteValue(data.inviteValue.toString())
    setValue(data.value.toString())
    setInviteCount(data.inviteCount.toString())
    setInviteTotalCount(data.inviteTotalCount.toString())
  }
  useEffect(() => {
    init()
  }, [account])

  const init = () => {
    getUser()
    getContributioRewardValue()
  }

  const getContributioRewardValue = async () => {
    let data = await babyContract?.contributioRewardValue()

    setCanReward(data.toString())
    console.log("getContributioRewardValue", data)
  }


  // function harvestContributioReward(address to) external; //我的社区里的提现

  const sendHarvestContributioReward = async () => {
    if (new BigNumber(canReward).isZero()) {
      setLoading(true)
      setLoadingState("error")
      setLoadingText("没有待提取奖励")
      setTimeout(() => {
        setLoadingState("")
        setLoading(false)
      }, 2000);
      return
    }
    setLoadingState("loading")
    setLoadingText("交易打包中")
    try {

      const gas: any = await babyContract?.estimateGas.harvestContributioReward(account, { from: account })
      console.log("sendJoin gas", gas)
      const response = await babyContract?.harvestContributioReward(account, {
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

      console.log("sendJoin err", err)

      setLoadingState("error")
      setLoadingText("交易失败")
      setTimeout(() => {
        setLoadingState("")
        setLoading(false)
      }, 2000);
    }
  }

  return (<>
    <HeadBar />
    <div className=" main">
      <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />

      <Dialog
        open={scalePop}
        onClose={() => {
          setScalePop(false)
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
            <p className=" font-bold text-xl mainTextColor mb-2  ">等级介绍</p>
          </div>
          <Grid container className=' mb-3 flex text-sm'>
            <p>S1:社区做市金额≥1000USDT</p>
            <p>S2:社区内不同市场出现2个S1</p>
            <p>S3:社区内不同市场出现2个S2</p>
            <p>S4:社区内不同市场出现3个S3</p>
            <p>S5:社区内不同市场出现3个S4</p>
          </Grid>
        </DialogContent>
      </Dialog>
      <div className='bg-white rounded-2xl mt-32  mx-3 mb-5 p-3'>
        <div className='mainTextColor font-bold text-2xl flex  mb-2'>
          分享链接:
          <div className=" flex mt-2" onClick={() => {
            copy(window.location.host + "/home/" + account + "");
            setLoading(true)
            setLoadingState("success")
            setLoadingText("复制成功")
            setTimeout(() => {
              setLoadingState("")
              setLoading(false)
            }, 2000);
          }}>
            <span className=' text-base mx-2 ' > {formatAccount(account, 6, 6)}</span>
            <img className="w-5 h-5" src={copyIcon} alt="" />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl mx-3 mb-5 px-3 py-5'>

        <div className=" flex">
          <div className=" flex-1">
            <p className=' leading-8  font-bold mainTextColor text-xl'>我的级别</p>
          </div>
          <div className=" flex-1">
            <p className=" leading-8 text-center">
              <span
                className=" borderMain rounded-full border-solid border-4 px-8 py-1 cursor-pointer"
                onClick={() => {
                  setScalePop(true)
                }}>S{scale}</span>
            </p>
          </div>
        </div>

        {/* <div className=" flex pt-4">
          <div className=" w-1/2">
            <p className=" text-gray-400 text-sm">
              推广用户:
              <span className=" text-black text-base font-bold ml-2">111</span>
            </p>
          </div>
          <div className=" w-1/2">
            <p className=" text-gray-400 text-sm">
              社区用户:
              <span className=" text-black text-base font-bold ml-2">111</span>
            </p>
          </div>
        </div> */}

        <div className="pt-4">
          <div >
            <p className=" text-gray-400 text-sm">
              推广用户:
              <span className=" text-black text-base font-bold ml-2">{inviteCount}</span>
            </p>
          </div>
          <div >
            <p className=" text-gray-400 text-sm">
              社区用户:
              <span className=" text-black text-base font-bold ml-2">{inviteTotalCount}</span>
            </p>
          </div>
        </div>

        <div className=" flex pt-1 border-b-2 border-dashed">
          <div className=" w-1/2">
            <p className=' text-sm text-gray-400'>个人做市金额</p>
            <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>{fromTokenValue(value, 18, 3)}</p>
          </div>
          <div className=" w-1/2">
            <p className=' text-sm text-gray-400'>社区做市金额</p>
            <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>{fromTokenValue(inviteValue, 18, 3)}</p>
          </div>
        </div>

        <div>
          <p className=" indent-8 text-sm leading-6 p-2">
            个人做市金额必须100USDT以上的有效账户才能获得奖励，S3及以上账户的个人做市金额必须保持10000USDT才能获得奖励。
          </p>
        </div>
      </div>

      <div className='bg-white rounded-2xl mx-3 mb-5 px-3 py-5'>
        <div className=" flex">
          <p className=' leading-8  font-bold mainTextColor text-xl'>我的奖励</p>
        </div>

        <div className="pt-1">
          <div >
            <p className=" text-gray-400 text-sm">
              推广奖:
              <span className=" text-black text-xl font-bold ml-2">{fromTokenValue(inviteAwardValue, 18, 3)} <span className=" text-sm">USDT</span></span>
            </p>
          </div>

          <div >
            <p className=" text-gray-400 text-sm">
              社区奖:
              <span className=" text-black text-xl font-bold ml-2">{fromTokenValue(scaleAwardValue, 18, 3)} <span className=" text-sm">USDT</span></span>
            </p>
          </div>

          <div >
            <p className=" text-gray-400 text-sm">
              贡献奖:
              <span className=" text-black text-xl font-bold ml-2">{fromTokenValue(contributionAwardValue, 18, 3)} <span className=" text-sm">USDT</span></span>
            </p>
          </div>
        </div>

        <div className=" flex pt-1 ">
          <div className=" w-2/3">
            <p className=' text-sm text-gray-400'>待提取收益</p>
            <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>
              {fromTokenValue(canReward, 18, 3)}
              <span className=" text-sm ml-1">USDT</span>
            </p>

          </div>
          <div className=" w-1/3">
            <p className=' text-center' style={{ lineHeight: "60px" }}>
              <span onClick={() => {
                sendHarvestContributioReward()
              }} className=' border-solid border rounded-3xl py-1 px-6 mainTextColor font-bold  borderMain cursor-pointer'>提现</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </>

  )
}

export default Community