"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Upload, X, ImageIcon, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"

import { manufacturingApi } from "@/lib/api/manufacturing"

export default function ManufacturingStep2() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [pointDescription, setPointDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // 디자인 미리보기 상태
  const [selectedGarmentType, setSelectedGarmentType] = useState<string>('')
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // 의류 종류 옵션
  const garmentTypes = [
    { id: 'tshirt', name: '티셔츠', silhouette: '/images/garments/tshirt.png' },
    { id: 'polo', name: '카라티', silhouette: '/images/garments/polo.png' },
    { id: 'sweatshirt', name: '맨투맨', silhouette: '/images/garments/sweatshirt.png' },
    { id: 'shirt', name: '셔츠', silhouette: '/images/garments/shirt.png' }
  ]
  
  // 디자인 요소 옵션 (1024x1024 이미지 기준)
  const designElements = [
    { id: 'logo', name: '로고', position: { top: '25%', left: '27%' } },
    { id: 'print', name: '프린팅', position: { top: '45%', left: '50%', transform: 'translateX(-50%)' } },
    { id: 'patch', name: '패치', position: { top: '70%', left: '25%' } }
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
    
    // 첫 번째 파일을 미리보기 이미지로 설정
    if (files.length > 0) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(files[0])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    if (index === 0) {
      setPreviewImage(null)
    }
  }
  
  const handleGarmentTypeChange = (type: string) => {
    setSelectedGarmentType(type)
  }
  
  const handleElementChange = (elementId: string, checked: boolean) => {
    if (checked) {
      setSelectedElements(prev => [...prev, elementId])
    } else {
      setSelectedElements(prev => prev.filter(id => id !== elementId))
    }
  }
  
  // Canvas로 합성 이미지 생성
  const generateCompositeImage = async (): Promise<Blob | null> => {
    if (!selectedGarmentType || !previewImage) return null
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    canvas.width = 800
    canvas.height = 800
    
    return new Promise((resolve) => {
      const garmentImg = new Image()
      garmentImg.crossOrigin = 'anonymous'
      garmentImg.onload = () => {
        // 의류 실루엣 그리기
        ctx.drawImage(garmentImg, 0, 0, canvas.width, canvas.height)
        
        // 사용자 디자인 요소들 그리기
        const designImg = new Image()
        designImg.crossOrigin = 'anonymous'
        designImg.onload = () => {
          selectedElements.forEach((elementId) => {
            const element = designElements.find(e => e.id === elementId)
            if (!element) return
            
            const x = parseFloat(element.position.left.replace('%', '')) / 100 * canvas.width
            const y = parseFloat(element.position.top.replace('%', '')) / 100 * canvas.height
            
            let width, height
            if (elementId === 'print') {
              width = canvas.width * 0.4
              height = canvas.height * 0.25
            } else if (elementId === 'logo') {
              width = canvas.width * 0.2
              height = canvas.height * 0.12
            } else {
              width = canvas.width * 0.18
              height = canvas.height * 0.1
            }
            
            ctx.drawImage(designImg, x - width/2, y - height/2, width, height)
          })
          
          canvas.toBlob(resolve, 'image/png')
        }
        designImg.src = previewImage
      }
      garmentImg.src = `/images/garments/${selectedGarmentType}.png`
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const manufacturingData = JSON.parse(localStorage.getItem("manufacturingData") || "{}")
      const productId = manufacturingData.productId

      console.log('Manufacturing data:', manufacturingData)
      console.log('Product ID:', productId)

      if (!productId) {
        setErrorMessage("제품 ID를 찾을 수 없습니다. 이전 단계로 돌아가 다시 시도해주세요.")
        setIsLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("detail", pointDescription)
      if (uploadedFiles.length > 0) {
        formData.append("image_path", uploadedFiles[0])
      }

      console.log('Submitting form data:', {
        detail: pointDescription,
        hasImage: uploadedFiles.length > 0,
        fileName: uploadedFiles[0]?.name
      })

      // 합성 이미지 생성 및 저장
      const compositeBlob = await generateCompositeImage()
      if (compositeBlob) {
        formData.append("composite_image", compositeBlob, "design_preview.png")
      }
      
      const result = await manufacturingApi.updateProduct(productId, formData)
      console.log('Update result:', result)

      // 업데이트된 데이터를 localStorage에 저장
      const updatedData = { 
        ...manufacturingData, 
        detail: pointDescription,
        compositeImageUrl: result.composite_image_url // 서버에서 반환된 URL
      }
      localStorage.setItem("manufacturingData", JSON.stringify(updatedData))

      router.push("/manufacturing/ai-analysis")
    } catch (error) {
      console.error('Submit error:', error)
      setErrorMessage(`데이터 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/manufacturing")
  }

  const isFormValid = pointDescription.trim() // 이미지는 선택사항으로 변경

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">단계 2/6</span>
            <span className="text-sm text-gray-500">디자인 파일 업로드</span>
          </div>
          <Progress value={33.33} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">디자인 파일 업로드</h1>
          <p className="text-gray-600">스케치나 디자인 파일을 업로드하고 포인트 부위를 설명해주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 1열: 파일 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle>디자인 파일 업로드</CardTitle>
              <CardDescription>
                스케치, 디자인 도면, 참고 이미지 등을 업로드해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900 mb-1">파일 업로드</p>
                  <p className="text-xs text-gray-500">png, png, PDF 지원</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".png,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>업로드된 파일</Label>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{file.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2열: 포인트 부위 설명 */}
          <Card>
            <CardHeader>
              <CardTitle>포인트 부위 설명</CardTitle>
              <CardDescription>디자인의 핵심 포인트나 특별히 신경써야 할 부위를 설명해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="pointDescription">포인트 부위 설명 *</Label>
                <Textarea
                  id="pointDescription"
                  placeholder="예: 소매 부분의 주름 디테일, 목선의 V넥 각도, 허리 라인의 다트 위치 등"
                  value={pointDescription}
                  onChange={(e) => setPointDescription(e.target.value)}
                  rows={8}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 3열: 의류 종류 & 디자인 요소 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shirt className="h-5 w-5" />
                <span>의류 종류 & 디자인 요소</span>
              </CardTitle>
              <CardDescription>제작할 의류 종류와 디자인 요소를 선택해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 의류 종류 */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">의류 종류</Label>
                  <div className="space-y-2">
                    {garmentTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.id}
                          checked={selectedGarmentType === type.id}
                          onCheckedChange={(checked) => {
                            if (checked) handleGarmentTypeChange(type.id)
                          }}
                        />
                        <Label htmlFor={type.id} className="text-sm">{type.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 디자인 요소 */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">디자인 요소</Label>
                  <div className="space-y-2">
                    {designElements.map((element) => (
                      <div key={element.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={element.id}
                          checked={selectedElements.includes(element.id)}
                          onCheckedChange={(checked) => handleElementChange(element.id, !!checked)}
                        />
                        <Label htmlFor={element.id} className="text-sm">{element.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 디자인 미리보기 (전체 폭 사용) */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">디자인 미리보기</CardTitle>
              <CardDescription>선택한 옵션에 따른 디자인 미리보기</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-100 rounded-lg p-6 min-h-[350px] flex items-center justify-center">
                {selectedGarmentType ? (
                  <div className="relative flex items-center justify-center">
                    {/* 의류 실루엣 (이미지 기반) */}
                    <div className="relative">
                      <div className="w-80 h-80 relative">
                        <img 
                          src={`/images/garments/${selectedGarmentType}.png`}
                          alt={`${garmentTypes.find(g => g.id === selectedGarmentType)?.name} 실루엣`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* 업로드된 이미지를 선택된 요소 위치에 표시 */}
                      {previewImage && selectedElements.map((elementId) => {
                        const element = designElements.find(e => e.id === elementId)
                        if (!element) return null
                        
                        return (
                          <div
                            key={elementId}
                            className="absolute"
                            style={{
                              ...element.position,
                              width: elementId === 'print' ? '40%' : elementId === 'logo' ? '20%' : '18%',
                              height: elementId === 'print' ? '25%' : elementId === 'logo' ? '12%' : '10%'
                            }}
                          >
                            <img
                              src={previewImage}
                              alt={`${element.name} 미리보기`}
                              className="w-full h-full object-contain opacity-90"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Shirt className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                    <p className="text-base">의류 종류를 선택하면</p>
                    <p className="text-sm">미리보기가 표시됩니다</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
        
        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            이전 단계
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || isLoading}>
            {isLoading ? '저장 중...' : '다음 단계'}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
