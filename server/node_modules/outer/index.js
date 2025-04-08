const axios = require('axios');

class Outer {
  constructor(options) {
    // available clients
    this.clients = {
      'rocket.chat': {
        host: options.url + '/api/v1/',
        apiLogin: 'login',
        apiPostMessage: 'chat.postMessage'
      },
      slack: {
        host: options.url || 'https://slack.com/api/',
        apiPostMessage: 'chat.postMessage'
      }
    };

    // options
    this.options = {
      adapter: 'slack', // slack and rocket.chat
      username: '',
      password: '',
      channel: '', // #channel or @username
      alias: '',
      emoji: '',
      ...options
    };

    // rocket.chat token and userId
    this.authToken = null;
    this.userId = null;
  }

  /**
   * Get client config
   */
  client() {
    return this.clients[this.options.adapter];
  }

  /**
   * Authenticate user
   */
  authenticate() {
    return new Promise((resolve, reject) => {
      if (!this.authToken && !this.userId) {
        if (this.options.adapter === 'rocket.chat') {
          axios
            .post(this.client().host + this.client().apiLogin, {
              username: this.options.username,
              password: this.options.password
            })
            .then(res => {
              this.authToken = res.data.data.authToken;
              this.userId = res.data.data.userId;
              resolve();
            })
            .catch(error => {
              reject(error.Error);
            });
        } else if (this.options.adapter === 'slack') {
          resolve();
        } else {
          reject();
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * Post message to channel/user
   * @param {*} message
   */
  async log(message) {
    try {
      await this.authenticate();

      if (this.options.adapter === 'rocket.chat') {
        // set headers
        axios.defaults.headers.common['X-Auth-Token'] = this.authToken;
        axios.defaults.headers.common['X-User-Id'] = this.userId;

        // send new text
        axios
          .post(this.client().host + this.client().apiPostMessage, {
            alias: this.options.alias,
            channel: this.options.channel,
            emoji: this.options.emoji,
            text: message
          })
          .catch(error => {
            console.log(error.response.data);
          });
      } else if (this.options.adapter === 'slack') {
        // send new text
        axios
          .post(
            this.client().host + this.client().apiPostMessage,
            `token=${this.options.token}&username=${
              this.options.alias
            }&channel=${this.options.channel}&icon_emoji=${
              this.options.emoji
            }&text=${message}`
          )
          .catch(error => {
            console.log(error.response.data);
          });
      }
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Outer;
