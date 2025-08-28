"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Upload, X, ImageIcon, Shirt, Download } from "lucide-react"
import { useRouter } from "next/navigation"

// 이 단계에서는 서버 통신 없이 localStorage만 갱신합니다.
import { useManufacturingContext } from "@/contexts/ManufacturingContext"

export default function ManufacturingStep2() {
  const router = useRouter()
  const { setDesignFiles } = useManufacturingContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [pointDescription, setPointDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // 디자인 미리보기/생성 상태
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [genProgress, setGenProgress] = useState<number>(0)

  // isGenerating 동안 진행률을 유사-무한대로 보여주기 위한 타이머
  useEffect(() => {
    if (!isGenerating) return
    setGenProgress(10)
    const id = setInterval(() => {
      setGenProgress((p) => {
        const next = p + Math.floor(8 + Math.random() * 12) // 8~20 증가
        return Math.min(next, 90) // 90%에서 대기
      })
    }, 500)
    return () => clearInterval(id)
  }, [isGenerating])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files && e.target.files[0]) || null
    if (!file) return

    // 단일 파일만 유지
    setUploadedFiles([file])
    // 컨텍스트에 최신 파일 목록을 저장하여 Step8에서 사용
    setDesignFiles([file])

    // 미리보기 이미지 설정 및 이전 생성 이미지 초기화
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreviewImage(ev.target?.result as string)
      setGeneratedImageUrl(null)
    }
    reader.readAsDataURL(file)

    // 동일 파일 재업로드 트리거를 위해 값 초기화
    e.currentTarget.value = ""
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    if (index === 0) {
      setPreviewImage(null)
      setGeneratedImageUrl(null)
    }
  }

  // 이미지 생성 API 호출
  const GEN_SKETCH_URL =
    process.env.NEXT_PUBLIC_GEN_SKETCH_URL ||
    "https://6ydwjfj2xb.execute-api.ap-northeast-2.amazonaws.com/Fablink-dev/gen-sketch"

  const handleGenerateImage = async () => {
    if (!previewImage || !pointDescription.trim()) {
      setErrorMessage("스케치 이미지와 포인트 부위 설명을 입력해주세요.")
      return
    }
    if (!previewImage.startsWith("data:image/")) {
      setErrorMessage("이미지 파일(png/jpg/jpeg)을 업로드해주세요. PDF는 지원되지 않습니다.")
      return
    }
    setErrorMessage(null)
    // 재생성 체감 향상을 위해 이전 생성 이미지를 먼저 비웁니다.
    setGeneratedImageUrl(null)
    setIsGenerating(true)
    try {
      const res = await fetch(GEN_SKETCH_URL, {
        method: "POST",
        cache: "no-store", // 브라우저/중간 캐시 방지
        headers: {
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        body: JSON.stringify({
          prompt: pointDescription,
          image: { base64: previewImage },
          output: { format: "png", filename: "result.png" },
        }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        throw new Error(`이미지 생성 실패 (${res.status}) ${errText}`)
      }

      const blob = await res.blob()
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(String(reader.result))
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      setGeneratedImageUrl(dataUrl)
  // 완료 직전 진행률 100%로 채우기
  setGenProgress(100)

      // 즉시 로컬 스토리지에도 저장하여 이후 단계 재사용
      const manufacturingData = JSON.parse(localStorage.getItem("manufacturingData") || "{}")
      localStorage.setItem(
        "manufacturingData",
        JSON.stringify({
          ...manufacturingData,
          compositeImageUrl: dataUrl,
        })
      )
    } catch (err) {
      console.error(err)
      setErrorMessage(
        err instanceof Error ? err.message : "이미지 생성 중 오류가 발생했습니다."
      )
    } finally {
      setIsGenerating(false)
      // 다음 실행을 위해 진행률 리셋
      setGenProgress(0)
    }
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

      console.log('Saving step2 to localStorage:', {
        detail: pointDescription,
        hasImage: uploadedFiles.length > 0,
        fileName: uploadedFiles[0]?.name
      })

      const updatedData = {
        ...manufacturingData,
        detail: pointDescription,
        step2: {
          pointDescription,
          files: uploadedFiles.length,
          fileNames: uploadedFiles.map(f => f.name),
        },
        // 생성 이미지 우선 저장, 없으면 기존/미리보기 사용
        compositeImageUrl: (generatedImageUrl || manufacturingData.compositeImageUrl || previewImage || null),
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

  // 생성된 이미지 다운로드
  const handleDownloadGenerated = () => {
    if (!generatedImageUrl) return
    const isJpeg = generatedImageUrl.includes("image/jpeg") || generatedImageUrl.includes("image/jpg")
    const ext = isJpeg ? "jpg" : "png"
    const a = document.createElement("a")
    a.href = generatedImageUrl
    a.download = `generated.${ext}`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const isFormValid = pointDescription.trim() // 이미지/옵션은 선택사항

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Logo */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors"
          >
            <img src="/FabLink_logo.png" alt="FabLink" className="h-14 w-auto" />
            <span className="text-2xl font-bold sr-only">FabLink</span>
          </button>
        </div>
        
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

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <p className="text-xs text-gray-500">jpg, jpeg, png 지원</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
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

          {/* 제거: 의류 종류 & 디자인 요소 */}
        </div>

        {/* 디자인 미리보기 (전체 폭 사용) */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">디자인 미리보기</CardTitle>
              <CardDescription>선택한 옵션에 따른 디자인 미리보기</CardDescription>
              {isGenerating && (
                <div className="mt-3">
                  <Progress value={genProgress} className="h-2" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-100 rounded-lg p-6 min-h-[350px] flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* 로딩 오버레이 */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg p-6">
                      <div className="flex flex-col items-center w-full max-w-sm">
                        <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                      </div>
                    </div>
                  )}

                  {generatedImageUrl ? (
                    <img
                      src={generatedImageUrl}
                      alt="생성된 이미지"
                      className="max-h-[420px] w-auto rounded-md shadow"
                    />
                  ) : previewImage ? (
                    <img
                      src={previewImage}
                      alt="업로드 미리보기"
                      className="max-h-[420px] w-auto rounded-md shadow opacity-95"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Shirt className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                      <p className="text-base">스케치 이미지를 업로드하고</p>
                      <p className="text-sm">이미지 생성을 눌러주세요</p>
                    </div>
                  )}
                </div>
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
          <Button variant="outline" onClick={handleBack} disabled={isLoading || isGenerating}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            이전 단계
          </Button>
          <div className="flex items-center gap-2">
            {generatedImageUrl && (
              <Button
                variant="outline"
                onClick={handleDownloadGenerated}
                disabled={isGenerating}
                title="생성된 이미지 다운로드"
              >
                <Download className="mr-2 h-4 w-4" /> 다운로드
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleGenerateImage}
              disabled={isGenerating || !previewImage || !pointDescription.trim()}
            >
              {isGenerating ? "이미지 생성 중..." : "이미지 생성"}
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid || isLoading || isGenerating}>
              {isLoading ? '저장 중...' : '다음 단계'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
