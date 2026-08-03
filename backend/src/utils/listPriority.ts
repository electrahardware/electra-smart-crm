export const NO_REQUIREMENT_LIST_PRIORITY = 999999;

export function getListPriority(status?: string | null): number {
  return status?.trim() === "No Requirement" ? NO_REQUIREMENT_LIST_PRIORITY : 0;
}
