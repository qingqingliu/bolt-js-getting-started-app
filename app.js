const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

if (process.env.DEBUG) {
  app.use(async (args) => {
    console.log(JSON.stringify(args));
    return await args.next();
  });
}

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  console.log('⚡️ hello invoked!');
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});



// Listen for a slash command invocation
app.command("/learn", async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    const result = await app.client.chat.postEphemeral({
      token: context.botToken,
      // Channel to send message to
      channel: payload.channel_id,
      user: payload.user_id,
      // Include a button in the message (or whatever blocks you want!)
      attachments: [],
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Finish connecting your Trailhead account"
          },
          accessory: {
            type: "button",
            style: "primary",
            text: {
              type: "plain_text",
              text: "Connect",
              emoji: true
            },
            url: "https://trailblazer.me",
            action_id: "button-login"
          }
        }
      ]
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();