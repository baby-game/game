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
import { copyIcon } from "../../image";
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
          <div className=" flex-1">
            <p className=' leading-8  font-bold mainTextColor text-xl'> {t("myLevel")}</p>
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
        <div className="pt-4">
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