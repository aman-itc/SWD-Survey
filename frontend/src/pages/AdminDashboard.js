import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { LogOut, Download, BarChart3, FileText, TrendingUp, Loader2, Filter } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [filters, setFilters] = useState({
    branch: "",
    section: "",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchData();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API}/branches`);
      setBranches(response.data.branches);
    } catch (error) {
      console.error("Failed to load branches");
    }
  };

  const fetchSections = async (branch) => {
    try {
      const response = await axios.get(`${API}/sections/${branch}`);
      setSections(response.data.sections);
    } catch (error) {
      console.error("Failed to load sections");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.branch) params.append("branch", filters.branch);
      if (filters.section) params.append("section", filters.section);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      const [responsesRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/responses?${params.toString()}`),
        axios.get(`${API}/admin/stats`)
      ]);

      setResponses(responsesRes.data.responses);
      setStats(statsRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    if (field === "branch" && value) {
      fetchSections(value);
      setFilters({ ...filters, branch: value, section: "" });
    }
  };

  const applyFilters = () => {
    fetchData();
  };

  const clearFilters = () => {
    setFilters({ branch: "", section: "", start_date: "", end_date: "" });
    setSections([]);
    fetchData();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.branch) params.append("branch", filters.branch);
      if (filters.section) params.append("section", filters.section);

      const response = await axios.get(`${API}/admin/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'survey_responses.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful!");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    navigate("/");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ITC Survey Dashboard</h1>
            <p className="text-sm text-slate-300">Admin Panel</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-white hover:bg-slate-800"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Responses</h3>
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900" data-testid="total-responses">{stats.total_responses}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent (7 Days)</h3>
                <TrendingUp className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900" data-testid="recent-responses">{stats.recent_responses}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Branches Covered</h3>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats.responses_by_branch.length}</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Branch</Label>
              <Select value={filters.branch} onValueChange={(value) => handleFilterChange("branch", value)}>
                <SelectTrigger data-testid="filter-branch">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Section</Label>
              <Select 
                value={filters.section} 
                onValueChange={(value) => setFilters({...filters, section: value})}
                disabled={!filters.branch}
              >
                <SelectTrigger data-testid="filter-section">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sections</SelectItem>
                  {sections.map(section => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Start Date</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                data-testid="filter-start-date"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">End Date</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                data-testid="filter-end-date"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={applyFilters}
              className="bg-slate-900 text-white hover:bg-slate-800"
              data-testid="apply-filters-button"
            >
              Apply Filters
            </Button>
            <Button 
              onClick={clearFilters}
              variant="outline"
              data-testid="clear-filters-button"
            >
              Clear Filters
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="ml-auto"
              data-testid="export-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </Card>

        {/* Responses Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Survey Responses ({responses.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Branch</TableHead>
                  <TableHead className="font-bold">Section</TableHead>
                  <TableHead className="font-bold">Customer ID</TableHead>
                  <TableHead className="font-bold">Customer Name</TableHead>
                  <TableHead className="font-bold">Q1</TableHead>
                  <TableHead className="font-bold">Q2</TableHead>
                  <TableHead className="font-bold">Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                      No responses found
                    </TableCell>
                  </TableRow>
                ) : (
                  responses.map((response, index) => (
                    <TableRow key={response.id || index} className="hover:bg-slate-50/50" data-testid={`response-row-${index}`}>
                      <TableCell className="font-medium">{response.branch}</TableCell>
                      <TableCell>{response.section_code}</TableCell>
                      <TableCell className="text-xs font-mono">{response.dms_customer_id}</TableCell>
                      <TableCell>{response.dms_customer_name}</TableCell>
                      <TableCell className="text-sm">{response.q1_itc_biscuits_sales}</TableCell>
                      <TableCell className="text-sm">{response.q2_total_biscuits_sales}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(response.submitted_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
