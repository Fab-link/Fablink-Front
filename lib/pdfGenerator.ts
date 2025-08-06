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
}

export const generateWorksheetPDF = async (data: WorksheetData): Promise<Blob> => {
  try {
    // 1. 템플릿 파일 로드
    const workbook = new ExcelJS.Workbook()
    const response = await fetch('/templates/work_sheet_templates.xlsx')
    const arrayBuffer = await response.arrayBuffer()
    await workbook.xlsx.load(arrayBuffer)
    
    const worksheet = workbook.worksheets[0] || workbook.getWorksheet(1)
    if (!worksheet) {
      console.log('사용 가능한 워크시트:', workbook.worksheets.length)
      throw new Error('워크시트를 찾을 수 없습니다')
    }
    
    // 2. 기본 정보 입력
    console.log('작업지시서 데이터:', data)
    
    worksheet.getCell('G3').value = data.productName || ''  // 제품명
    worksheet.getCell('G4').value = data.season || ''       // 시즌
    worksheet.getCell('G5').value = data.target || ''       // 타겟
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
    if (data.compositeImageUrl) {
      try {
        const imageResponse = await fetch(data.compositeImageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: 'png',
        })
        
        worksheet.addImage(imageId, {
          tl: { col: 4, row: 8 }, // E9 셀 (col: 4=E, row: 8=9번째 행)
          ext: { width: 200, height: 200 }
        })
      } catch (error) {
        console.error('이미지 삽입 오류:', error)
      }
    }
    
    // 4. 엑셀을 Blob으로 변환
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