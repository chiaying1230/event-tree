/* ============ 年表：國際與臺灣的大事，加上本站資料（剪報、研究、人數）的轉折點，排在同一把時間尺上 ============
   一道一種來源，由上到下：國際、臺灣、剪報、研究、人數。上方的時間尺照年份比例畫；1950 年以前事件少，尺比較緊。
   事件裡寫 tree:'q1' 的，名稱、日期、說明直接取自事件樹（00-data.js 的 TREE），這裡不重複寫。
   要加事件：照下面的格式加一筆。d 寫成 1984、1984-12 或 1984-12-17；lane 是 intl、tw、news、lit、people；
   cat（只有大事要寫）是 law 法規與政策、assess 定義與鑑定、edu 教育與普查、rights 權利與社會。
   剪報、研究、人數三道的數字由 source/data.json 算出，資料更新時請重算。 */
const CR_LANES = [
  {k:'intl', name:'國際', kind:'大事', shape:'circle'},
  {k:'tw', name:'臺灣', kind:'大事', shape:'diamond'},
  {k:'news', name:'剪報', kind:'本站資料', shape:'square', data:true, go:'news'},
  {k:'lit', name:'研究', kind:'本站資料', shape:'square', data:true, go:'research'},
  {k:'people', name:'人數', kind:'本站資料', shape:'square', data:true, go:'people'}
];
const CR_CATS = {law:'法規與政策', assess:'定義與鑑定', edu:'教育與普查', rights:'權利與社會'};
const CR_ERAS = [
  {from:1795, name:'啟蒙與機構'},
  {from:1905, name:'測量與優生'},
  {from:1950, name:'覺醒與正常化'},
  {from:1980, name:'立法與正名'},
  {from:2000, name:'權利與支持'}
];
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
  {id:"p2007", d:"2007", lane:"people", t:"臺北市：學障超過智障",
   x:"2007 年，臺北市的特教學生裡，學習障礙 2,196 人，第一次多於智能障礙的 1,918 人。\n臺北市的智能障礙學生從 2003 年的 2,345 人，減少到 2024 年的 506 人。"},
  {id:"p2009", d:"2009", lane:"people", t:"臺北市：自閉症超過智障",
   x:"2009 年，臺北市的自閉症學生 2,020 人，第一次多於智能障礙的 1,861 人。\n全國要到 2022 年才出現同樣的交叉。"},
  {id:"p2010", d:"2010", lane:"people", t:"全國智障學生最多",
   x:"全國特教學生裡的智能障礙學生，2010 年是 26,059 人，是有資料的 2008–2024 年裡最多的一年，之後逐年減少。"},
  {id:"p2013", d:"2013", lane:"people", t:"全國：學障超過智障",
   x:"2013 年，全國的學習障礙學生 26,797 人，第一次多於智能障礙的 25,088 人。臺北市早在 2007 年就出現這個交叉。"},
  {id:"p2014", d:"2014", lane:"people", t:"智能障礙者超過十萬人",
   x:"衛福部統計的全國智能障礙者，2014 年底是 100,588 人，第一次超過十萬。\n之後大致持平，2024 年底是 102,556 人。"},
  {id:"p2022", d:"2022", lane:"people", t:"全國：自閉症超過智障",
   x:"2022 年，全國的自閉症學生 18,853 人，第一次多於智能障礙的 17,608 人。臺北市在 2009 年就已交叉。"},
  {id:"p2024", d:"2024", lane:"people", t:"智障學生 16,800 人",
   x:"2024 年，全國的智能障礙學生 16,800 人，比 2010 年的高峰少了 36%。\n占全部特教學生的比例，從 2008 年的 31% 降到 13%。同一時期，衛福部統計的智能障礙者總人數沒有減少，維持在十萬人上下。"}
];
const CR_LANE = Object.fromEntries(CR_LANES.map(l=>[l.k,l]));
const CR = CR_RAW.map(r=>{
  const e = Object.assign({}, r);
  if(r.tree){ const t = byId[r.tree]; Object.assign(e, {id:'t-'+r.tree, d:t.date, t:t.title, x:t.desc, when:t.when, src:'本站「智能障礙重大事件表」'}); }
  const [y,mo,dd] = e.d.split('-').map(Number);
  Object.assign(e, {y, mo, dd, k: y+((mo?mo-1:6)+((dd||15)-1)/31)/12});          // 只寫年份的排在年中
  e.era = CR_ERAS.reduce((a,r,i)=>e.y>=r.from ? i : a, 0);
  if(CR_LANE[e.lane].data) e.src = '本站資料：'+CR_LANE[e.lane].name+'（由 source/data.json 計算）';
  return e;
}).sort((a,b)=>a.k-b.k);
const crById = Object.fromEntries(CR.map(e=>[e.id,e]));
const crYear = e => e.when && /年代/.test(e.when) ? e.when : String(e.y);          // 卡片上只寫年份；「1970年代」這種照寫
const crDate = e => e.when || (e.dd ? `${e.y} 年 ${e.mo} 月 ${e.dd} 日` : e.mo ? `${e.y} 年 ${e.mo} 月` : `${e.y} 年`);

let crSel = null, crList = false, crX = 0;
const crShow = new Set(CR_LANES.map(l=>l.k));
const crShown = () => CR.filter(e=>crShow.has(e.lane));
let CRL = null;          // 目前的版面：比例尺、每件事的位置

/* 時間尺：分成幾段，每段每一年多寬。事件少的年代比較緊 */
function crScale(narrow){
  const B = [1795, 1905, 1950, 1980, CR_END], P = (narrow ? [2.4, 9, 50, 92] : [3.6, 14, 80, 150]);
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
function crLayout(width){
  const narrow = vw()<720, S = crScale(narrow), labW = narrow ? 44 : 64, padL = labW+24, padR = narrow ? 140 : 200;
  const fs = narrow ? 13.8 : 14.7, rowH = narrow ? 44 : 46, RULER = 58, lanePad = 6;
  const wOf = e => Math.ceil(34+Math.max(textW(crYear(e), 12.5), Math.min(textW(e.t, fs)*1.06, narrow ? 180 : 240)));          // 一件事的寬度：依名稱長短
  const pos = {}, lanes = [];
  let top = RULER;
  CR_LANES.filter(l=>crShow.has(l.k)).forEach(l=>{
    const rows = [];
    CR.filter(e=>e.lane===l.k).forEach(e=>{
      const x = padL+S.x(e.k), l0 = x-8;
      let r = rows.findIndex(end=>end+10<=l0); if(r<0){ r = rows.length; rows.push(0); }
      const w = wOf(e); rows[r] = l0+w; pos[e.id] = {x, w, row:r, lane:l.k};
    });
    const h = Math.max(1,rows.length)*rowH+lanePad*2;
    lanes.push({...l, top, h});
    CR.filter(e=>e.lane===l.k).forEach(e=>{ pos[e.id].y = top+lanePad+pos[e.id].row*rowH; });
    top += h;
  });
  return {S, narrow, labW, padL, W: Math.max(width, padL+S.W+padR), H: top, rowH, RULER, pos, lanes};
}
function crSvgRuler(L){
  const f = v => v.toFixed(1), X = t => L.padL+L.S.x(t);
  let g = '';
  // 章節：淡淡的底色與名稱
  CR_ERAS.forEach((r,i)=>{ const a = X(Math.max(r.from,1795)), b = X(i<CR_ERAS.length-1 ? CR_ERAS[i+1].from : CR_END);
    if(i%2) g += `<rect x="${f(a)}" y="0" width="${f(b-a)}" height="${L.H}" fill="var(--trk)"/>`; });
  crTicks(L.S).forEach(t=>{ const x = X(t.y);
    g += `<line x1="${f(x)}" x2="${f(x)}" y1="${t.major?36:44}" y2="${L.RULER}" stroke="var(--line2)" stroke-width="1"/>`;
    if(t.major) g += `<line x1="${f(x)}" x2="${f(x)}" y1="${L.RULER}" y2="${L.H}" stroke="var(--line)" stroke-width="1" opacity=".55"/><text x="${f(x+4)}" y="48" font-size="12.5" fill="var(--muted)" font-variant-numeric="tabular-nums">${t.y}</text>`; });
  g += `<line x1="${L.padL-16}" x2="${L.W}" y1="${L.RULER}" y2="${L.RULER}" stroke="var(--line2)" stroke-width="1"/>`;
  L.lanes.slice(1).forEach(l=>{ g += `<line x1="0" x2="${L.W}" y1="${l.top}" y2="${l.top}" stroke="var(--line)" stroke-width="1"/>`; });
  return `<svg class="cr-bg" width="${L.W}" height="${L.H}" aria-hidden="true" focusable="false">${g}</svg>`;
}
function crFigHtml(L){
  const X = t => L.padL+L.S.x(t);
  const eras = CR_ERAS.map((r,i)=>{ const a = X(Math.max(r.from,1795)), b = X(i<CR_ERAS.length-1 ? CR_ERAS[i+1].from : CR_END);
    return `<div class="cr-era" style="left:${a.toFixed(0)}px;width:${(b-a).toFixed(0)}px"><span>${esc(r.name)}</span></div>`; }).join('');
  const items = CR.filter(e=>L.pos[e.id]).map(e=>{ const p = L.pos[e.id], ln = CR_LANE[e.lane];
    return `<button class="cr-it${ln.data?' data':''}" data-cr="${e.id}" aria-pressed="${crSel===e.id}" style="left:${(p.x-8).toFixed(0)}px;top:${p.y}px;width:${p.w}px" title="${esc(e.t)}">${icon(ln.shape,'var(--ink)',ln.data)}<span class="cr-y">${esc(crYear(e))}</span><span class="cr-t">${esc(e.t)}</span><span class="vh">，${ln.name}${ln.data?'（本站資料）':''}</span></button>`; }).join('');
  const labels = L.lanes.map(l=>`<div class="cr-lane${l.data?' data':''}" style="top:${l.top}px;height:${l.h}px;width:${L.labW}px"><b>${l.name}</b>${L.narrow?'':`<small>${l.kind}</small>`}</div>`).join('');
  return `<div class="cr-scroll" id="crScroll" tabindex="0" aria-label="年表，可以左右捲動">
      <div class="cr-track" style="width:${L.W}px;height:${L.H}px">${crSvgRuler(L)}${eras}<i class="cr-guide" id="crGuide" hidden></i><span class="cr-flag" id="crFlag" hidden></span>${items}</div>
    </div>
    <div class="cr-labels" aria-hidden="true"><div class="cr-corner" style="width:${L.labW}px;height:${L.RULER}px"></div>${labels}</div>`;
}
// 滑鼠移到（或鍵盤停在）一件事上：從時間尺拉一條細線下來，尺上標出日期
function crGuide(id){
  const g = $('#crGuide'), fl = $('#crFlag'); if(!g || !CRL) return;
  const e = id && crById[id], p = e && CRL.pos[id];
  if(!p){ g.hidden = fl.hidden = true; return; }
  g.hidden = fl.hidden = false;
  g.style.cssText = `left:${p.x.toFixed(0)}px;top:${CRL.RULER}px;height:${p.y+6-CRL.RULER}px`;
  fl.textContent = (e.when && /年代/.test(e.when)) ? e.when : (e.mo ? e.y+'.'+e.mo+(e.dd?'.'+e.dd:'') : e.y);
  fl.style.left = p.x.toFixed(0)+'px';
}
function crListHtml(){
  return `<div class="tlist plate">${CR_ERAS.map((r,i)=>{ const ev = crShown().filter(e=>e.era===i); if(!ev.length) return '';
    return `<h2>${esc(r.name)}（${ev[0].y}–${ev[ev.length-1].y}）</h2><ol>${ev.map(e=>{ const ln = CR_LANE[e.lane];
      return `<li><button class="litem" data-cr="${e.id}" aria-pressed="${crSel===e.id}" style="--c:var(--ink)"><span class="ld">${esc(crDate(e))}</span><b>${esc(e.t)}</b><span class="lm">${icon(ln.shape,'var(--ink)',ln.data)}${ln.name}</span></button></li>`; }).join('')}</ol>`; }).join('')}</div>`;
}
function crPanelHtml(){
  const sh = crShown();
  if(!crSel || !crById[crSel]){
    const n = k => CR.filter(e=>e.lane===k).length;
    return `<h2 tabindex="-1">大事年表</h2>
      <div class="pn-desc"><p>國際與臺灣的 ${n('intl')+n('tw')} 件大事，加上本站剪報、研究與學生人數裡看到的 ${n('news')+n('lit')+n('people')} 個轉折點，放在同一把時間尺上。</p><p>上方是時間尺；一道一種來源。點任何一件，這裡會顯示日期、說明與來源。</p></div>
      <dl class="pn-sum">${CR_LANES.map(l=>`<div><dt>${l.name}${l.data?'・本站資料':''}</dt><dd>${n(l.k)} ${l.data?'個':'件'}</dd></div>`).join('')}</dl>
      <p class="pn-start"><button class="btn solid" data-act="cr-first">從最早的開始看</button></p>`;
  }
  const e = crById[crSel], ln = CR_LANE[e.lane], i = sh.indexOf(e), prev = sh[i-1], next = sh[i+1];
  const lines = e.x.split('\n'), k = lines.findIndex(s=>s.startsWith('備註：'));
  const main = (k<0?lines:lines.slice(0,k)).map(s=>`<p>${esc(s)}</p>`).join('');
  const memo = k<0 ? '' : `<div class="memo"><h3>備註</h3>${lines.slice(k).map((s,j)=>`<p>${esc(j?s:s.replace(/^備註：/,''))}</p>`).join('')}</div>`;
  const more = e.tree ? `<p class="pn-go"><a href="#tree" data-act="cr-tree" data-id="${e.tree}">在時間軸（事件樹）上看這件事 →</a></p>`
    : ln.go ? `<p class="pn-go"><a href="#${ln.go}" data-go="${ln.go}">到「${SECTIONS[ln.go].name.replace(/・.*/,'')}」展區看 →</a></p>` : '';
  return `<p class="pn-kind">${icon(ln.shape,'var(--ink)',ln.data)}${ln.name}・${ln.data?'本站資料':esc(CR_CATS[e.cat])}・${esc(CR_ERAS[e.era].name)}</p>
    <h2 tabindex="-1">${esc(e.t)}</h2>
    <p class="pn-date">${esc(crDate(e))}</p>
    <div class="pn-desc">${main}${memo}</div>
    <p class="cr-src">來源：${esc(e.src)}</p>
    ${more}
    <div class="pager"><button class="btn" data-act="cr-go" data-to="${prev?prev.id:''}"${prev?'':' disabled'}>‹ 上一件</button><span>${i+1} / ${sh.length}</span><button class="btn" data-act="cr-go" data-to="${next?next.id:''}"${next?'':' disabled'}>下一件 ›</button></div>`;
}
function crDrawPanel(){
  const p = $('#crPanel');
  if(p){ closeSheet(true); p.innerHTML = crPanelHtml(); p.scrollTop = 0; return; }
  if(crSel) openSheet(crPanelHtml(), ()=>{ const id = crSel; crSel = null; render(); const el = id && $('#view [data-cr="'+id+'"]'); if(el){ try{ el.focus({preventScroll:true}); }catch(e){} } });
  else closeSheet(true);
}
// 把某件事捲到看得見的地方（畫面左邊三分之一）
function crReveal(id, how){
  const sc = $('#crScroll'), p = CRL && CRL.pos[id]; if(!sc || !p) return;
  const want = p.x-Math.max(CRL.labW+40, sc.clientWidth*.3);
  if(p.x-8 < sc.scrollLeft+CRL.labW+8 || p.x+p.w > sc.scrollLeft+sc.clientWidth-8) sc.scrollTo({left:Math.max(0,want), behavior:how||(calm()?'auto':'smooth')});
}
function crEraNow(){
  const sc = $('#crScroll'); if(!sc || !CRL) return;
  const mid = sc.scrollLeft+CRL.labW+(sc.clientWidth-CRL.labW)*.4, t = crYearAt(mid);
  const i = CR_ERAS.reduce((a,r,j)=>t>=r.from ? j : a, 0);
  $$('#crEras [data-cr-era]').forEach(b=>b.setAttribute('aria-current', +b.dataset.crEra===i ? 'true' : 'false'));
  const pv = $('#crPrev'), nx = $('#crNext');
  if(pv) pv.disabled = sc.scrollLeft<=2; if(nx) nx.disabled = sc.scrollLeft>=sc.scrollWidth-sc.clientWidth-2;
}
function crYearAt(x){ const S = CRL.S; let lo = 1795, hi = CR_END; for(let n=0;n<30;n++){ const m = (lo+hi)/2; if(CRL.padL+S.x(m)<x) lo = m; else hi = m; } return lo; }
function crToEra(i){ const sc = $('#crScroll'); if(!sc) return; sc.scrollTo({left:Math.max(0, CRL.padL+CRL.S.x(CR_ERAS[i].from)-CRL.labW-12), behavior:calm()?'auto':'smooth'}); }

DRAW.chron = function(){
  const wide = vw()>=1040;
  view.innerHTML = `<div class="wrap">${pageHead('chron',{tools:`<button class="btn" data-act="cr-clear"${crSel?'':' hidden'}>清除選取</button><button class="btn" id="crListBtn" data-act="cr-list" aria-pressed="${crList}">文字清單</button>`})}
    <div class="tl${wide?' wide':''}">
      <div class="tl-main">
        <div class="tl-filter" id="crFilter" role="group" aria-label="要看哪幾道">
          <span class="lbl" aria-hidden="true">顯示</span>
          ${CR_LANES.map(l=>`<button class="bchip" data-cr-lane="${l.k}" aria-pressed="${crShow.has(l.k)}">${icon(l.shape,'var(--ink)',l.data || !crShow.has(l.k))}${l.name}</button>`).join('')}
        </div>
        ${crList ? crListHtml() : `<div class="cr-nav" id="crEras" role="group" aria-label="跳到章節">${CR_ERAS.map((r,i)=>`<button data-cr-era="${i}">${esc(r.name)}</button>`).join('')}
            <span class="cr-arrows"><button class="btn rd" id="crPrev" data-act="cr-page" data-dir="-1" aria-label="往前（較早）">‹</button><button class="btn rd" id="crNext" data-act="cr-page" data-dir="1" aria-label="往後（較晚）">›</button></span></div>
          <div class="plate cr-fig" id="crFig"></div>
          <p class="cr-note">時間尺照年份比例畫，1950 年以前事件較少，尺比較緊。空心方形是由本站資料算出的轉折點。</p>`}
      </div>
      ${wide ? '<aside class="panel plate" id="crPanel" aria-live="polite" aria-label="說明"></aside>' : ''}
    </div>${routeHtml()}</div>`;
  if(!crList) crDrawFig();
  crDrawPanel();
};
function crDrawFig(){
  const fig = $('#crFig'); if(!fig) return;
  CRL = crLayout(Math.floor(fig.clientWidth));
  fig.style.height = CRL.H+'px';
  fig.innerHTML = crFigHtml(CRL);
  const sc = $('#crScroll');
  sc.scrollLeft = crX;
  sc.addEventListener('scroll', ()=>{ crX = sc.scrollLeft; crEraNow(); }, {passive:true});
  // 滾輪往下＝往右；捲到頭尾時，交還給整頁捲動
  sc.addEventListener('wheel', e=>{
    if(e.ctrlKey || Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
    const d = e.deltaY*(e.deltaMode===1 ? 32 : 1), max = sc.scrollWidth-sc.clientWidth;
    if((d<0 && sc.scrollLeft<=0) || (d>0 && sc.scrollLeft>=max-1)) return;
    e.preventDefault(); sc.scrollLeft += d;
  }, {passive:false});
  // 用滑鼠拖曳
  let dx = null, s0 = 0;
  sc.addEventListener('pointerdown', e=>{ if(e.pointerType==='mouse' && e.button===0){ dx = e.clientX; s0 = sc.scrollLeft; crDragged = false; } });
  sc.addEventListener('pointermove', e=>{ if(dx==null) return; const d = e.clientX-dx; if(Math.abs(d)>5){ crDragged = true; sc.classList.add('drag'); } if(crDragged) sc.scrollLeft = s0-d; });
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
function crPick(id){
  const inSheet = sheet.contains(document.activeElement);
  crSel = id; hideTip(); render();
  if(id){ crReveal(id); const el = $('#view [data-cr="'+id+'"]');
    if($('#crPanel')){ if(el){ try{ el.focus({preventScroll:true}); }catch(e){} } }
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
    if(a==='cr-clear'){ crSel = null; render(); const b = $('#crListBtn'); if(b) b.focus(); return; }
    if(a==='cr-list'){ crList = !crList; render(); return; }
    if(a==='cr-first') return crPick(crShown()[0].id);
    if(a==='cr-go'){ if(el.dataset.to) crPick(el.dataset.to); return; }
    if(a==='cr-page'){ const sc = $('#crScroll'); if(sc) sc.scrollBy({left:+el.dataset.dir*sc.clientWidth*.7, behavior:calm()?'auto':'smooth'}); return; }
    if(a==='cr-tree'){ e.preventDefault(); tlClear(); tSel = el.dataset.id; return go('tree', undefined, {quiet:true}); }
    return; }
  if((el = t.closest('[data-cr-lane]'))){ const k = el.dataset.crLane;
    if(crShow.has(k) && crShow.size>1) crShow.delete(k); else crShow.add(k);
    if(crSel && !crShow.has(crById[crSel].lane)) crSel = null;
    return render(); }
  if((el = t.closest('[data-cr-era]'))) return crToEra(+el.dataset.crEra);
  if((el = t.closest('[data-cr]'))){ if(crDragged) return; const id = el.dataset.cr; return crPick(crSel===id && el.closest('#crFig') ? null : id); }
}
view.addEventListener('click', chronClick);
sheet.addEventListener('click', chronClick);
TOURS.chron = () => [
  {sel:crList?'.tlist':'#crFig', title:'年表', text:crList ? '全部的時間點依章節排成清單。' : '由左往右是由早到晚，上方是時間尺。一道一種來源：國際、臺灣的大事，以及本站剪報、研究、人數裡看到的轉折點。可以左右捲動、拖曳，或用滾輪。'},
  {sel:'#crFilter', title:'選要看哪幾道', text:'點一下可以收起或打開一道。'},
  {sel:'#crEras', title:'跳到章節', text:'兩百多年分成五章，點章節名稱就會捲到那裡；右邊的箭頭一次捲一段。'},
  {sel:'#view .cr-it', title:'點一件看說明', text:'滑鼠移上去，時間尺上會標出日期。點一下會顯示說明與來源，可以用「上一件／下一件」依時間一件一件看。'},
  {sel:'#crListBtn', title:'文字清單', text:'把全部的時間點排成純文字的清單。'}
];
