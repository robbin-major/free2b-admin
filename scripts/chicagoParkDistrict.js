const axios = require("axios");

const DATA_URL =
  "https://data.cityofchicago.org/resource/tn7v-6rnw.json";

function isFreeEvent(event) {
  const fee = Number(event.fee || 0);
  return fee === 0;
}

function formatEvent(event) {
  return {
    sourceId: event.activity_id,
    title: event.title,
    description: `
Free Chicago Park District event.

${event.description || ""}

${event.date_notes || ""}

Age range: ${event.age_range || "All ages"}

More info:
${event.information_link?.url || ""}
    `.trim(),
    startDate: event.start_date,
    endDate: event.end_date,
    category: event.category || "Parks & Recreation",
    source: "Chicago Park District",
    price: "FREE",
    autoPublish: true,
  };
}

async function getFreeChicagoParkDistrictEvents() {
  try {
    const response = await axios.get(DATA_URL, {
      params: {
        $limit: 20,
        $order: "start_date ASC",
      },
    });

    const freeEvents = response.data
      .filter(isFreeEvent)
      .map(formatEvent);

    console.log("\n========== FREE EVENTS ==========\n");
    console.log(JSON.stringify(freeEvents, null, 2));
    console.log(`\nFound ${freeEvents.length} free events.`);
  } catch (error) {
    console.error("ERROR:", error.message);
  }
}

getFreeChicagoParkDistrictEvents();