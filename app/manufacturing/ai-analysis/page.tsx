"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Brain, FactoryIcon as Fabric, Package, Shirt } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ManufacturingStep3() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const analysisSteps = [
    {
      icon: Brain,
      title: "디자인 분석 중",
      description: "업로드된 디자인 파일을 AI가 분석하고 있습니다",
    },
    {
      icon: Fabric,
      title: "원단 요구사항 산출",
      description: "디자인에 적합한 원단 종류와 특성을 분석하고 있습니다",
    },
    {
      icon: Package,
      title: "부자재 목록 생성",
      description: "필요한 부자재와 액세서리를 식별하고 있습니다",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => {
            router.push("/manufacturing/material-selection")
          }, 1000)
          return 100
        }

        const newProgress = prev + 2
        const newStep = Math.floor(newProgress / 33.33)
        setCurrentStep(Math.min(newStep, 2))

        return newProgress
      })
    }, 100)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Logo */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors"
          >
            <Shirt className="h-8 w-8" />
            <span className="text-2xl font-bold">Fablink</span>
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">단계 3/6</span>
            <span className="text-sm text-gray-500">AI 분석 중</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 디자인 분석</h1>
          <p className="text-gray-600">AI가 디자인을 분석하여 필요한 원단과 부자재를 산출하고 있습니다</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Main Loading Card */}
          <Card className="mb-8">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">분석 진행 중...</h3>
                <p className="text-gray-600 mb-6">잠시만 기다려주세요. 곧 완료됩니다.</p>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{Math.round(progress)}% 완료</p>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Steps */}
          <div className="space-y-4">
            {analysisSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <Card
                  key={index}
                  className={`transition-all duration-300 ${
                    isActive ? "ring-2 ring-blue-500 bg-blue-50" : isCompleted ? "bg-green-50" : "bg-gray-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : isCompleted
                              ? "bg-green-600 text-white"
                              : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {isActive ? <Loader2 className="h-6 w-6 animate-spin" /> : <Icon className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            isActive ? "text-blue-900" : isCompleted ? "text-green-900" : "text-gray-600"
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p
                          className={`text-sm ${
                            isActive ? "text-blue-700" : isCompleted ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                      {isCompleted && (
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
