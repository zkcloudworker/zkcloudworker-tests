import { describe, expect, it } from "@jest/globals";
import OpenAI from "openai";
// @ts-ignore-next-line
import env from "../env.json";
const { CHATGPT_TOKEN } = env;
const openai = new OpenAI({ apiKey: CHATGPT_TOKEN });

let symbol = "STEEL";
let name = "Mina Steel";
let description =
  "MinaSteel is a fungible token central to the ZeroCraft gaming ecosystem, secured on the Mina Protocol. It represents a rare, premium-grade alloy essential for crafting high-tier weapons, fortified armor, and advanced tools. By holding or trading MinaSteel, players gain access to superior forging capabilities, enabling them to advance their in-game standing and strength within ZeroCraft's competitive landscape.";
let prompt: string | undefined = undefined;

describe("Stream AI", () => {
  it.skip(`should list all available OpenAI models`, async () => {
    const models = await openai.models.list();
    expect(models).toBeDefined();
    expect(models.data).toBeInstanceOf(Array);
    console.log(
      "Available models:",
      models.data.map((model) => model.id)
    );
  });
  it.skip(`should get the stream answers`, async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: "Hi",
        },
      ],
      stream: true,
    });

    let i = 1;
    let answer = "";
    let fullAnswer = "";
    let fullAnswerPrinted = "";
    const MAX_LENGTH = 500;
    for await (const chunk of completion) {
      if (
        chunk?.choices[0]?.delta?.content !== undefined &&
        chunk.choices[0].delta.content !== "" &&
        chunk.choices[0].delta.content !== null
      ) {
        const msg = chunk.choices[0].delta.content;
        fullAnswer += msg;
        if ((answer + msg).length > MAX_LENGTH && answer !== "") {
          const part = answer.split("\n");
          const printed = part.slice(0, part.length - 1).join("\n");
          const remaining = part.slice(part.length - 1)[0];
          const restored =
            printed === "" ? remaining : [printed, remaining].join("\n");
          //console.log({ answer, printed, remaining, restored, part });
          expect(restored).toBe(answer);
          if (printed.length > MAX_LENGTH) {
            const parts = splitString(printed, MAX_LENGTH);
            let j = 1;
            for (const part of parts) {
              console.log(part);
              fullAnswerPrinted += part + "\n";
            }
          } else if (printed.length > 0) {
            console.log(printed);
            fullAnswerPrinted += printed + "\n";
          }
          answer = remaining + msg;
        } else answer += msg;
      }
    }
    if (answer !== "") {
      console.log(answer);
      fullAnswerPrinted += answer;
    }
    expect(fullAnswer).toBe(fullAnswerPrinted);
    console.log("completion", completion);
  });

  it.skip(`should get the usual answer`, async () => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: "Explain how create a next.js site using Figma",
        },
      ],
    });

    if (completion.choices[0].message.content) {
      const parts = splitMarkdown(completion.choices[0].message.content, 20);
      let i = 1;
      for (const part of parts) {
        console.log(`Part ${i++}`, part);
      }
    } else {
      console.log("No content");
    }
  });

  it(`should get the image prompt from o1-mini`, async () => {
    const completion = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        {
          role: "user",
          content: `You are an great artist and a creator of tokens on Mina protocol that are very popular and engaging. Create a prompt for DALL-E-3 for generation of an image of a token on Mina protocol with symbol ${symbol}, name ${name}, description: ${description}`,
        },
      ],
    });
    prompt = completion.choices[0].message.content ?? "A cute puppy";
    console.log("prompt", prompt);
  });

  it.skip(`should get the image`, async () => {
    const completion = await openai.images.generate({
      model: "dall-e-3",
      prompt:
        prompt ??
        `A beautiful image of a token on Mina protocol with symbol ${symbol}, name ${name}`,
      size: "1024x1024",
    });

    console.log("image", completion.data[0].url);
  });
});

function splitMarkdown(text: string, maxLength: number = 2000): string[] {
  const lines = text.split("\n");
  const parts: string[] = [];
  let currentPart: string[] = [];

  for (const line of lines) {
    if ((currentPart.join("\n") + "\n" + line).length > maxLength) {
      if (currentPart.length > 0) parts.push(currentPart.join("\n"));
      else if (line.length < maxLength) parts.push(line);
      else parts.push(...splitString(line, maxLength));
      currentPart = [];
    }
    currentPart.push(line);
  }

  if (currentPart.length > 0) {
    parts.push(currentPart.join("\n"));
  }

  return parts;
}

function splitString(text: string, maxLength: number = 2000): string[] {
  const lines = text.split(" ");
  const parts: string[] = [];
  let currentPart: string[] = [];

  for (const line of lines) {
    if ((currentPart.join(" ") + " " + line).length > maxLength) {
      parts.push(currentPart.join(" "));
      currentPart = [];
    }
    let newLine = line;
    while (newLine.length > maxLength) {
      currentPart.push(newLine.slice(0, maxLength));
      newLine = newLine.slice(maxLength);
    }
    currentPart.push(newLine);
  }

  if (currentPart.length > 0) {
    parts.push(currentPart.join(" "));
  }

  return parts;
}
