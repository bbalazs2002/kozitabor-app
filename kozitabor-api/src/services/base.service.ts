import { prisma } from '../lib/prisma.js';

export const createBaseService = <T>(modelDelegate: any) => ({
  async getAll(options: any = {}) {
    return await modelDelegate.findMany(options);
  },
  async getById(id: number, include?: any) {
    return await modelDelegate.findUnique({ 
      where: { id }, 
      include 
    });
  },
  async create(data: any, include?: any) {
    return await modelDelegate.create({ 
      data, 
      include 
    });
  },
  async update(id: number, data: any, include?: any) {
    return await modelDelegate.update({
      where: { id },
      data,
      include
    });
  },
  async reorder(ids: number[], orderField: string = 'ordering') {
    return await prisma.$transaction(
      ids.map((id, index) =>
        modelDelegate.update({
          where: { id },
          data: { [orderField]: index + 1 },
        })
      )
    );
  },
  async delete(id: number) {
    return await modelDelegate.delete({ 
      where: { id } 
    });
  }
});

// Használat:
export const InfoService = createBaseService(prisma.info);
export const ContactService = createBaseService(prisma.contact);