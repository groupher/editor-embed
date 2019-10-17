// 开发类
import GithubIcon from './icon/github.png'
import ReplitIcon from './icon/replit.png'
import CodepenIcon from './icon/codepen.png'
import CodesandboxIcon from './icon/codesandbox.png'
import JsfiddleIcon from './icon/jsfiddle.png'
import VscodeIcon from './icon/vscode.png'

import FlaticonIcon from './icon/flaticon.png'

// 资讯类
import TechcrunchIcon from './icon/techcrunch.png'
import V2exIcon from './icon/v2ex.png'
import JuejinIcon from './icon/juejin.png'
import IfanrIcon from './icon/ifanr.png'
import InfoQIcon from './icon/infoq.png'
import ShaoshupaiIcon from './icon/shaoshupai.png'
import ZhihuIcon from './icon/zhihu.png'

import MediumIcon from './icon/medium.png'
import OschinaIcon from './icon/oschina.png'
import CnblogsIcon from './icon/cnblogs.png'
import JianshuIcon from './icon/jianshu.png'
import SegmentfaultIcon from './icon/segmentfault.png'
import WoshipmIcon from './icon/woshipm.png'

// 设计类
import DribbleIcon from './icon/dribble.png'
import MuzliIcon from './icon/muzli.png'
import ColossalIcon from './icon/thisiscolossal.png'
import InvisionappIcon from './icon/invisionapp.png'
import ZcoolIcon from './icon/zcool.jpeg'
import ArchdailyIcon from './icon/archdaily.png'
import CodropsIcon from './icon/codrops.png'
import CssdesignawardsIcon from './icon/cssdesignawards.png'

import ProducthuntIcon from './icon/producthunt.png'

// 视频类
import BiliBiliIcon from './icon/bilibili.png'
import YoutubeIcon from './icon/youtube.png'
import TedIcon from './icon/ted.png'

// 教程类
import EggheadIcon from './icon/egghead.png'
import XiaozhuanlanIcon from './icon/xiaozhuanlan.png'

import GaodeIcon from './icon/gaode.png'
import GfycatIcon from './icon/gfycat.png'


export default [
  {
    domain: 'github',
    icon: GithubIcon,
    title: "github",
    link: "https://github.com",
    desc: "支持嵌入 repo, user, issue, pull-request 等页面",
    demoEmbedLink: "https://github.com/coderplanets",
    type: "开发类",
    showInBrief: true
  }, 
  {
    domain: 'repl',
    icon: ReplitIcon,
    title: "replit",
    link: "https://repl.it",
    desc: "支持嵌入各类语言的 repl",
    demoEmbedLink: "https://repl.it/repls/AchingGreatHypertalk",
    type: "开发类",
    showInBrief: true
  }, 
  {
    domain: 'codepen',
    icon: CodepenIcon,
    title: "codepen",
    link: "https://codepen.io",
    desc: "支持嵌入 demo, view 等环境",
    demoEmbedLink: "https://codepen.io/team/codepen/pen/qgJdQw",
    type: "开发类",
    showInBrief: true
  }, 
  {
    domain: 'codesandbox',
    icon: CodesandboxIcon,
    title: "codesandbox",
    link: "https://codesandbox.io",
    desc: "支持嵌入各种语言的sandbox, 示例等",
    demoEmbedLink: "https://codesandbox.io/s/new",
    type: "开发类",
    showInBrief: true
  },
  { 
    domain: 'jsfiddle',
    icon: JsfiddleIcon,
    title: "jsfiddle",
    link: "https://jsfiddle.net/",
    desc: "支持嵌入 fiddle，示例等",
    demoEmbedLink: "https://jsfiddle.net/boilerplate/react-jsx",
    type: "开发类",
    showInBrief: true
  },
  { 
    domain: 'visualstudio',
    icon: VscodeIcon,
    title: "visualstudio",
    link: "https://marketplace.visualstudio.com",
    desc: "支持嵌入 vsc 系列的各种工具，插件等 ",
    demoEmbedLink: "https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode",
    type: "开发类",
  },
  // 资讯类
  { 
    domain: 'medium',
    icon: MediumIcon ,
    title: "medium",
    link: "https://medium.com",
    desc: "支持嵌入站内各种文章等, 使用 medium 搭建的博客可能无法解析，请提交 issue 支持",
    demoEmbedLink: "https://medium.com/free-code-camp/how-to-write-a-super-fast-link-shortener-with-elixir-phoenix-and-mnesia-70ffa1564b3c",
    type: "资讯类",
    showInBrief: true
  },
  { 
    domain: 'zhihu',
    icon: ZhihuIcon,
    title: "知乎",
    link: "https://zhihu.com",
    desc: "支持嵌入专栏，回答，用户主页等",
    demoEmbedLink: "https://zhuanlan.zhihu.com/coderplanets",
    type: "资讯类",
    showInBrief: true
  },
  { 
    domain: 'oschina',
    icon: OschinaIcon ,
    title: "开源中国",
    link: "https://oschina.net",
    desc: "支持嵌入 oschina 域下的各种内容",
    demoEmbedLink: "https://www.oschina.net/translate/a-guide-to-optimistic-locking",
    type: "资讯类",
  }, 
  { 
    domain: 'cnblogs',
    icon: CnblogsIcon,
    title: "博客园",
    link: "https://cnblogs.com",
    desc: "支持嵌入 cnblogs 域下的各种内容",
    demoEmbedLink: "https://www.cnblogs.com/smallSevens/p/11691432.html",
    type: "资讯类",
  }, 
  { 
    domain: 'jianshu',
    icon: JianshuIcon,
    title: '简书',
    link: "https://jianshu.com",
    desc: "支持嵌入 jianshu 域下的各种内容",
    demoEmbedLink: "https://www.jianshu.com/p/b7ec14a67a06",
    type: "资讯类",
  }, 
  { 
    domain: 'segmentfault',
    icon: SegmentfaultIcon,
    title: '思否',
    link: "https://segmentfault.com",
    desc: "支持嵌入 segmentfault 域下的各种内容",
    demoEmbedLink: "https://segmentfault.com/a/1190000020716933",
    type: "资讯类",
  }, 
  { 
    domain: 'woshipm',
    icon: WoshipmIcon,
    title: '人人都是产品经理',
    link: "http://www.woshipm.com/",
    desc: "支持嵌入站内的各种内容",
    demoEmbedLink: "http://www.woshipm.com/pd/2938314.html",
    type: "资讯类",
  },
  { 
    domain: 'v2ex',
    icon: V2exIcon,
    title: "v站 (v2ex)",
    link: "https://v2ex.com",
    desc: "支持嵌入帖子，用户主页等",
    demoEmbedLink: "https://v2ex.com/t/534899#reply58",
    type: "资讯类",
    showInBrief: true
  },
  { 
    domain: 'techcrunch',
    icon: TechcrunchIcon,
    title: "techcrunch(中文)",
    link: "https://techcrunch.cn",
    desc: "支持嵌入站内文章，新闻等",
    demoEmbedLink: "https://techcrunch.cn/2019/09/25/boston-dynamics-puts-its-robotic-quadruped-spot-up-for-sale/",
    type: "资讯类",
    showInBrief: true
  },
  { 
    domain: 'juejin',
    icon: JuejinIcon,
    title: "掘金",
    link: "https://juejin.im",
    desc: "支持嵌入文章，用户主页等",
    demoEmbedLink: "https://juejin.im/post/5d940e995188254463385ed4",
    type: "资讯类",
  },
  { 
    domain: 'infoq',
    icon: InfoQIcon,
    title: "InfoQ(中国)",
    link: "https://www.infoq.cn/",
    desc: "支持嵌入文章，访谈等",
    demoEmbedLink: "https://www.infoq.cn/article/Ge3Sge7defJ7NycthMVt",
    type: "资讯类",
    showInBrief: true
  },
  { 
    domain: 'ifanr',
    icon: IfanrIcon,
    title: "ifanr",
    link: "https://www.ifanr.com",
    desc: "支持嵌入文章，介绍等",
    demoEmbedLink: "https://www.ifanr.com/1266218",
    type: "资讯类",
  },
  { 
    domain: 'sspai',
    icon: ShaoshupaiIcon,
    title: "少数派",
    link: "https://sspai.com/",
    desc: "支持嵌入文章，介绍等",
    demoEmbedLink: "https://sspai.com/post/56836",
    type: "资讯类",
  },

  // 设计类
  {
    domain: 'dribbble',
    icon: DribbleIcon,
    title: "dribbble",
    link: "https://dribbble.com",
    desc: "支持嵌入shots, designers 等各种内容",
    demoEmbedLink: "https://dribbble.com/shots/7184722-Assembly-Payments-Homepage-Animation",
    type: "设计类",
    showInBrief: true
  },
  {
    domain: 'muz',
    icon: MuzliIcon,
    title: "muzli",
    link: "https://medium.muz.li/",
    desc: "支持嵌入站内各种内容",
    demoEmbedLink: "https://medium.muz.li/63-beautiful-dark-ui-examples-design-inspiration-8abaa1b86969",
    type: "设计类",
  },
  {
    domain: 'invisionapp',
    icon: InvisionappIcon,
    title: "invision",
    link: "https://www.invisionapp.com/",
    desc: "支持嵌入站内各种内容",
    demoEmbedLink: "https://www.invisionapp.com/inside-design/top-5-design-resources/",
    type: "设计类",
  },
  {
    domain: 'thisiscolossal',
    icon: ColossalIcon,
    title: "colossal",
    link: "https://www.thisiscolossal.com",
    desc: "支持嵌入站内各种内容",
    demoEmbedLink: "https://www.thisiscolossal.com",
    type: "设计类",
  },
  {
    domain: 'zcool',
    icon: ZcoolIcon,
    title: "站酷",
    link: "https://www.zcool.com.cn/",
    desc: "支持嵌入站内各种内容",
    demoEmbedLink: "https://www.zcool.com.cn/work/ZMzk5NzE3NjQ=.html",
    type: "设计类",
    showInBrief: true
  },
  {
    domain: 'archdaily',
    icon: ArchdailyIcon,
    title: "archdaily",
    link: "https://www.archdaily.com",
    desc: "支持嵌入站内各种内容",
    demoEmbedLink: "https://www.archdaily.cn/cn/926449/tai-guo-hun-yan-ting-aube-phtaa-living-design?ad_content=926449&ad_medium=widget&ad_name=featured_loop_main",
    type: "设计类",
  },
  {
    domain: 'tympanus',
    icon: CodropsIcon,
    title: "codrops",
    link: "https://tympanus.net/codrops",
    desc: "支持嵌入站内各种内容",
    demoEmbedLink: "https://tympanus.net/codrops/2019/10/16/case-study-chang-liu-portfolio-v4/?utm_source=feedburner&utm_medium=feed&utm_campaign=Feed%3A+tympanus+%28Codrops%29",
    type: "设计类",
  }, 
  {
    domain: 'cssdesignawards',
    icon: CssdesignawardsIcon,
    title: "cssdesignawards",
    link: "https://www.cssdesignawards.com/",
    desc: "支持嵌入站内各种内容",
    demoEmbedLink: "https://www.cssdesignawards.com/sites/vostokcement/35973",
    type: "设计类",
  }, 
  {
    domain: 'producthunt',
    icon: ProducthuntIcon,
    title: "producthunt",
    link: "https://www.producthunt.com",
    desc: "支持嵌入各种项目介绍等",
    demoEmbedLink: "https://www.producthunt.com/posts/ink-1c962f43-e6e2-4291-942f-6090712bf2b6",
    type: "设计类",
    showInBrief: true
  },

  // 产品类

  // 视频类
  {
    domain: 'bilibili',
    icon: BiliBiliIcon,
    title: "b站（bilibili）",
    link: "https://www.bilibili.com/",
    desc: "支持嵌入站内各种视频，专栏，用户主页等",
    demoEmbedLink: "https://www.bilibili.com/video/av45405879?from=search&seid=1413989416108416715",
    type: "视频类",
    showInBrief: true
  },

  {
    domain: 'youtube',
    icon: YoutubeIcon,
    title: "youtube",
    link: "https:/youtube.com",
    desc: "支持嵌入站内各种视频，专栏，用户主页等",
    demoEmbedLink: "https://www.youtube.com/watch?v=txk4WAlabvI",
    type: "视频类",
    showInBrief: true
  },
  {
    domain: 'ted',
    icon: TedIcon,
    title: "ted",
    link: "https:/ted.com",
    desc: "支持嵌入站内各种 ted 视频等",
    demoEmbedLink: "https://www.ted.com/talks/linus_torvalds_the_mind_behind_linux",
    type: "视频类",
    showInBrief: true
  },

  // 教程类
  {
    domain: 'egghead',
    icon: EggheadIcon,
    title: "egghead",
    link: "https://egghead.io/",
    desc: "支持嵌入站内各种视频，文章等",
    demoEmbedLink: "https://egghead.io/lessons/react-build-react-from-source",
    type: "教程类",
  },
  {
    domain: 'xiaozhuanlan',
    icon: XiaozhuanlanIcon,
    title: "小专栏",
    link: "https:/xiaozhuanlan.com",
    desc: "支持嵌入站内各种专栏等",
    demoEmbedLink: "https://xiaozhuanlan.com/example",
    type: "教程类",
  },

  // 其他类
  {
    domain: 'amap',
    icon: GaodeIcon,
    title: "高德地图",
    link: "https://www.amap.com/",
    desc: "支持嵌入地图链接",
    demoEmbedLink: "https://www.amap.com/search?query=%E6%88%90%E9%83%BD%E5%B8%82&city=510107&geoobj=103.901112%7C30.54791%7C104.340222%7C30.776785&zoom=12",
    type: "其他",
    showInBrief: true
  },
  {
    domain: 'gfycat',
    icon: GfycatIcon,
    title: "gfycat（gif图）",
    link: "https://gfycat.com/",
    desc: "支持嵌入各种 gif 图等",
    demoEmbedLink: "https://gfycat.com/amusedalertkodiakbear-tuesday-drake-ilovemakonnen-degrassi",
    type: "其他",
    showInBrief: true
  },
  // 应该还有 教程类 等等
]