"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Truck,
  MessageSquare,
  Factory,
  FileText,
  Phone,
  MapPin,
  AwardIcon as Won,
  Eye,
  Edit,
  Check,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// 샘플 주문 데이터
const sampleOrders = [
  {
    id: "MFG-12345678",
    productName: "여성용 캐주얼 블라우스",
    quantity: 500,
    status: "sample_production",
    createdAt: "2024-01-15",
    currentStep: 2,
    steps: [
      { id: 1, name: "샘플 제작 업체 선정", status: "done", completedAt: "2024-01-16" },
      { id: 2, name: "샘플 생산 현황", status: "active", completedAt: null },
      { id: 3, name: "샘플 생산 배송 조회", status: "pending", completedAt: null },
      { id: 4, name: "샘플 피드백", status: "pending", completedAt: null },
      { id: 5, name: "본 생산 업체 선정", status: "pending", completedAt: null },
      { id: 6, name: "본 생산 현황", status: "pending", completedAt: null },
      { id: 7, name: "본 생산 배송 조회", status: "pending", completedAt: null },
    ],
  },
  {
    id: "MFG-87654321",
    productName: "남성용 정장 셔츠",
    quantity: 300,
    status: "sample_feedback",
    createdAt: "2024-01-10",
    currentStep: 4,
    steps: [
      { id: 1, name: "샘플 제작 업체 선정", status: "done", completedAt: "2024-01-11" },
      { id: 2, name: "샘플 생산 현황", status: "done", completedAt: "2024-01-18" },
      { id: 3, name: "샘플 생산 배송 조회", status: "done", completedAt: "2024-01-20" },
      { id: 4, name: "샘플 피드백", status: "active", completedAt: null },
      { id: 5, name: "본 생산 업체 선정", status: "pending", completedAt: null },
      { id: 6, name: "본 생산 현황", status: "pending", completedAt: null },
      { id: 7, name: "본 생산 배송 조회", status: "pending", completedAt: null },
    ],
  },
]

// 샘플 업체 데이터
const sampleFactories = [
  {
    id: 1,
    name: "프리미엄 샘플 공방",
    contact: "02-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    estimatedTime: "3-5일",
    price: 150000,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "스피드 샘플 제작소",
    contact: "02-8765-4321",
    address: "서울시 마포구 홍대로 456",
    estimatedTime: "2-3일",
    price: 180000,
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function OrdersPage() {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("userInfo")
    if (userData) {
      setUserInfo(JSON.parse(userData))
    } else {
      router.push("/login")
    }
  }, [router])

  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1:
        return Factory
      case 2:
        return Package
      case 3:
        return Truck
      case 4:
        return MessageSquare
      case 5:
        return Factory
      case 6:
        return Package
      case 7:
        return Truck
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-600"
      case "active":
        return "bg-blue-600"
      case "pending":
        return "bg-gray-300"
      default:
        return "bg-gray-300"
    }
  }

  const renderStepDetail = (order: any, stepId: number) => {
    switch (stepId) {
      case 1: // 샘플 제작 업체 선정
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>샘플 제작 업체 목록</CardTitle>
              <CardDescription>주문 코드: {order.id}</CardDescription>
            </CardHeader>
            <CardContent>
              {sampleFactories.length > 0 ? (
                <div className="space-y-4">
                  {sampleFactories.map((factory) => (
                    <div
                      key={factory.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <img
                        src={factory.image || "/placeholder.svg"}
                        alt={factory.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{factory.name}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3" />
                            <span>{factory.contact}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{factory.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                          <Clock className="h-3 w-3" />
                          <span>{factory.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-2 font-medium">
                          <Won className="h-4 w-4" />
                          <span>{factory.price.toLocaleString()}원</span>
                        </div>
                      </div>
                      <Button size="sm">업체 선정</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>현재 입찰 가능한 업체가 없습니다.</p>
                  <p className="text-sm">업체가 작업지시서를 확인 후 입찰하면 목록에 표시됩니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 2: // 샘플 생산 현황
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>샘플 생산 현황</CardTitle>
              <CardDescription>
                <div className="flex justify-between items-center">
                  <span>주문 코드: {order.id}</span>
                  <span>업체명: 프리미엄 샘플 공방</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">주문 정보</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">주문 날짜:</span>
                      <span>{order.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">연락처:</span>
                      <span>02-1234-5678</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">생산 공정</h4>
                  <div className="space-y-3">
                    {[
                      { name: "1차 가봉", status: "done", date: "2024-01-17" },
                      { name: "부자재 부착", status: "done", date: "2024-01-18" },
                      { name: "마킹 및 재단", status: "active", date: null },
                      { name: "봉제", status: "pending", date: null },
                      { name: "검사 및 다림질", status: "pending", date: null },
                      { name: "배송", status: "pending", date: null },
                    ].map((process, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(process.status)}`} />
                        <span className="flex-1 text-sm">{process.name}</span>
                        {process.status === "done" && process.date && (
                          <span className="text-xs text-gray-500">{process.date}</span>
                        )}
                        {process.status === "active" && <Badge variant="secondary">진행중</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 4: // 샘플 피드백
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>샘플 피드백</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <img
                        src="/placeholder.svg?height=150&width=150"
                        alt="샘플 사진"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">1차 생산</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3" />
                          <span>02-1234-5678</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>서울시 강남구 테헤란로 123</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">피드백 상태:</span>
                        <Badge variant="outline">배송 완료</Badge>
                      </div>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <Edit className="h-3 w-3 mr-1" />
                          작업 지시서 수정
                        </Button>
                        <Button size="sm" className="w-full">
                          <Check className="h-3 w-3 mr-1" />
                          작업 지시서 확정
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>이 단계는 아직 진행되지 않았습니다.</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  대시보드
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">주문 내역 조회</h1>
            </div>
            <span className="text-sm text-gray-600">
              {userInfo.userType === "designer" ? "디자이너" : "공장"}: {userInfo.id}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>주문 목록</CardTitle>
                <CardDescription>진행 중인 주문을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedOrder?.id === order.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedOrder(order)
                        setSelectedStep(null)
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{order.productName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {order.quantity}개
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{order.id}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{order.createdAt}</span>
                        <Progress value={(order.currentStep / 7) * 100} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Detail */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="space-y-6">
                {/* Order Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedOrder.productName}</CardTitle>
                    <CardDescription>주문 코드: {selectedOrder.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">수량:</span>
                        <p className="font-medium">{selectedOrder.quantity}개</p>
                      </div>
                      <div>
                        <span className="text-gray-600">주문일:</span>
                        <p className="font-medium">{selectedOrder.createdAt}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">진행률:</span>
                        <p className="font-medium">{selectedOrder.currentStep}/7 단계</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Process Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle>제작 공정</CardTitle>
                    <CardDescription>각 단계를 클릭하여 상세 정보를 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.steps.map((step: any, index: number) => {
                        const Icon = getStepIcon(step.id)
                        const isClickable = step.status !== "pending"

                        return (
                          <div key={step.id}>
                            <div
                              className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                                isClickable ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed opacity-60"
                              } ${selectedStep === step.id ? "bg-blue-50 border border-blue-200" : ""}`}
                              onClick={() => isClickable && setSelectedStep(selectedStep === step.id ? null : step.id)}
                            >
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}
                              >
                                {step.status === "done" ? (
                                  <CheckCircle className="h-5 w-5 text-white" />
                                ) : (
                                  <Icon className="h-5 w-5 text-white" />
                                )}
                              </div>

                              <div className="flex-1">
                                <h4 className="font-medium">{step.name}</h4>
                                {step.completedAt && (
                                  <p className="text-sm text-gray-600">완료일: {step.completedAt}</p>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                {step.status === "active" && <Badge variant="secondary">진행중</Badge>}
                                {step.status === "done" && <Badge className="bg-green-600">완료</Badge>}
                                {step.status === "pending" && <Badge variant="outline">대기</Badge>}
                                {isClickable && <Eye className="h-4 w-4 text-gray-400" />}
                              </div>
                            </div>

                            {/* Step Detail */}
                            {selectedStep === step.id && renderStepDetail(selectedOrder, step.id)}

                            {/* Connector Line */}
                            {index < selectedOrder.steps.length - 1 && <div className="ml-5 w-0.5 h-4 bg-gray-200" />}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">주문을 선택하세요</h3>
                    <p>왼쪽 목록에서 주문을 선택하면 상세 정보를 확인할 수 있습니다.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
