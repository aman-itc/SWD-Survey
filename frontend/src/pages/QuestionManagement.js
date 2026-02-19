import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function QuestionManagement() {
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    question_number: 1,
    question_text: "",
    question_type: "single",
    options: [],
    is_mandatory: true,
    has_conditional_input: false,
    conditional_trigger: ""
  });
  const [newOption, setNewOption] = useState({ value: "", label: "" });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API}/admin/questions`);
      setQuestions(response.data.questions);
    } catch (error) {
      toast.error("Failed to load questions");
    }
  };

  const handleAddOption = () => {
    if (newOption.value && newOption.label) {
      setFormData({
        ...formData,
        options: [...formData.options, { ...newOption }]
      });
      setNewOption({ value: "", label: "" });
    }
  };

  const handleRemoveOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  const handleSaveQuestion = async () => {
    try {
      if (editingId) {
        await axios.put(`${API}/admin/questions/${editingId}`, formData);
        toast.success("Question updated successfully");
      } else {
        await axios.post(`${API}/admin/questions`, formData);
        toast.success("Question added successfully");
      }
      fetchQuestions();
      resetForm();
    } catch (error) {
      toast.error("Failed to save question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(`${API}/admin/questions/${questionId}`);
        toast.success("Question deleted");
        fetchQuestions();
      } catch (error) {
        toast.error("Failed to delete question");
      }
    }
  };

  const handleEditQuestion = (question) => {
    setFormData({
      question_number: question.question_number,
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options || [],
      is_mandatory: question.is_mandatory,
      has_conditional_input: question.has_conditional_input || false,
      conditional_trigger: question.conditional_trigger || ""
    });
    setEditingId(question.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      question_number: questions.length + 1,
      question_text: "",
      question_type: "single",
      options: [],
      is_mandatory: true,
      has_conditional_input: false,
      conditional_trigger: ""
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Question Management</h2>
          <p className="text-slate-600">Create and manage survey questions</p>
        </div>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
            data-testid="add-question-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? "Edit Question" : "Add New Question"}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Number *</Label>
                <Input
                  type="number"
                  value={formData.question_number}
                  onChange={(e) => setFormData({...formData, question_number: parseInt(e.target.value)})}
                  data-testid="question-number-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Question Type *</Label>
                <Select value={formData.question_type} onValueChange={(value) => setFormData({...formData, question_type: value})}>
                  <SelectTrigger data-testid="question-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Select</SelectItem>
                    <SelectItem value="multi">Multi Select</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={formData.question_text}
                onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                rows={3}
                placeholder="Enter your question..."
                data-testid="question-text-input"
              />
            </div>

            {(formData.question_type === "single" || formData.question_type === "multi") && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                      <span className="flex-1 text-sm">{option.label} ({option.value})</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    placeholder="Value (e.g., option1)"
                    value={newOption.value}
                    onChange={(e) => setNewOption({...newOption, value: e.target.value})}
                    data-testid="option-value-input"
                  />
                  <Input
                    placeholder="Label (e.g., Option 1)"
                    value={newOption.label}
                    onChange={(e) => setNewOption({...newOption, label: e.target.value})}
                    data-testid="option-label-input"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddOption}
                  className="w-full"
                  data-testid="add-option-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <Label className="font-medium">Mandatory Question</Label>
                <p className="text-xs text-slate-600">Users must answer this question</p>
              </div>
              <Switch
                checked={formData.is_mandatory}
                onCheckedChange={(checked) => setFormData({...formData, is_mandatory: checked})}
                data-testid="mandatory-switch"
              />
            </div>

            {formData.question_type === "multi" && (
              <>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <Label className="font-medium">Has Conditional Input</Label>
                    <p className="text-xs text-slate-600">Show text input for specific option</p>
                  </div>
                  <Switch
                    checked={formData.has_conditional_input}
                    onCheckedChange={(checked) => setFormData({...formData, has_conditional_input: checked})}
                    data-testid="conditional-switch"
                  />
                </div>

                {formData.has_conditional_input && (
                  <div className="space-y-2">
                    <Label>Conditional Trigger Option</Label>
                    <Input
                      value={formData.conditional_trigger}
                      onChange={(e) => setFormData({...formData, conditional_trigger: e.target.value})}
                      placeholder="e.g., Others, Relationship issue"
                      data-testid="conditional-trigger-input"
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveQuestion}
                className="bg-green-600 text-white hover:bg-green-700"
                data-testid="save-question-button"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update Question" : "Save Question"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    {question.question_number}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                    {question.question_type === "single" ? "Single Select" : question.question_type === "multi" ? "Multi Select" : "Text Input"}
                  </span>
                  {question.is_mandatory && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-slate-900 font-medium mb-3">{question.question_text}</p>
                {question.options && question.options.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-50 text-slate-700 text-sm rounded-full border">
                        {option.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditQuestion(question)}
                  data-testid={`edit-question-${question.id}`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid={`delete-question-${question.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {questions.length === 0 && !showAddForm && (
          <Card className="p-12 text-center">
            <p className="text-slate-600 mb-4">No questions yet. Add your first question!</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
