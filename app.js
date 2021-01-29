const { App } = require("@slack/bolt");
const axios = require("axios").default;

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

if (process.env.DEBUG) {
  app.use(async (args) => {
    console.log(JSON.stringify(args));
    return await args.next();
  });
}

// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
  console.log("⚡️ hello invoked!");
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey there <@${message.user}>!`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Click Me",
          },
          action_id: "button_click",
        },
      },
    ],
    text: `Hey there <@${message.user}>!`,
  });
});

// Listen for a slash command invocation
app.command("/learn", async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();

  try {
    var searchText = payload.text;
    axios
      .get(
        `https://trailhead.salesforce.com/services/odata/v1/Content/Trailhead.ModuleContent?$filter=contains(Label,'${searchText}')&$top=5`
      )
      .then(function (response) {
        // handle success
        var blocks = [];
        var divider = { type: "divider" };
        var contentTemplate = {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "",
          },
          accessory: {
            type: "image",
            image_url: "",
            alt_text: "",
          },
        };
        var actionsTemplate = {
          type: "actions",
          elements: [
            {
              type: "button",
              style: "primary",
              text: {
                type: "plain_text",
                text: "Learn",
                emoji: true,
              },
              action_id: "learn",
              value: "0275bb0f-4784-834b-b62c-ed60eec2ea5f",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Favorite",
                emoji: true,
              },
              action_id: "favorite",
              value: "0275bb0f-4784-834b-b62c-ed60eec2ea5f",
            },
          ],
        };
        var values = response.data.value;
        for (var index = 0; index < values.length; index++) {
          var value = values[index];
          blocks.push(divider);
          var content = JSON.parse(JSON.stringify(contentTemplate));
          content.text.text = `*${value.Label}*\n${value.Description}`;
          content.accessory.image_url = value.ImageUrl;
          content.accessory.alt_text = value.Label;
          blocks.push(content);

          var actions = JSON.parse(JSON.stringify(actionsTemplate));
          actions.elements[0].value = value.Id;
          actions.elements[1].value = value.Id;
          blocks.push(actions);
        }

        app.client.chat.postEphemeral({
          token: context.botToken,
          // Channel to send message to
          channel: payload.channel_id,
          user: payload.user_id,
          // Include a button in the message (or whatever blocks you want!)
          attachments: [],
          blocks: blocks,
        });
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
