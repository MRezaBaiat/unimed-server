const gateway = require('./src/modules/gateway/az.gateway').default;

new gateway(true).generateToken(5000, '111222').then(res => console.log(res.data)).catch(err => console.log(err.response));
