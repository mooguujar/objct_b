'use strict';
module.exports = {
  /**
   * 获取用户信息（认证接口）
   * @url client/user/kh/getUserInfo
   */
  main: async (event) => {
    let { data = {}, userInfo, util } = event;
    let { vk, db } = util;
    let res = { code: 0, msg: "" };
    let { uid } = userInfo;
    
    res.data = await vk.baseDao.findById({
      dbName: "uni-id-users",
      id: uid,
      fieldJson: {
        username: true,
        nickname: true,
        avatar: true,
        mobile: true,
        gender: true,
        birthday: true
      }
    });
    return res;
  }
}