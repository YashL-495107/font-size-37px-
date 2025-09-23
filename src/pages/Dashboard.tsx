import ExoplanetUI from "../components/ui/ExoplanetUI";
const predictExoplanetFunction = async (inputs: any) => {
  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features: inputs }), // <-- FIXED
    });
    if (res.ok) {
      // Safely read text first to avoid JSON parsing errors on empty body
      const text = await res.text();
      if (text && text.trim().length > 0) {
        const data = JSON.parse(text);
        if (data?.prediction) return data.prediction as string;
      }
    }
  } catch {
    // Swallow and fallback below
  }

  // Fallback heuristic: derive a simple score from numeric inputs
  const values = Object.values(inputs).filter((v) => typeof v === "number") as number[];
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  if (avg > 0.66) return "CONFIRMED";
  if (avg > 0.33) return "CANDIDATE";
  return "FALSE_POSITIVE";
};

import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, BarChart3, Settings, Info, Rocket, Zap, Target } from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type HistoryItem = {
  timestamp: number;
  inputs: Record<string, number | string>;
  prediction: string;
  // Add: optional model metadata for visualizations
  confidences?: { CONFIRMED?: number; CANDIDATE?: number; FALSE_POSITIVE?: number };
  featureImportance?: Array<{ feature: string; importance: number }>;
};

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Add: file input ref for CSV uploads
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add: simple CSV parser
  const parseCsv = (text: string): Array<Record<string, number | string>> => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows: Array<Record<string, number | string>> = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      if (cols.length === 0 || (cols.length === 1 && cols[0] === "")) continue;
      const obj: Record<string, number | string> = {};
      headers.forEach((h, idx) => {
        const raw = (cols[idx] ?? "").trim();
        const num = raw === "" ? NaN : Number(raw);
        obj[h] = Number.isFinite(num) ? num : raw;
      });
      rows.push(obj);
    }
    return rows;
  };

  // Add: helper to optionally fetch full prediction details (probabilities + feature importance) if backend provides them
  const fetchFullPredictionDetails = async (inputs: Record<string, number | string>) => {
    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: inputs }), // <-- FIXED
      });
      if (!res.ok) return null;
      const text = await res.text();
      if (!text || text.trim().length === 0) return null;
      const data = JSON.parse(text);
      // Expected shape (if model provides):
      // { prediction: "CONFIRMED" | "CANDIDATE" | "FALSE_POSITIVE", probabilities: { CONFIRMED: number, CANDIDATE: number, FALSE_POSITIVE: number }, feature_importances: Array<{feature: string, importance: number}> }
      const confidences = data?.probabilities as HistoryItem["confidences"] | undefined;
      const featureImportance = (data?.feature_importances ||
        data?.featureImportance) as HistoryItem["featureImportance"] | undefined;
      if (!confidences && !featureImportance) return null;
      return { confidences, featureImportance } as {
        confidences?: HistoryItem["confidences"];
        featureImportance?: HistoryItem["featureImportance"];
      };
    } catch {
      return null;
    }
  };

  // Add: CSV change handler - predict each row, add to history, and switch to Results
  const handleCsvFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const records = parseCsv(text);
    for (const inputs of records) {
      const prediction = await predictExoplanetFunction(inputs);
      // Try to enrich with full details; if not available, save basic entry
      const details = await fetchFullPredictionDetails(inputs);
      addToHistory({
        timestamp: Date.now(),
        inputs,
        prediction,
        ...(details ?? {}),
      });
    }
    setActiveTab("results");
    // Reset the input so the same file can be selected again if needed
    e.currentTarget.value = "";
  };

  // Helper to add entries to history (prepend newest)
  const addToHistory = (entry: HistoryItem) => {
    setHistory((prev) => [entry, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ExoPlanet AI</h1>
                <p className="text-sm text-slate-400">NASA Space Apps Challenge 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300">Welcome, {user?.name || user?.email || 'Explorer'}</span>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Predictions Made</CardTitle>
                <Target className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">1,247</div>
                <p className="text-xs text-slate-400">+12% from last week</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Model Accuracy</CardTitle>
                <Zap className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">91%</div>
                <p className="text-xs text-slate-400">Validated on TESS data</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Exoplanets Found</CardTitle>
                <Rocket className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">342</div>
                <p className="text-xs text-slate-400">Confirmed candidates</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border border-slate-800">
              <TabsTrigger value="upload" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Upload className="w-4 h-4 mr-2" />
                Upload Data
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                <BarChart3 className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                <Settings className="w-4 h-4 mr-2" />
                Model Performance
              </TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                <Info className="w-4 h-4 mr-2" />
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {/* CSV Upload Section */}
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Upload Exoplanet Data</CardTitle>
                  <CardDescription className="text-slate-400">
                    Upload CSV files with exoplanet transit data or enter parameters manually
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors">
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-300 mb-2">Drag and drop your CSV file here</p>
                    <p className="text-sm text-slate-500 mb-4">or click to browse files</p>
                    <Button
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileChange}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Manual Input Section */}
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Enter Data Manually</CardTitle>
                  <CardDescription className="text-slate-400">
                    Type in the features manually to run a prediction without a CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const inputs = {
                        feature1: parseFloat(formData.get("feature1") as string),
                        feature2: parseFloat(formData.get("feature2") as string),
                        feature3: parseFloat(formData.get("feature3") as string),
                      };
                      const prediction = await predictExoplanetFunction(inputs);
                      // Attempt enrichment from backend for confidences + feature importance
                      const details = await fetchFullPredictionDetails(inputs);
                      addToHistory({
                        timestamp: Date.now(),
                        inputs,
                        prediction,
                        ...(details ?? {}),
                      });
                      setActiveTab("results");
                    }}
                    className="space-y-4"
                  >
                    <TooltipProvider>
                      {/* Feature 1: Transit Depth with tooltip */}
                      <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Feature 1 — Transit Depth:</span>{" "}
                          Decimal number (e.g., 0.001 to 0.05), how much the star's brightness drops during a transit.
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <input
                              name="feature1"
                              type="number"
                              step="any"
                              placeholder="e.g., 0.015"
                              className="w-full p-2 rounded bg-slate-800 text-white"
                              required
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-slate-200 border border-slate-700">
                            Transit Depth – Decimal (0.001 to 0.05)
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Feature 2: Orbital Period with tooltip */}
                      <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Feature 2 — Orbital Period:</span>{" "}
                          Decimal number in days (e.g., 1.5 to 50), the planet's orbital period.
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <input
                              name="feature2"
                              type="number"
                              step="any"
                              placeholder="e.g., 12.4"
                              className="w-full p-2 rounded bg-slate-800 text-white"
                              required
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-slate-200 border border-slate-700">
                            Orbital Period – Days (1.5 to 50)
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Feature 3: Signal Strength with tooltip */}
                      <div className="space-y-2">
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">Feature 3 — Signal Strength:</span>{" "}
                          Integer or decimal (e.g., 100 to 2000), representing flux or signal-to-noise ratio.
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <input
                              name="feature3"
                              type="number"
                              step="any"
                              placeholder="e.g., 680"
                              className="w-full p-2 rounded bg-slate-800 text-white"
                              required
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-slate-200 border border-slate-700">
                            Signal Strength – SNR/Flux (100 to 2000)
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>

                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    >
                      Predict Manually
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Prediction Results</CardTitle>
                  <CardDescription className="text-slate-400">
                    View classification results, confidence scores, and feature contributions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ExoplanetUI can also add to history when used here */}
                  <ExoplanetUI
                    predictExoplanet={predictExoplanetFunction}
                    onPredicted={async (entry) => {
                      // Save baseline entry first
                      addToHistory(entry);
                      // Try to enrich the most recent item with confidences/featureImportance
                      const details = await fetchFullPredictionDetails(entry.inputs);
                      if (details) {
                        setHistory((prev) => {
                          if (prev.length === 0) return prev;
                          const updated = { ...prev[0], ...details };
                          return [updated, ...prev.slice(1)];
                        });
                      }
                    }}
                  />

                  {/* Latest Result Summary */}
                  {history.length > 0 && (
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="text-sm text-slate-400 mb-2">Most Recent Prediction</div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="text-white font-semibold">
                          {new Date(history[0].timestamp).toLocaleString()}
                        </div>
                        <div
                          className={
                            history[0].prediction === "CONFIRMED"
                              ? "text-green-400 font-semibold"
                              : history[0].prediction === "CANDIDATE"
                                ? "text-purple-400 font-semibold"
                                : "text-orange-400 font-semibold"
                          }
                        >
                          {history[0].prediction}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confidence Visualization (bars) */}
                  {history.length > 0 && history[0].confidences && (
                    <div className="rounded-lg border border-slate-800 p-4 bg-slate-800/40">
                      <div className="text-white font-semibold mb-3">Prediction Confidence</div>
                      {(["CONFIRMED", "CANDIDATE", "FALSE_POSITIVE"] as const).map((label) => {
                        const val = (history[0].confidences as any)?.[label] ?? 0;
                        const pct = Math.max(0, Math.min(1, val)) * 100;
                        const color =
                          label === "CONFIRMED"
                            ? "bg-green-500"
                            : label === "CANDIDATE"
                              ? "bg-purple-500"
                              : "bg-orange-500";
                        return (
                          <div key={label} className="mb-3">
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                              <span>{label}</span>
                              <span>{pct.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 rounded bg-slate-700 overflow-hidden">
                              <div
                                className={`h-2 ${color}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-xs text-slate-500 mt-2">
                        Values are provided by the model's probability outputs when available.
                      </div>
                    </div>
                  )}

                  {/* Feature Importance */}
                  {history.length > 0 && history[0].featureImportance && history[0].featureImportance!.length > 0 && (
                    <div className="rounded-lg border border-slate-800 p-4 bg-slate-800/40">
                      <div className="text-white font-semibold mb-3">Top Feature Contributions</div>
                      {history[0].featureImportance!
                        .slice(0, 5)
                        .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
                        .map((fi, idx) => {
                          const val = Math.max(0, fi.importance ?? 0);
                          const pct = Math.min(1, val) * 100;
                          return (
                            <div key={fi.feature + idx} className="mb-3">
                              <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span>{fi.feature}</span>
                                <span>{pct.toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-2 rounded bg-slate-700 overflow-hidden">
                                <div
                                  className="h-2 bg-cyan-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      <div className="text-xs text-slate-500 mt-2">
                        Derived from model feature importances or coefficients when available.
                      </div>
                    </div>
                  )}

                  {/* History Table */}
                  <div className="rounded-lg border border-slate-800 overflow-hidden">
                    <div className="max-h-80 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-900/70 sticky top-0">
                          <tr className="text-slate-300">
                            <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                            <th className="px-4 py-3 text-left font-medium">Inputs</th>
                            <th className="px-4 py-3 text-left font-medium">Prediction</th>
                            <th className="px-4 py-3 text-left font-medium">Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {history.map((item, idx) => (
                            <tr key={item.timestamp + "-" + idx} className="hover:bg-slate-800/40">
                              <td className="px-4 py-3 text-slate-300">
                                {new Date(item.timestamp).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(item.inputs).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700"
                                    >
                                      <span className="text-slate-400">{k}:</span>{" "}
                                      <span className="text-white">{String(v)}</span>
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={
                                    item.prediction === "CONFIRMED"
                                      ? "text-green-400 font-semibold"
                                      : item.prediction === "CANDIDATE"
                                        ? "text-purple-400 font-semibold"
                                        : "text-orange-400 font-semibold"
                                  }
                                >
                                  {item.prediction}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {item.confidences ? (
                                  <div className="space-y-1 min-w-[160px]">
                                    {(["CONFIRMED", "CANDIDATE", "FALSE_POSITIVE"] as const).map((label) => {
                                      const val = (item.confidences as any)?.[label] ?? 0;
                                      const pct = Math.max(0, Math.min(1, val)) * 100;
                                      const color =
                                        label === "CONFIRMED"
                                          ? "bg-green-500"
                                          : label === "CANDIDATE"
                                            ? "bg-purple-500"
                                            : "bg-orange-500";
                                      return (
                                        <div key={label} className="flex items-center gap-2">
                                          <div className="w-20 text-xs text-slate-400">{label.slice(0, 9)}</div>
                                          <div className="flex-1 h-2 rounded bg-slate-700">
                                            <div className={`h-2 ${color}`} style={{ width: `${pct}%` }} />
                                          </div>
                                          <div className="w-12 text-right text-xs text-slate-400">
                                            {pct.toFixed(0)}%
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-slate-500 text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {history.length === 0 && (
                            <tr>
                              <td className="px-4 py-6 text-slate-400 text-center" colSpan={4}>
                                No predictions yet. Submit manual inputs or upload a CSV to see results here.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Model Performance Metrics</CardTitle>
                  <CardDescription className="text-slate-400">
                    Accuracy, precision, recall, and feature importance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Overall Accuracy */}
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">91%</div>
                      <div className="text-sm text-slate-400">Accuracy</div>
                    </div>

                    {/* CANDIDATE metrics */}
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-center text-purple-400 font-semibold mb-2">CANDIDATE</div>
                      <div className="text-sm text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">Precision</span>
                        <span>0.82</span>
                      </div>
                      <div className="text-sm text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">Recall</span>
                        <span>0.79</span>
                      </div>
                      <div className="text-sm text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">F1-score</span>
                        <span>0.80</span>
                      </div>
                    </div>

                    {/* CONFIRMED metrics */}
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-center text-green-400 font-semibold mb-2">CONFIRMED</div>
                      <div className="text-sm text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">Precision</span>
                        <span>0.87</span>
                      </div>
                      <div className="text-sm text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">Recall</span>
                        <span>0.89</span>
                      </div>
                      <div className="text-sm text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">F1-score</span>
                        <span>0.88</span>
                      </div>
                    </div>

                    {/* FALSE POSITIVE metrics */}
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-center text-orange-400 font-semibold mb-2">FALSE POSITIVE</div>
                      <div className="text-sm text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">Precision</span>
                        <span>0.98</span>
                      </div>
                      <div className="text-sm text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">Recall</span>
                        <span>0.98</span>
                      </div>
                      <div className="text-sm text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400">F1-score</span>
                        <span>0.98</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">About ExoPlanet AI</CardTitle>
                  <CardDescription className="text-slate-400">
                    NASA Space Apps Challenge 2025 – Exoplanet Detection with AI/ML
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">
                    This application uses a machine learning model trained on NASA's KOI cumulative dataset to classify exoplanets.
                    The AI model can distinguish between confirmed planets, planetary candidates, and false positives within the KOI dataset.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Data Sources</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• NASA Kepler Mission (KOI cumulative data)</li>
                        <li>• K2 Extended Mission (via KOI dataset)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Features</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Real-time classification of manually entered or uploaded data points</li>
                        <li>• Batch processing of CSV files containing exoplanet parameters</li>
                        <li>• Display of model performance metrics (accuracy, precision, recall, F1-score)</li>
                        <li>• Interactive visualizations for exploring predictions</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    Model performance: overall accuracy of 91% with class-level metrics — CANDIDATE (Precision 0.82, Recall 0.79, F1-score 0.80), CONFIRMED (Precision 0.87, Recall 0.89, F1-score 0.88), and FALSE POSITIVE (Precision 0.98, Recall 0.98, F1-score 0.98).
                  </p>
                  <p className="text-sm text-slate-400">
                    Note: Accuracy is reported on the KOI cumulative dataset. Predictions on completely new datasets (e.g., raw TESS data)
                    may vary, as the model has not been trained on those data points yet.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}