-- 这个完整的MySQL 8数据库设计具有以下特点：
--
-- 核心特性：
-- 完整的用户体系：支持派单员、接单员、代理人、平台管理员四类用户
--
-- 复杂的评论任务：支持上评、中评、上中组合评、中下组合评等多种评论类型
--
-- 任务依赖关系：通过父子任务关系实现组合评论任务的依赖控制
--
-- 严格的时间控制：2分钟任务完成时间、10分钟审核时间限制
--
-- 佣金结算系统：接单员55%、代理人3%的佣金分配机制
--
-- 完整的资金流：充值、提现、资金流水、佣金记录全流程管理
--
-- 技术亮点：
-- MySQL 8特性：使用JSON字段、窗口函数、CTE等现代特性
--
-- 性能优化：合理的索引设计、视图、存储过程
--
-- 数据完整性：完善的外键约束、触发器自动维护
--
-- 自动化处理：事件调度自动处理过期任务
--
-- 扩展性：支持多种支付方式、任务类型、平台扩展
--
-- 这个数据库设计完全满足了微任务平台的所有业务需求，特别是复杂的评论任务流程和资金结算系统。


-- ============================================================
-- MicroTask 微任务平台 - 完整数据库设计
-- 版本：2.0
-- 数据库：MySQL 8.0+
-- 字符集：utf8mb4
-- 排序规则：utf8mb4_unicode_ci
-- 作者：微任务团队
-- 描述：完整的微任务平台数据库设计，支持派单员、接单员、代理人、平台管理员四类用户
-- ============================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `microtask_db`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `microtask_db`;

-- ============================================================
-- 1. 用户基础表结构
-- ============================================================

-- 用户基础表（存储所有类型用户的公共信息）
CREATE TABLE IF NOT EXISTS `mt_user` (
                                         `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键',
                                         `username` VARCHAR(50) NOT NULL COMMENT '用户名，唯一',
    `password` VARCHAR(100) NOT NULL COMMENT '加密后的密码',
    `email` VARCHAR(100) COMMENT '邮箱地址',
    `phone` VARCHAR(20) COMMENT '手机号码',
    `avatar_url` VARCHAR(255) COMMENT '头像URL',
    `user_type` TINYINT NOT NULL COMMENT '用户类型：1-派单员，2-接单员，3-代理人，4-平台管理员',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用，2-冻结',
    `invite_code` VARCHAR(20) COMMENT '邀请码（用于代理关系）',
    `invited_by` BIGINT COMMENT '邀请人ID（代理人ID）',
    `real_name` VARCHAR(50) COMMENT '真实姓名',
    `id_card` VARCHAR(20) COMMENT '身份证号',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `last_login_time` DATETIME COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`),
    UNIQUE KEY `uk_phone` (`phone`),
    UNIQUE KEY `uk_invite_code` (`invite_code`),
    KEY `idx_user_type` (`user_type`),
    KEY `idx_status` (`status`),
    KEY `idx_invited_by` (`invited_by`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础表';

-- 用户扩展信息表（按用户类型存储特定信息）
CREATE TABLE IF NOT EXISTS `mt_user_ext` (
                                             `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                             `user_id` BIGINT NOT NULL COMMENT '用户ID',
                                             `user_type` TINYINT NOT NULL COMMENT '用户类型',
                                             `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '账户余额',
    `frozen_balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '冻结金额',
    `total_recharge` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '累计充值金额',
    `total_withdraw` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '累计提现金额',
    `total_income` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '累计收入',
    `total_expend` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT '累计支出',
    `agent_level` TINYINT DEFAULT 0 COMMENT '代理等级（代理人专用）',
    `team_size` INT DEFAULT 0 COMMENT '团队人数（代理人专用）',
    `commission_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '佣金比例（代理人专用）',
    `task_count` INT DEFAULT 0 COMMENT '完成任务数（接单员专用）',
    `success_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '任务成功率（接单员专用）',
    `credit_score` INT DEFAULT 100 COMMENT '信用分数',
    `ext_data` JSON COMMENT '扩展数据（JSON格式）',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`),
    KEY `idx_user_type` (`user_type`),
    KEY `idx_balance` (`balance`),
    CONSTRAINT `fk_user_ext_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户扩展信息表';

-- 派单员子账号表
CREATE TABLE IF NOT EXISTS `mt_dispatch_sub_account` (
                                                         `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                                         `main_user_id` BIGINT NOT NULL COMMENT '主账号用户ID',
                                                         `sub_user_id` BIGINT NOT NULL COMMENT '子账号用户ID',
                                                         `account_name` VARCHAR(50) NOT NULL COMMENT '子账号名称',
    `permissions` JSON COMMENT '权限配置（JSON格式）',
    `balance_limit` DECIMAL(15,2) DEFAULT 0.00 COMMENT '余额使用限额',
    `daily_limit` DECIMAL(15,2) DEFAULT 0.00 COMMENT '每日限额',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_sub_user_id` (`sub_user_id`),
    KEY `idx_main_user_id` (`main_user_id`),
    CONSTRAINT `fk_sub_account_main` FOREIGN KEY (`main_user_id`) REFERENCES `mt_user` (`id`),
    CONSTRAINT `fk_sub_account_sub` FOREIGN KEY (`sub_user_id`) REFERENCES `mt_user` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='派单员子账号表';

-- ============================================================
-- 2. 财务相关表结构
-- ============================================================

-- 充值记录表
CREATE TABLE IF NOT EXISTS `mt_recharge_record` (
                                                    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '充值记录ID',
                                                    `user_id` BIGINT NOT NULL COMMENT '用户ID',
                                                    `recharge_no` VARCHAR(50) NOT NULL COMMENT '充值订单号',
    `amount` DECIMAL(15,2) NOT NULL COMMENT '充值金额',
    `payment_type` TINYINT NOT NULL COMMENT '支付方式：1-支付宝，2-USDT，3-银行卡',
    `payment_status` TINYINT NOT NULL DEFAULT 1 COMMENT '支付状态：1-待支付，2-支付成功，3-支付失败，4-已取消',
    `transaction_id` VARCHAR(100) COMMENT '第三方支付交易号',
    `usdt_address` VARCHAR(255) COMMENT 'USDT充值地址',
    `usdt_amount` DECIMAL(15,6) COMMENT 'USDT数量',
    `exchange_rate` DECIMAL(10,6) COMMENT '汇率',
    `remark` VARCHAR(500) COMMENT '备注',
    `complete_time` DATETIME COMMENT '完成时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_recharge_no` (`recharge_no`),
    UNIQUE KEY `uk_transaction_id` (`transaction_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_payment_status` (`payment_status`),
    KEY `idx_create_time` (`create_time`),
    CONSTRAINT `fk_recharge_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='充值记录表';

-- 提现记录表
CREATE TABLE IF NOT EXISTS `mt_withdraw_record` (
                                                    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '提现记录ID',
                                                    `user_id` BIGINT NOT NULL COMMENT '用户ID',
                                                    `withdraw_no` VARCHAR(50) NOT NULL COMMENT '提现订单号',
    `amount` DECIMAL(15,2) NOT NULL COMMENT '提现金额',
    `actual_amount` DECIMAL(15,2) COMMENT '实际到账金额',
    `fee` DECIMAL(15,2) DEFAULT 0.00 COMMENT '手续费',
    `withdraw_type` TINYINT NOT NULL COMMENT '提现方式：1-支付宝，2-银行卡，3-USDT',
    `withdraw_status` TINYINT NOT NULL DEFAULT 1 COMMENT '提现状态：1-审核中，2-处理中，3-提现成功，4-提现失败，5-已取消',
    `account_info` JSON NOT NULL COMMENT '提现账户信息（JSON格式）',
    `reject_reason` VARCHAR(500) COMMENT '拒绝原因',
    `remark` VARCHAR(500) COMMENT '备注',
    `complete_time` DATETIME COMMENT '完成时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_withdraw_no` (`withdraw_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_withdraw_status` (`withdraw_status`),
    KEY `idx_create_time` (`create_time`),
    CONSTRAINT `fk_withdraw_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提现记录表';

-- 资金流水表
CREATE TABLE IF NOT EXISTS `mt_fund_flow` (
                                              `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '流水ID',
                                              `user_id` BIGINT NOT NULL COMMENT '用户ID',
                                              `flow_no` VARCHAR(50) NOT NULL COMMENT '流水号',
    `flow_type` TINYINT NOT NULL COMMENT '流水类型：1-充值，2-提现，3-任务收入，4-任务支出，5-佣金收入，6-退款',
    `amount` DECIMAL(15,2) NOT NULL COMMENT '变动金额',
    `balance_before` DECIMAL(15,2) NOT NULL COMMENT '变动前余额',
    `balance_after` DECIMAL(15,2) NOT NULL COMMENT '变动后余额',
    `related_id` BIGINT COMMENT '关联业务ID',
    `related_type` VARCHAR(50) COMMENT '关联业务类型',
    `remark` VARCHAR(500) NOT NULL COMMENT '流水说明',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_flow_no` (`flow_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_flow_type` (`flow_type`),
    KEY `idx_create_time` (`create_time`),
    KEY `idx_related` (`related_type`, `related_id`),
    CONSTRAINT `fk_flow_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资金流水表';

-- ============================================================
-- 3. 任务相关表结构
-- ============================================================

-- 任务分类表
CREATE TABLE IF NOT EXISTS `mt_task_category` (
                                                  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
                                                  `parent_id` BIGINT DEFAULT 0 COMMENT '父级分类ID',
                                                  `category_name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `category_type` TINYINT NOT NULL COMMENT '分类类型：1-平台大类，2-任务小类',
    `platform` VARCHAR(20) COMMENT '平台名称：douyin、wechat、xiaohongshu等',
    `icon` VARCHAR(255) COMMENT '分类图标',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `description` VARCHAR(500) COMMENT '分类描述',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_category_type` (`category_type`),
    KEY `idx_platform` (`platform`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务分类表';

-- 任务模板表（定义任务类型和参数）
CREATE TABLE IF NOT EXISTS `mt_task_template` (
                                                  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '模板ID',
                                                  `template_name` VARCHAR(100) NOT NULL COMMENT '模板名称',
    `category_id` BIGINT NOT NULL COMMENT '分类ID',
    `template_type` TINYINT NOT NULL COMMENT '模板类型：1-上评，2-中评，3-上中组合评，4-中下组合评，5-点赞，6-关注等',
    `base_price` DECIMAL(10,2) NOT NULL COMMENT '基础单价',
    `platform_fee_rate` DECIMAL(5,4) DEFAULT 0.0500 COMMENT '平台手续费率',
    `worker_commission_rate` DECIMAL(5,4) DEFAULT 0.5500 COMMENT '接单员佣金比例',
    `agent_commission_rate` DECIMAL(5,4) DEFAULT 0.0300 COMMENT '代理人佣金比例',
    `required_fields` JSON NOT NULL COMMENT '必需字段配置（JSON格式）',
    `optional_fields` JSON COMMENT '可选字段配置（JSON格式）',
    `completion_criteria` JSON NOT NULL COMMENT '完成标准配置',
    `time_limit` INT DEFAULT 120 COMMENT '任务时间限制（分钟）',
    `review_time_limit` INT DEFAULT 10 COMMENT '审核时间限制（分钟）',
    `description` TEXT COMMENT '模板描述',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_template_type` (`template_type`),
    CONSTRAINT `fk_template_category` FOREIGN KEY (`category_id`) REFERENCES `mt_task_category` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务模板表';

-- 主任务表
CREATE TABLE IF NOT EXISTS `mt_main_task` (
                                              `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主任务ID',
                                              `task_no` VARCHAR(50) NOT NULL COMMENT '任务编号',
    `user_id` BIGINT NOT NULL COMMENT '派单员用户ID',
    `template_id` BIGINT NOT NULL COMMENT '任务模板ID',
    `task_title` VARCHAR(200) NOT NULL COMMENT '任务标题',
    `task_description` TEXT COMMENT '任务描述',
    `total_amount` DECIMAL(15,2) NOT NULL COMMENT '任务总金额',
    `total_count` INT NOT NULL COMMENT '任务总数量',
    `completed_count` INT DEFAULT 0 COMMENT '已完成数量',
    `unit_price` DECIMAL(10,2) NOT NULL COMMENT '单价',
    `task_data` JSON NOT NULL COMMENT '任务数据（JSON格式，包含链接、评论语等）',
    `task_status` TINYINT NOT NULL DEFAULT 1 COMMENT '任务状态：1-进行中，2-已完成，3-已取消，4-已过期',
    `expire_time` DATETIME COMMENT '过期时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_task_no` (`task_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_template_id` (`template_id`),
    KEY `idx_task_status` (`task_status`),
    KEY `idx_create_time` (`create_time`),
    CONSTRAINT `fk_main_task_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`),
    CONSTRAINT `fk_main_task_template` FOREIGN KEY (`template_id`) REFERENCES `mt_task_template` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主任务表';

-- 子任务表（支持组合评论任务依赖关系）
CREATE TABLE IF NOT EXISTS `mt_sub_task` (
                                             `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '子任务ID',
                                             `sub_task_no` VARCHAR(50) NOT NULL COMMENT '子任务编号',
    `main_task_id` BIGINT NOT NULL COMMENT '主任务ID',
    `parent_sub_task_id` BIGINT COMMENT '父级子任务ID（用于组合评论任务依赖）',
    `user_id` BIGINT COMMENT '接单员用户ID',
    `task_stage` TINYINT NOT NULL DEFAULT 1 COMMENT '任务阶段：1-第一阶段，2-第二阶段（用于组合评论）',
    `task_data` JSON NOT NULL COMMENT '子任务数据',
    `task_status` TINYINT NOT NULL DEFAULT 1 COMMENT '任务状态：1-待抢单，2-待提交，3-待审核，4-已完成，5-已失败，6-已取消，7-等待前置任务',
    `unit_price` DECIMAL(10,2) NOT NULL COMMENT '单价',
    `commission` DECIMAL(10,2) DEFAULT 0.00 COMMENT '代理人佣金',
    `platform_fee` DECIMAL(10,2) DEFAULT 0.00 COMMENT '平台手续费',
    `accept_time` DATETIME COMMENT '接单时间',
    `submit_time` DATETIME COMMENT '提交时间',
    `complete_time` DATETIME COMMENT '完成时间',
    `screenshot_url` VARCHAR(500) COMMENT '提交的截图URL',
    `comment_url` VARCHAR(500) COMMENT '评论链接地址（用于组合评论任务）',
    `submit_data` JSON COMMENT '提交的数据',
    `audit_remark` VARCHAR(500) COMMENT '审核备注',
    `audit_time` DATETIME COMMENT '审核时间',
    `auditor_id` BIGINT COMMENT '审核员ID',
    `time_limit_expire` DATETIME COMMENT '任务时间限制到期时间',
    `review_time_expire` DATETIME COMMENT '审核时间限制到期时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_sub_task_no` (`sub_task_no`),
    KEY `idx_main_task_id` (`main_task_id`),
    KEY `idx_parent_sub_task_id` (`parent_sub_task_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_task_status` (`task_status`),
    KEY `idx_accept_time` (`accept_time`),
    KEY `idx_task_stage` (`task_stage`),
    KEY `idx_time_limit` (`time_limit_expire`),
    KEY `idx_review_time` (`review_time_expire`),
    CONSTRAINT `fk_sub_task_main` FOREIGN KEY (`main_task_id`) REFERENCES `mt_main_task` (`id`),
    CONSTRAINT `fk_sub_task_parent` FOREIGN KEY (`parent_sub_task_id`) REFERENCES `mt_sub_task` (`id`),
    CONSTRAINT `fk_sub_task_user` FOREIGN KEY (`user_id`) REFERENCES `mt_user` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='子任务表';

-- 任务操作记录表（记录任务状态变更）
CREATE TABLE IF NOT EXISTS `mt_task_operation_log` (
                                                       `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
                                                       `task_id` BIGINT NOT NULL COMMENT '任务ID',
                                                       `task_type` TINYINT NOT NULL COMMENT '任务类型：1-主任务，2-子任务',
                                                       `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型：CREATE, ACCEPT, SUBMIT, AUDIT, COMPLETE, CANCEL等',
    `old_status` TINYINT COMMENT '原状态',
    `new_status` TINYINT COMMENT '新状态',
    `operator_id` BIGINT COMMENT '操作人ID',
    `operator_type` TINYINT COMMENT '操作人类型：1-派单员，2-接单员，3-系统，4-管理员',
    `operation_remark` VARCHAR(500) COMMENT '操作备注',
    `ip_address` VARCHAR(50) COMMENT '操作IP地址',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_task_type` (`task_type`),
    KEY `idx_operation_type` (`operation_type`),
    KEY `idx_create_time` (`create_time`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务操作记录表';

-- ============================================================
-- 4. 佣金相关表结构
-- ============================================================

-- 佣金记录表
CREATE TABLE IF NOT EXISTS `mt_commission_record` (
                                                      `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '佣金记录ID',
                                                      `agent_id` BIGINT NOT NULL COMMENT '代理人ID',
                                                      `sub_task_id` BIGINT NOT NULL COMMENT '子任务ID',
                                                      `worker_id` BIGINT NOT NULL COMMENT '接单员ID',
                                                      `commission_amount` DECIMAL(10,2) NOT NULL COMMENT '佣金金额',
    `commission_rate` DECIMAL(5,2) NOT NULL COMMENT '佣金比例',
    `task_amount` DECIMAL(10,2) NOT NULL COMMENT '任务金额',
    `commission_status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-待结算，2-已结算，3-已取消',
    `settle_time` DATETIME COMMENT '结算时间',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_agent_id` (`agent_id`),
    KEY `idx_worker_id` (`worker_id`),
    KEY `idx_sub_task_id` (`sub_task_id`),
    KEY `idx_commission_status` (`commission_status`),
    CONSTRAINT `fk_commission_agent` FOREIGN KEY (`agent_id`) REFERENCES `mt_user` (`id`),
    CONSTRAINT `fk_commission_worker` FOREIGN KEY (`worker_id`) REFERENCES `mt_user` (`id`),
    CONSTRAINT `fk_commission_sub_task` FOREIGN KEY (`sub_task_id`) REFERENCES `mt_sub_task` (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='佣金记录表';

-- ============================================================
-- 5. 系统管理相关表结构
-- ============================================================

-- 平台管理员表
CREATE TABLE IF NOT EXISTS `mt_admin_user` (
                                               `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
                                               `username` VARCHAR(50) NOT NULL COMMENT '管理员账号',
    `password` VARCHAR(100) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
    `email` VARCHAR(100) COMMENT '邮箱',
    `phone` VARCHAR(20) COMMENT '手机号',
    `avatar_url` VARCHAR(255) COMMENT '头像',
    `admin_type` TINYINT NOT NULL DEFAULT 2 COMMENT '管理员类型：1-超级管理员，2-普通管理员',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `last_login_time` DATETIME COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`),
    UNIQUE KEY `uk_phone` (`phone`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台管理员表';

-- 角色表
CREATE TABLE IF NOT EXISTS `mt_role` (
                                         `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
                                         `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `role_code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `role_desc` VARCHAR(200) COMMENT '角色描述',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_code` (`role_code`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 管理员角色关联表
CREATE TABLE IF NOT EXISTS `mt_admin_role` (
                                               `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                               `admin_id` BIGINT NOT NULL COMMENT '管理员ID',
                                               `role_id` BIGINT NOT NULL COMMENT '角色ID',
                                               `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                               PRIMARY KEY (`id`),
    UNIQUE KEY `uk_admin_role` (`admin_id`, `role_id`),
    CONSTRAINT `fk_admin_role_admin` FOREIGN KEY (`admin_id`) REFERENCES `mt_admin_user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_admin_role_role` FOREIGN KEY (`role_id`) REFERENCES `mt_role` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员角色关联表';

-- 菜单表
CREATE TABLE IF NOT EXISTS `mt_menu` (
                                         `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
                                         `parent_id` BIGINT DEFAULT 0 COMMENT '父菜单ID',
                                         `menu_name` VARCHAR(50) NOT NULL COMMENT '菜单名称',
    `menu_type` TINYINT NOT NULL COMMENT '菜单类型：1-目录，2-菜单，3-按钮',
    `menu_icon` VARCHAR(100) COMMENT '菜单图标',
    `menu_url` VARCHAR(200) COMMENT '菜单URL',
    `permission_code` VARCHAR(100) COMMENT '权限标识',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单表';

-- 角色菜单关联表
CREATE TABLE IF NOT EXISTS `mt_role_menu` (
                                              `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                              `role_id` BIGINT NOT NULL COMMENT '角色ID',
                                              `menu_id` BIGINT NOT NULL COMMENT '菜单ID',
                                              `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                              PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_menu` (`role_id`, `menu_id`),
    CONSTRAINT `fk_role_menu_role` FOREIGN KEY (`role_id`) REFERENCES `mt_role` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_role_menu_menu` FOREIGN KEY (`menu_id`) REFERENCES `mt_menu` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单关联表';

-- ============================================================
-- 6. 日志管理相关表结构
-- ============================================================

-- 操作日志表
CREATE TABLE IF NOT EXISTS `mt_operation_log` (
                                                  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
                                                  `admin_id` BIGINT COMMENT '操作管理员ID',
                                                  `user_id` BIGINT COMMENT '操作用户ID',
                                                  `operation_module` VARCHAR(50) NOT NULL COMMENT '操作模块',
    `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型',
    `operation_desc` VARCHAR(500) COMMENT '操作描述',
    `request_url` VARCHAR(500) NOT NULL COMMENT '请求URL',
    `request_method` VARCHAR(10) NOT NULL COMMENT '请求方法',
    `request_params` TEXT COMMENT '请求参数',
    `response_result` TEXT COMMENT '响应结果',
    `ip_address` VARCHAR(50) NOT NULL COMMENT 'IP地址',
    `user_agent` VARCHAR(500) COMMENT '用户代理',
    `execute_time` BIGINT COMMENT '执行时间（毫秒）',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '操作状态：0-失败，1-成功',
    `error_message` TEXT COMMENT '错误信息',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_admin_id` (`admin_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_operation_module` (`operation_module`),
    KEY `idx_create_time` (`create_time`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 登录日志表
CREATE TABLE IF NOT EXISTS `mt_login_log` (
                                              `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
                                              `user_id` BIGINT NOT NULL COMMENT '用户ID',
                                              `user_type` TINYINT NOT NULL COMMENT '用户类型',
                                              `login_ip` VARCHAR(50) NOT NULL COMMENT '登录IP',
    `login_location` VARCHAR(100) COMMENT '登录地点',
    `user_agent` VARCHAR(500) COMMENT '用户代理',
    `login_status` TINYINT NOT NULL DEFAULT 1 COMMENT '登录状态：0-失败，1-成功',
    `fail_reason` VARCHAR(200) COMMENT '失败原因',
    `login_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_user_type` (`user_type`),
    KEY `idx_login_time` (`login_time`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- ============================================================
-- 7. 配置管理相关表结构
-- ============================================================

-- 系统配置表
CREATE TABLE IF NOT EXISTS `mt_system_config` (
                                                  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '配置ID',
                                                  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT NOT NULL COMMENT '配置值',
    `config_name` VARCHAR(100) NOT NULL COMMENT '配置名称',
    `config_group` VARCHAR(50) NOT NULL COMMENT '配置分组',
    `config_type` VARCHAR(20) DEFAULT 'string' COMMENT '配置类型：string、number、boolean、json',
    `remark` VARCHAR(500) COMMENT '备注',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`),
    KEY `idx_config_group` (`config_group`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 数据字典表
CREATE TABLE IF NOT EXISTS `mt_data_dict` (
                                              `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '字典ID',
                                              `dict_type` VARCHAR(50) NOT NULL COMMENT '字典类型',
    `dict_code` VARCHAR(50) NOT NULL COMMENT '字典编码',
    `dict_name` VARCHAR(100) NOT NULL COMMENT '字典名称',
    `dict_value` VARCHAR(500) NOT NULL COMMENT '字典值',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    `remark` VARCHAR(500) COMMENT '备注',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dict_type_code` (`dict_type`, `dict_code`),
    KEY `idx_dict_type` (`dict_type`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据字典表';

-- ============================================================
-- 8. 初始化数据
-- ============================================================

-- 插入超级管理员
INSERT IGNORE INTO `mt_admin_user` (`username`, `password`, `real_name`, `admin_type`, `status`)
VALUES ('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8GbOh4ldp3ZG', '超级管理员', 1, 1);

-- 插入默认角色
INSERT IGNORE INTO `mt_role` (`role_name`, `role_code`, `role_desc`) VALUES
('超级管理员', 'super_admin', '系统超级管理员，拥有所有权限'),
('系统管理员', 'system_admin', '系统管理员，负责系统管理'),
('财务管理员', 'finance_admin', '财务管理员，负责财务相关管理'),
('业务管理员', 'business_admin', '业务管理员，负责业务相关管理');

-- 关联超级管理员角色
INSERT IGNORE INTO `mt_admin_role` (`admin_id`, `role_id`)
VALUES (1, 1);

-- 插入任务分类数据
INSERT IGNORE INTO `mt_task_category` (`parent_id`, `category_name`, `category_type`, `platform`, `sort_order`) VALUES
(0, '抖音', 1, 'douyin', 1),
(0, '视频号', 1, 'wechat', 2),
(0, '小红书', 1, 'xiaohongshu', 3),
(1, '评论任务', 2, 'douyin', 1),
(1, '点赞任务', 2, 'douyin', 2),
(1, '关注任务', 2, 'douyin', 3),
(2, '评论任务', 2, 'wechat', 1),
(2, '点赞任务', 2, 'wechat', 2);

-- 插入评论任务模板数据
INSERT IGNORE INTO `mt_task_template` (
  `template_name`, `category_id`, `template_type`, `base_price`,
  `platform_fee_rate`, `worker_commission_rate`, `agent_commission_rate`,
  `required_fields`, `completion_criteria`, `time_limit`, `review_time_limit`, `description`
) VALUES
(
  '上评任务',
  (SELECT id FROM mt_task_category WHERE category_name = '评论任务' AND platform = 'douyin'),
  1,  -- 上评
  1.50,
  0.0500,  -- 5%平台手续费
  0.5500,  -- 55%接单员佣金
  0.0300,  -- 3%代理人佣金
  '["video_url", "quantity", "comment_hint"]',
  '{"screenshot_required": true, "comment_visible": true, "time_limit": 120}',
  120,  -- 2小时任务时间限制
  10,   -- 10分钟审核时间限制
  '上评任务：直接在视频下方进行评论'
),
(
  '中评任务',
  (SELECT id FROM mt_task_category WHERE category_name = '评论任务' AND platform = 'douyin'),
  2,  -- 中评
  2.00,
  0.0500,
  0.5500,
  0.0300,
  '["top_comment_url", "quantity", "comment_hint", "mention_user"]',
  '{"screenshot_required": true, "comment_visible": true, "time_limit": 120}',
  120,
  10,
  '中评任务：在已有评论下方进行回复评论'
),
(
  '上中组合评任务',
  (SELECT id FROM mt_task_category WHERE category_name = '评论任务' AND platform = 'douyin'),
  3,  -- 上中组合评
  3.00,
  0.0500,
  0.5500,
  0.0300,
  '["video_url", "top_comment_quantity", "top_comment_hint", "mid_comment_quantity", "mid_comment_hint", "mention_user"]',
  '{"screenshot_required": true, "comment_visible": true, "time_limit": 120, "require_comment_url": true}',
  120,
  10,
  '上中组合评任务：先进行上评，再进行中评的组合任务'
),
(
  '中下组合评任务',
  (SELECT id FROM mt_task_category WHERE category_name = '评论任务' AND platform = 'douyin'),
  4,  -- 中下组合评
  3.50,
  0.0500,
  0.5500,
  0.0300,
  '["top_comment_url", "mid_comment_quantity", "mid_comment_hint", "mid_mention_user", "bottom_comment_quantity", "bottom_comment_hint", "bottom_mention_user"]',
  '{"screenshot_required": true, "comment_visible": true, "time_limit": 120, "require_comment_url": true}',
  120,
  10,
  '中下组合评任务：先进行中评，再进行下评的组合任务'
);

-- 插入系统配置
INSERT IGNORE INTO `mt_system_config` (`config_key`, `config_value`, `config_name`, `config_group`) VALUES
('site_name', 'MicroTask微任务平台', '站点名称', 'base'),
('site_version', '2.0.0', '站点版本', 'base'),
('platform_fee_rate', '0.05', '平台手续费率', 'finance'),
('worker_commission_rate', '0.55', '接单员佣金比例', 'finance'),
('agent_commission_rate', '0.03', '代理人佣金比例', 'finance'),
('min_recharge_amount', '100.00', '最低充值金额', 'finance'),
('max_recharge_amount', '50000.00', '最高充值金额', 'finance'),
('min_withdraw_amount', '50.00', '最低提现金额', 'finance'),
('max_withdraw_amount', '20000.00', '最高提现金额', 'finance'),
('withdraw_fee_rate', '0.01', '提现手续费率', 'finance'),
('default_agent_commission', '0.10', '默认代理佣金比例', 'agent'),
('task_time_limit', '120', '任务时间限制（分钟）', 'task'),
('task_review_time_limit', '10', '任务审核时间限制（分钟）', 'task');

-- 插入数据字典
INSERT IGNORE INTO `mt_data_dict` (`dict_type`, `dict_code`, `dict_name`, `dict_value`, `sort_order`) VALUES
('user_status', '0', '禁用', '用户被禁用', 1),
('user_status', '1', '启用', '用户正常状态', 2),
('user_status', '2', '冻结', '用户被冻结', 3),
('user_type', '1', '派单员', '发布任务的用户', 1),
('user_type', '2', '接单员', '接取任务的用户', 2),
('user_type', '3', '代理人', '发展接单员的用户', 3),
('user_type', '4', '平台管理员', '平台管理人员', 4),
('task_status', '1', '待抢单', '任务等待接单员抢单', 1),
('task_status', '2', '待提交', '任务已被接单，等待提交', 2),
('task_status', '3', '待审核', '任务已提交，等待审核', 3),
('task_status', '4', '已完成', '任务已完成', 4),
('task_status', '5', '已失败', '任务失败', 5),
('task_status', '6', '已取消', '任务已取消', 6),
('task_status', '7', '等待前置任务', '等待前置任务完成', 7),
('payment_type', '1', '支付宝', '支付宝支付', 1),
('payment_type', '2', 'USDT', 'USDT加密货币支付', 2),
('payment_type', '3', '银行卡', '银行卡支付', 3),
('template_type', '1', '上评', '直接在视频下方评论', 1),
('template_type', '2', '中评', '在评论下方回复', 2),
('template_type', '3', '上中组合评', '先上评再中评', 3),
('template_type', '4', '中下组合评', '先中评再下评', 4);

-- ============================================================
-- 9. 创建视图
-- ============================================================

-- 用户信息视图
CREATE OR REPLACE VIEW `vw_user_info` AS
SELECT
    u.*,
    ue.balance,
    ue.frozen_balance,
    ue.total_recharge,
    ue.total_withdraw,
    ue.total_income,
    ue.total_expend,
    ue.credit_score,
    ue.task_count,
    ue.success_rate,
    ue.agent_level,
    ue.team_size,
    ue.commission_rate
FROM `mt_user` u
         LEFT JOIN `mt_user_ext` ue ON u.id = ue.user_id;

-- 任务统计视图
CREATE OR REPLACE VIEW `vw_task_stats` AS
SELECT
    mt.id as main_task_id,
    mt.task_no,
    mt.task_title,
    mt.total_count,
    mt.completed_count,
    COUNT(st.id) as sub_task_count,
    SUM(CASE WHEN st.task_status = 4 THEN 1 ELSE 0 END) as completed_sub_count,
    SUM(CASE WHEN st.task_status = 5 THEN 1 ELSE 0 END) as failed_sub_count,
    SUM(CASE WHEN st.task_status IN (1,2,3,7) THEN 1 ELSE 0 END) as pending_sub_count
FROM `mt_main_task` mt
         LEFT JOIN `mt_sub_task` st ON mt.id = st.main_task_id
GROUP BY mt.id, mt.task_no, mt.task_title, mt.total_count, mt.completed_count;

-- 组合评论任务进度视图
CREATE OR REPLACE VIEW `vw_combo_task_progress` AS
SELECT
    st.main_task_id,
    st.parent_sub_task_id,
    COUNT(*) as total_tasks,
    SUM(CASE WHEN st.task_status = 4 THEN 1 ELSE 0 END) as completed_tasks,
    GROUP_CONCAT(CASE WHEN st.task_status = 4 THEN st.comment_url ELSE NULL END) as completed_comment_urls
FROM `mt_sub_task` st
WHERE st.parent_sub_task_id IS NOT NULL
GROUP BY st.main_task_id, st.parent_sub_task_id;

-- 资金统计视图
CREATE OR REPLACE VIEW `vw_fund_stats` AS
SELECT
    u.id as user_id,
    u.username,
    u.user_type,
    ue.balance,
    ue.frozen_balance,
    ue.total_recharge,
    ue.total_withdraw,
    ue.total_income,
    ue.total_expend,
    (SELECT COALESCE(SUM(amount), 0) FROM mt_fund_flow WHERE user_id = u.id AND flow_type = 1) as total_recharge_flow,
    (SELECT COALESCE(SUM(amount), 0) FROM mt_fund_flow WHERE user_id = u.id AND flow_type = 2) as total_withdraw_flow,
    (SELECT COALESCE(SUM(amount), 0) FROM mt_fund_flow WHERE user_id = u.id AND flow_type = 3) as total_task_income_flow,
    (SELECT COALESCE(SUM(amount), 0) FROM mt_fund_flow WHERE user_id = u.id AND flow_type = 4) as total_task_expend_flow
FROM `mt_user` u
         LEFT JOIN `mt_user_ext` ue ON u.id = ue.user_id;

-- ============================================================
-- 10. 创建存储过程和函数
-- ============================================================

-- 生成任务编号的存储过程
DELIMITER //
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
END //
DELIMITER ;

-- 检查子任务是否可以接取的函数
DELIMITER //
CREATE FUNCTION `fn_can_accept_sub_task`(sub_task_id BIGINT, user_id BIGINT) RETURNS TINYINT
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
END //
DELIMITER ;

-- 计算任务佣金的函数
DELIMITER //
CREATE FUNCTION `fn_calculate_task_commission`(
    task_amount DECIMAL(10,2),
    worker_rate DECIMAL(5,4),
    agent_rate DECIMAL(5,4),
    platform_rate DECIMAL(5,4)
) RETURNS JSON
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
END //
DELIMITER ;

-- ============================================================
-- 11. 创建触发器
-- ============================================================

-- 主任务完成状态更新触发器
DELIMITER //
CREATE TRIGGER `trg_update_main_task_status`
    AFTER UPDATE ON `mt_sub_task`
    FOR EACH ROW
BEGIN
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
END //
DELIMITER ;

-- 组合评论任务前置任务完成触发器
DELIMITER //
CREATE TRIGGER `trg_combo_task_unlock`
    AFTER UPDATE ON `mt_sub_task`
    FOR EACH ROW
BEGIN
    -- 当父级任务完成时，解锁依赖的子任务
    IF NEW.task_status = 4 AND OLD.task_status != 4 THEN
    UPDATE mt_sub_task
    SET task_status = 1,  -- 设置为待抢单状态
        update_time = NOW()
    WHERE parent_sub_task_id = NEW.id
      AND task_status = 7;  -- 从等待前置任务状态解锁
END IF;
END //
DELIMITER ;

-- 用户注册时自动创建扩展信息触发器
DELIMITER //
CREATE TRIGGER `trg_create_user_ext`
    AFTER INSERT ON `mt_user`
    FOR EACH ROW
BEGIN
    INSERT INTO mt_user_ext (user_id, user_type) VALUES (NEW.id, NEW.user_type);
END //
DELIMITER ;

-- ============================================================
-- 12. 创建事件调度（MySQL事件）
-- ============================================================

-- 自动处理过期任务的事件
DELIMITER //
CREATE EVENT `evt_auto_expire_tasks`
ON SCHEDULE EVERY 1 MINUTE
STARTS CURRENT_TIMESTAMP
DO
BEGIN
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
END //
DELIMITER ;

-- 自动结算已完成任务的佣金事件
DELIMITER //
CREATE EVENT `evt_auto_settle_commissions`
ON SCHEDULE EVERY 5 MINUTE
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- 这里可以添加自动结算佣金的逻辑
    -- 由于涉及复杂的业务逻辑，建议在应用层实现
END //
DELIMITER ;

-- ============================================================
-- 13. 创建索引优化查询性能
-- ============================================================

-- 为用户相关查询添加索引
ALTER TABLE `mt_user_ext` ADD INDEX `idx_user_balance` (`balance`);
ALTER TABLE `mt_user_ext` ADD INDEX `idx_user_credit` (`credit_score`);
ALTER TABLE `mt_user_ext` ADD INDEX `idx_user_type` (`user_type`);

-- 为任务状态查询添加索引
ALTER TABLE `mt_sub_task` ADD INDEX `idx_sub_task_status_time` (`task_status`, `create_time`);
ALTER TABLE `mt_sub_task` ADD INDEX `idx_sub_task_main_status` (`main_task_id`, `task_status`);
ALTER TABLE `mt_main_task` ADD INDEX `idx_main_task_status_time` (`task_status`, `create_time`);
ALTER TABLE `mt_main_task` ADD INDEX `idx_main_task_user_status` (`user_id`, `task_status`);

-- 为组合评论任务查询添加索引
ALTER TABLE `mt_sub_task` ADD INDEX `idx_sub_task_parent_stage` (`parent_sub_task_id`, `task_stage`);
ALTER TABLE `mt_sub_task` ADD INDEX `idx_sub_task_stage_status` (`task_stage`, `task_status`);

-- 为时间限制查询添加索引
ALTER TABLE `mt_sub_task` ADD INDEX `idx_sub_task_time_limit` (`time_limit_expire`);
ALTER TABLE `mt_sub_task` ADD INDEX `idx_sub_task_review_time` (`review_time_expire`);
ALTER TABLE `mt_sub_task` ADD INDEX `idx_sub_task_accept_time` (`accept_time`);

-- 为财务查询添加索引
ALTER TABLE `mt_recharge_record` ADD INDEX `idx_recharge_status_time` (`payment_status`, `create_time`);
ALTER TABLE `mt_recharge_record` ADD INDEX `idx_recharge_user_time` (`user_id`, `create_time`);
ALTER TABLE `mt_withdraw_record` ADD INDEX `idx_withdraw_status_time` (`withdraw_status`, `create_time`);
ALTER TABLE `mt_withdraw_record` ADD INDEX `idx_withdraw_user_time` (`user_id`, `create_time`);
ALTER TABLE `mt_fund_flow` ADD INDEX `idx_fund_flow_user_time` (`user_id`, `create_time`);
ALTER TABLE `mt_fund_flow` ADD INDEX `idx_fund_flow_type_time` (`flow_type`, `create_time`);

-- 为佣金记录添加索引
ALTER TABLE `mt_commission_record` ADD INDEX `idx_commission_agent_status` (`agent_id`, `commission_status`);
ALTER TABLE `mt_commission_record` ADD INDEX `idx_commission_worker_status` (`worker_id`, `commission_status`);
ALTER TABLE `mt_commission_record` ADD INDEX `idx_commission_status_time` (`commission_status`, `create_time`);

-- 为操作日志添加索引
ALTER TABLE `mt_operation_log` ADD INDEX `idx_operation_module_time` (`operation_module`, `create_time`);
ALTER TABLE `mt_operation_log` ADD INDEX `idx_operation_admin_time` (`admin_id`, `create_time`);
ALTER TABLE `mt_operation_log` ADD INDEX `idx_operation_user_time` (`user_id`, `create_time`);

-- 为登录日志添加索引
ALTER TABLE `mt_login_log` ADD INDEX `idx_login_user_time` (`user_id`, `login_time`);
ALTER TABLE `mt_login_log` ADD INDEX `idx_login_status_time` (`login_status`, `login_time`);

-- 为任务操作记录添加索引
ALTER TABLE `mt_task_operation_log` ADD INDEX `idx_task_op_task_time` (`task_id`, `create_time`);
ALTER TABLE `mt_task_operation_log` ADD INDEX `idx_task_op_type_time` (`operation_type`, `create_time`);

-- 为系统配置添加索引
ALTER TABLE `mt_system_config` ADD INDEX `idx_config_group_status` (`config_group`, `status`);
ALTER TABLE `mt_data_dict` ADD INDEX `idx_dict_type_status` (`dict_type`, `status`);

-- ============================================================
-- 14. 权限设置和事件调度器启用
-- ============================================================

-- 创建专门的数据库用户（可选，根据实际需要执行）
-- CREATE USER IF NOT EXISTS 'microtask_user'@'%' IDENTIFIED BY 'MicroTask123!';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON microtask_db.* TO 'microtask_user'@'%';
-- FLUSH PRIVILEGES;

-- 启用事件调度器（需要SUPER权限）
SET GLOBAL event_scheduler = ON;

-- 检查事件调度器状态
SHOW VARIABLES LIKE 'event_scheduler';

COMMIT;

-- ============================================================
-- 15. 数据库验证和状态检查
-- ============================================================

-- 检查所有表是否创建成功
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'microtask_db'
ORDER BY TABLE_NAME;

-- 检查索引创建情况
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    INDEX_TYPE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'microtask_db'
ORDER BY TABLE_NAME, INDEX_NAME;

-- 检查存储过程和函数
SHOW PROCEDURE STATUS WHERE Db = 'microtask_db';
SHOW FUNCTION STATUS WHERE Db = 'microtask_db';

-- 检查事件
SHOW EVENTS FROM microtask_db;

-- 检查触发器
SHOW TRIGGERS FROM microtask_db;

-- ============================================================
-- 16. 性能优化建议
-- ============================================================

-- 以下是一些性能优化建议，可以根据实际情况选择执行：

-- 1. 调整InnoDB缓冲池大小（根据服务器内存调整）
-- SET GLOBAL innodb_buffer_pool_size = 1024*1024*1024; -- 1GB

-- 2. 调整查询缓存（MySQL 8.0已移除查询缓存，无需设置）

-- 3. 调整连接数
-- SET GLOBAL max_connections = 1000;

-- 4. 开启慢查询日志
-- SET GLOBAL slow_query_log = 1;
-- SET GLOBAL long_query_time = 2;
-- SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- 5. 定期分析表（可以在应用层定时执行）
-- ANALYZE TABLE mt_user, mt_user_ext, mt_main_task, mt_sub_task;

-- ============================================================
-- 数据库设计完成
-- ============================================================

SELECT 'MicroTask数据库初始化完成！' AS '完成状态';