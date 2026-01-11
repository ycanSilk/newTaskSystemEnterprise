/*
 Navicat Premium Dump SQL

 Source Server         : douyin
 Source Server Type    : MySQL
 Source Server Version : 80406 (8.4.6)
 Source Host           : localhost:3306
 Source Schema         : microtask_db

 Target Server Type    : MySQL
 Target Server Version : 80406 (8.4.6)
 File Encoding         : 65001

 Date: 04/10/2025 23:06:21
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for mt_admin_role
-- ----------------------------
DROP TABLE IF EXISTS `mt_admin_role`;
CREATE TABLE `mt_admin_role`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `admin_id` bigint NOT NULL COMMENT '管理员ID',
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_admin_role`(`admin_id` ASC, `role_id` ASC) USING BTREE,
  INDEX `fk_admin_role_role`(`role_id` ASC) USING BTREE,
  CONSTRAINT `fk_admin_role_admin` FOREIGN KEY (`admin_id`) REFERENCES `mt_admin_user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_admin_role_role` FOREIGN KEY (`role_id`) REFERENCES `mt_role` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '管理员角色关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_admin_role
-- ----------------------------
INSERT INTO `mt_admin_role` VALUES (1, 1, 1, '2025-10-04 23:03:22');

-- ----------------------------
-- Table structure for mt_admin_user
-- ----------------------------
DROP TABLE IF EXISTS `mt_admin_user`;
CREATE TABLE `mt_admin_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '管理员账号',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像',
  `admin_type` tinyint NOT NULL DEFAULT 2 COMMENT '管理员类型：1-超级管理员，2-普通管理员',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `uk_email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '平台管理员表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_admin_user
-- ----------------------------
INSERT INTO `mt_admin_user` VALUES (1, 'admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8GbOh4ldp3ZG', '超级管理员', NULL, NULL, NULL, 1, 1, NULL, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');

-- ----------------------------
-- Table structure for mt_commission_record
-- ----------------------------
DROP TABLE IF EXISTS `mt_commission_record`;
CREATE TABLE `mt_commission_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '佣金记录ID',
  `agent_id` bigint NOT NULL COMMENT '代理人ID',
  `sub_task_id` bigint NOT NULL COMMENT '子任务ID',
  `worker_id` bigint NOT NULL COMMENT '接单员ID',
  `commission_amount` decimal(10, 2) NOT NULL COMMENT '佣金金额',
  `commission_rate` decimal(5, 2) NOT NULL COMMENT '佣金比例',
  `task_amount` decimal(10, 2) NOT NULL COMMENT '任务金额',
  `commission_status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：1-待结算，2-已结算，3-已取消',
  `settle_time` datetime NULL DEFAULT NULL COMMENT '结算时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_agent_id`(`agent_id` ASC) USING BTREE,
  INDEX `idx_worker_id`(`worker_id` ASC) USING BTREE,
  INDEX `idx_sub_task_id`(`sub_task_id` ASC) USING BTREE,
  INDEX `idx_commission_status`(`commission_status` ASC) USING BTREE,
  CONSTRAINT `fk_commission_agent` FOREIGN KEY (`agent_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_commission_sub_task` FOREIGN KEY (`sub_task_id`) REFERENCES `mt_sub_task` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_commission_worker` FOREIGN KEY (`worker_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '佣金记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_commission_record
-- ----------------------------

-- ----------------------------
-- Table structure for mt_data_dict
-- ----------------------------
DROP TABLE IF EXISTS `mt_data_dict`;
CREATE TABLE `mt_data_dict`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '字典ID',
  `dict_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典类型',
  `dict_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典编码',
  `dict_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典名称',
  `dict_value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '字典值',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_dict_type_code`(`dict_type` ASC, `dict_code` ASC) USING BTREE,
  INDEX `idx_dict_type`(`dict_type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '数据字典表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_data_dict
-- ----------------------------
INSERT INTO `mt_data_dict` VALUES (1, 'user_status', '0', '禁用', '用户被禁用', 1, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (2, 'user_status', '1', '启用', '用户正常状态', 2, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (3, 'user_status', '2', '冻结', '用户被冻结', 3, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (4, 'user_type', '1', '派单员', '发布任务的用户', 1, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (5, 'user_type', '2', '接单员', '接取任务的用户', 2, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (6, 'user_type', '3', '代理人', '发展接单员的用户', 3, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (7, 'user_type', '4', '平台管理员', '平台管理人员', 4, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (8, 'task_status', '1', '待抢单', '任务等待接单员抢单', 1, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (9, 'task_status', '2', '待提交', '任务已被接单，等待提交', 2, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (10, 'task_status', '3', '待审核', '任务已提交，等待审核', 3, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (11, 'task_status', '4', '已完成', '任务已完成', 4, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (12, 'task_status', '5', '已失败', '任务失败', 5, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (13, 'task_status', '6', '已取消', '任务已取消', 6, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (14, 'task_status', '7', '等待前置任务', '等待前置任务完成', 7, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (15, 'payment_type', '1', '支付宝', '支付宝支付', 1, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (16, 'payment_type', '2', 'USDT', 'USDT加密货币支付', 2, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (17, 'payment_type', '3', '银行卡', '银行卡支付', 3, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (18, 'template_type', '1', '上评', '直接在视频下方评论', 1, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (19, 'template_type', '2', '中评', '在评论下方回复', 2, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (20, 'template_type', '3', '上中组合评', '先上评再中评', 3, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_data_dict` VALUES (21, 'template_type', '4', '中下组合评', '先中评再下评', 4, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');

-- ----------------------------
-- Table structure for mt_dispatch_sub_account
-- ----------------------------
DROP TABLE IF EXISTS `mt_dispatch_sub_account`;
CREATE TABLE `mt_dispatch_sub_account`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `main_user_id` bigint NOT NULL COMMENT '主账号用户ID',
  `sub_user_id` bigint NOT NULL COMMENT '子账号用户ID',
  `account_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '子账号名称',
  `permissions` json NULL COMMENT '权限配置（JSON格式）',
  `balance_limit` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '余额使用限额',
  `daily_limit` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '每日限额',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_sub_user_id`(`sub_user_id` ASC) USING BTREE,
  INDEX `idx_main_user_id`(`main_user_id` ASC) USING BTREE,
  CONSTRAINT `fk_sub_account_main` FOREIGN KEY (`main_user_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sub_account_sub` FOREIGN KEY (`sub_user_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '派单员子账号表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_dispatch_sub_account
-- ----------------------------

-- ----------------------------
-- Table structure for mt_fund_flow
-- ----------------------------
DROP TABLE IF EXISTS `mt_fund_flow`;
CREATE TABLE `mt_fund_flow`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '流水ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `flow_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '流水号',
  `flow_type` tinyint NOT NULL COMMENT '流水类型：1-充值，2-提现，3-任务收入，4-任务支出，5-佣金收入，6-退款',
  `amount` decimal(15, 2) NOT NULL COMMENT '变动金额',
  `balance_before` decimal(15, 2) NOT NULL COMMENT '变动前余额',
  `balance_after` decimal(15, 2) NOT NULL COMMENT '变动后余额',
  `related_id` bigint NULL DEFAULT NULL COMMENT '关联业务ID',
  `related_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '关联业务类型',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '流水说明',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_flow_no`(`flow_no` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_flow_type`(`flow_type` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE,
  INDEX `idx_related`(`related_type` ASC, `related_id` ASC) USING BTREE,
  CONSTRAINT `fk_flow_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '资金流水表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_fund_flow
-- ----------------------------

-- ----------------------------
-- Table structure for mt_login_log
-- ----------------------------
DROP TABLE IF EXISTS `mt_login_log`;
CREATE TABLE `mt_login_log`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `user_type` tinyint NOT NULL COMMENT '用户类型',
  `login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录IP',
  `login_location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录地点',
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户代理',
  `login_status` tinyint NOT NULL DEFAULT 1 COMMENT '登录状态：0-失败，1-成功',
  `fail_reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '失败原因',
  `login_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_user_type`(`user_type` ASC) USING BTREE,
  INDEX `idx_login_time`(`login_time` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '登录日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_login_log
-- ----------------------------

-- ----------------------------
-- Table structure for mt_main_task
-- ----------------------------
DROP TABLE IF EXISTS `mt_main_task`;
CREATE TABLE `mt_main_task`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主任务ID',
  `task_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务编号',
  `user_id` bigint NOT NULL COMMENT '派单员用户ID',
  `template_id` bigint NOT NULL COMMENT '任务模板ID',
  `task_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务标题',
  `task_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '任务描述',
  `total_amount` decimal(15, 2) NOT NULL COMMENT '任务总金额',
  `total_count` int NOT NULL COMMENT '任务总数量',
  `completed_count` int NULL DEFAULT 0 COMMENT '已完成数量',
  `unit_price` decimal(10, 2) NOT NULL COMMENT '单价',
  `task_data` json NOT NULL COMMENT '任务数据（JSON格式，包含链接、评论语等）',
  `task_status` tinyint NOT NULL DEFAULT 1 COMMENT '任务状态：1-进行中，2-已完成，3-已取消，4-已过期',
  `expire_time` datetime NULL DEFAULT NULL COMMENT '过期时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_no`(`task_no` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_template_id`(`template_id` ASC) USING BTREE,
  INDEX `idx_task_status`(`task_status` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE,
  CONSTRAINT `fk_main_task_template` FOREIGN KEY (`template_id`) REFERENCES `mt_task_template` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_main_task_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '主任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_main_task
-- ----------------------------

-- ----------------------------
-- Table structure for mt_menu
-- ----------------------------
DROP TABLE IF EXISTS `mt_menu`;
CREATE TABLE `mt_menu`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `parent_id` bigint NULL DEFAULT 0 COMMENT '父菜单ID',
  `menu_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜单名称',
  `menu_type` tinyint NOT NULL COMMENT '菜单类型：1-目录，2-菜单，3-按钮',
  `menu_icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '菜单图标',
  `menu_url` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '菜单URL',
  `permission_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '权限标识',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '菜单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_menu
-- ----------------------------

-- ----------------------------
-- Table structure for mt_operation_log
-- ----------------------------
DROP TABLE IF EXISTS `mt_operation_log`;
CREATE TABLE `mt_operation_log`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `admin_id` bigint NULL DEFAULT NULL COMMENT '操作管理员ID',
  `user_id` bigint NULL DEFAULT NULL COMMENT '操作用户ID',
  `operation_module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作模块',
  `operation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型',
  `operation_desc` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作描述',
  `request_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '请求URL',
  `request_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '请求方法',
  `request_params` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '请求参数',
  `response_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '响应结果',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'IP地址',
  `user_agent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户代理',
  `execute_time` bigint NULL DEFAULT NULL COMMENT '执行时间（毫秒）',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '操作状态：0-失败，1-成功',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '错误信息',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_admin_id`(`admin_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_operation_module`(`operation_module` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '操作日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_operation_log
-- ----------------------------

-- ----------------------------
-- Table structure for mt_recharge_record
-- ----------------------------
DROP TABLE IF EXISTS `mt_recharge_record`;
CREATE TABLE `mt_recharge_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '充值记录ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `recharge_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '充值订单号',
  `amount` decimal(15, 2) NOT NULL COMMENT '充值金额',
  `payment_type` tinyint NOT NULL COMMENT '支付方式：1-支付宝，2-USDT，3-银行卡',
  `payment_status` tinyint NOT NULL DEFAULT 1 COMMENT '支付状态：1-待支付，2-支付成功，3-支付失败，4-已取消',
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '第三方支付交易号',
  `usdt_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'USDT充值地址',
  `usdt_amount` decimal(15, 6) NULL DEFAULT NULL COMMENT 'USDT数量',
  `exchange_rate` decimal(10, 6) NULL DEFAULT NULL COMMENT '汇率',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `complete_time` datetime NULL DEFAULT NULL COMMENT '完成时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_recharge_no`(`recharge_no` ASC) USING BTREE,
  UNIQUE INDEX `uk_transaction_id`(`transaction_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_payment_status`(`payment_status` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE,
  CONSTRAINT `fk_recharge_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '充值记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_recharge_record
-- ----------------------------

-- ----------------------------
-- Table structure for mt_role
-- ----------------------------
DROP TABLE IF EXISTS `mt_role`;
CREATE TABLE `mt_role`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `role_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色编码',
  `role_desc` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '角色描述',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_code`(`role_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_role
-- ----------------------------
INSERT INTO `mt_role` VALUES (1, '超级管理员', 'super_admin', '系统超级管理员，拥有所有权限', 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_role` VALUES (2, '系统管理员', 'system_admin', '系统管理员，负责系统管理', 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_role` VALUES (3, '财务管理员', 'finance_admin', '财务管理员，负责财务相关管理', 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_role` VALUES (4, '业务管理员', 'business_admin', '业务管理员，负责业务相关管理', 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');

-- ----------------------------
-- Table structure for mt_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `mt_role_menu`;
CREATE TABLE `mt_role_menu`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `menu_id` bigint NOT NULL COMMENT '菜单ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_role_menu`(`role_id` ASC, `menu_id` ASC) USING BTREE,
  INDEX `fk_role_menu_menu`(`menu_id` ASC) USING BTREE,
  CONSTRAINT `fk_role_menu_menu` FOREIGN KEY (`menu_id`) REFERENCES `mt_menu` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_role_menu_role` FOREIGN KEY (`role_id`) REFERENCES `mt_role` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色菜单关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_role_menu
-- ----------------------------

-- ----------------------------
-- Table structure for mt_sub_task
-- ----------------------------
DROP TABLE IF EXISTS `mt_sub_task`;
CREATE TABLE `mt_sub_task`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '子任务ID',
  `sub_task_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '子任务编号',
  `main_task_id` bigint NOT NULL COMMENT '主任务ID',
  `parent_sub_task_id` bigint NULL DEFAULT NULL COMMENT '父级子任务ID（用于组合评论任务依赖）',
  `user_id` bigint NULL DEFAULT NULL COMMENT '接单员用户ID',
  `task_stage` tinyint NOT NULL DEFAULT 1 COMMENT '任务阶段：1-第一阶段，2-第二阶段（用于组合评论）',
  `task_data` json NOT NULL COMMENT '子任务数据',
  `task_status` tinyint NOT NULL DEFAULT 1 COMMENT '任务状态：1-待抢单，2-待提交，3-待审核，4-已完成，5-已失败，6-已取消，7-等待前置任务',
  `unit_price` decimal(10, 2) NOT NULL COMMENT '单价',
  `commission` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '代理人佣金',
  `platform_fee` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '平台手续费',
  `accept_time` datetime NULL DEFAULT NULL COMMENT '接单时间',
  `submit_time` datetime NULL DEFAULT NULL COMMENT '提交时间',
  `complete_time` datetime NULL DEFAULT NULL COMMENT '完成时间',
  `screenshot_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '提交的截图URL',
  `comment_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '评论链接地址（用于组合评论任务）',
  `submit_data` json NULL COMMENT '提交的数据',
  `audit_remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '审核备注',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `auditor_id` bigint NULL DEFAULT NULL COMMENT '审核员ID',
  `time_limit_expire` datetime NULL DEFAULT NULL COMMENT '任务时间限制到期时间',
  `review_time_expire` datetime NULL DEFAULT NULL COMMENT '审核时间限制到期时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_sub_task_no`(`sub_task_no` ASC) USING BTREE,
  INDEX `idx_main_task_id`(`main_task_id` ASC) USING BTREE,
  INDEX `idx_parent_sub_task_id`(`parent_sub_task_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_task_status`(`task_status` ASC) USING BTREE,
  INDEX `idx_accept_time`(`accept_time` ASC) USING BTREE,
  INDEX `idx_task_stage`(`task_stage` ASC) USING BTREE,
  INDEX `idx_time_limit`(`time_limit_expire` ASC) USING BTREE,
  INDEX `idx_review_time`(`review_time_expire` ASC) USING BTREE,
  CONSTRAINT `fk_sub_task_main` FOREIGN KEY (`main_task_id`) REFERENCES `mt_main_task` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sub_task_parent` FOREIGN KEY (`parent_sub_task_id`) REFERENCES `mt_sub_task` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sub_task_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '子任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_sub_task
-- ----------------------------

-- ----------------------------
-- Table structure for mt_system_config
-- ----------------------------
DROP TABLE IF EXISTS `mt_system_config`;
CREATE TABLE `mt_system_config`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置键',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置值',
  `config_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置名称',
  `config_group` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置分组',
  `config_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'string' COMMENT '配置类型：string、number、boolean、json',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_config_key`(`config_key` ASC) USING BTREE,
  INDEX `idx_config_group`(`config_group` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '系统配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_system_config
-- ----------------------------
INSERT INTO `mt_system_config` VALUES (1, 'site_name', 'MicroTask微任务平台', '站点名称', 'base', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (2, 'site_version', '2.0.0', '站点版本', 'base', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (3, 'platform_fee_rate', '0.05', '平台手续费率', 'finance', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (4, 'worker_commission_rate', '0.55', '接单员佣金比例', 'finance', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (5, 'agent_commission_rate', '0.03', '代理人佣金比例', 'finance', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (6, 'min_recharge_amount', '100.00', '最低充值金额', 'finance', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (7, 'max_recharge_amount', '50000.00', '最高充值金额', 'finance', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (8, 'min_withdraw_amount', '50.00', '最低提现金额', 'finance', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (9, 'max_withdraw_amount', '20000.00', '最高提现金额', 'finance', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (10, 'withdraw_fee_rate', '0.01', '提现手续费率', 'finance', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (11, 'default_agent_commission', '0.10', '默认代理佣金比例', 'agent', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (12, 'task_time_limit', '120', '任务时间限制（分钟）', 'task', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_system_config` VALUES (13, 'task_review_time_limit', '10', '任务审核时间限制（分钟）', 'task', 'string', NULL, 0, 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');

-- ----------------------------
-- Table structure for mt_task_category
-- ----------------------------
DROP TABLE IF EXISTS `mt_task_category`;
CREATE TABLE `mt_task_category`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `parent_id` bigint NULL DEFAULT 0 COMMENT '父级分类ID',
  `category_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '分类名称',
  `category_type` tinyint NOT NULL COMMENT '分类类型：1-平台大类，2-任务小类',
  `platform` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '平台名称：douyin、wechat、xiaohongshu等',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '分类图标',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '分类描述',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
  INDEX `idx_category_type`(`category_type` ASC) USING BTREE,
  INDEX `idx_platform`(`platform` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_task_category
-- ----------------------------
INSERT INTO `mt_task_category` VALUES (1, 0, '抖音', 1, 'douyin', NULL, 1, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_category` VALUES (2, 0, '视频号', 1, 'wechat', NULL, 2, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_category` VALUES (3, 0, '小红书', 1, 'xiaohongshu', NULL, 3, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_category` VALUES (4, 1, '评论任务', 2, 'douyin', NULL, 1, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_category` VALUES (5, 1, '点赞任务', 2, 'douyin', NULL, 2, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_category` VALUES (6, 1, '关注任务', 2, 'douyin', NULL, 3, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_category` VALUES (7, 2, '评论任务', 2, 'wechat', NULL, 1, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_category` VALUES (8, 2, '点赞任务', 2, 'wechat', NULL, 2, 1, NULL, '2025-10-04 23:03:22', '2025-10-04 23:03:22');

-- ----------------------------
-- Table structure for mt_task_operation_log
-- ----------------------------
DROP TABLE IF EXISTS `mt_task_operation_log`;
CREATE TABLE `mt_task_operation_log`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `task_id` bigint NOT NULL COMMENT '任务ID',
  `task_type` tinyint NOT NULL COMMENT '任务类型：1-主任务，2-子任务',
  `operation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型：CREATE, ACCEPT, SUBMIT, AUDIT, COMPLETE, CANCEL等',
  `old_status` tinyint NULL DEFAULT NULL COMMENT '原状态',
  `new_status` tinyint NULL DEFAULT NULL COMMENT '新状态',
  `operator_id` bigint NULL DEFAULT NULL COMMENT '操作人ID',
  `operator_type` tinyint NULL DEFAULT NULL COMMENT '操作人类型：1-派单员，2-接单员，3-系统，4-管理员',
  `operation_remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作备注',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作IP地址',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_task_id`(`task_id` ASC) USING BTREE,
  INDEX `idx_task_type`(`task_type` ASC) USING BTREE,
  INDEX `idx_operation_type`(`operation_type` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务操作记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_task_operation_log
-- ----------------------------

-- ----------------------------
-- Table structure for mt_task_template
-- ----------------------------
DROP TABLE IF EXISTS `mt_task_template`;
CREATE TABLE `mt_task_template`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `template_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板名称',
  `category_id` bigint NOT NULL COMMENT '分类ID',
  `template_type` tinyint NOT NULL COMMENT '模板类型：1-上评，2-中评，3-上中组合评，4-中下组合评，5-点赞，6-关注等',
  `base_price` decimal(10, 2) NOT NULL COMMENT '基础单价',
  `platform_fee_rate` decimal(5, 4) NULL DEFAULT 0.0500 COMMENT '平台手续费率',
  `worker_commission_rate` decimal(5, 4) NULL DEFAULT 0.5500 COMMENT '接单员佣金比例',
  `agent_commission_rate` decimal(5, 4) NULL DEFAULT 0.0300 COMMENT '代理人佣金比例',
  `required_fields` json NOT NULL COMMENT '必需字段配置（JSON格式）',
  `optional_fields` json NULL COMMENT '可选字段配置（JSON格式）',
  `completion_criteria` json NOT NULL COMMENT '完成标准配置',
  `time_limit` int NULL DEFAULT 120 COMMENT '任务时间限制（分钟）',
  `review_time_limit` int NULL DEFAULT 10 COMMENT '审核时间限制（分钟）',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '模板描述',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category_id`(`category_id` ASC) USING BTREE,
  INDEX `idx_template_type`(`template_type` ASC) USING BTREE,
  CONSTRAINT `fk_template_category` FOREIGN KEY (`category_id`) REFERENCES `mt_task_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '任务模板表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_task_template
-- ----------------------------
INSERT INTO `mt_task_template` VALUES (1, '上评任务', 4, 1, 1.50, 0.0500, 0.5500, 0.0300, '[\"video_url\", \"quantity\", \"comment_hint\"]', NULL, '{\"time_limit\": 120, \"comment_visible\": true, \"screenshot_required\": true}', 120, 10, '上评任务：直接在视频下方进行评论', 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_template` VALUES (2, '中评任务', 4, 2, 2.00, 0.0500, 0.5500, 0.0300, '[\"top_comment_url\", \"quantity\", \"comment_hint\", \"mention_user\"]', NULL, '{\"time_limit\": 120, \"comment_visible\": true, \"screenshot_required\": true}', 120, 10, '中评任务：在已有评论下方进行回复评论', 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_template` VALUES (3, '上中组合评任务', 4, 3, 3.00, 0.0500, 0.5500, 0.0300, '[\"video_url\", \"top_comment_quantity\", \"top_comment_hint\", \"mid_comment_quantity\", \"mid_comment_hint\", \"mention_user\"]', NULL, '{\"time_limit\": 120, \"comment_visible\": true, \"require_comment_url\": true, \"screenshot_required\": true}', 120, 10, '上中组合评任务：先进行上评，再进行中评的组合任务', 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');
INSERT INTO `mt_task_template` VALUES (4, '中下组合评任务', 4, 4, 3.50, 0.0500, 0.5500, 0.0300, '[\"top_comment_url\", \"mid_comment_quantity\", \"mid_comment_hint\", \"mid_mention_user\", \"bottom_comment_quantity\", \"bottom_comment_hint\", \"bottom_mention_user\"]', NULL, '{\"time_limit\": 120, \"comment_visible\": true, \"require_comment_url\": true, \"screenshot_required\": true}', 120, 10, '中下组合评任务：先进行中评，再进行下评的组合任务', 1, '2025-10-04 23:03:22', '2025-10-04 23:03:22');

-- ----------------------------
-- Table structure for mt_user
-- ----------------------------
DROP TABLE IF EXISTS `mt_user`;
CREATE TABLE `mt_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名，唯一',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '加密后的密码',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱地址',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号码',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像URL',
  `user_type` tinyint NOT NULL COMMENT '用户类型：1-派单员，2-接单员，3-代理人，4-平台管理员',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用，2-冻结',
  `invite_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邀请码（用于代理关系）',
  `invited_by` bigint NULL DEFAULT NULL COMMENT '邀请人ID（代理人ID）',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '真实姓名',
  `id_card` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '身份证号',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `uk_email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone` ASC) USING BTREE,
  UNIQUE INDEX `uk_invite_code`(`invite_code` ASC) USING BTREE,
  INDEX `idx_user_type`(`user_type` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_invited_by`(`invited_by` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户基础表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_user
-- ----------------------------

-- ----------------------------
-- Table structure for mt_user_ext
-- ----------------------------
DROP TABLE IF EXISTS `mt_user_ext`;
CREATE TABLE `mt_user_ext`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `user_type` tinyint NOT NULL COMMENT '用户类型',
  `balance` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '账户余额',
  `frozen_balance` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '冻结金额',
  `total_recharge` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计充值金额',
  `total_withdraw` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计提现金额',
  `total_income` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计收入',
  `total_expend` decimal(15, 2) NOT NULL DEFAULT 0.00 COMMENT '累计支出',
  `agent_level` tinyint NULL DEFAULT 0 COMMENT '代理等级（代理人专用）',
  `team_size` int NULL DEFAULT 0 COMMENT '团队人数（代理人专用）',
  `commission_rate` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '佣金比例（代理人专用）',
  `task_count` int NULL DEFAULT 0 COMMENT '完成任务数（接单员专用）',
  `success_rate` decimal(5, 2) NULL DEFAULT 0.00 COMMENT '任务成功率（接单员专用）',
  `credit_score` int NULL DEFAULT 100 COMMENT '信用分数',
  `ext_data` json NULL COMMENT '扩展数据（JSON格式）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_user_type`(`user_type` ASC) USING BTREE,
  INDEX `idx_balance`(`balance` ASC) USING BTREE,
  INDEX `idx_user_balance`(`balance` ASC) USING BTREE,
  INDEX `idx_user_credit`(`credit_score` ASC) USING BTREE,
  CONSTRAINT `fk_user_ext_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户扩展信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_user_ext
-- ----------------------------

-- ----------------------------
-- Table structure for mt_withdraw_record
-- ----------------------------
DROP TABLE IF EXISTS `mt_withdraw_record`;
CREATE TABLE `mt_withdraw_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '提现记录ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `withdraw_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '提现订单号',
  `amount` decimal(15, 2) NOT NULL COMMENT '提现金额',
  `actual_amount` decimal(15, 2) NULL DEFAULT NULL COMMENT '实际到账金额',
  `fee` decimal(15, 2) NULL DEFAULT 0.00 COMMENT '手续费',
  `withdraw_type` tinyint NOT NULL COMMENT '提现方式：1-支付宝，2-银行卡，3-USDT',
  `withdraw_status` tinyint NOT NULL DEFAULT 1 COMMENT '提现状态：1-审核中，2-处理中，3-提现成功，4-提现失败，5-已取消',
  `account_info` json NOT NULL COMMENT '提现账户信息（JSON格式）',
  `reject_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '拒绝原因',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `complete_time` datetime NULL DEFAULT NULL COMMENT '完成时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_withdraw_no`(`withdraw_no` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_withdraw_status`(`withdraw_status` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE,
  CONSTRAINT `fk_withdraw_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '提现记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of mt_withdraw_record
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `create_time` datetime(6) NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` int NOT NULL,
  `update_time` datetime(6) NULL DEFAULT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UK_sb8bbouer5wak8vyiiy4pf2bx`(`username` ASC) USING BTREE,
  UNIQUE INDEX `UK_ob8kqyqqgmefl0aco34akdtpe`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, NULL, '2025-09-27 15:49:11.284000', 'yOK@8OMqH7UVdv.39zsZmcq8py3.gLgVVlCRTsfazVIoQhdlJh', '$2a$10$bDQS93Ylg94N15QYGrczteCAVGtJsiccTHH4pJW4yDBPaEvv.uafC', '17921751833', 1, '2025-09-27 15:49:11.284000', 'ghOPGFfV15o39jrUzbPV');
INSERT INTO `user` VALUES (2, NULL, '2025-10-02 14:34:43.446000', 'test@163.com', '$2a$10$CFC/1WuWO0E519bEztzhwuQGA5mk/UkMJmznXgyWmaut9kyUHlg2.', '13111229208', 1, '2025-10-02 14:34:43.446000', 'test');
INSERT INTO `user` VALUES (3, NULL, '2025-10-03 15:56:32.656000', NULL, '$2a$10$CZVc3iLQ3ugW3.0BeHCMe.niu9U7iUINM.j1eq8PW1lSj5G1zvmbq', NULL, 1, '2025-10-03 15:56:32.656000', 'qxpjcs');
INSERT INTO `user` VALUES (4, NULL, '2025-10-03 15:57:40.109000', NULL, '$2a$10$j/MhBLY8XJaAcTLGgooZJuSxTsoNzh0Kh9ltz.DpXnt7vPASWPY1m', NULL, 1, '2025-10-03 15:57:40.109000', 'sfefnc');

-- ----------------------------
-- View structure for vw_combo_task_progress
-- ----------------------------
DROP VIEW IF EXISTS `vw_combo_task_progress`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `vw_combo_task_progress` AS select `st`.`main_task_id` AS `main_task_id`,`st`.`parent_sub_task_id` AS `parent_sub_task_id`,count(0) AS `total_tasks`,sum((case when (`st`.`task_status` = 4) then 1 else 0 end)) AS `completed_tasks`,group_concat((case when (`st`.`task_status` = 4) then `st`.`comment_url` else NULL end) separator ',') AS `completed_comment_urls` from `mt_sub_task` `st` where (`st`.`parent_sub_task_id` is not null) group by `st`.`main_task_id`,`st`.`parent_sub_task_id`;

-- ----------------------------
-- View structure for vw_fund_stats
-- ----------------------------
DROP VIEW IF EXISTS `vw_fund_stats`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `vw_fund_stats` AS select `u`.`id` AS `user_id`,`u`.`username` AS `username`,`u`.`user_type` AS `user_type`,`ue`.`balance` AS `balance`,`ue`.`frozen_balance` AS `frozen_balance`,`ue`.`total_recharge` AS `total_recharge`,`ue`.`total_withdraw` AS `total_withdraw`,`ue`.`total_income` AS `total_income`,`ue`.`total_expend` AS `total_expend`,(select coalesce(sum(`mt_fund_flow`.`amount`),0) from `mt_fund_flow` where ((`mt_fund_flow`.`user_id` = `u`.`id`) and (`mt_fund_flow`.`flow_type` = 1))) AS `total_recharge_flow`,(select coalesce(sum(`mt_fund_flow`.`amount`),0) from `mt_fund_flow` where ((`mt_fund_flow`.`user_id` = `u`.`id`) and (`mt_fund_flow`.`flow_type` = 2))) AS `total_withdraw_flow`,(select coalesce(sum(`mt_fund_flow`.`amount`),0) from `mt_fund_flow` where ((`mt_fund_flow`.`user_id` = `u`.`id`) and (`mt_fund_flow`.`flow_type` = 3))) AS `total_task_income_flow`,(select coalesce(sum(`mt_fund_flow`.`amount`),0) from `mt_fund_flow` where ((`mt_fund_flow`.`user_id` = `u`.`id`) and (`mt_fund_flow`.`flow_type` = 4))) AS `total_task_expend_flow` from (`mt_user` `u` left join `mt_user_ext` `ue` on((`u`.`id` = `ue`.`user_id`)));

-- ----------------------------
-- View structure for vw_task_stats
-- ----------------------------
DROP VIEW IF EXISTS `vw_task_stats`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `vw_task_stats` AS select `mt`.`id` AS `main_task_id`,`mt`.`task_no` AS `task_no`,`mt`.`task_title` AS `task_title`,`mt`.`total_count` AS `total_count`,`mt`.`completed_count` AS `completed_count`,count(`st`.`id`) AS `sub_task_count`,sum((case when (`st`.`task_status` = 4) then 1 else 0 end)) AS `completed_sub_count`,sum((case when (`st`.`task_status` = 5) then 1 else 0 end)) AS `failed_sub_count`,sum((case when (`st`.`task_status` in (1,2,3,7)) then 1 else 0 end)) AS `pending_sub_count` from (`mt_main_task` `mt` left join `mt_sub_task` `st` on((`mt`.`id` = `st`.`main_task_id`))) group by `mt`.`id`,`mt`.`task_no`,`mt`.`task_title`,`mt`.`total_count`,`mt`.`completed_count`;

-- ----------------------------
-- View structure for vw_user_info
-- ----------------------------
DROP VIEW IF EXISTS `vw_user_info`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `vw_user_info` AS select `u`.`id` AS `id`,`u`.`username` AS `username`,`u`.`password` AS `password`,`u`.`email` AS `email`,`u`.`phone` AS `phone`,`u`.`avatar_url` AS `avatar_url`,`u`.`user_type` AS `user_type`,`u`.`status` AS `status`,`u`.`invite_code` AS `invite_code`,`u`.`invited_by` AS `invited_by`,`u`.`real_name` AS `real_name`,`u`.`id_card` AS `id_card`,`u`.`create_time` AS `create_time`,`u`.`update_time` AS `update_time`,`u`.`last_login_time` AS `last_login_time`,`u`.`last_login_ip` AS `last_login_ip`,`ue`.`balance` AS `balance`,`ue`.`frozen_balance` AS `frozen_balance`,`ue`.`total_recharge` AS `total_recharge`,`ue`.`total_withdraw` AS `total_withdraw`,`ue`.`total_income` AS `total_income`,`ue`.`total_expend` AS `total_expend`,`ue`.`credit_score` AS `credit_score`,`ue`.`task_count` AS `task_count`,`ue`.`success_rate` AS `success_rate`,`ue`.`agent_level` AS `agent_level`,`ue`.`team_size` AS `team_size`,`ue`.`commission_rate` AS `commission_rate` from (`mt_user` `u` left join `mt_user_ext` `ue` on((`u`.`id` = `ue`.`user_id`)));

-- ----------------------------
-- Function structure for fn_calculate_task_commission
-- ----------------------------
DROP FUNCTION IF EXISTS `fn_calculate_task_commission`;
delimiter ;;
CREATE FUNCTION `fn_calculate_task_commission`(task_amount DECIMAL(10,2),
    worker_rate DECIMAL(5,4),
    agent_rate DECIMAL(5,4),
    platform_rate DECIMAL(5,4))
 RETURNS json
  READS SQL DATA 
  DETERMINISTIC
BEGIN
    DECLARE worker_commission DECIMAL(10,2);
    DECLARE agent_commission DECIMAL(10,2);
    DECLARE platform_fee DECIMAL(10,2);
    DECLARE result JSON;

    -- 计算各项费用
    SET worker_commission = task_amount * worker_rate;
    SET agent_commission = task_amount * agent_rate;
    SET platform_fee = task_amount * platform_rate;

    -- 构建JSON结果
    SET result = JSON_OBJECT(
        'worker_commission', worker_commission,
        'agent_commission', agent_commission,
        'platform_fee', platform_fee,
        'total_commission', worker_commission + agent_commission + platform_fee
    );

RETURN result;
END
;;
delimiter ;

-- ----------------------------
-- Function structure for fn_can_accept_sub_task
-- ----------------------------
DROP FUNCTION IF EXISTS `fn_can_accept_sub_task`;
delimiter ;;
CREATE FUNCTION `fn_can_accept_sub_task`(sub_task_id BIGINT, user_id BIGINT)
 RETURNS tinyint
  READS SQL DATA 
  DETERMINISTIC
BEGIN
    DECLARE task_status TINYINT;
    DECLARE parent_task_status TINYINT;
    DECLARE main_task_id BIGINT;
    DECLARE user_accepted_count INT;

    -- 获取子任务状态和主任务ID
SELECT st.task_status, st.main_task_id INTO task_status, main_task_id
FROM mt_sub_task st WHERE st.id = sub_task_id;

-- 检查任务状态
IF task_status != 1 THEN  -- 不是待抢单状态
        RETURN 0;
END IF;

    -- 检查用户是否已经接取了同一主任务的子任务
SELECT COUNT(*) INTO user_accepted_count
FROM mt_sub_task
WHERE main_task_id = main_task_id AND user_id = user_id AND task_status IN (2,3,7);

IF user_accepted_count > 0 THEN
        RETURN 0;
END IF;

    -- 检查父级任务状态（针对组合评论任务）
SELECT COUNT(*) INTO parent_task_status
FROM mt_sub_task st
WHERE st.id IN (SELECT parent_sub_task_id FROM mt_sub_task WHERE id = sub_task_id)
  AND st.task_status != 4;  -- 父级任务未完成

IF parent_task_status > 0 THEN
        RETURN 0;
END IF;

RETURN 1;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_generate_task_no
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_generate_task_no`;
delimiter ;;
CREATE PROCEDURE `sp_generate_task_no`(IN task_type VARCHAR(10), OUT task_no VARCHAR(50))
BEGIN
    DECLARE prefix CHAR(1);
    DECLARE date_part VARCHAR(14);
    DECLARE random_part VARCHAR(6);

    -- 根据任务类型设置前缀
CASE task_type
        WHEN 'MAIN' THEN SET prefix = 'M';
WHEN 'SUB' THEN SET prefix = 'S';
ELSE SET prefix = 'T';
END CASE;

    -- 生成日期部分和随机部分
    SET date_part = DATE_FORMAT(NOW(), '%Y%m%d%H%i%s');
    SET random_part = LPAD(FLOOR(RAND() * 1000000), 6, '0');

    -- 组合成任务编号
    SET task_no = CONCAT(prefix, date_part, random_part);
END
;;
delimiter ;

-- ----------------------------
-- Event structure for evt_auto_expire_tasks
-- ----------------------------
DROP EVENT IF EXISTS `evt_auto_expire_tasks`;
delimiter ;;
CREATE EVENT `evt_auto_expire_tasks`
ON SCHEDULE
EVERY '1' MINUTE STARTS '2025-10-04 23:03:22'
DO BEGIN
    -- 更新超时未提交的任务状态
UPDATE mt_sub_task
SET task_status = 5,  -- 设置为失败状态
    audit_remark = '任务超时未完成，系统自动标记为失败',
    update_time = NOW()
WHERE task_status = 2  -- 待提交状态
  AND time_limit_expire < NOW();

-- 更新超时未审核的任务状态（自动通过）
UPDATE mt_sub_task
SET task_status = 4,  -- 设置为完成状态
    audit_remark = '审核超时，系统自动通过',
    audit_time = NOW(),
    complete_time = NOW(),
    update_time = NOW()
WHERE task_status = 3  -- 待审核状态
  AND review_time_expire < NOW();
END
;;
delimiter ;

-- ----------------------------
-- Event structure for evt_auto_settle_commissions
-- ----------------------------
DROP EVENT IF EXISTS `evt_auto_settle_commissions`;
delimiter ;;
CREATE EVENT `evt_auto_settle_commissions`
ON SCHEDULE
EVERY '5' MINUTE STARTS '2025-10-04 23:03:22'
DO BEGIN
    -- 这里可以添加自动结算佣金的逻辑
    -- 由于涉及复杂的业务逻辑，建议在应用层实现
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table mt_sub_task
-- ----------------------------
DROP TRIGGER IF EXISTS `trg_update_main_task_status`;
delimiter ;;
CREATE TRIGGER `trg_update_main_task_status` AFTER UPDATE ON `mt_sub_task` FOR EACH ROW BEGIN
    DECLARE completed_count INT;
    DECLARE total_count INT;

    -- 只有当子任务状态发生变化时才触发
    IF OLD.task_status != NEW.task_status THEN
        -- 统计主任务的完成情况
    SELECT COUNT(*), mt.total_count INTO completed_count, total_count
    FROM mt_sub_task st
             JOIN mt_main_task mt ON st.main_task_id = mt.id
    WHERE st.main_task_id = NEW.main_task_id AND st.task_status = 4;

    -- 如果所有子任务都完成，更新主任务状态
    IF completed_count >= total_count THEN
    UPDATE mt_main_task
    SET task_status = 2, completed_count = completed_count, update_time = NOW()
    WHERE id = NEW.main_task_id;
    ELSE
            -- 更新已完成数量
    UPDATE mt_main_task
    SET completed_count = completed_count, update_time = NOW()
    WHERE id = NEW.main_task_id;
END IF;

-- 记录任务操作日志
INSERT INTO mt_task_operation_log (task_id, task_type, operation_type, old_status, new_status, operator_id, operator_type, operation_remark)
VALUES (NEW.id, 2, 'STATUS_CHANGE', OLD.task_status, NEW.task_status, NEW.user_id, 2, '系统自动更新状态');
END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table mt_sub_task
-- ----------------------------
DROP TRIGGER IF EXISTS `trg_combo_task_unlock`;
delimiter ;;
CREATE TRIGGER `trg_combo_task_unlock` AFTER UPDATE ON `mt_sub_task` FOR EACH ROW BEGIN
    -- 当父级任务完成时，解锁依赖的子任务
    IF NEW.task_status = 4 AND OLD.task_status != 4 THEN
    UPDATE mt_sub_task
    SET task_status = 1,  -- 设置为待抢单状态
        update_time = NOW()
    WHERE parent_sub_task_id = NEW.id
      AND task_status = 7;  -- 从等待前置任务状态解锁
END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table mt_user
-- ----------------------------
DROP TRIGGER IF EXISTS `trg_create_user_ext`;
delimiter ;;
CREATE TRIGGER `trg_create_user_ext` AFTER INSERT ON `mt_user` FOR EACH ROW BEGIN
    INSERT INTO mt_user_ext (user_id, user_type) VALUES (NEW.id, NEW.user_type);
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
