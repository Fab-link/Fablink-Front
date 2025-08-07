import ExcelJS from 'exceljs'
import { getGarmentSizes } from './constants'

interface WorksheetData {
  productName: string
  season?: string
  target?: string
  concept?: string
  detail?: string
  quantity: number
  size: string
  garmentType: string
  fabric: string
  material: string
  dueDate: string
  memo?: string
  compositeImageUrl?: string
  contact?: string
}

export const generateWorksheetPDF = async (data: WorksheetData): Promise<Blob> => {
  try {
    // 1. 템플릿 파일 로드
    const workbook = new ExcelJS.Workbook()
    const response = await fetch('/templates/work_sheet_templates.xlsx')
    
    if (!response.ok) {
      throw new Error(`템플릿 파일 로드 실패: ${response.status} ${response.statusText}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && !contentType.includes('application/octet-stream')) {
      console.warn('예상치 못한 content-type:', contentType)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    await workbook.xlsx.load(arrayBuffer)
    
    const worksheet = workbook.worksheets[0] || workbook.getWorksheet(1)
    if (!worksheet) {
      console.log('사용 가능한 워크시트:', workbook.worksheets.length)
      throw new Error('워크시트를 찾을 수 없습니다')
    }
    
    // 2. 기본 정보 입력
    console.log('📋 작업지시서 데이터:', {
      ...data,
      compositeImageUrl: data.compositeImageUrl ? '✅ 있음' : '❌ 없음'
    })
    
    worksheet.getCell('G3').value = data.productName || ''  // 제품명
    worksheet.getCell('G4').value = data.season || ''       // 시즌
    worksheet.getCell('G5').value = data.target || ''       // 타겟
    worksheet.getCell('L3').value = data.contact || ''      // 연락처
    worksheet.getCell('L4').value = data.dueDate || ''      // 납기일
    worksheet.getCell('L5').value = data.quantity || ''     // 수량
    
    // 원단/부자재 정보 파싱
    const fabricInfo = typeof data.fabric === 'string' ? data.fabric : 
                      (data.fabric?.name || JSON.stringify(data.fabric) || '')
    const materialInfo = typeof data.material === 'string' ? data.material : 
                        (data.material?.name || JSON.stringify(data.material) || '')
    
    worksheet.getCell('O24').value = fabricInfo      // 원단
    worksheet.getCell('O32').value = materialInfo    // 부자재
    worksheet.getCell('H38').value = data.concept || ''     // 컨셉
    worksheet.getCell('H40').value = data.detail || ''      // 디테일
    worksheet.getCell('H42').value = data.memo || ''        // 참고사항
    
    // 3. 치수 정보 입력
    const upperSize = data.size.toUpperCase()
    worksheet.getCell('P10').value = upperSize || ''        // 사이즈
    console.log('의류 타입:', data.garmentType, '사이즈:', upperSize)
    const sizes = getGarmentSizes(data.garmentType, upperSize)
    console.log('치수 정보:', sizes)
    
    if (sizes) {
      worksheet.getCell('P11').value = sizes.totalLength      // 총장
      worksheet.getCell('P12').value = sizes.shoulderWidth    // 어깨너비
      worksheet.getCell('P13').value = sizes.chestWidth       // 가슴둘래
      worksheet.getCell('P14').value = sizes.waistWidth       // 허리둘래
      worksheet.getCell('P15').value = sizes.hemWidth         // 밑단둘래
      worksheet.getCell('P16').value = sizes.armhole          // 암홀
      worksheet.getCell('P17').value = sizes.sleeveLength     // 소매길이
      worksheet.getCell('P18').value = sizes.sleeveWidth      // 소매통
      worksheet.getCell('P19').value = sizes.cuffWidth        // 소매부리
      worksheet.getCell('P20').value = sizes.neckWidth        // 목둘래
    } else {
      console.log('치수 정보를 찾을 수 없습니다')
    }
    
    // 4. 합성 이미지 삽입
    console.log('이미지 삽입 시작 - URL:', data.compositeImageUrl)
    if (data.compositeImageUrl && data.compositeImageUrl.trim() !== '') {
      try {
        console.log('이미지 fetch 시작:', data.compositeImageUrl)
        const imageResponse = await fetch(data.compositeImageUrl)
        console.log('이미지 응답:', {
          status: imageResponse.status,
          statusText: imageResponse.statusText,
          headers: Object.fromEntries(imageResponse.headers.entries())
        })
        
        if (!imageResponse.ok) {
          throw new Error(`이미지 로드 실패: ${imageResponse.status} ${imageResponse.statusText}`)
        }
        
        const imageBuffer = await imageResponse.arrayBuffer()
        console.log('이미지 버퍼 정보:', {
          size: imageBuffer.byteLength,
          type: typeof imageBuffer
        })
        
        if (imageBuffer.byteLength === 0) {
          throw new Error('이미지 버퍼가 비어있습니다')
        }
        
        // Content-Type에서 확장자 추출
        const contentType = imageResponse.headers.get('content-type') || 'image/png'
        let extension = 'png'
        if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          extension = 'jpeg'
        } else if (contentType.includes('gif')) {
          extension = 'gif'
        } else if (contentType.includes('webp')) {
          extension = 'png'
        }
        
        console.log('이미지 추가 시작:', { extension, contentType })
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: extension,
        })
        console.log('이미지 ID 생성 완료:', imageId)
        
        const imageConfig = {
          tl: { col: 4.2, row: 8.2 }, // E9
          br: { col: 13.8, row: 34.8 }, // N35
          editAs: 'oneCell'
        }
        console.log('이미지 배치 설정:', imageConfig)
        
        worksheet.addImage(imageId, imageConfig)
        console.log('✅ 이미지가 워크시트에 성공적으로 추가됨')
      } catch (error) {
        console.error('❌ 이미지 삽입 실패:', {
          error: error.message,
          stack: error.stack,
          url: data.compositeImageUrl
        })
      }
    } else {
      console.log('⚠️ 합성 이미지 URL이 없거나 비어있음:', data.compositeImageUrl)
    }
    
    // 5. 엑셀을 Blob으로 변환
    const buffer = await workbook.xlsx.writeBuffer()
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
  } catch (error) {
    console.error('엑셀 처리 오류:', error)
    throw error
  }
}

export const downloadWorksheetExcel = async (data: WorksheetData) => {
  try {
    const excelBlob = await generateWorksheetPDF(data)
    const url = URL.createObjectURL(excelBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `worksheet_${data.productName}_${Date.now()}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('작업지시서 다운로드 오류:', error)
    alert('작업지시서 생성 중 오류가 발생했습니다.')
  }
}