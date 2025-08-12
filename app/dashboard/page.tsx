"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Shirt, Menu, Plus, FileText, User, LogOut, Calculator, ClipboardList, MessageSquare, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthContext } from "@/contexts/AuthContext"
import { debugLog } from "@/lib/config"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuthContext()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    debugLog('대시보드 페이지 마운트:', { isAuthenticated, user, isLoading });
    
    if (!isLoading) {
      if (isAuthenticated && user) {
        debugLog('받은 사용자 데이터:', user);
        
        const newUserInfo = {
          id: user.userId || user.user_id || user.id,
          name: user.name,
          userType: user.userType || user.user_type,
          loginTime: new Date().toISOString()
        };
        debugLog('설정할 사용자 정보:', newUserInfo);
        setUserInfo(newUserInfo);
      } else {
        debugLog('인증되지 않음, 로그인 페이지로 리디렉션');
        router.replace("/login");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  const handleLogout = async () => {
    debugLog('로그아웃 시도');
    await logout()
    debugLog('로그아웃 완료, 메인 페이지로 리디렉션');
    router.push("/")
  }

  // 인증되지 않은 경우 로딩 화면 표시 안함
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }
  
  // 인증되지 않았거나 사용자 정보가 없으면 null 반환 (리디렉션 중)
  if (!isAuthenticated || !user || !userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>{userInfo.userType === "designer" ? "디자이너" : "공장"} 메뉴</span>
                    </SheetTitle>
                    <SheetDescription>{userInfo.name || userInfo.id}님, 안녕하세요!</SheetDescription>
                  </SheetHeader>

                  <div className="mt-8 space-y-4">
                    {userInfo.userType === "designer" && (
                      <>
                        <Link href="/manufacturing" onClick={() => setIsSheetOpen(false)}>
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            <Plus className="mr-2 h-4 w-4" />
                            제작 시작하기
                          </Button>
                        </Link>

                        <Link href="/designer/orders" onClick={() => setIsSheetOpen(false)}>
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            <FileText className="mr-2 h-4 w-4" />
                            주문 내역 조회
                          </Button>
                        </Link>
                      </>
                    )}

                    {userInfo.userType === "factory" && (
                      <>
                        <Link href="/factory/quotes" onClick={() => setIsSheetOpen(false)}>
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            <Calculator className="mr-2 h-4 w-4" />
                            요청된 견적 확인
                          </Button>
                        </Link>

                        <Link href="/factory/orders" onClick={() => setIsSheetOpen(false)}>
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            주문 관리
                          </Button>
                        </Link>

                        <Link href="/factory/feedback" onClick={() => setIsSheetOpen(false)}>
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            피드백 관리
                          </Button>
                        </Link>

                        <Link href="/factory/settlement" onClick={() => setIsSheetOpen(false)}>
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            <DollarSign className="mr-2 h-4 w-4" />
                            정산 관리
                          </Button>
                        </Link>
                      </>
                    )}

                    <div className="pt-4 border-t">
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center space-x-2">
                <Shirt className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">옷 제작 플랫폼</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userInfo.userType === "designer" ? "디자이너" : "공장"}: {userInfo.name || userInfo.id}
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">안녕하세요, {userInfo.name || userInfo.id}님!</h2>
          <p className="text-gray-600">
            {userInfo.userType === "designer"
              ? "새로운 의류 제작을 시작하거나 기존 주문을 확인해보세요."
              : "작업 지시서를 확인하고 생산 현황을 업데이트하세요."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userInfo.userType === "designer" && (
            <>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/manufacturing">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="h-5 w-5 text-blue-600" />
                      <span>제작 시작하기</span>
                    </CardTitle>
                    <CardDescription>새로운 의류 제작 프로젝트를 시작합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      디자인부터 제작까지 AI가 도와주는 스마트한 제작 과정을 경험해보세요.
                    </p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/designer/orders">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span>주문 내역 조회</span>
                    </CardTitle>
                    <CardDescription>진행 중인 주문의 상태를 확인합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      샘플 제작부터 본 생산까지 전체 과정을 실시간으로 추적할 수 있습니다.
                    </p>
                  </CardContent>
                </Link>
              </Card>
            </>
          )}

          {userInfo.userType === "factory" && (
            <>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/factory/quotes">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      <span>요청된 견적 확인</span>
                    </CardTitle>
                    <CardDescription>디자이너가 요청한 견적을 확인하고 응답합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">새로운 견적 요청을 확인하고 가격과 일정을 제안하세요.</p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/factory/orders">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ClipboardList className="h-5 w-5 text-green-600" />
                      <span>주문 관리</span>
                    </CardTitle>
                    <CardDescription>진행 중인 주문의 상태를 관리합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">각 공정 단계별 진행 상황을 실시간으로 업데이트하세요.</p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/factory/feedback">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      <span>피드백 관리</span>
                    </CardTitle>
                    <CardDescription>고객 피드백을 확인하고 응답합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">디자이너의 피드백을 확인하고 품질 개선에 반영하세요.</p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/factory/settlement">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                      <span>정산 관리</span>
                    </CardTitle>
                    <CardDescription>완료된 주문의 정산을 관리합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">완료된 작업에 대한 정산 내역을 확인하고 관리하세요.</p>
                  </CardContent>
                </Link>
              </Card>
            </>
          )}

          {/* Common Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <span>계정 정보</span>
              </CardTitle>
              <CardDescription>계정 설정 및 프로필 관리</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">사용자 ID:</span> {userInfo.id}
                </p>
                <p>
                  <span className="font-medium">이름:</span> {userInfo.name}
                </p>
                <p>
                  <span className="font-medium">사용자 타입:</span>{" "}
                  {userInfo.userType === "designer" ? "디자이너" : "공장"}
                </p>
                <p>
                  <span className="font-medium">로그인 시간:</span>{" "}
                  {new Date(userInfo.loginTime).toLocaleString("ko-KR")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">최근 활동</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>아직 활동 내역이 없습니다.</p>
                <p className="text-sm">
                  {userInfo.userType === "designer"
                    ? "첫 번째 제작 프로젝트를 시작해보세요!"
                    : "작업 지시서를 확인해보세요!"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
