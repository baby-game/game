import { useWeb3React } from '@web3-react/core';
import { formatAccount } from '../../utils/formatting';
import walletIcon from '../../image/wallet.png'
import logo from '../../image/logo.png'
import { communityIcon, homeIcon, menuIcon, planIcon, wealthIcon } from '../../image';
import Drawer from '@mui/material/Drawer';
import { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { useNavigate, useParams } from 'react-router-dom';
import { useBabyGameContract } from '../../hooks/useContract';
import { AddressZero } from '@ethersproject/constants'
import TipPop from '../pop/TipPop';

declare const window: Window & { ethereum: any, web3: any };


interface IHeadBar {
  setOpen?: Function
}

const BabyGameAddr = process.env.REACT_APP_CONTRACT_BABYGAME + ""

function HeadBar({ setOpen }: IHeadBar) {
  const { account } = useWeb3React();
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const navigate = useNavigate();
  const params = useParams()

  const babyContract = useBabyGameContract(BabyGameAddr)
  const [isTopInviter, setIsTopInviter] = useState<boolean>(false)

  const [isHaveInviter, setIsHaveInviter] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<string>("loading")
  const [loadingText, setLoadingText] = useState<string>("")

  const connectWallet = () => {
    window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: process.env.REACT_APP_NET_CHAIN_ID }] })
      .then(() => {
        if (window.ethereum) {
          console.log("switch chain", process.env.REACT_APP_NET_CHAIN_ID, new Date())
          window.ethereum
            .request({ method: 'eth_requestAccounts' })
            .then(() => {
              console.log('Please connect to MetaMask.');
            })
            .catch((error: any) => {
              if (error.code === 4001) {
                console.log('Please connect to MetaMask.');
              } else {
                console.error(error);
              }
            });
        } else {
          alert('Please confirm that you have installed the Metamask wallet.');
        }
      })
      .catch((error: Error) => {
        const params = [{
          chainId: process.env.REACT_APP_NET_CHAIN_ID,
          chainName: process.env.REACT_APP_Net_Name,
          nativeCurrency: {
            name: process.env.REACT_APP_NET_SYMBOL,
            symbol: process.env.REACT_APP_NET_SYMBOL,
            decimals: 18
          },
          rpcUrls: [process.env.REACT_APP_NET_URL],
          blockExplorerUrls: [process.env.REACT_APP_NET_SCAN]
        }];
        window.ethereum.request({ method: 'wallet_addEthereumChain', params })
          .then(() => {
            if (window.ethereum) {
              console.log("add chain", process.env.REACT_APP_NET_CHAIN_ID)
            } else {
              alert('Please confirm that you have installed the Metamask wallet.');
            }
          }).catch((error: Error) => console.log("Error", error.message))
      })
  }

  useEffect(() => {
    init()
  }, [window.location.href, account])

  const init = async () => {
    console.log("init1")

    let isTopInviterData = await babyContract?.isTopInviter(account)
    setIsTopInviter(isTopInviterData)
    let data = await babyContract?.getUser(account)
    let isHaveInviterData
    if (data.inviter == AddressZero) {
      isHaveInviterData = false
      setIsHaveInviter(false)
    } else {
      isHaveInviterData = true
      setIsHaveInviter(true)
    }

    if (params.shareAddress) {
    } else {
      if (isTopInviterData || isHaveInviterData) {
      } else {
        navigate("/home")
      }
    }
  }

  const navLink = (url: string) => {
    setMenuOpen(false)
    if (isHaveInviter || isTopInviter) {
      navigate(url)
    } else {
      // setLoading(true)
      // setLoadingState("error")
      // setLoadingText("请填写推荐人地址")
      // setTimeout(() => {
      //   setLoadingState("")
      //   setLoading(false)
      // }, 2000);
      if (setOpen) setOpen(true)
      return
    }
  }



  return (
    <div className=' border-b border-gray-300 z-50 backdrop-blur-xl fixed top-0 left-0 w-full h-16 px-4'>
      <TipPop open={loading} setOpen={setLoading} loadingText={loadingText} loadingState={loadingState} />

      <div className='container text-black flex justify-between items-center mx-auto h-full'>
        <div className='logo'>
          <div className=' flex'>
            <img
              className=' mr-2 '
              width={30}
              height={30}
              src={menuIcon}
              onClick={() => {
                setMenuOpen(true)
              }}
              alt=''
            />
            <Drawer
              anchor={"left"}
              open={menuOpen}
              onClose={() => {
                setMenuOpen(false)
              }}
            >
              <List
                sx={{ width: '210px', maxWidth: 360, bgcolor: 'background.paper' }}
                component="nav"
                aria-labelledby="nested-list-subheader"
                subheader={
                  <ListSubheader className=' flex py-3 border-b' component="div" id="nested-list-subheader">
                    <img
                      className=' mr-2 rounded-full '
                      width={30}
                      height={30}
                      src={logo}
                      alt=''
                    />
                    <span className=' leading-8 font-bold mainTextColor text-xl'>Baby Plan</span>
                  </ListSubheader>
                }
              >
                <ListItemButton onClick={() => {
                  navLink("/home")
                }}>
                  <img
                    width={20}
                    height={20}
                    src={homeIcon}
                    alt=''
                  />
                  <ListItemText className=' ml-2 ' primary="首页" />
                </ListItemButton>

                <ListItemButton onClick={() => {
                  navLink("/plan")
                }}>
                  <img
                    width={20}
                    height={20}
                    src={planIcon}
                    alt=''
                  />
                  <ListItemText className=' ml-2 ' primary="宝贝计划" />
                </ListItemButton>
                <ListItemButton onClick={() => {

                  navLink("/community")
                }}>
                  <img
                    width={20}
                    height={20}
                    src={communityIcon}
                    alt=''
                  />
                  <ListItemText className=' ml-2 ' primary="我的社区" />
                </ListItemButton>
                <ListItemButton onClick={() => {
                  navLink("/wealth")
                }}>
                  <img
                    width={20}
                    height={20}
                    src={wealthIcon}
                    alt=''
                  />
                  <ListItemText className=' ml-2 ' primary="重生财富 " />
                </ListItemButton>

              </List>
            </Drawer>
            <span className=' leading-8 font-bold mainTextColor text-xl'>Baby Plan</span>
          </div>
        </div>

        <div className=' relative flex items-center justify-center  cursor-pointer'>

          {
            account ? <span className='ring-1 ring-black rounded-full px-2 py-1 inline-flex whitespace-nowrap items-center justify-center mr-3'  > <img width={22} className=' mr-3' src={walletIcon} alt="" />{formatAccount(account, 5, 5)}</span> : <span className='ring-1 ring-black rounded-full px-2 py-1 inline-flex whitespace-nowrap items-center justify-center mr-3' onClick={() => { connectWallet() }}><img width={25} className=' mr-3' src={walletIcon} alt="" /> Connect Wallet</span>
          }
        </div>
      </div>
    </div>
  )
}

export default HeadBar