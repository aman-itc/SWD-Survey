import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Shield, BarChart3, TrendingUp, Users, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("executive");

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <Card className="relative z-10 w-full max-w-5xl p-8 md:p-12 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg animate-in zoom-in duration-500">
            <ClipboardList className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 bg-clip-text text-transparent">
            Low PDO SWD Survey
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-in slide-in-from-bottom duration-700">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-900">1,632</div>
            <div className="text-xs text-blue-700">Total Outlets</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-900">5</div>
            <div className="text-xs text-purple-700">Active Branches</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-900">Live</div>
            <div className="text-xs text-green-700">System Status</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-slate-100 p-1">
            <TabsTrigger 
              value="executive" 
              className="flex items-center gap-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
              data-testid="area-executive-tab"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="hidden sm:inline">Area Executive</span>
              <span className="sm:hidden">Executive</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-2 text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all"
              data-testid="administrator-tab"
            >
              <Shield className="w-5 h-5" />
              <span className="hidden sm:inline">Administrator</span>
              <span className="sm:hidden">Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="text-center space-y-6 py-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mb-4">
                <TrendingUp className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Start Your Survey</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                  Provide valuable feedback about retail outlets and track your section progress in real-time.
                </p>
              </div>
              <Button
                onClick={() => navigate("/survey")}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 h-14 px-10 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                data-testid="start-survey-button"
              >
                Begin Survey
                <ClipboardList className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="text-center space-y-6 py-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl mb-4">
                <BarChart3 className="w-12 h-12 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Dashboard</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                  Access comprehensive analytics, manage survey responses, and configure questions.
                </p>
              </div>
              <Button
                onClick={() => navigate("/admin/login")}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 h-14 px-10 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                data-testid="admin-login-button"
              >
                Access Dashboard
                <Shield className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">📊</div>
            <div className="text-xs text-slate-600">Real-time Analytics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">🎯</div>
            <div className="text-xs text-slate-600">Progress Tracking</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">📈</div>
            <div className="text-xs text-slate-600">Export Reports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">⚡</div>
            <div className="text-xs text-slate-600">Dynamic Forms</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
