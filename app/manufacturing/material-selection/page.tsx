"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, MessageCircle, Check, FactoryIcon as Fabric, Package } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ManufacturingStep4() {
  const router = useRouter()
  const [fabricCode, setFabricCode] = useState("")
  const [accessoryCode, setAccessoryCode] = useState("")
  const [showFabricChat, setShowFabricChat] = useState(false)
  const [showAccessoryChat, setShowAccessoryChat] = useState(false)
  const [fabricSelected, setFabricSelected] = useState(false)
  const [accessorySelected, setAccessorySelected] = useState(false)

  // AI 추천 원단 목록
  const recommendedFabrics = [
    { code: "FB001", name: "코튼 트윌", composition: "면 100%", weight: "280g/m²", color: "네이비" },
    { code: "FB002", name: "폴리 크레이프", composition: "폴리에스터 100%", weight: "150g/m²", color: "화이트" },
    { code: "FB003", name: "린넨 블렌드", composition: "린넨 60%, 면 40%", weight: "200g/m²", color: "베이지" },
  ]

  // AI 추천 부자재 목록
  const recommendedAccessories = [
    { code: "AC001", name: "플라스틱 단추", size: "15mm", color: "화이트", quantity: "10개" },
    { code: "AC002", name: "지퍼", length: "20cm", type: "은닉지퍼", color: "네이비" },
    { code: "AC003", name: "바이어스 테이프", width: "12mm", color: "네이비", length: "2m" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const existingData = JSON.parse(localStorage.getItem("manufacturingData") || "{}")
    localStorage.setItem(
      "manufacturingData",
      JSON.stringify({
        ...existingData,
        step4: { fabricCode, accessoryCode },
      }),
    )
    router.push("/manufacturing/quantity-schedule")
  }

  const handleBack = () => {
    router.push("/manufacturing/ai-analysis")
  }

  const selectFabric = (code: string) => {
    setFabricCode(code)
    setFabricSelected(true)
    setShowFabricChat(false)
  }

  const selectAccessory = (code: string) => {
    setAccessoryCode(code)
    setAccessorySelected(true)
    setShowAccessoryChat(false)
  }

  const isFormValid = fabricSelected && accessorySelected

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">단계 4/6</span>
            <span className="text-sm text-gray-500">재료 선택</span>
          </div>
          <Progress value={66.67} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">재료 선택</h1>
          <p className="text-gray-600">AI가 추천한 원단과 부자재를 선택하거나 직접 입력해주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 원단 선택 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Fabric className="h-5 w-5" />
                <span>원단 선택</span>
                {fabricSelected && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    선택 완료
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>제품에 적합한 원단을 선택해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="direct" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="direct">직접 입력</TabsTrigger>
                  <TabsTrigger value="ai">AI 추천</TabsTrigger>
                </TabsList>

                <TabsContent value="direct" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fabricCode">원단 코드</Label>
                    <Input
                      id="fabricCode"
                      placeholder="원단 코드를 입력하세요 (예: FB001)"
                      value={fabricCode}
                      onChange={(e) => {
                        setFabricCode(e.target.value)
                        setFabricSelected(!!e.target.value)
                      }}
                    />
                  </div>
                  {fabricCode && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">원단 코드: {fabricCode}</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI 추천 원단</span>
                      <Button variant="outline" size="sm" onClick={() => setShowFabricChat(!showFabricChat)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        AI 상담
                      </Button>
                    </div>

                    {showFabricChat && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <MessageCircle className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-blue-900">
                                  안녕하세요! 원단 선택을 도와드리겠습니다. 어떤 특성의 원단을 찾고 계신가요?
                                </p>
                              </div>
                            </div>
                            <Input placeholder="원단에 대한 질문을 입력하세요..." />
                            <Button size="sm" className="w-full">
                              질문하기
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2">
                      {recommendedFabrics.map((fabric) => (
                        <div
                          key={fabric.code}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            fabricCode === fabric.code
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => selectFabric(fabric.code)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{fabric.name}</span>
                                <Badge variant="outline">{fabric.code}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {fabric.composition} • {fabric.weight}
                              </p>
                            </div>
                            {fabricCode === fabric.code && <Check className="h-5 w-5 text-blue-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 부자재 선택 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>부자재 선택</span>
                {accessorySelected && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    선택 완료
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>제품에 필요한 부자재를 선택해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="direct" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="direct">직접 입력</TabsTrigger>
                  <TabsTrigger value="ai">AI 추천</TabsTrigger>
                </TabsList>

                <TabsContent value="direct" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessoryCode">부자재 상품 코드</Label>
                    <Input
                      id="accessoryCode"
                      placeholder="부자재 상품 코드를 입력하세요 (예: AC001)"
                      value={accessoryCode}
                      onChange={(e) => {
                        setAccessoryCode(e.target.value)
                        setAccessorySelected(!!e.target.value)
                      }}
                    />
                  </div>
                  {accessoryCode && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">부자재 코드: {accessoryCode}</span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI 추천 부자재</span>
                      <Button variant="outline" size="sm" onClick={() => setShowAccessoryChat(!showAccessoryChat)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        AI 상담
                      </Button>
                    </div>

                    {showAccessoryChat && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <MessageCircle className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-blue-900">
                                  부자재 선택을 도와드리겠습니다. 어떤 부자재가 필요하신지 알려주세요.
                                </p>
                              </div>
                            </div>
                            <Input placeholder="부자재에 대한 질문을 입력하세요..." />
                            <Button size="sm" className="w-full">
                              질문하기
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2">
                      {recommendedAccessories.map((accessory) => (
                        <div
                          key={accessory.code}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            accessoryCode === accessory.code
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => selectAccessory(accessory.code)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{accessory.name}</span>
                                <Badge variant="outline">{accessory.code}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {accessory.size && `${accessory.size} • `}
                                {accessory.length && `${accessory.length} • `}
                                {accessory.color}
                              </p>
                            </div>
                            {accessoryCode === accessory.code && <Check className="h-5 w-5 text-blue-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-8">
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
  )
}
