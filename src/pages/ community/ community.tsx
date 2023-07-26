import { useWeb3React } from "@web3-react/core"
import { useEffect, useState } from "react"
import { useBabyGameContract } from "../../hooks/useContract"
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import TipPop from "../../components/pop/TipPop";
import { fromTokenValue } from "../../utils";
import copy from 'copy-to-clipboard';
import { formatAccount } from "../../utils/formatting";
import { copyIcon, labor5Icon, labor6Icon, labor7Icon, level0Icon, level1Icon, level2Icon, level3Icon, level4Icon, level5Icon, level6Icon, level7Icon } from "../../image";
import HeadBar from "../../components/headbar";
import { useTranslation } from "react-i18next";

const ethers = require('ethers');

const BabyGameAddr = process.env.REACT_APP_CONTRACT_BABYGAME + ""

function Community() {
  const { t } = useTranslation()

  const babyContract = useBabyGameContract(BabyGameAddr)
  const { account, library } = useWeb3React()

  const [scale, setScale] = useState<string>("0")
  const [scalePop, setScalePop] = useState<boolean>(false)

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
  const [isLabor, setIsLabor] = useState<boolean>(false)

  const getUser = async () => {
    let data = await babyContract?.getUser(account)
    console.log("getUser", data)
    setScale(data[0].scale.toString())
    setInviteAwardValue(data[0].inviteAwardValue.toString())
    setScaleAwardValue(data[0].scaleAwardValue.toString())
    setContributionAwardValue(data[0].contributionAwardValue.toString())
    setInviteValue(data[0].inviteValue.toString())
    setValue(data[0].value.toString())
    setInviteCount(data[0].inviteCount.toString())
    setInviteTotalCount(data[0].inviteTotalCount.toString())
    setIsLabor(data[1])
  }
  useEffect(() => {
    init()
  }, [account])

  const init = () => {
    getUser()
  }

  const levelHtml=()=>{

    let Icon 
    if(isLabor){
      if(Number(scale)==5){
        Icon=labor5Icon
      }else if(Number(scale)==6){
        Icon=labor6Icon
      }else if(Number(scale)==7){
        Icon=labor7Icon
      }

    }else{
      if(Number(scale)==0){
        Icon=level0Icon
      }else if(Number(scale)==1){
        Icon=level1Icon
      }else if(Number(scale)==2){
        Icon=level2Icon
      }else if(Number(scale)==3){
        Icon=level3Icon
      }else if(Number(scale)==4){
        Icon=level4Icon
      }else if(Number(scale)==5){
        Icon=level5Icon
      }else if(Number(scale)==6){
        Icon=level6Icon
      }else if(Number(scale)==7){
        Icon=level7Icon 
      }
    }

    return  <img className=" w-10 ml-2" src={Icon} alt="" />
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
            <p className=" font-bold text-xl mainTextColor mb-2 ">{t("Levelintroduction")}</p>
          </div>
          <Grid container className=' mb-3 flex text-sm'>
            <p>S1:{t("TheSumOfThePerformanceOfHeDistrict")}≥1{t("TenThousand")}USDT</p>
            <p>S2:{t("TheSumOfThePerformanceOfHeDistrict")}≥3{t("TenThousand")}USDT</p>
            <p>S3:{t("TheSumOfThePerformanceOfHeDistrict")}≥9{t("TenThousand")}USDT</p>
            <p>S4:{t("TheSumOfThePerformanceOfHeDistrict")}≥30{t("TenThousand")}USDT</p>
            <p>S5:{t("TheSumOfThePerformanceOfHeDistrict")}≥60{t("TenThousand")}USDT</p>
            <p>S6:{t("TheSumOfThePerformanceOfHeDistrict")}≥120{t("TenThousand")}USDT</p>
            <p>S7:{t("TheSumOfThePerformanceOfHeDistrict")}≥240{t("TenThousand")}USDT</p>
          </Grid>
        </DialogContent>
      </Dialog>
      <div className='bg-white rounded-2xl mt-32  mx-3 mb-5 p-3'>
        <div className='mainTextColor font-bold text-2xl flex  mb-2'>
          {t("shareLink")}:
          <div className=" flex mt-2" onClick={() => {
            copy(window.location.host + "/home/" + account + "");
            setLoading(true)
            setLoadingState("success")
            setLoadingText(`${t("copySuccessfully")}`)
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
          {/* <div className=" flex-1"> */}
            <p className=' leading-10  font-bold mainTextColor text-xl'> {t("myLevel")}</p>
            {levelHtml()}
            {/* <img className=" w-10 ml-2" src={level0Icon} alt="" /> */}
          {/* </div> */}
          {/* <div className=" flex-1">
            <p className=" leading-10">
             
              <span
                className="font-bold  rounded-full border-solid border-4 px-8 py-1 cursor-pointer"
                style={{
                  color: isLabor ? "#ffa500" : "",
                  borderColor:isLabor?"#ffa500":"rgb(60, 125, 104)"
                }}
                onClick={() => {
                  setScalePop(true)
                }}>
                S{scale}
              </span>
            </p>
          </div> */}
        </div>
        <div className="pt-2">
          <div >
            <p className=" text-gray-400 text-sm">
              {t("PromoteUsers")}:
              <span className=" text-black text-base font-bold ml-2">{inviteCount}</span>
            </p>
          </div>
          <div >
            <p className=" text-gray-400 text-sm">
              {t("communityUser")}:
              <span className=" text-black text-base font-bold ml-2">{inviteTotalCount}</span>
            </p>
          </div>
        </div>

        <div className=" flex pt-1 border-b-2 border-dashed">
          <div className=" w-1/2">
            <p className=' text-sm text-gray-400'> {t("IndividualMarketMakingAmount")}</p>
            <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>{fromTokenValue(value, 18, 3)}</p>
          </div>
          <div className=" w-1/2">
            <p className=' text-sm text-gray-400'> {t("CommunityMarketMakingAmount")}</p>
            <p className=' font-bold text-xl leading-loose break-words whitespace-normal'>{fromTokenValue(inviteValue, 18, 3)}</p>
          </div>
        </div>

        <div>
          <p className=" indent-8 text-sm leading-6 p-2">
            {t("Community1")}
          </p>
        </div>
      </div>

      <div className='bg-white rounded-2xl mx-3 mb-5 px-3 py-5'>
        <div className=" flex">
          <p className=' leading-8  font-bold mainTextColor text-xl'> {t("myReward")}</p>
        </div>

        <div className="pt-1">
          <div >
            <p className=" text-gray-400 text-sm">
              {t("PromotionAward")}:
              <span className=" text-black text-xl font-bold ml-2">{fromTokenValue(inviteAwardValue, 18, 3)} <span className=" text-sm">USDT</span></span>
            </p>
          </div>

          <div >
            <p className=" text-gray-400 text-sm">
              {t("communityAward")}:
              <span className=" text-black text-xl font-bold ml-2">{fromTokenValue(scaleAwardValue, 18, 3)} <span className=" text-sm">USDT</span></span>
            </p>
          </div>

          <div >
            <p className=" text-gray-400 text-sm">
              {t("ContributionAward")}:
              <span className=" text-black text-xl font-bold ml-2">{fromTokenValue(contributionAwardValue, 18, 3)} <span className=" text-sm">USDT</span></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default Community