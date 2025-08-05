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
import { ArrowLeft, ArrowRight, MessageCircle, Check, FactoryIcon as Fabric, Package, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { manufacturingApi } from "@/lib/api/manufacturing"
import { debugLog } from "@/lib/config"

export default function ManufacturingStep4() {
  const router = useRouter()
  const [fabricCode, setFabricCode] = useState("")
  const [accessoryCode, setAccessoryCode] = useState("")
  const [showFabricChat, setShowFabricChat] = useState(false)
  const [showAccessoryChat, setShowAccessoryChat] = useState(false)
  const [fabricSelected, setFabricSelected] = useState(false)
  const [accessorySelected, setAccessorySelected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // AI 채팅 상태
  const [fabricChatInput, setFabricChatInput] = useState("")
  const [accessoryChatInput, setAccessoryChatInput] = useState("")
  const [fabricChatMessages, setFabricChatMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([])
  const [accessoryChatMessages, setAccessoryChatMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([])
  const [isChatLoading, setIsChatLoading] = useState(false)

  // AI 추천 원단/부자재 목록
  const [recommendedFabrics, setRecommendedFabrics] = useState<Array<{name: string, description: string}>>([])
  const [recommendedMaterials, setRecommendedMaterials] = useState<Array<{name: string, description: string}>>([])

  const handleSubmit = async (e: React.FormEvent) => {
    debugLog('handleSubmit 함수 시작');
    e.preventDefault()
    debugLog('handleSubmit 호출됨');
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const manufacturingData = JSON.parse(localStorage.getItem("manufacturingData") || "{}")
      const productId = manufacturingData.productId
      debugLog('productId:', productId);

      if (!productId) {
        setErrorMessage("제품 ID를 찾을 수 없습니다. 이전 단계로 돌아가 다시 시도해주세요.")
        setIsLoading(false)
        debugLog('제품 ID 없음, API 호출 중단');
        return
      }

      const selectedFabric = recommendedFabrics.find(f => f.name === fabricCode);
      const selectedMaterial = recommendedMaterials.find(a => a.name === accessoryCode);
      debugLog('선택된 원단/부자재:', { selectedFabric, selectedMaterial });

      const productDataToUpdate = {
        fabric: fabricCode ? (selectedFabric ? JSON.stringify(selectedFabric) : JSON.stringify({ name: fabricCode })) : null,
        material: accessoryCode ? (selectedMaterial ? JSON.stringify(selectedMaterial) : JSON.stringify({ name: accessoryCode })) : null,
      };
      debugLog('업데이트할 제품 데이터:', productDataToUpdate);

      await manufacturingApi.updateProductJson(productId, productDataToUpdate);
      debugLog('API 호출 성공');

      localStorage.setItem(
        "manufacturingData",
        JSON.stringify({
          ...manufacturingData,
          step4: { fabricCode, accessoryCode },
        }),
      )
      router.push("/manufacturing/quantity-schedule")
    } catch (error) {
      console.error("Error updating product with fabric/material:", error);
      setErrorMessage("재료 정보 저장 중 오류가 발생했습니다.")
      debugLog('API 호출 실패:', error);
    } finally {
      setIsLoading(false)
      debugLog('handleSubmit 종료');
    }
  }

  const handleBack = () => {
    router.push("/manufacturing/ai-analysis")
  }

  const selectFabric = (name: string) => {
    debugLog('selectFabric 호출됨, name:', name);
    setFabricCode(name)
    setFabricSelected(true)
    setShowFabricChat(false)
  }

  const selectAccessory = (name: string) => {
    debugLog('selectAccessory 호출됨, name:', name);
    setAccessoryCode(name)
    setAccessorySelected(true)
    setShowAccessoryChat(false)
  }

  // AI 채팅 API 호출
  const sendChatMessage = async (message: string, type: 'fabric' | 'accessory') => {
    setIsChatLoading(true)
    
    try {
      const apiUrl = type === 'fabric' 
        ? 'https://rfj38wl5qj.execute-api.ap-northeast-2.amazonaws.com/Fablink-dev/fabric-chat'
        : 'https://rfj38wl5qj.execute-api.ap-northeast-2.amazonaws.com/Fablink-dev/material-chat'
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message
        })
      })
      
      if (!response.ok) {
        throw new Error('API 호출 실패')
      }
      
      const data = await response.json()
      
      if (type === 'fabric') {
        // 원단 추천 목록 업데이트
        if (data.fabrics && Array.isArray(data.fabrics)) {
          setRecommendedFabrics(data.fabrics)
        }
        
        setFabricChatMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'ai', content: data.rawText || '원단 추천을 완료했습니다.' }
        ])
        setFabricChatInput('')
      } else {
        // 부자재 추천 목록 업데이트 (다양한 키 구조 처리)
        const materials = data.materials || data.accessories || data.items || data.components
        console.log('부자재 API 응답:', data)
        console.log('추출된 materials:', materials)
        if (materials && Array.isArray(materials)) {
          setRecommendedMaterials(materials)
        } else {
          console.log('부자재 데이터를 찾을 수 없습니다. 전체 응답:', data)
        }
        
        setAccessoryChatMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'ai', content: data.rawText || '부자재 추천을 완료했습니다.' }
        ])
        setAccessoryChatInput('')
      }
    } catch (error) {
      console.error('채팅 API 오류:', error)
      let errorMsg = 'AI 상담 중 오류가 발생했습니다. 다시 시도해주세요.'
      
      // API 에러 메시지 처리
      if (error instanceof Error) {
        if (error.message.includes('not authorized')) {
          errorMsg = '죄송합니다. 현재 AI 서비스에 접근 권한이 없습니다. 관리자에게 문의해주세요.'
        }
      }
      
      if (type === 'fabric') {
        setFabricChatMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'ai', content: errorMsg }
        ])
        setFabricChatInput('')
      } else {
        setAccessoryChatMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'ai', content: errorMsg }
        ])
        setAccessoryChatInput('')
      }
    } finally {
      setIsChatLoading(false)
    }
  }

  const isFormValid = fabricSelected && accessorySelected
  debugLog('isFormValid:', isFormValid);

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
                            {/* 채팅 메시지 영역 */}
                            <div className="max-h-60 overflow-y-auto space-y-3">
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
                              
                              {fabricChatMessages.map((msg, index) => (
                                <div key={index} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    msg.role === 'user' ? 'bg-gray-600' : 'bg-blue-600'
                                  }`}>
                                    <MessageCircle className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm ${
                                      msg.role === 'user' ? 'text-gray-900 bg-gray-100 p-2 rounded' : 'text-blue-900'
                                    }`}>
                                      {msg.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* 입력 영역 */}
                            <div className="flex space-x-2">
                              <Input 
                                placeholder="원단에 대한 질문을 입력하세요..."
                                value={fabricChatInput}
                                onChange={(e) => setFabricChatInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && fabricChatInput.trim() && !isChatLoading) {
                                    sendChatMessage(fabricChatInput.trim(), 'fabric')
                                  }
                                }}
                                disabled={isChatLoading}
                              />
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  if (fabricChatInput.trim() && !isChatLoading) {
                                    sendChatMessage(fabricChatInput.trim(), 'fabric')
                                  }
                                }}
                                disabled={!fabricChatInput.trim() || isChatLoading}
                              >
                                {isChatLoading ? '...' : <Send className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2">
                      {recommendedFabrics.length > 0 ? recommendedFabrics.map((fabric, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            fabricCode === fabric.name
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => selectFabric(fabric.name)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{fabric.name}</span>
                              <p className="text-sm text-gray-600 mt-1">
                                {fabric.description}
                              </p>
                            </div>
                            {fabricCode === fabric.name && <Check className="h-5 w-5 text-blue-600" />}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">AI 상담을 통해 원단을 추천받아보세요</p>
                        </div>
                      )}
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
                            {/* 채팅 메시지 영역 */}
                            <div className="max-h-60 overflow-y-auto space-y-3">
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
                              
                              {accessoryChatMessages.map((msg, index) => (
                                <div key={index} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    msg.role === 'user' ? 'bg-gray-600' : 'bg-blue-600'
                                  }`}>
                                    <MessageCircle className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm ${
                                      msg.role === 'user' ? 'text-gray-900 bg-gray-100 p-2 rounded' : 'text-blue-900'
                                    }`}>
                                      {msg.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* 입력 영역 */}
                            <div className="flex space-x-2">
                              <Input 
                                placeholder="부자재에 대한 질문을 입력하세요..."
                                value={accessoryChatInput}
                                onChange={(e) => setAccessoryChatInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && accessoryChatInput.trim() && !isChatLoading) {
                                    sendChatMessage(accessoryChatInput.trim(), 'accessory')
                                  }
                                }}
                                disabled={isChatLoading}
                              />
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  if (accessoryChatInput.trim() && !isChatLoading) {
                                    sendChatMessage(accessoryChatInput.trim(), 'accessory')
                                  }
                                }}
                                disabled={!accessoryChatInput.trim() || isChatLoading}
                              >
                                {isChatLoading ? '...' : <Send className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2">
                      {recommendedMaterials.length > 0 ? recommendedMaterials.map((accessory, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            accessoryCode === accessory.name
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => selectAccessory(accessory.name)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{accessory.name}</span>
                              <p className="text-sm text-gray-600 mt-1">
                                {accessory.description}
                              </p>
                            </div>
                            {accessoryCode === accessory.name && <Check className="h-5 w-5 text-blue-600" />}
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">AI 상담을 통해 부자재를 추천받아보세요</p>
                        </div>
                      )}
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
