import {readConfig} from './config.mjs';
import {createApp} from './app.mjs';
const {host,port}=readConfig();
const server=createApp({logger:entry=>console.log(JSON.stringify(entry))});
server.listen(port,host,()=>console.log(JSON.stringify({event:'api_started',host,port})));
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{server.close(()=>process.exit(0));});
