import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ProjectReportScreen } from "@/src/screens/vendor/ProjectReportScreen";

export default function ProjectReportRoute() {
  const params = useLocalSearchParams<{ id?: string; projectId?: string }>();
  const rawId = params.id || params.projectId;
  const projectId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : undefined;

  return <ProjectReportScreen projectId={projectId} />;
}
