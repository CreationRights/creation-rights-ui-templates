"use client";

import React, { createContext, useContext, useState } from "react";
import type { UserRole } from "./mock-data";

interface RoleContextValue {
  role: UserRole;
  setRole: (r: UserRole) => void;
  can: (action: Action) => boolean;
}

type Action =
  | "upload"
  | "edit_metadata"
  | "transition_state"
  | "export"
  | "archive"
  | "bulk_actions"
  | "apply_legal_hold"
  | "add_version"
  | "view_storage_path"
  | "view_ip";

const PERMISSIONS: Record<UserRole, Action[]> = {
  admin: [
    "upload",
    "edit_metadata",
    "transition_state",
    "export",
    "archive",
    "bulk_actions",
    "apply_legal_hold",
    "add_version",
    "view_storage_path",
    "view_ip",
  ],
  manager: [
    "upload",
    "edit_metadata",
    "transition_state",
    "export",
    "archive",
    "bulk_actions",
    "add_version",
  ],
  editor: ["upload", "edit_metadata", "add_version"],
  viewer: [],
  compliance_officer: ["apply_legal_hold", "view_ip"],
};

const RoleContext = createContext<RoleContextValue>({
  role: "admin",
  setRole: () => {},
  can: () => false,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin");
  const can = (action: Action) => PERMISSIONS[role].includes(action);
  return (
    <RoleContext.Provider value={{ role, setRole, can }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
