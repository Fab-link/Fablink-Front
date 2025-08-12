"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ClipboardList, Package, Truck } from "lucide-react"
import Link from "next/link"

export default function FactoryOrdersPage() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderId: "ORD-20240801-001",
      productName: "여성용 캐주얼 블라우스",
      designer: "김디자이너",
      quantity: 500,
      status: "in_production",
      progress: 65,
      dueDate: "2024-08-15"
    },
    {
      id: 2,
      orderId: "ORD-20240802-002", 
      productName: "남성용 정장 셔츠",
      designer: "박디자이너",
      quantity: 300,
      status: "confirmed",
      progress: 0,
      dueDate: "2024-08-20"
    }
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">주문 확인</Badge>
      case 'in_production':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">생산 중</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">생산 완료</Badge>
      case 'shipped':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">배송 중</Badge>
      default:
        return <Badge variant="secondary">알 수 없음</Badge>
    }
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
            <ClipboardList className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
          </div>
          <p className="text-gray-600 mt-2">진행 중인 주문의 상태를 관리하고 업데이트하세요</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{order.productName}</span>
                      {getStatusBadge(order.status)}
                    </CardTitle>
                    <CardDescription>
                      주문번호: {order.orderId} • 디자이너: {order.designer}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>수량: {order.quantity}개</div>
                    <div>납기일: {order.dueDate}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.status === 'in_production' && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>생산 진행률</span>
                        <span>{order.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>생산 관리</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Truck className="h-4 w-4" />
                        <span>배송 준비</span>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Button size="sm">
                        진행 상황 업데이트
                      </Button>
                      <Button variant="outline" size="sm">
                        상세 보기
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>진행 중인 주문이 없습니다.</p>
                <p className="text-sm">새로운 주문이 들어오면 여기에 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}