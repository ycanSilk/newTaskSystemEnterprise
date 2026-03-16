import { NextRequest } from 'next/server';
import { addCommentToLibraryHandler } from '@/api/handlers/task/addCommentToLibraryHandler';

export async function POST(request: NextRequest) {
  return addCommentToLibraryHandler(request);
}
