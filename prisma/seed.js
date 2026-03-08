const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminHash = bcrypt.hashSync('admin1234', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@cami-ivy.com' },
    update: {},
    create: {
      email: 'admin@cami-ivy.com',
      passwordHash: adminHash,
      name: '관리자',
    },
  });
  console.log('Admin:', admin.email);

  // ─── 강아지 옷 카테고리 전체 구조 (옷만, 6개 대분류 + 하위) ───
  const petTypeDog = 'DOG';
  const upsertCat = (petType, slug, name, parentId = null, sortOrder = 0) => {
    return prisma.category.upsert({
      where: { slug },
      update: { name, parentId, sortOrder },
      create: { name, slug, petType, parentId, sortOrder },
    });
  };
  const upsertDog = (slug, name, parentId = null, sortOrder = 0) =>
    upsertCat(petTypeDog, slug, name, parentId, sortOrder);

  // 1. 기본 의류
  const dogBasic = await upsertDog('dog-apparel-basic', '기본 의류', null, 1);
  const tshirt = await upsertDog('dog-apparel-tshirt', '티셔츠', dogBasic.id, 0);
  await upsertDog('dog-apparel-tshirt-cotton', '면티', tshirt.id, 0);
  await upsertDog('dog-apparel-tshirt-sleeveless', '민소매', tshirt.id, 1);
  await upsertDog('dog-apparel-tshirt-long', '긴팔', tshirt.id, 2);
  await upsertDog('dog-apparel-tshirt-print', '프린팅 티', tshirt.id, 3);
  const hoodie = await upsertDog('dog-apparel-hoodie', '후드/맨투맨', dogBasic.id, 1);
  await upsertDog('dog-apparel-hoodie-hood', '후드티', hoodie.id, 0);
  await upsertDog('dog-apparel-hoodie-mtm', '맨투맨', hoodie.id, 1);
  await upsertDog('dog-apparel-hoodie-zip', '지퍼 후드', hoodie.id, 2);
  const shirt = await upsertDog('dog-apparel-shirt', '셔츠/블라우스', dogBasic.id, 2);
  await upsertDog('dog-apparel-shirt-check', '체크 셔츠', shirt.id, 0);
  await upsertDog('dog-apparel-shirt-basic', '베이직 셔츠', shirt.id, 1);
  await upsertDog('dog-apparel-shirt-lace', '레이스 블라우스', shirt.id, 2);
  const dress = await upsertDog('dog-apparel-dress', '원피스', dogBasic.id, 3);
  await upsertDog('dog-apparel-dress-casual', '캐주얼 원피스', dress.id, 0);
  await upsertDog('dog-apparel-dress-type', '드레스형', dress.id, 1);
  await upsertDog('dog-apparel-dress-ballet', '발레리나 스타일', dress.id, 2);
  const pants = await upsertDog('dog-apparel-pants', '바지/스커트', dogBasic.id, 4);
  await upsertDog('dog-apparel-pants-jeans', '청바지', pants.id, 0);
  await upsertDog('dog-apparel-pants-leggings', '레깅스', pants.id, 1);
  await upsertDog('dog-apparel-pants-skirt', '스커트', pants.id, 2);
  await upsertDog('dog-apparel-pants-suspenders', '멜빵바지', pants.id, 3);
  const jumpsuit = await upsertDog('dog-apparel-jumpsuit', '점프수트', dogBasic.id, 5);
  await upsertDog('dog-apparel-jumpsuit-all', '올인원', jumpsuit.id, 0);
  await upsertDog('dog-apparel-jumpsuit-pajama', '파자마 수트', jumpsuit.id, 1);
  await upsertDog('dog-apparel-jumpsuit-costume', '코스튬 수트', jumpsuit.id, 2);

  // 2. 계절 의류
  const dogSeason = await upsertDog('dog-apparel-seasonal', '계절 의류', null, 2);
  const springFall = await upsertDog('dog-apparel-spring-fall', '봄/가을', dogSeason.id, 0);
  await upsertDog('dog-apparel-spring-knit', '얇은 니트', springFall.id, 0);
  await upsertDog('dog-apparel-spring-padding', '라이트 패딩', springFall.id, 1);
  await upsertDog('dog-apparel-spring-wind', '바람막이', springFall.id, 2);
  const summer = await upsertDog('dog-apparel-summer', '여름', dogSeason.id, 1);
  await upsertDog('dog-apparel-summer-cooling', '쿨링 의류', summer.id, 0);
  await upsertDog('dog-apparel-summer-mesh', '통기성 메쉬', summer.id, 1);
  await upsertDog('dog-apparel-summer-tank', '탱크탑', summer.id, 2);
  const winter = await upsertDog('dog-apparel-winter', '겨울', dogSeason.id, 2);
  await upsertDog('dog-apparel-winter-padding', '패딩', winter.id, 0);
  await upsertDog('dog-apparel-winter-fleece', '플리스', winter.id, 1);
  await upsertDog('dog-apparel-winter-wool', '털옷', winter.id, 2);
  await upsertDog('dog-apparel-winter-vest', '양털 조끼', winter.id, 3);
  const rain = await upsertDog('dog-apparel-rain', '우비(레인코트)', dogSeason.id, 3);
  await upsertDog('dog-apparel-rain-coat', '방수 우비', rain.id, 0);
  await upsertDog('dog-apparel-rain-set', '우비 세트', rain.id, 1);
  await upsertDog('dog-apparel-rain-boots', '방수 장화', rain.id, 2);

  // 3. 기능성 의류
  const dogFunc = await upsertDog('dog-apparel-functional', '기능성 의류', null, 3);
  const cooling = await upsertDog('dog-apparel-cooling', '쿨링웨어', dogFunc.id, 0);
  await upsertDog('dog-apparel-cooling-ice', '아이스 원단', cooling.id, 0);
  await upsertDog('dog-apparel-cooling-vest', '물 적시는 쿨링 조끼', cooling.id, 1);
  const heating = await upsertDog('dog-apparel-heating', '방한복', dogFunc.id, 1);
  await upsertDog('dog-apparel-heating-pad', '발열 패딩', heating.id, 0);
  await upsertDog('dog-apparel-heating-high', '고기능 보온복', heating.id, 1);
  const swim = await upsertDog('dog-apparel-swim', '수영/스포츠', dogFunc.id, 2);
  await upsertDog('dog-apparel-swim-suit', '수영복', swim.id, 0);
  await upsertDog('dog-apparel-swim-rash', '래쉬가드', swim.id, 1);
  await upsertDog('dog-apparel-swim-sport', '운동 웨어', swim.id, 2);
  const medical = await upsertDog('dog-apparel-medical', '회복용/의료복', dogFunc.id, 3);
  await upsertDog('dog-apparel-medical-cone', '수술 후 보호복(넥카라 대체)', medical.id, 0);
  await upsertDog('dog-apparel-medical-skin', '피부 보호복', medical.id, 1);
  const night = await upsertDog('dog-apparel-night', '야간 안전용', dogFunc.id, 4);
  await upsertDog('dog-apparel-night-reflect', '반사 조끼', night.id, 0);
  await upsertDog('dog-apparel-night-led', 'LED 조끼', night.id, 1);

  // 4. 패션 아이템
  const dogFashion = await upsertDog('dog-apparel-fashion', '패션 아이템', null, 4);
  const harness = await upsertDog('dog-apparel-harness', '하네스/조끼형 웨어', dogFashion.id, 0);
  await upsertDog('dog-apparel-harness-fashion', '패션 하네스', harness.id, 0);
  await upsertDog('dog-apparel-harness-light', '라이트 조끼', harness.id, 1);
  await upsertDog('dog-apparel-harness-backpack', '백팩 하네스', harness.id, 2);
  const acc = await upsertDog('dog-apparel-accessory', '액세서리', dogFashion.id, 1);
  await upsertDog('dog-apparel-acc-pin', '머리핀', acc.id, 0);
  await upsertDog('dog-apparel-acc-tie', '넥타이', acc.id, 1);
  await upsertDog('dog-apparel-acc-ribbon', '리본', acc.id, 2);
  await upsertDog('dog-apparel-acc-scarf', '스카프', acc.id, 3);
  const shoes = await upsertDog('dog-apparel-shoes', '신발', dogFashion.id, 2);
  await upsertDog('dog-apparel-shoes-water', '방수 신발', shoes.id, 0);
  await upsertDog('dog-apparel-shoes-sock', '미끄럼방지 양말', shoes.id, 1);
  await upsertDog('dog-apparel-shoes-boots', '부츠', shoes.id, 2);

  // 5. 특별 의상
  const dogSpecial = await upsertDog('dog-apparel-special', '특별 의상', null, 5);
  const party = await upsertDog('dog-apparel-party', '행사/파티룩', dogSpecial.id, 0);
  await upsertDog('dog-apparel-party-birthday', '생일 옷', party.id, 0);
  await upsertDog('dog-apparel-party-dress', '파티 드레스', party.id, 1);
  await upsertDog('dog-apparel-party-tux', '턱시도', party.id, 2);
  const cosplay = await upsertDog('dog-apparel-cosplay', '코스프레', dogSpecial.id, 1);
  await upsertDog('dog-apparel-cosplay-animal', '동물 코스튬', cosplay.id, 0);
  await upsertDog('dog-apparel-cosplay-character', '캐릭터 코스튬', cosplay.id, 1);
  await upsertDog('dog-apparel-cosplay-halloween', '할로윈 의상', cosplay.id, 2);
  const traditional = await upsertDog('dog-apparel-traditional', '전통의상', dogSpecial.id, 2);
  await upsertDog('dog-apparel-traditional-hanbok', '강아지 한복', traditional.id, 0);
  await upsertDog('dog-apparel-traditional-holiday', '명절복', traditional.id, 1);
  await upsertDog('dog-apparel-traditional-anniversary', '기념일 옷', traditional.id, 2);

  // 6. 홈/라운지 웨어
  const dogHome = await upsertDog('dog-apparel-home', '홈/라운지 웨어', null, 6);
  const pajama = await upsertDog('dog-apparel-pajama', '잠옷/파자마', dogHome.id, 0);
  await upsertDog('dog-apparel-pajama-cotton', '면 파자마', pajama.id, 0);
  await upsertDog('dog-apparel-pajama-footless', '무발 수트', pajama.id, 1);
  await upsertDog('dog-apparel-pajama-wide', '광폭 파자마', pajama.id, 2);
  const indoor = await upsertDog('dog-apparel-indoor', '실내복', dogHome.id, 1);
  await upsertDog('dog-apparel-indoor-inner', '가벼운 이너웨어', indoor.id, 0);
  await upsertDog('dog-apparel-indoor-wool', '털실내복', indoor.id, 1);
  const gown = await upsertDog('dog-apparel-gown', '모닝가운', dogHome.id, 2);
  await upsertDog('dog-apparel-gown-towel', '가운/타월 재질', gown.id, 0);

  console.log('강아지 옷 카테고리 6개 대분류 + 하위 생성 완료');

  // ─── 고양이 옷 카테고리 (강아지와 동일 6개 대분류 + 하위) ───
  const petTypeCat = 'CAT';
  const catBasic = await upsertCat(petTypeCat, 'cat-apparel-basic', '기본 의류', null, 1);
  const catTshirt = await upsertCat(petTypeCat, 'cat-apparel-tshirt', '티셔츠', catBasic.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-tshirt-cotton', '면티', catTshirt.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-tshirt-sleeveless', '민소매', catTshirt.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-tshirt-long', '긴팔', catTshirt.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-tshirt-print', '프린팅 티', catTshirt.id, 3);
  const catHoodie = await upsertCat(petTypeCat, 'cat-apparel-hoodie', '후드/맨투맨', catBasic.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-hoodie-hood', '후드티', catHoodie.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-hoodie-mtm', '맨투맨', catHoodie.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-hoodie-zip', '지퍼 후드', catHoodie.id, 2);
  const catShirt = await upsertCat(petTypeCat, 'cat-apparel-shirt', '셔츠/블라우스', catBasic.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-shirt-check', '체크 셔츠', catShirt.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-shirt-basic', '베이직 셔츠', catShirt.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-shirt-lace', '레이스 블라우스', catShirt.id, 2);
  const catDress = await upsertCat(petTypeCat, 'cat-apparel-dress', '원피스', catBasic.id, 3);
  await upsertCat(petTypeCat, 'cat-apparel-dress-casual', '캐주얼 원피스', catDress.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-dress-type', '드레스형', catDress.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-dress-ballet', '발레리나 스타일', catDress.id, 2);
  const catPants = await upsertCat(petTypeCat, 'cat-apparel-pants', '바지/스커트', catBasic.id, 4);
  await upsertCat(petTypeCat, 'cat-apparel-pants-jeans', '청바지', catPants.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-pants-leggings', '레깅스', catPants.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-pants-skirt', '스커트', catPants.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-pants-suspenders', '멜빵바지', catPants.id, 3);
  const catJumpsuit = await upsertCat(petTypeCat, 'cat-apparel-jumpsuit', '점프수트', catBasic.id, 5);
  await upsertCat(petTypeCat, 'cat-apparel-jumpsuit-all', '올인원', catJumpsuit.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-jumpsuit-pajama', '파자마 수트', catJumpsuit.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-jumpsuit-costume', '코스튬 수트', catJumpsuit.id, 2);

  const catSeason = await upsertCat(petTypeCat, 'cat-apparel-seasonal', '계절 의류', null, 2);
  const catSpringFall = await upsertCat(petTypeCat, 'cat-apparel-spring-fall', '봄/가을', catSeason.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-spring-knit', '얇은 니트', catSpringFall.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-spring-padding', '라이트 패딩', catSpringFall.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-spring-wind', '바람막이', catSpringFall.id, 2);
  const catSummer = await upsertCat(petTypeCat, 'cat-apparel-summer', '여름', catSeason.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-summer-cooling', '쿨링 의류', catSummer.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-summer-mesh', '통기성 메쉬', catSummer.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-summer-tank', '탱크탑', catSummer.id, 2);
  const catWinter = await upsertCat(petTypeCat, 'cat-apparel-winter', '겨울', catSeason.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-winter-padding', '패딩', catWinter.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-winter-fleece', '플리스', catWinter.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-winter-wool', '털옷', catWinter.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-winter-vest', '양털 조끼', catWinter.id, 3);
  const catRain = await upsertCat(petTypeCat, 'cat-apparel-rain', '우비(레인코트)', catSeason.id, 3);
  await upsertCat(petTypeCat, 'cat-apparel-rain-coat', '방수 우비', catRain.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-rain-set', '우비 세트', catRain.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-rain-boots', '방수 장화', catRain.id, 2);

  const catFunc = await upsertCat(petTypeCat, 'cat-apparel-functional', '기능성 의류', null, 3);
  const catCooling = await upsertCat(petTypeCat, 'cat-apparel-cooling', '쿨링웨어', catFunc.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-cooling-ice', '아이스 원단', catCooling.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-cooling-vest', '물 적시는 쿨링 조끼', catCooling.id, 1);
  const catHeating = await upsertCat(petTypeCat, 'cat-apparel-heating', '방한복', catFunc.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-heating-pad', '발열 패딩', catHeating.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-heating-high', '고기능 보온복', catHeating.id, 1);
  const catSwim = await upsertCat(petTypeCat, 'cat-apparel-swim', '수영/스포츠', catFunc.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-swim-suit', '수영복', catSwim.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-swim-rash', '래쉬가드', catSwim.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-swim-sport', '운동 웨어', catSwim.id, 2);
  const catMedical = await upsertCat(petTypeCat, 'cat-apparel-medical', '회복용/의료복', catFunc.id, 3);
  await upsertCat(petTypeCat, 'cat-apparel-medical-cone', '수술 후 보호복(넥카라 대체)', catMedical.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-medical-skin', '피부 보호복', catMedical.id, 1);
  const catNight = await upsertCat(petTypeCat, 'cat-apparel-night', '야간 안전용', catFunc.id, 4);
  await upsertCat(petTypeCat, 'cat-apparel-night-reflect', '반사 조끼', catNight.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-night-led', 'LED 조끼', catNight.id, 1);

  const catFashion = await upsertCat(petTypeCat, 'cat-apparel-fashion', '패션 아이템', null, 4);
  const catHarness = await upsertCat(petTypeCat, 'cat-apparel-harness', '하네스/조끼형 웨어', catFashion.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-harness-fashion', '패션 하네스', catHarness.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-harness-light', '라이트 조끼', catHarness.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-harness-backpack', '백팩 하네스', catHarness.id, 2);
  const catAcc = await upsertCat(petTypeCat, 'cat-apparel-accessory', '액세서리', catFashion.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-acc-pin', '머리핀', catAcc.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-acc-tie', '넥타이', catAcc.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-acc-ribbon', '리본', catAcc.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-acc-scarf', '스카프', catAcc.id, 3);
  const catShoes = await upsertCat(petTypeCat, 'cat-apparel-shoes', '신발', catFashion.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-shoes-water', '방수 신발', catShoes.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-shoes-sock', '미끄럼방지 양말', catShoes.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-shoes-boots', '부츠', catShoes.id, 2);

  const catSpecial = await upsertCat(petTypeCat, 'cat-apparel-special', '특별 의상', null, 5);
  const catParty = await upsertCat(petTypeCat, 'cat-apparel-party', '행사/파티룩', catSpecial.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-party-birthday', '생일 옷', catParty.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-party-dress', '파티 드레스', catParty.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-party-tux', '턱시도', catParty.id, 2);
  const catCosplay = await upsertCat(petTypeCat, 'cat-apparel-cosplay', '코스프레', catSpecial.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-cosplay-animal', '동물 코스튬', catCosplay.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-cosplay-character', '캐릭터 코스튬', catCosplay.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-cosplay-halloween', '할로윈 의상', catCosplay.id, 2);
  const catTraditional = await upsertCat(petTypeCat, 'cat-apparel-traditional', '전통의상', catSpecial.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-traditional-hanbok', '고양이 한복', catTraditional.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-traditional-holiday', '명절복', catTraditional.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-traditional-anniversary', '기념일 옷', catTraditional.id, 2);

  const catHome = await upsertCat(petTypeCat, 'cat-apparel-home', '홈/라운지 웨어', null, 6);
  const catPajama = await upsertCat(petTypeCat, 'cat-apparel-pajama', '잠옷/파자마', catHome.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-pajama-cotton', '면 파자마', catPajama.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-pajama-footless', '무발 수트', catPajama.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-pajama-wide', '광폭 파자마', catPajama.id, 2);
  const catIndoor = await upsertCat(petTypeCat, 'cat-apparel-indoor', '실내복', catHome.id, 1);
  await upsertCat(petTypeCat, 'cat-apparel-indoor-inner', '가벼운 이너웨어', catIndoor.id, 0);
  await upsertCat(petTypeCat, 'cat-apparel-indoor-wool', '털실내복', catIndoor.id, 1);
  const catGown = await upsertCat(petTypeCat, 'cat-apparel-gown', '모닝가운', catHome.id, 2);
  await upsertCat(petTypeCat, 'cat-apparel-gown-towel', '가운/타월 재질', catGown.id, 0);

  console.log('고양이 옷 카테고리 6개 대분류 + 하위 생성 완료');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
