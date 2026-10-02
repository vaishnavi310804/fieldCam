import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ProjectTimelineScreen } from "../../src/screens/vendor/ProjectTimelineScreen";

export default function ProjectTimelineRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const projectId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;

  return <ProjectTimelineScreen projectId={projectId} />;
}
