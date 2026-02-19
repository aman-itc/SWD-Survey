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
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SurveyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: Survey Questions

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

  const handleBackToDetails = () => {
    setStep(1);
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

    // Validation
    if (!formData.branch || !formData.section_code || !formData.dms_customer_id) {
      toast.error("Please select Branch, Section, and Customer");
      return;
    }

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
      // Prepare data
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
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1771293806966-c22ba7f765e2?q=85&w=1920&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
        <Card className="relative z-10 w-full max-w-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-600 mb-6">Your survey has been submitted successfully.</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-slate-900 text-white hover:bg-slate-800"
            data-testid="return-home-button"
          >
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1771293806966-c22ba7f765e2?q=85&w=1920&auto=format&fit=crop')`,
      }}
    >
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-4 text-slate-600 hover:text-slate-900"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Retail Outlet Survey</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Cascading Dropdowns */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Branch *</Label>
                <Select value={formData.branch} onValueChange={handleBranchChange}>
                  <SelectTrigger data-testid="branch-select" className="h-11">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Section *</Label>
                <Select 
                  value={formData.section_code} 
                  onValueChange={handleSectionChange}
                  disabled={!formData.branch}
                >
                  <SelectTrigger data-testid="section-select" className="h-11 disabled:bg-slate-50">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(section => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">DMS Customer ID *</Label>
                <Select 
                  value={formData.dms_customer_id} 
                  onValueChange={handleCustomerChange}
                  disabled={!formData.section_code}
                >
                  <SelectTrigger data-testid="customer-select" className="h-11 disabled:bg-slate-50">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.dms_customer_id} value={customer.dms_customer_id}>
                        {customer.dms_customer_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.dms_customer_name && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Label className="text-sm font-semibold text-slate-700">DMS Customer Name</Label>
                <p className="text-base text-slate-900 mt-1" data-testid="customer-name">{formData.dms_customer_name}</p>
              </div>
            )}

            <div className="border-t border-slate-200 pt-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Survey Questions</h2>

              {/* Q1 */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold text-slate-700">
                  1. How much is ITC biscuits monthly Sales (including all sources of purchase)? *
                </Label>
                <RadioGroup value={formData.q1_itc_biscuits_sales} onValueChange={(value) => setFormData({...formData, q1_itc_biscuits_sales: value})}>
                  {["<Rs 1k", "Rs 1k-5k", "Rs.5k-20k", "Rs.20k-1L", "Rs.1L +"].map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q1-${option}`} data-testid={`q1-${option}`} />
                      <Label htmlFor={`q1-${option}`} className="cursor-pointer font-normal">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Q2 */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold text-slate-700">
                  2. How much is the total monthly biscuits category sales for the outlet (All sources of purchase, all national/regional players)? *
                </Label>
                <RadioGroup value={formData.q2_total_biscuits_sales} onValueChange={(value) => setFormData({...formData, q2_total_biscuits_sales: value})}>
                  {["<Rs.20K", "Rs.20k - 1L", "Rs.1L – 5L", "Rs.5L +"].map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q2-${option}`} data-testid={`q2-${option}`} />
                      <Label htmlFor={`q2-${option}`} className="cursor-pointer font-normal">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Q3 */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold text-slate-700">
                  3. How much is ITC ND monthly Sales (including all sources of purchase)? *
                </Label>
                <RadioGroup value={formData.q3_itc_nd_sales} onValueChange={(value) => setFormData({...formData, q3_itc_nd_sales: value})}>
                  {["<Rs.5k", "Rs.5k-20k", "Rs.20k-1L", "Rs.1L +"].map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q3-${option}`} data-testid={`q3-${option}`} />
                      <Label htmlFor={`q3-${option}`} className="cursor-pointer font-normal">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Q4 */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold text-slate-700">
                  4. How much is ND sales for the SWD (All sources, all national/regional players)? *
                </Label>
                <RadioGroup value={formData.q4_nd_sales_swd} onValueChange={(value) => setFormData({...formData, q4_nd_sales_swd: value})}>
                  {["<Rs.20K", "Rs.20k - 1L", "Rs.1L – 5L", "Rs.5L +"].map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q4-${option}`} data-testid={`q4-${option}`} />
                      <Label htmlFor={`q4-${option}`} className="cursor-pointer font-normal">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Q5 */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold text-slate-700">
                  5. Is the SWD part of any competition loyalty program? (Select all that apply) *
                </Label>
                {["Britannia", "Nestle", "HUL", "Others"].map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`q5-${option}`}
                      checked={formData.q5_loyalty_programs.includes(option)}
                      onCheckedChange={() => handleCheckboxChange("q5_loyalty_programs", option)}
                      data-testid={`q5-${option}`}
                    />
                    <Label htmlFor={`q5-${option}`} className="cursor-pointer font-normal">{option}</Label>
                  </div>
                ))}
                {formData.q5_loyalty_programs.includes("Others") && (
                  <Input
                    placeholder="Please specify other loyalty program"
                    value={formData.q5_loyalty_other}
                    onChange={(e) => setFormData({...formData, q5_loyalty_other: e.target.value})}
                    className="mt-2"
                    data-testid="q5-others-input"
                  />
                )}
              </div>

              {/* Q6 */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold text-slate-700">
                  6. Is the outlet a category handler for the following? (Select all that apply) *
                </Label>
                {["Atta", "Snacks", "Confectionery", "Soaps", "Agarbatti", "Cigarettes"].map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`q6-${option}`}
                      checked={formData.q6_category_handlers.includes(option)}
                      onCheckedChange={() => handleCheckboxChange("q6_category_handlers", option)}
                      data-testid={`q6-${option}`}
                    />
                    <Label htmlFor={`q6-${option}`} className="cursor-pointer font-normal">{option}</Label>
                  </div>
                ))}
              </div>

              {/* Q7 */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold text-slate-700">
                  7. Why is the SWD not purchasing significant quantity from WD? (Select all that apply) *
                </Label>
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
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`q7-${option}`}
                      checked={formData.q7_not_purchasing_reasons.includes(option)}
                      onCheckedChange={() => handleCheckboxChange("q7_not_purchasing_reasons", option)}
                      data-testid={`q7-${option}`}
                    />
                    <Label htmlFor={`q7-${option}`} className="cursor-pointer font-normal">{option}</Label>
                  </div>
                ))}
                {formData.q7_not_purchasing_reasons.includes("Relationship issue") && (
                  <div className="mt-3">
                    <Label className="text-sm font-semibold text-slate-700 mb-2">Please provide reason for relationship issue *</Label>
                    <Textarea
                      placeholder="Describe the relationship issue..."
                      value={formData.q7_relationship_issue_details}
                      onChange={(e) => setFormData({...formData, q7_relationship_issue_details: e.target.value})}
                      className="mt-2"
                      rows={3}
                      data-testid="q7-relationship-details"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white hover:bg-slate-800 h-11 px-8 font-medium transition-all active:scale-95"
                data-testid="submit-survey-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Survey"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}