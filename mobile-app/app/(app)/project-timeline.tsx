import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ProjectTimelineScreen } from "../../src/screens/vendor/ProjectTimelineScreen";

export default function ProjectTimelineRoute() {
  const params = useLocalSearchParams<{ id?: string; projectId?: string }>();
  const rawId = params.id || params.projectId;
  const projectId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : undefined;

  return <ProjectTimelineScreen projectId={projectId} />;
}
