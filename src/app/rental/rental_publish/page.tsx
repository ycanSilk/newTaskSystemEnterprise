import EncryptedLink from '@/components/layout/EncryptedLink';

const AccountRentalPublishPage = () => {
  return (
    <div className="min-h-screen  space-y-3">
      <div className="max-w-4xl mx-auto pt-8">
        {/* 发布账号租赁卡片 */}
        <EncryptedLink href="/rental/rental_publish/rental" className="block mb-6">
          <div className="mb-4 bg-white rounded-lg border border-blue-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">发布出租信息</h3>
                <p className="text-gray-600 mt-1">出租您的社交媒体账号，获得额外收益</p>
            </div>
            <div className="bg-blue-500 text-white w-1/2 px-4 py-2 rounded text-center ml-auto flex items-center justify-center">
              发布 &gt;
            </div>
          </div>
        </EncryptedLink>

        {/* 发布求租信息卡片 */}
        <EncryptedLink href="/rental/rental_publish/requests" className="block">
          <div className="mb-4 bg-white rounded-lg border border-blue-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">发布求租信息</h3>
                <p className="text-gray-600 mt-1">寻找并租用符合您需求的社交媒体账号</p>
            </div>
            <div className="bg-blue-500 text-white w-1/2 py-2 px-5 rounded text-center ml-auto flex items-center justify-center">
                发布 &gt;
            </div>
          </div>
        </EncryptedLink>
      </div>
    </div>
  );
};

export default AccountRentalPublishPage;