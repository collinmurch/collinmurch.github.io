function t(e){if(!e)return"No date";const n=e instanceof Date?e:new Date(e);return isNaN(n.getTime())?"Invalid date":n.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}export{t as f};