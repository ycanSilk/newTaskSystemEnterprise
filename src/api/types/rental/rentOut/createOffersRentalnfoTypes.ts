/*

title	string	是	出租标题
price_per_day	int	是	每日租金（分）
min_days	int	否	最少租期（默认1天）
max_days	int	否	最长租期（默认30天）
allow_renew	int	否	是否允许续租：0=否，1=是（默认1）
content_json	object	否	详细信息JSON


*/ 


// 创建出租报价请求数据类型
export interface CreateOffersRentalInfoRequest {
  title: string;
  price_per_day: number;
  min_days: number;
  max_days: number;
  allow_renew: 0 | 1;       //是否允许续租：0=否，1=是（默认1）
  content_json: {
    account_info: string;
    capabilities: string[];
    login_method: string;
    contact: string;
    images: string[];
  };
}

// 创建出租报价响应数据类型
export interface CreateOffersRentalInfoResponseData {
  offer_id: string;
  title: string;
  price_per_day: number;
  min_days: number;
  max_days: number;
  allow_renew: 0 | 1;
  status: number;
}

// 创建出租报价API响应类型
export interface CreateOffersRentalInfoResponse {
  code: number;
  message: string;
  data: CreateOffersRentalInfoResponseData;
  timestamp: number;
}