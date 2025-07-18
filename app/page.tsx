import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shirt, Zap, Users, Award } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Shirt className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">옷 제작 플랫폼</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                서비스
              </a>
              <a href="#process" className="text-gray-600 hover:text-gray-900">
                제작과정
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">
                문의
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI와 함께하는
            <br />
            <span className="text-blue-600">맞춤형 의류 제작</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            디자인부터 제작까지, AI가 도와주는 스마트한 의류 제작 플랫폼입니다. 전문가 수준의 품질로 여러분의 아이디어를
            현실로 만들어보세요.
          </p>
          <Link href="/manufacturing">
            <Button size="lg" className="px-8 py-4 text-lg">
              제작 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">왜 저희를 선택해야 할까요?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI 기술과 전문 제작진의 노하우가 결합된 혁신적인 의류 제작 서비스
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>AI 기반 분석</CardTitle>
                <CardDescription>디자인을 AI가 분석하여 최적의 원단과 부자재를 추천합니다</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>전문가 상담</CardTitle>
                <CardDescription>AI 챗봇과 전문 상담사가 24시간 여러분을 도와드립니다</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>품질 보장</CardTitle>
                <CardDescription>무료 샘플 제작과 엄격한 품질 검사로 완벽한 제품을 보장합니다</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">간단한 6단계 제작 과정</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">복잡한 의류 제작 과정을 간단하고 직관적으로 만들었습니다</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { step: 1, title: "제품 정보 입력", desc: "제품명, 시즌, 타겟고객층, 컨셉 설명" },
              { step: 2, title: "디자인 업로드", desc: "스케치 파일과 포인트 부위 설명" },
              { step: 3, title: "AI 분석", desc: "필요한 원단과 부자재 자동 산출" },
              { step: 4, title: "재료 선택", desc: "원단과 부자재 선택 (AI 상담 지원)" },
              { step: 5, title: "수량/일정 설정", desc: "샘플 사이즈, 총 수량, 납기일 입력" },
              { step: 6, title: "최종 확인", desc: "참고사항 작성 및 주문 완료" },
            ].map((item) => (
              <Card key={item.step} className="relative">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/manufacturing">
              <Button size="lg" variant="outline">
                지금 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shirt className="h-6 w-6" />
                <span className="text-lg font-bold">옷 제작 플랫폼</span>
              </div>
              <p className="text-gray-400">AI 기반 맞춤형 의류 제작 서비스</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li>의류 제작</li>
                <li>AI 상담</li>
                <li>품질 검사</li>
                <li>A/S 서비스</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>FAQ</li>
                <li>1:1 문의</li>
                <li>제작 가이드</li>
                <li>주문 조회</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">연락처</h4>
              <ul className="space-y-2 text-gray-400">
                <li>전화: 1588-1234</li>
                <li>이메일: info@clothingplatform.com</li>
                <li>운영시간: 평일 09:00-18:00</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 옷 제작 플랫폼. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
