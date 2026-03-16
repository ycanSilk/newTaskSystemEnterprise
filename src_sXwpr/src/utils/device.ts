// 只在客户端环境中导入FingerprintJS
let FingerprintJS: any = null;
let fpPromise: any = null;

// 延迟导入，确保只在客户端环境中执行
if (typeof window !== 'undefined') {
  import('@fingerprintjs/fingerprintjs').then(module => {
    FingerprintJS = module.default;
    fpPromise = FingerprintJS.load();
  });
}

export async function getDeviceId(): Promise<string> {
  if (typeof window === 'undefined' || !FingerprintJS) {
    // 在服务器端环境中，返回一个临时的设备ID
    return 'server-side-device-id';
  }
  
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}

export function getDeviceName(): string {
  if (typeof window === 'undefined') {
    // 在服务器端环境中，返回一个临时的设备名称
    return 'Server Side Device';
  }
  return navigator.userAgent;
}

export async function getDeviceInfo() {
  return {
    device_id: await getDeviceId(),
    device_name: getDeviceName()
  };
}
