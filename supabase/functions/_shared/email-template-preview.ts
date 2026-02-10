import {
  addedToGroupEmail,
  friendAcceptedEmail,
  friendRequestEmail,
  newExpenseEmail,
  settlementRecordedEmail,
  type NotificationEmailPayload,
} from "./email-templates.ts";

type PreviewItem = {
  slug: string;
  payload: NotificationEmailPayload;
};

function resolveOutputDir(): URL {
  if (!Deno.args[0]) {
    return new URL("../../email/previews/", import.meta.url);
  }

  const rawPath = Deno.args[0].endsWith("/") ? Deno.args[0] : `${Deno.args[0]}/`;
  return new URL(rawPath, `file://${Deno.cwd()}/`);
}

async function writePreview(
  outputDir: URL,
  preview: PreviewItem,
): Promise<void> {
  const htmlPath = new URL(`${preview.slug}.html`, outputDir);
  const textPath = new URL(`${preview.slug}.txt`, outputDir);

  await Deno.writeTextFile(htmlPath, preview.payload.html);
  await Deno.writeTextFile(textPath, preview.payload.text);
}

if (import.meta.main) {
  const previews: PreviewItem[] = [
    {
      slug: "friend-request",
      payload: friendRequestEmail(`Ava & Co <script>alert("x")</script>`),
    },
    {
      slug: "friend-accepted",
      payload: friendAcceptedEmail("Liam O'Connor"),
    },
    {
      slug: "added-to-group",
      payload: addedToGroupEmail("Home Budget 2026"),
    },
    {
      slug: "new-expense",
      payload: newExpenseEmail(
        "Noah",
        `Dinner & drinks at "Nori" <Friday>`,
        "$24.50",
        "City Trip",
      ),
    },
    {
      slug: "settlement-recorded",
      payload: settlementRecordedEmail("Emma", "$30.00", "City Trip"),
    },
  ];

  const outputDir = resolveOutputDir();
  await Deno.mkdir(outputDir, { recursive: true });

  for (const preview of previews) {
    await writePreview(outputDir, preview);
    console.log(`Wrote ${preview.slug}.html and ${preview.slug}.txt`);
  }

  console.log(`Preview output directory: ${outputDir.pathname}`);
}
