/* ============ 年表：臺灣的大事，加上本站資料（剪報、研究、人數）的轉折點，排在同一把時間尺上 ============
   兩道：政府、民間；形狀表示種類（大事、剪報、研究、人數）。上方的時間尺照年份比例畫；1980 年以前事件少，尺比較緊。
   事件裡寫 tree:'q1' 的，名稱、日期、說明直接取自事件樹（00-data.js 的 TREE），這裡不重複寫。
   要加事件：照下面的格式加一筆。d 寫成 1984、1984-12 或 1984-12-17；lane 是 intl、tw、news、lit、people；
   cat（只有大事要寫）是 law 法規與政策、assess 定義與鑑定、edu 教育與普查、rights 權利與社會。
   剪報、研究、人數三道的數字由 source/data.json 算出，資料更新時請重算。 */
// 只看臺灣，分成兩道：政府、民間。顏色寫在 style.css 的 --k-gov、--k-civ（藍、橘，用色盲模擬檢查過）。
// 同一道裡，實心圓是大事；空心的是由本站資料算出的轉折點：方形剪報、三角形研究、六角形人數
const CR_LANES = [
  {k:'gov', name:'政府', sub:'法規・教育・統計'},
  {k:'civ', name:'民間', sub:'家長・學界・報紙'}
];
CR_LANES.forEach(l=>{ l.color = 'var(--k-'+l.k+')'; });
const CR_KINDS = {
  ev:{name:'大事', shape:'circle'},
  news:{name:'剪報', shape:'square', data:true, go:'news'},
  lit:{name:'研究', shape:'triangle', data:true, go:'research'},
  people:{name:'人數', shape:'hexagon', data:true, go:'people'}
};
// 臺灣的大事屬於哪一道：這幾件是民間（家長團體、學者編的評量工具），其餘是政府。剪報、研究算民間；人數是政府的統計
const CR_CIV = new Set(['t-q1','t-b3','t-b4','t-q5','syinlu','pac92','ccb95']);
const CR_CATS = {law:'法規與政策', assess:'定義與鑑定', edu:'教育與普查', rights:'權利與社會'};
const CR_ERAS = [
  {from:1960, name:'啟智教育開始'},
  {from:1980, name:'立法與正名'},
  {from:2000, name:'權利與支持'}
];
const CR_START = 1960;
const CR_END = 2026;
const CR_RAW = [
  {id:"itard", d:"1801", lane:"intl", cat:"edu", t:"伊塔教育「野孩子」",
   x:"法國醫師伊塔（Jean Marc Gaspard Itard）以有系統的感官與語言訓練，教育在阿韋龍森林被發現的男孩維克多，1801 年發表第一份報告。\n這被視為有系統地教育智能障礙者的起點。他的學生塞甘（Édouard Séguin）後來把這套方法發展成學校的課程。",
   src:"Itard（1801）；《Parallels in Time》"},
  {id:"down", d:"1866", lane:"intl", cat:"assess", t:"唐約翰描述唐氏症",
   x:"英國醫師唐約翰（John Langdon Down）在論文中描述一群外觀有共同特徵的智能障礙者。他當時用的名稱帶有種族偏見，1965 年世界衛生組織改用「唐氏症」。\n成因（第 21 對染色體多了一條）要到 1959 年才由勒瑞恩（Jérôme Lejeune）等人發現。",
   src:"Down（1866）；世界衛生組織"},
  {id:"aaidd1876", d:"1876-06-06", lane:"intl", cat:"assess", t:"美國成立專業學會",
   x:"塞甘等美國機構負責人在賓州成立「美國白痴與低能者機構醫務人員協會」。\n這個學會後來多次改名：1906 年美國低能研究協會、1933 年美國智能缺陷協會（AAMD）、1987 年美國智能不足協會（AAMR），2007 年改為美國智能與發展障礙協會（AAIDD）。它的定義手冊長期影響各國對智能障礙的定義。",
   src:"AAIDD 沿革"},
  {id:"binet", d:"1905", lane:"intl", cat:"assess", t:"比奈—西蒙智力量表",
   x:"法國實施義務教育後，需要找出跟不上一般課程的學童。比奈（Alfred Binet）與西蒙（Théodore Simon）編出第一份實用的智力量表。\n量表傳到美國後，1916 年推孟修訂為斯坦福—比奈量表並推廣「智商」的概念，智力測驗從此成為鑑定智能障礙的主要工具。",
   src:"Binet & Simon（1905）"},
  {id:"buck", d:"1927-05-02", lane:"intl", cat:"law", t:"巴克訴貝爾案",
   x:"凱莉・巴克（Carrie Buck）被認定為「低能」，維吉尼亞州依優生絕育法要為她結紮。美國最高法院以 8 比 1 判決合憲，大法官霍姆斯寫下「三代低能已經夠了」。\n此後美國有數萬人被強制絕育。這個判決至今沒有被正式推翻。",
   src:"Buck v. Bell, 274 U.S. 200（1927）"},
  {id:"vineland", d:"1935", lane:"intl", cat:"assess", t:"文蘭社會成熟量表",
   x:"美國新澤西州文蘭訓練學校的多爾（Edgar Doll）發表文蘭社會成熟量表，由熟悉當事人的人回答他在日常生活中的表現。\n這是適應行為評量的源頭。1984 年擴展為文蘭適應行為量表，臺灣在 1970 年代引進（見事件樹的適應行為量表分支）。",
   src:"Doll（1935）；本站「智能障礙重大事件表」"},
  {id:"t4", d:"1939-09", lane:"intl", cat:"rights", t:"納粹「T4 行動」",
   x:"1939 年起，納粹德國以「安樂死」為名，有系統地殺害住在機構裡的身心障礙兒童與成人，智能障礙者是主要對象之一。到 1941 年 8 月表面上喊停時，毒氣設施已殺害約七萬人，之後以其他方式持續到戰爭結束。\n這段歷史後來成為身心障礙者人權運動的重要警示。",
   src:"美國大屠殺紀念館；《Parallels in Time》"},
  {id:"wisc", d:"1949", lane:"intl", cat:"assess", t:"魏氏兒童智力量表",
   x:"魏克斯勒（David Wechsler）出版魏氏兒童智力量表（WISC），分為語文與作業兩部分，計算離差智商。\n之後的修訂版（WISC-R、WISC-III、WISC-IV、WISC-V）都有中文版，是臺灣鑑定智能障礙最主要的個別智力測驗（見事件樹的智力測驗分支）。",
   src:"Wechsler（1949）"},
  {id:"arc", d:"1950", lane:"intl", cat:"rights", t:"家長組成全國團體",
   x:"1950 年秋天，來自美國各地約九十位家長與朋友在明尼蘇達州明尼亞波利斯召開第一次全國家長會議，成立全國智能障礙兒童家長與朋友協會（今天的 The Arc）。\n家長開始公開說出孩子的存在，要求在社區裡提供教育與服務，而不是只把孩子送進機構。",
   src:"《Parallels in Time》；The Arc"},
  {id:"denmark", d:"1959", lane:"intl", cat:"law", t:"丹麥提出「正常化」",
   x:"丹麥通過新的智能障礙者服務法，由班克—米克爾森（Niels Erik Bank-Mikkelsen）推動，主張「讓智能障礙者過著盡可能接近一般人的生活」。\n1969 年瑞典的尼爾耶（Bengt Nirje）把它整理成「正常化原則」，影響了之後數十年的去機構化。",
   src:"Bank-Mikkelsen；Nirje（1969）"},
  {id:"heber", d:"1961", lane:"intl", cat:"assess", t:"定義加入適應行為",
   x:"美國智能缺陷協會（AAMD）由赫伯（Rick Heber）主編的定義（1959 年發表、1961 年修訂），把智能障礙定為「在發展期間出現、一般智力功能低於平均，並伴隨適應行為的缺損」。\n這是第一次把適應行為正式寫進定義。當時智力的標準是低於平均數一個標準差。",
   src:"Heber（1959, 1961）；AAIDD"},
  {id:"so", d:"1968-07-20", lane:"intl", cat:"rights", t:"第一屆特殊奧運",
   x:"由尤妮絲・甘迺迪・施萊佛（Eunice Kennedy Shriver）推動，第一屆國際特殊奧運在芝加哥士兵球場舉行，約一千位來自美國與加拿大的智能障礙運動員參賽。\n特殊奧運之後擴展到世界各地，讓更多人看見智能障礙者的能力。",
   src:"Special Olympics 沿革"},
  {id:"un71", d:"1971-12-20", lane:"intl", cat:"law", t:"聯合國權利宣言",
   x:"聯合國大會通過《智能不足者權利宣言》，宣示智能障礙者「在最大可能的範圍內」享有與其他人相同的權利，包括醫療、教育、經濟保障，以及免於剝削。\n宣言仍帶有保護的色彩；2006 年的《身心障礙者權利公約》才改以權利主體來看待。",
   src:"聯合國大會第 2856 號決議（1971）"},
  {id:"grossman", d:"1973", lane:"intl", cat:"assess", t:"標準改為負二個標準差",
   x:"美國智能缺陷協會由葛斯曼（Herbert Grossman）主編的定義，把智力的標準從低於平均數一個標準差改為兩個標準差（約智商 70 以下），原本被歸為「邊緣」的一群人不再算是智能障礙。\n臺灣 2002 年的鑑定標準也採用負二個標準差。",
   src:"Grossman（1973）；AAIDD"},
  {id:"pf", d:"1974", lane:"intl", cat:"rights", t:"自我倡議「先是人」",
   x:"1973 年，美國奧瑞岡州舉辦一場由智能障礙者自己參與籌備的會議。1974 年，參與者成立「People First（先是人）」，名稱來自一位與會者說的：不要再叫我們遲緩，我們首先是人。\n智能障礙者為自己發聲的「自我倡議」運動由此擴展到各國。",
   src:"《Parallels in Time》；People First 沿革"},
  {id:"pl94", d:"1975-11-29", lane:"intl", cat:"law", t:"美國障礙兒童教育法",
   x:"美國總統福特簽署《全體障礙兒童教育法》（94-142 公法），規定所有障礙兒童都能接受免費且適當的公立教育，要有個別化教育計畫（IEP），並在最少限制的環境中學習。\n1990 年改名為《身心障礙者教育法》（IDEA）。",
   src:"Public Law 94-142（1975）"},
  {id:"ada", d:"1990-07-26", lane:"intl", cat:"law", t:"美國身心障礙者法",
   x:"美國總統老布希簽署《美國身心障礙者法》（ADA），禁止在就業、公共服務、公共場所與交通上歧視身心障礙者。\n它把身心障礙看成民權的問題，影響了各國的反歧視立法。",
   src:"Americans with Disabilities Act（1990）"},
  {id:"aamr92", d:"1992", lane:"intl", cat:"assess", t:"定義轉向「支持」",
   x:"美國智能不足協會（AAMR）第九版定義，不再以智商把智能障礙分為輕度、中度、重度、極重度，改以當事人需要的支持程度（間歇、有限、廣泛、全面）來描述，並把適應行為分成十個技能領域。\n這個「支持典範」影響了之後的服務與鑑定。臺灣 2003 年的社會適應表現檢核表，就以 AAMR 的領域為分量表的依據。",
   src:"AAMR（1992）"},
  {id:"salamanca", d:"1994-06", lane:"intl", cat:"edu", t:"薩拉曼卡宣言",
   x:"聯合國教科文組織在西班牙薩拉曼卡召開世界特殊需求教育會議，92 國政府與 25 個國際組織通過《薩拉曼卡宣言》。\n宣言主張普通學校應接納所有兒童，有特殊需求的學生應能進入普通學校就讀，是融合教育的重要里程碑。",
   src:"UNESCO（1994）"},
  {id:"icf", d:"2001-05-22", lane:"intl", cat:"assess", t:"世界衛生組織通過 ICF",
   x:"世界衛生大會通過《國際健康功能與身心障礙分類系統》（ICF），從身體功能與構造、活動與參與、環境因素來描述障礙，不再只看個人的缺損。\n臺灣 2012 年起的身心障礙鑑定新制，就以 ICF 為架構。",
   src:"世界衛生組織（2001）"},
  {id:"crpd", d:"2006-12-13", lane:"intl", cat:"law", t:"身心障礙者權利公約",
   x:"聯合國大會通過《身心障礙者權利公約》（CRPD），2008 年生效。公約要求國家保障身心障礙者的平等、自主、融合教育、法律能力與社區生活，強調「沒有我們的參與，不要做關於我們的決定」。\n臺灣不是聯合國會員，2014 年以施行法讓公約在國內生效。",
   src:"聯合國（2006）"},
  {id:"aaidd", d:"2007-01-01", lane:"intl", cat:"assess", t:"學會改名 AAIDD",
   x:"成立於 1876 年的美國智能不足協會（AAMR）改名為美國智能與發展障礙協會（AAIDD），以 intellectual disability（智能障礙）取代帶有貶意的 mental retardation（智能不足）。\n美國 2010 年的羅莎法、2013 年的 DSM-5 也陸續跟進。",
   src:"AAIDD 沿革"},
  {id:"dsm5", d:"2013-05-18", lane:"intl", cat:"assess", t:"DSM-5 以適應功能分級",
   x:"美國精神醫學會出版《精神疾病診斷與統計手冊》第五版（DSM-5），以「智能障礙（智能發展障礙症）」取代「智能不足」。\n嚴重程度改依概念、社會、實用三個領域的適應功能來判斷，不再只看智商。",
   src:"美國精神醫學會（2013）"},
  {id:"icd11", d:"2019-05-25", lane:"intl", cat:"assess", t:"ICD-11 智能發展障礙",
   x:"世界衛生大會通過《國際疾病分類》第十一版（ICD-11），以「智能發展障礙」（disorders of intellectual development）取代「智能不足」，歸在神經發展障礙之下，並同時考量智力與適應行為。\n2022 年 1 月 1 日生效。",
   src:"世界衛生組織（2019）"},
  {id:"zs", d:"1962-03", lane:"tw", cat:"edu", t:"第一個啟智班",
   x:"臺北市中山國小開辦臺灣第一個為智能不足兒童設立的特殊班（啟智班）。據記載，這源自校長林正株到日本考察「弱智教育」後的啟發。\n教育部也從 1962 年起，在普通中小學試辦特殊教育實驗班。",
   src:"教育部〈特殊教育簡介〉；Taiwan Review"},
  {id:"tj70", d:"1970", lane:"tw", cat:"law", t:"特殊教育推行辦法",
   x:"教育部訂定《特殊教育推行辦法》，規範特殊班與特殊學校的設置。\n啟智班在 1970 年代陸續從臺北擴展到其他縣市，例如南投縣在 1972 年設立第一個啟智班，老師來自臺北師專首屆的啟智教育培訓。",
   src:"教育部；南投縣雲林國小校史"},
  {id:"census76", d:"1976", lane:"tw", cat:"edu", t:"第一次特殊兒童普查",
   x:"教育部進行第一次全國特殊兒童普查，調查學齡階段各類身心障礙兒童的人數與分布，作為規劃特殊教育的依據。\n第二次普查在 1990 年進行。",
   src:"教育部特殊教育相關文獻"},
  {tree:"q1", lane:"tw", cat:"assess"},
  {id:"cfl80", d:"1980-06-02", lane:"tw", cat:"law", t:"殘障福利法公布",
   x:"總統公布《殘障福利法》，是臺灣第一部以身心障礙者為對象的福利法律，智能不足者是福利對象之一。\n1990 年修正時改稱「智能障礙者」，1997 年再修正為《身心障礙者保護法》。",
   src:"全國法規資料庫"},
  {tree:"l1", lane:"tw", cat:"law"},
  {id:"sel84", d:"1984-12-17", lane:"tw", cat:"law", t:"特殊教育法公布",
   x:"總統公布《特殊教育法》，確立特殊教育的法源，規定身心障礙學生的類別、鑑定與安置，智能不足是其中一類。\n1987 年的施行細則再依個別智力測驗的結果，把智能不足分為輕度、中度、重度。",
   src:"全國法規資料庫；教育部〈特殊教育簡介〉"},
  {tree:"b3", lane:"tw", cat:"assess"},
  {tree:"l2", lane:"tw", cat:"law"},
  {id:"syinlu", d:"1987", lane:"tw", cat:"rights", t:"心路基金會成立",
   x:"一群智能障礙者的家長成立心路文教基金會（今天的心路社會福利基金會），是臺灣第一個由障礙者家長發起的社福組織。\n家長們到立法院旁聽、聯繫立法委員，促成殘障福利法的修訂，也辦雜誌、成立服務機構。",
   src:"心路社會福利基金會；《遠見》1993"},
  {tree:"l3", lane:"tw", cat:"law"},
  {tree:"l4", lane:"tw", cat:"edu"},
  {id:"pac92", d:"1992", lane:"tw", cat:"rights", t:"智障者家長總會成立",
   x:"各地的智能障礙者家長協會共同成立中華民國智障者家長總會（智總），以全國的力量推動政策與法律。\n智總參與身心障礙相關法律的修法，也推動社區居住、就業與自立生活等服務。",
   src:"中華民國智障者家長總會"},
  {id:"ccb95", d:"1995", lane:"tw", cat:"rights", t:"喜憨兒基金會成立",
   x:"一群心智障礙者的家長在高雄成立喜憨兒社會福利基金會，為年長的心智障礙者規劃長期照顧與工作。1997 年開設第一家烘焙屋，「喜憨兒」一詞因此廣為人知。\n這個稱呼想要去除污名，也有人提醒它容易把成人看成孩子。本站的剪報展區把「憨兒／喜憨兒」列為一種用詞。",
   src:"喜憨兒社會福利基金會"},
  {tree:"l5", lane:"tw", cat:"law"},
  {id:"pp97", d:"1997-04-23", lane:"tw", cat:"law", t:"身心障礙者保護法",
   x:"《殘障福利法》修正名稱與全文為《身心障礙者保護法》，「殘障」改稱「身心障礙」，並加入就業、無障礙環境等規定。\n2007 年再修正為《身心障礙者權益保障法》。",
   src:"全國法規資料庫"},
  {tree:"l6", lane:"tw", cat:"law"},
  {tree:"b4", lane:"tw", cat:"assess"},
  {id:"rights07", d:"2007-07-11", lane:"tw", cat:"law", t:"身心障礙者權益保障法",
   x:"《身心障礙者保護法》修正名稱與全文為《身心障礙者權益保障法》，由「保護」轉向「權益」。\n法律並規定五年後改以世界衛生組織的 ICF 架構，辦理身心障礙鑑定與需求評估。",
   src:"全國法規資料庫"},
  {id:"icf12", d:"2012-07-11", lane:"tw", cat:"assess", t:"身心障礙鑑定新制",
   x:"身心障礙鑑定與需求評估新制上路，依 ICF 把障礙分為八大類，智能障礙歸在「神經系統構造及精神、心智功能」類，並同時評估活動參與和環境，作為提供服務的依據。",
   src:"衛生福利部；身心障礙者權益保障法"},
  {tree:"l7", lane:"tw", cat:"law"},
  {id:"crpd14", d:"2014-08-20", lane:"tw", cat:"law", t:"CRPD 施行法公布",
   x:"總統公布《身心障礙者權利公約施行法》，2014 年 12 月 3 日（國際身心障礙者日）施行，公約因此具有國內法的效力。\n政府要定期提出國家報告，並檢討不符合公約的法令。",
   src:"全國法規資料庫"},
  {id:"review17", d:"2017-10", lane:"tw", cat:"rights", t:"CRPD 首次國際審查",
   x:"2017 年 10 月 30 日到 11 月 3 日，政府邀請國際專家來臺審查第一次 CRPD 國家報告，身心障礙者團體也提出平行報告。\n審查委員提出結論性意見，包括融合教育、法律能力、去機構化等議題。",
   src:"衛生福利部社會及家庭署 CRPD 資訊網"},
  {tree:"q5", lane:"tw", cat:"assess"},
  {id:"sel23", d:"2023-06-21", lane:"tw", cat:"law", t:"特殊教育法全文修正",
   x:"《特殊教育法》全文修正為 57 條，自公布日施行。修法是為了配合《身心障礙者權利公約》的精神與特殊教育思潮的轉變。\n授權子法共 36 部，在 2024 年 5 月前陸續修訂完成，包括特殊教育學生及幼兒鑑定辦法。",
   src:"全國法規資料庫；教育部"},
  {tree:"l8", lane:"tw", cat:"law"},

  {id:"n1962", d:"1962-01-15", lane:"news", t:"最早的一篇剪報",
   x:"本站 738 篇剪報裡最早的一篇，是 1962 年 1 月 15 日中央日報的〈幼獅社〉。\n1960 年代的 21 篇剪報，有 62% 用到「白痴」或「低能」，48% 用到「智能不足」。"},
  {id:"n1964", d:"1964-07-15", lane:"news", t:"「智能不足」第一次見報",
   x:"剪報裡第一次出現「智能不足」，是 1964 年 7 月 15 日中央日報的〈設班 教育局告家長書〉。\n1960 年代的 21 篇剪報有 10 篇是政策公告，多半與設班、設立特殊學校有關，和同一時期開辦啟智班的事件相呼應。"},
  {id:"n1967", d:"1967-01-04", lane:"news", t:"溪洲命案的連續報導",
   x:"1967 年 1 月 4 日到 6 日，中央日報與中國時報連續報導溪洲命案，三天內有 8 篇，分別從醫師、母親、老師與記者的角度發表看法。\n這 8 篇編碼的主要觀點有沈重負擔／同情憐憫（3 篇）、排斥障礙者、犧牲奉獻，也有一篇是倡議。這是剪報裡最早一次密集的社會事件報導。"},
  {id:"n1978", d:"1978-10-02", lane:"news", t:"「智能障礙」第一次見報",
   x:"剪報裡第一次出現「智能障礙」，是 1978 年 10 月 2 日的〈佳音韻療育中心〉。\n但這個詞之後很少見：1980–1984 年的 19 篇剪報全部用「智能不足」。"},
  {id:"n1985", d:"1985-02-13", lane:"news", t:"家長陳情",
   x:"1985 年 2 月 13、14 日，聯合報連續報導家長陳情，主要觀點編為「倡議」。\n1980 年代 58 篇剪報有 9 篇的主要觀點是倡議（16%），是各年代裡比例最高的；1990 年代降為 8%，2010 年以後只有 4%。"},
  {id:"n1988", d:"1988-04-02", lane:"news", t:"「智障」第一次見報",
   x:"剪報裡第一次出現「智障」這個簡稱，是 1988 年 4 月 2 日中國時報的〈歧視〉，主要觀點是家長拒絕標籤。\n之後「智障」很快普及：1990–1994 年有 42% 的剪報用到它。"},
  {id:"n1990s", d:"1990", lane:"news", t:"剪報數量大增",
   x:"1990 年代的剪報有 247 篇（1980 年代 58 篇），是篇數最多的年代。\n主題以社會事件（84 篇）和政策公告（71 篇）最多。"},
  {id:"n1996", d:"1996-12-19", lane:"news", t:"家長怕孩子被貼標籤",
   x:"1990 年代有 8 篇剪報的主要觀點是「家長拒絕標籤」：家長擔心孩子被貼上標籤，不願讓孩子接受鑑定或就讀啟智班。\n例如 1993 年〈啟智班家長態度 怕烙印〉、1996 年 12 月 19 日〈家長怕被貼標籤〉、1997 年〈憂歧視 家長不願孩子就讀啟智班〉。"},
  {id:"n1998", d:"1998-11-13", lane:"news", t:"「喜憨兒」第一次見報",
   x:"剪報裡第一次出現「喜憨兒」，是 1998 年 11 月 13 日的〈喜憨兒 啟智中心〉。\n「憨兒／喜憨兒」一共出現在 14 篇剪報，最後一次是 2017 年。"},
  {id:"n1999", d:"1999", lane:"news", t:"剪報最多的一年：43 篇",
   x:"1999 年有 43 篇剪報，是篇數最多的一年。\n最常見的是障礙者的成果發表、比賽、課程或營隊（12 篇），其次是編為「誤判」的 6 篇，都與兵役體檢驗退「智能不足」、有人裝傻逃避兵役的爭議有關。"},
  {id:"n2000", d:"2000", lane:"news", t:"報紙改口「智能障礙」",
   x:"2000–2004 年的剪報有 51% 用「智能障礙」，第一次超過「智能不足」（33%）與「智障」（37%）。\n比例逐年上升，2015–2019 年有 94% 的剪報用「智能障礙」。"},
  {id:"n2010", d:"2010", lane:"news", t:"最常見的觀點仍是同情",
   x:"2010–2022 年的 200 篇剪報，主要觀點最常見的是「沈重負擔／同情憐憫」（75 篇），其次是「肯定障礙者的能力與成就」（45 篇）。\n從 1990 年代起，同情憐憫一直是剪報裡最常見的觀點。"},
  {id:"r1971", d:"1971", lane:"lit", t:"最早的一篇研究",
   x:"本站整理的 426 篇學術文獻，最早一篇在 1971 年，研究設計是量化研究，主題是現況調查。\n整個 1970 年代只有 7 篇。"},
  {id:"r1985", d:"1985", lane:"lit", t:"第一篇質性研究",
   x:"1985 年出現第一篇質性研究，但下一篇要到 2001 年。\n2000 年以後質性研究才增加，一共 63 篇，多半談家庭觀點或個人的生命經驗。"},
  {id:"r1986", d:"1986", lane:"lit", t:"研究開始談性與權利",
   x:"1986 年出現第一篇主題為「權利意識」的研究，也是第一篇性相關調查。\n權利意識的研究一共 31 篇，有一半在 2010 年代。"},
  {id:"r1988", d:"1988", lane:"lit", t:"研究第一次用「智能障礙」",
   x:"文獻用詞裡第一次出現「智能障礙」是 1988 年。1970–1989 年的 45 筆文獻，有 41 筆用「智能不足」。\n2000–2004 年，87% 的文獻已改用「智能障礙」；同一時期的剪報只有 51%。"},
  {id:"r2000", d:"2000", lane:"lit", t:"研究數量大增",
   x:"1990 年代只有 21 篇研究，2000 年代增加到 143 篇，2010 年代再增加到 201 篇。研究最多的一年是 2006 年（28 篇）。\n研究設計以實驗或介入研究最多（185 篇），主題以現況調查最多（137 篇）。"},
  {id:"r2005", d:"2005", lane:"lit", t:"第一篇自我倡議研究",
   x:"2005 年出現第一篇以自我倡議／自我決策為主題的研究，之後一共 16 篇。\n同一時期，CRPD 在 2006 年通過，強調「沒有我們的參與，不要做關於我們的決定」。"},
  {id:"p1999", d:"1999", lane:"people", t:"智能障礙者 68,044 人",
   x:"衛福部統計的全國智能障礙者人數，1999 年底是 68,044 人。\n之後逐年增加，2014 年超過十萬人。"},
  {id:"p2007", d:"2007", lane:"people", t:"臺北市：學習障礙超過智能障礙",
   x:"2007 年，臺北市的特教學生裡，學習障礙 2,196 人，第一次多於智能障礙的 1,918 人。\n臺北市的智能障礙學生從 2003 年的 2,345 人，減少到 2024 年的 506 人。"},
  {id:"p2009", d:"2009", lane:"people", t:"臺北市：自閉症超過智能障礙",
   x:"2009 年，臺北市的自閉症學生 2,020 人，第一次多於智能障礙的 1,861 人。\n全國要到 2022 年才出現同樣的交叉。"},
  {id:"p2010", d:"2010", lane:"people", t:"全國智能障礙學生最多",
   x:"全國特教學生裡的智能障礙學生，2010 年是 26,059 人，是有資料的 2008–2024 年裡最多的一年，之後逐年減少。"},
  {id:"p2013", d:"2013", lane:"people", t:"全國：學習障礙超過智能障礙",
   x:"2013 年，全國的學習障礙學生 26,797 人，第一次多於智能障礙的 25,088 人。臺北市早在 2007 年就出現這個交叉。"},
  {id:"p2014", d:"2014", lane:"people", t:"智能障礙者超過十萬人",
   x:"衛福部統計的全國智能障礙者，2014 年底是 100,588 人，第一次超過十萬。\n之後大致持平，2024 年底是 102,556 人。"},
  {id:"p2022", d:"2022", lane:"people", t:"全國：自閉症超過智能障礙",
   x:"2022 年，全國的自閉症學生 18,853 人，第一次多於智能障礙的 17,608 人。臺北市在 2009 年就已交叉。"},
  {id:"p2024", d:"2024", lane:"people", t:"智能障礙學生 16,800 人",
   x:"2024 年，全國的智能障礙學生 16,800 人，比 2010 年的高峰少了 36%。\n占全部特教學生的比例，從 2008 年的 31% 降到 13%。同一時期，衛福部統計的智能障礙者總人數沒有減少，維持在十萬人上下。"}
];
const CR_LANE = Object.fromEntries(CR_LANES.map(l=>[l.k,l]));
// 國際的事件（lane:'intl'）先保留在上面的清單裡，目前不畫
const CR = CR_RAW.filter(r=>r.lane!=='intl').map(r=>{
  const e = Object.assign({}, r);
  if(r.tree){ const t = byId[r.tree]; Object.assign(e, {id:'t-'+r.tree, d:t.date, t:t.title, x:t.desc, when:t.when, src:'本站「智能障礙重大事件表」'}); }
  const [y,mo,dd] = e.d.split('-').map(Number);
  Object.assign(e, {y, mo, dd, k: y+((mo?mo-1:6)+((dd||15)-1)/31)/12});          // 只寫年份的排在年中
  e.era = CR_ERAS.reduce((a,r,i)=>e.y>=r.from ? i : a, 0);
  e.kind = CR_KINDS[r.lane] ? r.lane : 'ev';
  e.lane = e.kind==='ev' ? (CR_CIV.has(e.id) ? 'civ' : 'gov') : e.kind==='people' ? 'gov' : 'civ';
  if(CR_KINDS[e.kind].data) e.src = '本站資料：'+CR_KINDS[e.kind].name+'（由 source/data.json 計算）';
  return e;
}).sort((a,b)=>a.k-b.k);
const crById = Object.fromEntries(CR.map(e=>[e.id,e]));
const crIcon = e => icon(CR_KINDS[e.kind].shape, CR_LANE[e.lane].color, !!CR_KINDS[e.kind].data);
const crYear = e => e.when && /年代/.test(e.when) ? e.when : String(e.y);          // 卡片上只寫年份；「1970年代」這種照寫
const crDate = e => e.when || (e.dd ? `${e.y} 年 ${e.mo} 月 ${e.dd} 日` : e.mo ? `${e.y} 年 ${e.mo} 月` : `${e.y} 年`);

/* 易讀版：每件大事一段，短句、常用詞、一句一個意思（一行一句）。
   這是草稿，請特教專業人員或自我倡議者審閱；審閱過後把 CR_EASY_DRAFT 改成 false，卡片上就不再寫「草稿」 */
const CR_EASY_DRAFT = true;
const CR_EASY = {
  itard:'1801 年，法國有一位醫生叫伊塔。\n他想教一個在森林裡長大的男孩說話和生活。\n這是很早開始教智能障礙者的例子。',
  down:'1866 年，英國醫生唐約翰寫下一群人共同的樣子。\n後來大家用他的名字，叫做「唐氏症」。',
  aaidd1876:'1876 年，美國的醫生和老師組成一個學會。\n這個學會後來決定「智能障礙」要怎麼定義。',
  binet:'1905 年，法國有了第一份智力測驗。\n它用來找出需要多一點幫忙的學生。',
  buck:'1927 年，美國法院說：政府可以強迫一些人不能生小孩。\n這是很不公平、傷害人權的判決。',
  vineland:'1935 年，美國有了一份新的評量。\n它看一個人在生活中會做哪些事，不只看智力測驗的分數。',
  t4:'1939 年起，納粹德國殺害了很多身心障礙者。\n大家記得這件事，是為了不讓它再發生。',
  wisc:'1949 年，魏克斯勒做了給兒童用的智力測驗。\n臺灣到現在還在用它的新版本。',
  arc:'1950 年，美國有很多智能障礙者的家長聚在一起。\n他們一起要求孩子能在社區裡上學和生活。',
  denmark:'1959 年，丹麥說：智能障礙者的生活，要和大家一樣普通。\n這個想法叫做「正常化」。',
  heber:'1961 年，定義加進「適應行為」。\n意思是：不只看智力，也要看一個人在生活上會不會做事。',
  so:'1968 年，第一屆特殊奧運在美國芝加哥舉行。\n大約一千位智能障礙運動員參加比賽。',
  un71:'1971 年，聯合國說：智能障礙者也有和別人一樣的權利。',
  grossman:'1973 年，美國改了標準。\n智力測驗的分數要更低，才算智能障礙。',
  pf:'1974 年，智能障礙者自己組成團體，叫做「先是人」。\n他們說：我們首先是人，請不要用不好的名字叫我們。',
  pl94:'1975 年，美國有了新的法律。\n所有身心障礙的孩子，都可以免費上公立學校。',
  ada:'1990 年，美國有了新的法律。\n工作和公共場所，都不可以歧視身心障礙者。',
  aamr92:'1992 年，定義改了。\n重點變成：一個人需要多少支持，而不是分數有多低。',
  salamanca:'1994 年，很多國家一起說：\n普通學校要歡迎所有孩子，大家一起學習。',
  icf:'2001 年，世界衛生組織有了新的分類方法。\n障礙不只看身體，也要看環境有沒有幫忙。',
  crpd:'2006 年，聯合國通過《身心障礙者權利公約》。\n身心障礙者有權利自己做決定，參加社會生活。',
  aaidd:'2007 年，美國的學會改了名字。\n不再用讓人難過的舊稱呼，改說「智能障礙」。',
  dsm5:'2013 年，醫生用的診斷手冊改版了。\n要看生活上的能力，決定一個人需要多少幫忙。',
  icd11:'2019 年，世界衛生組織改用新的名稱：「智能發展障礙」。',
  zs:'1962 年，臺北市中山國小開了臺灣第一個啟智班。\n智能障礙的孩子開始在學校裡有自己的班級。',
  tj70:'1970 年，教育部訂了辦法。\n很多普通學校開始設立特殊班。',
  census76:'1976 年，教育部第一次調查：\n臺灣有多少需要特殊教育的孩子。',
  't-q1':'1979 年，臺灣完成兒童智力測驗的修訂版。\n學校用它來了解學生。',
  cfl80:'1980 年，臺灣有了《殘障福利法》。\n這是第一部照顧身心障礙者的法律。',
  't-l1':'1981 年，法律寫清楚：\n要用智力測驗或生活能力的評量，判斷是不是智能障礙。',
  sel84:'1984 年，臺灣有了第一部特殊教育的法律。\n法律說：身心障礙的學生也要能上學。\n學校要依照每個人的需要來教。',
  't-b3':'1986 年，臺灣開始用一份新的評量。\n它看學生在生活中會做哪些事。',
  't-l2':'1987 年，法律依照智力測驗的分數，\n把智能障礙分成輕度、中度、重度三種。',
  syinlu:'1987 年，一群家長成立心路基金會。\n他們一起為孩子爭取權利和服務。',
  't-l3':'1990 年，法律把舊的稱呼「智能不足」，\n改成「智能障礙者」。',
  't-l4':'1990 年，教育部第二次調查：\n有多少需要特殊教育的學生。',
  pac92:'1992 年，各地的家長團體一起成立智障者家長總會。\n大家一起向政府爭取更好的政策。',
  ccb95:'1995 年，高雄的家長成立喜憨兒基金會。\n他們開烘焙屋，讓心智障礙者可以工作。',
  't-l5':'1997 年，特殊教育法也改用「智能障礙」這個名稱。',
  pp97:'1997 年，法律改名為《身心障礙者保護法》。\n「殘障」改說「身心障礙」。',
  't-l6':'2002 年，政府寫下新的標準，用來判斷學生是不是智能障礙。\n要同時看智力，和學習、生活上的困難。',
  't-b4':'2003 年，臺灣有了自己做的生活能力評量。',
  rights07:'2007 年，法律改名為《身心障礙者權益保障法》。\n重點從「保護」變成「保障權利」。',
  icf12:'2012 年，判斷身心障礙的方法改了。\n除了看身體，也會看一個人需要什麼服務。',
  't-l7':'2012 年，判斷學生是不是智能障礙的標準修改了。\n要看的生活能力項目，寫得更清楚。',
  crpd14:'2014 年，臺灣讓聯合國的《身心障礙者權利公約》在國內生效。\n政府要照著公約，保障身心障礙者的權利。',
  review17:'2017 年，國際專家來臺灣檢查：\n政府有沒有做到公約的要求，並給建議。',
  't-q5':'2018 年，新的兒童智力測驗中文版出版。',
  sel23:'2023 年，特殊教育法大幅修改。\n更重視讓身心障礙學生和大家一起學習。',
  't-l8':'2024 年，判斷學生是不是智能障礙的辦法又修改了。\n要看想事情的能力、生活能力和學習表現。'
};
CR.forEach(e=>{ e.easy = CR_EASY[e.id]||''; });

/* 照片、剪報、訪談：寫在 60-media.js 的 PHOTOS、CLIPS、INTERVIEWS，用 ev（或訪談的 evSegs）掛到這裡的事件 */
const CR_MI = {
  photo:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  clip:'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  talk:'<path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 11v2"/>'
};
const crMi = (k,s) => `<svg class="mi" width="${s||16}" height="${s||16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${CR_MI[k]}</svg>`;
function crMedia(e){
  const photos = PHOTOS.filter(p=>p.ev===e.id), clips = CLIPS.filter(c=>c.ev===e.id);
  const talks = INTERVIEWS.map((a,i)=>{ const ix = a.ev===e.id ? a.segs.map((x,k)=>k) : (a.evSegs && a.evSegs[e.id]); return ix && ix.length ? {a, i, ix} : null; }).filter(Boolean);
  return {photos, clips, talks, n: photos.length+clips.length+talks.length};
}
CR.forEach(e=>{ e.m = crMedia(e); });
const crMediaText = m => [m.photos.length && m.photos.length+' 張照片', m.clips.length && m.clips.length+' 篇剪報', m.talks.length && m.talks.length+' 段訪談'].filter(Boolean).join('、');
const crBadges = m => [['photo',m.photos.length],['clip',m.clips.length],['talk',m.talks.length]].filter(x=>x[1]).map(x=>`<span class="cr-b">${crMi(x[0],14)}${x[1]}</span>`).join('');
const crDay = d => { const [y,mo,dd] = String(d).split('-').map(Number); return y+' 年'+(mo?' '+mo+' 月':'')+(dd?' '+dd+' 日':''); };

// 大字：放大年表與說明卡片的字，設定記在瀏覽器裡（記不住也沒關係）
let crBig = false;
try{ crBig = localStorage.getItem('idtree.big')==='1'; }catch(e){}
function crSetBig(on){ crBig = on; try{ localStorage.setItem('idtree.big', on?'1':'0'); }catch(e){} }

let crSel = null, crList = false, crX = 0, crY = 0;
const crShown = () => CR;
let CRL = null;          // 目前的版面：比例尺、每件事的位置

/* 時間尺：分成幾段，每段每一年多寬。事件少的年代比較緊 */
function crScale(narrow){
  const B = [CR_START, 1980, CR_END], P = (narrow ? [44, 84] : [64, 128]);          // 1980 年以後事件多，尺放寬
  const x0 = []; let acc = 0; B.forEach((b,i)=>{ x0.push(acc); if(i<P.length) acc += (B[i+1]-b)*P[i]; });
  const x = t => { t = Math.max(B[0], Math.min(CR_END, t)); let i = 0; while(i<P.length-1 && t>=B[i+1]) i++; return x0[i]+(t-B[i])*P[i]; };
  return {x, W:acc, B, P};
}
// 時間尺上的刻度：每段依疏密決定幾年一格
function crTicks(S){
  const out = [];
  S.B.slice(0,-1).forEach((b,i)=>{
    const ppy = S.P[i], step = ppy<5 ? 50 : ppy<20 ? 10 : ppy<60 ? 5 : 1, lab = ppy<5 ? 50 : ppy<60 ? 10 : 5;
    for(let y=Math.ceil(b/step)*step; y<S.B[i+1]; y+=step) if(!out.some(o=>o.y===y)) out.push({y, major:y%lab===0});
  });
  return out;
}
function crLayout(width, availH){
  const narrow = vw()<720, S = crScale(narrow), labW = Math.round(((narrow ? 44 : 64)+(crBig ? 14 : 0))*((parseFloat(getComputedStyle(document.documentElement).fontSize)||16)/16)), padL = labW+24, padR = narrow ? 140 : 200;
  // 讀者把瀏覽器的字放大時（例如 200%），寬度與行高也跟著放大，名稱才不會被截掉
  const rem = (parseFloat(getComputedStyle(document.documentElement).fontSize)||16)/16;
  const k = (crBig ? 1.3 : 1)*rem, fs = (narrow ? 13.8 : 14.7)*k, lanePad = availH ? 2 : 6, RULER = availH ? 52 : 58;
  const bw = m => (m.photos.length?30:0)+(m.clips.length?30:0)+(m.talks.length?30:0)+(m.n?6:0);          // 名稱後面的小標記
  const wOf = e => Math.ceil(40*k+textW(crYear(e), 12.5*k)+Math.min(textW(e.t, fs)*1.06, (narrow ? 180 : 240)*k)+bw(e.m)*k);          // 年份與名稱排成一行          // 一件事的寬度：依名稱長短
  const pos = {}, lanes = [];
  // 先排好每一道有幾排，再決定一排多高
  CR_LANES.forEach(l=>{
    const rows = [];
    CR.filter(e=>e.lane===l.k).forEach(e=>{
      const x = padL+S.x(e.k), l0 = x-8;
      let r = rows.findIndex(end=>end+10<=l0); if(r<0){ r = rows.length; rows.push(0); }
      const w = wOf(e); rows[r] = l0+w; pos[e.id] = {x, w, row:r, lane:l.k};
    });
    lanes.push({...l, n:Math.max(1,rows.length)});
  });
  // 畫面固定的版面：一排的高度縮到剛好放進框裡（最矮 24px），放不下才在框裡上下捲
  const nRows = lanes.reduce((a,l)=>a+l.n, 0), full = Math.round(32*k);
  const rowH = availH ? Math.max(Math.round(24*k), Math.min(full, Math.floor((availH-RULER-lanes.length*lanePad*2-2)/nRows))) : full;
  let top = RULER;
  lanes.forEach(l=>{
    l.top = top; l.h = l.n*rowH+lanePad*2;
    CR.filter(e=>e.lane===l.k && pos[e.id]).forEach(e=>{ pos[e.id].y = top+lanePad+pos[e.id].row*rowH; });
    top += l.h;
  });
  return {S, narrow, labW, padL, W: Math.max(width, padL+S.W+padR), H: top, rowH, RULER, pos, lanes, compact: rowH<full};
}
// 底：章節的底色、每十年的細線、道與道之間的線
function crSvgBg(L){
  const f = v => v.toFixed(1), X = t => L.padL+L.S.x(t);
  let g = '';
  CR_ERAS.forEach((r,i)=>{ const a = X(Math.max(r.from,CR_START)), b = X(i<CR_ERAS.length-1 ? CR_ERAS[i+1].from : CR_END);
    if(i%2) g += `<rect x="${f(a)}" y="0" width="${f(b-a)}" height="${L.H}" fill="var(--trk)"/>`; });
  crTicks(L.S).forEach(t=>{ if(t.major){ const x = X(t.y); g += `<line x1="${f(x)}" x2="${f(x)}" y1="${L.RULER}" y2="${L.H}" stroke="var(--line)" stroke-width="1" opacity=".55"/>`; } });
  L.lanes.slice(1).forEach(l=>{ g += `<line x1="0" x2="${L.W}" y1="${l.top}" y2="${l.top}" stroke="var(--line)" stroke-width="1"/>`; });
  return `<svg class="cr-bg" width="${L.W}" height="${L.H}" aria-hidden="true" focusable="false">${g}</svg>`;
}
// 時間尺：年表在框裡上下捲時，它固定在最上面
function crRulerHtml(L){
  const f = v => v.toFixed(1), X = t => L.padL+L.S.x(t);
  let g = '';
  CR_ERAS.forEach((r,i)=>{ const a = X(Math.max(r.from,CR_START)), b = X(i<CR_ERAS.length-1 ? CR_ERAS[i+1].from : CR_END);
    if(i%2) g += `<rect x="${f(a)}" y="0" width="${f(b-a)}" height="${L.RULER}" fill="var(--trk)"/>`; });
  crTicks(L.S).forEach(t=>{ const x = X(t.y);
    g += `<line x1="${f(x)}" x2="${f(x)}" y1="${L.RULER-(t.major?22:14)}" y2="${L.RULER}" stroke="var(--line2)" stroke-width="1"/>`;
    if(t.major) g += `<text x="${f(x+4)}" y="${L.RULER-10}" font-size="12.5" fill="var(--muted)" font-variant-numeric="tabular-nums">${t.y}</text>`; });
  g += `<line x1="0" x2="${L.W}" y1="${L.RULER-.5}" y2="${L.RULER-.5}" stroke="var(--line2)" stroke-width="1"/>`;
  const eras = CR_ERAS.map((r,i)=>{ const a = X(Math.max(r.from,CR_START)), b = X(i<CR_ERAS.length-1 ? CR_ERAS[i+1].from : CR_END);
    return `<div class="cr-era" style="left:${a.toFixed(0)}px;width:${(b-a).toFixed(0)}px"><span>${esc(r.name)}</span></div>`; }).join('');
  return `<div class="cr-ruler" style="width:${L.W}px;height:${L.RULER}px"><svg width="${L.W}" height="${L.RULER}" aria-hidden="true" focusable="false">${g}</svg>${eras}<span class="cr-flag" id="crFlag" style="top:${L.RULER-22}px" hidden></span><div class="cr-corner" style="width:${L.labW}px;height:${L.RULER}px"></div></div>`;
}
function crFigHtml(L){
  const items = CR.filter(e=>L.pos[e.id]).map(e=>{ const p = L.pos[e.id], ln = CR_LANE[e.lane], kd = CR_KINDS[e.kind];
    return `<button class="cr-it${kd.data?' data':''}" data-cr="${e.id}" aria-pressed="${crSel===e.id}" style="left:${(p.x-8).toFixed(0)}px;top:${p.y}px;width:${p.w}px" title="${esc(e.t)}">${crIcon(e)}<span class="cr-y">${esc(crYear(e))}</span><span class="cr-t"><span class="cr-tt">${esc(e.t)}</span>${crBadges(e.m)}</span><span class="vh">，${ln.name}${kd.data?'・'+kd.name+'（本站資料）':''}${e.m.n?'，有'+crMediaText(e.m):''}</span></button>`; }).join('');
  const labels = L.lanes.map(l=>`<div class="cr-lane" style="top:${l.top-L.RULER}px;height:${l.h}px;--c:${l.color}"><i class="cr-sw" aria-hidden="true"></i><b>${l.name}</b></div>`).join('');
  return `<div class="cr-scroll" id="crScroll" tabindex="0" aria-label="年表，可以左右捲動">
      <div class="cr-track" style="width:${L.W}px;height:${L.H}px">${crRulerHtml(L)}<div class="cr-lanecol" aria-hidden="true" style="width:${L.labW}px;height:${L.H-L.RULER}px">${labels}</div>${crSvgBg(L)}<i class="cr-guide" id="crGuide" hidden></i>${items}</div>
    </div>`;
}
// 滑鼠移到（或鍵盤停在）一件事上：從時間尺拉一條細線下來，尺上標出日期
function crGuide(id){
  const g = $('#crGuide'), fl = $('#crFlag'); if(!g || !CRL) return;
  const e = id && crById[id], p = e && CRL.pos[id];
  if(!p){ g.hidden = fl.hidden = true; return; }
  g.hidden = fl.hidden = false;
  g.style.cssText = `left:${p.x.toFixed(0)}px;top:${CRL.RULER}px;height:${p.y+CRL.rowH/2-CRL.RULER}px`;
  g.style.setProperty('--c', CR_LANE[e.lane].color);
  fl.textContent = (e.when && /年代/.test(e.when)) ? e.when : (e.mo ? e.y+'.'+e.mo+(e.dd?'.'+e.dd:'') : e.y);
  fl.style.left = p.x.toFixed(0)+'px';
}
function crListHtml(){
  return `<div class="tlist plate">${CR_ERAS.map((r,i)=>{ const ev = crShown().filter(e=>e.era===i); if(!ev.length) return '';
    return `<h2>${esc(r.name)}（${ev[0].y}–${ev[ev.length-1].y}）</h2><ol>${ev.map(e=>{ const ln = CR_LANE[e.lane], kd = CR_KINDS[e.kind];
      return `<li><button class="litem" data-cr="${e.id}" aria-pressed="${crSel===e.id}" style="--c:${ln.color}"><span class="ld">${esc(crDate(e))}</span><b>${esc(e.t)}${e.m.n?`<small class="cr-lmm">${crMediaText(e.m)}</small>`:''}</b><span class="lm">${crIcon(e)}${ln.name}${kd.data?'・'+kd.name:''}</span></button></li>`; }).join('')}</ol>`; }).join('')}</div>`;
}
// 卡片裡的素材：順序固定（照片、剪報、訪談），沒有就不出現
function crMediaHtml(e){
  const m = e.m; if(!m.n) return '';
  let h = '', n = 0;
  if(m.photos.length) h += `<section class="cr-ms" aria-label="照片"><h3>${crMi('photo',18)}照片（${m.photos.length} 張）</h3><div class="cr-thumbs">${m.photos.map(p=>
    `<button class="cr-th" data-cr-lb="${n++}"><span class="cr-img"><img src="${esc(p.src)}" alt="" loading="lazy">${p.sample?'<i class="cr-sample">示意</i>':''}</span><span class="cr-cap">${esc(p.title||'照片')}${p.year?'<small>'+p.year+'</small>':''}</span><span class="vh">：看大圖</span></button>`).join('')}</div></section>`;
  if(m.clips.length) h += `<section class="cr-ms" aria-label="剪報"><h3>${crMi('clip',18)}剪報（${m.clips.length} 篇）</h3>${m.clips.map(c=>{
    const t = c.text||'', short = t.length<=90;
    return `<article class="cr-clip">${c.src ? `<button class="cr-scan" data-cr-lb="${n++}"><img src="${esc(c.src)}" alt="" loading="lazy">${c.sample?'<i class="cr-sample">示意</i>':''}<span class="vh">看掃描大圖：${esc(c.title)}</span></button>` : ''}
      <div class="cr-cb"><p class="cr-cm">${esc([c.paper, c.date && crDay(c.date)].filter(Boolean).join('・'))}</p><h4>${esc(c.title)}</h4>
      ${short ? `<p class="cr-ct">${esc(t)}</p>` : `<p class="cr-ct">${esc(t.slice(0,60))}……</p><details class="cr-full"><summary>讀全文</summary>${t.split('\n').map(x=>`<p>${esc(x)}</p>`).join('')}</details>`}
      ${c.credit ? `<p class="cr-cr">來源：${esc(c.credit)}</p>` : ''}</div></article>`; }).join('')}</section>`;
  if(m.talks.length) h += `<section class="cr-ms" aria-label="訪談"><h3>${crMi('talk',18)}訪談（${m.talks.length} 段）</h3>${m.talks.map(({a,i,ix})=>{
    const s0 = a.segs[ix[0]], nx = a.segs[ix[ix.length-1]+1], end = nx ? nx[0] : a.dur;
    return `<div class="cr-talk" data-iv="${i}"><div class="cr-th2"><p><b>${esc(a.who||a.title)}</b><span>${esc([a.title, a.date].filter(Boolean).join('・'))}・片段 ${mmss(s0[0])}–${mmss(end)}</span></p>
        <button class="btn" data-cr-play="${i}:${s0[0]}" aria-pressed="false">${PLAY_ICON}<span>播放這一段</span></button></div>
      <ol>${ix.map(k=>{ const sg = a.segs[k]; return `<li data-k="${k}"><button class="cr-ts" data-cr-ts="${i}:${sg[0]}" aria-label="從 ${mmss(sg[0])} 開始播放">${mmss(sg[0])}</button><p><b>${esc(sg[1])}</b>　${esc(sg[2])}</p></li>`; }).join('')}</ol>
      ${a.sample ? '<p class="cr-cr">示意訪談沒有聲音，按播放只示範進度與逐字稿的同步。</p>' : ''}
      ${ONLY ? '' : '<p class="pn-go"><a href="#audio" data-go="audio">看完整訪談與逐字稿 →</a></p>'}</div>`; }).join('')}</section>`;
  return `<div class="cr-media">${h}</div>`;
}
// 訪談正在播放時，卡片裡對應的那一段標出來，按鈕改成「暫停」（由 60-media.js 的 plPaint 呼叫）
function crPaintTalk(i, t, cur){
  $$('.cr-talk').forEach(el=>{
    const me = +el.dataset.iv===PL.i, on = me && PL.playing, b = $('[data-cr-play]', el);
    if(b){ b.setAttribute('aria-pressed', on); b.classList.toggle('solid', on); const sp = $('span', b); if(sp) sp.textContent = on ? '暫停這一段' : '播放這一段'; const ic = $('svg', b); if(ic) ic.classList.toggle('playing', on); }
    $$('li[data-k]', el).forEach(li=>{ const now = me && +li.dataset.k===cur && (PL.playing || t>0); li.classList.toggle('now', now); if(now) li.setAttribute('aria-current','true'); else li.removeAttribute('aria-current'); });
  });
}
/* 看大圖：照片與剪報掃描共用。開啟時焦點在「關閉」，Esc 關閉後回到原本的縮圖；Tab 只在這個框裡移動 */
let crLbEl = null, crLb = null;
function crLbItems(e){
  return e.m.photos.map(p=>({src:p.src, title:p.title||'照片', sub:[p.year && p.year+' 年', p.caption].filter(Boolean).join('　'), credit:p.credit, alt:p.alt||'', sample:p.sample}))
    .concat(e.m.clips.filter(c=>c.src).map(c=>({src:c.src, title:c.title, sub:[c.paper, c.date && crDay(c.date)].filter(Boolean).join('・'), credit:c.credit, text:c.text||'', sample:c.sample})));
}
function crLbOpen(k, opener){
  const e = crById[crSel]; if(!e) return;
  const items = crLbItems(e); if(!items[k]) return;
  if(!crLbEl){
    crLbEl = document.createElement('div'); crLbEl.className = 'cr-lb'; crLbEl.id = 'crLb'; crLbEl.hidden = true;
    crLbEl.setAttribute('role','dialog'); crLbEl.setAttribute('aria-modal','true'); crLbEl.setAttribute('aria-labelledby','crLbT');
    crLbEl.innerHTML = `<div class="cr-lb-top"><span id="crLbN"></span><button class="cr-lb-x" data-lb="close"><span aria-hidden="true">×</span>關閉（Esc）</button></div>
      <div class="cr-lb-mid"><button class="cr-lb-nav" data-lb="prev" aria-label="上一張">‹</button><figure><img id="crLbImg" alt=""><i class="cr-sample" id="crLbS" hidden>示意</i></figure><button class="cr-lb-nav" data-lb="next" aria-label="下一張">›</button></div>
      <div class="cr-lb-cap"><div><h2 id="crLbT"></h2><p id="crLbSub"></p><p class="cr-lb-cr" id="crLbCr"></p></div><div class="cr-lb-alt" id="crLbBox"><h3 id="crLbH"></h3><p id="crLbA"></p></div></div>`;
    document.body.appendChild(crLbEl);
    crLbEl.addEventListener('click', ev=>{ const b = ev.target.closest('[data-lb]'); if(!b) return; const v = b.dataset.lb;
      if(v==='close') crLbClose(); else crLbShow(crLb.k+(v==='next'?1:-1)); });
    document.addEventListener('keydown', ev=>{
      if(!crLb) return;
      if(ev.key==='Escape'){ ev.preventDefault(); ev.stopImmediatePropagation(); crLbClose(); }
      else if(ev.key==='ArrowLeft' || ev.key==='ArrowRight'){ ev.preventDefault(); ev.stopImmediatePropagation(); crLbShow(crLb.k+(ev.key==='ArrowRight'?1:-1)); }
      else if(ev.key==='Tab'){ const f = $$('button:not([hidden])', crLbEl), j = f.indexOf(document.activeElement); ev.preventDefault(); f[(j+(ev.shiftKey?-1:1)+f.length)%f.length].focus(); }
    }, true);
  }
  crLb = {items, k:0, back:opener||document.activeElement};
  crLbEl.hidden = false; document.documentElement.classList.add('lb-open');
  crLbShow(k);
  $('.cr-lb-x', crLbEl).focus();
}
function crLbShow(k){
  const it = crLb.items, n = it.length; k = (k+n)%n; crLb.k = k; const x = it[k];
  const img = $('#crLbImg'); img.src = x.src;
  // 照片：替代文字給報讀軟體，同一段文字也顯示在旁邊給所有人看（顯示的那段對報讀軟體隱藏，避免唸兩次）
  img.alt = x.text!=null ? '剪報掃描圖，內文在下方' : (x.alt || x.title);
  $('#crLbS').hidden = !x.sample;
  $('#crLbN').textContent = (x.text!=null ? '剪報' : '照片')+' '+(k+1)+' / '+n;
  $('#crLbT').textContent = x.title; $('#crLbSub').textContent = x.sub||''; $('#crLbCr').textContent = x.credit ? '來源：'+x.credit : '';
  $('#crLbH').textContent = x.text!=null ? '內文' : '畫面描述'; $('#crLbA').textContent = x.text!=null ? x.text : (x.alt||'（沒有畫面描述）');
  $('#crLbBox').setAttribute('aria-hidden', x.text!=null ? 'false' : 'true');
  $$('.cr-lb-nav', crLbEl).forEach(b=>{ b.hidden = n<2; });
}
function crLbClose(){
  if(!crLb) return; const back = crLb.back; crLb = null;
  crLbEl.hidden = true; document.documentElement.classList.remove('lb-open');
  if(back && document.contains(back)){ try{ back.focus({preventScroll:true}); }catch(e){} }
}
LEAVE.push(crLbClose);
LEAVE.push(()=>document.documentElement.classList.remove('cr-big'));          // 大字只用在年表
function crPanelHtml(){
  const sh = crShown();
  if(!crSel || !crById[crSel]){          // 手機的說明紙只在選了一件時出現，這段留給清單模式用
    const n = k => CR.filter(e=>e.lane===k).length, ev = CR.filter(e=>e.kind==='ev').length;
    return `<h2 tabindex="-1">大事年表</h2>
      <div class="pn-desc"><p>臺灣的 ${ev} 件大事，加上本站剪報、研究與學生人數裡看到的 ${CR.length-ev} 個轉折點，放在同一把時間尺上。</p><p>分成政府與民間兩道。點任何一件，這裡會顯示日期、說明與來源。</p></div>
      <dl class="pn-sum">${CR_LANES.map(l=>`<div><dt>${l.name}</dt><dd>${n(l.k)} 件</dd></div>`).join('')}</dl>
      <p class="pn-start"><button class="btn solid" data-act="cr-first">從最早的開始看</button></p>`;
  }
  const e = crById[crSel], ln = CR_LANE[e.lane], kd = CR_KINDS[e.kind], i = sh.indexOf(e), prev = sh[i-1], next = sh[i+1];
  const lines = e.x.split('\n'), k = lines.findIndex(s=>s.startsWith('備註：'));
  const main = (k<0?lines:lines.slice(0,k)).map(s=>`<p>${esc(s)}</p>`).join('');
  const memo = k<0 ? '' : `<div class="memo"><h3>備註</h3>${lines.slice(k).map((s,j)=>`<p>${esc(j?s:s.replace(/^備註：/,''))}</p>`).join('')}</div>`;
  const more = ONLY ? '' : e.tree ? `<p class="pn-go"><a href="#tree" data-act="cr-tree" data-id="${e.tree}">在時間軸（事件樹）上看這件事 →</a></p>`
    : kd.go ? `<p class="pn-go"><a href="#${kd.go}" data-go="${kd.go}">到「${SECTIONS[kd.go].name.replace(/・.*/,'')}」展區看 →</a></p>` : '';
  const easy = e.easy ? `<div class="cr-easy"><p class="cr-easy-h">易讀版${CR_EASY_DRAFT?'<span>草稿，待審閱</span>':''}</p>${e.easy.split('\n').map(t=>`<p>${esc(t)}</p>`).join('')}</div>` : '';
  const full = e.easy ? `<details class="cr-more"><summary>看完整說明</summary><div class="pn-desc">${main}${memo}</div></details>` : `<div class="pn-desc">${main}${memo}</div>`;
  const media = crMediaHtml(e);
  return `<div class="cr-d-main"><p class="pn-kind">${crIcon(e)}${ln.name}・${kd.data?kd.name+'（本站資料）':esc(CR_CATS[e.cat])}・${esc(CR_ERAS[e.era].name)}</p>
    <h2 tabindex="-1">${esc(e.t)}</h2>
    <p class="pn-date">${esc(crDate(e))}</p>
    ${easy}${full}
    <p class="cr-src">來源：${esc(e.src)}</p>
    ${more}</div>
    ${media ? `<div class="cr-d-side">${media}</div>` : ''}
    <div class="pager cr-d-foot"><button class="btn" data-act="cr-go" data-to="${prev?prev.id:''}"${prev?'':' disabled'}>‹ 上一件</button><span>${i+1} / ${sh.length}</span><button class="btn" data-act="cr-go" data-to="${next?next.id:''}"${next?'':' disabled'}>下一件 ›</button></div>`;
}
/* 說明：放在時間軸正下方，不擋住任何一件事；點別件時只換內容（文字清單模式才用從下方滑出的說明紙） */
const crBelow = () => !!$('#crDetail');
function crDrawPanel(){
  const d = $('#crDetail');
  if(d){
    closeSheet(true);
    d.classList.toggle('has-media', !!(crSel && crById[crSel].m.n));
    d.classList.toggle('intro', !crSel);
    d.innerHTML = crSel ? `<button class="cr-x" data-act="cr-close" aria-label="關閉說明">×</button>${crPanelHtml()}` : crIntroHtml();
    d.scrollTop = 0;
    return;
  }
  if(crSel) openSheet(crPanelHtml(), ()=>{ const id = crSel; crSel = null; render(); const el = id && $('#view [data-cr="'+id+'"]'); if(el){ try{ el.focus({preventScroll:true}); }catch(e){} } });
  else closeSheet(true);
}
// 沒選事件時，說明區放簡短的介紹（畫面固定的版面裡，說明區一直在同一個位置、同樣大小）
function crIntroHtml(){
  const n = (lane,kind) => CR.filter(e=>e.lane===lane && e.kind===kind).length, sw = l => `<i class="cr-sw" style="--c:${l.color}" aria-hidden="true"></i>`;
  return `<div class="cr-d-main"><h2 tabindex="-1">大事年表</h2>
    <p class="cr-hint">臺灣智能障礙的大事，分成政府與民間兩道。點時間軸上的任何一件，這裡會顯示它的說明、照片、剪報與訪談；也可以從最早的一件開始，一件一件往下看。</p>
    <p class="pn-start"><button class="btn solid" data-act="cr-first">從最早的開始看</button></p></div>
    <div class="cr-d-side"><table class="cr-key"><caption class="vh">兩道各有幾件</caption>
      <thead><tr><th scope="col"><span class="vh">種類</span></th>${CR_LANES.map(l=>`<th scope="col">${sw(l)}${l.name}<small>${l.sub}</small></th>`).join('')}</tr></thead>
      <tbody>${Object.entries(CR_KINDS).map(([k,kd])=>`<tr><th scope="row">${icon(kd.shape,'var(--ink2)',!!kd.data)}${kd.name}${kd.data?'<small>本站資料</small>':''}</th>${CR_LANES.map(l=>`<td>${n(l.k,k)||'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
// 讓時間軸與說明的開頭同時在畫面裡：時間軸盡量貼齊頁首下緣，說明的開頭也露出來，選到的那一件也留在畫面裡
function crShowDetail(){
  const d = $('#crDetail'), f = $('#crFig'); if(!d || !f || document.documentElement.classList.contains('cr-fixed')) return;          // 固定的版面不捲整頁
  const top = mastBottom()+8, H = window.innerHeight-(dock.hidden ? 0 : dock.offsetHeight), fr = f.getBoundingClientRect(), dr = d.getBoundingClientRect();
  const it = crSel && $('#view .cr-it[data-cr="'+crSel+'"]'), ir = it && it.getBoundingClientRect();
  const R = Math.max(130, Math.min(220, Math.round(H*.18)));          // 說明至少露出多少；矮的畫面少露一點，時間尺才不會被推到頁首底下
  if(fr.top >= top-2 && dr.top <= H-R) return;
  let s = fr.top-top;
  if(dr.top-s > H-R) s = dr.top-(H-R);
  if(ir && ir.top-s < top) s = ir.top-top;          // 時間軸太高時，寧可說明少露一點，也不要把選到的那一件捲出畫面
  window.scrollTo({top:Math.max(0, window.scrollY+s), behavior:calm()?'auto':'smooth'});
}
// 把某件事捲到看得見的地方（畫面左邊三分之一）
function crReveal(id, how){
  const sc = $('#crScroll'), p = CRL && CRL.pos[id]; if(!sc || !p) return;
  const o = {behavior:how||(calm()?'auto':'smooth')};
  if(p.x-8 < sc.scrollLeft+CRL.labW+8 || p.x+p.w > sc.scrollLeft+sc.clientWidth-8) o.left = Math.max(0, p.x-Math.max(CRL.labW+40, sc.clientWidth*.3));
  // 年表比框高時（畫面固定的版面），也上下捲到看得見，時間尺不會擋住
  if(p.y < sc.scrollTop+CRL.RULER+4 || p.y+CRL.rowH > sc.scrollTop+sc.clientHeight-4) o.top = Math.max(0, p.y-CRL.RULER-(sc.clientHeight-CRL.RULER)/3);
  if(o.left!=null || o.top!=null) sc.scrollTo(o);
}
function crEraNow(){
  const sc = $('#crScroll'); if(!sc || !CRL) return;
  const mid = sc.scrollLeft+CRL.labW+(sc.clientWidth-CRL.labW)*.4, t = crYearAt(mid);
  const i = CR_ERAS.reduce((a,r,j)=>t>=r.from ? j : a, 0);
  $$('#crEras [data-cr-era]').forEach(b=>b.setAttribute('aria-current', +b.dataset.crEra===i ? 'true' : 'false'));
  const pv = $('#crPrev'), nx = $('#crNext');
  if(pv) pv.disabled = sc.scrollLeft<=2; if(nx) nx.disabled = sc.scrollLeft>=sc.scrollWidth-sc.clientWidth-2;
}
function crYearAt(x){ const S = CRL.S; let lo = CR_START, hi = CR_END; for(let n=0;n<30;n++){ const m = (lo+hi)/2; if(CRL.padL+S.x(m)<x) lo = m; else hi = m; } return lo; }
function crToEra(i){ const sc = $('#crScroll'); if(!sc) return; sc.scrollTo({left:Math.max(0, CRL.padL+CRL.S.x(CR_ERAS[i].from)-CRL.labW-12), behavior:calm()?'auto':'smooth'}); }

/* 畫面固定的版面：整頁剛好一個畫面高，只有時間軸左右捲、說明區在框裡捲，點別件時畫面不會上下移動。
   畫面太矮（例如手機橫放、瀏覽器放大字）、開了大字或文字清單時，改回一般可以上下捲的頁面，內容才不會被擠掉 */
const crFixedOK = () => !crBig && !crList && window.matchMedia('(min-height: 560px)').matches;
const crSetTop = () => document.documentElement.style.setProperty('--cr-top', mastBottom()+'px');
DRAW.chron = function(){
  const fixed = crFixedOK();
  document.documentElement.classList.toggle('cr-big', crBig);
  document.documentElement.classList.toggle('cr-fixed', fixed);
  crSetTop();
  view.innerHTML = `<div class="wrap cr-app">${pageHead('chron',{tools:`<button class="btn solid" data-act="cr-first">從最早的開始看</button><button class="btn" id="crBigBtn" data-act="cr-big" aria-pressed="${crBig}"><span class="big-a" aria-hidden="true">大</span>大字</button><button class="btn" id="crListBtn" data-act="cr-list" aria-pressed="${crList}">文字清單</button>`})}
    <div class="tl">
      <div class="tl-main">
        <div class="cr-bar">
        ${crList ? '' : `<div class="cr-nav" id="crEras" role="group" aria-label="跳到章節">${CR_ERAS.map((r,i)=>`<button data-cr-era="${i}">${esc(r.name)}</button>`).join('')}
            <span class="cr-arrows"><button class="btn rd" id="crPrev" data-act="cr-page" data-dir="-1" aria-label="往前（較早）">‹</button><button class="btn rd" id="crNext" data-act="cr-page" data-dir="1" aria-label="往後（較晚）">›</button></span></div>`}
        </div>
        ${crList ? crListHtml() : `<div class="plate cr-fig" id="crFig"></div>
          <section class="plate cr-detail" id="crDetail" aria-label="說明"></section>
          <p class="cr-note">時間尺照年份比例畫，1980 年以前事件較少，尺比較緊。實心圓是大事，空心的是由本站資料算出的轉折點（方形剪報、三角形研究、六角形人數）。名稱後面的小圖示，表示這件事有照片、剪報或訪談。${[...PHOTOS,...CLIPS,...INTERVIEWS].some(x=>x.sample && (x.ev||x.evSegs)) ? '目前的照片、剪報內文與訪談是版面示意。' : ''}</p>`}
      </div>
    </div>${fixed ? '' : routeHtml()}</div>`;
  if(!crList) crDrawFig();
  crDrawPanel();
};
LEAVE.push(()=>document.documentElement.classList.remove('cr-fixed'));
function crDrawFig(){
  const fig = $('#crFig'); if(!fig) return;
  const fixed = document.documentElement.classList.contains('cr-fixed');
  // 固定的版面：時間軸最多占剩下空間的六成，放得下就只用它需要的高度，其餘都給說明區
  const box = fig.parentElement, avail = fixed ? Math.floor((box.getBoundingClientRect().bottom-fig.getBoundingClientRect().top)*.62) : 0;
  CRL = crLayout(Math.floor(fig.clientWidth), avail);
  fig.style.height = (fixed ? Math.min(CRL.H+2, avail) : CRL.H)+'px';
  fig.classList.toggle('compact', CRL.compact);          // 固定的版面：高度由畫面分配，年表在框裡捲
  fig.innerHTML = crFigHtml(CRL);
  const sc = $('#crScroll');
  sc.scrollLeft = crX; sc.scrollTop = crY;
  sc.addEventListener('scroll', ()=>{ crX = sc.scrollLeft; crY = sc.scrollTop; crEraNow(); }, {passive:true});
  // 滾輪往下＝往右；捲到頭尾時，交還給整頁捲動
  sc.addEventListener('wheel', e=>{
    if(e.ctrlKey || Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
    const d = e.deltaY*(e.deltaMode===1 ? 32 : 1), max = sc.scrollWidth-sc.clientWidth;
    if((d<0 && sc.scrollLeft<=0) || (d>0 && sc.scrollLeft>=max-1)) return;
    e.preventDefault(); sc.scrollLeft += d;
  }, {passive:false});
  // 用滑鼠拖曳
  let dx = null, dy = 0, s0 = 0, t0 = 0;
  sc.addEventListener('pointerdown', e=>{ if(e.pointerType==='mouse' && e.button===0){ dx = e.clientX; dy = e.clientY; s0 = sc.scrollLeft; t0 = sc.scrollTop; crDragged = false; } });
  sc.addEventListener('pointermove', e=>{ if(dx==null) return; const d = e.clientX-dx, v = e.clientY-dy; if(Math.abs(d)>5 || Math.abs(v)>5){ crDragged = true; sc.classList.add('drag'); } if(crDragged){ sc.scrollLeft = s0-d; sc.scrollTop = t0-v; } });
  const end = ()=>{ dx = null; sc.classList.remove('drag'); setTimeout(()=>{ crDragged = false; }, 0); };
  sc.addEventListener('pointerup', end); sc.addEventListener('pointerleave', end);
  sc.addEventListener('pointerover', e=>{ const b = e.target.closest('.cr-it'); crGuide(b ? b.dataset.cr : crSel); });
  sc.addEventListener('pointerleave', ()=>crGuide(crSel));
  sc.addEventListener('focusin', e=>{ const b = e.target.closest('.cr-it'); if(b){ crGuide(b.dataset.cr); crReveal(b.dataset.cr); } });
  sc.addEventListener('keydown', e=>{
    const b = e.target.closest('.cr-it');
    if(b && (e.key==='ArrowRight' || e.key==='ArrowLeft')){
      const sh = crShown(), i = sh.findIndex(x=>x.id===b.dataset.cr), n = sh[i+(e.key==='ArrowRight'?1:-1)];
      e.preventDefault(); if(n){ const el = $('#view .cr-it[data-cr="'+n.id+'"]'); if(el) el.focus(); } return; }
    if(!b && (e.key==='ArrowRight' || e.key==='ArrowLeft')){ e.preventDefault(); sc.scrollBy({left:(e.key==='ArrowRight'?1:-1)*sc.clientWidth*.6, behavior:calm()?'auto':'smooth'}); }
  });
  crGuide(crSel); crEraNow();
}
let crDragged = false;
let crKey = false;          // 這一次的選取是不是用鍵盤（Enter／空白鍵）
document.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') crKey = true; }, true);
document.addEventListener('pointerdown', ()=>{ crKey = false; }, true);
function crPick(id){
  const viaKey = crKey;
  const inSheet = sheet.contains(document.activeElement);
  crSel = id; hideTip(); render();
  if(id){ crReveal(id); const el = $('#view [data-cr="'+id+'"]');
    // 電腦：滑鼠點的，焦點留在那一件（可以接著點下一件）；用鍵盤選的，焦點移到說明的標題
    if(crBelow()){ crShowDetail(); if(viaKey){ const h = $('#crDetail h2'); if(h){ try{ h.focus({preventScroll:true}); }catch(e){} } } else if(el && el.closest('#crFig')){ try{ el.focus({preventScroll:true}); }catch(e){} } }
    else {
      // 手機：說明從下方滑出來，把選到的那一件捲到說明上方看得到的位置
      if(el && !sheet.hidden){ const r = el.getBoundingClientRect(), top = mastBottom()+10, bot = window.innerHeight-sheet.offsetHeight-14;
        if(r.top<top || r.bottom>bot) window.scrollTo({top:Math.max(0, window.scrollY+r.top-top-Math.max(0,(bot-top-r.height)/2)), behavior:calm()?'auto':'smooth'}); }
      if(!inSheet){ const h = $('#sheetBody h2'); if(h){ try{ h.focus({preventScroll:true}); }catch(e){} } } } }
}
function chronClick(e){
  if(page!=='chron') return;
  const t = e.target; let el;
  if((el = t.closest('[data-act]'))){ const a = el.dataset.act;
    if(a==='cr-close'){ const id = crSel; crSel = null; render(); const b = id && $('#view [data-cr="'+id+'"]'); if(b){ try{ b.focus({preventScroll:true}); }catch(err){} } return; }
    if(a==='cr-list'){ crList = !crList; render(); return; }
    if(a==='cr-big'){ crSetBig(!crBig); render(); const b = $('#crBigBtn'); if(b) b.focus(); return; }
    if(a==='cr-first') return crPick(crShown()[0].id);
    if(a==='cr-go'){ if(el.dataset.to) crPick(el.dataset.to); return; }
    if(a==='cr-page'){ const sc = $('#crScroll'); if(sc) sc.scrollBy({left:+el.dataset.dir*sc.clientWidth*.7, behavior:calm()?'auto':'smooth'}); return; }
    if(a==='cr-tree'){ e.preventDefault(); tlClear(); tSel = el.dataset.id; return go('tree', undefined, {quiet:true}); }
    return; }
  if((el = t.closest('[data-cr-lb]'))) return crLbOpen(+el.dataset.crLb, el);
  if((el = t.closest('[data-cr-play]'))){ const [i,s0] = el.dataset.crPlay.split(':').map(Number); return PL.i===i ? plToggle(i) : plSeek(i, s0, true); }
  if((el = t.closest('[data-cr-ts]'))){ const [i,s0] = el.dataset.crTs.split(':').map(Number); return plSeek(i, s0, true); }
  if((el = t.closest('[data-cr-era]'))) return crToEra(+el.dataset.crEra);
  if((el = t.closest('[data-cr]'))){ if(crDragged) return; const id = el.dataset.cr; return crPick(crSel===id && el.closest('#crFig') ? null : id); }
}
view.addEventListener('click', chronClick);
sheet.addEventListener('click', chronClick);
TOURS.chron = () => [
  {sel:crList?'.tlist':'#crFig', title:'年表', text:crList ? '全部的時間點依章節排成清單。' : '由左往右是由早到晚，上方是時間尺。上面一道是政府（法規、教育、統計，藍色），下面一道是民間（家長、學界、報紙，橘色）。實心圓形是大事；空心的方形、三角形、六角形是剪報、研究、人數裡看到的轉折點。可以左右捲動、拖曳，或用滾輪。'},
  {sel:'#crEras', title:'跳到章節', text:'1962 到 2024 年分成三章，點章節名稱就會捲到那裡；右邊的箭頭一次捲一段。'},
  {sel:'#view .cr-it', title:'點一件看說明', text:'滑鼠移上去，時間尺上會標出日期。點一下，時間軸下方會出現說明與來源，點別件就換成那一件；可以用「上一件／下一件」依時間一件一件看，按 Esc 或 × 關掉。'},
  {sel:'#view .cr-b', title:'照片、剪報、訪談', text:'名稱後面有小圖示的事件，點開說明可以看照片、讀剪報、聽訪談的片段。每一張照片都有畫面描述，每一段錄音都有逐字稿。'},
  {sel:'#crBigBtn', title:'大字', text:'字太小的話，按「大字」放大年表與說明；再按一次回到原來的大小。'},
  {sel:'#crListBtn', title:'文字清單', text:'把全部的時間點排成純文字的清單，也寫出每件事有哪些照片、剪報與訪談。'}
];
