"use client";

import { useState } from "react";
import { FormField, Select, TextInput } from "@/components/ui/form-field";

const NEW_PROJECT_VALUE = "__new__";

export function ProjectSelect({
  projects,
  defaultProjectId,
}: {
  projects: { id: string; name: string }[];
  defaultProjectId?: string;
}) {
  const [choice, setChoice] = useState(defaultProjectId ?? "");
  const creatingNew = choice === NEW_PROJECT_VALUE;

  return (
    <FormField label="Project" htmlFor="project_id" hint="Optional. Groups this task under a project umbrella.">
      <Select
        id="project_id"
        name={creatingNew ? undefined : "project_id"}
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
      >
        <option value="">No project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
        <option value={NEW_PROJECT_VALUE}>+ Create new project</option>
      </Select>

      {creatingNew && (
        <TextInput
          name="new_project_name"
          placeholder="New project name"
          maxLength={200}
          required
          autoFocus
          className="mt-2"
        />
      )}
    </FormField>
  );
}
