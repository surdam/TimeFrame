import axios from "axios";

const getEmbeddableUrl = async (url, apiKey) => {
  const fileId = url.split("/d/")[1].split("/")[0];
  const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    if (response.data && response.data.webViewLink) {
      const embedUrl = response.data.webViewLink.replace("view", "preview");
      return embedUrl;
    }
  } catch (error) {
    console.error("Failed to get embeddable URL", error);
  }

  return null;
};

export default getEmbeddableUrl;
