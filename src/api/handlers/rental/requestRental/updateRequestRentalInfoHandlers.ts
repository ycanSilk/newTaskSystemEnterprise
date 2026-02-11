import { NextResponse } from 'next/server';
import apiClient from '../../../client';
import { UPDATE_REQUEST_RENTAL_INFO_ENDPOINT } from '../../../endpoints/rental';
import { ApiError, handleApiError, createErrorResponse } from '../../../client/errorHandler';
import { UpdateRequestRentalInfoParams, UpdateRequestRentalInfoResponse } from '../../../types/rental/requestRental/updateRequestRentalInfoTypes';

/**
 * 更新求租信息处理函数
 * @param params 更新求租信息的参数
 * @returns NextResponse 响应对象
 */
export async function handleUpdateRequestRentalInfo(params: UpdateRequestRentalInfoParams): Promise<NextResponse> {
  try {
    const response = await apiClient.post<UpdateRequestRentalInfoResponse>(
      UPDATE_REQUEST_RENTAL_INFO_ENDPOINT,
      params
    );
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const apiError: ApiError = handleApiError(error);
    const errorResponse = createErrorResponse(apiError);
    return NextResponse.json(errorResponse, { status: apiError.status });
  }
}
