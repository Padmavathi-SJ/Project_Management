// const redis = require("redis");
// const client = redis.createClient({
//     host: '172.30.147.70',
//     port: 6379,        
// })

// client.on('connect',() => {
//     console.log("client connect to redis..")
// })

// client.on('error',(error) => {
//     console.log('An error occured while connecting to redis',error);
// })

// client.on('ready',() => {
//     console.log("client connected to redis, ready to use!");
// })

// client.on('end',() => {
//     console.log("client disconnected from redis")
// })

// process.on('SIGINT',() => {
//     client.quit()
// })

// client.connect() // it start the connect

// module.exports = client;