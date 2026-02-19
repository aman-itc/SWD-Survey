import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, ArrowLeft, Loader2, ArrowRight, ChevronRight, Building2, Layers, User } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SurveyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [completionStats, setCompletionStats] = useState(null);

  const [formData, setFormData] = useState({
    branch: "",
    section_code: "",
    dms_customer_id: "",
    dms_customer_name: "",
    q1_itc_biscuits_sales: "",
    q2_total_biscuits_sales: "",
    q3_itc_nd_sales: "",
    q4_nd_sales_swd: "",
    q5_loyalty_programs: [],
    q5_loyalty_other: "",
    q6_category_handlers: [],
    q7_not_purchasing_reasons: [],
    q7_relationship_issue_details: ""
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API}/branches`);
      setBranches(response.data.branches);
    } catch (error) {
      toast.error("Failed to load branches");
    }
  };

  const fetchSections = async (branch) => {
    try {
      const response = await axios.get(`${API}/sections/${branch}`);
      setSections(response.data.sections);
    } catch (error) {
      toast.error("Failed to load sections");
    }
  };

  const fetchCustomers = async (sectionCode) => {
    try {
      const response = await axios.get(`${API}/customers/${sectionCode}`);
      setCustomers(response.data.customers);
    } catch (error) {
      toast.error("Failed to load customers");
    }
  };

  const handleBranchChange = (value) => {
    setFormData({ ...formData, branch: value, section_code: "", dms_customer_id: "", dms_customer_name: "" });
    setSections([]);
    setCustomers([]);
    fetchSections(value);
  };

  const handleSectionChange = (value) => {
    setFormData({ ...formData, section_code: value, dms_customer_id: "", dms_customer_name: "" });
    setCustomers([]);
    fetchCustomers(value);
  };

  const handleCustomerChange = (value) => {
    const customer = customers.find(c => c.dms_customer_id === value);
    setFormData({
      ...formData,
      dms_customer_id: value,
      dms_customer_name: customer ? customer.dms_customer_name : ""
    });
  };

  const handleNextStep = () => {
    if (!formData.branch || !formData.section_code || !formData.dms_customer_id) {
      toast.error("Please select Branch, Section, and Customer");
      return;
    }
    setStep(2);
  };

  const handleCheckboxChange = (field, value) => {
    const current = formData[field];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.q1_itc_biscuits_sales || !formData.q2_total_biscuits_sales || 
        !formData.q3_itc_nd_sales || !formData.q4_nd_sales_swd) {
      toast.error("Please answer all questions");
      return;
    }

    if (formData.q5_loyalty_programs.length === 0) {
      toast.error("Please select at least one option for question 5");
      return;
    }

    if (formData.q6_category_handlers.length === 0) {
      toast.error("Please select at least one option for question 6");
      return;
    }

    if (formData.q7_not_purchasing_reasons.length === 0) {
      toast.error("Please select at least one option for question 7");
      return;
    }

    if (formData.q7_not_purchasing_reasons.includes("Relationship issue") && 
        !formData.q7_relationship_issue_details.trim()) {
      toast.error("Please provide details for relationship issue");
      return;
    }

    setLoading(true);

    try {
      const loyaltyPrograms = formData.q5_loyalty_programs.includes("Others") && formData.q5_loyalty_other
        ? [...formData.q5_loyalty_programs.filter(p => p !== "Others"), `Others: ${formData.q5_loyalty_other}`]
        : formData.q5_loyalty_programs;

      const submission = {
        branch: formData.branch,
        section_code: formData.section_code,
        dms_customer_id: formData.dms_customer_id,
        dms_customer_name: formData.dms_customer_name,
        q1_itc_biscuits_sales: formData.q1_itc_biscuits_sales,
        q2_total_biscuits_sales: formData.q2_total_biscuits_sales,
        q3_itc_nd_sales: formData.q3_itc_nd_sales,
        q4_nd_sales_swd: formData.q4_nd_sales_swd,
        q5_loyalty_programs: loyaltyPrograms,
        q6_category_handlers: formData.q6_category_handlers,
        q7_not_purchasing_reasons: formData.q7_not_purchasing_reasons,
        q7_relationship_issue_details: formData.q7_relationship_issue_details || null
      };

      await axios.post(`${API}/survey/submit`, submission);
      setSuccess(true);
      toast.success("Survey submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit survey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-slate-50"
      >
        <Card className="w-full max-w-md p-8 text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Thank You!</h2>
          <p className="text-slate-600 mb-8 text-lg">Your survey has been submitted successfully.</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-slate-900 text-white hover:bg-slate-800 w-full"
            data-testid="return-home-button"
          >
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => step === 1 ? navigate("/") : setStep(1)}
          variant="ghost"
          className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 1 ? "Back to Home" : "Back to Details"}
        </Button>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                1
              </div>
              <span className="font-medium hidden sm:inline">Outlet Details</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                2
              </div>
              <span className="font-medium hidden sm:inline">Survey Questions</span>
            </div>
          </div>
        </div>

        <Card className="p-8 md:p-12 shadow-lg border-slate-200">
          {step === 1 ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Outlet Details</h1>
                <p className="text-slate-600">Please select the outlet information to begin the survey</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Branch */}
                <div className="space-y-3 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <Label className="text-base font-semibold text-slate-800">Select Branch *</Label>
                  </div>
                  <Select value={formData.branch} onValueChange={handleBranchChange}>
                    <SelectTrigger data-testid="branch-select" className="h-12 bg-white text-base">
                      <SelectValue placeholder="Choose your branch..." />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => (
                        <SelectItem key={branch} value={branch} className="text-base">{branch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Section */}
                <div className="space-y-3 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <Label className="text-base font-semibold text-slate-800">Select Section *</Label>
                  </div>
                  <Select 
                    value={formData.section_code} 
                    onValueChange={handleSectionChange}
                    disabled={!formData.branch}
                  >
                    <SelectTrigger data-testid="section-select" className="h-12 bg-white text-base disabled:bg-slate-100">
                      <SelectValue placeholder={formData.branch ? "Choose section..." : "Select branch first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map(section => (
                        <SelectItem key={section} value={section} className="text-base">{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer */}
                <div className="space-y-3 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <Label className="text-base font-semibold text-slate-800">Select Customer *</Label>
                  </div>
                  <Select 
                    value={formData.dms_customer_id} 
                    onValueChange={handleCustomerChange}
                    disabled={!formData.section_code}
                  >
                    <SelectTrigger data-testid="customer-select" className="h-12 bg-white text-base disabled:bg-slate-100">
                      <SelectValue placeholder={formData.section_code ? "Choose customer..." : "Select section first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.dms_customer_id} value={customer.dms_customer_id} className="text-sm py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{customer.dms_customer_id}</span>
                            <span className="text-slate-600 text-xs mt-1">{customer.dms_customer_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.dms_customer_name && (
                  <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-sm font-semibold text-green-800 mb-2 block">Selected Customer</Label>
                    <p className="text-lg font-medium text-green-900" data-testid="customer-name">{formData.dms_customer_name}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  onClick={handleNextStep}
                  disabled={!formData.branch || !formData.section_code || !formData.dms_customer_id}
                  className="bg-blue-600 text-white hover:bg-blue-700 h-12 px-8 font-medium text-base"
                  data-testid="next-step-button"
                >
                  Continue to Survey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Survey Questions</h1>
                <p className="text-slate-600">All questions are mandatory</p>
              </div>

              <div className="space-y-8">
                {/* Q1 */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100">
                  <Label className="text-base font-semibold text-slate-900 mb-4 block">
                    1. How much is ITC biscuits monthly Sales (including all sources of purchase)? *
                  </Label>
                  <RadioGroup value={formData.q1_itc_biscuits_sales} onValueChange={(value) => setFormData({...formData, q1_itc_biscuits_sales: value})} className="space-y-3">
                    {["<Rs 1k", "Rs 1k-5k", "Rs.5k-20k", "Rs.20k-1L", "Rs.1L +"].map(option => (
                      <div key={option} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                        <RadioGroupItem value={option} id={`q1-${option}`} data-testid={`q1-${option}`} className="text-blue-600" />
                        <Label htmlFor={`q1-${option}`} className="cursor-pointer font-normal text-base flex-1">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Q2 */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-slate-50 rounded-xl border border-purple-100">
                  <Label className="text-base font-semibold text-slate-900 mb-4 block">
                    2. How much is the total monthly biscuits category sales for the outlet (All sources of purchase, all national/regional players)? *
                  </Label>
                  <RadioGroup value={formData.q2_total_biscuits_sales} onValueChange={(value) => setFormData({...formData, q2_total_biscuits_sales: value})} className="space-y-3">
                    {["<Rs.20K", "Rs.20k - 1L", "Rs.1L – 5L", "Rs.5L +"].map(option => (
                      <div key={option} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors">
                        <RadioGroupItem value={option} id={`q2-${option}`} data-testid={`q2-${option}`} className="text-purple-600" />
                        <Label htmlFor={`q2-${option}`} className="cursor-pointer font-normal text-base flex-1">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Q3 */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-slate-50 rounded-xl border border-green-100">
                  <Label className="text-base font-semibold text-slate-900 mb-4 block">
                    3. How much is ITC ND monthly Sales (including all sources of purchase)? *
                  </Label>
                  <RadioGroup value={formData.q3_itc_nd_sales} onValueChange={(value) => setFormData({...formData, q3_itc_nd_sales: value})} className="space-y-3">
                    {["<Rs.5k", "Rs.5k-20k", "Rs.20k-1L", "Rs.1L +"].map(option => (
                      <div key={option} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 transition-colors">
                        <RadioGroupItem value={option} id={`q3-${option}`} data-testid={`q3-${option}`} className="text-green-600" />
                        <Label htmlFor={`q3-${option}`} className="cursor-pointer font-normal text-base flex-1">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Q4 */}
                <div className="p-6 bg-gradient-to-br from-amber-50 to-slate-50 rounded-xl border border-amber-100">
                  <Label className="text-base font-semibold text-slate-900 mb-4 block">
                    4. How much is ND sales for the SWD (All sources, all national/regional players)? *
                  </Label>
                  <RadioGroup value={formData.q4_nd_sales_swd} onValueChange={(value) => setFormData({...formData, q4_nd_sales_swd: value})} className="space-y-3">
                    {["<Rs.20K", "Rs.20k - 1L", "Rs.1L – 5L", "Rs.5L +"].map(option => (
                      <div key={option} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-amber-50 transition-colors">
                        <RadioGroupItem value={option} id={`q4-${option}`} data-testid={`q4-${option}`} className="text-amber-600" />
                        <Label htmlFor={`q4-${option}`} className="cursor-pointer font-normal text-base flex-1">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Q5 */}
                <div className="p-6 bg-gradient-to-br from-rose-50 to-slate-50 rounded-xl border border-rose-100">
                  <Label className="text-base font-semibold text-slate-900 mb-4 block">
                    5. Is the SWD part of any competition loyalty program? (Select all that apply) *
                  </Label>
                  <div className="space-y-3">
                    {["Britannia", "Nestle", "HUL", "Others"].map(option => (
                      <div key={option} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-rose-50 transition-colors">
                        <Checkbox 
                          id={`q5-${option}`}
                          checked={formData.q5_loyalty_programs.includes(option)}
                          onCheckedChange={() => handleCheckboxChange("q5_loyalty_programs", option)}
                          data-testid={`q5-${option}`}
                          className="border-rose-300"
                        />
                        <Label htmlFor={`q5-${option}`} className="cursor-pointer font-normal text-base flex-1">{option}</Label>
                      </div>
                    ))}
                    {formData.q5_loyalty_programs.includes("Others") && (
                      <Input
                        placeholder="Please specify other loyalty program"
                        value={formData.q5_loyalty_other}
                        onChange={(e) => setFormData({...formData, q5_loyalty_other: e.target.value})}
                        className="mt-3 h-11"
                        data-testid="q5-others-input"
                      />
                    )}
                  </div>
                </div>

                {/* Q6 */}
                <div className="p-6 bg-gradient-to-br from-cyan-50 to-slate-50 rounded-xl border border-cyan-100">
                  <Label className="text-base font-semibold text-slate-900 mb-4 block">
                    6. Is the outlet a category handler for the following? (Select all that apply) *
                  </Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {["Atta", "Snacks", "Confectionery", "Soaps", "Agarbatti", "Cigarettes"].map(option => (
                      <div key={option} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-cyan-50 transition-colors">
                        <Checkbox 
                          id={`q6-${option}`}
                          checked={formData.q6_category_handlers.includes(option)}
                          onCheckedChange={() => handleCheckboxChange("q6_category_handlers", option)}
                          data-testid={`q6-${option}`}
                          className="border-cyan-300"
                        />
                        <Label htmlFor={`q6-${option}`} className="cursor-pointer font-normal text-base flex-1">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q7 */}
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl border border-indigo-100">
                  <Label className="text-base font-semibold text-slate-900 mb-4 block">
                    7. Why is the SWD not purchasing significant quantity from WD? (Select all that apply) *
                  </Label>
                  <div className="space-y-3">
                    {[
                      "Credit related",
                      "High Purchase from Alternate Channel",
                      "Loyalty of competition & not present in Shubh Labh",
                      "Low demand/Sell out led",
                      "Delivery Issues",
                      "Relationship issue",
                      "Retailer tagged as SWD",
                      "Scheme communication not adequate"
                    ].map(option => (
                      <div key={option} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-indigo-50 transition-colors">
                        <Checkbox 
                          id={`q7-${option}`}
                          checked={formData.q7_not_purchasing_reasons.includes(option)}
                          onCheckedChange={() => handleCheckboxChange("q7_not_purchasing_reasons", option)}
                          data-testid={`q7-${option}`}
                          className="border-indigo-300"
                        />
                        <Label htmlFor={`q7-${option}`} className="cursor-pointer font-normal text-base flex-1">{option}</Label>
                      </div>
                    ))}
                    {formData.q7_not_purchasing_reasons.includes("Relationship issue") && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-indigo-200 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-sm font-semibold text-indigo-900 mb-2 block">Please provide reason for relationship issue *</Label>
                        <Textarea
                          placeholder="Describe the relationship issue..."
                          value={formData.q7_relationship_issue_details}
                          onChange={(e) => setFormData({...formData, q7_relationship_issue_details: e.target.value})}
                          rows={4}
                          data-testid="q7-relationship-details"
                          className="border-indigo-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700 h-12 px-8 font-medium text-base shadow-lg hover:shadow-xl transition-all"
                  data-testid="submit-survey-button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Survey"
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
