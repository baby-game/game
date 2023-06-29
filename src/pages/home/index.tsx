import { useNavigate } from "react-router-dom";
import logo from '../../image/logo.png'

export default function Home({ }) {
  const navigate = useNavigate();

  return <div className=" main">
    <div className=" pt-32 pb-10 text-center  "  >
      <h3 className="indent-8 font-bold text-2xl leading-10  mainTextColor flex " style={{
        width: "230px",
        margin: "0 auto"
      }}>
        BABY社交道
      <img className=" rounded-full w-10 h-10  ml-3" src={logo} alt="" />

      </h3>
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
  </div>
}