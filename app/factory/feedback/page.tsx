"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare, Star, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function FactoryFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      orderId: "ORD-20240801-001",
      productName: "여성용 캐주얼 블라우스",
      designer: "김디자이너",
      rating: 4,
      status: "pending",
      feedbackDate: "2024-08-10",
      category: "quality",
      message: "전체적으로 만족스럽지만, 봉제선이 일부 고르지 않은 부분이 있습니다. 다음 생산 시 개선 부탁드립니다.",
      images: ["feedback1.jpg", "feedback2.jpg"]
    },
    {
      id: 2,
      orderId: "ORD-20240802-002",
      productName: "남성용 정장 셔츠",
      designer: "박디자이너",
      rating: 5,
      status: "responded",
      feedbackDate: "2024-08-12",
      category: "delivery",
      message: "예정보다 빠른 배송과 완벽한 품질에 매우 만족합니다. 앞으로도 계속 협업하고 싶습니다.",
      response: "소중한 피드백 감사합니다. 앞으로도 더 나은 품질과 서비스로 보답하겠습니다.",
      responseDate: "2024-08-12"
    },
    {
      id: 3,
      orderId: "ORD-20240803-003",
      productName: "아동용 원피스",
      designer: "이디자이너",
      rating: 3,
      status: "pending",
      feedbackDate: "2024-08-13",
      category: "issue",
      message: "사이즈가 주문한 것과 다르게 제작된 것 같습니다. 확인 후 조치 부탁드립니다.",
      urgent: true
    }
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">응답 대기</Badge>
      case 'responded':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">응답 완료</Badge>
      case 'resolved':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">해결 완료</Badge>
      default:
        return <Badge variant="secondary">알 수 없음</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'quality':
        return <Badge variant="outline" className="text-blue-600">품질</Badge>
      case 'delivery':
        return <Badge variant="outline" className="text-green-600">배송</Badge>
      case 'issue':
        return <Badge variant="outline" className="text-red-600">문제</Badge>
      default:
        return <Badge variant="outline">기타</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">피드백 관리</h1>
          </div>
          <p className="text-gray-600 mt-2">고객 피드백을 확인하고 응답하여 서비스 품질을 개선하세요</p>
        </div>

        {/* Feedback List */}
        <div className="space-y-6">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className={`hover:shadow-lg transition-shadow ${feedback.urgent ? 'border-red-200 bg-red-50' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{feedback.productName}</span>
                      {getStatusBadge(feedback.status)}
                      {getCategoryBadge(feedback.category)}
                      {feedback.urgent && (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          긴급
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      주문번호: {feedback.orderId} • 디자이너: {feedback.designer}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {renderStars(feedback.rating)}
                      <span className="text-sm text-gray-500 ml-2">{feedback.rating}/5</span>
                    </div>
                    <div className="text-sm text-gray-500">{feedback.feedbackDate}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">피드백 내용</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{feedback.message}</p>
                  </div>

                  {feedback.images && feedback.images.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">첨부 이미지</h4>
                      <div className="flex space-x-2">
                        {feedback.images.map((image, index) => (
                          <div key={index} className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                            이미지 {index + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {feedback.status === 'responded' && feedback.response && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-green-900">응답 완료</h4>
                        <span className="text-sm text-green-700">({feedback.responseDate})</span>
                      </div>
                      <p className="text-green-800">{feedback.response}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      피드백 일시: {feedback.feedbackDate}
                    </div>
                    <div className="space-x-2">
                      {feedback.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            응답 작성
                          </Button>
                          <Button variant="outline" size="sm">
                            상세 보기
                          </Button>
                        </>
                      )}
                      {feedback.status === 'responded' && (
                        <>
                          <Button variant="outline" size="sm">
                            응답 수정
                          </Button>
                          <Button size="sm" variant="secondary">
                            해결 완료 처리
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {feedbacks.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>받은 피드백이 없습니다.</p>
                <p className="text-sm">고객 피드백이 들어오면 여기에 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}