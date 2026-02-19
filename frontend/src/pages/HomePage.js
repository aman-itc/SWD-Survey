import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Shield } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("executive");

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1771293806966-c22ba7f765e2?q=85&w=1920&auto=format&fit=crop')`,
      }}
    >
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
      
      <Card className="relative z-10 w-full max-w-2xl p-8 md:p-12 shadow-[0_8px_16px_rgba(0,0,0,0.06)] border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            ITC SURVEY
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            Survey Management System
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger 
              value="executive" 
              className="flex items-center gap-2"
              data-testid="area-executive-tab"
            >
              <ClipboardList className="w-4 h-4" />
              Area Executive
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-2"
              data-testid="administrator-tab"
            >
              <Shield className="w-4 h-4" />
              Administrator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-slate-600">
                Take the survey to provide your feedback about the outlet.
              </p>
              <Button
                onClick={() => navigate("/survey")}
                className="bg-slate-900 text-white hover:bg-slate-800 h-11 px-8 font-medium transition-all active:scale-95"
                data-testid="start-survey-button"
              >
                Start Survey
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-slate-600">
                Access the admin dashboard to view and manage survey responses.
              </p>
              <Button
                onClick={() => navigate("/admin/login")}
                className="bg-slate-900 text-white hover:bg-slate-800 h-11 px-8 font-medium transition-all active:scale-95"
                data-testid="admin-login-button"
              >
                Admin Login
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}