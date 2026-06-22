import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useEntries } from "@/hooks/use-entries";
import { Navigation } from "@/components/Navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Link as LinkIcon, CalendarDays, Loader2, Pencil } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, isLoading, updateBio, isUpdatingBio } = useAuth();
  const { data: entries } = useEntries();
  const { toast } = useToast();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");

  useEffect(() => {
    setBioDraft(user?.bio ?? "");
  }, [user?.bio]);

  const handleSaveBio = async () => {
    const ok = await updateBio(bioDraft.trim());

    if (!ok) {
      toast({
        title: "Unable to save bio",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bio updated",
      description: "Your profile bio was saved.",
    });
    setIsEditingBio(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Calculate top skills from tags
  const allTags = entries?.flatMap(e => e.tags || []) || [];
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topSkills = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([tag]) => tag);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-primary/25 via-cyan-400/20 to-amber-300/25 rounded-3xl border border-border"></div>
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
                {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
                <AvatarFallback className="text-4xl bg-primary/20 text-primary">
                  {user?.firstName?.[0] || <User />}
                </AvatarFallback>
              </Avatar>
              <div className="mb-4">
                <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
                <p className="text-muted-foreground">@{user?.email?.split('@')[0]}</p>
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" /> Earth
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <LinkIcon className="w-4 h-4" /> devtrail.app
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" /> Joined {format(new Date(), 'MMMM yyyy')}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Top Skills</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {topSkills.length > 0 ? topSkills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {skill}
                    </Badge>
                  )) : (
                    <p className="text-sm text-muted-foreground">No skills tracked yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">About</h2>
                  {!isEditingBio && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-accent/60"
                      onClick={() => setIsEditingBio(true)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingBio ? (
                  <div className="space-y-3">
                    <Textarea
                      value={bioDraft}
                      onChange={(e) => setBioDraft(e.target.value)}
                      placeholder="Tell people a little about yourself..."
                      maxLength={300}
                      className="min-h-[120px] bg-background/60 border-border"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        {bioDraft.length}/300
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setBioDraft(user?.bio ?? "");
                            setIsEditingBio(false);
                          }}
                          disabled={isUpdatingBio}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSaveBio}
                          disabled={isUpdatingBio}
                        >
                          {isUpdatingBio ? "Saving..." : "Save Bio"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : user?.bio ? (
                  <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    No bio yet.
                  </p>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Activity Heatmap</h2>
                <div className="h-32 flex items-center justify-center text-muted-foreground bg-secondary/60 rounded-xl border border-border border-dashed">
                  Activity graph placeholder
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

