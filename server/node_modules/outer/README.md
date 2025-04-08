## outer

[![npm](https://img.shields.io/npm/v/outer.svg)](https://www.npmjs.com/package/outer)

This package connects your node application to your slack or rocket.chat server and send your logs to specific channels or users.

#### rocket.chat
![rocketchat](https://user-images.githubusercontent.com/15351728/29752941-abaf6c3e-8b67-11e7-87b9-31bea04ccfd6.png)
#### slack
![slack](https://user-images.githubusercontent.com/15351728/29752943-ad2c4c6c-8b67-11e7-99c2-c39a233ff5e7.png)

### Options

| Name  |  Description |
|---|---|
| adapter  | rocket.chat or slack _(default)_ |
| channel  | #channel or @username |
| alias  | alias for username _(optional)_ |
| emoji  | avatar emoji _(optional)_ |

#### rocket.chat specific

| Name  |  Description |
|---|---|
| username  | username |
| password  | password |
| url  | URL from your rocket.chat server |

#### slack  specific

| Name  |  Description |
|---|---|
| token  | user token _(https://api.slack.com/custom-integrations/legacy-tokens)_ |

---

### Example
```javascript
const outer = require('outer');

// CONFIGURE ROCKET.CHAT LOGGER
const rocketChat = new outer({
    adapter: 'rocket.chat',
    url: 'https://chat.server.com',
    channel: '@username',
    emoji: ':smirk:',
    username: 'username',
    password: 'password'
});

// CONFIGURE SLACK LOGGER
const slack = new outer({
    // https://api.slack.com/custom-integrations/legacy-tokens
    token: 'xoxp-0000000000-00000000-000000000-00000000000',
    channel: '#random',
    alias: 'My custom username',
    emoji: ':smirk:'
});

rocketChat.log('Message from your *app*. Hi Rocket.Chat!');
slack.log('Message from your *app*. Hi Slack!');
```