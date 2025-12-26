'use strict';
/**
 * 为了不引入其他npm包，这里使用最简单高效的方式进行路由
 * 此云函数的作用仅为配合前端生成支付参数、查询支付订单等API接口，请勿修改此云函数代码。
 */
const vk = require('./lib/vk-easy-router');
exports.main = async (event, context) => {
	return await vk.router({ event, context, vk });
};
/*
##### 以下为广告
##### 如果你热爱编程，想快速入门云开发，欢迎使用`vk-unicloud`系列开发框架
##### 无需转变开发习惯，0成本上手云开发。
##### 框架内置了众多API、工具包，为你的业务扫平障碍。使你的项目刚起步进度就是50%（微信登录、短信、验证码、缓存、生成小程序码等等）
##### 从此你又get一个新技能，只需用js，轻松搞定前后台整体业务。
##### `client端` 框架地址：https://ext.dcloud.net.cn/plugin?id=2204
##### `admin端`  框架地址：https://ext.dcloud.net.cn/plugin?id=5043
##### `client端` 框架文档：https://vkdoc.fsq.pub/client/
##### `admin端`  框架文档：https://vkdoc.fsq.pub/admin/
##### 框架学习Q群：`22466457` 欢迎萌新和大佬来使用和共同改进框架
*/
