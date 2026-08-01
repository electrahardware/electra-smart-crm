import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuditLogInput {
  module: string;
  action: string;

  userId?: number;
  userName: string;

  entityId?: number;
  entityName?: string;

  oldValues?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;

  newValues?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;

  ipAddress?: string;
}

export async function createAuditLog(data: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      module: data.module,
      action: data.action,

      userId: data.userId,
      userName: data.userName,

      entityId: data.entityId,
      entityName: data.entityName,

      oldValues:
        data.oldValues === null
          ? Prisma.JsonNull
          : data.oldValues
            ? (JSON.parse(
                JSON.stringify(data.oldValues),
              ) as Prisma.InputJsonValue)
            : undefined,

      newValues:
        data.newValues === null
          ? Prisma.JsonNull
          : data.newValues
            ? (JSON.parse(
                JSON.stringify(data.newValues),
              ) as Prisma.InputJsonValue)
            : undefined,

      ipAddress: data.ipAddress,
    },
  });
}
