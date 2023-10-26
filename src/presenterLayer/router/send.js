const amqp = require("amqplib");


const push = async (res) => {
    const queue = res.queue;
    const data = res.data;

    const serializedData = convertBigIntsToNumbers(data);

    // Now, you can call JSON.stringify on the entire convertedData object
    const text = JSON.stringify(serializedData);
    let connection;
    try {
      connection = await amqp.connect("amqps://haupwjda:IrjIPpqYqTm1UsWy3ANv7cvsf1or5Dqc@puffin.rmq2.cloudamqp.com/haupwjda");
      const channel = await connection.createChannel();
      await channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(text)));
      console.log("[x] Sent '%s'", text);
      await channel.close();
    } catch (err) {
      console.warn(err);
    } finally {
      if (connection) await connection.close();
    }
  }
  
//   conver to serial data:


function convertBigIntsToNumbers(obj) {
    if (typeof obj === "object") {
      if (obj instanceof Map) {
        // Handle Map
        const result = new Map();
        for (const [key, value] of obj) {
          result.set(key, convertBigIntsToNumbers(value));
        }
        return result;
      } else if (obj instanceof Set) {
        // Handle Set
        const result = new Set();
        for (const value of obj) {
          result.add(convertBigIntsToNumbers(value));
        }
        return result;
      } else {
        // Handle Object
        const result = {};
        for (const key of Object.keys(obj)) {
          result[key] = convertBigIntsToNumbers(obj[key]);
        }
        return result;
      }
    } else if (typeof obj === "bigint") {
      // Convert BigInt to Number
      return Number(obj);
    } else {
      return obj;
    }
  }

  
  module.exports = { push };
  