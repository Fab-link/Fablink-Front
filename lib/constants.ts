// 의류별 사이즈 치수 정보
export const GARMENT_SIZES = {
  tshirt: {
    S: {
      totalLength: 66,      // 총장
      shoulderWidth: 44,    // 어깨너비
      chestWidth: 50,       // 가슴둘레
      waistWidth: 48,       // 허리둘레
      hemWidth: 50,         // 밑단둘레
      armhole: 22,          // 암홀
      sleeveLength: 20,     // 소매길이
      sleeveWidth: 18,      // 소매통
      cuffWidth: 16,        // 소매부리
      neckWidth: 20,        // 목둘레
    },
    M: {
      totalLength: 68,
      shoulderWidth: 46,
      chestWidth: 53,
      waistWidth: 51,
      hemWidth: 53,
      armhole: 23,
      sleeveLength: 21,
      sleeveWidth: 19,
      cuffWidth: 17,
      neckWidth: 21,
    },
    L: {
      totalLength: 70,
      shoulderWidth: 48,
      chestWidth: 56,
      waistWidth: 54,
      hemWidth: 56,
      armhole: 24,
      sleeveLength: 22,
      sleeveWidth: 20,
      cuffWidth: 18,
      neckWidth: 22,
    },
    XL: {
      totalLength: 72,
      shoulderWidth: 50,
      chestWidth: 59,
      waistWidth: 57,
      hemWidth: 59,
      armhole: 25,
      sleeveLength: 23,
      sleeveWidth: 21,
      cuffWidth: 19,
      neckWidth: 23,
    }
  },
  polo: {
    S: {
      totalLength: 66,
      shoulderWidth: 44,
      chestWidth: 50,
      waistWidth: 48,
      hemWidth: 50,
      armhole: 22,
      sleeveLength: 20,
      sleeveWidth: 18,
      cuffWidth: 16,
      neckWidth: 20,
    },
    M: {
      totalLength: 68,
      shoulderWidth: 46,
      chestWidth: 53,
      waistWidth: 51,
      hemWidth: 53,
      armhole: 23,
      sleeveLength: 21,
      sleeveWidth: 19,
      cuffWidth: 17,
      neckWidth: 21,
    },
    L: {
      totalLength: 70,
      shoulderWidth: 48,
      chestWidth: 56,
      waistWidth: 54,
      hemWidth: 56,
      armhole: 24,
      sleeveLength: 22,
      sleeveWidth: 20,
      cuffWidth: 18,
      neckWidth: 22,
    },
    XL: {
      totalLength: 72,
      shoulderWidth: 50,
      chestWidth: 59,
      waistWidth: 57,
      hemWidth: 59,
      armhole: 25,
      sleeveLength: 23,
      sleeveWidth: 21,
      cuffWidth: 19,
      neckWidth: 23,
    }
  },
  sweatshirt: {
    S: {
      totalLength: 64,
      shoulderWidth: 46,
      chestWidth: 52,
      waistWidth: 50,
      hemWidth: 52,
      armhole: 23,
      sleeveLength: 58,
      sleeveWidth: 20,
      cuffWidth: 9,
      neckWidth: 21,
    },
    M: {
      totalLength: 66,
      shoulderWidth: 48,
      chestWidth: 55,
      waistWidth: 53,
      hemWidth: 55,
      armhole: 24,
      sleeveLength: 60,
      sleeveWidth: 21,
      cuffWidth: 9.5,
      neckWidth: 22,
    },
    L: {
      totalLength: 68,
      shoulderWidth: 50,
      chestWidth: 58,
      waistWidth: 56,
      hemWidth: 58,
      armhole: 25,
      sleeveLength: 62,
      sleeveWidth: 22,
      cuffWidth: 10,
      neckWidth: 23,
    },
    XL: {
      totalLength: 70,
      shoulderWidth: 52,
      chestWidth: 61,
      waistWidth: 59,
      hemWidth: 61,
      armhole: 26,
      sleeveLength: 64,
      sleeveWidth: 23,
      cuffWidth: 10.5,
      neckWidth: 24,
    }
  },
  shirt: {
    S: {
      totalLength: 72,
      shoulderWidth: 44,
      chestWidth: 50,
      waistWidth: 48,
      hemWidth: 50,
      armhole: 22,
      sleeveLength: 60,
      sleeveWidth: 18,
      cuffWidth: 10,
      neckWidth: 20,
    },
    M: {
      totalLength: 74,
      shoulderWidth: 46,
      chestWidth: 53,
      waistWidth: 51,
      hemWidth: 53,
      armhole: 23,
      sleeveLength: 62,
      sleeveWidth: 19,
      cuffWidth: 10.5,
      neckWidth: 21,
    },
    L: {
      totalLength: 76,
      shoulderWidth: 48,
      chestWidth: 56,
      waistWidth: 54,
      hemWidth: 56,
      armhole: 24,
      sleeveLength: 64,
      sleeveWidth: 20,
      cuffWidth: 11,
      neckWidth: 22,
    },
    XL: {
      totalLength: 78,
      shoulderWidth: 50,
      chestWidth: 59,
      waistWidth: 57,
      hemWidth: 59,
      armhole: 25,
      sleeveLength: 66,
      sleeveWidth: 21,
      cuffWidth: 11.5,
      neckWidth: 23,
    }
  }
}

// 의류 타입과 사이즈에 따른 치수 정보를 반환하는 함수
export const getGarmentSizes = (garmentType: string, size: string) => {
  const garment = GARMENT_SIZES[garmentType as keyof typeof GARMENT_SIZES]
  if (!garment) return null
  
  const sizeData = garment[size as keyof typeof garment]
  return sizeData || null
}