"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Upload, X, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ManufacturingStep2() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [pointDescription, setPointDescription] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store form data
    const existingData = JSON.parse(localStorage.getItem("manufacturingData") || "{}")
    localStorage.setItem(
      "manufacturingData",
      JSON.stringify({
        ...existingData,
        step2: { files: uploadedFiles.length, pointDescription },
      }),
    )
    router.push("/manufacturing/ai-analysis")
  }

  const handleBack = () => {
    router.push("/manufacturing")
  }

  const isFormValid = uploadedFiles.length > 0 && pointDescription.trim()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">단계 2/6</span>
            <span className="text-sm text-gray-500">디자인 파일 업로드</span>
          </div>
          <Progress value={33.33} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">디자인 파일 업로드</h1>
          <p className="text-gray-600">스케치나 디자인 파일을 업로드하고 포인트 부위를 설명해주세요</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>디자인 파일 업로드</CardTitle>
              <CardDescription>
                스케치, 디자인 도면, 참고 이미지 등을 업로드해주세요 (JPG, PNG, PDF 지원)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">파일을 드래그하거나 클릭하여 업로드</p>
                  <p className="text-sm text-gray-500">최대 10MB, JPG, PNG, PDF 파일 지원</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>업로드된 파일</Label>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Point Description Section */}
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
                  placeholder="예: 소매 부분의 주름 디테일, 목선의 V넥 각도, 허리 라인의 다트 위치, 단추 배치 등 중요한 디자인 포인트를 상세히 설명해주세요"
                  value={pointDescription}
                  onChange={(e) => setPointDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전 단계
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid}>
              다음 단계
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
