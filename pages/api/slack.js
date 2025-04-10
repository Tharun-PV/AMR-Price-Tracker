import { App } from "@slack/bolt";

// Initialize the Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Middleware to parse JSON bodies in Next.js
export const config = {
  api: {
    bodyParser: true,
  },
};

// Function to open the date range modal with a mobile-friendly layout
const openDateRangeModal = async (triggerId, userId) => {
  try {
    await app.client.views.open({
      trigger_id: triggerId,
      view: {
        type: "modal",
        callback_id: "date_range_modal",
        title: {
          type: "plain_text",
          text: "Select Date Range",
        },
        submit: {
          type: "plain_text",
          text: "Submit",
        },
        close: {
          type: "plain_text",
          text: "Cancel",
        },
        blocks: [
          {
            type: "section",
            block_id: "from_date_block",
            text: {
              type: "mrkdwn",
              text: "*Select the start date:*",
            },
            accessory: {
              type: "datepicker",
              action_id: "from_date",
              initial_date: new Date().toISOString().split("T")[0],
              placeholder: {
                type: "plain_text",
                text: "Choose a date",
              },
            },
          },
          {
            type: "section",
            block_id: "to_date_block",
            text: {
              type: "mrkdwn",
              text: "*Select the end date:*",
            },
            accessory: {
              type: "datepicker",
              action_id: "to_date",
              initial_date: new Date().toISOString().split("T")[0],
              placeholder: {
                type: "plain_text",
                text: "Choose a date",
              },
            },
          },
        ],
      },
    });
    console.log("Modal opened successfully for user:", userId);
  } catch (error) {
    console.error("Error opening modal:", error);
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body;

  // Handle URL verification challenge
  if (body.type === "url_verification") {
    console.log("Received URL verification challenge:", body.challenge);
    res.status(200).json({ challenge: body.challenge });
    return;
  }

  // Handle event callbacks (e.g., app_home_opened)
  if (body.type === "event_callback") {
    try {
      const event = body.event;
      if (event.type === "app_home_opened") {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
          (process.env.NODE_ENV === "development" ? "http://localhost:3000" : `${req.headers.host}`);
        const prices = await fetch(`${baseUrl}/api/price`).then(res => res.json());
        console.log("Price data fetched:", prices);
        const priceMap = {
          "DIAMOND": "-",
          "GOLD (18K)": "-",
          "GOLD (22K)": "-",
          "ROSEGOLD": "-",
          "SILVER": "-",
        };
        prices.forEach(item => {
          let key;
          switch (item.metaProdTypeName) {
            case "Gold":
              key = `GOLD (${item.purity.split("K")[0]}K)`;
              break;
            case "ROSEGOLD":
              key = "ROSEGOLD";
              break;
            case "Diamond":
              key = "DIAMOND";
              break;
            case "Silver":
              key = "SILVER";
              break;
            default:
              key = item.metaProdTypeName;
          }
          if (key) priceMap[key] = item.rate / item.unit || "-";
        });
        const currentDateTime = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        const currentDay = new Date().getDate();

        const homeText = `--------------------------------------\n` +
                         ` NAME                    PRICE                   \n` +
                         `--------------------------------------\n` +
                         ` DIAMOND            ₹ ${priceMap["DIAMOND"]} /gm\n` +
                         ` GOLD (18K)          ₹ ${priceMap["GOLD (18K)"]} /gm\n` +
                         ` GOLD (22K)          ₹ ${priceMap["GOLD (22K)"]} /gm\n` +
                         ` ROSEGOLD          ₹ ${priceMap["ROSEGOLD"]} /gm\n` +
                         ` SILVER                   ₹ ${priceMap["SILVER"]} /gm\n` +
                         `--------------------------------------`;
        if (homeText.length > 3000) {
          console.warn("Home text exceeds 3000 characters, truncating:", homeText.length);
        }

        res.status(200).json({});
        await app.client.views.publish({
          user_id: event.user,
          view: {
            type: "home",
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "💠 AMR Price Tracker",
                },
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Date & Time: ${currentDateTime}*`,
                },
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: homeText,
                },
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: {
                      type: "plain_text",
                      text: `🔄 Check Current Price`,
                    },
                    action_id: "check_current_price",
                  },
                  {
                    type: "button",
                    text: {
                      type: "plain_text",
                      text: `📅 Check Price Range ${currentDay}`,
                    },
                    action_id: "check_price_range",
                  },
                ],
              },
            ],
          },
        });
        console.log("Home view published for user:", event.user);
      }
    } catch (error) {
      console.error("Error handling event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
    return;
  }

  // Handle interactive actions (e.g., button clicks)
  if (body.payload) {
    try {
      const payload = JSON.parse(body.payload);
      if (payload.type === "block_actions") {
        const action = payload.actions[0];
        res.status(200).json({});
        if (action.action_id === "check_current_price") {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
            (process.env.NODE_ENV === "development" ? "http://localhost:3000" : `${req.headers.host}`);
          const prices = await fetch(`${baseUrl}/api/price`).then(res => res.json());
          console.log("Price data for message:", prices);
          const priceMap = {
            "DIAMOND": "-",
            "GOLD (18K)": "-",
            "GOLD (22K)": "-",
            "ROSEGOLD": "-",
            "SILVER": "-",
          };
          prices.forEach(item => {
            let key;
            switch (item.metaProdTypeName) {
              case "Gold":
                key = `GOLD (${item.purity.split("K")[0]}K)`;
                break;
              case "ROSEGOLD":
                key = "ROSEGOLD";
                break;
              case "Diamond":
                key = "DIAMOND";
                break;
              case "Silver":
                key = "SILVER";
                break;
              default:
                key = item.metaProdTypeName;
            }
            if (key) priceMap[key] = item.rate / item.unit || "-";
          });
          const currentDateTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });

          const messageText = `*Today's Prices (${currentDateTime})*\n` +
                             `--------------------------------------\n` +
                             ` NAME                    PRICE                   \n` +
                             `--------------------------------------\n` +
                             ` DIAMOND            ₹ ${priceMap["DIAMOND"]} /gm\n` +
                             ` GOLD (18K)          ₹ ${priceMap["GOLD (18K)"]} /gm\n` +
                             ` GOLD (22K)          ₹ ${priceMap["GOLD (22K)"]} /gm\n` +
                             ` ROSEGOLD          ₹ ${priceMap["ROSEGOLD"]} /gm\n` +
                             ` SILVER                   ₹ ${priceMap["SILVER"]} /gm\n` +
                             `--------------------------------------`;
          if (messageText.length > 3000) {
            console.warn("Message text exceeds 3000 characters, truncating:", messageText.length);
            // Truncate if necessary (optional, implement if needed)
          }

          await app.client.chat.postMessage({
            channel: payload.user.id,
            text: messageText,
          });
          console.log("Message sent to user:", payload.user.id);
        } else if (action.action_id === "check_price_range") {
          await openDateRangeModal(payload.trigger_id, payload.user.id);
        }
      }

      // Handle modal submission
      if (payload.type === "view_submission" && payload.view.callback_id === "date_range_modal") {
        const fromDate = payload.view.state.values.from_date_block.from_date.selected_date;
        const toDate = payload.view.state.values.to_date_block.to_date.selected_date;

        console.log("Submitting dates:", { fromDate, toDate });

        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
            (process.env.NODE_ENV === "development" ? "http://localhost:3000" : `${req.headers.host}`);
          const response = await fetch(
            `${baseUrl}/api/price?fromDate=${fromDate}T00:00:00Z&toDate=${toDate}T23:59:59Z`
          );
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const priceRangeData = await response.json();
          console.log("Price range data:", priceRangeData);

          const priceMap = priceRangeData.reduce((acc, item) => {
            let key = item.metaProdTypeName === "Gold" ? `GOLD (${item.purity.split("K")[0]}K)` : item.metaProdTypeName;
            if (!acc[key]) acc[key] = [];
            acc[key].push({
              name: key,
              date: item.todayDate,
              price: item.rate / item.unit || "-",
            });
            return acc;
          }, {});

          let allEntries = [];
          Object.values(priceMap).forEach((entries) => allEntries.push(...entries));

          // Limit to 10 entries to avoid exceeding character limit
          const limitedEntries = allEntries.slice(0, 10);
          const maxNameLength = Math.max(...limitedEntries.map(entry => entry.name.length), "Name".length) + 4;
          const maxDateLength = Math.max(...limitedEntries.map(entry => entry.date.length), "Date".length) + 4;
          const maxPriceLength = Math.max(...limitedEntries.map(entry => `₹ ${entry.price}/gm`.length), "Price".length) + 4;

          const tableHeader = `| ${"Name".padEnd(maxNameLength)} | ${"Date".padEnd(maxDateLength)} | ${"Price".padEnd(maxPriceLength)} |`;
          const tableSeparator = `| ${"-".repeat(maxNameLength)} | ${"-".repeat(maxDateLength)} | ${"-".repeat(maxPriceLength)} |`;
          const tableRows = limitedEntries.map(entry =>
            `| ${entry.name.padEnd(maxNameLength)} | ${entry.date.padEnd(maxDateLength)} | ${`₹ ${entry.price}/gm`.padEnd(maxPriceLength)} |`
          ).join("\n");

          const rangeText = `*Price Range (${fromDate} to ${toDate})*\n` +
                           "```" +
                           tableHeader + "\n" +
                           tableSeparator + "\n" +
                           tableRows +
                           "```";
          if (rangeText.length > 3000) {
            console.warn("Range text exceeds 3000 characters, truncating:", rangeText.length);
            // Truncate if necessary (optional implementation)
          }

          const blocks = [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: rangeText,
              },
            },
          ];

          res.status(200).json({ response_action: "clear" });
          await app.client.chat.postMessage({
            channel: payload.user.id,
            text: `Price range for ${fromDate} to ${toDate} (limited to 10 entries)`,
            blocks: blocks,
          });
          console.log("Price range message sent to user:", payload.user.id);
        } catch (error) {
          console.error("Error fetching price range:", error);
          res.status(200).json({
            response_action: "errors",
            errors: {
              from_date_block: "Failed to fetch price range. Please try again.",
              to_date_block: "Failed to fetch price range. Please try again.",
            },
          });
        }
        return;
      }
    } catch (error) {
      console.error("Error handling action or submission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
    return;
  }

  // Default response for unhandled requests
  res.status(200).json({ text: "Event received" });
}