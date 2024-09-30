import axios from "axios";

export async function sendMessageToDiscord(params: {
  message: string;
  botToken: string;
  channelId: string;
}) {
  const { message, botToken, channelId } = params;
  try {
    const response = await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        content: message,
      },
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      console.log("Message sent successfully!");
      console.log("Message:", response.data);
    } else {
      console.log(`Failed to send message: ${response.status}`);
    }
  } catch (error) {
    console.error("Error sending message to Discord:", error);
  }
}

export async function deleteMessageFromDiscord(params: {
  messageId: string;
  botToken: string;
  channelId: string;
}) {
  const { messageId, botToken, channelId } = params;
  try {
    const response = await axios.delete(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      console.log("Message deleted successfully!");
      console.log("Message deleted:", response.data);
    } else {
      console.log(`Failed to delete message: ${response.status}`);
    }
  } catch (error: any) {
    console.error(
      "Error deleting message from Discord:",
      error?.message,
      error?.response?.data
    );
  }
}
