const Shine = require('..');
const shine = new Shine();

const prompt = require('prompt-async');

async function init() {
  try {
    await shine.startAuth('+33 6 01 02 03 04', '1234');
    prompt.start();
    const { verifyCode } = await prompt.get(['verifyCode']);
    await shine.authNewDevice('+33 6 01 02 03 04', '1234', verifyCode);
    const testQuery = await shine.getCompanyProfile();
    console.log(testQuery);
  } catch (err) {
    console.log(err);
  }
}

init();
