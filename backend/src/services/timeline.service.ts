import prisma from "../lib/prisma";

interface TimelineInput {
  leadId: number;
  type: string;
  title: string;
  description?: string;
  createdBy?: string;
}

export async function createTimeline(
  data: TimelineInput
) {
  return await prisma.leadTimeline.create({
    data,
  });
}