import { Prisma } from '@prisma/client';

export const softDeleteExtension = (client: any) => client.$extends({
    name: 'softDelete',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: { model: string, operation: string, args: any, query: (args: any) => Promise<any> }) {
          // Define models that support soft-delete
          const softDeleteModels = ['User', 'Organization', 'Member', 'Project', 'Issue', 'Comment'];
          
          if (!softDeleteModels.includes(model)) {
            return query(args);
          }

          // Read operations: automatically filter out deleted items
          if (
            ['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'aggregate', 'groupBy'].includes(
              operation,
            )
          ) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          }

          // Point-lookup operations: check status AFTER fetch
          if (
            ['findUnique', 'findUniqueOrThrow'].includes(operation)
          ) {
            const result = await query(args);
            if (result && (result as any).deletedAt) {
              if (operation === 'findUnique') return null;
              throw new Error(`Record not found in ${model} (Soft-deleted)`);
            }
            return result;
          }

          // Delete operations: convert to updates
          // We use the client to redirect these to 'update'
          if (operation === 'delete') {
            const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
            return (client as any)[modelKey].update({
              ...args,
              data: { deletedAt: new Date() },
            });
          }

          if (operation === 'deleteMany') {
            const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
            return (client as any)[modelKey].updateMany({
              ...args,
              data: { deletedAt: new Date() },
            });
          }

          return query(args);
        },
      },
    },
  });
