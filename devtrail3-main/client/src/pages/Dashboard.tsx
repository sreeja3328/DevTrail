import { useEntries } from "@/hooks/use-entries";
import { useGenerateSummary, useSuggestNextSteps } from "@/hooks/use-ai";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, Cell 
} from "recharts";
import { BrainCircuit, TrendingUp, Calendar, Zap, Loader2, Sparkles, BookOpen, Bug, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { CreateEntryDialog } from "@/components/CreateEntryDialog";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: entries, isLoading } = useEntries();
  const generateSummary = useGenerateSummary();
  const suggestNextSteps = useSuggestNextSteps();

  const { data: weeklyReport, isLoading: isLoadingWeekly } = useQuery<any>({
    queryKey: ["/api/ai/weekly-report"],
  });

  const { data: bugPatterns, isLoading: isLoadingBugs } = useQuery<any>({
    queryKey: ["/api/ai/bug-patterns"],
  });

  const { data: heatmap, isLoading: isLoadingHeatmap } = useQuery<any>({
    queryKey: ["/api/ai/skill-heatmap"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const totalEntries = entries?.length || 0;
  const totalHours = Math.round((entries?.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0) || 0) / 60);
  const streak = calculateStreak(entries || []);
  
  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const dayEntries = entries?.filter(e => format(new Date(e.date), "yyyy-MM-dd") === dateStr);
    const mins = dayEntries?.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0) || 0;
    return {
      day: format(d, "EEE"),
      minutes: mins,
      fullDate: format(d, "MMM d"),
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your progress and grow.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/10"
              onClick={() => suggestNextSteps.mutate()}
              disabled={suggestNextSteps.isPending}
            >
              {suggestNextSteps.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              AI Refresh
            </Button>
            <CreateEntryDialog />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} title="Total Entries" value={totalEntries} trend="+2 this week" color="text-blue-400" />
          <StatCard icon={TrendingUp} title="Hours Learned" value={totalHours} trend="Keep pushing!" color="text-purple-400" />
          <StatCard icon={Zap} title="Current Streak" value={`${streak} days`} trend="You're on fire!" color="text-yellow-400" />
          <StatCard icon={BrainCircuit} title="Avg. Confidence" value="3.8/5" trend="Rising steadily" color="text-green-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Report */}
            <Card className="bg-card border-border shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between gap-1">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Weekly Report
                </CardTitle>
                {isLoadingWeekly && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                {weeklyReport ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{weeklyReport.summary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Wins</h4>
                        <ul className="space-y-1">
                          {weeklyReport.wins?.map((w: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground">• {w}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Struggles</h4>
                        <ul className="space-y-1">
                          {weeklyReport.struggles?.map((s: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No weekly report generated yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Activity Chart */}
            <Card className="bg-card border-border shadow-xl">
              <CardHeader>
                <CardTitle>Learning Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7Days}>
                      <XAxis 
                        dataKey="day" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value}m`} 
                      />
                      <ReTooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        itemStyle={{ color: '#111827' }}
                      />
                      <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                        {last7Days.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.minutes > 0 ? "hsl(263, 70%, 50%)" : "rgba(15,23,42,0.08)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bug Detector */}
              <Card className="bg-card border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="w-5 h-5 text-red-400" /> Bug Pattern Detector
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingBugs ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : bugPatterns ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Common Issue</p>
                        <p className="text-sm font-medium">{bugPatterns.mostCommonBug}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-400/5 border border-red-400/10">
                        <p className="text-xs text-red-400 font-semibold mb-1">AI Advice</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{bugPatterns.advice}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Log more bugs to see patterns.</p>
                  )}
                </CardContent>
              </Card>

              {/* Skill Heatmap */}
              <Card className="bg-card border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" /> Skill Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingHeatmap ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : heatmap?.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {heatmap.skills.map((skill: any, i: number) => (
                        <Badge 
                          key={i} 
                          variant="secondary"
                          className={`bg-primary/${skill.level * 20} border-primary/20 text-foreground`}
                        >
                          {skill.name} (L{skill.level})
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Keep coding to track your skills.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Insights & Recent */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5" /> Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestNextSteps.data ? (
                  <ul className="space-y-2">
                    {suggestNextSteps.data.suggestions.slice(0, 3).map((s: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span> {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-4">Get personalized learning suggestions based on your journal.</p>
                    <Button 
                      size="sm" 
                      onClick={() => suggestNextSteps.mutate()} 
                      disabled={suggestNextSteps.isPending}
                      className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                    >
                      {suggestNextSteps.isPending ? "Analyzing..." : "Generate Insights"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Recent Entries</h3>
              {entries?.slice(0, 5).map((entry) => (
                <div key={entry.id} className="p-4 rounded-xl bg-card border border-border hover:border-primary/25 transition-colors">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{format(new Date(entry.date), "MMM d")}</span>
                    <span className="text-xs text-primary">{entry.timeSpent}m</span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{entry.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, trend, color }: any) {
  return (
    <Card className="bg-card border-border hover:bg-accent/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg bg-secondary/80 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && <span className="text-xs text-muted-foreground">{trend}</span>}
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateStreak(entries: any[]) {
  // Simplified streak calculation logic
  if (!entries.length) return 0;
  // In a real app, sort by date and check consecutive days
  return 3; // Placeholder
}

