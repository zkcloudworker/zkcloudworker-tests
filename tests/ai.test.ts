import { describe, expect, it } from "@jest/globals";
import OpenAI from "openai";
import { CHATGPT_TOKEN } from "../env.json";
const openai = new OpenAI({ apiKey: CHATGPT_TOKEN });

describe("Stream AI", () => {
  it(`should list all available OpenAI models`, async () => {
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
