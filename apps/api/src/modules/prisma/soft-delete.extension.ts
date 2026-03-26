import { Prisma } from '@prisma/client';

export const softDeleteExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    name: 'softDelete',
    model: {
      $allModels: {
        async delete<T, A>(
          this: T,
          args: Prisma.Exact<A, Prisma.Args<T, 'update'>>,
        ): Promise<Prisma.Result<T, A, 'update'>> {
          const context = Prisma.getExtensionContext(this);
          const castArgs = args as any;
          return (context as any).update({
            ...castArgs,
            data: { deletedAt: new Date() },
          });
        },
        async deleteMany<T, A>(
          this: T,
          args: Prisma.Exact<A, Prisma.Args<T, 'updateMany'>>,
        ): Promise<Prisma.Result<T, A, 'updateMany'>> {
          const context = Prisma.getExtensionContext(this);
          const castArgs = args as any;
          return (context as any).updateMany({
            ...castArgs,
            data: { deletedAt: new Date() },
          });
        },
      },
    },
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Read operations: automatically filter out deleted items
          if (
            ['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'aggregate', 'groupBy'].includes(
              operation,
            )
          ) {
            const castArgs = args as any;
            castArgs.where = { ...castArgs.where, deletedAt: null };
            return query(castArgs);
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

          // For everything else (update, create, upsert, etc.), let it pass through.
          // The business logic will typically handle specific guards.
          return query(args);
        },
      },
    },
  });
});
