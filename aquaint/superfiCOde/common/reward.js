const moment = require("moment");
const DB = require("./../common/dbmanager");
const DBManager = new DB();
const _ = require("lodash");
const { now } = require("moment");
const monthFormat = "YYYY-MM";

const checkReward = (user_id, reward_task, card_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      var resultReward = await DBManager.getData("user_reward_master", "user_reward_id, reward_info, is_completed", { _user_id: user_id, month_name: `${moment(new Date()).format(monthFormat)}` });
      var rowReward = resultReward?.rows || [];
      var rewardInfoData = [];
      // Create reward task json.
      if (!rowReward.length) {
        var resultTask = await DBManager.getData("reward_task_master", "reward_task_id", { is_active: 1 });
        var rowTask = resultTask?.rows || [];
        if (rowTask && rowTask.length) {
          var resultCard = await DBManager.getData("user_card_master", "user_card_id", { _user_id: user_id });
          var rowCard = resultCard?.rows || [];
          if (rowCard && rowCard.length) {
            await Promise.all(rowCard.map(async card => {
              let rewardInfo = {
                card_id: card?.user_card_id,
                is_completed: false
              }
              await Promise.all(rowTask.map(async task => {
                let taskInfo = {
                  reward_task_id: task.reward_task_id,
                  complete: false
                }
                if (task.reward_task_id == 1) {
                  taskInfo.count = 0;
                }
                return taskInfo;
              })).then(async (taskInfo) => {
                rewardInfo.tasks = taskInfo;
              })
              return rewardInfo;
            })).then(async (rewardInfo) => {
              rewardInfoData = JSON.parse(JSON.stringify(rewardInfo));
              let insertQry = {
                _user_id: user_id,
                month_name: `${moment(new Date()).format(monthFormat)}`,
                reward_info: JSON.stringify(rewardInfo),
              }
              await DBManager.dataInsert("user_reward_master", insertQry);
            })
          }
        }
      } else {
        // Update reward task json.
        var rewardInfoData = rowReward?.[0]?.reward_info;
        if (rewardInfoData && rewardInfoData.length) {
          var resultCard = await DBManager.getData("user_card_master", "user_card_id", { _user_id: user_id });
          var rowCard = resultCard?.rows || [];
          if (rowCard && rowCard.length) {
            await Promise.all(rowCard.map(async card => {
              var cardRewardExist = _.find(rewardInfoData, { card_id: card.user_card_id })
              if (!cardRewardExist) {
                var rewardTask = rewardInfoData?.[rewardInfoData.length - 1]?.tasks;
                await Promise.all(rewardTask.map(async task => {
                  if (task.reward_task_id == 2) {
                    task.complete = false;
                  }
                  return task;
                })).then(async (tasks) => {
                  let pushCardReward = {
                    card_id: card.user_card_id,
                    tasks: tasks,
                    is_completed: false
                  }
                  rewardInfoData.push(pushCardReward);
                })
              }
            })).then(async () => {
              await DBManager.dataUpdate("user_reward_master", { reward_info: JSON.stringify(rewardInfoData) }, { _user_id: user_id, month_name: `${moment(new Date()).format(monthFormat)}` });
            })
          }
        }
      }

      if (rewardInfoData && rewardInfoData.length) {
        // Task: Open SuperFi for 5 days in a row
        // Counts number of consecutive login.
        if (reward_task == "login") {
          var resultLoginDate = await DBManager.runQuery(`SELECT substring("logged_in_at", 1, 10) as login_date FROM users_login_history WHERE _user_id = '${user_id}' AND is_deleted = 0 AND
          date_part('month', logged_in_at::date) = date_part('month', now()::date) AND 
          date_part('year', logged_in_at::date) = date_part('year', now()::date)                                                
          GROUP BY substring("logged_in_at", 1, 10)`);
          var rowLoginDate = resultLoginDate?.rows || [];
          if (rowLoginDate && rowLoginDate.length) {
            var loginCount = await countConsecutiveLogin(rowLoginDate);
          }
        }
        await Promise.all(rewardInfoData.map(async rewardInfo => {
          var rewardTasks = rewardInfo?.tasks || [];
          if (rewardTasks && rewardTasks.length) {
            await Promise.all(rewardTasks.map(async tasks => {
              if (reward_task == "login") {
                if (tasks.reward_task_id == 1 && tasks.complete == false) {
                  tasks.count = loginCount;
                  tasks.complete = loginCount > 4 ? true : false;
                }
              }
              // Task: Make a payment towards your credit card balance.
              if(reward_task == "card_payment"){
                if(rewardInfo.card_id == card_id && tasks.reward_task_id == 2 && tasks.complete == false){
                  tasks.complete = true;
                }
              }
              // Task: Check your credit score this month.
              if(reward_task == "credit_score"){
                if(tasks.reward_task_id == 3 && tasks.complete == false){
                  tasks.complete = true;
                }
              }
            }))
            // Check if all task completed.
            var completedTask = _.filter(rewardTasks, { complete: true });
            if (completedTask.length == rewardTasks.length) {
              rewardInfo.is_completed = 1;
            }
          }
        })).then(async () => {
          await DBManager.dataUpdate("user_reward_master", { reward_info: JSON.stringify(rewardInfoData)}, { _user_id: user_id, month_name: `${moment(new Date()).format(monthFormat)}` });
          return resolve({ status: true, message: 'Reward info data updated.' });
        })
      }
    } catch (err) {
      return resolve({ status: false, message: err?.message || 'Reward task not updated.' });
    };
  });
}

const countConsecutiveLogin = (login_date_array) => {
  let count = 0
  login_date_array.reverse().forEach((element, index) => {
    if ((new Date().setUTCHours(0, 0, 0, 0) - new Date(element.login_date).setUTCHours(0, 0, 0, 0)) === index * 86400000)
      count++;
  })
  return count;
}

module.exports = {
  checkReward,
};