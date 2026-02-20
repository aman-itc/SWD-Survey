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
  const [wdDestinations, setWdDestinations] = useState([]);
  const [dmsIds, setDmsIds] = useState([]);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [completionStats, setCompletionStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState({});

  const [formData, setFormData] = useState({
    branch: "",
    section: "",
    wd_destination: "",
    dms_id_name: "",
  });
  
  // Color schemes for dynamic questions
  const questionColors = [
    { bg: "from-blue-50 to-slate-50", border: "border-blue-100", hover: "hover:bg-blue-50", accent: "text-blue-600", checkBorder: "border-blue-300" },
    { bg: "from-purple-50 to-slate-50", border: "border-purple-100", hover: "hover:bg-purple-50", accent: "text-purple-600", checkBorder: "border-purple-300" },
    { bg: "from-green-50 to-slate-50", border: "border-green-100", hover: "hover:bg-green-50", accent: "text-green-600", checkBorder: "border-green-300" },
    { bg: "from-amber-50 to-slate-50", border: "border-amber-100", hover: "hover:bg-amber-50", accent: "text-amber-600", checkBorder: "border-amber-300" },
    { bg: "from-rose-50 to-slate-50", border: "border-rose-100", hover: "hover:bg-rose-50", accent: "text-rose-600", checkBorder: "border-rose-300" },
    { bg: "from-cyan-50 to-slate-50", border: "border-cyan-100", hover: "hover:bg-cyan-50", accent: "text-cyan-600", checkBorder: "border-cyan-300" },
    { bg: "from-indigo-50 to-slate-50", border: "border-indigo-100", hover: "hover:bg-indigo-50", accent: "text-indigo-600", checkBorder: "border-indigo-300" },
  ];

  useEffect(() => {
    fetchBranches();
    fetchQuestions();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API}/branches`);
      setBranches(response.data.branches);
    } catch (error) {
      toast.error("Failed to load branches");
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API}/admin/questions`);
      setQuestions(response.data.questions);
      
      // Initialize question answers
      const initialAnswers = {};
      response.data.questions.forEach(q => {
        if (q.question_type === "single") {
          initialAnswers[q.id] = "";
        } else if (q.question_type === "multi") {
          initialAnswers[q.id] = [];
        } else {
          initialAnswers[q.id] = "";
        }
        
        // Initialize conditional inputs
        if (q.has_conditional_input) {
          initialAnswers[`${q.id}_conditional`] = "";
        }
      });
      setQuestionAnswers(initialAnswers);
    } catch (error) {
      toast.error("Failed to load questions");
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

  const fetchWdDestinations = async (section) => {
    try {
      const response = await axios.get(`${API}/wd-destinations/${section}`);
      setWdDestinations(response.data.wd_destinations);
      
      // Also fetch completion stats for this section
      fetchSectionCompletion(section);
    } catch (error) {
      toast.error("Failed to load WD destinations");
    }
  };

  const fetchDmsIds = async (section, wdDestination) => {
    try {
      const response = await axios.get(`${API}/dms-ids/${section}/${encodeURIComponent(wdDestination)}`);
      setDmsIds(response.data.dms_ids);
    } catch (error) {
      toast.error("Failed to load DMS IDs");
    }
  };

  const fetchSectionCompletion = async (section) => {
    try {
      const response = await axios.get(`${API}/section-completion/${section}`);
      setCompletionStats(response.data);
    } catch (error) {
      console.error("Failed to load completion stats");
    }
  };

  const handleBranchChange = (value) => {
    setFormData({ ...formData, branch: value, section: "", wd_destination: "", dms_id_name: "" });
    setSections([]);
    setWdDestinations([]);
    setDmsIds([]);
    fetchSections(value);
  };

  const handleSectionChange = (value) => {
    setFormData({ ...formData, section: value, wd_destination: "", dms_id_name: "" });
    setWdDestinations([]);
    setDmsIds([]);
    setCompletionStats(null);
    fetchWdDestinations(value);
  };

  const handleWdDestinationChange = (value) => {
    setFormData({ ...formData, wd_destination: value, dms_id_name: "" });
    setDmsIds([]);
    fetchDmsIds(formData.section, value);
  };

  const handleDmsIdChange = (value) => {
    setFormData({
      ...formData,
      dms_id_name: value
    });
  };

  const handleNextStep = () => {
    if (!formData.branch || !formData.section || !formData.wd_destination || !formData.dms_id_name) {
      toast.error("Please complete all selections");
      return;
    }
    setStep(2);
  };

  const handleCheckboxChange = (field, value) => {
    const current = questionAnswers[field] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setQuestionAnswers({ ...questionAnswers, [field]: updated });
  };

  const handleQuestionChange = (questionId, value) => {
    setQuestionAnswers({ ...questionAnswers, [questionId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all mandatory questions are answered
    const unansweredQuestions = questions.filter(q => {
      if (!q.is_mandatory) return false;
      
      const answer = questionAnswers[q.id];
      if (q.question_type === "multi") {
        return !answer || answer.length === 0;
      }
      return !answer || answer === "";
    });

    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer question ${unansweredQuestions[0].question_number}`);
      return;
    }

    // Validate conditional inputs
    for (const q of questions) {
      if (q.has_conditional_input && q.conditional_trigger) {
        const answer = questionAnswers[q.id];
        if (Array.isArray(answer) && answer.includes(q.conditional_trigger)) {
          const conditionalAnswer = questionAnswers[`${q.id}_conditional`];
          if (!conditionalAnswer || conditionalAnswer.trim() === "") {
            toast.error(`Please provide details for "${q.conditional_trigger}" in question ${q.question_number}`);
            return;
          }
        }
      }
    }

    setLoading(true);

    try {
      // Build submission data dynamically
      const submission = {
        branch: formData.branch,
        section: formData.section,
        wd_destination: formData.wd_destination,
        dms_id_name: formData.dms_id_name,
      };

      // Add all question answers
      questions.forEach(q => {
        let answer = questionAnswers[q.id];
        
        // Handle conditional input
        if (q.has_conditional_input && q.conditional_trigger) {
          const conditionalAnswer = questionAnswers[`${q.id}_conditional`];
          if (Array.isArray(answer) && answer.includes(q.conditional_trigger) && conditionalAnswer) {
            answer = [...answer.filter(a => a !== q.conditional_trigger), `${q.conditional_trigger}: ${conditionalAnswer}`];
          }
        }
        
        submission[`q${q.question_number}`] = answer;
        
        // Add conditional answer separately if exists
        if (q.has_conditional_input) {
          submission[`q${q.question_number}_conditional`] = questionAnswers[`${q.id}_conditional`] || null;
        }
      });

      await axios.post(`${API}/survey/submit`, submission);
      setSuccess(true);
      toast.success("Survey submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
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
                    value={formData.section} 
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

                {/* WD Destination */}
                <div className="space-y-3 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <Label className="text-base font-semibold text-slate-800">Please select your WD and DS *</Label>
                  </div>
                  <Select 
                    value={formData.wd_destination} 
                    onValueChange={handleWdDestinationChange}
                    disabled={!formData.section}
                  >
                    <SelectTrigger data-testid="wd-destination-select" className="h-12 bg-white text-base disabled:bg-slate-100">
                      <SelectValue placeholder={formData.section ? "Choose WD destination..." : "Select section first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {wdDestinations.map(wd => (
                        <SelectItem key={wd} value={wd} className="text-sm py-3">
                          {wd}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* DMS ID - Name */}
                <div className="space-y-3 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <Label className="text-base font-semibold text-slate-800">DMS ID - Name *</Label>
                  </div>
                  <Select 
                    value={formData.dms_id_name} 
                    onValueChange={handleDmsIdChange}
                    disabled={!formData.wd_destination}
                  >
                    <SelectTrigger data-testid="dms-id-select" className="h-12 bg-white text-base disabled:bg-slate-100">
                      <SelectValue placeholder={formData.wd_destination ? "Choose DMS ID..." : "Select WD destination first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {dmsIds.map(dms => (
                        <SelectItem key={dms.dms_id_name} value={dms.dms_id_name} className="text-sm py-3">
                          {dms.dms_id_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.dms_id_name && (
                  <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-sm font-semibold text-green-800 mb-2 block">Selected DMS</Label>
                    <p className="text-lg font-medium text-green-900" data-testid="selected-dms">{formData.dms_id_name}</p>
                  </div>
                )}

                {/* Section Completion Stats */}
                {completionStats && (
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Label className="text-sm font-semibold text-blue-900 mb-1 block">Section Progress</Label>
                        <p className="text-xs text-blue-700">
                          {completionStats.completed_surveys} of {completionStats.total_dms_ids} outlets completed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600" data-testid="completion-percentage">
                          {completionStats.completion_percentage}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${completionStats.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  onClick={handleNextStep}
                  disabled={!formData.branch || !formData.section || !formData.wd_destination || !formData.dms_id_name}
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
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">Loading questions...</p>
                  </div>
                ) : (
                  questions.map((question, index) => {
                    const colors = questionColors[index % questionColors.length];
                    const answer = questionAnswers[question.id];
                    
                    return (
                      <div 
                        key={question.id} 
                        className={`p-6 bg-gradient-to-br ${colors.bg} rounded-xl border ${colors.border}`}
                        data-testid={`question-${question.question_number}`}
                      >
                        <Label className="text-base font-semibold text-slate-900 mb-4 block">
                          {question.question_number}. {question.question_text} {question.is_mandatory && "*"}
                        </Label>
                        
                        {question.question_type === "single" && question.options && (
                          <RadioGroup 
                            value={answer || ""} 
                            onValueChange={(value) => handleQuestionChange(question.id, value)} 
                            className="space-y-3"
                          >
                            {question.options.map(option => (
                              <div key={option.value} className={`flex items-center space-x-3 p-3 bg-white rounded-lg ${colors.hover} transition-colors`}>
                                <RadioGroupItem 
                                  value={option.value} 
                                  id={`q${question.question_number}-${option.value}`} 
                                  data-testid={`q${question.question_number}-${option.value}`}
                                  className={colors.accent}
                                />
                                <Label 
                                  htmlFor={`q${question.question_number}-${option.value}`} 
                                  className="cursor-pointer font-normal text-base flex-1"
                                >
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        
                        {question.question_type === "multi" && question.options && (
                          <div className="space-y-3">
                            {question.options.map(option => (
                              <div key={option.value} className={`flex items-center space-x-3 p-3 bg-white rounded-lg ${colors.hover} transition-colors`}>
                                <Checkbox 
                                  id={`q${question.question_number}-${option.value}`}
                                  checked={Array.isArray(answer) && answer.includes(option.value)}
                                  onCheckedChange={() => handleCheckboxChange(question.id, option.value)}
                                  data-testid={`q${question.question_number}-${option.value}`}
                                  className={colors.checkBorder}
                                />
                                <Label 
                                  htmlFor={`q${question.question_number}-${option.value}`} 
                                  className="cursor-pointer font-normal text-base flex-1"
                                >
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                            
                            {/* Conditional input for multi-select */}
                            {question.has_conditional_input && question.conditional_trigger && 
                              Array.isArray(answer) && answer.includes(question.conditional_trigger) && (
                              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-opacity-50 animate-in fade-in slide-in-from-top-2" style={{borderColor: 'inherit'}}>
                                <Label className="text-sm font-semibold text-slate-800 mb-2 block">
                                  Please provide details for "{question.conditional_trigger}" *
                                </Label>
                                <Textarea
                                  placeholder={`Describe the ${question.conditional_trigger.toLowerCase()}...`}
                                  value={questionAnswers[`${question.id}_conditional`] || ""}
                                  onChange={(e) => handleQuestionChange(`${question.id}_conditional`, e.target.value)}
                                  rows={4}
                                  data-testid={`q${question.question_number}-conditional-input`}
                                  className="border-slate-200"
                                />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {question.question_type === "text" && (
                          <Textarea
                            placeholder="Enter your response..."
                            value={answer || ""}
                            onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                            rows={4}
                            data-testid={`q${question.question_number}-text-input`}
                            className="border-slate-200"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={loading || questions.length === 0}
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
