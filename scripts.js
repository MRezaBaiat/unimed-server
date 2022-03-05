const { exec, spawn } = require('child_process');
const { pour } = require('std-pour');
const YAML = require('js-yaml');
const JSON2YAML = require('json2yaml');
const fs = require('fs');
const path = require('path');

const services = {
  'backend-service': {
    imageName: 'unimed-backend',
    deploymentName: 'backend-deployment',
    component: 'backend-service',
    deploymentFile: '~/Desktop/projects/unimed-server/k8s/backend-deployment.yaml',
    root: '~/Desktop/projects/unimed-server',
    context: '~/Desktop/projects/unimed-server'
  },
  adminpanel: {
    imageName: 'unimed-adminpanel',
    deploymentName: 'adminpanel-deployment',
    component: 'adminpanel-service',
    deploymentFile: '~/Desktop/projects/unimed-server/k8s/adminpanel-deployment.yaml',
    root: '~/Desktop/projects/unimed-admin',
    context: '~/Desktop/projects/unimed-admin'
  },
  pwa: {
    imageName: 'unimed-pwa',
    deploymentName: 'pwa-deployment',
    component: 'pwa-service',
    deploymentFile: '~/Desktop/projects/unimed-server/k8s/pwa-deployment.yaml',
    root: '~/Desktop/projects/unimed-aio',
    context: '~/Desktop/projects/unimed-aio'
  }
};
// arvan paas patch deployment adminpanel-deployment -p "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"date\":\"`date +'%s'`\"}}}}}"
const functions = {
  execute: async function (command, args = '', follow = false) {
    return new Promise((resolve, reject) => {
      if (follow) {
        pour(command, args.split(' ') || [], { timeout: 100000, shell: true }).then(code => code > 0 ? reject() : resolve());
      } else {
        exec(command + ' ' + args, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            return reject();
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            return reject();
          }
          resolve(stdout);
          console.log(`stdout: ${stdout}`);
        });
      }
    });
  },
  build: async function (serviceName) {
    const service = services[serviceName];
    await this.execute('tsc').catch(err => {});
    const imageName = service.imageName;
    if (!imageName) {
      throw new Error('name is empty!');
    }
    const imageTag = `unimed-registry-unimed.apps.ir-thr-at1.arvan.run/${imageName}:latest`;
    console.log('image name ' + imageName);
    const context = service.context;
    const dockerfile = service.root + '/Dockerfile';
    console.log('building with tag ' + imageTag + ', and file ' + path.dirname(dockerfile));
    await this.execute('arvan', 'paas project unimed', true);
    await this.execute('cd', `${context} && docker build -f ${dockerfile} -t ${imageTag} --build-arg CACHEBUST=$(date +%s) .`, true);
    await this.execute('docker', `push ${imageTag}`, true);
    await this.execute('arvan', 'paas delete deployment ' + service.deploymentName, true).catch(err => {});
    await this.execute('arvan', 'paas apply -f ' + service.deploymentFile);
  },
  'build:all:private': async function () {
    for (const serviceName of Object.keys(services)) {
      await this.build(serviceName);
    }
  },
  cleanup: async function () {
    for (const service of Object.values(services)) {
      await this.execute('arvan', 'paas cancel-build bc/' + service.buildConfigName).catch(e => {});
    }
    await this.execute('arvan', 'paas delete bc --all');
    const pods = await this.execute('arvan', 'paas get pods');
    const lines = pods.split('\n');
    for (const line of lines) {
      const podName = line.split('   ')[0];
      if (podName.endsWith('build')) {
        await this.execute('arvan', 'paas delete pod ' + podName);
      }
    }
  },
  logs: function (serviceName) {
    const service = services[serviceName];

    this.execute('arvan', 'paas logs deployment/' + service.deploymentName + ' --follow --pod-running-timeout=24h --tail=100', true).catch(() => {
      this.logs(serviceName);
    });
  },
  getImageName: async function (yamlFile) {
    const object = YAML.safeLoad(fs.readFileSync(yamlFile, 'utf8'));
    const container = object.spec.template.spec.containers[0];
    const splits = container.image.split(':')[0].split('/');
    return splits[splits.length - 1];
  },
  increaseVersion: async function (yamlFile) {
    const object = YAML.safeLoad(fs.readFileSync(yamlFile, 'utf8'));
    const container = object.spec.template.spec.containers[0];
    let currentVersion = container.image.split(':')[1];
    currentVersion = currentVersion === 'latest' ? '0.0.1' : currentVersion;
    const imageName = container.image.split(':')[0];
    currentVersion = `${currentVersion.split('.')[0]}.${currentVersion.split('.')[1]}.${Number(currentVersion.split('.')[2]) + 1}`;
    container.image = imageName + ':' + currentVersion;
    const yamlstr = YAML.safeDump(object);
    fs.writeFileSync(yamlFile, yamlstr, 'utf8');
    return container.image;
  },
  'build:docker': async function (tag, dockerfile, context) {
    console.log('building with tag ' + tag + ', and file ' + path.dirname(dockerfile));
    return this.execute('cd', `${context} && docker build -f ${dockerfile} -t ${tag} --build-arg CACHEBUST=$(date +%s) .`, true);
  },
  'push:docker': async function (tag, dockerfile, context) {
    console.log('building and pushing with tag ' + tag + ', and file ' + dockerfile);
    return this['build:docker'](tag, dockerfile, context).then(() => {
      return this.execute('docker', `push ${tag}`, true);
    });
  }
};

functions[process.argv[2]](...process.argv.splice(3, process.argv.length));
