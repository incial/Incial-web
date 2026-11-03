'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const UNAUTHORIZED = { success: false, error: 'Unauthorized' } as const;

/**
 * Server actions are public POST endpoints, so every mutation must verify the
 * admin session itself — the /admin middleware does not cover direct calls.
 */
async function isAdmin(): Promise<boolean> {
  return Boolean(await auth());
}

function revalidateServices() {
  revalidatePath('/admin/services');
  revalidatePath('/services');
}

export async function getServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: services };
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return { success: false, error: 'Failed to fetch services' };
  }
}

export async function createService(data: {
  title: string;
  description: string;
  isFree: boolean;
  price?: number | null;
}) {
  if (!(await isAdmin())) return UNAUTHORIZED;

  try {
    const service = await prisma.service.create({ data });
    revalidateServices();
    return { success: true, data: service };
  } catch (error) {
    console.error('Failed to create service:', error);
    return { success: false, error: 'Failed to create service' };
  }
}

export async function updateService(
  id: string,
  data: {
    title?: string;
    description?: string;
    isFree?: boolean;
    price?: number | null;
  }
) {
  if (!(await isAdmin())) return UNAUTHORIZED;

  try {
    const service = await prisma.service.update({ where: { id }, data });
    revalidateServices();
    return { success: true, data: service };
  } catch (error) {
    console.error(`Failed to update service with id ${id}:`, error);
    return { success: false, error: 'Failed to update service' };
  }
}

export async function deleteService(id: string) {
  if (!(await isAdmin())) return UNAUTHORIZED;

  try {
    await prisma.service.delete({ where: { id } });
    revalidateServices();
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete service with id ${id}:`, error);
    return { success: false, error: 'Failed to delete service' };
  }
}
