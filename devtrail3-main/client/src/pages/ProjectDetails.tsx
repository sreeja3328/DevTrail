import { useRoute, useLocation } from "wouter";
import { useProject, useDeleteProject } from "@/hooks/use-projects";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProjectDetails() {
  const [, params] = useRoute("/projects/:id");
  const [, navigate] = useLocation();

  const projectId = params?.id ? Number(params.id) : undefined;

  // const { data: project, isLoading } = useProject(projectId as number);
  const [project, setProject] = useState<any>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  if (!projectId) return;

  fetch(`/api/projects/${projectId}`, {
    credentials: "include",
  })
    .then(res => res.json())
    .then(data => {
      console.log("DIRECT FETCH DATA:", data);
      setProject(data);
      setIsLoading(false);
    });
}, [projectId]);

  const deleteProject = useDeleteProject();

 

  const handleDelete = async () => {
  console.log("DELETE CLICKED", projectId);
  await deleteProject.mutateAsync(projectId!);
  navigate("/projects");
};

  if (!projectId || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Project not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />

      <main className="flex-1 ml-20 md:ml-64 p-6 max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/projects")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row justify-between items-start">
            <CardTitle className="text-2xl">
              {project.name || "Untitled Project"}
            </CardTitle>

            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {project.description || "No description provided."}
            </p>

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Github className="w-4 h-4" />
                View Repository
              </a>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
