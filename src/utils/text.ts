export function reverseText(text: string) {
  return text
    .split("\n")
    .map((line) => line.split(" ").reverse().join(" "))
    .join("\n");
}
