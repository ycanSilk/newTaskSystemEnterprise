'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ApplicationItem } from '@/app/types/rental/requestRental/getApplyedRequestRentalInfoListTypes';

import { ReviewApplicationRequest, ReviewApplicationResponse } from '@/app/types/rental/requestRental/reviewAppliedRequestRentalInfoTypes';

// 客户端组件
const MyApplicationsPage = () => {
  // 选中的图片URL，用于放大查看
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // 申请列表数据
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(true);
  // 分页信息
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  // 筛选状态
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);

  // 获取申请列表数据函数
  const fetchApplications = async () => {
    setLoading(true);
    try {
      // 调用API获取数据，传入当前页码、每页条数、my=1参数和筛选状态
      let url = `/api/rental/requestRental/getApplyedRequestRentalInfoList?page=${currentPage}&page_size=${pageSize}&my=1`;
      if (filterStatus !== undefined) {
        url += `&status=${filterStatus}`;
      }
      console.log('API调用URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('获取申请列表响应:', data);
      
      // 检查响应是否成功
      if (data.success === true && data.data) {
        setApplications(data.data.list);
        setTotal(data.data.total);
        setPageSize(data.data.page_size);
      } else {
        console.error('API响应不符合预期，未设置数据:', data);
      }
    } catch (error) {
      console.error('获取申请列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取申请列表数据
  useEffect(() => {
    fetchApplications();
  }, [currentPage, pageSize, filterStatus]);

  // 根据订单状态返回对应的样式类名
  const getOrderStatusClass = (statusText: string): string => {
    switch (statusText) {
      case '待审核':
        return 'bg-green-500 text-white';
      case '已通过':
        return 'bg-blue-500 text-white';
      case '已拒绝':
        return 'bg-red-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };



  return (
    <div className=" bg-gray-200">
      {/* 主内容区域 */}
      <div className="max-w-4xl mx-auto">
        {/* 状态筛选按钮 */}
        <div 
          className="flex gap-4 overflow-x-auto h-16 tab-container bg-white"
          style={{ 
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE and Edge */
            WebkitOverflowScrolling: 'touch' /* iOS */
          }}
        >
          {/* 隐藏滚动条的样式 */}
          <style jsx global>{`
            .tab-container::-webkit-scrollbar {
              display: none; /* Chrome, Safari and Opera */
            }
          `}</style>
          <button
            key="all"
            onClick={() => {
              console.log('切换到全部');
              setFilterStatus(undefined);
            }}
            className={`py-2 px-3 whitespace-nowrap relative ${filterStatus === undefined ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
          >
            全部
            {filterStatus === undefined && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            key="0"
            onClick={() => {
              console.log('切换到待审核');
              setFilterStatus(0);
            }}
            className={`py-2 px-3 whitespace-nowrap relative ${filterStatus === 0 ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
          >
            待审核
            {filterStatus === 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            key="1"
            onClick={() => {
              console.log('切换到已通过');
              setFilterStatus(1);
            }}
            className={`py-2 px-3 whitespace-nowrap relative ${filterStatus === 1 ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
          >
            已通过
            {filterStatus === 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            key="2"
            onClick={() => {
              console.log('切换到已驳回');
              setFilterStatus(2);
            }}
            className={`py-2 px-3 whitespace-nowrap relative ${filterStatus === 2 ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
          >
            已驳回
            {filterStatus === 2 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>
        
        {/* 申请列表 */}
        <div className="space-y-2 p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无申请记录</p>
            </div>
          ) : (
            applications.map((application) => ( 
              <div 
                key={application.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
              >
                {/* 申请卡片内容 */}
                <div className="p-4">
                  {/* 申请基本信息 */}
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{application.demand_title}</h2>
                      <div className="text-sm">申请时间: {application.created_at}</div>
                      <span className={`text-center px-2 py-1 rounded-full text-sm font-medium ${getOrderStatusClass(application.status_text)}`}>
                        {application.status_text}
                      </span>
                    </div>
                  </div>
                  {/* 账号信息描述 */}
                  <div className="text-sm">
                    <p>账号信息：{application.application_json?.description || ''}</p>                  
                    <p>{application.relation_text}</p>
                    <p>出租天数：{application.application_json.days || '未填写'}</p>
                  </div>
                  
                  {/* 是否允许续租 */}
                  <div className="">
                    <span className={`px-3 py-1 rounded-full text-sm ${application.allow_renew === 1 ? 'bg-green-500 text-white' : 'bg-red-100 text-red-600'}`}>
                      {application.allow_renew === 1 ? '续租' : '不续租'}
                    </span>
                  </div>
                  
                  {/* 审核信息 */}
                  {(application.status !== 0) && (
                    <div className="">
                      {application.reviewed_at && (
                        <p className="text-sm mt-1">
                          审核时间: {application.reviewed_at}
                        </p>
                      )}
                      {application.review_remark && (
                        <div className="mt-1 bg-red-100 p-2 rounded-md text-red-600">
                          <h3 className="text-sm font-medium  mb-1">审核备注:</h3>
                          <p className="text-sm">{application.review_remark}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 截图预览 - 一行最多3张，尺寸100*100 */}
                  <div className=" mt-1">
                    <h3 className="text-sm font-medium">账号截图:</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {application.application_json.screenshots.map((img, index) => (
                        <div 
                          key={index} 
                          className="w-24 h-24 cursor-pointer border border-gray-200 rounded-md overflow-hidden transition-all hover:border-blue-400 hover:scale-105"
                          onClick={() => setSelectedImage(img)}
                        >
                          <img 
                            src={img} 
                            alt={`截图 ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
          
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* 分页 */}
        <div className=" pb-20  flex justify-center">
          <div className="flex items-center space-x-2">
            {/* 上一页按钮 */}
            <Button 
              variant="ghost" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              上一页
            </Button>
            
            {/* 页码按钮 */}
            {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((page) => (
              <Button 
                key={page}
                variant={currentPage === page ? "primary" : "ghost"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            {/* 下一页按钮 */}
            <Button 
              variant="ghost" 
              disabled={currentPage === Math.ceil(total / pageSize)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
      
      {/* 图片放大预览模态框 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full z-10 w-8 h-8 hover:bg-opacity-70 transition-colors flex items-center justify-center"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="放大预览"
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MyApplicationsPage;