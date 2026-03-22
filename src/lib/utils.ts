export const parseBio = (fullBio: string) => {
  if (!fullBio) return { cleanBio: "", terms: ["QA Automation", "SDET", "Software Testing"], services: [], chatbotContext: "", chatbotName: "Portfolio AI", chatbotSubtitle: "Expert System v1.1", orderProjects: [], orderExperience: [], orderCerts: [] };

  const termMatch = fullBio.match(/\[terms:(.*?)\]/);
  const svcMatch = fullBio.match(/\[services:(.*?)\]/);
  const chatMatch = fullBio.match(/\[chat:(.*?)\]/);
  const chatNameMatch = fullBio.match(/\[chat_name:(.*?)\]/);
  const chatSubMatch = fullBio.match(/\[chat_sub:(.*?)\]/);
  const cvFileMatch = fullBio.match(/\[cv_file:(.*?)\]/);
  const emailMatch = fullBio.match(/\[email:(.*?)\]/);
  const ordProjMatch = fullBio.match(/\[order_projects:(.*?)\]/);
  const ordExpMatch = fullBio.match(/\[order_experience:(.*?)\]/);
  const ordCertsMatch = fullBio.match(/\[order_certs:(.*?)\]/);

  const cleanBio = fullBio
    .replace(termMatch?.[0] || "", "")
    .replace(chatMatch?.[0] || "", "")
    .replace(chatNameMatch?.[0] || "", "")
    .replace(chatSubMatch?.[0] || "", "")
    .replace(cvFileMatch?.[0] || "", "")
    .replace(emailMatch?.[0] || "", "")
    .replace(ordProjMatch?.[0] || "", "")
    .replace(ordExpMatch?.[0] || "", "")
    .replace(ordCertsMatch?.[0] || "", "")
    .trim();

  return {
    cleanBio,
    terms: termMatch ? termMatch[1].split(",").map(t => t.trim()) : ["QA Automation", "SDET", "Software Testing"],
    chatbotContext: chatMatch ? chatMatch[1].trim() : "",
    chatbotName: chatNameMatch ? chatNameMatch[1].trim() : "Portfolio AI",
    chatbotSubtitle: chatSubMatch ? chatSubMatch[1].trim() : "Expert System v1.1",
    cvFilename: cvFileMatch ? cvFileMatch[1].trim() : "Paras_Oli_CV.pdf",
    email: emailMatch ? emailMatch[1].trim() : "",
    orderProjects: ordProjMatch ? ordProjMatch[1].split(",").filter(Boolean) : [],
    orderExperience: ordExpMatch ? ordExpMatch[1].split(",").filter(Boolean) : [],
    orderCerts: ordCertsMatch ? ordCertsMatch[1].split(",").filter(Boolean) : []
  };
};

export function sortItems<T extends { id: any }>(items: T[], ids: string[]): T[] {
  if (!ids || ids.length === 0) return items;
  return [...items].sort((a, b) => {
    const aIndex = ids.indexOf(a.id.toString());
    const bIndex = ids.indexOf(b.id.toString());
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

export async function downloadFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback: open in new tab if blob fetch fails
    window.open(url, "_blank");
  }
}
