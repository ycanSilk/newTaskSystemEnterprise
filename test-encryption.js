// 测试加密和解密功能
const { encryptData, decryptData } = require('./src/lib/userEncryption');

// 测试数据
const testUser = {
  user_id: 123,
  username: 'testuser',
  email: 'test@example.com',
  phone: '13800138000',
  organization_name: '测试组织',
  organization_leader: '测试负责人',
  role: 'publisher',
  token: 'test-token-123',
  cachedAt: Date.now(),
  balance: 100.50
};

console.log('原始用户数据:', testUser);

// 加密数据
const encryptedData = encryptData(testUser);
console.log('\n加密后的数据:', encryptedData);
console.log('\n加密后的数据长度:', encryptedData.length);

// 解密数据
const decryptedData = decryptData(encryptedData);
console.log('\n解密后的数据:', decryptedData);

// 验证解密后的数据是否与原始数据一致
console.log('\n验证结果:');
console.log('user_id匹配:', testUser.user_id === decryptedData.user_id);
console.log('username匹配:', testUser.username === decryptedData.username);
console.log('email匹配:', testUser.email === decryptedData.email);
console.log('phone匹配:', testUser.phone === decryptedData.phone);
console.log('balance匹配:', testUser.balance === decryptedData.balance);

// 测试不同类型的数据
const testData = {
  string: '测试字符串',
  number: 12345,
  boolean: true,
  nullValue: null,
  undefinedValue: undefined,
  array: [1, 2, 3, 4, 5],
  nestedObject: {
    key1: 'value1',
    key2: 123,
    key3: { nested: 'object' }
  }
};

console.log('\n\n测试不同类型的数据:');
console.log('原始数据:', testData);

const encryptedTestData = encryptData(testData);
console.log('\n加密后:', encryptedTestData);

const decryptedTestData = decryptData(encryptedTestData);
console.log('\n解密后:', decryptedTestData);

console.log('\n测试完成！');