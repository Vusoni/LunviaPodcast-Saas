import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { ProjectsList } from "@/components/projects/projects-list";
import { api } from "@/convex/_generated/api";

export default async function ProjectsPage() {
  const { userId } = await auth();

  // Redirect if not authenticated (shouldn't happen with middleware, but for safety)
  if (!userId) {
    redirect("/");
  }

  // Preload projects data on the server
  const preloadedProjects = await preloadQuery(api.projects.listUserProjects, {
    userId,
  });

  return <ProjectsList preloadedProjects={preloadedProjects} />;
}
