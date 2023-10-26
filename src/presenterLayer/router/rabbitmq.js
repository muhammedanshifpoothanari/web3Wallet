const amqp = require("amqplib");

const { checkMyAccountAddress } = require('../../useCase/common/checkMyAccountAddress.js');
const { setYourAccount } = require('../../useCase/common/setYourAccount');
const { getAllowance } = require('../../useCase/common/getAllowance');
const { approve } = require('../../useCase/common/approve');
const { getBalanceOf } = require('../../useCase/common/getBalenceOf');
const { getTotalSupply } = require('../../useCase/common/getTotalSupply');
const { transfer } = require('../../useCase/common/transfer');
const { transferFrom } = require('../../useCase/common/transferFrom');
const { push } = require("./send.js");

const queues = {
  "myAccount": checkMyAccountAddress,
  "setYourAccount": setYourAccount,
  "getAllowance": getAllowance,
  "approve": approve,
  "getBalanceOf": getBalanceOf,
  "getTotalSupply": getTotalSupply,
  "transfer": transfer,
  "transferFrom": transferFrom,
};

(async () => {
  try {
    const connection = await amqp.connect("amqps://haupwjda:IrjIPpqYqTm1UsWy3ANv7cvsf1or5Dqc@puffin.rmq2.cloudamqp.com/haupwjda");
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    const handleQueue = async (queueName) => {
      await channel.assertQueue(queueName, { durable: false });
      await channel.consume(
        queueName,
        (message) => {
          if (message) {
            console.log(
              ` [x] Received from '${queueName}': ${JSON.parse(message.content.toString())}`
            );
            const dataFromMessage = JSON.parse(message.content.toString());

            const queueFunction = queues[queueName];
            if (queueFunction) {
              // Destructure the properties and pass them as separate arguments
              queueFunction(dataFromMessage.address, dataFromMessage.value).then((response)=> {
                console.log('got response',response);
                push(response)
              });
            } else {
              console.log(`No function defined for '${queueName}'`);
            }
          }
        },
        { noAck: true }
      );
    };

    for (const queue of Object.keys(queues)) {
      await handleQueue(queue);
    }

    console.log(" [*] Waiting for messages. To exit, press CTRL+C");
  } catch (err) {
    console.warn(err);
  }
})();
